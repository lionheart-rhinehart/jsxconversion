#!/usr/bin/env node
// ============================================================================
//  jsx-to-mp4-conversion.mjs
//
//  Render ALREADY-APPROVED Claude Design export bundles to MP4.
//
//  Built FROM SCRATCH. It does NOT import, execute, or reference anything under
//  the archived v1 renderer (the locked, reference-only archive). The only
//  runtime deps are `puppeteer` (a top-level dep) and `ffmpeg` (already on PATH).
//
//  A Claude Design "Download project as .zip" contains, per campaign, a
//  `project/export/` folder of standalone 1080x1920 looping HTML creatives with
//  the user's edits baked in — Claude Design's own export/index.html says
//  "Render each to MP4." That folder IS the source of truth (never the .dc.html
//  gallery). One zip can hold MULTIPLE campaigns, so we discover them first and
//  let the caller pick by number.
//
//  Two modes:
//    --list                 unzip once, list every campaign found, print WORKDIR
//    --campaign <#> --out X  render that campaign (reuse --workdir from --list)
//
//  Render technique (deterministic, no dropped frames):
//    * CSS/WAAPI animations are stepped by pausing each and setting
//      currentTime per frame (document.getAnimations()).
//    * <video> elements are seeked to (t % duration) per frame, guarded so an
//      already-correct currentTime never awaits a 'seeked' that won't fire.
//    * requestAnimationFrame is wrapped as a PASS-THROUGH counter at load
//      (real rAF still runs — never hangs page load); if a file actually uses
//      rAF we warn loudly so a count-up is never silently shipped frozen.
//    * Frames -> PNG -> ffmpeg H.264 (yuv420p, BT.709, -framerate before -i,
//      even-dimension guard). Each creative's frames are deleted right after
//      its encode so peak disk stays ~one creative.
// ============================================================================

import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const PROJECT_ROOT = process.cwd();

// Supersample factor: capture each frame at SS× the logical size (deviceScaleFactor),
// then ffmpeg downscales to the logical 1080×1920. This is supersampling anti-aliasing —
// it matches the crispness of the in-browser editor (which renders on a high-DPI display)
// instead of the softer edges a 1× screenshot produces. Costs ~2× render time + memory.
const SS = 2;

// ---------------------------------------------------------------------------
//  Arg parsing (tiny, no deps)
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const a = { _: [], list: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--list") a.list = true;
    else if (t === "--help" || t === "-h") a.help = true;
    else if (t === "--workdir") a.workdir = argv[++i];
    else if (t === "--campaign") a.campaign = argv[++i];
    else if (t === "--out") a.out = argv[++i];
    else if (t === "--seconds") a.seconds = Number(argv[++i]);
    else if (t === "--fps") a.fps = Number(argv[++i]);
    else if (t.startsWith("--")) throw new Error(`Unknown flag: ${t}`);
    else a._.push(t);
  }
  return a;
}

const USAGE = `
jsx-to-mp4-conversion — render approved Claude Design export bundles to MP4

  Discover campaigns in a zip/folder:
    node scripts/jsx-to-mp4-conversion.mjs <zip-or-folder> --list

  Render the campaign you picked (reuse the WORKDIR that --list printed):
    node scripts/jsx-to-mp4-conversion.mjs --workdir <path> --campaign <#> --out <folder> [--seconds N] [--fps N]

  One-shot (extract + render in one call):
    node scripts/jsx-to-mp4-conversion.mjs <zip> --campaign <#> --out <folder>

Notes:
  - <#> is the index number from the --list output.
  - A --workdir passed in is caller-owned and never auto-deleted (so you can
    render several campaigns from one extraction). A temp this script extracted
    itself (from a raw zip) is deleted after the render.
`;

// ---------------------------------------------------------------------------
//  Unzip (Windows Expand-Archive via PowerShell; args array, never a shell str)
// ---------------------------------------------------------------------------
function psQuote(p) {
  return `'${String(p).replace(/'/g, "''")}'`; // single-quoted PS literal
}

function extractZip(zipPath, destDir) {
  mkdirSync(destDir, { recursive: true });
  // -LiteralPath: no wildcard expansion. -Force: dest may already exist.
  const script = `Expand-Archive -LiteralPath ${psQuote(zipPath)} -DestinationPath ${psQuote(destDir)} -Force`;
  execFileSync("powershell", ["-NoProfile", "-NonInteractive", "-Command", script], {
    stdio: ["ignore", "ignore", "inherit"],
  });
}

// Short temp root keyed on the zip's absolute path — keeps nested bundle paths
// (e.g. _ds/athletes-acceleration-design-system-019e2d4d-...) under Windows'
// 260-char MAX_PATH, and lets repeated --list on the same zip reuse one extract.
function workdirForZip(zipPath) {
  const key = createHash("sha1").update(resolve(zipPath)).digest("hex").slice(0, 8);
  return join(PROJECT_ROOT, ".tmp", "j2m", key);
}

function isNonEmptyDir(p) {
  try { return statSync(p).isDirectory() && readdirSync(p).length > 0; }
  catch { return false; }
}

// ---------------------------------------------------------------------------
//  Campaign discovery
//   A campaign = a directory literally named `export` that contains index.html
//   AND >=1 sibling *.html creative. (Excludes chats/, screenshots/, galleries.)
// ---------------------------------------------------------------------------
function findExportDirs(root, depth = 0, acc = []) {
  if (depth > 8) return acc;
  let entries;
  try { entries = readdirSync(root, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const full = join(root, e.name);
    if (e.name === "export") {
      const files = safeReaddir(full);
      const htmls = files.filter((f) => /\.html?$/i.test(f));
      if (htmls.some((f) => /^index\.html?$/i.test(f)) &&
          htmls.some((f) => !/^index\.html?$/i.test(f))) {
        acc.push(full);
      }
    }
    findExportDirs(full, depth + 1, acc);
  }
  return acc;
}

function safeReaddir(p) { try { return readdirSync(p); } catch { return []; } }

function titleFromIndex(exportDir) {
  try {
    const html = readFileSync(join(exportDir, "index.html"), "utf8");
    const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (m) return m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  } catch { /* fall through */ }
  return null;
}

function projectNameFor(exportDir) {
  const parent = dirname(exportDir);             // .../project
  const gp = dirname(parent);                     // .../westfield-100-off
  return basename(parent) === "project" ? basename(gp) : basename(parent);
}

function creativesIn(exportDir) {
  return safeReaddir(exportDir)
    .filter((f) => /\.html?$/i.test(f) && !/^index\.html?$/i.test(f))
    .sort();
}

function discoverCampaigns(workdir) {
  return findExportDirs(workdir).map((exportDir) => ({
    kind: "export",
    exportDir,
    name: projectNameFor(exportDir),
    title: titleFromIndex(exportDir),
    creatives: creativesIn(exportDir),
  })).sort((a, b) => a.exportDir.localeCompare(b.exportDir));
}

// ---------------------------------------------------------------------------
//  Review-gallery discovery
//   A "deck" = an .html that builds its creatives live (loads review.js +
//   campaign-b.js into #gallery) rather than shipping loose per-creative HTML.
//   Each deck is one location; the fixed SELECT set lives in its sibling
//   review.js. We render only those preselected creatives.
// ---------------------------------------------------------------------------
function walkFiles(root, fn, depth = 0) {
  if (depth > 8) return;
  let entries;
  try { entries = readdirSync(root, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name.startsWith(".") || e.name === "node_modules") continue;
    const full = join(root, e.name);
    if (e.isDirectory()) walkFiles(full, fn, depth + 1);
    else fn(full);
  }
}

function parseSelectIds(reviewPath) {
  try {
    const js = readFileSync(reviewPath, "utf8");
    const m = js.match(/const\s+SELECT\s*=\s*\[([\s\S]*?)\]/);
    if (!m) return [];
    return Array.from(m[1].matchAll(/["']([^"']+)["']/g)).map((x) => x[1]);
  } catch { return []; }
}

function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

function discoverGalleryDecks(workdir) {
  const decks = [];
  walkFiles(workdir, (file) => {
    if (!/\.html?$/i.test(file)) return;
    let html;
    try { html = readFileSync(file, "utf8"); } catch { return; }
    if (!/review\.js/.test(html) || !/id=["']gallery["']/.test(html)) return;
    const dir = dirname(file);
    const selectIds = parseSelectIds(join(dir, "review.js"));
    if (!selectIds.length) return;
    const city = (html.match(/AA_REVIEW_CITY\s*=\s*["']([^"']+)["']/) || [])[1] || basename(dir);
    decks.push({
      kind: "gallery",
      deckHtml: file,
      name: slug(city),
      city,
      citySlug: slug(city),
      title: `${city} — review set`,
      selectIds,
      creatives: selectIds,
    });
  });
  return decks.sort((a, b) => a.deckHtml.localeCompare(b.deckHtml));
}

// ---------------------------------------------------------------------------
//  rAF pass-through counter — installed BEFORE the page's own scripts run.
//  Real rAF still fires (load never hangs); we only learn whether rAF is used.
// ---------------------------------------------------------------------------
async function installRafCounter(page) {
  await page.evaluateOnNewDocument(() => {
    window.__rafCount = 0;
    const real = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => { window.__rafCount++; return real(cb); };
  });
}

// ---------------------------------------------------------------------------
//  Capture the element tagged [data-j2m-root="1"] on an already-prepared page,
//  frame-step it deterministically, and encode -> MP4. Shared by both the
//  standalone-export path and the review-gallery path.
//    opts.rafBenign — suppress the rAF warning (e.g. gallery count-ups that we
//      intentionally let settle to their final value before capture).
// ---------------------------------------------------------------------------
async function captureAndEncode(page, outPath, cli, opts = {}) {
  const framesDir = outPath.replace(/\.mp4$/i, "") + ".frames";
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  let used = { width: 1080, height: 1920, fps: cli.fps || 30, seconds: 0 };
  try {
    const meta = await page.evaluate(() => {
      const root = document.querySelector('[data-j2m-root="1"]');
      const r = root.getBoundingClientRect();
      const w = Math.round(r.width || root.offsetWidth || 1080);
      const h = Math.round(r.height || root.offsetHeight || 1920);

      const vids = Array.from(root.querySelectorAll("video"));
      // Keep loop=true: if a per-frame seek lands on the clip's exact end, a
      // loop=false element enters the 'ended' state and then SILENTLY IGNORES
      // every backward seek — freezing the footage on its last frame for the
      // rest of the render. loop=true never ends, so wrap-around seeks work.
      vids.forEach((v) => { try { v.pause(); v.loop = true; } catch { /*noop*/ } });
      let maxVideoDur = 0;
      for (const v of vids) { const d = Number(v.duration); if (isFinite(d) && d > maxVideoDur) maxVideoDur = d; }

      // loop length = most common duration among infinite-iteration animations
      const counts = new Map();
      for (const a of document.getAnimations()) {
        const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
        if (!t || t.iterations !== Infinity) continue;
        const d = Number(t.duration);
        if (!d || !isFinite(d)) continue;
        const sec = Math.round((d / 1000) * 100) / 100;
        counts.set(sec, (counts.get(sec) || 0) + 1);
      }
      let loopSec = null, best = -1;
      for (const [sec, n] of counts) if (n > best) { best = n; loopSec = sec; }
      const attr = parseFloat(root.getAttribute("data-loop-seconds"));
      return {
        w, h, loopSec: isFinite(attr) ? attr : loopSec,
        hasVideo: vids.length > 0, maxVideoDur, rafCount: window.__rafCount || 0,
      };
    });

    used.width = meta.w;
    used.height = meta.h;
    used.fps = cli.fps || 30;
    // Prefer an explicit loop; else a looping CSS animation's period; else the
    // footage's own duration (so a clip loops seamlessly); else 8s.
    used.seconds = cli.seconds || meta.loopSec ||
      (meta.hasVideo && meta.maxVideoDur ? Math.min(meta.maxVideoDur, 15) : 8);

    if (meta.rafCount > 0 && !opts.rafBenign) {
      console.error(`  [warn] ${basename(outPath)} uses requestAnimationFrame (${meta.rafCount} calls). ` +
        `CSS/video are rendered deterministically; rAF count-ups/typewriters are best-effort — eyeball this one.`);
    }

    await page.setViewport({ width: used.width, height: used.height, deviceScaleFactor: SS });
    if (meta.hasVideo) {
      await page.evaluate(() => Promise.all(
        Array.from(document.querySelectorAll('[data-j2m-root="1"] video')).map((v) =>
          v.readyState >= 1 ? Promise.resolve()
            : new Promise((r) => v.addEventListener("loadedmetadata", r, { once: true }))
        )
      ));
    }

    const TOTAL = Math.max(1, Math.round(used.fps * used.seconds));
    const root = await page.$('[data-j2m-root="1"]');
    for (let i = 0; i < TOTAL; i++) {
      const tMs = (i / used.fps) * 1000;
      // step CSS/WAAPI animations
      await page.evaluate((t) => {
        for (const a of document.getAnimations()) { try { a.pause(); a.currentTime = t; } catch { /*noop*/ } }
      }, tMs);
      // seek videos, guarded against the no-'seeked' deadlock + NaN duration
      await page.evaluate(async (t) => {
        const vids = Array.from(document.querySelectorAll('[data-j2m-root="1"] video'));
        await Promise.all(vids.map((v) => {
          const d = v.duration;
          if (!isFinite(d) || d <= 0) return Promise.resolve();
          let target = (t / 1000) % d;
          // Never land exactly on the end — a seek to duration trips 'ended'
          // and pins the element. Clamp just shy of the last frame (<=50ms).
          const cap = d - Math.min(0.05, d / 2);
          if (target > cap) target = cap;
          if (Math.abs(v.currentTime - target) < 1e-3) return Promise.resolve();
          return new Promise((res) => {
            let done = false;
            const on = () => { if (!done) { done = true; res(); } };
            v.addEventListener("seeked", on, { once: true });
            setTimeout(on, 2000); // safety: never wedge if 'seeked' is skipped
            v.currentTime = target;
          });
        }));
      }, tMs);
      const buf = await root.screenshot({ type: "png" });
      writeFileSync(join(framesDir, `f_${String(i).padStart(6, "0")}.png`), buf);
    }
  } catch (err) {
    rmSync(framesDir, { recursive: true, force: true });
    throw err;
  }

  encodeFrames(framesDir, used, outPath);
  rmSync(framesDir, { recursive: true, force: true }); // per-creative cleanup
  return used;
}

// ---------------------------------------------------------------------------
//  Render one standalone-export creative HTML -> MP4
// ---------------------------------------------------------------------------
async function renderCreative(browser, htmlPath, outPath, cli) {
  const page = await browser.newPage();
  await installRafCounter(page);
  try {
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: SS });
    // 'load' (not networkidle0): looping autoplay media can keep the network
    // busy forever. We wait for fonts + video metadata explicitly below.
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load", timeout: 120000 });
    await page.evaluate(async () => { try { await document.fonts.ready; } catch { /*noop*/ } });
    await page.evaluate(() => {
      const root =
        document.querySelector(".stage") ||
        document.querySelector("[data-creative-root]") ||
        document.body.firstElementChild ||
        document.documentElement;
      root.setAttribute("data-j2m-root", "1");
      root.style.position = "fixed"; root.style.top = "0"; root.style.left = "0"; root.style.margin = "0";
    });
    const used = await captureAndEncode(page, outPath, cli);
    await page.close();
    return used;
  } catch (err) {
    try { await page.close(); } catch { /*noop*/ }
    throw err;
  }
}

// ---------------------------------------------------------------------------
//  Render a review-gallery deck -> one MP4 per preselected creative.
//
//  The deck (e.g. "…Campaign B - Carmel.html") doesn't ship loose per-creative
//  HTML — it builds each creative live via window.CB.buildStory(c, a). review.js
//  picks a fixed SELECT set and applies the location's call-out text. We reuse
//  that exact pipeline: for each id we rebuild the creative full-size (scale 1),
//  copy the location call-out the page already rendered, let the count-ups
//  settle, then frame-step + encode through the shared capture path.
// ---------------------------------------------------------------------------
async function renderGalleryDeck(browser, deck, outDir, cli, receipt) {
  const page = await browser.newPage();
  await installRafCounter(page);
  try {
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: SS });
    await page.goto(pathToFileURL(deck.deckHtml).href, { waitUntil: "load", timeout: 120000 });
    await page.waitForFunction(
      () => window.CB && window.CB.buildStory && Array.isArray(window.CB.FLAT),
      { timeout: 30000 });
    await page.evaluate(async () => { try { await document.fonts.ready; } catch { /*noop*/ } });

    for (const id of deck.selectIds) {
      const outPath = join(outDir, `${deck.citySlug}-${id}.mp4`);
      process.stdout.write(`  • ${deck.city} ${id} … `);
      try {
        const built = await page.evaluate((cid) => {
          const { buildStory, tickCounters, entranceA, FLAT } = window.CB;
          const it = FLAT.find((f) => f.c.id === cid);
          if (!it) return { ok: false, err: `creative id "${cid}" not found in this deck` };
          const prev = document.getElementById("__j2m_host");
          if (prev) prev.remove();
          const host = document.createElement("div");
          host.id = "__j2m_host";
          host.setAttribute("style",
            "position:fixed;top:0;left:0;margin:0;padding:0;z-index:2147483647;background:#000;");
          const frame = document.createElement("div");
          frame.className = "frame";
          frame.style.setProperty("--scale", "1");
          const story = buildStory(it.c, it.a);
          frame.appendChild(story);
          host.appendChild(frame);
          document.body.appendChild(host);
          // Copy the location-specific call-out review.js already applied to the
          // gallery (buildStory hardcodes the deck's default city otherwise).
          const sample = document.querySelector("#gallery .s-callout");
          const cityText = sample ? sample.textContent
            : (window.AA_REVIEW_CITY ? window.AA_REVIEW_CITY + " Sport Parents" : null);
          if (cityText) story.querySelectorAll(".s-callout").forEach((el) => { el.textContent = cityText; });
          story.setAttribute("data-j2m-root", "1");
          tickCounters(story);
          entranceA(story);
          if (window.AAReel) window.AAReel.scan(story);
          story.querySelectorAll("video").forEach((v) => {
            try { v.loop = true; v.muted = true; v.currentTime = 0; v.play().catch(() => {}); } catch { /*noop*/ }
          });
          return { ok: true };
        }, id);
        if (!built.ok) throw new Error(built.err);

        // Let count-ups (1700ms + 250ms delay) finish + footage buffer before capture.
        await new Promise((r) => setTimeout(r, 2300));
        const used = await captureAndEncode(page, outPath, cli, { rafBenign: true });
        await page.evaluate(() => { const h = document.getElementById("__j2m_host"); if (h) h.remove(); });

        const sizeMB = (statSync(outPath).size / 1e6).toFixed(1);
        console.log(`${used.width}x${used.height} @${used.fps}fps ${used.seconds}s -> ${basename(outPath)} (${sizeMB} MB)`);
        receipt.push({ file: `${deck.city} ${id}`, ok: true, outPath, ...used, sizeMB });
      } catch (err) {
        console.log(`FAILED — ${err.message}`);
        receipt.push({ file: `${deck.city} ${id}`, ok: false, error: err.message });
      }
    }
    await page.close();
  } catch (err) {
    try { await page.close(); } catch { /*noop*/ }
    throw err;
  }
}

function encodeFrames(framesDir, used, outPath) {
  // Frames were captured at SS× (e.g. 2160×3840). Downscale to the logical target
  // (1080×1920) with Lanczos = supersampling anti-aliasing → crisp edges/text.
  const W = Math.round(used.width / 2) * 2;   // even dims (yuv420p requirement)
  const H = Math.round(used.height / 2) * 2;
  const args = [
    "-y", "-hide_banner", "-loglevel", "error",
    "-framerate", String(used.fps),                 // BEFORE -i = input rate
    "-i", join(framesDir, "f_%06d.png"),
    "-vf", `scale=${W}:${H}:flags=lanczos`,          // SS× → target, high-quality downscale
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "16",
    "-tune", "film",                                 // preserve grain/detail, less smoothing
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
    "-movflags", "+faststart",
    outPath,
  ];
  const r = spawnSync("ffmpeg", args, { stdio: ["ignore", "ignore", "inherit"] });
  if (r.status !== 0) throw new Error(`ffmpeg failed (exit ${r.status}) for ${outPath}`);
}

// ---------------------------------------------------------------------------
//  Main
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log(USAGE); return; }

  // Resolve workdir + ownership
  let workdir, ownedByUs = false;
  if (args.workdir) {
    workdir = resolve(args.workdir);
    if (!existsSync(workdir)) throw new Error(`--workdir not found: ${workdir}`);
  } else {
    const input = args._[0];
    if (!input) { console.log(USAGE); throw new Error("Provide a zip/folder, or --workdir <path>."); }
    const abs = resolve(input);
    if (!existsSync(abs)) throw new Error(`Input not found: ${abs}`);
    if (/\.zip$/i.test(abs)) {
      workdir = workdirForZip(abs);
      if (!isNonEmptyDir(workdir)) extractZip(abs, workdir);
      ownedByUs = true; // we extracted it
    } else {
      workdir = abs;     // a folder the caller owns
    }
  }

  const campaigns = [...discoverCampaigns(workdir), ...discoverGalleryDecks(workdir)]
    .map((c, i) => ({ ...c, index: i + 1 }));
  if (campaigns.length === 0) {
    throw new Error(`No campaigns found under ${workdir} (looked for an 'export' folder with index.html + creatives, or a review-gallery deck loading review.js).`);
  }

  // ---- LIST MODE ---------------------------------------------------------
  if (args.list || args.campaign === undefined) {
    console.log(`\nCampaigns found in this export:\n`);
    for (const c of campaigns) {
      const label = c.title ? `${c.name} — ${c.title}` : c.name;
      console.log(`  ${c.index}) ${label}  (${c.creatives.length} creatives)`);
    }
    console.log(`\nWORKDIR: ${workdir}`);
    console.log(`\nNext: node scripts/jsx-to-mp4-conversion.mjs --workdir "${workdir}" --campaign <#> --out "<folder>"\n`);
    return; // list mode never deletes the extraction (so render can reuse it)
  }

  // ---- RENDER MODE -------------------------------------------------------
  const pick = campaigns.find((c) => String(c.index) === String(args.campaign));
  if (!pick) throw new Error(`--campaign ${args.campaign} not in range 1..${campaigns.length}. Run --list.`);

  const outDir = resolve(args.out || join("out", "campaigns", pick.name));
  mkdirSync(outDir, { recursive: true });

  console.log(`\nRendering: ${pick.title || pick.name}  (${pick.creatives.length} creatives) -> ${outDir}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--mute-audio"],
  });

  const receipt = [];
  try {
    if (pick.kind === "gallery") {
      await renderGalleryDeck(browser, pick, outDir, args, receipt);
    } else {
      for (const file of pick.creatives) {
        const htmlPath = join(pick.exportDir, file);
        const outPath = join(outDir, basename(file).replace(/\.html?$/i, "") + ".mp4");
        process.stdout.write(`  • ${file} … `);
        try {
          const used = await renderCreative(browser, htmlPath, outPath, args);
          const sizeMB = (statSync(outPath).size / 1e6).toFixed(1);
          console.log(`${used.width}x${used.height} @${used.fps}fps ${used.seconds}s -> ${basename(outPath)} (${sizeMB} MB)`);
          receipt.push({ file, ok: true, outPath, ...used, sizeMB });
        } catch (err) {
          console.log(`FAILED — ${err.message}`);
          receipt.push({ file, ok: false, error: err.message });
        }
      }
    }
  } finally {
    await browser.close();
  }

  // Cleanup only what WE extracted; never a caller-owned --workdir.
  if (ownedByUs && !args.workdir) rmSync(workdir, { recursive: true, force: true });

  // Receipt
  const ok = receipt.filter((r) => r.ok);
  const failed = receipt.filter((r) => !r.ok);
  console.log(`\n──────────── receipt ────────────`);
  for (const r of ok) console.log(`  ✓ ${r.file} -> ${r.outPath} (${r.width}x${r.height}, ${r.seconds}s, ${r.sizeMB} MB)`);
  for (const r of failed) console.log(`  ✗ ${r.file} — ${r.error}`);
  console.log(`\n  ${ok.length}/${receipt.length} rendered${failed.length ? `, ${failed.length} FAILED` : ""}.`);
  console.log(`  Output folder: ${outDir}\n`);
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => { console.error(`\n[error] ${err.message}\n`); process.exit(1); });

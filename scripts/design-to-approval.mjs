#!/usr/bin/env node
// ============================================================================
//  scripts/design-to-approval.mjs — finished Claude Designs → Kraken approval
//  portal as LIVE, self-contained HTML (no MP4/PNG render of the design itself).
// ============================================================================
//  What it does (see docs/ + .claude/skills/design-to-approval/SKILL.md):
//    1. LOCATE the design folder (matched to the pasted design URL's open_file,
//       or --folder, or an explicit pick) — NEVER auto-pick "newest".
//    2. ENUMERATE designs from the folder's on-disk variation-*.jsx (ground
//       truth: each ends `window.VariationX = VariationX`), enriched by app.jsx.
//    3. MEDIA FILTER + a HARD CONFIRM GATE: print the partition table and do
//       nothing else until --confirm is passed.
//    4. BUILD one self-contained, CSP-safe live-HTML proof per design (React +
//       ReactDOM inlined from node_modules, JSX pre-transpiled with
//       @babel/standalone preset-react, assets recompressed + base64-inlined,
//       a "<Theme> · Design <N>" header band, the scrub bar kept).
//    5. POSTER: puppeteer screenshot of the resolved end-state (deterministic —
//       seeds localStorage[persistKey:t]=0.8*duration, no real-time wait).
//    6. DELIVER (unless --build-only): upload poster+html to Storage, ingest a
//       bridge row (type:"image", content=poster, metadata.live_url=html,
//       render:"live-html" + embed contract), setFolder, dedup/--replace, and
//       write out/approval/<campaign>/manifest.json for the skill's MCP send.
//
//  The script never calls MCP. The skill reads the manifest and calls
//  mcp__third-eye-library__send_to_approval (sendEmail:true on the FIRST row
//  only, so a 30-design batch is ONE client email, not 30).
//
//  Outward + hard-to-reverse once delivering (writes to live Supabase). Run
//  --build-only first to eyeball the proofs; verify against cody-personal.
// ============================================================================

import {
  existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync,
} from "node:fs";
import { resolve, join, basename, dirname, extname } from "node:path";
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import {
  resolveWorkspaceId, uploadToStorage, ingestContent, setFolder,
  resolveFolder, createFolder, findExistingByDesign, softDeleteContent,
} from "./lib/kraken.mjs";

const require = createRequire(import.meta.url);
const Babel = require("@babel/standalone");

const PROJECT_ROOT = resolve(".");
const OUT_DIR = join(PROJECT_ROOT, "out", "approval");

// ── CLI ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const positional = args.filter((a) => !a.startsWith("--"));

const HELP = `Usage:
  node scripts/design-to-approval.mjs --folder "<design folder>" --workspace <loc> --email a@b.com [--confirm]
  node scripts/design-to-approval.mjs --url "<...open_file=Name.dc.html...>" --workspace <loc> --email a@b.com [--confirm]

Steps: enumerate + media-filter + PRINT TABLE (always). With --confirm: build proofs,
posters, and (unless --build-only) upload + ingest + write the send manifest.

Flags:
  --folder <path>     the materialized Claude Design export folder (else inferred from --url, else picked)
  --url <paste>       the "Send to Claude Code" prompt/URL; its open_file=<Name> selects the folder
  --workspace <loc>   Kraken workspace slug/uuid (e.g. cody-personal)
  --email <a,b>       approver email(s), comma-separated (carried into the manifest)
  --campaign <slug>   override campaign slug (default: slugged folder name)
  --theme <name>      override theme label (default: cleaned folder name)
  --media <mode>      with | without | all  (default: infer from --url instruction, else all)
  --only <ids>        comma-separated design ids to include (e.g. A,C)
  --fraction <0..1>   poster seek as a fraction of duration (default 0.8)
  --confirm           REQUIRED to do anything past the partition table (the hard gate)
  --build-only        build proofs + posters locally; no Supabase, no manifest
  --replace           re-deliver REPLACES (ingest new, then soft-delete old)
  --dry-run           alias: build + upload + ingest + manifest, but the skill withholds the email`;

if (flag("help") || flag("h")) { console.log(HELP); process.exit(0); }

const workspace = opt("workspace");
const emails = (opt("email") || "").split(",").map((s) => s.trim()).filter(Boolean);
const confirmed = flag("confirm");
const buildOnly = flag("build-only");
const replace = flag("replace");
const onlyIds = opt("only") ? new Set(opt("only").split(",").map((s) => s.trim().toUpperCase())) : null;
const seekFraction = Math.min(0.98, Math.max(0, parseFloat(opt("fraction") || "0.8")));

const slug = (s) => String(s).replace(/[^\w.-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").toLowerCase();
const log = (...m) => console.log("[d2a]", ...m);
const warn = (...m) => console.warn("[d2a] ⚠", ...m);
const die = (m) => { console.error("[d2a] ERROR:", m); process.exit(1); };

// ── ffmpeg availability (for asset recompress) ────────────────────────────────
function hasFfmpeg() {
  try { return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0; }
  catch { return false; }
}
const FFMPEG = hasFfmpeg();

// ── Step 2a: locate the design folder (never blind-pick "newest") ─────────────
// A "design folder" = contains animations.jsx + at least one variation-*.jsx.
function isDesignFolder(dir) {
  try {
    if (!existsSync(join(dir, "animations.jsx"))) return false;
    return readdirSync(dir).some((f) => /^variation-[a-z0-9]+\.jsx$/i.test(f));
  } catch { return false; }
}
function candidateFolders() {
  return readdirSync(PROJECT_ROOT)
    .map((n) => join(PROJECT_ROOT, n))
    .filter((p) => { try { return statSync(p).isDirectory() && isDesignFolder(p); } catch { return false; } });
}
function openFileFromUrl(url) {
  if (!url) return null;
  const m = String(url).match(/open_file=([^&\s"']+)/);
  if (!m) return null;
  let name = decodeURIComponent(m[1].replace(/\+/g, " "));
  return name.replace(/\.dc\.html?$/i, "").replace(/\.html?$/i, "").trim();
}
function locateFolder() {
  const explicit = opt("folder");
  if (explicit) {
    const p = resolve(explicit);
    if (!isDesignFolder(p)) die(`--folder "${explicit}" is not a design folder (need animations.jsx + variation-*.jsx).`);
    return p;
  }
  const cands = candidateFolders();
  if (!cands.length) die(`No design folders found at repo root. Run the Claude Design "Send to Claude Code" handoff first.`);
  const wanted = openFileFromUrl(opt("url"));
  if (wanted) {
    const w = wanted.toLowerCase();
    const hit = cands.find((p) => basename(p).toLowerCase().includes(w) || w.includes(basename(p).toLowerCase()));
    if (hit) return hit;
    warn(`--url open_file "${wanted}" matched no folder by name.`);
  }
  if (cands.length === 1) return cands[0];
  die(`Multiple design folders found — refusing to auto-pick "newest". Re-run with --folder "<one of>":\n` +
    cands.map((p) => `   - ${basename(p)}`).join("\n"));
}

// ── Step 2b: enumerate designs (on-disk variation files = ground truth) ───────
function readStageMeta(src) {
  const stage = (src.match(/<Stage\b[^>]*>/) || [])[0] || "";
  const dur = (stage.match(/duration=\{\s*([0-9]+(?:\.[0-9]+)?)\s*\}/) || [])[1];
  const pk = (stage.match(/persistKey=["']([^"']+)["']/) || [])[1];
  return { duration: dur ? parseFloat(dur) : 10, persistKey: pk || "animstage" };
}
const LOGO_RE = /logo|wordmark|icon|favicon/i;
function assetRefs(src) {
  const refs = new Set();
  const add = (p) => { if (p) refs.add(p.replace(/^\.\//, "")); };
  // JS string literals + CSS url() pointing at assets/
  for (const m of src.matchAll(/(['"`])(\.?\/?assets\/[^'"`]+?)\1/g)) add(m[2]);
  for (const m of src.matchAll(/url\(\s*['"]?(\.?\/?assets\/[^'")]+?)['"]?\s*\)/g)) add(m[1]);
  return [...refs];
}
function enumerateDesigns(folder, theme) {
  const files = readdirSync(folder).filter((f) => /^variation-[a-z0-9]+\.jsx$/i.test(f)).sort();
  const designs = [];
  for (const file of files) {
    const id = file.replace(/^variation-/i, "").replace(/\.jsx$/i, "").toUpperCase();
    const src = readFileSync(join(folder, file), "utf8");
    const comp = (src.match(/window\.(Variation[A-Za-z0-9]+)\s*=/) || [])[1];
    if (!comp) { warn(`${file}: no "window.VariationX =" export — skipping.`); continue; }
    const refs = assetRefs(src);
    const mediaRefs = refs.filter((r) => !LOGO_RE.test(basename(r)));
    const firstComment = (src.match(/^\s*\/\/\s*(.+)$/m) || [])[1] || "";
    designs.push({
      id, file, comp, src,
      ...readStageMeta(src),
      assetRefs: refs,
      mediaRefs,
      hasMedia: mediaRefs.length > 0,
      label: firstComment.replace(/^variation-[a-z0-9]+\.jsx\s*[—-]\s*/i, "").trim(),
      theme,
      title: `${theme} · Design ${id}`,
    });
  }
  return designs;
}

// ── Step 3: build the self-contained, CSP-safe live-HTML proof ────────────────
function readUmd(pkg, file) {
  const p = join(PROJECT_ROOT, "node_modules", pkg, "umd", file);
  if (!existsSync(p)) die(`missing ${pkg}/umd/${file} — run npm install`);
  return readFileSync(p, "utf8");
}
function assertReact18() {
  const v = require("react/package.json").version;
  const vd = require("react-dom/package.json").version;
  if (!/^18\./.test(v) || !/^18\./.test(vd)) die(`react/react-dom must be 18.x (found ${v}/${vd}); the proof inlines those UMDs.`);
}
function transpile(src, name) {
  if (/^\s*(import|export)\s/m.test(src)) {
    warn(`${name}: contains top-level import/export — stripping (preset-react won't module-wrap it).`);
    src = src.replace(/^\s*export\s+(default\s+)?/gm, "").replace(/^\s*import\b.*$/gm, "");
  }
  return Babel.transform(src, { presets: ["react"], filename: name }).code;
}
function fontsLink(folder) {
  const html = readdirSync(folder).find((f) => /\.html?$/i.test(f) && !/\.dc\.html?$/i.test(f));
  if (!html) return "";
  const src = readFileSync(join(folder, html), "utf8");
  const links = src.match(/<link\b[^>]*fonts\.(?:googleapis|gstatic)[^>]*>/gi) || [];
  const pre = src.match(/<link\b[^>]*rel=["']preconnect["'][^>]*>/gi) || [];
  return [...pre, ...links].join("\n");
}
function mimeFor(ext) {
  const m = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
    ".webp": "image/webp", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".mov": "video/quicktime" };
  return m[ext.toLowerCase()] || "application/octet-stream";
}
// Recompress oversize raster assets to <=1080px via ffmpeg (sharp isn't installed),
// returning the bytes to inline. Logos/small files pass through untouched.
function assetBytes(folder, rel) {
  const abs = join(folder, decodeURIComponent(rel));
  if (!existsSync(abs)) { warn(`asset not found: ${rel}`); return null; }
  const ext = extname(abs).toLowerCase();
  const raw = readFileSync(abs);
  const recompressable = [".png", ".jpg", ".jpeg", ".webp"].includes(ext);
  if (FFMPEG && recompressable && raw.length > 400 * 1024) {
    mkdirSync(join(PROJECT_ROOT, ".tmp"), { recursive: true });
    const tmp = join(PROJECT_ROOT, ".tmp", `d2a-${slug(rel)}${ext}`);
    const r = spawnSync("ffmpeg", ["-y", "-i", abs, "-vf", "scale='min(1080,iw)':-2", tmp], { stdio: "ignore" });
    if (r.status === 0 && existsSync(tmp)) {
      const out = readFileSync(tmp);
      try { rmSync(tmp, { force: true }); } catch {}
      if (out.length && out.length < raw.length) return { ext, buf: out };
    }
  }
  return { ext, buf: raw };
}
function inlineAssets(html, folder, refs) {
  let out = html;
  for (const rel of refs) {
    const got = assetBytes(folder, rel);
    if (!got) continue;
    const dataUri = `data:${mimeFor(got.ext)};base64,${got.buf.toString("base64")}`;
    // replace every quoted/url occurrence of this exact ref (with or without ./ )
    const variants = [rel, rel.replace(/^\.\//, ""), `./${rel}`].filter((v, i, a) => a.indexOf(v) === i);
    for (const v of variants) {
      out = out.split(`'${v}'`).join(`'${dataUri}'`)
               .split(`"${v}"`).join(`"${dataUri}"`)
               .split("`" + v + "`").join("`" + dataUri + "`")
               .split(`url(${v})`).join(`url(${dataUri})`)
               .split(`url('${v}')`).join(`url('${dataUri}')`)
               .split(`url("${v}")`).join(`url("${dataUri}")`);
    }
  }
  return out;
}
function buildProof(folder, design, animsTranspiled) {
  const varTranspiled = transpile(design.src, design.file);
  const react = readUmd("react", "react.production.min.js");
  const reactDom = readUmd("react-dom", "react-dom.production.min.js");
  const fonts = fontsLink(folder);
  const headerTheme = String(design.theme).toUpperCase();
  let html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${design.title}</title>
${fonts}
<style>
  *{box-sizing:border-box}
  html,body{margin:0;height:100%;background:#0a0707;color:#f6f4ef}
  body{display:flex;flex-direction:column;font-family:"JetBrains Mono",ui-monospace,monospace}
  .proof-header{flex:0 0 auto;display:flex;align-items:baseline;gap:14px;
    padding:12px 18px;background:#100b0b;border-bottom:2px solid #c4141d}
  .proof-header .theme{font-family:"Anton","Archivo Black",sans-serif;letter-spacing:.04em;
    font-size:18px;text-transform:uppercase;color:#fff;line-height:1}
  .proof-header .num{font-size:12px;letter-spacing:.18em;color:#c4141d;text-transform:uppercase}
  .proof-frame{flex:1 1 auto;min-height:0;position:relative;background:#0a0707}
  #root{position:absolute;inset:0}
</style>
</head><body>
<div class="proof-header"><span class="theme">${headerTheme}</span><span class="num">Design ${design.id}</span></div>
<div class="proof-frame"><div id="root"></div></div>
<script>${react}</script>
<script>${reactDom}</script>
<script>${animsTranspiled}</script>
<script>${varTranspiled}</script>
<script>
  (function(){
    var C = window.${design.comp};
    if(!C){document.getElementById('root').textContent='proof error: ${design.comp} missing';return;}
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(C));
  })();
</script>
</body></html>`;
  html = inlineAssets(html, folder, design.assetRefs);
  return html;
}

// ── Step 4: deterministic poster via puppeteer (no real-time wait) ────────────
async function capturePosters(designs, fileFor) {
  let puppeteer;
  try { puppeteer = (await import("puppeteer")).default; }
  catch { warn("puppeteer unavailable — skipping posters."); return; }
  // serve out/approval over http so localStorage seeding works (file:// is opaque)
  const root = OUT_DIR;
  const server = createServer((req, res) => {
    try {
      const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "");
      const p = join(root, rel);
      if (!p.startsWith(root) || !existsSync(p)) { res.statusCode = 404; return res.end("nf"); }
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(readFileSync(p));
    } catch { res.statusCode = 500; res.end("err"); }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  try {
    for (const d of designs) {
      const html = fileFor(d).html; // absolute path
      const rel = html.slice(root.length).replace(/\\/g, "/").replace(/^\/+/, "");
      const seekT = (d.duration * seekFraction).toFixed(2);
      const page = await browser.newPage();
      await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 2 });
      await page.evaluateOnNewDocument((key, t) => {
        try { localStorage.setItem(key + ":t", String(t)); } catch {}
      }, d.persistKey, seekT);
      await page.goto(`http://127.0.0.1:${port}/${rel}`, { waitUntil: "load", timeout: 30000 });
      await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
      await new Promise((r) => setTimeout(r, 350)); // a couple RAF frames
      // full viewport (header band + design) so the still itself carries the
      // "<Theme> · Design <N>" grouping — the client sees it during the still-only interim.
      await page.screenshot({ path: fileFor(d).poster });
      await page.close();
      log(`poster ${d.id} @ ${seekT}s → ${basename(fileFor(d).poster)}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

// ── main ──────────────────────────────────────────────────────────────────────
(async () => {
  const folder = locateFolder();
  const folderName = basename(folder);
  const theme = opt("theme") || folderName.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  const campaign = slug(opt("campaign") || folderName);
  log(`folder: ${folderName}`);
  log(`theme : ${theme}   campaign: ${campaign}`);

  let designs = enumerateDesigns(folder, theme);
  if (!designs.length) die(`No usable variation-*.jsx (with window.VariationX) in ${folderName}.`);

  // media filter
  let mediaMode = (opt("media") || "").toLowerCase();
  if (!mediaMode) {
    const u = (opt("url") || "").toLowerCase();
    if (/with(\s+the)?\s+media/.test(u)) mediaMode = "with";
    else if (/without\s+media|no\s+media|graphic/.test(u)) mediaMode = "without";
    else mediaMode = "all";
  }
  if (onlyIds) designs = designs.filter((d) => onlyIds.has(d.id));
  const kept = designs.filter((d) => mediaMode === "all" || (mediaMode === "with" ? d.hasMedia : !d.hasMedia));

  // ── partition table (ALWAYS printed) ──
  console.log("\n  THEME: " + theme + "   |   media filter: " + mediaMode + (onlyIds ? "   |   --only " + [...onlyIds].join(",") : ""));
  console.log("  " + "─".repeat(78));
  console.log("  " + ["#", "title", "media", "matched assets", "keep"].map((h, i) => h.padEnd([4, 30, 6, 24, 4][i])).join(""));
  console.log("  " + "─".repeat(78));
  for (const d of designs) {
    const keep = kept.includes(d);
    const matched = d.mediaRefs.map((r) => basename(r)).join(",").slice(0, 23) || "—";
    console.log("  " + [d.id, d.title.slice(0, 29), d.hasMedia ? "yes" : "no", matched, keep ? "✓" : "·"]
      .map((c, i) => String(c).padEnd([4, 30, 6, 24, 4][i])).join(""));
  }
  console.log("  " + "─".repeat(78));
  console.log(`  ${kept.length} of ${designs.length} design(s) will be processed.\n`);

  if (!kept.length) die("Filter kept 0 designs. Adjust --media / --only.");

  // ── HARD CONFIRM GATE ──
  if (!confirmed) {
    console.log("  HARD CONFIRM GATE: nothing built, uploaded, or sent yet.");
    console.log("  Review the table above, then re-run with --confirm to build + deliver.\n");
    process.exit(0);
  }

  // ── Step 3+4: build proofs + posters ──
  assertReact18();
  const animsTranspiled = transpile(readFileSync(join(folder, "animations.jsx"), "utf8"), "animations.jsx");
  const outDir = join(OUT_DIR, campaign);
  mkdirSync(outDir, { recursive: true });
  const fileFor = (d) => ({
    html: join(outDir, `${slug(theme)}__${d.id}.html`),
    raw: join(outDir, `${slug(theme)}__${d.id}.raw.html`),
    poster: join(outDir, `${slug(theme)}__${d.id}.png`),
  });
  for (const d of kept) {
    const f = fileFor(d);
    const html = buildProof(folder, d, animsTranspiled);
    writeFileSync(f.html, html);
    log(`proof ${d.id} → ${basename(f.html)} (${(html.length / 1024 / 1024).toFixed(1)} MB)`);
  }
  await capturePosters(kept, fileFor);

  if (buildOnly) {
    log(`--build-only: ${kept.length} proof(s) + poster(s) in ${outDir}. No upload.`);
    return;
  }

  // ── Step 4 delivery ──
  if (!workspace) die("--workspace required to deliver (or use --build-only).");
  const wsId = resolveWorkspaceId(workspace);
  if (!wsId) die(`could not resolve workspace "${workspace}".`);
  log(`workspace ${workspace} → ${wsId}`);

  // per-theme folder (graceful)
  let themeFolderId = null;
  try {
    const existing = await resolveFolder(wsId, theme);
    const f = existing || await createFolder(wsId, theme);
    themeFolderId = f && f.id ? f.id : null;
  } catch (e) { warn(`folder "${theme}" unavailable (${e.message}); using folder_id=null (title/metadata still group).`); }

  const stamp = new Date().toISOString();
  const manifest = { campaign, theme, workspace, wsId, emails, createdAt: stamp, rows: [] };

  for (const d of kept) {
    const f = fileFor(d);
    const base = `design-to-approval/${wsId}/${campaign}-${slug(theme)}-${d.id}`;
    const posterUp = existsSync(f.poster)
      ? await uploadToStorage(f.poster, "content-images", `${base}.png`, "image/png")
      : null;
    // content-bundles is the purpose-built public bucket for self-contained HTML/CSS/JS/font
    // bundles; its allowlist includes text/html. Use the bare mime (NO "; charset" — Supabase
    // matches the exact string against the bucket allowlist and rejects the charset suffix).
    const htmlUp = await uploadToStorage(f.html, "content-bundles", `${base}.html`, "text/html");

    const meta = {
      source: "design-to-approval", render: "live-html", live_url: htmlUp.url,
      campaign, theme, designNumber: d.id, variation: d.comp, has_media: d.hasMedia,
      storage_path: htmlUp.storagePath, storage_bucket: "content-bundles", mime_type: "text/html",
      poster_url: posterUp ? posterUp.url : null, uploaded_at: stamp,
    };
    const existing = await findExistingByDesign(wsId, campaign, theme, d.id);
    if (existing && !replace) { log(`skip ${d.id} (exists ${existing.id}; --replace to redo)`); manifest.rows.push({ id: existing.id, ...rowOut(d, htmlUp, posterUp) }); continue; }

    const row = await ingestContent({
      workspace_id: wsId, type: "image", title: d.title,
      content: posterUp ? posterUp.url : htmlUp.url,
      thumbnail_url: posterUp ? posterUp.url : null,
      metadata: meta,
    });
    if (existing && replace) { try { await softDeleteContent(existing.id, stamp); } catch (e) { warn(`replace: soft-delete ${existing.id} failed: ${e.message}`); } }
    if (themeFolderId) { try { await setFolder(row.id, themeFolderId); } catch (e) { warn(`setFolder ${row.id}: ${e.message}`); } }
    log(`ingested ${d.id} → ${row.id}`);
    manifest.rows.push({ id: row.id, ...rowOut(d, htmlUp, posterUp) });
  }

  const manifestPath = join(outDir, "manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  log(`manifest → ${manifestPath}  (${manifest.rows.length} row(s))`);
  log(`NEXT (skill): send_to_approval per row — sendEmail:true on the FIRST only — to ${emails.join(", ") || "(no --email given)"}.`);

  function rowOut(d, htmlUp, posterUp) {
    return { designId: d.id, title: d.title, theme, live_url: htmlUp.url, poster_url: posterUp ? posterUp.url : null, emails };
  }
})().catch((e) => { console.error("[d2a] FAILED:", e && e.stack || e); process.exit(1); });

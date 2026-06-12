// ============================================================================
//  animated-html.mjs — renderer for kind=animated when the input is a
//  standalone CSS-@keyframes-animated HTML file (e.g. a Claude Design
//  `export/` creative: a single 1080x1920 root on a master loop, brand CSS +
//  fonts via its own <link>s, animations applied via inline `animation:` that
//  reference @keyframes, sometimes over a real <video>).
//
//  These aren't JSX, so the JSX font preflight / param extraction don't apply —
//  the HTML carries its own fonts and assets, and Puppeteer resolves them. We
//  reproduce the loop faithfully by stepping the timeline deterministically:
//    - pause every animation and set its currentTime per output frame
//      (Web Animations API — CSS @keyframes animations are seekable), and
//    - seek every <video> to (t mod duration) so the footage advances in sync.
//  Frames are written to disk and handed to the shared encodeFrames() so this
//  path inherits the exact BT.709 color pipeline the rest of the skill uses.
//
//  Size and loop length are auto-detected from the document (root box size;
//  loop = the most common infinite-animation duration), each overridable via a
//  sibling <name>.config.json (WIDTH/HEIGHT/FPS/DURATION_SECONDS).
// ============================================================================
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

export function isAnimatedHtml(inputPath, kind) {
  return kind === "animated" && /\.html?$/i.test(inputPath);
}

export async function renderAnimatedHtml({ inputPath, outPath, params, encodeFrames, PROJECT_ROOT }) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--mute-audio"],
  });

  const framesDir = join(PROJECT_ROOT, "out", ".frames-" + basename(inputPath).replace(/\W+/g, "_"));
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  let used = { ...params };
  try {
    const page = await browser.newPage();
    // initial viewport from params; corrected to the real root size below
    await page.setViewport({ width: Math.round(params.WIDTH), height: Math.round(params.HEIGHT), deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(inputPath).href, { waitUntil: "networkidle0", timeout: 120000 });
    await page.evaluate(async () => { await document.fonts.ready; });

    // Pick the creative root, measure it, pin it to the top-left, pause videos,
    // and report the detected size + the dominant (mode) infinite-loop duration.
    const detected = await page.evaluate(() => {
      const root =
        document.querySelector(".stage") ||
        document.querySelector("[data-creative-root]") ||
        document.body.firstElementChild ||
        document.documentElement;
      root.id = "__rtgt";
      root.style.position = "fixed"; root.style.top = "0"; root.style.left = "0"; root.style.margin = "0";
      const r = root.getBoundingClientRect();
      const w = Math.round(r.width || root.offsetWidth || 1080);
      const h = Math.round(r.height || root.offsetHeight || 1920);

      const vids = Array.from(root.querySelectorAll("video"));
      vids.forEach((v) => { try { v.pause(); v.loop = false; } catch (_) {} });

      // loop length = most common duration among infinite-iteration animations
      const counts = new Map();
      for (const a of document.getAnimations({ subtree: true })) {
        const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : null;
        if (!t || t.iterations !== Infinity) continue;
        const d = Number(a.effect.getComputedTiming().duration);
        if (!d || !isFinite(d)) continue;
        const sec = Math.round((d / 1000) * 100) / 100;
        counts.set(sec, (counts.get(sec) || 0) + 1);
      }
      let loopSec = null, best = -1;
      for (const [sec, n] of counts) if (n > best) { best = n; loopSec = sec; }
      const overrideAttr = parseFloat(root.getAttribute("data-loop-seconds"));
      return { w, h, loopSec: isFinite(overrideAttr) ? overrideAttr : loopSec, hasVideo: vids.length > 0 };
    });

    // Resolve final params: explicit config wins; else detected; else defaults.
    const cfg = params.__config || {};
    used.WIDTH = cfg.WIDTH ?? detected.w ?? params.WIDTH;
    used.HEIGHT = cfg.HEIGHT ?? detected.h ?? params.HEIGHT;
    used.FPS = cfg.FPS ?? params.FPS;
    used.DURATION_SECONDS = cfg.DURATION_SECONDS ?? detected.loopSec ?? params.DURATION_SECONDS;

    await page.setViewport({ width: Math.round(used.WIDTH), height: Math.round(used.HEIGHT), deviceScaleFactor: 1 });

    if (detected.hasVideo) {
      await page.evaluate(() => Promise.all(
        Array.from(document.querySelectorAll("#__rtgt video")).map((v) =>
          v.readyState >= 1 ? Promise.resolve() : new Promise((r) => v.addEventListener("loadedmetadata", r, { once: true }))
        )
      ));
    }

    const TOTAL = Math.max(1, Math.round(used.FPS * used.DURATION_SECONDS));
    console.error(`[render] animated-html: ${used.WIDTH}x${used.HEIGHT} @ ${used.FPS}fps, ${used.DURATION_SECONDS}s (${TOTAL} frames)${detected.hasVideo ? " + video" : ""}`);

    const frameEl = await page.$("#__rtgt");
    for (let i = 0; i < TOTAL; i++) {
      const tMs = (i / used.FPS) * 1000;
      await page.evaluate(async (tMs) => {
        document.getAnimations({ subtree: true }).forEach((a) => { try { a.pause(); a.currentTime = tMs; } catch (_) {} });
        const vids = Array.from(document.querySelectorAll("#__rtgt video"));
        await Promise.all(vids.map((v) => {
          if (!v.duration || !isFinite(v.duration)) return Promise.resolve();
          const target = (tMs / 1000) % v.duration;
          if (Math.abs(v.currentTime - target) < 1e-3) return Promise.resolve();
          return new Promise((res) => { v.addEventListener("seeked", res, { once: true }); v.currentTime = target; });
        }));
      }, tMs);
      const buf = await frameEl.screenshot({ type: "png" });
      writeFileSync(join(framesDir, `f_${String(i).padStart(6, "0")}.png`), buf);
    }
    await page.close();
  } finally {
    await browser.close();
  }

  await encodeFrames(framesDir, used, outPath);
  rmSync(framesDir, { recursive: true, force: true });
  return used;
}

#!/usr/bin/env node
// ============================================================================
//  scripts/westfield-export-render.mjs
//  Render the Westfield Campaign C "export/" standalone creatives to MP4.
//
//  Each export/NN_<label>.html is ONE finished 1080x1920 creative (a single
//  .stage root) with the user's edits baked in — its own CSS @keyframes on a
//  7s first-frame-safe master loop, brand CSS via ../_ds, media via ../assets,
//  some over a real <video>. We reproduce them faithfully by stepping the
//  animation timeline deterministically (Web Animations API; CSS @keyframes are
//  seekable), seeking each <video> to (t mod duration), and piping screenshots
//  of the .stage to ffmpeg -> H.264.
//
//  Usage:
//    node scripts/westfield-export-render.mjs <path/to/export-dir-or-file> \
//         [--only=1B,9A] [--fps=30] [--seconds=7]
//
//  Output: out/campaigns/westfield-100-off/export/<label>.mp4
// ============================================================================
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const argv = process.argv.slice(2);
const pathArg = argv.find((a) => !a.startsWith("--"));
if (!pathArg) {
  console.error('Usage: node scripts/westfield-export-render.mjs <export-dir-or-file> [--only=1B,9A] [--fps=30] [--seconds=7]');
  process.exit(1);
}
const inPath = resolve(pathArg);
if (!existsSync(inPath)) { console.error("Not found: " + inPath); process.exit(1); }

const flag = (k, d) => { const f = argv.find((a) => a.startsWith(`--${k}=`)); return f ? f.split("=").slice(1).join("=") : d; };
const FPS = parseInt(flag("fps", "30"), 10);
const SECONDS = parseFloat(flag("seconds", "7"));
const ONLY = (flag("only", "") || "").split(",").map((s) => s.trim()).filter(Boolean);
const W = 1080, H = 1920;
const TOTAL = Math.round(FPS * SECONDS);

const outDir = resolve(process.cwd(), "out/campaigns/westfield-100-off/export");
mkdirSync(outDir, { recursive: true });

// label from "01_1B.html" -> "1B"  (fallback: basename without ext)
const labelOf = (file) => {
  const b = basename(file).replace(/\.html?$/i, "");
  const m = b.match(/^\d+[_-](.+)$/);
  return (m ? m[1] : b).trim();
};

// resolve the list of creative files
let files;
if (statSync(inPath).isDirectory()) {
  files = readdirSync(inPath)
    .filter((f) => /\.html?$/i.test(f) && f.toLowerCase() !== "index.html")
    .sort()
    .map((f) => join(inPath, f));
} else {
  files = [inPath];
}
let targets = files.map((file) => ({ file, id: labelOf(file) }));
if (ONLY.length) targets = targets.filter((t) => ONLY.includes(t.id));
if (!targets.length) { console.error("No matching creatives. Found: " + files.map(labelOf).join(", ")); process.exit(1); }

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--mute-audio"],
});

console.log(`Rendering ${targets.length} creative(s) @ ${W}x${H} ${FPS}fps ${SECONDS}s: ${targets.map((t) => t.id).join(", ")}`);
try {
  for (const t of targets) {
    const started = Date.now();
    await renderOne(t);
    console.log(`  [${t.id}] done in ${((Date.now() - started) / 1000).toFixed(1)}s  -> out/campaigns/westfield-100-off/export/${t.id}.mp4`);
  }
} finally {
  await browser.close();
}

async function renderOne(t) {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(t.file).href, { waitUntil: "networkidle0", timeout: 120000 });
  await page.evaluate(async () => { await document.fonts.ready; });

  // The creative root is `.stage` (1080x1920). Pin it top-left, pause videos.
  const hasVideo = await page.evaluate(() => {
    const stage = document.querySelector(".stage") || document.body.firstElementChild;
    stage.id = "__rtgt";
    stage.style.position = "fixed"; stage.style.top = "0"; stage.style.left = "0"; stage.style.margin = "0";
    const vids = Array.from(stage.querySelectorAll("video"));
    vids.forEach((v) => { try { v.pause(); v.loop = false; } catch (_) {} });
    return vids.length > 0;
  });

  if (hasVideo) {
    await page.evaluate(() => Promise.all(
      Array.from(document.querySelectorAll("#__rtgt video")).map((v) =>
        v.readyState >= 1 ? Promise.resolve() : new Promise((r) => v.addEventListener("loadedmetadata", r, { once: true }))
      )
    ));
  }

  const outPath = `${outDir}/${t.id}.mp4`.replace(/\\/g, "/");
  const ff = spawn("ffmpeg", [
    "-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-crf", "20",
    outPath,
  ], { stdio: ["pipe", "ignore", "pipe"] });
  let ffErr = "";
  ff.stderr.on("data", (d) => (ffErr += d));

  const frameEl = await page.$("#__rtgt");
  for (let i = 0; i < TOTAL; i++) {
    const tMs = (i / FPS) * 1000;
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
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  }

  ff.stdin.end();
  const code = await new Promise((res) => ff.on("close", res));
  await page.close();
  if (code !== 0) { console.error(`[${t.id}] ffmpeg exit ${code}:\n${ffErr.slice(-1500)}`); throw new Error("ffmpeg failed for " + t.id); }
}

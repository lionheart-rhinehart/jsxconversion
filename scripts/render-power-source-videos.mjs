/* ============================================================
   Render the 6 Power Source Multi-Sport Story videos (JSX/HTML design ->
   MP4), frame-accurately and WITHOUT audio.

   - Serves the design bundle over localhost (so relative clip/font/logo
     paths resolve and <video> seeking is reliable).
   - For each creative: mounts it full-frame (1080x1920), steps the timeline
     in fixed increments, locking WAAPI + counters + typewriters + the
     background clip's currentTime to the same loop time, screenshots each
     frame, then encodes with ffmpeg.
   - Output MP4s carry NO audio track (-an, and frames are rebuilt from PNGs
     so the source clip audio never enters).

   Usage:
     node scripts/render-power-source-videos.mjs            # all 6
     node scripts/render-power-source-videos.mjs 1A 3B      # subset
   ============================================================ */
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BUNDLE = path.join(ROOT, "templates", "_incoming", "power-source-bundle", "project");
const OUT_DIR = path.join(ROOT, "out", "power-source-multisport-videos");

const FPS = 30;
const DURATION_S = 8;           // matches CYC = 8000ms
const FRAMES = FPS * DURATION_S;
const W = 1080, H = 1920;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".mp4": "video/mp4", ".webp": "image/webp", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".woff2": "font/woff2",
  ".json": "application/json", ".svg": "image/svg+xml",
};

function startServer(rootDir) {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent(req.url.split("?")[0]);
        const filePath = path.join(rootDir, urlPath === "/" ? "index.html" : urlPath);
        if (!filePath.startsWith(rootDir)) { res.writeHead(403); return res.end("forbidden"); }
        const data = await fsp.readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const headers = { "Content-Type": MIME[ext] || "application/octet-stream" };
        // Range support so <video> can seek.
        if (ext === ".mp4" && req.headers.range) {
          const m = /bytes=(\d+)-(\d*)/.exec(req.headers.range);
          const start = parseInt(m[1], 10);
          const end = m[2] ? parseInt(m[2], 10) : data.length - 1;
          res.writeHead(206, {
            ...headers,
            "Content-Range": `bytes ${start}-${end}/${data.length}`,
            "Accept-Ranges": "bytes",
            "Content-Length": end - start + 1,
          });
          return res.end(data.subarray(start, end + 1));
        }
        res.writeHead(200, headers);
        res.end(data);
      } catch (e) {
        res.writeHead(404); res.end("not found");
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function ffmpegEncode(framesDir, outFile) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-framerate", String(FPS),
      "-i", path.join(framesDir, "f_%04d.png"),
      "-an",                              // <-- no audio track
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-profile:v", "high",
      "-crf", "18",
      "-movflags", "+faststart",
      outFile,
    ];
    const p = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error("ffmpeg failed:\n" + err.slice(-2000)))));
  });
}

async function main() {
  const want = process.argv.slice(2).map((s) => s.toUpperCase());
  await fsp.mkdir(OUT_DIR, { recursive: true });

  const server = await startServer(BUNDLE);
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}/render-harness.html`;
  console.log(`[serve] ${BUNDLE} on :${port}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--autoplay-policy=no-user-gesture-required",
      "--disable-web-security",
      `--window-size=${W},${H}`,
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
    page.on("pageerror", (e) => console.error("[pageerror]", e.message));
    await page.goto(base, { waitUntil: "networkidle0" });

    const ids = await page.evaluate(() => window.__ids);
    const targets = want.length ? ids.filter((id) => want.includes(id)) : ids;
    if (!targets.length) throw new Error("no matching creative ids; available: " + ids.join(", "));
    console.log(`[render] ${targets.join(", ")}  (${FRAMES} frames each @ ${FPS}fps, ${W}x${H}, muted)`);

    const results = [];
    for (const id of targets) {
      const t0 = Date.now();
      const framesDir = path.join(OUT_DIR, "_frames_" + id);
      await fsp.rm(framesDir, { recursive: true, force: true });
      await fsp.mkdir(framesDir, { recursive: true });

      await page.evaluate((cid) => window.__mount(cid), id);

      for (let i = 0; i < FRAMES; i++) {
        const t = (i / FPS) * 1000; // ms within the 8s loop
        await page.evaluate((ms) => window.__seek(ms), t);
        const buf = await page.screenshot({
          type: "png",
          clip: { x: 0, y: 0, width: W, height: H },
        });
        await fsp.writeFile(path.join(framesDir, `f_${String(i).padStart(4, "0")}.png`), buf);
        if (i % 60 === 0) process.stdout.write(`  ${id}: frame ${i}/${FRAMES}\r`);
      }

      const outFile = path.join(OUT_DIR, `PowerSource-MultiSport-${id}.mp4`);
      await ffmpegEncode(framesDir, outFile);
      await fsp.rm(framesDir, { recursive: true, force: true });
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      const size = (fs.statSync(outFile).size / 1e6).toFixed(2);
      console.log(`  [done] ${id} -> ${path.relative(ROOT, outFile)}  (${size} MB, ${secs}s)`);
      results.push(outFile);
    }
    console.log(`\n[complete] ${results.length} video(s) in ${path.relative(ROOT, OUT_DIR)}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { classify, extractConstants, extractCompositionProps } from "./classify.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "../../../..");

const DEFAULTS = { DURATION_SECONDS: 8, FPS: 30, WIDTH: 1080, HEIGHT: 1920 };

function resolveParams(inputPath) {
  const compositionProps = extractCompositionProps(inputPath);
  const constants = extractConstants(inputPath);
  const configPath = inputPath.replace(/\.(jsx|tsx)$/, ".config.json");
  const config = existsSync(configPath)
    ? JSON.parse(readFileSync(configPath, "utf8"))
    : {};
  return { ...DEFAULTS, ...config, ...constants, ...compositionProps };
}

function ensureOutDir() {
  const out = join(PROJECT_ROOT, "out");
  if (!existsSync(out)) mkdirSync(out, { recursive: true });
  return out;
}

function ensureFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (r.status !== 0) {
    console.error("[render] ffmpeg not found on PATH. Install ffmpeg first.");
    process.exit(2);
  }
}

async function renderRemotion(inputPath, outPath) {
  const args = ["remotion", "render", inputPath, "--output", outPath];
  console.error(`[render] npx ${args.join(" ")}`);
  const r = spawnSync("npx", args, { stdio: "inherit", cwd: PROJECT_ROOT });
  if (r.status !== 0) throw new Error("remotion render failed");
}

async function renderViaPuppeteer(inputPath, params, kind, outPath) {
  const tmp = join(PROJECT_ROOT, ".tmp", basename(inputPath, extname(inputPath)));
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });

  const entry = join(tmp, "entry.jsx");
  const html = join(tmp, "index.html");
  const bundle = join(tmp, "bundle.js");

  const userImport = resolve(inputPath).replace(/\\/g, "/");
  writeFileSync(
    entry,
    `import React from "react";
import { createRoot } from "react-dom/client";
import Component from "${userImport}";
const root = createRoot(document.getElementById("root"));
root.render(React.createElement(Component));
window.__READY__ = true;
`,
  );

  writeFileSync(
    html,
    `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:#000;overflow:hidden;width:${params.WIDTH}px;height:${params.HEIGHT}px;}
#root{width:${params.WIDTH}px;height:${params.HEIGHT}px;}
</style></head><body><div id="root"></div><script src="./bundle.js"></script></body></html>`,
  );

  const esbuild = await import("esbuild");
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    outfile: bundle,
    format: "iife",
    loader: { ".js": "jsx", ".jsx": "jsx", ".tsx": "tsx", ".ts": "tsx" },
    jsx: "automatic",
    platform: "browser",
    define: { "process.env.NODE_ENV": '"production"' },
    absWorkingDir: PROJECT_ROOT,
    logLevel: "warning",
  });

  const puppeteer = (await import("puppeteer")).default;
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      `--window-size=${params.WIDTH},${params.HEIGHT}`,
    ],
    defaultViewport: { width: params.WIDTH, height: params.HEIGHT, deviceScaleFactor: 1 },
  });
  const page = await browser.newPage();
  await page.goto("file://" + html, { waitUntil: "networkidle0" });
  await page.waitForFunction("window.__READY__ === true", { timeout: 10000 });

  if (kind === "static") {
    const stillPath = join(tmp, "frame.png");
    await page.screenshot({ path: stillPath, omitBackground: false });
    await browser.close();
    await encodeStill(stillPath, params, outPath);
    return;
  }

  const totalFrames = Math.round(params.DURATION_SECONDS * params.FPS);
  const framesDir = join(tmp, "frames");
  mkdirSync(framesDir, { recursive: true });

  await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = "*{animation-play-state:paused !important;}";
    document.head.appendChild(style);
  });

  const client = await page.target().createCDPSession();
  await client.send("Animation.enable");

  for (let i = 0; i < totalFrames; i++) {
    const t = i / params.FPS;
    await page.evaluate((time) => {
      document.getAnimations().forEach((a) => {
        try {
          a.currentTime = time * 1000;
        } catch {}
      });
    }, t);
    await page.screenshot({
      path: join(framesDir, `f_${String(i).padStart(6, "0")}.png`),
      omitBackground: false,
    });
    if (i % params.FPS === 0) {
      console.error(`[render] frame ${i}/${totalFrames}`);
    }
  }

  await browser.close();
  await encodeFrames(framesDir, params, outPath);
}

function encodeFrames(framesDir, params, outPath) {
  return new Promise((res, rej) => {
    const args = [
      "-y",
      "-framerate", String(params.FPS),
      "-i", join(framesDir, "f_%06d.png"),
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-preset", "medium",
      "-crf", "20",
      outPath,
    ];
    console.error(`[render] ffmpeg ${args.join(" ")}`);
    const p = spawn("ffmpeg", args, { stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? res() : rej(new Error("ffmpeg failed"))));
  });
}

function encodeStill(stillPath, params, outPath) {
  return new Promise((res, rej) => {
    const args = [
      "-y",
      "-loop", "1",
      "-i", stillPath,
      "-t", String(params.DURATION_SECONDS),
      "-r", String(params.FPS),
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-preset", "medium",
      "-crf", "20",
      outPath,
    ];
    console.error(`[render] ffmpeg ${args.join(" ")}`);
    const p = spawn("ffmpeg", args, { stdio: "inherit" });
    p.on("exit", (code) => (code === 0 ? res() : rej(new Error("ffmpeg failed"))));
  });
}

async function main() {
  const inputArg = process.argv[2];
  if (!inputArg) {
    console.error("Usage: render.mjs <path-to-jsx>");
    process.exit(1);
  }
  const inputPath = resolve(inputArg);
  if (!existsSync(inputPath)) {
    console.error(`[render] input not found: ${inputPath}`);
    process.exit(1);
  }
  ensureFfmpeg();

  const kind = classify(inputPath);
  const params = resolveParams(inputPath);
  const outDir = ensureOutDir();
  const outPath = join(outDir, basename(inputPath, extname(inputPath)) + ".mp4");

  console.error(`[render] input=${inputPath}`);
  console.error(`[render] kind=${kind}`);
  console.error(
    `[render] params: ${params.WIDTH}x${params.HEIGHT} @ ${params.FPS}fps, ${params.DURATION_SECONDS}s`,
  );
  console.error(`[render] output=${outPath}`);

  if (kind === "remotion") {
    await renderRemotion(inputPath, outPath);
  } else {
    await renderViaPuppeteer(inputPath, params, kind, outPath);
  }

  console.log(
    JSON.stringify({
      output: outPath,
      kind,
      width: params.WIDTH,
      height: params.HEIGHT,
      fps: params.FPS,
      duration_seconds: params.DURATION_SECONDS,
    }),
  );
}

main().catch((e) => {
  console.error("[render] error:", e.message);
  process.exit(1);
});

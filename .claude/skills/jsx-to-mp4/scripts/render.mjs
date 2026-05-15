#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  cpSync,
  copyFileSync,
} from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  classify,
  extractConstants,
  extractCompositionProps,
  extractStageProps,
  extractWindowComponentName,
} from "./classify.mjs";
import { ensureFontsForFile } from "./fonts.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = resolve(__dirname, "..");
const PROJECT_ROOT = resolve(SKILL_ROOT, "../../..");
const RUNTIME_JS = join(SKILL_ROOT, "runtime", "runtime.js");

const DEFAULTS = { DURATION_SECONDS: 8, FPS: 30, WIDTH: 1080, HEIGHT: 1920 };

function resolveParams(inputPath, kind) {
  const stageProps = kind === "claude-design" ? extractStageProps(inputPath) : {};
  const compositionProps = extractCompositionProps(inputPath);
  const constants = extractConstants(inputPath);
  const configPath = inputPath.replace(/\.(jsx|tsx)$/, ".config.json");
  const config = existsSync(configPath)
    ? JSON.parse(readFileSync(configPath, "utf8"))
    : {};
  return {
    ...DEFAULTS,
    ...config,
    ...constants,
    ...compositionProps,
    ...stageProps,
  };
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

function copyAssets(inputPath, tmp) {
  const inputDir = dirname(inputPath);
  const assetsSrc = join(inputDir, "assets");
  if (existsSync(assetsSrc)) {
    cpSync(assetsSrc, join(tmp, "assets"), { recursive: true });
  }
}

async function bundleClaudeDesign(inputPath, tmp) {
  // Claude Design files use JSX with `React` as a global, no imports/exports,
  // and register the component via `window.X = X`. Transform with classic
  // JSX -> React.createElement and emit as a plain IIFE script (no module
  // semantics) so top-level declarations live on the same scope as the
  // runtime globals.
  const esbuild = await import("esbuild");
  const userBundle = join(tmp, "user.js");
  await esbuild.build({
    entryPoints: [inputPath],
    bundle: false,
    outfile: userBundle,
    format: "iife",
    loader: { ".jsx": "jsx", ".tsx": "tsx", ".js": "jsx", ".ts": "tsx" },
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    platform: "browser",
    target: ["es2020"],
    logLevel: "warning",
  });
  return userBundle;
}

async function renderClaudeDesign(inputPath, params, outPath, fontsCss) {
  const tmp = join(
    PROJECT_ROOT,
    ".tmp",
    basename(inputPath, extname(inputPath)),
  );
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });

  copyAssets(inputPath, tmp);

  // React UMD lives at node_modules/react/umd/react.production.min.js
  const reactUmd = join(
    PROJECT_ROOT,
    "node_modules/react/umd/react.production.min.js",
  );
  const reactDomUmd = join(
    PROJECT_ROOT,
    "node_modules/react-dom/umd/react-dom.production.min.js",
  );
  if (!existsSync(reactUmd) || !existsSync(reactDomUmd)) {
    throw new Error(
      "React UMD builds missing. Run `npm install` to install react + react-dom.",
    );
  }
  copyFileSync(reactUmd, join(tmp, "react.js"));
  copyFileSync(reactDomUmd, join(tmp, "react-dom.js"));
  copyFileSync(RUNTIME_JS, join(tmp, "runtime.js"));

  // Write the preflighted font stylesheet next to the HTML so the page
  // loads glyphs from disk rather than reaching for a network CDN at
  // render time.
  const fontsCssPath = fontsCss ? join(tmp, "fonts.css") : null;
  if (fontsCssPath) writeFileSync(fontsCssPath, fontsCss);

  await bundleClaudeDesign(inputPath, tmp);

  const componentName = extractWindowComponentName(inputPath);
  if (!componentName) {
    throw new Error(
      "Claude Design file must register the root component via `window.<Name> = <Name>` at the bottom.",
    );
  }
  console.error(`[render] component=${componentName}`);

  const html = join(tmp, "index.html");
  writeFileSync(
    html,
    `<!doctype html>
<html>
<head>
<meta charset="utf-8">
${fontsCssPath ? '<link rel="stylesheet" href="./fonts.css">' : ""}
<style>
  html, body { margin: 0; padding: 0; background: #000; overflow: hidden; }
  body { width: ${params.WIDTH}px; height: ${params.HEIGHT}px; }
  #root { width: ${params.WIDTH}px; height: ${params.HEIGHT}px; }
</style>
</head>
<body>
<div id="root"></div>
<script src="./react.js"></script>
<script src="./react-dom.js"></script>
<script src="./runtime.js"></script>
<script src="./user.js"></script>
<script>
  (function () {
    const Comp = window[${JSON.stringify(componentName)}];
    if (!Comp) {
      document.body.innerHTML = '<pre style="color:#fff">Component ${componentName} not found on window</pre>';
      throw new Error('component not found');
    }
    const rootEl = document.getElementById('root');
    const root = ReactDOM.createRoot(rootEl);
    window.__renderAt = function (t) {
      window.__setTime(t);
      root.render(React.createElement(Comp));
    };
    window.__ready = true;
  })();
</script>
</body>
</html>`,
  );

  const puppeteer = (await import("puppeteer")).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
      "--disable-gpu",
      "--ignore-certificate-errors",
      `--window-size=${params.WIDTH},${params.HEIGHT}`,
    ],
    defaultViewport: {
      width: params.WIDTH,
      height: params.HEIGHT,
      deviceScaleFactor: 1,
    },
  });
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("[page error]", e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warning") {
      console.error(`[page ${msg.type()}]`, msg.text());
    }
  });

  await page.goto(pathToFileURL(html).href, { waitUntil: "load" });
  await page.waitForFunction("window.__ready === true", { timeout: 15000 });

  // Fonts come from the preflighted local stylesheet (./fonts.css). Wait
  // for FontFaceSet to settle so the first frame captures correct glyphs.
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // Render at t=0 once so initial layout (and useLayoutEffect-driven autoscale)
  // settles before the first capture.
  await page.evaluate(() => window.__renderAt(0));
  await new Promise((r) => setTimeout(r, 250));

  const totalFrames = Math.round(params.DURATION_SECONDS * params.FPS);
  const framesDir = join(tmp, "frames");
  mkdirSync(framesDir, { recursive: true });

  for (let i = 0; i < totalFrames; i++) {
    const t = i / params.FPS;
    await page.evaluate((time) => window.__renderAt(time), t);
    await page.screenshot({
      path: join(framesDir, `f_${String(i).padStart(6, "0")}.png`),
      omitBackground: false,
      clip: { x: 0, y: 0, width: params.WIDTH, height: params.HEIGHT },
    });
    if (i % params.FPS === 0 || i === totalFrames - 1) {
      console.error(`[render] frame ${i + 1}/${totalFrames}`);
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
    p.on("exit", (code) =>
      code === 0 ? res() : rej(new Error("ffmpeg failed")),
    );
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
  const params = resolveParams(inputPath, kind);
  const outDir = ensureOutDir();
  const outPath = join(outDir, basename(inputPath, extname(inputPath)) + ".mp4");

  console.error(`[render] input=${inputPath}`);
  console.error(`[render] kind=${kind}`);
  console.error(
    `[render] params: ${params.WIDTH}x${params.HEIGHT} @ ${params.FPS}fps, ${params.DURATION_SECONDS}s`,
  );
  console.error(`[render] output=${outPath}`);

  // Stage 0: font preflight — never substitute a system font for a missing
  // design font. If the JSX references custom fonts that aren't already in
  // fonts/, download them before we touch a renderer.
  const { fonts, css: fontsCss } = await ensureFontsForFile(inputPath);
  if (fonts.length) {
    console.error(`[preflight] fonts ready: ${fonts.join(", ")}`);
  } else {
    console.error("[preflight] no custom fonts referenced");
  }

  if (kind === "remotion") {
    await renderRemotion(inputPath, outPath);
  } else if (kind === "claude-design") {
    await renderClaudeDesign(inputPath, params, outPath, fontsCss);
  } else {
    throw new Error(
      `Renderer for kind=${kind} not implemented yet. Only 'claude-design' and 'remotion' paths are wired up in this version.`,
    );
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
  console.error(e.stack);
  process.exit(1);
});

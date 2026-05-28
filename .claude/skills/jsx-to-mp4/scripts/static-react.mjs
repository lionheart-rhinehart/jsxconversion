// Static React render path.
//
// Plain React component (default export, no Remotion, no Claude Design runtime,
// no animation hints) → puppeteer mount → one screenshot → PNG on disk.
// No ffmpeg, no frame loop. Used for ad statics.
//
// Template author contract:
//   - export default a component that returns the full canvas
//   - do NOT import React (UMD is provided as a global)
//   - WIDTH/HEIGHT come from exported constants or sibling .config.json
//   - photo paths can be absolute file:// URLs or relative to a sibling assets/ dir

import {
  existsSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  cpSync,
  copyFileSync,
} from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { pathToFileURL } from "node:url";

export async function renderStaticReact({
  inputPath,
  params,
  outPath,
  extraCss,
  PROJECT_ROOT,
}) {
  const tmp = join(
    PROJECT_ROOT,
    ".tmp",
    basename(inputPath, extname(inputPath)),
  );
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });

  // Copy sibling assets/ folder if present
  const inputDir = dirname(inputPath);
  const assetsSrc = join(inputDir, "assets");
  if (existsSync(assetsSrc)) {
    cpSync(assetsSrc, join(tmp, "assets"), { recursive: true });
  }

  // React UMD builds
  const reactUmd = join(
    PROJECT_ROOT,
    "node_modules/react/umd/react.production.min.js",
  );
  const reactDomUmd = join(
    PROJECT_ROOT,
    "node_modules/react-dom/umd/react-dom.production.min.js",
  );
  if (!existsSync(reactUmd) || !existsSync(reactDomUmd)) {
    throw new Error("React UMD builds missing. Run `npm install`.");
  }
  copyFileSync(reactUmd, join(tmp, "react.js"));
  copyFileSync(reactDomUmd, join(tmp, "react-dom.js"));

  // Bundle: IIFE with globalName so we can grab the default export at runtime.
  // React is provided as a window global by react.umd.js; the JSX factory
  // calls `React.createElement` which finds it on window.
  const esbuild = await import("esbuild");
  const userBundle = join(tmp, "user.js");
  await esbuild.build({
    entryPoints: [inputPath],
    bundle: true,
    outfile: userBundle,
    format: "iife",
    globalName: "__user",
    loader: { ".jsx": "jsx", ".tsx": "tsx", ".js": "jsx", ".ts": "tsx" },
    jsx: "transform",
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    platform: "browser",
    target: ["es2020"],
    external: ["react", "react-dom"],
    logLevel: "warning",
  });

  const fontsCssPath = extraCss ? join(tmp, "fonts.css") : null;
  if (fontsCssPath) writeFileSync(fontsCssPath, extraCss);

  const html = join(tmp, "index.html");
  writeFileSync(
    html,
    `<!doctype html>
<html><head><meta charset="utf-8">
${fontsCssPath ? '<link rel="stylesheet" href="./fonts.css">' : ""}
<style>
  html, body { margin: 0; padding: 0; background: #000; overflow: hidden; }
  body { width: ${params.WIDTH}px; height: ${params.HEIGHT}px; }
  #root { width: ${params.WIDTH}px; height: ${params.HEIGHT}px; }
</style></head>
<body><div id="root"></div>
<script src="./react.js"></script>
<script src="./react-dom.js"></script>
<script src="./user.js"></script>
<script>
  (function () {
    var Comp = window.__user && window.__user.default;
    if (!Comp) {
      throw new Error('Template must "export default" a component.');
    }
    var root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(Comp));
    window.__ready = true;
  })();
</script></body></html>`,
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
    if (msg.type() === "error") console.error("[page console]", msg.text());
  });

  await page.goto(pathToFileURL(html).href, { waitUntil: "load" });
  await page.waitForFunction("window.__ready === true", { timeout: 15000 });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await new Promise((r) => setTimeout(r, 300));

  await page.screenshot({
    path: outPath,
    type: "png",
    omitBackground: false,
    clip: { x: 0, y: 0, width: params.WIDTH, height: params.HEIGHT },
  });
  await browser.close();
}

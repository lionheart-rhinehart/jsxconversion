#!/usr/bin/env node
// ============================================================================
//  scripts/sample-fill.mjs — match a rect's fill from the SOURCE, never eyeball
// ============================================================================
//  Reads the actual pixel colors of a rectangular region in a source render
//  (the SVG-rendered "original", e.g. out/compare/cluster-N-original.png) and
//  emits a paste-ready CSS `fill` string for that region: a solid hex if the
//  region is flat, or a faithful multi-stop `linear-gradient(...)` if it fades.
//
//  Why this exists: gradient/solid fills on `rect` layers were being eyeballed
//  and coming out wrong (wrong direction, too bright). Sampling the source gets
//  it pixel-accurate in one shot. See templates/.../AUTHORING.md step 2.5.
//
//  Robustness: at each sample line it takes the MEDIAN color across the band,
//  so centered text / a logo sitting on top of the gradient doesn't pollute the
//  reading (glyphs are a minority of pixels per row). It auto-detects the
//  gradient axis (vertical 180deg vs horizontal 90deg) and collapses a flat
//  region to a single solid hex.
//
//  Usage:
//    node scripts/sample-fill.mjs <source.png> --rect x,y,w,h [opts]
//    node scripts/sample-fill.mjs <source.png> --config <cfg.json> --id <rectId> [opts] [--apply]
//
//  Options:
//    --rect x,y,w,h    Region in config space (default frame 1080x1920).
//    --config <path>   Read rect geometry from a cluster-N.config.json instead
//                      of --rect; also the write target for --apply.
//    --id <rectId>     Which fixedDesign[] rect (by id) to read/write.
//    --stops N         Max gradient stops to emit (default 8).
//    --inset N         Px to skip at each edge of the rect (default 4) so
//                      anti-aliased borders / photo bleed don't skew endpoints.
//    --dir auto|v|h    Force gradient axis. Default auto.
//    --frame W,H       Config coordinate space (default 1080,1920).
//    --apply           Write the resolved fill back into --config's rect.
//
//  Powered by puppeteer for canvas pixel reads (no native image deps), matching
//  the rest of the toolkit.
// ============================================================================

import puppeteer from "puppeteer";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// ---- arg parsing -----------------------------------------------------------
const argv = process.argv.slice(2);
const srcPath = argv[0];
function flag(name, def) {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? def : argv[i + 1];
}
const hasFlag = (name) => argv.includes(`--${name}`);

if (!srcPath || srcPath.startsWith("--")) {
  console.error(
    "Usage:\n" +
      "  node scripts/sample-fill.mjs <source.png> --rect x,y,w,h [opts]\n" +
      "  node scripts/sample-fill.mjs <source.png> --config <cfg.json> --id <rectId> [opts] [--apply]",
  );
  process.exit(1);
}

const stops = Math.max(2, parseInt(flag("stops", "8"), 10));
const inset = Math.max(0, parseInt(flag("inset", "4"), 10));
const dirForce = flag("dir", "auto"); // auto | v | h
const SOLID_THRESHOLD = 10; // total RGB end-to-end delta below this ⇒ treat as solid

const frameStr = flag("frame", "1080,1920");
const [frameW, frameH] = frameStr.split(",").map((n) => parseFloat(n));

// ---- resolve rect geometry (from --rect or --config + --id) ----------------
const configPath = flag("config", null);
const rectId = flag("id", null);
let rect; // [x, y, w, h] in config space
let configObj = null;
let rectRef = null;

if (configPath) {
  configObj = JSON.parse(readFileSync(resolve(configPath), "utf8"));
  if (!rectId) {
    console.error("--config requires --id <rectId>");
    process.exit(1);
  }
  rectRef = (configObj.fixedDesign || []).find((it) => it.id === rectId);
  if (!rectRef) {
    console.error(`No fixedDesign item with id "${rectId}" in ${configPath}`);
    process.exit(1);
  }
  rect = [rectRef.x, rectRef.y, rectRef.width, rectRef.height];
} else {
  const rectStr = flag("rect", null);
  if (!rectStr) {
    console.error("Provide either --rect x,y,w,h or --config <cfg> --id <rectId>");
    process.exit(1);
  }
  rect = rectStr.split(",").map((n) => parseFloat(n));
  if (rect.length !== 4 || rect.some((n) => isNaN(n))) {
    console.error("--rect must be x,y,w,h (four numbers)");
    process.exit(1);
  }
}

// ---- sample the region ------------------------------------------------------
const b64 = readFileSync(resolve(srcPath)).toString("base64");
const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
let sampled;
try {
  const page = await browser.newPage();
  const dataUrl = `data:image/png;base64,${b64}`;
  sampled = await page.evaluate(
    async ({ dataUrl, rect, stops, inset, frame }) => {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = dataUrl;
      });
      const W = img.naturalWidth,
        H = img.naturalHeight;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, W, H).data;

      // Scale config-space rect to source pixels
      const sx = W / frame[0],
        sy = H / frame[1];
      let x0 = Math.round(rect[0] * sx) + inset,
        y0 = Math.round(rect[1] * sy) + inset,
        x1 = Math.round((rect[0] + rect[2]) * sx) - inset,
        y1 = Math.round((rect[1] + rect[3]) * sy) - inset;
      x0 = Math.max(0, Math.min(W - 1, x0));
      x1 = Math.max(0, Math.min(W - 1, x1));
      y0 = Math.max(0, Math.min(H - 1, y0));
      y1 = Math.max(0, Math.min(H - 1, y1));
      if (x1 < x0) [x0, x1] = [x1, x0];
      if (y1 < y0) [y0, y1] = [y1, y0];

      const median = (arr) => {
        arr.sort((a, b) => a - b);
        return arr[arr.length >> 1];
      };
      // Median color along a horizontal band (fixed y, sweep x) — robust to text.
      const rowMedian = (y) => {
        const R = [], G = [], B = [];
        const step = Math.max(1, Math.floor((x1 - x0) / 96));
        for (let x = x0; x <= x1; x += step) {
          const i = (y * W + x) * 4;
          R.push(d[i]); G.push(d[i + 1]); B.push(d[i + 2]);
        }
        return [median(R), median(G), median(B)];
      };
      // Median color along a vertical band (fixed x, sweep y).
      const colMedian = (x) => {
        const R = [], G = [], B = [];
        const step = Math.max(1, Math.floor((y1 - y0) / 96));
        for (let y = y0; y <= y1; y += step) {
          const i = (y * W + x) * 4;
          R.push(d[i]); G.push(d[i + 1]); B.push(d[i + 2]);
        }
        return [median(R), median(G), median(B)];
      };

      const vert = [], horiz = [];
      for (let s = 0; s < stops; s++) {
        const f = s / (stops - 1);
        vert.push({ f, rgb: rowMedian(Math.round(y0 + (y1 - y0) * f)) });
        horiz.push({ f, rgb: colMedian(Math.round(x0 + (x1 - x0) * f)) });
      }
      const delta = (a, b) =>
        Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
      return {
        W, H,
        bbox: [x0, y0, x1, y1],
        vert,
        horiz,
        vDelta: delta(vert[0].rgb, vert[vert.length - 1].rgb),
        hDelta: delta(horiz[0].rgb, horiz[horiz.length - 1].rgb),
      };
    },
    { dataUrl, rect, stops, inset, frame: [frameW, frameH] },
  );
} finally {
  await browser.close();
}

// ---- decide axis / solid, build the fill string ----------------------------
const toHex = (rgb) =>
  "#" + rgb.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");

let axis;
if (dirForce === "v") axis = "v";
else if (dirForce === "h") axis = "h";
else if (Math.max(sampled.vDelta, sampled.hDelta) < SOLID_THRESHOLD) axis = "solid";
else axis = sampled.vDelta >= sampled.hDelta ? "v" : "h";

let fill;
if (axis === "solid") {
  // Flat region — use the median of the center sample line.
  const mid = sampled.vert[sampled.vert.length >> 1].rgb;
  fill = toHex(mid);
} else {
  const series = (axis === "v" ? sampled.vert : sampled.horiz).map((s) => ({
    f: s.f,
    rgb: s.rgb.slice(),
  }));
  const angle = axis === "v" ? 180 : 90;

  // Repair endpoint outliers: a neighboring opaque layer (e.g. the background
  // photo) can bleed into the first/last sample band when the rect's declared
  // edge sits slightly past where the fill actually starts. Detect an endpoint
  // whose step to its neighbor dwarfs the typical inter-stop step, and
  // extrapolate it back onto the gradient trend instead of trusting the bleed.
  const chDelta = (a, b) =>
    Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  if (series.length >= 3) {
    const deltas = [];
    for (let i = 1; i < series.length; i++) deltas.push(chDelta(series[i - 1].rgb, series[i].rgb));
    const sorted = [...deltas].sort((a, b) => a - b);
    const med = sorted[sorted.length >> 1] || 0;
    const extrap = (near, far) =>
      near.map((v, k) => Math.max(0, Math.min(255, Math.round(v - (far[k] - v)))));
    const n = series.length;
    if (deltas[0] > 3 * med && deltas[0] > 30) {
      series[0].rgb = extrap(series[1].rgb, series[2].rgb);
      console.error(`note: repaired head stop (neighbor-layer bleed at rect top/left)`);
    }
    if (deltas[n - 2] > 3 * med && deltas[n - 2] > 30) {
      series[n - 1].rgb = extrap(series[n - 2].rgb, series[n - 3].rgb);
      console.error(`note: repaired tail stop (neighbor-layer bleed at rect bottom/right)`);
    }
  }

  // Build stops, dropping interior stops whose color duplicates both neighbors.
  const raw = series.map((s) => ({ pct: Math.round(s.f * 100), hex: toHex(s.rgb) }));
  const kept = raw.filter((s, i) => {
    if (i === 0 || i === raw.length - 1) return true;
    return !(raw[i].hex === raw[i - 1].hex && raw[i].hex === raw[i + 1].hex);
  });
  fill = `linear-gradient(${angle}deg, ${kept.map((s) => `${s.hex} ${s.pct}%`).join(", ")})`;
}

// ---- report -----------------------------------------------------------------
console.log(`source:   ${srcPath}  (${sampled.W}x${sampled.H})`);
console.log(`rect:     x=${rect[0]} y=${rect[1]} w=${rect[2]} h=${rect[3]}  (frame ${frameW}x${frameH})`);
console.log(`sampled:  bbox=[${sampled.bbox.join(",")}]  inset=${inset}`);
console.log(`variation: vertical Δ=${sampled.vDelta}  horizontal Δ=${sampled.hDelta}  ⇒ ${axis === "solid" ? "SOLID" : axis === "v" ? "VERTICAL gradient (180deg)" : "HORIZONTAL gradient (90deg)"}`);
console.log("");
console.log(`  "fill": ${JSON.stringify(fill)}`);
console.log("");

// ---- optional: write back into the config -----------------------------------
if (hasFlag("apply")) {
  if (!configObj || !rectRef) {
    console.error("--apply requires --config <cfg> --id <rectId>");
    process.exit(1);
  }
  rectRef.fill = fill;
  writeFileSync(resolve(configPath), JSON.stringify(configObj, null, 2) + "\n");
  console.log(`✓ applied fill to "${rectId}" in ${configPath}`);
}

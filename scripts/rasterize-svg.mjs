#!/usr/bin/env node
// ============================================================================
//  scripts/rasterize-svg.mjs — Canva SVG → original-reference PNG
// ============================================================================
//  Loads a Canva SVG (with embedded base64 images) via puppeteer and snaps
//  a 1080×1920 PNG. Used to produce the "original" half of the compare view
//  when we don't have a PNG export from Canva on hand.
//
//  Usage:
//    node scripts/rasterize-svg.mjs cluster-10
//    node scripts/rasterize-svg.mjs cluster-10 --out custom/path.png
//
//  Default output: out/compare/cluster-N-original.png
// ============================================================================

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";
import { resolveClusterSvgPath } from "./lib/svg-parser.mjs";

const PROJECT_ROOT = resolve(".");
const WIDTH = 1080;
const HEIGHT = 1920;

const args = process.argv.slice(2);
const clusterId = args.find((a) => !a.startsWith("--"));
const outIdx = args.indexOf("--out");
const outOverride = outIdx >= 0 ? args[outIdx + 1] : null;

if (!clusterId) {
  console.error("Usage: node scripts/rasterize-svg.mjs <cluster-id> [--out path.png]");
  process.exit(1);
}

const normalizedId = clusterId.startsWith("cluster-") ? clusterId : `cluster-${clusterId}`;
const svgPath = resolveClusterSvgPath(PROJECT_ROOT, normalizedId);
const outPath = outOverride
  ? resolve(outOverride)
  : join(PROJECT_ROOT, "out/compare", `${normalizedId}-original.png`);

console.log(`Source SVG: ${svgPath}`);
console.log(`Output PNG: ${outPath}`);

if (!existsSync(dirname(outPath))) {
  mkdirSync(dirname(outPath), { recursive: true });
}

// Read the SVG; extract its viewBox so we can scale it correctly to 1080×1920
const svgText = readFileSync(svgPath, "utf8");
const viewBoxMatch = svgText.match(/viewBox="([^"]+)"/);
const viewBox = viewBoxMatch ? viewBoxMatch[1].split(/\s+/).map(Number) : [0, 0, 810, 1440];
const [vbX, vbY, vbW, vbH] = viewBox;
console.log(`SVG viewBox: ${vbW}×${vbH} (scaling to ${WIDTH}×${HEIGHT})`);

// Build an HTML wrapper that scales the SVG to the target frame using CSS.
// Loading via data: URL keeps it self-contained, but a 22MB inline string
// is tough — write to a temp HTML file instead.
const html = `<!doctype html><html><head><style>
  html, body { margin: 0; padding: 0; background: transparent; }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  svg { width: ${WIDTH}px; height: ${HEIGHT}px; display: block; }
</style></head><body>${svgText}</body></html>`;

const tmpDir = join(PROJECT_ROOT, ".tmp");
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });
const tmpHtml = join(tmpDir, `rasterize-${normalizedId}.html`);
writeFileSync(tmpHtml, html);

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(tmpHtml).href, { waitUntil: "networkidle0", timeout: 60000 });
  // Give embedded images a moment to decode
  await new Promise((r) => setTimeout(r, 500));
  const buf = await page.screenshot({ type: "png", omitBackground: false, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  writeFileSync(outPath, buf);
  console.log(`✓ Wrote ${outPath} (${Math.round(buf.length / 1024)}kb)`);
} finally {
  await browser.close();
}

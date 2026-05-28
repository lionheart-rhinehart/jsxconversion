#!/usr/bin/env node
// Inspect every <image> element in a Canva-exported SVG body, computing
// rendered pixel positions/sizes from the nearest enclosing transform matrix.
//
// Usage: node scripts/inspect-svg-images.mjs <path-to-svg>
//
// Canva nests <image> inside <g transform="matrix(a, b, c, d, e, f)"> where
//   scaleX = a, scaleY = d, translateX = e, translateY = f
// Image rendered size = srcWidth * scaleX, srcHeight * scaleY
// Image rendered pos  = (e, f) in SVG units. Multiply by 1080/810 = 1.333
// to convert SVG viewBox units to pixel units.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const svgPath = process.argv[2];
if (!svgPath) {
  console.error("Usage: node inspect-svg-images.mjs <path-to-svg>");
  process.exit(1);
}

const svg = readFileSync(resolve(svgPath), "utf8");
const defsEnd = svg.indexOf("</defs>");
const body = svg.slice(defsEnd);

const imageRe = /<image\b([^>]*?)\/>/g;
const matrixRe = /matrix\(([-0-9.,\s]+)\)/g;

// SVG viewBox 810x1440 → display 1080x1920 → scale 1.333
const SCALE_TO_PX = 1080 / 810;
const px = (n) => Math.round(n * SCALE_TO_PX);

console.log(`Inspecting body images in: ${svgPath}`);
console.log(`(SVG-to-px scale: ${SCALE_TO_PX.toFixed(3)})`);
console.log();

let idx = 0;
let m;
while ((m = imageRe.exec(body)) !== null) {
  const attrs = m[1];
  const srcW = parseFloat((attrs.match(/\bwidth="([0-9.]+)"/) || [])[1] || 0);
  const srcH = parseFloat((attrs.match(/\bheight="([0-9.]+)"/) || [])[1] || 0);

  // Find the LAST matrix() in body before this image — typically the immediate
  // parent <g transform>. Not perfect (nested transforms get only the innermost)
  // but for Canva's flat single-wrap structure it gives correct positioning.
  const before = body.slice(0, m.index);
  const allMatrices = [...before.matchAll(matrixRe)];
  if (allMatrices.length === 0) {
    console.log(`#${idx}  srcDim=${srcW}x${srcH}  (no enclosing transform)`);
    idx++;
    continue;
  }
  const lastMatrix = allMatrices[allMatrices.length - 1];
  const parts = lastMatrix[1].split(/[,\s]+/).map(parseFloat).filter((n) => !isNaN(n));
  const [a, b, c, d, e, f] = parts;
  const renderedWsvg = srcW * a;
  const renderedHsvg = srcH * d;
  const renderedXsvg = e;
  const renderedYsvg = f;

  console.log(
    `#${idx}  src=${srcW}x${srcH}  ` +
      `→ svgUnits=${Math.round(renderedWsvg)}x${Math.round(renderedHsvg)} @(${Math.round(renderedXsvg)},${Math.round(renderedYsvg)})  ` +
      `→ px=${px(renderedWsvg)}x${px(renderedHsvg)} @(${px(renderedXsvg)},${px(renderedYsvg)})`,
  );
  idx++;
}

#!/usr/bin/env node
// Inspect every <image> element in a Canva-exported SVG body, computing
// rendered pixel positions/sizes from the nearest enclosing transform matrix.
//
// Usage: node scripts/inspect-svg-images.mjs <path-to-svg>
//
// Powered by scripts/lib/svg-parser.mjs.

import { parseSvg, extractBodyImages, VIEWBOX_TO_PX } from "./lib/svg-parser.mjs";

const svgPath = process.argv[2];
if (!svgPath) {
  console.error("Usage: node inspect-svg-images.mjs <path-to-svg>");
  process.exit(1);
}

const { body } = parseSvg(svgPath);
const images = extractBodyImages(body);

console.log(`Inspecting body images in: ${svgPath}`);
console.log(`(SVG-to-px scale: ${VIEWBOX_TO_PX.toFixed(3)})\n`);

for (const img of images) {
  const t = img.transform;
  const svgPart = t
    ? `svgUnits=${Math.round(img.srcWidth * t[0])}x${Math.round(img.srcHeight * t[3])} @(${Math.round(t[4])},${Math.round(t[5])})`
    : "(no transform)";
  const maskNote = img.maskId ? `  mask=${img.maskId}` : "";
  console.log(
    `#${img.index}  src=${img.srcWidth}x${img.srcHeight}  → ${svgPart}  ` +
      `→ px=${img.renderedW}x${img.renderedH} @(${img.renderedX},${img.renderedY})${maskNote}`,
  );
}

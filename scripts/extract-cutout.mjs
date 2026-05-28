#!/usr/bin/env node
// Extract a transparent-background PNG cutout from a Canva-exported SVG by
// combining the photo image with its SVG mask.
//
// Usage:
//   node scripts/extract-cutout.mjs <svg-path> <photo-image-index> <output-path>
//
// Powered by scripts/lib/svg-parser.mjs.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseSvg,
  extractBodyImages,
  extractMaskById,
  compositeImageWithMask,
} from "./lib/svg-parser.mjs";

const [svgPath, indexStr, outputPath] = process.argv.slice(2);
if (!svgPath || !indexStr || !outputPath) {
  console.error("Usage: node scripts/extract-cutout.mjs <svg-path> <photo-image-index> <output-path>");
  process.exit(1);
}
const photoIdx = parseInt(indexStr, 10);

const { defs, body } = parseSvg(svgPath);
const images = extractBodyImages(body);

if (photoIdx >= images.length) {
  console.error(`Photo index ${photoIdx} out of range (only ${images.length} body images)`);
  process.exit(1);
}
const photo = images[photoIdx];
if (!photo.maskId) {
  console.error(`Image #${photoIdx} has no mask reference — nothing to composite. Use a different image index.`);
  process.exit(1);
}
console.log(`Mask for img-${photoIdx}: #${photo.maskId}`);
console.log(`Photo image: ~${Math.round(photo.base64.length * 0.75 / 1024)}kb`);

const mask = extractMaskById(defs, photo.maskId);
if (!mask) {
  console.error(`Mask definition #${photo.maskId} not found in defs`);
  process.exit(1);
}
console.log(`Mask image: ~${Math.round(mask.base64.length * 0.75 / 1024)}kb`);

const pngBuf = await compositeImageWithMask(
  { ext: photo.ext, base64: photo.base64 },
  mask,
);
writeFileSync(resolve(outputPath), pngBuf);
console.log(`Wrote ${outputPath} (${Math.round(pngBuf.length / 1024)}kb RGBA)`);

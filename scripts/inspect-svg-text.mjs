#!/usr/bin/env node
// Inspect text regions in a Canva-exported SVG by extracting path bounding
// boxes and clustering nearby paths into "text lines."
//
// Canva outlines all text into <path> elements (no <text> tags survive
// the export). To reverse-engineer position and font size, we:
//   1. Walk every <path d="..."> in the body
//   2. Parse the M (moveto), L (lineto), C/Q (curves) coordinates
//   3. Compute the bounding box of each path
//   4. Cluster paths whose Y centers are within a threshold (likely same line)
//   5. Report each cluster's position, size, and approximate font size
//
// Font size estimate: cap-height ≈ 0.7 × font-size. So font-size ≈ height / 0.7.
//
// Usage:
//   node scripts/inspect-svg-text.mjs <path-to-svg>
//
// Output is in PIXEL coordinates (1080×1920 space), not SVG viewBox units.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const svgPath = process.argv[2];
if (!svgPath) {
  console.error("Usage: node inspect-svg-text.mjs <path-to-svg>");
  process.exit(1);
}

const svg = readFileSync(resolve(svgPath), "utf8");
const defsEnd = svg.indexOf("</defs>");
const body = svg.slice(defsEnd);

// SVG viewBox → pixel scale
const SCALE = 1080 / 810;
const px = (n) => Math.round(n * SCALE);

// Extract all path d attributes from the body, plus their enclosing transform
const pathRe = /<path\b([^>]*?)\/>/g;
const matrixRe = /matrix\(([-0-9.,\s]+)\)/g;

// Parse path d attribute into a list of (x, y) coordinate points by
// extracting numbers from M, L, C, Q, A, T, S, H, V commands.
function pathBBox(d, transform) {
  // Extract all numbers (with optional sign + decimal)
  const nums = (d.match(/-?\d+\.?\d*/g) || []).map(Number);
  if (nums.length < 2) return null;

  // Treat pairs as (x, y). Not perfect for H/V which take single numbers,
  // but good enough for bbox estimation since they fall in the same range.
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < nums.length - 1; i += 2) {
    const x = nums[i];
    const y = nums[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  // Apply transform if present (translate component only — Canva text is
  // usually placed with translate, not scale, so this approximation works)
  if (transform) {
    const [a, b, c, d2, e, f] = transform;
    // For matrix(a, b, c, d, e, f) without scale rotation, x' = ax + cy + e
    // Simplified: assume scale=1 and just add translate
    minX = minX * a + e;
    maxX = maxX * a + e;
    minY = minY * d2 + f;
    maxY = maxY * d2 + f;
  }

  return {
    x: minX, y: minY, width: maxX - minX, height: maxY - minY,
    cx: (minX + maxX) / 2, cy: (minY + maxY) / 2,
  };
}

// Find all paths with bounding boxes
const paths = [];
let m;
while ((m = pathRe.exec(body)) !== null) {
  const attrs = m[0];
  const d = (attrs.match(/\bd="([^"]+)"/) || [])[1];
  if (!d) continue;

  // Find the most recent matrix transform before this path
  const before = body.slice(0, m.index);
  const allMatrices = [...before.matchAll(matrixRe)];
  let transform = null;
  if (allMatrices.length > 0) {
    const lastMatrix = allMatrices[allMatrices.length - 1];
    const parts = lastMatrix[1].split(/[,\s]+/).map(parseFloat).filter((n) => !isNaN(n));
    if (parts.length >= 6) transform = parts;
  }

  const bbox = pathBBox(d, transform);
  if (!bbox) continue;
  // Skip degenerate paths (single points)
  if (bbox.width < 0.5 || bbox.height < 0.5) continue;
  paths.push(bbox);
}

// Cluster paths by vertical center (paths on the same text line share Y)
const Y_THRESHOLD = 8; // SVG units — paths within ±8 vertically are "same line"
paths.sort((a, b) => a.cy - b.cy);
const clusters = [];
for (const p of paths) {
  const last = clusters[clusters.length - 1];
  if (last && Math.abs(p.cy - last.refCy) < Y_THRESHOLD) {
    // Merge into the cluster
    last.x = Math.min(last.x, p.x);
    last.y = Math.min(last.y, p.y);
    last.right = Math.max(last.right, p.x + p.width);
    last.bottom = Math.max(last.bottom, p.y + p.height);
    last.count++;
  } else {
    clusters.push({
      x: p.x, y: p.y, right: p.x + p.width, bottom: p.y + p.height,
      refCy: p.cy, count: 1,
    });
  }
}

// Filter and report — only clusters with multiple paths (likely text, not deco)
console.log(`Text clusters in: ${svgPath}`);
console.log(`(SVG-to-px scale ${SCALE.toFixed(3)}, font-size estimated as height / 0.7)\n`);

clusters
  .filter((c) => c.count >= 3) // at least 3 paths = likely a word, not a stray shape
  .filter((c) => (c.bottom - c.y) > 10) // skip tiny lines (probably ornaments)
  .forEach((c, i) => {
    const w = c.right - c.x;
    const h = c.bottom - c.y;
    const fontEst = h / 0.7;
    console.log(
      `Cluster #${i}  ${c.count} paths  ` +
        `svg(${Math.round(c.x)},${Math.round(c.y)}) ${Math.round(w)}×${Math.round(h)}  ` +
        `→ px(${px(c.x)},${px(c.y)}) ${px(w)}×${px(h)}  ` +
        `~font-size: ${px(fontEst)}px`
    );
  });

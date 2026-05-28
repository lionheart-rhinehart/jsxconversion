#!/usr/bin/env node
// Strip the main background photo from each Canva-exported SVG so a swap-in
// photo can render behind the design layer.
//
// Heuristic: the visible base photo is the FIRST <image> element appearing
// after </defs> (images inside <defs>/<mask>/<clipPath> definitions stay).
// For most Canva exports this is the bottom-most rendered layer = the photo.
//
// Usage:
//   node scripts/strip-svg-photos.mjs              # process all
//   node scripts/strip-svg-photos.mjs cluster-1    # process only matching files
//
// Output: templates/multi-sport-foundations/assets/cluster-N-stripped.svg
// Idempotent — re-running overwrites existing stripped files.

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { join, dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const SRC_DIR = join(
  PROJECT_ROOT,
  "templates/multi-sport-foundations/canva-overlays",
);
const DST_DIR = join(
  PROJECT_ROOT,
  "templates/multi-sport-foundations/assets",
);

// Normalize Canva's inconsistent filenames into clean cluster IDs.
// Returns null for files we should skip (e.g. bulk-create test exports).
function normalizeId(filename) {
  const base = filename.replace(/\.svg$/i, "");
  if (/bulk\s*create/i.test(base)) return null;

  // "cluster - 1", "cluster - 2a" → "cluster-1", "cluster-2a"
  let m = base.match(/^cluster\s*-\s*(\d+[a-z]?)$/i);
  if (m) return `cluster-${m[1]}`;

  // Bare numeric (21, 22) → cluster-21, cluster-22
  m = base.match(/^(\d+[a-z]?)$/);
  if (m) return `cluster-${m[1]}`;

  return null;
}

// Strip the main background photo. Heuristic: among all <image> elements
// AFTER </defs> (i.e. in the visible body, not inside mask/clipPath defs),
// pick the one with the largest source-pixel area (width × height) — that's
// reliably the main photo on Canva exports.
// Returns { stripped, removedInfo }.
function stripMainPhoto(svgContent) {
  const defsEndMarker = "</defs>";
  const defsEnd = svgContent.indexOf(defsEndMarker);
  if (defsEnd === -1) {
    throw new Error("No </defs> found in SVG");
  }
  const splitAt = defsEnd + defsEndMarker.length;
  const header = svgContent.slice(0, splitAt);
  const body = svgContent.slice(splitAt);

  // Find all body images with their dimensions.
  const imageRe = /<image\b[^>]*\/>/g;
  const images = [];
  let m;
  while ((m = imageRe.exec(body)) !== null) {
    const attrs = m[0];
    const widthMatch = attrs.match(/\bwidth="([0-9.]+)"/);
    const heightMatch = attrs.match(/\bheight="([0-9.]+)"/);
    const width = widthMatch ? parseFloat(widthMatch[1]) : 0;
    const height = heightMatch ? parseFloat(heightMatch[1]) : 0;
    const area = width * height;
    images.push({
      index: images.length,
      offset: m.index,
      length: m[0].length,
      width,
      height,
      area,
    });
  }

  if (images.length === 0) {
    return { stripped: svgContent, removedInfo: null };
  }

  // Pick the largest by area. If width/height aren't both present, fall back
  // to element size (longer base64 = bigger image).
  let main;
  const haveDims = images.every((i) => i.area > 0);
  if (haveDims) {
    main = images.reduce((best, cur) => (cur.area > best.area ? cur : best));
  } else {
    main = images.reduce((best, cur) => (cur.length > best.length ? cur : best));
  }

  const before = body.slice(0, main.offset);
  const after = body.slice(main.offset + main.length);

  return {
    stripped: header + before + after,
    removedInfo: {
      bodyIndex: main.index,
      width: main.width,
      height: main.height,
      kb: Math.round(main.length / 1024),
    },
  };
}

function processSvg(srcPath, dstPath) {
  const content = readFileSync(srcPath, "utf8");
  const { stripped, removedInfo } = stripMainPhoto(content);

  if (!removedInfo) {
    console.warn(`  [warn] no <image> found in body of ${basename(srcPath)}`);
    return;
  }

  writeFileSync(dstPath, stripped);
  const origKb = Math.round(content.length / 1024);
  const newKb = Math.round(stripped.length / 1024);
  const savedKb = origKb - newKb;
  const dim = `${removedInfo.width}×${removedInfo.height}`;
  console.log(
    `  ${basename(srcPath).padEnd(28)} → ${basename(dstPath).padEnd(26)} ` +
      `removed #${removedInfo.bodyIndex} ${dim.padStart(11)} (${removedInfo.kb}kb)  |  file ${origKb}kb → ${newKb}kb`,
  );
}

function main() {
  const filter = process.argv[2]; // optional: process only filenames containing this string

  if (!existsSync(SRC_DIR)) {
    console.error(`Source dir missing: ${SRC_DIR}`);
    process.exit(1);
  }
  if (!existsSync(DST_DIR)) {
    mkdirSync(DST_DIR, { recursive: true });
  }

  const files = readdirSync(SRC_DIR)
    .filter((f) => f.toLowerCase().endsWith(".svg"))
    .filter((f) => !filter || f.includes(filter));

  if (files.length === 0) {
    console.log("No SVGs to process.");
    process.exit(0);
  }

  console.log(`Stripping main photo from ${files.length} SVG(s):`);
  let processed = 0;
  let skipped = 0;
  for (const file of files) {
    const id = normalizeId(file);
    if (!id) {
      console.log(`  [skip] ${file} (no clean cluster ID)`);
      skipped++;
      continue;
    }
    const srcPath = join(SRC_DIR, file);
    const dstPath = join(DST_DIR, `${id}-stripped.svg`);
    try {
      processSvg(srcPath, dstPath);
      processed++;
    } catch (e) {
      console.error(`  [error] ${file}: ${e.message}`);
    }
  }
  console.log(`Done. Processed ${processed}, skipped ${skipped}.`);
}

main();

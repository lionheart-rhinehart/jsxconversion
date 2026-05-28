#!/usr/bin/env node
// ============================================================================
//  scripts/scaffold-cluster.mjs — Canva SVG → JSX template + config
// ============================================================================
//  Converts a Canva-exported SVG into:
//    - templates/multi-sport-foundations/cluster-N.jsx (JSX skeleton)
//    - templates/multi-sport-foundations/cluster-N.config.json (editor-ready)
//    - templates/multi-sport-foundations/assets/cluster-N-bg.{jpg,png}
//    - templates/multi-sport-foundations/assets/cluster-N-foreground.png (if applicable)
//
//  Usage:
//    node scripts/scaffold-cluster.mjs cluster-9
//    node scripts/scaffold-cluster.mjs cluster-9 --force     # overwrite existing
//    node scripts/scaffold-cluster.mjs cluster-9 --dry-run   # preview, no writes
//
//  Classification rules:
//    - Background  = largest non-masked body image by rendered pixel area
//    - Foreground  = largest masked body image >= 400×400 px (cover-fit candidate)
//    - Decorative  = remaining body images (noted in config._notes, not extracted)
//    - FixedDesign = body <rect> elements with fills (excluding bleed rects)
// ============================================================================

import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import {
  parseSvg,
  extractBodyImages,
  extractBodyRects,
  extractMaskById,
  compositeImageWithMask,
  writeImageData,
  resolveClusterSvgPath,
} from "./lib/svg-parser.mjs";

const PROJECT_ROOT = resolve(".");
const TEMPLATE_DIR = join(PROJECT_ROOT, "templates/multi-sport-foundations");
const ASSETS_DIR = join(TEMPLATE_DIR, "assets");

const FG_MIN_SIZE = 400; // minimum rendered px for foreground cutout candidate

// ---------------------------------------------------------------------------
// CLI parse
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const clusterId = args.find((a) => !a.startsWith("--"));
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");

if (!clusterId) {
  console.error("Usage: node scripts/scaffold-cluster.mjs <cluster-id> [--force] [--dry-run]");
  console.error("Example: node scripts/scaffold-cluster.mjs cluster-9");
  process.exit(1);
}

const normalizedId = clusterId.startsWith("cluster-") ? clusterId : `cluster-${clusterId}`;
const numPart = normalizedId.replace(/^cluster-/, "");
const svgPath = resolveClusterSvgPath(PROJECT_ROOT, normalizedId);
console.log(`Source SVG: ${svgPath}`);

// ---------------------------------------------------------------------------
// Output paths
// ---------------------------------------------------------------------------
const jsxPath = join(TEMPLATE_DIR, `${normalizedId}.jsx`);
const configPath = join(TEMPLATE_DIR, `${normalizedId}.config.json`);
const bgPathBase = join(ASSETS_DIR, `${normalizedId}-bg`); // ext appended after classification
const fgPath = join(ASSETS_DIR, `${normalizedId}-foreground.png`);

// Refuse overwrite without --force
if (!force && !dryRun) {
  for (const p of [jsxPath, configPath]) {
    if (existsSync(p)) {
      console.error(`Refusing to overwrite existing file: ${p}`);
      console.error("Pass --force to overwrite, or --dry-run to preview.");
      process.exit(1);
    }
  }
}

// ---------------------------------------------------------------------------
// Parse + classify
// ---------------------------------------------------------------------------
const { defs, body } = parseSvg(svgPath);
const allImages = extractBodyImages(body);
const allRects = extractBodyRects(body);

console.log(`\nFound ${allImages.length} body image(s):`);
allImages.forEach((img) => {
  const note = img.maskId ? `[masked: ${img.maskId}]` : "[no mask]";
  console.log(
    `  #${img.index}  src=${img.srcWidth}×${img.srcHeight}  ` +
      `rendered=${img.renderedW}×${img.renderedH} @(${img.renderedX},${img.renderedY})  ${note}`,
  );
});
console.log(`\nFound ${allRects.length} body rect(s):`);
allRects.forEach((r, i) => {
  const note = r.isBleed ? "[BLEED — skipped]" : "";
  console.log(
    `  #${i}  ${r.width}×${r.height} @(${r.x},${r.y})  fill=${r.fill}  ${note}`,
  );
});

// Classify images by rendered AREA (absolute value handles negative scales)
const imageArea = (img) => Math.abs(img.renderedW * img.renderedH);
const nonMasked = allImages.filter((i) => !i.maskId).sort((a, b) => imageArea(b) - imageArea(a));
const masked = allImages.filter((i) => i.maskId).sort((a, b) => imageArea(b) - imageArea(a));

const background = nonMasked[0] || null; // largest unmasked
const foregroundCandidate = masked[0] || null;
const useForeground =
  foregroundCandidate &&
  Math.abs(foregroundCandidate.renderedW) >= FG_MIN_SIZE &&
  Math.abs(foregroundCandidate.renderedH) >= FG_MIN_SIZE;

const otherImages = [
  ...nonMasked.slice(1),
  ...masked.slice(useForeground ? 1 : 0),
];

console.log(`\nClassification:`);
console.log(`  Background image: ${background ? `#${background.index} (${background.renderedW}×${background.renderedH})` : "(none)"}`);
console.log(`  Foreground cutout: ${useForeground ? `#${foregroundCandidate.index} (${foregroundCandidate.renderedW}×${foregroundCandidate.renderedH}, mask ${foregroundCandidate.maskId})` : "(none / too small)"}`);
console.log(`  Other images (noted but not extracted): ${otherImages.length}`);

const designRects = allRects.filter((r) => !r.isBleed);
console.log(`  fixedDesign rects: ${designRects.length} (skipped ${allRects.length - designRects.length} bleed)`);

// ---------------------------------------------------------------------------
// Build config
// ---------------------------------------------------------------------------
const bgExt = background ? background.ext : "jpg";
const bgRelPath = background ? `./assets/${normalizedId}-bg.${bgExt}` : "";
const fgRelPath = useForeground ? `./assets/${normalizedId}-foreground.png` : "";

const config = {
  width: 1080,
  height: 1920,
  media: {
    path: bgRelPath,
    type: "image",
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    videoStartTime: 0,
    videoEndTime: null,
  },
  foregroundMedia: {
    path: fgRelPath,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    blendMode: "normal",
  },
  fixedDesign: designRects.map((r, i) => ({
    id: `rect_${i}`,
    type: "rect",
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    fill: r.fill,
    opacity: r.opacity,
  })),
  elements: [], // user/agent adds text zones via editor
  _notes: {
    scaffoldedAt: new Date().toISOString(),
    sourceSvg: svgPath.replace(PROJECT_ROOT, ".").replace(/\\/g, "/"),
    skippedImages: otherImages.map((i) => ({
      index: i.index,
      rendered: `${i.renderedW}×${i.renderedH}`,
      pos: `(${i.renderedX},${i.renderedY})`,
      maskId: i.maskId || null,
    })),
    skippedRects: allRects.length - designRects.length,
  },
};

// ---------------------------------------------------------------------------
// Build JSX skeleton
// ---------------------------------------------------------------------------
const jsxSource = `// ============================================================================
//  ${normalizedId.toUpperCase()} — auto-scaffolded from ${svgPath.split(/[/\\\\]/).pop()}
// ============================================================================
//  Generated by scripts/scaffold-cluster.mjs. Refine via the position editor
//  at http://localhost:5173/#${normalizedId} (add text elements, drag positions,
//  tune media offset/scale/crop). All editable values live in
//  ${normalizedId}.config.json.
// ============================================================================

import config from "./${normalizedId}.config.json";
import {
  AA_RED,
  WHITE,
  INK_950,
  MediaSlot,
  Frame,
  FixedDesign,
  ForegroundMedia,
} from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — required so renderer detects fonts referenced
// via _helpers.jsx imports. Add more entries here if you use other fonts.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
  body: { fontFamily: "'Geist', sans-serif" },
};

function cfg(id) {
  return config.elements.find((e) => e.id === id) || {};
}
function elStyle(id, extra) {
  const c = cfg(id);
  const style = {
    position: "absolute",
    left: c.x,
    top: c.y,
    fontSize: c.fontSize,
    fontFamily: c.fontFamily ? \`'\${c.fontFamily}', sans-serif\` : undefined,
    color: c.color,
    ...extra,
  };
  if (c.strokeWidth) {
    style.WebkitTextStroke = \`\${c.strokeWidth}px \${c.strokeColor || WHITE}\`;
  }
  return style;
}

const media = config.media || {};
const foreground = config.foregroundMedia || {};

function ${camelCase(normalizedId)}() {
  return (
    <Frame width={WIDTH} height={HEIGHT} background={INK_950}>
      <MediaSlot
        path={media.path}
        offsetX={media.offsetX || 0}
        offsetY={media.offsetY || 0}
        scale={media.scale || 1}
        videoStartTime={media.videoStartTime || 0}
        crop={media.crop}
        width={WIDTH}
        height={HEIGHT}
      />

      <FixedDesign items={config.fixedDesign || []} />

      {/* Editable text elements (add via editor or by hand in config.elements) */}
      {config.elements.map((el) => (
        <div key={el.id} style={elStyle(el.id, {
          lineHeight: 1.0,
          letterSpacing: "-0.01em",
          whiteSpace: "pre",
        })}>
          {el.text}
        </div>
      ))}

      <ForegroundMedia
        path={foreground.path}
        offsetX={foreground.offsetX || 0}
        offsetY={foreground.offsetY || 0}
        scale={foreground.scale || 1}
        blendMode={foreground.blendMode || "normal"}
        width={WIDTH}
        height={HEIGHT}
      />
    </Frame>
  );
}

export default ${camelCase(normalizedId)};
`;

function camelCase(id) {
  // cluster-9 → Cluster9, cluster-2a → Cluster2a
  return id
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

// ---------------------------------------------------------------------------
// Write outputs
// ---------------------------------------------------------------------------
if (dryRun) {
  console.log("\n=== DRY RUN — would write: ===");
  console.log(`  ${configPath}`);
  console.log(`  ${jsxPath}`);
  if (background) console.log(`  ${bgPathBase}.${bgExt}`);
  if (useForeground) console.log(`  ${fgPath}`);
  console.log("\n=== Config preview: ===");
  console.log(JSON.stringify(config, null, 2));
  process.exit(0);
}

if (!existsSync(ASSETS_DIR)) {
  mkdirSync(ASSETS_DIR, { recursive: true });
}

// Extract background image
if (background) {
  const bgFullPath = `${bgPathBase}.${bgExt}`;
  writeImageData(bgFullPath, bgExt, background.base64);
  console.log(`\n✓ Wrote ${bgFullPath} (${Math.round(background.base64.length * 0.75 / 1024)}kb)`);
}

// Extract foreground cutout (composite with mask → RGBA)
if (useForeground) {
  console.log(`\nCompositing foreground with mask #${foregroundCandidate.maskId}…`);
  const mask = extractMaskById(defs, foregroundCandidate.maskId);
  if (!mask) {
    console.error(`  Mask not found! Skipping foreground.`);
    config.foregroundMedia.path = "";
  } else {
    const pngBuf = await compositeImageWithMask(
      { ext: foregroundCandidate.ext, base64: foregroundCandidate.base64 },
      mask,
    );
    writeFileSync(fgPath, pngBuf);
    console.log(`✓ Wrote ${fgPath} (${Math.round(pngBuf.length / 1024)}kb RGBA)`);
  }
}

// Write config + JSX
writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`\n✓ Wrote ${configPath}`);
writeFileSync(jsxPath, jsxSource);
console.log(`✓ Wrote ${jsxPath}`);

console.log(`\nDone. Next steps:`);
console.log(`  1. Render: node .claude/skills/jsx-to-mp4/scripts/render.mjs ${jsxPath.replace(PROJECT_ROOT, ".").replace(/\\/g, "/")}`);
console.log(`  2. Open editor: http://localhost:5173/#${normalizedId}`);
console.log(`  3. Add text elements via editor or by editing ${normalizedId}.config.json`);

#!/usr/bin/env node
// Inspect every <rect fill="..."> in a Canva-exported SVG body and classify it,
// so color tints / filters / blocks are SURFACED before you author a template.
//
// Why this exists: inspect-svg-images.mjs only sees <image> elements (photos,
// logos). Canva builds a "color filter" look with a SOLID full-frame brand-color
// rect sitting BEHIND a semi-transparent photo — the color bleeds through and
// tints the whole image. That rect is invisible to the image inspector and,
// geometrically, looks identical to the throwaway white background bleed. It is
// easy to miss (cluster-8a lost its red wash exactly this way). This tool makes
// such tints impossible to miss: it prints every fill rect and flags full-frame
// chromatic ones as design-critical TINTS.
//
// Usage: node scripts/inspect-svg-rects.mjs <path-to-svg>
//
// Powered by scripts/lib/svg-parser.mjs.

import {
  parseSvg,
  extractBodyRects,
  parseHexColor,
  VIEWBOX_TO_PX,
} from "./lib/svg-parser.mjs";

const svgPath = process.argv[2];
if (!svgPath) {
  console.error("Usage: node inspect-svg-rects.mjs <path-to-svg>");
  process.exit(1);
}

const { body } = parseSvg(svgPath);
const rects = extractBodyRects(body);

console.log(`Inspecting body rects in: ${svgPath}`);
console.log(`(SVG-to-px scale: ${VIEWBOX_TO_PX.toFixed(3)})\n`);

if (rects.length === 0) {
  console.log("  (no fill rects found)");
}

const tints = [];
rects.forEach((r, i) => {
  let kind, note;
  if (r.isBleed) {
    kind = "BLEED";
    note = "achromatic full-frame background — skip (would wipe out the photo)";
  } else if (r.isTint) {
    kind = "⚠ TINT";
    note = "FULL-FRAME COLOR FILTER — design-critical, do NOT drop";
    tints.push(r);
  } else {
    kind = "block";
    note = "normal color block (banner / band / panel)";
  }
  console.log(
    `#${i}  [${kind}]  ${r.width}×${r.height} @(${r.x},${r.y})  ` +
      `fill=${r.fill}  opacity=${r.opacity}`,
  );
  console.log(`        ${note}`);
});

// Loud, actionable callout for any tint so it can't be glossed over.
if (tints.length > 0) {
  console.log(
    `\n${"=".repeat(72)}\n` +
      `⚠  ${tints.length} FULL-FRAME COLOR TINT${tints.length > 1 ? "S" : ""} DETECTED — these are color filters, not backgrounds.\n` +
      `${"=".repeat(72)}`,
  );
  for (const t of tints) {
    const rgb = parseHexColor(t.fill) || { r: 0, g: 0, b: 0 };
    console.log(
      `\n  tint fill=${t.fill}  → in Canva this solid rect sits BEHIND a\n` +
        `  semi-transparent photo so the color bleeds through and tints everything.\n` +
        `  In the opaque-layer model, reproduce it as a SEMI-TRANSPARENT OVERLAY\n` +
        `  ABOVE the background photo (a fixedDesign rect), e.g.:\n\n` +
        `      { "id": "brand_tint", "tag": "brand_tint", "type": "rect",\n` +
        `        "x": 0, "y": 0, "width": 1080, "height": 1920,\n` +
        `        "fill": "rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)", "z": 5 }\n\n` +
        `  Then TUNE the exact strength against the original render:\n` +
        `      node scripts/sample-fill.mjs out/compare/<cluster>-original.png \\\n` +
        `        --rect <clean-bg-region>    # compare to your render, adjust alpha\n` +
        `  NOTE: it must tint only the BACKGROUND — keep its z BELOW any foreground\n` +
        `  cutout / headline so athletes & text stay crisp (matches the original).`,
    );
  }
}

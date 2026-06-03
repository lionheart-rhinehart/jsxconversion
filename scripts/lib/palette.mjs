// ============================================================================
//  scripts/lib/palette.mjs — brand-color remap (the "nothing hardcoded" core)
// ============================================================================
//  The template bank (templates/multi-sport-foundations/*.config.json and the
//  motion templates/elements) physically contains Athletes Acceleration's
//  colors as literals. Those literals are the AUTHORING BASELINE + fallback —
//  NOT a brand decision the template gets to keep. This module rewrites them to
//  whatever the ACTIVE brand kit specifies, at every point a creative is
//  materialized for a brand:
//    • static first-fill        (resolveStaticConfig, scripts/lib/fill-core.mjs)
//    • motion wrapper emit       (scripts/run-campaign.mjs)
//    • repurpose clone           (scripts/lib/clone-core.mjs — baked edits + fresh JSX)
//
//  For the AA kit the map is IDENTITY (every from===to entry is skipped) → the
//  output is byte-for-byte unchanged (the 0-diff guardrail). Any other kit fully
//  overrides. Covers hex (#c4141d) AND the rgb triples inside rgba()/gradients
//  (196,20,29 → target rgb, alpha preserved) so the red photo tints recolor too.
// ============================================================================

// The colors the bank was authored in. MUST equal the color tokens in
// data/brand.athletes-acceleration.json (the 0-diff gate depends on it).
export const BANK_AUTHORING_PALETTE = {
  brand_red: "#c4141d",
  brand_red_deep: "#a30f17",
  ink_950: "#0a0b0d",
  ink_900: "#15171a",
  white: "#ffffff",
};

// Token keys this module remaps (colors only — fonts are handled separately and
// static font tokenization is deferred).
export const COLOR_TOKEN_KEYS = Object.keys(BANK_AUTHORING_PALETTE);

function escapeReg(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex).trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

// Build the ordered replacement list mapping authoring colors → the active
// kit's colors. `toTags` is the active brand tier's tags; `fromTags` defaults to
// the bank authoring palette. Only tokens that actually DIFFER produce a
// replacement, so an AA-equivalent kit yields an empty (no-op) map.
export function buildPaletteMap(toTags = {}, fromTags = BANK_AUTHORING_PALETTE) {
  const reps = [];
  for (const key of COLOR_TOKEN_KEYS) {
    const from = fromTags[key];
    const to = toTags[key];
    if (!from || !to) continue;
    if (String(from).toLowerCase() === String(to).toLowerCase()) continue; // identity → skip
    // Hex form (case-insensitive): #c4141d / #C4141D.
    reps.push({ re: new RegExp(escapeReg(from), "gi"), to });
    // RGB-triple form inside rgba()/gradients — replace only the R,G,B, leaving
    // the alpha and surrounding text intact.
    const f = hexToRgb(from);
    const t = hexToRgb(to);
    if (f && t) {
      reps.push({
        re: new RegExp(`${f[0]}\\s*,\\s*${f[1]}\\s*,\\s*${f[2]}`, "g"),
        to: `${t[0]}, ${t[1]}, ${t[2]}`,
      });
    }
  }
  return reps;
}

export function isEmptyPaletteMap(reps) {
  return !reps || reps.length === 0;
}

// Apply the replacement list to one string. Only fires on strings that contain
// an authoring color value; copy text never does.
export function remapColorString(str, reps) {
  if (typeof str !== "string" || isEmptyPaletteMap(reps)) return str;
  let out = str;
  for (const { re, to } of reps) out = out.replace(re, to);
  return out;
}

// Deep-remap every string value in a config object/array IN PLACE. Returns the
// number of strings changed. No-op when the map is empty (AA).
export function remapConfigColors(node, reps) {
  if (isEmptyPaletteMap(reps)) return 0;
  let n = 0;
  const visit = (obj) => {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const v = obj[i];
        if (typeof v === "string") {
          const nx = remapColorString(v, reps);
          if (nx !== v) { obj[i] = nx; n++; }
        } else if (v && typeof v === "object") visit(v);
      }
    } else if (obj && typeof obj === "object") {
      for (const k of Object.keys(obj)) {
        const v = obj[k];
        if (typeof v === "string") {
          const nx = remapColorString(v, reps);
          if (nx !== v) { obj[k] = nx; n++; }
        } else if (v && typeof v === "object") visit(v);
      }
    }
  };
  visit(node);
  return n;
}

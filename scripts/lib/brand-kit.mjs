// ============================================================================
//  scripts/lib/brand-kit.mjs — the brand-kit contract (fail-loud)
// ============================================================================
//  A brand kit is registered as data/brand.<slug>.json (its `tags` carry the
//  identity + color/font tokens) plus a kit folder at `kitPath` holding the
//  logo/font assets. Both /creative-engine (fresh campaigns) and
//  /repurpose-campaign consume it. validateKit() is the single gate: a target
//  cannot render under a brand whose kit is incomplete — the failure is an
//  exception with a precise reason, never a silent degrade-to-AA.
// ============================================================================

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { COLOR_TOKEN_KEYS } from "./palette.mjs";

// Tokens a kit MUST carry for templates to follow it. Colors come from palette
// (the remap source-of-truth); fonts are named here.
export const FONT_TOKEN_KEYS = ["font_display", "font_body", "font_mono"];

// The font FAMILIES the bank ships + preflights (project fonts/ + kit fonts/).
// A kit whose font token names a family outside this set needs its own binaries
// registered, and static font tokenization is deferred — so we warn, not throw.
export const BANK_FONT_FAMILIES = ["Anton", "Geist", "JetBrains Mono", "Oswald", "Inter"];

// Load a brand tier file fully (not just .tags) so we can read kitPath etc.
export function loadBrandFile(slug, dataDir) {
  const path = join(dataDir, `brand.${slug}.json`);
  if (!existsSync(path)) return { found: false, path, json: null };
  return { found: true, path, json: JSON.parse(readFileSync(path, "utf8")) };
}

// Extract the font families named by a font-token string ("'Anton', 'Oswald', …"
// → ["Anton","Oswald",…]).
function familiesOf(fontToken) {
  return String(fontToken || "")
    .split(",")
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

// Validate a brand kit. Returns { ok, errors[], warnings[], kit, kitDir }.
// `errors` non-empty ⇒ the caller MUST abort (pre-flight gate). Pure/no side
// effects so a --dry-run can report without touching anything.
export function validateKit(slug, { dataDir, projectRoot }) {
  const errors = [];
  const warnings = [];
  const { found, path, json } = loadBrandFile(slug, dataDir);
  if (!found) {
    errors.push(`brand kit not registered: ${path} is missing (register it via /creative-engine intake)`);
    return { ok: false, errors, warnings, kit: null, kitDir: null };
  }
  const tags = (json && json.tags) || {};
  const kitPath = json && json.kitPath;

  // Required identity.
  if (!tags.brand_name) errors.push(`brand.${slug}.json: tags.brand_name missing`);
  if (!kitPath) errors.push(`brand.${slug}.json: kitPath missing (e.g. "brand/${slug}")`);

  // Required color tokens (templates follow the kit's palette — none may be absent).
  for (const k of COLOR_TOKEN_KEYS) {
    if (!tags[k]) errors.push(`brand.${slug}.json: color token tags.${k} missing`);
  }
  // Required font tokens.
  for (const k of FONT_TOKEN_KEYS) {
    if (!tags[k]) errors.push(`brand.${slug}.json: font token tags.${k} missing`);
  }

  // Soft identity.
  if (!tags.url) warnings.push(`brand.${slug}.json: tags.url empty`);
  if (!("guarantee" in tags)) warnings.push(`brand.${slug}.json: tags.guarantee absent (creatives using the guarantee role will have no value — keep it empty intentionally for brands with no guarantee)`);

  // Logo: the kit must declare one, and its canonical source must exist. The
  // render-time `logo` tag is a served-dir-relative path; the kit's source file
  // is logo_src (defaults to <kitPath>/assets/<basename(logo)>).
  const kitDir = kitPath ? join(projectRoot, kitPath) : null;
  if (!tags.logo) {
    errors.push(`brand.${slug}.json: tags.logo missing`);
  } else {
    const base = String(tags.logo).split("/").pop();
    const logoSrc = json.logo_src ? join(projectRoot, json.logo_src) : (kitDir ? join(kitDir, "assets", base) : null);
    if (logoSrc && !existsSync(logoSrc)) {
      errors.push(`logo asset not found: ${logoSrc} (kit must ship its logo; set logo_src to override)`);
    }
  }

  // Custom font binaries (font_files): when a kit ships its own typefaces, the
  // files MUST exist — they're staged under the bank family names at render time
  // (scripts/lib/fonts-stage.mjs) so the creative renders in the kit's fonts.
  if (json.font_files && typeof json.font_files === "object") {
    for (const [role, rel] of Object.entries(json.font_files)) {
      if (rel && !existsSync(join(projectRoot, rel))) {
        errors.push(`font_files.${role} not found: ${join(projectRoot, rel)}`);
      }
    }
  }

  // Fonts: warn (don't throw) when a kit names a family the bank doesn't ship —
  // static font tokenization is deferred, so statics keep the bank face. Motion
  // honors fontFamily strings the template carries.
  for (const k of FONT_TOKEN_KEYS) {
    for (const fam of familiesOf(tags[k])) {
      if (!BANK_FONT_FAMILIES.includes(fam) && !/^(system-ui|ui-|sans-serif|serif|monospace|-apple-system|Menlo|Segoe UI|SF Mono|Arial)/i.test(fam)) {
        warnings.push(`font family "${fam}" (tags.${k}) is not in the bank set — register its binaries in fonts/ + ${kitPath}/fonts/ or statics will fall back (deferred: static font tokenization)`);
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings, kit: json, kitDir };
}

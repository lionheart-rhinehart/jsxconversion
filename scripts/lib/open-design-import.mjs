// ============================================================================
//  scripts/lib/open-design-import.mjs — import a nexu-io/open-design design system
//  (Apache-2.0) as a starting AA brand kit. (Phase A — brand-kit format adapter.)
// ============================================================================
//  open-design ships design-systems/<name>/design-tokens.json: a flat array of
//  { name:"--bg", value:"#fff", type:"color"|"fontFamily"|… } tokens. Our kit
//  format is data/brand.<slug>.json with a `tags` block (brand_red, brand_red_deep,
//  ink_950, ink_900, white, font_display/body/mono, brand_name, kitPath, logo) that
//  brand-kit.mjs `validateKit` gates. This maps the former → the latter so the 142
//  open-design systems become editable starting kits, leaving brand-kit/palette/
//  fonts-stage UNCHANGED. Heuristic by design — a starting point you then tweak.
//  NODE-ONLY (the writer touches fs; mapTokensToTags is pure + unit-tested).
// ============================================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const norm = (n) => String(n || "").replace(/^--/, "").toLowerCase();
const isColor = (v) => /^(#|rgb|hsl)/i.test(String(v || "").trim());

// Pure: open-design tokens[] → AA `tags` object (all required keys present).
export function mapTokensToTags(tokens, { slug, brandName } = {}) {
  const by = {};
  for (const t of (Array.isArray(tokens) ? tokens : [])) {
    if (t && t.name) by[norm(t.name)] = t;
  }
  const pick = (names, pred) => {
    for (const n of names) { const t = by[n]; if (t && t.value != null && (!pred || pred(t.value))) return String(t.value); }
    return null;
  };
  const color = (names) => pick(names, isColor);
  const font = (names) => pick(names);

  const accent = color(["accent", "primary", "brand", "brand-primary", "brand-1", "cta", "link", "accent-1"]);
  const accentDeep = color(["accent-strong", "accent-deep", "accent-dark", "primary-dark", "brand-dark", "accent-2"]);
  const text = color(["text", "fg", "ink", "foreground", "text-strong", "heading", "text-1"]);
  const ink2 = color(["text-muted", "muted", "text-2", "subtle", "text-secondary"]);
  const bg = color(["white", "bg", "background", "base", "surface"]);

  return {
    brand_name: brandName || slug || "Imported Brand",
    kitPath: `brand/${slug}`,
    logo: "./logo.png",            // open-design carries no logo — caller must drop one
    url: (by.url && by.url.value) || "",
    guarantee: "",
    // colors (every COLOR_TOKEN_KEY filled, with sane AA-ish fallbacks)
    brand_red: accent || "#c4141d",
    brand_red_deep: accentDeep || accent || "#8f0f15",
    ink_950: text || "#0a0b0d",
    ink_900: ink2 || text || "#15171a",
    white: bg || "#ffffff",
    // fonts
    font_display: font(["font-display", "font-heading", "font-sans", "font", "font-family"]) || "'Anton', sans-serif",
    font_body: font(["font-body", "font-sans", "font", "font-family"]) || "'Geist', system-ui, sans-serif",
    font_mono: font(["font-mono", "font-code", "font-monospace"]) || "'JetBrains Mono', monospace",
  };
}

// Writer: read an open-design design-tokens.json, write data/brand.<slug>.json +
// scaffold the kit dir. Returns { path, tags, warnings }.
export function importOpenDesignSystem({ tokensPath, slug, brandName, dataDir, projectRoot }) {
  const raw = JSON.parse(readFileSync(tokensPath, "utf8"));
  const tokens = Array.isArray(raw) ? raw : (raw.tokens || []);
  const tags = mapTokensToTags(tokens, { slug, brandName });
  const kitDir = join(projectRoot, "brand", slug);
  mkdirSync(join(kitDir, "assets"), { recursive: true });
  mkdirSync(join(kitDir, "uploads"), { recursive: true });
  const out = join(dataDir, `brand.${slug}.json`);
  writeFileSync(out, JSON.stringify({ kitPath: `brand/${slug}`, tags }, null, 2) + "\n");
  const warnings = [];
  if (!existsSync(join(kitDir, "assets", "logo.png"))) {
    warnings.push(`Drop a logo at brand/${slug}/assets/logo.png — open-design carries no logo, and validateKit requires one.`);
  }
  return { path: out, tags, warnings };
}

#!/usr/bin/env node
// ============================================================================
//  scripts/fill-template.mjs — populate a template's tagged fields from data
// ============================================================================
//  Proves the template → data → render pipeline: takes a cluster template whose
//  layers carry semantic `tag` field-names, looks each tag up in a data bundle,
//  substitutes the value into the layer, and renders a filled variant.
//
//  Usage:
//    node scripts/fill-template.mjs cluster-8 --brand athletes-acceleration
//    node scripts/fill-template.mjs cluster-8 --brand x --location fort-wayne --campaign spring
//    node scripts/fill-template.mjs cluster-8 --brand x --dry-run
//
//  Cascade resolution (highest priority first):
//    campaign → location → brand → template default (the value already in config)
//  Each data tier is a JSON file under data/ shaped { "tags": { <tag>: <value> } }:
//    --brand x     → data/brand.x.json
//    --location y  → data/location.y.json
//    --campaign z  → data/campaign.z.json
//  Only --brand is typically needed; location/campaign are optional overlays.
//
//  A tagged layer is filled only when its tag resolves to a value. Untagged or
//  unresolved layers are left byte-identical to the source — so a fill with no
//  data renders exactly like the original template.
//
//  Substitution is field-aware (never touches styling/geometry):
//    text element      → .text
//    rect shape        → .fill          (e.g. a brand_color tag)
//    image shape       → .src
//    circle shape      → .label
//  Multiple layers may share one tag (e.g. three city rows) — each is filled
//  with the same value but keeps its own distinct styling.
//
//  Output (variant pair written INTO the template dir so ./_helpers.jsx and
//  ./assets/* relative imports resolve; both are gitignored via *.fill.*):
//    templates/multi-sport-foundations/<cluster>.fill.config.json
//    templates/multi-sport-foundations/<cluster>.fill.jsx   (shell clone, import swapped)
//  then renders → out/<cluster>.fill.png
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawn } from "node:child_process";

const PROJECT_ROOT = resolve(".");
const TEMPLATE_DIR = join(PROJECT_ROOT, "templates/multi-sport-foundations");
const DATA_DIR = join(PROJECT_ROOT, "data");
const RENDERER = ".claude/skills/jsx-to-mp4/scripts/render.mjs";

// ---------------------------------------------------------------------------
// CLI parse
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const clusterArg = args.find((a) => !a.startsWith("--"));
const getOpt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : null;
};
const brand = getOpt("brand");
const location = getOpt("location");
const campaign = getOpt("campaign");
const dryRun = args.includes("--dry-run");

if (!clusterArg) {
  console.error("Usage: node scripts/fill-template.mjs <cluster-id> --brand <name> [--location <n>] [--campaign <n>] [--dry-run]");
  console.error("Example: node scripts/fill-template.mjs cluster-8 --brand athletes-acceleration");
  process.exit(1);
}
const clusterId = clusterArg.startsWith("cluster-") ? clusterArg : `cluster-${clusterArg}`;

// ---------------------------------------------------------------------------
// Load template config
// ---------------------------------------------------------------------------
const srcConfigPath = join(TEMPLATE_DIR, `${clusterId}.config.json`);
const srcJsxPath = join(TEMPLATE_DIR, `${clusterId}.jsx`);
if (!existsSync(srcConfigPath)) {
  console.error(`Template config not found: ${srcConfigPath}`);
  process.exit(1);
}
if (!existsSync(srcJsxPath)) {
  console.error(`Template JSX not found: ${srcJsxPath}`);
  process.exit(1);
}
const config = JSON.parse(readFileSync(srcConfigPath, "utf8"));

// ---------------------------------------------------------------------------
// Load + merge data tiers (cascade: campaign > location > brand)
// ---------------------------------------------------------------------------
function loadTier(kind, name) {
  if (!name) return {};
  const p = join(DATA_DIR, `${kind}.${name}.json`);
  if (!existsSync(p)) {
    console.error(`  ! ${kind} data not found: ${p} (skipping)`);
    return {};
  }
  const tags = JSON.parse(readFileSync(p, "utf8")).tags || {};
  console.log(`  loaded ${kind} "${name}": ${Object.keys(tags).length} tag(s)`);
  return tags;
}

console.log(`\nResolving data for ${clusterId}:`);
const brandTags = loadTier("brand", brand);
const locationTags = loadTier("location", location);
const campaignTags = loadTier("campaign", campaign);
// Later tiers override earlier ones.
const resolved = { ...brandTags, ...locationTags, ...campaignTags };

if (Object.keys(resolved).length === 0) {
  console.error("\nNo data tiers resolved — nothing to fill. Pass --brand <name>.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Substitute tagged fields (field-aware; styling/geometry untouched)
// ---------------------------------------------------------------------------
function fillField(item, value) {
  // Text element: has a `text` string.
  if (typeof item.text === "string") return (item.text = value), "text";
  // Design primitives by type.
  if (item.type === "rect") return (item.fill = value), "fill";
  if (item.type === "image") return (item.src = value), "src";
  if (item.type === "circle") return (item.label = value), "label";
  return null;
}

const subs = [];
const skipped = [];
const walk = (arr) => {
  for (const item of arr || []) {
    if (!item.tag) continue;
    if (!(item.tag in resolved)) continue;
    const value = resolved[item.tag];
    const field = fillField(item, value);
    if (field) subs.push({ id: item.id, tag: item.tag, field, value });
    else skipped.push({ id: item.id, tag: item.tag, reason: "no fillable field" });
  }
};
walk(config.elements);
walk(config.fixedDesign);
// media / foreground are taggable too (groundwork) — fill path if a tag resolves.
for (const slot of ["media", "foregroundMedia"]) {
  const m = config[slot];
  if (m && m.tag && m.tag in resolved) {
    m.path = resolved[m.tag];
    subs.push({ id: slot, tag: m.tag, field: "path", value: resolved[m.tag] });
  }
}

console.log(`\nSubstitutions (${subs.length}):`);
for (const s of subs) console.log(`  ${s.id.padEnd(14)} [${s.tag}] .${s.field} = ${JSON.stringify(s.value)}`);
if (skipped.length) {
  console.log(`Skipped (${skipped.length}):`);
  for (const s of skipped) console.log(`  ${s.id} [${s.tag}] — ${s.reason}`);
}
const unusedTags = Object.keys(resolved).filter((t) => !subs.some((s) => s.tag === t));
if (unusedTags.length) console.log(`Data tags with no matching layer: ${unusedTags.join(", ")}`);

// ---------------------------------------------------------------------------
// Emit filled variant (config + shell clone with import swapped)
// ---------------------------------------------------------------------------
const fillConfigPath = join(TEMPLATE_DIR, `${clusterId}.fill.config.json`);
const fillJsxPath = join(TEMPLATE_DIR, `${clusterId}.fill.jsx`);

// Clone the thin shell and point its config import at the filled config. This
// preserves WIDTH/HEIGHT export and the _FONT_PREFLIGHT markers verbatim, so the
// renderer's font preflight still sees every font literal.
const srcJsx = readFileSync(srcJsxPath, "utf8");
const fillJsx = srcJsx.replace(
  `./${clusterId}.config.json`,
  `./${clusterId}.fill.config.json`,
);
if (fillJsx === srcJsx) {
  console.error(`\n! Could not find config import "./${clusterId}.config.json" in ${clusterId}.jsx — aborting.`);
  process.exit(1);
}

if (dryRun) {
  console.log("\n=== DRY RUN — would write: ===");
  console.log(`  ${fillConfigPath}`);
  console.log(`  ${fillJsxPath}`);
  console.log(`  then render → out/${clusterId}.fill.png`);
  process.exit(0);
}

writeFileSync(fillConfigPath, JSON.stringify(config, null, 2));
writeFileSync(fillJsxPath, fillJsx);
console.log(`\n✓ Wrote ${fillConfigPath}`);
console.log(`✓ Wrote ${fillJsxPath}`);

// ---------------------------------------------------------------------------
// Render the filled variant through the normal renderer
// ---------------------------------------------------------------------------
console.log(`\nRendering ${clusterId}.fill.jsx …`);
const proc = spawn("node", [RENDERER, fillJsxPath], { cwd: PROJECT_ROOT, stdio: "inherit" });
proc.on("exit", (code) => {
  if (code === 0) {
    console.log(`\n✓ Rendered out/${clusterId}.fill.png`);
  } else {
    console.error(`\n! Render failed (exit ${code}).`);
  }
  process.exit(code ?? 1);
});

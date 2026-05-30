#!/usr/bin/env node
// ============================================================================
//  scripts/fill-template.mjs — populate a template's tagged fields from data
// ============================================================================
//  Thin CLI over scripts/lib/fill-core.mjs (the shared cascade/substitution/
//  variant/render core). Behavior is unchanged from the pre-refactor version.
//
//  Usage:
//    node scripts/fill-template.mjs cluster-8 --brand athletes-acceleration
//    node scripts/fill-template.mjs cluster-8 --brand x --location fort-wayne --campaign spring
//    node scripts/fill-template.mjs cluster-8 --brand x --dry-run
//
//  Cascade resolution (highest priority first):
//    campaign → location → brand → template default (the value already in config)
//  Each data tier is a JSON file under data/ shaped { "tags": { <tag>: <value> } }.
//  A tagged layer is filled only when its tag resolves to a value; untagged or
//  unresolved layers stay byte-identical to the source.
//
//  Substitution is field-aware (never touches styling/geometry):
//    text element → .text   rect → .fill   image → .src   circle → .label
//  Output (gitignored via *.fill.*), written INTO the template dir so
//  ./_helpers.jsx and ./assets/* relative imports resolve:
//    templates/multi-sport-foundations/<cluster>.fill.config.json
//    templates/multi-sport-foundations/<cluster>.fill.jsx
//  then renders → out/<cluster>.fill.png
// ============================================================================

import { existsSync } from "node:fs";
import { resolve, join } from "node:path";
import {
  loadTier,
  mergeTiers,
  applySubstitutions,
  emitVariant,
  renderJsx,
} from "./lib/fill-core.mjs";

const PROJECT_ROOT = resolve(".");
const TEMPLATE_DIR = join(PROJECT_ROOT, "templates/multi-sport-foundations");
const DATA_DIR = join(PROJECT_ROOT, "data");

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
import { readFileSync } from "node:fs";
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
const sourceConfig = JSON.parse(readFileSync(srcConfigPath, "utf8"));

// ---------------------------------------------------------------------------
// Load + merge data tiers (cascade: campaign > location > brand)
// ---------------------------------------------------------------------------
function logTier(kind, name, tier) {
  if (!name) return;
  if (!tier.found) console.error(`  ! ${kind} data not found: ${tier.path} (skipping)`);
  else console.log(`  loaded ${kind} "${name}": ${tier.count} tag(s)`);
}

console.log(`\nResolving data for ${clusterId}:`);
const brandTier = loadTier("brand", brand, DATA_DIR);
const locationTier = loadTier("location", location, DATA_DIR);
const campaignTier = loadTier("campaign", campaign, DATA_DIR);
logTier("brand", brand, brandTier);
logTier("location", location, locationTier);
logTier("campaign", campaign, campaignTier);

const resolved = mergeTiers(brandTier.tags, locationTier.tags, campaignTier.tags);
if (Object.keys(resolved).length === 0) {
  console.error("\nNo data tiers resolved — nothing to fill. Pass --brand <name>.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Substitute tagged fields
// ---------------------------------------------------------------------------
const { config, subs, skipped, unusedTags } = applySubstitutions(sourceConfig, resolved);

console.log(`\nSubstitutions (${subs.length}):`);
for (const s of subs) console.log(`  ${s.id.padEnd(14)} [${s.tag}] .${s.field} = ${JSON.stringify(s.value)}`);
if (skipped.length) {
  console.log(`Skipped (${skipped.length}):`);
  for (const s of skipped) console.log(`  ${s.id} [${s.tag}] — ${s.reason}`);
}
if (unusedTags.length) console.log(`Data tags with no matching layer: ${unusedTags.join(", ")}`);

// ---------------------------------------------------------------------------
// Emit filled variant + render
// ---------------------------------------------------------------------------
if (dryRun) {
  console.log("\n=== DRY RUN — would write: ===");
  console.log(`  ${join(TEMPLATE_DIR, `${clusterId}.fill.config.json`)}`);
  console.log(`  ${join(TEMPLATE_DIR, `${clusterId}.fill.jsx`)}`);
  console.log(`  then render → out/${clusterId}.fill.png`);
  process.exit(0);
}

let fillJsxPath;
try {
  ({ fillJsxPath } = emitVariant({ clusterId, config, templateDir: TEMPLATE_DIR, suffix: ".fill" }));
} catch (e) {
  console.error(`\n! ${e.message} — aborting.`);
  process.exit(1);
}
console.log(`\n✓ Wrote ${join(TEMPLATE_DIR, `${clusterId}.fill.config.json`)}`);
console.log(`✓ Wrote ${fillJsxPath}`);

console.log(`\nRendering ${clusterId}.fill.jsx …`);
const { code, ok } = await renderJsx({ jsxPath: fillJsxPath, projectRoot: PROJECT_ROOT });
if (ok) console.log(`\n✓ Rendered out/${clusterId}.fill.png`);
else console.error(`\n! Render failed (exit ${code}).`);
process.exit(code ?? 1);

// ============================================================================
//  scripts/rebind-static-copy.mjs — re-apply verbatim copy onto FROZEN static
//  edit-files without touching hand placement.
// ============================================================================
//  Why this exists: once a static asset has an authoritative per-asset edit file
//  (campaigns/<name>/edits/<angle>__<asset>.config.json) the runner + editor read
//  it directly and NEVER re-fill (so hand placement is never clobbered). That
//  means re-binding copy in the plan (copyRefs/hookRef) can't reach a static that
//  already has an edit file. This script bridges that gap: it re-resolves each
//  static's copy through the SAME fill path (resolveStaticConfig → the role→slot
//  JOIN + copy-library refs) and writes ONLY each CONTENT text slot's `.text`
//  back into the existing edit file — geometry, media, scrim and crop untouched.
//
//  Usage:
//    node scripts/rebind-static-copy.mjs <campaign> [--only A2,C3] [--dry-run]
//
//  Safe to re-run. Assets with no edit file yet are skipped (the first render
//  seeds them from the same fill path). Identity/locked slots (eyebrow anchor,
//  brand, guarantee, cta, byline, offer) are left as the edit file has them — we
//  only rewrite the message copy (the CONTENT roles).
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { resolveStaticConfig } from "./lib/fill-core.mjs";

const PROJECT_ROOT = resolve(".");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");
const TEMPLATE_DIR = join(PROJECT_ROOT, "templates/multi-sport-foundations");
const DATA_DIR = join(PROJECT_ROOT, "data");

// The message-copy roles we rewrite (must trace to the copy-library). Identity
// and structural-but-locked roles (eyebrow/brand/guarantee/cta/byline/offer) are
// intentionally excluded so the rebind only ever touches the verbatim message.
const CONTENT_ROLES = new Set([
  "kicker", "hook", "claim", "mechanism", "reframe", "proof", "stat", "testimonial",
]);

const args = process.argv.slice(2);
const campaign = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const onlyArg = (args.find((a) => a.startsWith("--only")) || "").split("=")[1]
  || (args[args.indexOf("--only") + 1] && !args[args.indexOf("--only") + 1].startsWith("--") ? args[args.indexOf("--only") + 1] : null);
const only = onlyArg ? new Set(onlyArg.split(",").map((s) => s.trim())) : null;

if (!campaign) {
  console.error("usage: node scripts/rebind-static-copy.mjs <campaign> [--only A2,C3] [--dry-run]");
  process.exit(1);
}

const planPath = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
if (!existsSync(planPath)) { console.error(`no plan for "${campaign}" at ${planPath}`); process.exit(1); }
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const brand = plan.brand || null;

function editsConfigPath(angleId, assetId) {
  return join(CAMPAIGNS_DIR, campaign, "edits", `${angleId}__${assetId}.config.json`);
}

let planTouched = false;
let totalChanges = 0;

for (const angle of plan.angles || []) {
  for (const asset of angle.assets || []) {
    if (!asset.template || !asset.template.startsWith("cluster-")) continue;
    if (only && !only.has(asset.id)) continue;

    const editsPath = editsConfigPath(angle.id, asset.id);
    if (!existsSync(editsPath)) {
      console.log(`SKIP  ${asset.id}  (no edit file yet — first render will seed it)`);
      continue;
    }

    const location = asset.location || angle.location || plan.location || null;
    const fresh = resolveStaticConfig({
      clusterId: asset.template, asset, brand, location, campaign,
      templateDir: TEMPLATE_DIR, dataDir: DATA_DIR,
    });
    if (!fresh) { console.error(`ERR   ${asset.id}  could not resolve fill for ${asset.template}`); continue; }

    // id → new verbatim text, CONTENT roles only, non-empty.
    const newText = {};
    for (const el of fresh.elements || []) {
      if (typeof el.text !== "string") continue;
      if (el.locked || !CONTENT_ROLES.has(el.role)) continue;
      if (!el.text.trim()) continue; // never blank an existing line
      newText[el.id] = el.text;
    }

    const editsConfig = JSON.parse(readFileSync(editsPath, "utf8"));
    const changes = [];
    for (const el of editsConfig.elements || []) {
      if (!el || !(el.id in newText)) continue;
      if (el.text === newText[el.id]) continue;
      changes.push({ id: el.id, from: el.text, to: newText[el.id] });
      el.text = newText[el.id];
    }

    if (!changes.length) { console.log(`ok    ${asset.id}  (${asset.template}) — copy already matches`); continue; }

    console.log(`\n${dryRun ? "WOULD REBIND" : "REBIND"}  ${asset.id}  (${asset.template})  ${changes.length} slot(s):`);
    for (const c of changes) {
      console.log(`   [${c.id}]  "${String(c.from).replace(/\n/g, "\\n").slice(0, 50)}"  ->  "${String(c.to).replace(/\n/g, "\\n").slice(0, 50)}"`);
    }
    totalChanges += changes.length;

    if (!dryRun) {
      writeFileSync(editsPath, JSON.stringify(editsConfig, null, 2));
      asset.editedAt = new Date().toISOString();
      planTouched = true;
    }
  }
}

if (planTouched && !dryRun) {
  writeFileSync(planPath, JSON.stringify(plan, null, 2));
  console.log(`\nplan stamped (editedAt) → ${planPath}`);
}
console.log(`\n${dryRun ? "[dry-run] " : ""}done. ${totalChanges} slot change(s).`);

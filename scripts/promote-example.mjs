#!/usr/bin/env node
// ============================================================================
//  scripts/promote-example.mjs — CLI: "Save as example" (harvest)
// ============================================================================
//  Promote an APPROVED, rendered campaign creative into the example library as a new
//  labeled example (structure kept, campaign copy/brand dropped). After it lands we
//  rebuild the archetype centroids so cluster-adherence (#15) can see it.
//
//    node scripts/promote-example.mjs <campaign> <angle> <asset> --label "short name"
//
//  The "Save as example" review.html BUTTON → a POST /promote route is editor-server-
//  coupled and DEFERRED (see docs/DEFERRED-promote-route.md). This CLI is fully usable
//  on its own.  NODE-ONLY.
// ============================================================================

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fieldRole } from "./lib/roles.mjs";
import { specFor, loadExampleIndex } from "./lib/example-library.mjs";
import { nextExampleSeq, makeExampleId, deriveSlotShape, buildEntry, appendToLibrary } from "./lib/promote-example.mjs";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isStr = (v) => typeof v === "string" && v.trim().length > 0;

function findAsset(plan, angleId, assetId) {
  for (const a of plan.angles || []) {
    if (a.id !== angleId) continue;
    for (const s of a.assets || []) if (s.id === assetId) return { angle: a, asset: s };
  }
  return null;
}

// Slot fields (id/role/maxChars) from what the creative actually renders.
function slotFields(campaign, angleId, asset) {
  const isMotion = asset.format === "video" || asset.format === "gif";
  if (!isMotion) {
    const editsPath = join(PROJECT_ROOT, "campaigns", campaign, "edits", `${angleId}__${asset.id}.config.json`);
    if (!existsSync(editsPath)) return [];
    const cfg = JSON.parse(readFileSync(editsPath, "utf8"));
    return (cfg.elements || []).filter((el) => isStr(el.role) && isStr(el.text))
      .map((el) => ({ key: el.id, role: el.role, maxChars: el.maxChars, required: true }));
  }
  const td = (asset.templateData && typeof asset.templateData === "object") ? asset.templateData : {};
  return Object.entries(td).filter(([k, v]) => isStr(v) && !k.startsWith("_") && isStr(fieldRole(k)))
    .map(([k]) => ({ key: k, role: fieldRole(k), maxChars: null, required: true }));
}

function main() {
  const args = process.argv.slice(2);
  const [campaign, angleId, assetId] = args.filter((a) => !a.startsWith("--"));
  const labelArg = args.find((a) => a.startsWith("--label="));
  const label = labelArg ? labelArg.slice("--label=".length) : null;
  if (!campaign || !angleId || !assetId) { console.error('usage: node scripts/promote-example.mjs <campaign> <angle> <asset> --label="..."'); process.exit(2); }

  const planPath = join(PROJECT_ROOT, "campaigns", campaign, "creative-plan.json");
  if (!existsSync(planPath)) { console.error(`no creative-plan.json for "${campaign}"`); process.exit(2); }
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  const hit = findAsset(plan, angleId, assetId);
  if (!hit) { console.error(`asset ${angleId}/${assetId} not found`); process.exit(2); }
  const { asset } = hit;

  if (asset.status !== "approved") { console.error(`refusing: ${angleId}/${assetId} status is "${asset.status || "—"}", not "approved"`); process.exit(2); }
  if (!isStr(asset.archetype)) { console.error(`refusing: ${angleId}/${assetId} has no archetype`); process.exit(2); }

  const isMotion = asset.format === "video" || asset.format === "gif";
  const ext = isMotion ? (asset.format === "gif" ? ".gif" : ".mp4") : ".png";
  const renderImg = join(PROJECT_ROOT, "out", "campaigns", campaign, angleId, `${assetId}.png`);   // poster/png
  const renderMotion = join(PROJECT_ROOT, "out", "campaigns", campaign, angleId, `${assetId}${ext}`);
  const sourceImage = existsSync(renderImg) ? renderImg : (isMotion ? null : renderMotion);
  if (!sourceImage || !existsSync(sourceImage)) { console.error(`refusing: no rendered image at ${renderImg} — render the campaign first`); process.exit(2); }

  const index = loadExampleIndex(PROJECT_ROOT);
  const exampleId = makeExampleId(nextExampleSeq(index), label || `${asset.archetype}-${campaign}`);
  const spec = specFor(asset.archetype) || {};
  // a media-carrying asset's example accepts what its archetype allows; graphic/no-media → []
  const mediaStyleAccepts = (!spec.mediaOptional && (asset.media || asset.clip || asset.photo)) ? (spec.mediaStyleAllowed || []) : [];
  const slotShape = deriveSlotShape({ fields: slotFields(campaign, angleId, asset) });

  let entry;
  try {
    entry = buildEntry({ exampleId, archetype: asset.archetype, format: isMotion ? "video" : "static", mediaStyleAccepts, slotShape, hasMotion: isMotion });
    appendToLibrary({ root: PROJECT_ROOT, exampleId, entry, sourceImage, sourceMotion: existsSync(renderMotion) ? renderMotion : null,
      sourceJsx: asset.template ? join(PROJECT_ROOT, "templates", "multi-sport-foundations", `${asset.template}.jsx`) : null });
  } catch (e) { console.error(`promote failed: ${e.message}`); process.exit(2); }

  console.log(`\n✓ promoted ${angleId}/${assetId} → ${exampleId} (${asset.archetype}, ${entry.format})`);
  // Rebuild centroids so #15 can see the new example (re-labeling for real clusterMetrics
  // is a heavier follow-up — run the example sidecar to embed + label the new id).
  const r = spawnSync("python", [join("scripts", "example-sidecar", "build_centroids.py")], { cwd: PROJECT_ROOT, encoding: "utf8" });
  console.log(r.status === 0 ? "  centroids rebuilt (cluster-adherence will include it)" : "  NOTE: run build_centroids.py + the labeling sidecar to fold the new example into #15");
  console.log("");
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

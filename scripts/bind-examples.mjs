#!/usr/bin/env node
// ============================================================================
//  scripts/bind-examples.mjs — CLI: stamp a campaign's fresh creatives with their
//  selected example ids (the generation engine's SELECTION step, run as code)
// ============================================================================
//  Loads the campaign plan + copy-library + example index, runs bindPlanExamples,
//  and writes the stamped exampleId/archetype back into creative-plan.json. Run
//  this AFTER planning + copy-binding, BEFORE composing (compose-creative reads
//  asset.exampleId) and BEFORE the render gate (validate-plan re-derives + enforces
//  the binding via `exampleBindingAuthentic`).
//
//    node scripts/bind-examples.mjs <campaign>     (exit 0 = all bound; 2 = a null)
//
//  WRITE PATH: this writes creative-plan.json DIRECTLY with an inlined atomic write
//  (temp + rename). It does NOT go through editor-server (a) to avoid the live-edit
//  lock on that file and (b) because editor-server's POST /plan ALLOWED allowlist
//  does not yet include exampleId/archetype (that wiring = the deferred "G2"). So:
//  run this when the review editor is IDLE for this campaign (a concurrent
//  editor-server write would lose-update; both writers are atomic-rename so no torn
//  file, but a racing save could drop the stamps — re-run if that happens). The GATE
//  re-derives the binding regardless of who wrote the plan, so a lost stamp fails
//  CLOSED at render, never silently ships unbound.  NODE-ONLY.
// ============================================================================

import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { bindPlanExamples } from "./lib/bind-examples.mjs";
import { loadExampleIndex } from "./lib/example-library.mjs";
import { loadCopyLibraryStrict } from "./lib/copy-library.mjs";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");

// Inlined atomic write (temp + rename) — same shape editor-server uses, copied here
// so this CLI does not import the live-edited editor-server module.
function writeAtomic(path, text) {
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, text);
  renameSync(tmp, path);
}

function main() {
  const campaign = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!campaign) { console.error("usage: node scripts/bind-examples.mjs <campaign>"); process.exit(2); }

  const campaignDir = join(CAMPAIGNS_DIR, campaign);
  const planPath = join(campaignDir, "creative-plan.json");
  if (!existsSync(planPath)) { console.error(`no creative-plan.json for "${campaign}"`); process.exit(2); }

  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  let library = null;
  try { library = loadCopyLibraryStrict(campaignDir); }
  catch (e) { console.error(`[bind-examples] copy-library error: ${e.message}`); process.exit(2); }

  const index = loadExampleIndex(PROJECT_ROOT);
  const { plan: stamped, report } = bindPlanExamples(plan, { library, index });

  writeAtomic(planPath, JSON.stringify(stamped, null, 2) + "\n");

  console.log(`\n${campaign}: bound ${report.bound.length} fresh creative${report.bound.length === 1 ? "" : "s"} to examples` +
    (report.nulls.length ? `, ${report.nulls.length} unbound` : ""));
  for (const b of report.bound) console.log(`  ✓ ${b.angleId}/${b.assetId} → ${b.exampleId} (${b.archetype})`);
  for (const n of report.nulls) console.log(`  ✗ ${n.angleId}/${n.assetId}: ${n.reason}`);
  if (report.nulls.length) console.log(`\nfix the unbound assets (different archetype, or add an example), then re-run.`);
  console.log("");

  process.exit(report.nulls.length ? 2 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

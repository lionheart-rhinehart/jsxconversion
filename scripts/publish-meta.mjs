#!/usr/bin/env node
// ============================================================================
//  scripts/publish-meta.mjs — stage approved creatives for Meta (dry-run default)
// ============================================================================
//  Selects the publishable creatives (approved + rendered + perceptually-clean — see
//  lib/publish-select.mjs) and writes per-creative payloads to publish-plan.json for
//  review. It does NOT call the Meta API: `ads_create_creative` is an MCP tool, fired
//  deliberately by the agent with Cody's authorization (one-creative-per-call, verbatim
//  copy) — never automatically from a script. This CLI is the SAFE staging step.
//
//    node scripts/publish-meta.mjs <campaign>           (dry-run: print + write publish-plan.json)
//
//  Real publish: hand publish-plan.json's entries to the Meta Ads MCP with a marker —
//  the agent maps each {name, output, format} → ads_create_creative's object_story_spec.
//  NODE-ONLY.
// ============================================================================

import { readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { selectPublishable } from "./lib/publish-select.mjs";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(p) { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } }

function main() {
  const campaign = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!campaign) { console.error("usage: node scripts/publish-meta.mjs <campaign>"); process.exit(2); }
  const dir = join(PROJECT_ROOT, "campaigns", campaign);
  const plan = readJson(join(dir, "creative-plan.json"));
  if (!plan) { console.error(`no creative-plan.json for "${campaign}"`); process.exit(2); }
  const manifest = readJson(join(PROJECT_ROOT, "out", "campaigns", campaign, "manifest.json")) || { cells: [] };
  const perceptual = readJson(join(dir, "perceptual.json"));

  const { publishable, excluded } = selectPublishable({ plan, manifest, perceptual });

  console.log(`\n${campaign}: ${publishable.length} publishable, ${excluded.length} held back`);
  for (const p of publishable) console.log(`  ✓ ${p.key} (${p.format}) → "${p.name}"  ${p.output}`);
  for (const e of excluded) console.log(`  ✗ ${e.key} — ${e.reason}`);

  const out = {
    schemaVersion: 1, campaign, dryRun: true,
    note: "Publish-plan (dry-run). The agent maps each entry → ads_create_creative (one per call, verbatim copy) with Cody's authorization. Held-back creatives must NOT be published.",
    publishable, excluded,
  };
  const path = join(dir, "publish-plan.json");
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(out, null, 2) + "\n"); renameSync(tmp, path);
  console.log(`\n  wrote ${path} (dry-run — nothing published)\n`);
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

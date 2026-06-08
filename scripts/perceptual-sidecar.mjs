#!/usr/bin/env node
// ============================================================================
//  scripts/perceptual-sidecar.mjs — run the perceptual gates on a campaign's outputs
// ============================================================================
//  Runs ONCE after render (never inline in /validation — torch must not sit in a web
//  request). Reads the render manifest (status:"rendered" only), posters any video
//  outputs, embeds them (embed_campaign.py — CLIP+DINOv2, the same space as the example
//  centroids), runs the optional vision slop pass, then folds the raw metrics through
//  perceptual-merge.mjs into campaigns/<c>/perceptual.json (real metrics OR a fail-closed
//  sentinel — ALWAYS a valid file, never absent-on-failure). validate-plan then merges
//  that file into the gate. Python stages run ONE at a time with a hard timeout (the
//  torch-on-Windows leak discipline).
//
//    node scripts/perceptual-sidecar.mjs <campaign>
// ============================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { extractPoster } from "./lib/poster.mjs";
import { buildPerceptual, writePerceptual } from "./lib/perceptual-merge.mjs";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PY_TIMEOUT_MS = 600000; // 10 min hard cap per python stage (CPU embed of a batch)

const log = (m) => process.stderr.write(`[perceptual] ${m}\n`);

// Resolve the assigned archetype + segment per asset from the plan. segment defaults to
// the angle id (the "running segment" proxy; a marketer-adjustable grouping is future).
function planArchetypes(plan) {
  const map = new Map(); // "angle/asset" → { archetype, segment }
  for (const angle of plan.angles || []) {
    for (const asset of angle.assets || []) {
      map.set(`${angle.id}/${asset.id}`, { archetype: asset.archetype || null, segment: angle.id });
    }
  }
  return map;
}

function runPy(script, campaign) {
  const r = spawnSync("python", [join("scripts", "example-sidecar", script), campaign],
    { cwd: PROJECT_ROOT, encoding: "utf8", timeout: PY_TIMEOUT_MS, stdio: ["ignore", "inherit", "inherit"] });
  return r;
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

function main() {
  const campaign = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!campaign) { console.error("usage: node scripts/perceptual-sidecar.mjs <campaign>"); process.exit(2); }
  const campDir = join(PROJECT_ROOT, "campaigns", campaign);
  const manifestPath = join(PROJECT_ROOT, "out", "campaigns", campaign, "manifest.json");
  const planPath = join(campDir, "creative-plan.json");

  // Helper to write a sentinel + exit (fail-closed to human).
  const sentinel = (reason) => {
    const doc = buildPerceptual({ campaign, embed: { ranOk: false, reason } });
    writePerceptual(campDir, doc);
    log(`SENTINEL written (${reason}) — review is held for human approval`);
    process.exit(0); // the sentinel IS the result; the gate holds via the block
  };

  try {
    if (!existsSync(planPath)) return sentinel("no creative-plan.json");
    if (!existsSync(manifestPath)) return sentinel("no render manifest — render the campaign first");
    const plan = JSON.parse(readFileSync(planPath, "utf8"));
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const archMap = planArchetypes(plan);

    const posterDir = join(campDir, ".perceptual-posters");
    rmSync(posterDir, { recursive: true, force: true });

    const items = [];
    for (const cell of manifest.cells || []) {
      if (cell.status !== "rendered" || !cell.output) continue;
      const key = `${cell.angle}/${cell.asset}`;
      const meta = archMap.get(key) || { archetype: null, segment: cell.angle };
      const outAbs = join(PROJECT_ROOT, cell.output);
      let png = outAbs;
      if (cell.format === "video" || cell.format === "gif" || /\.(mp4|gif)$/i.test(cell.output)) {
        mkdirSync(posterDir, { recursive: true });
        const dest = join(posterDir, `${cell.angle}__${cell.asset}.png`);
        png = extractPoster(outAbs, cell.durationSec, dest);
        if (!png) { log(`skip ${key}: poster extraction failed`); continue; }
      }
      if (!existsSync(png)) { log(`skip ${key}: output missing (${png})`); continue; }
      items.push({ key, png, archetype: meta.archetype, format: cell.format || "static", segment: meta.segment });
    }
    if (!items.length) return sentinel("no rendered outputs to perceive");

    writeFileSync(join(campDir, ".perceptual-input.json"), JSON.stringify({ campaign, items }, null, 2));

    // Stage 1: embed + #14/#15 (required). A spawn failure or a ranOk:false → sentinel.
    const e = runPy("embed_campaign.py", campaign);
    if (e.error || e.status !== 0) return sentinel(`embed_campaign.py failed (${e.error ? e.error.message : "exit " + e.status})`);
    const embed = readJson(join(campDir, ".perceptual-embed.json"));
    if (!embed) return sentinel("embed produced no result file");
    if (embed.ranOk !== true) return sentinel(embed.reason || "embed step did not complete");

    // Stage 2: vision slop (#16, optional/fail-soft). Never sentinels the batch.
    runPy("slop_flag.py", campaign);
    const slop = readJson(join(campDir, ".perceptual-slop.json"));

    const doc = buildPerceptual({ campaign, embed, slop });
    writePerceptual(campDir, doc);
    rmSync(posterDir, { recursive: true, force: true });

    const blocks = Object.values(doc.assets).reduce((n, a) => n + a.violations.filter((v) => v.severity === "block").length, 0);
    log(`perceptual.json written — ${Object.keys(doc.assets).length} asset(s) flagged, ${blocks} block(s)`);
    process.exit(0);
  } catch (err) {
    return sentinel(`orchestration error: ${err.message}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

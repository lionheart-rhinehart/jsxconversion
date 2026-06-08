// ============================================================================
//  scripts/lib/perceptual-merge.mjs — turn raw embed metrics into gate violations
// ============================================================================
//  The PURE threshold + sentinel layer for the perceptual gates (#14/#15/#16). The
//  Python sidecar (embed_campaign.py) does the heavy embedding and writes RAW metrics
//  (cosines); this module applies the measured thresholds (docs/media-integration-
//  findings.md) and produces `campaigns/<c>/perceptual.json` — the file validate-plan
//  merges into the gate. Keeping the thresholds in JS makes them unit-testable without
//  torch, and keeps the Python a dumb-but-fast embedder.
//
//  Disposition: these judgment gates FAIL-CLOSED TO HUMAN. A real near-twin / off-lane
//  creative → a BLOCK the review page holds. If the sidecar couldn't run at all → a
//  BLOCK SENTINEL (never silent). The file is ALWAYS written (real or sentinel) so an
//  ABSENT perceptual.json unambiguously means "the gate hasn't run yet".
// ============================================================================

import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { join } from "node:path";

export const PERCEPTUAL_SCHEMA = 1;
// Measured gate (docs/media-integration-findings.md #7): two creatives are DISTINCT
// iff combined < 0.70 AND DINOv2 < 0.70. DINOv2 alone catches structural collapse the
// combined metric masks — so a pair is "too similar" if EITHER axis is >= 0.70.
export const COMBINED_GATE = 0.70;
export const DINO_GATE = 0.70;

function sentinelDoc(campaign, reason) {
  return {
    schemaVersion: PERCEPTUAL_SCHEMA, campaign, ranOk: false,
    sentinel: {
      rule: "perceptualGate", severity: "block",
      message: `perceptual gate could not run (${reason}) — held for human review`,
      fixHint: `re-run: node scripts/perceptual-sidecar.mjs ${campaign}`,
    },
    assets: {},
  };
}

// Build the perceptual.json document from the Python embed result + (optional) slop
// result. Pure. `embed` is the `.perceptual-embed.json` intermediate; `slop` is the
// slop_flag.py output (fail-soft — only consulted when it actually ran).
export function buildPerceptual({ campaign, embed, slop } = {}) {
  if (!embed || embed.ranOk !== true) {
    return sentinelDoc(campaign, (embed && embed.reason) || "embed step did not complete");
  }
  const assets = {};
  const add = (key, v) => { (assets[key] = assets[key] || { violations: [] }).violations.push(v); };

  for (const [key, a] of Object.entries(embed.assets || {})) {
    // #15 cluster-adherence — did it build the archetype it was ASSIGNED?
    const adh = a.adherence;
    if (adh && adh.landedInLane === false) {
      add(key, {
        rule: "clusterAdherence", severity: "block",
        message: `lands nearest "${adh.nearestArchetype}" (${adh.nearestCosine}) not its assigned "${a.assignedArchetype}" (${adh.assignedCosine})`,
        fixHint: "re-render against the assigned example, or re-assign the archetype to what it actually looks like",
      });
    }
    // #14 selection distinctness — too similar to a sibling in the SAME running segment
    for (const p of a.distinctness || []) {
      if (p.combined >= COMBINED_GATE || p.dino >= DINO_GATE) {
        add(key, {
          rule: "selectionDistinctness", severity: "block",
          message: `near-duplicate of ${p.other} in segment "${a.segment}" (combined ${p.combined}, dino ${p.dino})`,
          fixHint: "swap one of the pair to a different cluster/look so they don't collapse to one Meta entity",
        });
      }
    }
  }

  // #16 subjective slop (vision model). Fail-soft: only a block when slop actually ran.
  if (slop && slop.ran === true) {
    for (const [key, s] of Object.entries(slop.assets || {})) {
      if (s && s.flagged) {
        add(key, {
          rule: "visionSlop", severity: "block",
          message: `vision model flagged: ${s.reason || "off-brand / low-quality / slop"}`,
          fixHint: "regenerate the creative — the vision model judged it off-brand or low quality",
        });
      }
    }
  }

  return { schemaVersion: PERCEPTUAL_SCHEMA, campaign, ranOk: true, embedder: embed.embedder || null, sentinel: null, assets };
}

export function perceptualPath(campaignDir) {
  return join(campaignDir, "perceptual.json");
}

// Single-writer atomic write (temp + rename) — a crash mid-save can't leave a torn file.
export function writePerceptual(campaignDir, doc) {
  const path = perceptualPath(campaignDir);
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(doc, null, 2) + "\n");
  renameSync(tmp, path);
  return path;
}

// Read for the validate-plan merge. Returns null when ABSENT (gate hasn't run yet);
// throws only on a corrupt file (a real error worth surfacing).
export function readPerceptual(campaignDir) {
  const path = perceptualPath(campaignDir);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

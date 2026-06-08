// ============================================================================
//  scripts/lib/tier2-merge.mjs — fold the Tier-2 advisory panel into the report
// ============================================================================
//  Tier-2 is the "second pair of eyes": a multi-persona read (performance-marketer /
//  creative-director / consumer) of each rendered creative, where DISAGREEMENT between
//  personas is the signal. It is ADVISORY ONLY — warn-only, NEVER a block (the copy's
//  voice + hook are already locked upstream; re-scoring an approved hook is pointless).
//  This pure module folds `campaigns/<c>/tier2.json` (written by the Gemini producer)
//  into the validate-plan report: it attaches the structured panel to every evaluated
//  asset and raises a WARN only on a notable signal (low mean or high disagreement), so
//  the review page surfaces the panel without drowning every card in noise.
// ============================================================================

import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { join } from "node:path";

export const TIER2_SCHEMA = 1;

// Compute the warn (or null) + the structured panel for each asset. Pure. The warn
// fires when the mean rating is low OR the personas disagree sharply — the two signals
// worth a human's eye. severity is ALWAYS "warn" by construction → a tier2 entry can
// never block.
export function tier2Violations(tier2, { meanFloor = 3, disagreementCeil = 3 } = {}) {
  const byKey = {};
  if (!tier2 || tier2.ranOk !== true) return { byKey };
  for (const [key, a] of Object.entries(tier2.assets || {})) {
    const mean = typeof a.mean === "number" ? a.mean : null;
    const dis = typeof a.disagreement === "number" ? a.disagreement : null;
    const lowMean = mean != null && mean < meanFloor;
    const split = dis != null && dis >= disagreementCeil;
    const personasStr = (a.personas || []).map((p) => `${p.persona} ${p.score}/5`).join(", ");
    const warn = (lowMean || split)
      ? { rule: "tier2", severity: "warn",
          message: `Tier-2 advisory: mean ${mean ?? "?"}/5, persona spread ${dis ?? "?"} — ${personasStr}`,
          fixHint: "advisory only (a second pair of eyes) — never blocks; review the persona panel if the spread is high" }
      : null;
    byKey[key] = { warn, tier2: { personas: a.personas || [], mean, disagreement: dis } };
  }
  return { byKey };
}

export function tier2Path(campaignDir) {
  return join(campaignDir, "tier2.json");
}

export function writeTier2(campaignDir, doc) {
  const path = tier2Path(campaignDir);
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, JSON.stringify(doc, null, 2) + "\n");
  renameSync(tmp, path);
  return path;
}

// Returns null when absent (Tier-2 never ran — fine, it's advisory); throws only on a
// corrupt file (caller wraps so it can't break the gate).
export function readTier2(campaignDir) {
  const path = tier2Path(campaignDir);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8"));
}

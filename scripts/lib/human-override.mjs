// ============================================================================
//  scripts/lib/human-override.mjs — the master key, taken away (Phase 0)
// ============================================================================
//  The compliance gate (validate-plan.mjs) can be RELAXED two ways, and both used
//  to be quiet, in-band acts the engine could perform by itself:
//    1. dropping a campaigns/<c>/validation.config.json that downgrades a gate
//       (e.g. {"formatMix":"warn"} — the exact move that shipped 1 Batti video of
//       20 and reported "0 failures"), and
//    2. passing run-campaign's --force-unsafe.
//  Either let the engine carry its own key past the bouncer.
//
//  This module moves the unlock OUT OF BAND. A relaxation is honored ONLY when the
//  campaign is GRANDFATHERED (it pre-existed the migration — protecting already
//  shipped work, per the 2026-06-04 plan-2 grandfather) OR a human marker is set in
//  the SHELL ENVIRONMENT for THIS campaign (a deliberate, visible, per-campaign act
//  Cody types — not a file the engine writes during its run).
//
//  Honest bar (NOT "impossible"): an AI with shell+file access to this machine can
//  do anything Cody can, so no gate is 100% un-forgeable. What this achieves — and
//  what stops the Batti pattern — is that the unlock is no longer the EASY, SILENT,
//  ACCIDENTAL path. A non-grandfathered campaign's relax-file is simply ignored;
//  --force-unsafe without the marker is refused. The path of least resistance
//  becomes FIXING the work, which is the whole point.
//
//  Pure decisions are exported and unit-tested (the R0 principle — an enforced fix
//  can't silently regress); the I/O (reading the grandfather list) is a thin shell.
//  NODE-ONLY.
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// The out-of-band marker. Cody sets it in his own terminal, naming the campaign(s)
// he is deliberately unlocking:  AA_HUMAN_OVERRIDE=grind-trap-manteno node ...
// (comma/space-separated for several). A bare "1"/"true" is intentionally NOT a
// blanket unlock — every campaign must be named, so a stale env value can't quietly
// unlock the next run, and "unlock everything" is not a thing you can typo into.
export const OVERRIDE_ENV = "AA_HUMAN_OVERRIDE";

// Migration snapshot of campaigns that existed BEFORE the gate was hardened. Their
// pre-existing relax-files stay honored (we don't retroactively un-protect shipped
// work); only NEW campaigns get the hard, un-downgradable gate.
export const GRANDFATHER_FILE = "grandfathered-campaigns.json";

const normSlug = (s) => String(s || "").trim().toLowerCase();

// Parse the AA_HUMAN_OVERRIDE value into a set of normalized campaign slugs.
// Splits on comma or whitespace; empties dropped. A bare truthy token ("1","true",
// "yes","all","*") yields NO slugs — there is no blanket unlock by design.
export function parseHumanMarkerEnv(val) {
  const out = new Set();
  if (typeof val !== "string") return out;
  for (const tok of val.split(/[\s,]+/)) {
    const t = normSlug(tok);
    if (!t) continue;
    if (t === "1" || t === "true" || t === "yes" || t === "all" || t === "*") continue;
    out.add(t);
  }
  return out;
}

// Is the human marker set, in THIS process's env, for THIS specific campaign?
// `env` is passed in (process.env) so the decision stays pure + testable.
export function humanMarkerPresent(env, campaign) {
  const c = normSlug(campaign);
  if (!c) return false;
  return parseHumanMarkerEnv(env && env[OVERRIDE_ENV]).has(c);
}

// Load the grandfather snapshot. Absent/corrupt → empty set (fail toward STRICTER:
// no list means nothing is grandfathered, so the hard gate applies). Pure shape:
// { campaigns: [slug, ...] }.
export function loadGrandfatherList(dataDir) {
  const path = join(dataDir, GRANDFATHER_FILE);
  if (!existsSync(path)) return new Set();
  try {
    const raw = JSON.parse(readFileSync(path, "utf8"));
    const list = Array.isArray(raw) ? raw : (raw && Array.isArray(raw.campaigns) ? raw.campaigns : []);
    return new Set(list.map(normSlug).filter(Boolean));
  } catch {
    return new Set();
  }
}

export function isGrandfathered(campaign, grandfatherSet) {
  return !!grandfatherSet && grandfatherSet.has(normSlug(campaign));
}

// The single honor decision shared by every relaxation path. A relaxation is
// honored when the campaign is grandfathered OR the human marker names it.
export function overrideHonored({ campaign, grandfatherSet, env } = {}) {
  return isGrandfathered(campaign, grandfatherSet) || humanMarkerPresent(env, campaign);
}

// Comment/metadata keys in a validation.config.json that are NOT enforcement
// relaxations (so they don't count as "ignored" when a file is refused).
const META_KEYS = new Set(["_note", "_comment"]);

// Decide the effective rules given a per-campaign override file. WHOLE-FILE honor:
//   • honored  → merge the override onto the base rules (the legacy behavior).
//   • NOT honored → the file is IGNORED ENTIRELY and the base (hard) rules stand.
// A validation.config.json exists only to RELAX a gate; there is no legitimate
// reason for an un-grandfathered, un-marked campaign to carry one, so refusing the
// whole file (rather than per-key severity arithmetic) is the most fail-closed
// reading — it also closes the side-door of relaxing a NON-severity gate (emptying
// bannedWords, flipping voice.noExclamation, etc.). Pure.
// Returns { rules, honored, ignoredKeys }.
export function applyCampaignOverride({ baseRules, override, honored }) {
  if (!override || typeof override !== "object") {
    return { rules: baseRules, honored: !!honored, ignoredKeys: [] };
  }
  const keys = Object.keys(override).filter((k) => !META_KEYS.has(k));
  if (honored) {
    const merged = {
      ...baseRules, ...override,
      voice: { ...(baseRules.voice || {}), ...(override.voice || {}) },
      beatRoles: { ...(baseRules.beatRoles || {}), ...(override.beatRoles || {}) },
      _source: `${baseRules._source} + campaign override`,
    };
    return { rules: merged, honored: true, ignoredKeys: [] };
  }
  return { rules: baseRules, honored: false, ignoredKeys: keys };
}

// --force-unsafe is honored only with the out-of-band marker for this campaign.
// (Grandfather alone does NOT enable --force-unsafe: grandfather relaxes a campaign
// to its pre-existing severities, but blasting past ALL blocking violations is a
// stronger, deliberate act that always demands the human marker.)
export function forceUnsafeAllowed({ env, campaign } = {}) {
  return humanMarkerPresent(env, campaign);
}

// Repurpose inheritance: a 1:1 clone of an ALREADY-grandfathered source is itself
// grandfathered (it carries the same already-approved content + the same inherited,
// non-introduced blocks). This appends `destCampaign` to the grandfather list ONLY
// when `sourceCampaign` is already grandfathered — it can never GRANT new grandfather
// to a fresh source, so it can't be used to launder a non-compliant campaign past the
// gate. Idempotent. Returns { inherited:boolean, reason }.
export function inheritGrandfather({ dataDir, sourceCampaign, destCampaign }) {
  const set = loadGrandfatherList(dataDir);
  if (!isGrandfathered(sourceCampaign, set)) {
    return { inherited: false, reason: `source "${sourceCampaign}" is not grandfathered — dest must pass the hard gate on its own` };
  }
  const dest = normSlug(destCampaign);
  if (!dest) return { inherited: false, reason: "no dest campaign" };
  if (set.has(dest)) return { inherited: true, reason: "already grandfathered (no change)" };
  const path = join(dataDir, GRANDFATHER_FILE);
  let doc = { campaigns: [] };
  if (existsSync(path)) {
    try {
      const raw = JSON.parse(readFileSync(path, "utf8"));
      doc = (raw && typeof raw === "object" && !Array.isArray(raw)) ? raw : { campaigns: Array.isArray(raw) ? raw : [] };
    } catch { doc = { campaigns: [] }; }
  }
  if (!Array.isArray(doc.campaigns)) doc.campaigns = [];
  doc.campaigns.push(destCampaign);
  writeFileSync(path, JSON.stringify(doc, null, 2) + "\n");
  return { inherited: true, reason: `inherited grandfather from source "${sourceCampaign}"` };
}

// ============================================================================
//  scripts/lib/uniqueness.mjs — the variety/uniqueness check (pure, testable)
// ============================================================================
//  Within each angle, every creative should be a DISTINCT design + a unique source
//  clip/image. This is the pure core (no throw/log) so it can be unit-tested;
//  run-campaign's `validateUniqueness` wraps it to throw (strict, cap===1) or warn.
//
//  Keys the repetition cap on:
//   • `asset.template`   — legacy bank skeletons (cluster-*).
//   • `asset.exampleId`  — GENERATED creatives, by the example they were built from.
//   • `asset.archetype`  — GENERATED creatives, by visual archetype (cluster variety).
//  The example/archetype keys are ADDITIVE: only generate-world assets carry those
//  fields, so legacy template campaigns are unaffected (no retroactive break).
//  Media reuse (same clip/photo) is always a problem (distinct media per creative).
//
//  `repetitionCap` (plan.knobs, default 3) is the cap; cap===1 = strict (caller
//  throws). Pure — returns { cap, strict, problems:[string] }. NODE-agnostic.
// ============================================================================

const push = (map, k, v) => { if (!map.has(k)) map.set(k, []); map.get(k).push(v); };

// The per-angle media-reuse half, shared so uniquenessProblems (which warns/throws)
// and validate-plan's mediaFit gate (which BLOCKS for generate-world) compute it the
// SAME way. Returns [{ media, ids:[assetId] }] in asset order. A clip/photo reused
// within an angle is always a problem (distinct media per creative; same-clip reuse
// is the #1 perceptual-collapse driver — docs/media-integration-findings.md #4).
function angleMediaReuse(angle) {
  const mediaMap = new Map();
  for (const a of (angle && angle.assets) || []) {
    if (!a) continue;
    const m = a.media || a.clip || a.photo;
    if (m) push(mediaMap, m, a.id);
  }
  const out = [];
  for (const [media, ids] of mediaMap) if (ids.length > 1) out.push({ media, ids });
  return out;
}

// Campaign-wide media reuse, keyed by angle. Consumed by validate-plan's mediaFit
// block. Returns [{ angleId, media, ids }].
export function mediaReuseProblems(plan) {
  const out = [];
  for (const angle of (plan && plan.angles) || []) {
    for (const { media, ids } of angleMediaReuse(angle)) out.push({ angleId: angle.id, media, ids });
  }
  return out;
}

export function uniquenessProblems(plan) {
  const cap = (plan && plan.knobs && plan.knobs.repetitionCap) || 3;
  const problems = [];
  for (const angle of (plan && plan.angles) || []) {
    const assets = angle.assets || [];
    const tplMap = new Map(), exMap = new Map(), archMap = new Map();
    for (const a of assets) {
      if (!a) continue;
      if (a.template) push(tplMap, a.template, a.id);
      if (a.exampleId) push(exMap, a.exampleId, a.id);
      if (a.archetype) push(archMap, a.archetype, a.id);
    }
    // media reuse first (same per-angle order + string as before — byte-identical)
    for (const { media, ids } of angleMediaReuse(angle)) problems.push(`[${angle.id}] media "${media}" reused by ${ids.join(", ")}`);
    for (const [tpl, ids] of tplMap) if (ids.length > cap) problems.push(`[${angle.id}] template "${tpl}" used ${ids.length}× (cap ${cap}) by ${ids.join(", ")}`);
    for (const [ex, ids] of exMap) if (ids.length > cap) problems.push(`[${angle.id}] example "${ex}" used ${ids.length}× (cap ${cap}) by ${ids.join(", ")}`);
    for (const [arch, ids] of archMap) if (ids.length > cap) problems.push(`[${angle.id}] archetype "${arch}" used ${ids.length}× (cap ${cap}) by ${ids.join(", ")}`);
  }
  return { cap, strict: cap === 1, problems };
}

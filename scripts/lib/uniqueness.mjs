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

export function uniquenessProblems(plan) {
  const cap = (plan && plan.knobs && plan.knobs.repetitionCap) || 3;
  const push = (map, k, v) => { if (!map.has(k)) map.set(k, []); map.get(k).push(v); };
  const problems = [];
  for (const angle of (plan && plan.angles) || []) {
    const assets = angle.assets || [];
    const mediaMap = new Map(), tplMap = new Map(), exMap = new Map(), archMap = new Map();
    for (const a of assets) {
      if (!a) continue;
      const m = a.media || a.clip || a.photo;
      if (m) push(mediaMap, m, a.id);
      if (a.template) push(tplMap, a.template, a.id);
      if (a.exampleId) push(exMap, a.exampleId, a.id);
      if (a.archetype) push(archMap, a.archetype, a.id);
    }
    for (const [m, ids] of mediaMap) if (ids.length > 1) problems.push(`[${angle.id}] media "${m}" reused by ${ids.join(", ")}`);
    for (const [tpl, ids] of tplMap) if (ids.length > cap) problems.push(`[${angle.id}] template "${tpl}" used ${ids.length}× (cap ${cap}) by ${ids.join(", ")}`);
    for (const [ex, ids] of exMap) if (ids.length > cap) problems.push(`[${angle.id}] example "${ex}" used ${ids.length}× (cap ${cap}) by ${ids.join(", ")}`);
    for (const [arch, ids] of archMap) if (ids.length > cap) problems.push(`[${angle.id}] archetype "${arch}" used ${ids.length}× (cap ${cap}) by ${ids.join(", ")}`);
  }
  return { cap, strict: cap === 1, problems };
}

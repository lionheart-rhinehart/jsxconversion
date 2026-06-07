// ============================================================================
//  scripts/lib/example-select.mjs — pick the best-fit example WITHIN an archetype
// ============================================================================
//  The generation engine's selection step (Track A, generation-engine thin slice).
//  The PLANNER assigns each fresh creative an `archetype` (the per-creative
//  pre-assignment); THIS module fits an actual EXAMPLE (by id) to that archetype +
//  the creative's copy shape. It never CHOOSES the archetype — that's the planner's.
//
//  Why it reuses buildRefPools: the fit check must agree with how `fill` actually
//  lays copy into slots. `buildRefPools` (copy-resolve) applies `splitHook` + the
//  copychief ladder, so the role distribution + per-role lengths it returns are the
//  SAME ones fill will produce. A naive `maxChars` check (without the split) would
//  over-reject copy the ladder would happily fit → a false "no fitting example."
//
//  Pure, never throws; returns the pick or null (no fit → the caller FLAGS + STOPS,
//  never forces a mismatch). NODE-ONLY (copy-resolve is Node-only).
// ============================================================================

import { loadExampleIndex } from "./example-library.mjs";
import { buildRefPools } from "./copy-resolve.mjs";

// The roles the asset's bound copy actually fills + the longest text per role —
// computed the SAME way fill does (buildRefPools → splitHook/ladder). Returns
// { roles:[role], roleLen:{role:maxLen} }. No bound copy → empty (fits anything).
export function assetCopyShape(asset, library, tierTags = {}) {
  const res = buildRefPools(asset, { library, tierTags });
  const pools = (res && res.pools) || {};
  const roles = Object.keys(pools);
  const roleLen = {};
  for (const r of roles) roleLen[r] = Math.max(0, ...pools[r].map((t) => String(t).length));
  return { roles, roleLen };
}

// Does an example's slotShape accommodate the copy shape? Superset of roles AND
// per-role maxChars fits (a null/absent maxChars = unknown capacity = fits).
function fits(slotShape, shape) {
  if (!slotShape || !Array.isArray(slotShape.slots)) return false;
  const slotByRole = {};
  for (const s of slotShape.slots) if (s && !(s.role in slotByRole)) slotByRole[s.role] = s;
  for (const role of shape.roles) {
    const slot = slotByRole[role];
    if (!slot) return false; // example exposes no slot for this role
    if (slot.maxChars != null && shape.roleLen[role] > slot.maxChars) return false;
  }
  return true;
}

// Lower nearest-neighbor cosine = more perceptually distinct = a better tie-break.
function nnCosine(e) {
  const c = e && e.clusterMetrics && e.clusterMetrics.nearestNeighbor && e.clusterMetrics.nearestNeighbor.cosine;
  return typeof c === "number" ? c : 1;
}

// Pick the best-fit example for an ASSIGNED archetype + format + the asset's copy
// shape. `usedExampleIds` is the variety nudge (prefer one not already used in this
// batch). Returns { exampleId, archetype, sourcePath, renderedImagePath } or null.
export function selectExample(
  { archetype, asset, library, format = "static", tierTags = {}, usedExampleIds = [] } = {},
  index,
) {
  const idx = index || loadExampleIndex();
  const examples = (idx && idx.examples) || {};
  const used = new Set(usedExampleIds);
  const shape = assetCopyShape(asset, library, tierTags);

  const candidates = Object.entries(examples).filter(
    ([, e]) => e && e.archetype === archetype && e.format === format && fits(e.slotShape, shape),
  );
  if (!candidates.length) return null;

  candidates.sort(([ia, ea], [ib, eb]) => {
    const ua = used.has(ia) ? 1 : 0, ub = used.has(ib) ? 1 : 0;
    if (ua !== ub) return ua - ub;            // prefer a not-yet-used example
    const d = nnCosine(ea) - nnCosine(eb);
    if (d !== 0) return d;                     // then the more-distinct one
    return ia.localeCompare(ib);               // stable final tie-break
  });

  const [exampleId, e] = candidates[0];
  return {
    exampleId,
    archetype: e.archetype,
    sourcePath: e.sourcePath || null,
    renderedImagePath: e.renderedImagePath,
  };
}

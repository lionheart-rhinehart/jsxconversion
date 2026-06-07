// ============================================================================
//  test/example-select.test.mjs — the generation engine's example selector
// ============================================================================
//  selectExample fits an EXAMPLE (by id) to an ASSIGNED archetype + the creative's
//  copy shape. It must: stay within the given archetype, honor format, fit via the
//  SAME ladder fill uses (so selection-fit == fill-fit), prefer not-yet-used, and
//  return null (never a mismatch) when nothing fits. Pure logic; fake index + lib.
//  Run: `npm test`.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { selectExample, assetCopyShape } from "../scripts/lib/example-select.mjs";

// A fake example index (the shape loadExampleIndex returns).
const INDEX = {
  examples: {
    "ex-001-giant-stat": {
      archetype: "giant-stat", format: "static",
      slotShape: { slots: [
        { id: "label", role: "kicker", maxChars: 20, required: false },
        { id: "stat", role: "stat", maxChars: 8, required: true },
        { id: "sub", role: "claim", maxChars: 28, required: false },
      ] },
      renderedImagePath: "templates/_examples/ex-001-giant-stat.png",
      sourcePath: "templates/_examples/ex-001-giant-stat.jsx",
      clusterMetrics: { nearestNeighbor: { exampleId: "ex-007", cosine: 0.61 } },
    },
    "ex-002-giant-stat": {
      archetype: "giant-stat", format: "static",
      slotShape: { slots: [
        { id: "label", role: "kicker", maxChars: 20, required: false },
        { id: "stat", role: "stat", maxChars: 24, required: true },
        { id: "sub", role: "claim", maxChars: 40, required: false },
      ] },
      renderedImagePath: "templates/_examples/ex-002-giant-stat.png",
      clusterMetrics: { nearestNeighbor: { cosine: 0.40 } }, // more distinct → wins tie
    },
    "ex-010-action-hero": {
      archetype: "action-hero", format: "static",
      slotShape: { slots: [{ id: "headline", role: "hook", maxChars: 40, required: true }] },
      renderedImagePath: "templates/_examples/ex-010-action-hero.png",
      clusterMetrics: { nearestNeighbor: { cosine: 0.5 } },
    },
    "ex-046-metric-reveal": {
      archetype: "metric-reveal", format: "video",
      slotShape: { slots: [{ id: "stat", role: "stat", maxChars: null, required: true }] },
      renderedImagePath: "templates/_examples/ex-046-metric-reveal.png",
      motionPath: "templates/_examples/ex-046-metric-reveal.mp4",
      clusterMetrics: {},
    },
  },
};

// A fake copy-library (the shape buildRefPools/resolveCopyRef reads).
const LIB = { byId: {
  "x.statShort": { id: "x.statShort", text: '+4"' },                    // len 3
  "x.statLong":  { id: "x.statLong",  text: "+4.2 inches vertical jump" }, // len 25 > 8, fits 24? 25>24 → only via null
  "x.statMid":   { id: "x.statMid",   text: "+4.2 inches vert" },        // len 16: >8, <=24
  "x.claim":     { id: "x.claim",     text: "Foundational program" },    // len 20
  "x.hook":      { id: "x.hook",      text: "Getting faster or just tired" }, // len 28, single clause
}, units: [] };

const A = (copyRefs, extra = {}) => ({ id: "A1", ...extra, copyRefs });

// ── copy shape (ladder-aware via buildRefPools) ──────────────────────────────
test("assetCopyShape computes filled roles + per-role max length", () => {
  const shape = assetCopyShape(A({ stat: "x.statMid", claim: "x.claim" }), LIB);
  assert.deepEqual(shape.roles.sort(), ["claim", "stat"]);
  assert.equal(shape.roleLen.stat, 16);
  assert.equal(shape.roleLen.claim, 20);
});

// ── archetype + format filter, distinctness tie-break ────────────────────────
test("selects within the assigned archetype + format; tie-break = more distinct", () => {
  const pick = selectExample({ archetype: "giant-stat", asset: A({ stat: "x.statShort" }), library: LIB, format: "static" }, INDEX);
  assert.equal(pick.archetype, "giant-stat");
  assert.equal(pick.exampleId, "ex-002-giant-stat"); // both fit; ex-002 nn 0.40 < ex-001 0.61
  assert.equal(pick.renderedImagePath, "templates/_examples/ex-002-giant-stat.png");
});

// ── ladder-aware maxChars: reject too-small slot, pick the accommodating one ──
test("maxChars fit is enforced (reject ex-001 stat:8 for a 16-char stat)", () => {
  const pick = selectExample({ archetype: "giant-stat", asset: A({ stat: "x.statMid" }), library: LIB, format: "static" }, INDEX);
  assert.equal(pick.exampleId, "ex-002-giant-stat"); // 16>8 rejects ex-001; 16<=24 fits ex-002
});

// ── superset-of-roles: an example missing a needed role does NOT fit → null ───
test("an example without a slot for a filled role is not a fit (null)", () => {
  // action-hero example exposes only `hook`; the asset fills `stat` → no fit.
  const pick = selectExample({ archetype: "action-hero", asset: A({ stat: "x.statShort" }), library: LIB, format: "static" }, INDEX);
  assert.equal(pick, null);
});

// ── used-id variety nudge ─────────────────────────────────────────────────────
test("prefers a not-yet-used example", () => {
  const pick = selectExample(
    { archetype: "giant-stat", asset: A({ stat: "x.statShort" }), library: LIB, format: "static", usedExampleIds: ["ex-002-giant-stat"] },
    INDEX,
  );
  assert.equal(pick.exampleId, "ex-001-giant-stat"); // ex-002 used → fall to ex-001
});

// ── null when no example fits / archetype absent / wrong format ───────────────
test("null when the archetype has no example", () => {
  assert.equal(selectExample({ archetype: "versus", asset: A({ stat: "x.statShort" }), library: LIB, format: "static" }, INDEX), null);
});

test("format filter: a video example is not picked for static, and vice-versa", () => {
  assert.equal(selectExample({ archetype: "metric-reveal", asset: A({ stat: "x.statShort" }), library: LIB, format: "static" }, INDEX), null);
  const v = selectExample({ archetype: "metric-reveal", asset: A({ stat: "x.statLong" }), library: LIB, format: "video" }, INDEX);
  assert.equal(v.exampleId, "ex-046-metric-reveal"); // maxChars null = fits any length
});

test("null when copy is too long for every example in the archetype", () => {
  // statLong is 25 chars: ex-001 stat 8 and ex-002 stat 24 both reject → null.
  assert.equal(selectExample({ archetype: "giant-stat", asset: A({ stat: "x.statLong" }), library: LIB, format: "static" }, INDEX), null);
});

// ── archetype is an INPUT (selector never crosses archetypes) ─────────────────
test("selector fits WITHIN the given archetype, never substitutes another", () => {
  // Even though giant-stat could hold this stat, asking for action-hero yields null
  // (action-hero has no stat slot) — the selector does not fall back to giant-stat.
  const pick = selectExample({ archetype: "action-hero", asset: A({ stat: "x.statShort" }), library: LIB, format: "static" }, INDEX);
  assert.equal(pick, null);
});

// ── hookRef path (proves the splitHook/ladder route is exercised) ────────────
test("a hookRef asset resolves its shape via splitHook and fits by role", () => {
  const pick = selectExample(
    { archetype: "action-hero", asset: { id: "A1", beat: "A — Stop the scroll", hookRef: "x.hook" }, library: LIB, format: "static" },
    INDEX,
  );
  assert.equal(pick.exampleId, "ex-010-action-hero"); // hook(28) fits the 40-char hook slot
});

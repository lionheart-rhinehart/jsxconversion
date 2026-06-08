// ============================================================================
//  test/bind-examples.test.mjs — the code-driven selection step (T1.1a)
// ============================================================================
//  Locks bindPlanExamples: deterministic exampleId stamping, variety threading,
//  null on no-fit / no-archetype, idempotence, non-mutation. This is the producer;
//  validate-plan's exampleBindingAuthentic re-derives + enforces it.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { bindPlanExamples } from "../scripts/lib/bind-examples.mjs";

// Fake index: two giant-stat examples (ex-002 more distinct → wins an open tie),
// one action-hero, one video metric-reveal.
const INDEX = {
  examples: {
    "ex-001-giant-stat": {
      archetype: "giant-stat", format: "static",
      slotShape: { slots: [{ id: "stat", role: "stat", maxChars: 24, required: true }] },
      renderedImagePath: "templates/_examples/ex-001-giant-stat.png",
      clusterMetrics: { nearestNeighbor: { cosine: 0.61 } },
    },
    "ex-002-giant-stat": {
      archetype: "giant-stat", format: "static",
      slotShape: { slots: [{ id: "stat", role: "stat", maxChars: 24, required: true }] },
      renderedImagePath: "templates/_examples/ex-002-giant-stat.png",
      clusterMetrics: { nearestNeighbor: { cosine: 0.40 } }, // more distinct → wins tie
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

const LIB = { byId: { "x.stat": { id: "x.stat", text: '+4"' } }, units: [] };

const fresh = (id, archetype, extra = {}) => ({ id, source: "fresh", archetype, copyRefs: { stat: "x.stat" }, ...extra });
const planOf = (...assets) => ({ angles: [{ id: "ang-1", assets }] });

test("binds a fresh asset to the deterministically-selected example", () => {
  const { plan, report } = bindPlanExamples(planOf(fresh("A1", "giant-stat")), { library: LIB, index: INDEX });
  assert.equal(plan.angles[0].assets[0].exampleId, "ex-002-giant-stat"); // more distinct wins the open tie
  assert.equal(report.bound.length, 1);
  assert.equal(report.nulls.length, 0);
});

test("variety: a second same-archetype asset gets the not-yet-used example", () => {
  const { plan } = bindPlanExamples(planOf(fresh("A1", "giant-stat"), fresh("A2", "giant-stat")), { library: LIB, index: INDEX });
  assert.equal(plan.angles[0].assets[0].exampleId, "ex-002-giant-stat");
  assert.equal(plan.angles[0].assets[1].exampleId, "ex-001-giant-stat"); // ex-002 used → prefer the other
});

test("no fitting example for the archetype → a null row, no stamp", () => {
  const { plan, report } = bindPlanExamples(planOf(fresh("A1", "versus")), { library: LIB, index: INDEX });
  assert.equal(plan.angles[0].assets[0].exampleId, undefined);
  assert.equal(report.nulls.length, 1);
  assert.match(report.nulls[0].reason, /no fitting example/);
});

test("no archetype assigned → a null row with that reason", () => {
  const asset = { id: "A1", source: "fresh", copyRefs: { stat: "x.stat" } };
  const { report } = bindPlanExamples(planOf(asset), { library: LIB, index: INDEX });
  assert.equal(report.nulls.length, 1);
  assert.match(report.nulls[0].reason, /no archetype/);
});

test("gif folds to video for selection; the null reason says so", () => {
  const { report } = bindPlanExamples(planOf(fresh("A1", "giant-stat", { format: "gif" })), { library: LIB, index: INDEX });
  // giant-stat has only static examples → gif→video finds nothing
  assert.equal(report.nulls.length, 1);
  assert.match(report.nulls[0].reason, /gif→video/);
});

test("idempotence: re-binding the stamped plan yields identical stamps", () => {
  const r1 = bindPlanExamples(planOf(fresh("A1", "giant-stat"), fresh("A2", "giant-stat")), { library: LIB, index: INDEX });
  const r2 = bindPlanExamples(r1.plan, { library: LIB, index: INDEX });
  assert.deepEqual(
    r2.plan.angles[0].assets.map((a) => a.exampleId),
    r1.plan.angles[0].assets.map((a) => a.exampleId),
  );
});

test("non-fresh assets are untouched; input plan is not mutated", () => {
  const input = planOf(fresh("A1", "giant-stat"), { id: "A2", source: "template", template: "cluster-3" });
  const { plan } = bindPlanExamples(input, { library: LIB, index: INDEX });
  assert.equal(plan.angles[0].assets[1].exampleId, undefined); // template asset untouched
  assert.equal(input.angles[0].assets[0].exampleId, undefined); // input not mutated
});

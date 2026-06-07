// ============================================================================
//  test/uniqueness.test.mjs — the variety check (G4: archetype/example re-key)
// ============================================================================
//  Pure core of run-campaign's validateUniqueness. Confirms the cap is keyed on
//  example/archetype for generated creatives (the slice's distinct-archetype
//  enforcement) while legacy template campaigns are unaffected. Run: `npm test`.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { uniquenessProblems } from "../scripts/lib/uniqueness.mjs";

const plan = (assets, knobs) => ({ knobs, angles: [{ id: "a", assets }] });

test("cap===1 is strict; two same-archetype generated creatives are a problem", () => {
  const r = uniquenessProblems(plan([
    { id: "F1", source: "fresh", exampleId: "ex-001-giant-stat", archetype: "giant-stat" },
    { id: "F2", source: "fresh", exampleId: "ex-002-other", archetype: "giant-stat" },
  ], { repetitionCap: 1 }));
  assert.equal(r.strict, true);
  assert.ok(r.problems.some((p) => /archetype "giant-stat" used 2×/.test(p)), r.problems.join("\n"));
});

test("two creatives reusing the SAME example flag at cap:1", () => {
  const r = uniquenessProblems(plan([
    { id: "F1", source: "fresh", exampleId: "ex-001-giant-stat", archetype: "giant-stat" },
    { id: "F2", source: "fresh", exampleId: "ex-001-giant-stat", archetype: "giant-stat" },
  ], { repetitionCap: 1 }));
  assert.ok(r.problems.some((p) => /example "ex-001-giant-stat" used 2×/.test(p)));
});

test("distinct archetypes + examples + media at cap:1 ⇒ no problems", () => {
  const r = uniquenessProblems(plan([
    { id: "F1", source: "fresh", exampleId: "ex-001-giant-stat", archetype: "giant-stat", media: "a.jpg" },
    { id: "F2", source: "fresh", exampleId: "ex-010-action-hero", archetype: "action-hero", media: "b.jpg" },
  ], { repetitionCap: 1 }));
  assert.deepEqual(r.problems, []);
});

test("media reuse is always a problem (any cap)", () => {
  const r = uniquenessProblems(plan([
    { id: "F1", media: "same.jpg", template: "cluster-1" },
    { id: "F2", media: "same.jpg", template: "cluster-2" },
  ], {}));
  assert.ok(r.problems.some((p) => /media "same.jpg" reused/.test(p)));
});

test("legacy template campaign (no example/archetype) unaffected; default cap 3", () => {
  const ok = uniquenessProblems(plan([
    { id: "T1", template: "cluster-30", media: "1.jpg" },
    { id: "T2", template: "cluster-30", media: "2.jpg" },
    { id: "T3", template: "cluster-30", media: "3.jpg" },
  ], {}));
  assert.deepEqual(ok.problems, []);
  assert.equal(ok.strict, false);
  const over = uniquenessProblems(plan([
    { id: "T1", template: "cluster-30", media: "1.jpg" },
    { id: "T2", template: "cluster-30", media: "2.jpg" },
    { id: "T3", template: "cluster-30", media: "3.jpg" },
    { id: "T4", template: "cluster-30", media: "4.jpg" },
  ], {}));
  assert.ok(over.problems.some((p) => /template "cluster-30" used 4×/.test(p)));
});

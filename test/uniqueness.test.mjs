// ============================================================================
//  test/uniqueness.test.mjs — the variety check (G4: archetype/example re-key)
// ============================================================================
//  Pure core of run-campaign's validateUniqueness. Confirms the cap is keyed on
//  example/archetype for generated creatives (the slice's distinct-archetype
//  enforcement) while legacy template campaigns are unaffected. Run: `npm test`.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { uniquenessProblems, mediaReuseProblems } from "../scripts/lib/uniqueness.mjs";

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

// ── T1.3 [U5]: extracting mediaReuseProblems left uniquenessProblems byte-identical ──
test("uniquenessProblems output order is unchanged after the mediaReuseProblems extraction", () => {
  // media reuse + a template cap-over in one angle: media must come FIRST, then template
  const r = uniquenessProblems(plan([
    { id: "F1", template: "cluster-1", media: "same.jpg" },
    { id: "F2", template: "cluster-1", media: "same.jpg" },
    { id: "F3", template: "cluster-1", media: "diff.jpg" },
    { id: "F4", template: "cluster-1", media: "diff2.jpg" },
  ], { repetitionCap: 3 }));
  assert.deepEqual(r.problems, [
    '[a] media "same.jpg" reused by F1, F2',
    '[a] template "cluster-1" used 4× (cap 3) by F1, F2, F3, F4',
  ]);
});

test("T1.3: mediaReuseProblems returns the structured media-reuse list", () => {
  const r = mediaReuseProblems(plan([
    { id: "F1", clip: "x.mp4" }, { id: "F2", clip: "x.mp4" }, { id: "F3", photo: "y.jpg" },
  ], {}));
  assert.deepEqual(r, [{ angleId: "a", media: "x.mp4", ids: ["F1", "F2"] }]);
});

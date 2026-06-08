// ============================================================================
//  test/example-contract.test.mjs — locks the Track-A ∥ Track-B contract
// ============================================================================
//  The example-index schema, the example-id convention, and the rendered-image
//  storage path are the ONE seam between the engine (Track A) and the example
//  library (Track B). If either side drifts from the other, integration breaks.
//  These tests pin the contract so a drift fails CI, not a campaign. Pure logic +
//  one read of the on-disk index. Run: `npm test`.
//
//  Vocabulary: ARCHETYPE = the category (subject × composition); CLUSTER = the
//  embedding-space grouping its examples form (clusterMetrics).
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ARCHETYPES, isArchetype, MEDIA_STYLE_TAGS, isMediaStyleTag, ARCHETYPE_SPECS, FORMATS,
  MOTION_ARCHETYPES, isMotionArchetype, MOTION_ARCHETYPE_SPECS, isAnyArchetype, specFor,
  EXAMPLE_ID_RE, isExampleId, slugify, makeExampleId,
  EXAMPLES_DIR, INDEX_PATH, exampleImagePath, exampleMotionPath, exampleSourcePaths,
  emptyIndex, loadExampleIndex, validateExampleEntry, validateExampleIndex,
  archetypeForExample, exampleHasMedia, mediaOptionalForArchetype,
} from "../scripts/lib/example-library.mjs";

const REPO = join(import.meta.dirname, "..");

// A fully-conformant entry (deep-cloned per test so mutations don't bleed).
function goodEntry(id = "ex-001-coach-to-camera-gym") {
  return {
    archetype: "split-panel",
    format: "video",
    mediaStyleAccepts: ["production:cinematic", "subject:coach-face"],
    slotShape: {
      slots: [
        { id: "eyebrow", role: "eyebrow", maxChars: 24, required: true },
        { id: "headline", role: "hook", maxChars: 48, required: true },
        { id: "cta", role: "cta", maxChars: 20, required: false },
      ],
      roleSet: ["eyebrow", "hook", "cta"],
    },
    renderedImagePath: exampleImagePath(id),
    motionPath: exampleMotionPath(id),
    clusterMetrics: {
      subLook: "gym-warm",
      labeledBy: "gemini-2.x",
      labeledAt: "2026-06-06T00:00:00.000Z",
      intraArchetypeMaxCosine: 0.61,
      silhouette: 0.42,
      nearestNeighbor: { exampleId: "ex-002-coach-to-camera-field", cosine: 0.58 },
    },
  };
}
const clone = (o) => JSON.parse(JSON.stringify(o));

// ── id convention ──────────────────────────────────────────────────────────
test("example-id convention: accepts conformant ids, rejects drift", () => {
  for (const ok of ["ex-001-x", "ex-014-giant-pr-number", "ex-123-coach-to-camera-gym"]) {
    assert.ok(isExampleId(ok), `${ok} should be valid`);
    assert.ok(EXAMPLE_ID_RE.test(ok));
  }
  for (const bad of [
    "ex-1-x",                  // seq < 3 digits
    "EX-001-x",                // uppercase prefix
    "cluster-12",              // legacy template id (must not collide)
    "fresh-batti-grind-trap",  // legacy fresh id
    "ex-001-",                 // empty slug
    "ex-001-Cap",              // uppercase in slug
    "ex-001-a_b",              // underscore not allowed
    "ex--x", "ex-001--x", "",
  ]) {
    assert.ok(!isExampleId(bad), `${bad} should be invalid`);
  }
});

test("makeExampleId pads seq, slugifies label, namespaces with ex-", () => {
  assert.equal(makeExampleId(1, "Coach → Camera (gym)"), "ex-001-coach-camera-gym");
  assert.equal(makeExampleId(14, "Giant PR number"), "ex-014-giant-pr-number");
  assert.ok(isExampleId(makeExampleId(7, "anything goes 123")));
  assert.throws(() => makeExampleId(3, "!!!"), /empty slug/);
  assert.throws(() => makeExampleId(-1, "x"), /bad seq/);
  assert.equal(slugify("A--b  C"), "a-b-c");
});

// ── storage paths ────────────────────────────────────────────────────────────
test("storage paths are fixed, repo-root-relative, forward-slashed", () => {
  assert.equal(INDEX_PATH, "templates/_example-index.json");
  assert.equal(EXAMPLES_DIR, "templates/_examples");
  assert.equal(exampleImagePath("ex-009-foo"), "templates/_examples/ex-009-foo.png");
  assert.equal(exampleMotionPath("ex-009-foo"), "templates/_examples/ex-009-foo.mp4");
  const s = exampleSourcePaths("ex-009-foo");
  assert.equal(s.jsx, "templates/_examples/ex-009-foo.jsx");
  assert.equal(s.config, "templates/_examples/ex-009-foo.config.json");
  for (const p of [exampleImagePath("x"), exampleMotionPath("x"), s.jsx, s.config]) {
    assert.ok(!p.includes("\\"), "no backslashes in contract paths");
  }
});

// ── enums ────────────────────────────────────────────────────────────────────
test("ARCHETYPES / MEDIA tags are closed and self-consistent with ARCHETYPE_SPECS", () => {
  assert.equal(ARCHETYPES.length, 15);
  assert.ok(isArchetype("giant-stat") && !isArchetype("nope"));
  assert.ok(isMediaStyleTag("subject:athlete-face") && !isMediaStyleTag("subject:robot"));
  // every ARCHETYPE has a spec; every spec key is an ARCHETYPE
  for (const a of ARCHETYPES) assert.ok(ARCHETYPE_SPECS[a], `ARCHETYPE_SPECS missing ${a}`);
  for (const a of Object.keys(ARCHETYPE_SPECS)) assert.ok(isArchetype(a), `ARCHETYPE_SPECS has unknown archetype ${a}`);
  // every spec's formats ⊆ FORMATS; every allowed media tag is a known tag
  for (const [a, spec] of Object.entries(ARCHETYPE_SPECS)) {
    for (const f of spec.formats) assert.ok(FORMATS.includes(f), `${a} bad format ${f}`);
    for (const t of spec.mediaStyleAllowed) assert.ok(isMediaStyleTag(t), `${a} bad media tag ${t}`);
    assert.equal(typeof spec.mediaOptional, "boolean");
  }
});

test("MOTION_ARCHETYPES is a SEPARATE closed vocabulary (Option 2 isolation)", () => {
  assert.equal(MOTION_ARCHETYPES.length, 16);
  // motion + static vocabularies are DISJOINT (no name collides)
  for (const m of MOTION_ARCHETYPES) assert.ok(!isArchetype(m), `motion "${m}" must not be a static ARCHETYPE`);
  for (const s of ARCHETYPES) assert.ok(!isMotionArchetype(s), `static "${s}" must not be a MOTION_ARCHETYPE`);
  // isMotionArchetype is closed; isArchetype stays STATIC-ONLY (the engine isolation)
  assert.ok(isMotionArchetype("count-up-stats") && !isMotionArchetype("nope"));
  assert.ok(!isArchetype("count-up-stats"), "engine's isArchetype must NOT see motion archetypes");
  // the UNION accepts both; specFor resolves both
  assert.ok(isAnyArchetype("count-up-stats") && isAnyArchetype("giant-stat") && !isAnyArchetype("nope"));
  // every motion archetype has a spec; every spec key is a motion archetype; all video-only
  for (const a of MOTION_ARCHETYPES) {
    assert.ok(MOTION_ARCHETYPE_SPECS[a], `MOTION_ARCHETYPE_SPECS missing ${a}`);
    assert.deepEqual(specFor(a).formats, ["video"], `${a} must be video-only`);
  }
  for (const a of Object.keys(MOTION_ARCHETYPE_SPECS)) assert.ok(isMotionArchetype(a), `unknown motion archetype ${a}`);
});

test("a motion-archetype video entry validates clean", () => {
  const id = "ex-070-count-up-stats";
  const entry = {
    archetype: "count-up-stats",
    format: "video",
    mediaStyleAccepts: [],
    slotShape: { slots: [{ id: "stat", role: "stat", maxChars: null, required: true }], roleSet: ["stat"] },
    renderedImagePath: exampleImagePath(id),
    motionPath: exampleMotionPath(id),
    clusterMetrics: { subLook: null, labeledBy: "gemini-2.x", labeledAt: "2026-06-07T00:00:00.000Z" },
  };
  const { errors } = validateExampleEntry(id, entry);
  assert.deepEqual(errors, [], errors.join("\n"));
});

// ── entry validation: the good case ──────────────────────────────────────────
test("a conformant entry validates clean (no errors)", () => {
  const id = "ex-001-coach-to-camera-gym";
  const { errors } = validateExampleEntry(id, goodEntry(id));
  assert.deepEqual(errors, [], errors.join("\n"));
});

// ── entry validation: each failure mode blocks ───────────────────────────────
test("unknown archetype is an error", () => {
  const e = clone(goodEntry()); e.archetype = "talking-head";
  assert.ok(validateExampleEntry("ex-001-x", e).errors.some((m) => /not a known ARCHETYPE/.test(m)));
});

test("format not allowed for the archetype is an error", () => {
  const e = clone(goodEntry()); e.archetype = "versus"; // static-only
  e.format = "video";
  e.mediaStyleAccepts = []; // versus allows []
  assert.ok(validateExampleEntry("ex-001-x", e).errors.some((m) => /not allowed for archetype/.test(m)));
});

test("a media tag outside the archetype's allowed superset is an error", () => {
  const e = clone(goodEntry()); // split-panel
  e.mediaStyleAccepts = ["production:cinematic", "subject:athlete-action"]; // action not allowed for split-panel archetype
  assert.ok(validateExampleEntry("ex-001-x", e).errors.some((m) => /not allowed for archetype "split-panel"/.test(m)));
});

test("an unknown media tag is an error", () => {
  const e = clone(goodEntry()); e.mediaStyleAccepts = ["subject:alien"];
  assert.ok(validateExampleEntry("ex-001-x", e).errors.some((m) => /not a known media-style tag/.test(m)));
});

test("renderedImagePath that doesn't match the id is an error (key↔path can't drift)", () => {
  const e = clone(goodEntry()); e.renderedImagePath = "templates/_examples/ex-999-other.png";
  assert.ok(validateExampleEntry("ex-001-coach-to-camera-gym", e).errors.some((m) => /renderedImagePath must be/.test(m)));
});

test("slotShape with an unknown role, or roleSet drift, is an error", () => {
  const bad = clone(goodEntry());
  bad.slotShape.slots[0].role = "vibe";
  assert.ok(validateExampleEntry("ex-001-x", bad).errors.some((m) => /not a known ROLE/.test(m)));

  const drift = clone(goodEntry());
  drift.slotShape.roleSet = ["eyebrow", "hook"]; // missing cta
  assert.ok(validateExampleEntry("ex-001-x", drift).errors.some((m) => /roleSet missing "cta"/.test(m)));

  const empty = clone(goodEntry());
  empty.slotShape.slots = [];
  assert.ok(validateExampleEntry("ex-001-x", empty).errors.some((m) => /non-empty array/.test(m)));
});

test("a malformed id key is an error even with a clean body", () => {
  const e = goodEntry();
  e.renderedImagePath = exampleImagePath("cluster-12"); // make body self-consistent with the bad key
  e.motionPath = exampleMotionPath("cluster-12");
  assert.ok(validateExampleEntry("cluster-12", e).errors.some((m) => /does not match the ex-/.test(m)));
});

test("media-optional archetype with [] is clean; clusterMetrics absent only warns", () => {
  const id = "ex-007-giant-pr";
  const e = {
    archetype: "giant-stat", format: "static", mediaStyleAccepts: [],
    slotShape: { slots: [{ id: "stat", role: "stat", maxChars: 6, required: true }] },
    renderedImagePath: exampleImagePath(id),
    // no clusterMetrics — Track B hasn't labeled yet
  };
  const { errors, warnings } = validateExampleEntry(id, e);
  assert.deepEqual(errors, [], errors.join("\n"));
  assert.ok(warnings.some((m) => /clusterMetrics absent/.test(m)));
});

// ── index validation + the on-disk index ──────────────────────────────────────
test("emptyIndex() validates and the on-disk index conforms", () => {
  const empty = emptyIndex();
  const r = validateExampleIndex(empty);
  assert.deepEqual(r.errors, []);
  assert.equal(r.count, 0);
  assert.equal(empty.schema, "example-library/v2");

  const onDisk = JSON.parse(readFileSync(join(REPO, INDEX_PATH), "utf8"));
  const d = validateExampleIndex(onDisk);
  assert.deepEqual(d.errors, [], d.errors.join("\n"));
  assert.equal(onDisk.schema, "example-library/v2");
  assert.ok(onDisk.examples && typeof onDisk.examples === "object");
});

test("loadExampleIndex falls back to emptyIndex when the file is absent", () => {
  const idx = loadExampleIndex(join(REPO, "test", "__nonexistent_root__"));
  assert.deepEqual(validateExampleIndex(idx).errors, []);
  assert.equal(validateExampleIndex(idx).count, 0);
});

test("validateExampleIndex aggregates per-entry errors", () => {
  const idx = { examples: { "ex-001-ok": goodEntry("ex-001-ok"), "BAD-ID": goodEntry() } };
  const r = validateExampleIndex(idx);
  assert.equal(r.count, 2);
  assert.ok(r.errors.some((m) => /does not match the ex-/.test(m)));
});

// ── engine lookup helpers (T1.0) — the generation gate's read of the index ────
const FAKE_INDEX = {
  examples: {
    "ex-010-quote-card": { archetype: "quote-card", format: "static", mediaStyleAccepts: [] },
    "ex-029-action-hero": { archetype: "action-hero", format: "static", mediaStyleAccepts: ["subject:athlete-action"] },
    "ex-099-giant-stat-photo": { archetype: "giant-stat", format: "static", mediaStyleAccepts: ["subject:athlete-face"] },
    "ex-046-metric-reveal": { archetype: "metric-reveal", format: "video", mediaStyleAccepts: [] },
  },
};

test("archetypeForExample resolves a bound id, null for unknown", () => {
  assert.equal(archetypeForExample("ex-010-quote-card", FAKE_INDEX), "quote-card");
  assert.equal(archetypeForExample("ex-046-metric-reveal", FAKE_INDEX), "metric-reveal");
  assert.equal(archetypeForExample("ex-999-nope", FAKE_INDEX), null);
  assert.equal(archetypeForExample("ex-010-quote-card", null), null);
});

test("exampleHasMedia mirrors the bound example (non-empty mediaStyleAccepts), fail-closed on unknown", () => {
  // media-free example (graphic / data-viz) → new design needn't carry media
  assert.equal(exampleHasMedia("ex-010-quote-card", FAKE_INDEX), false);
  assert.equal(exampleHasMedia("ex-046-metric-reveal", FAKE_INDEX), false); // data-viz motion
  // example carries media → new design must mirror it (the case the archetype flag would miss:
  // giant-stat is media-OPTIONAL but THIS example carries media → required)
  assert.equal(exampleHasMedia("ex-029-action-hero", FAKE_INDEX), true);
  assert.equal(exampleHasMedia("ex-099-giant-stat-photo", FAKE_INDEX), true);
  // unknown id → fail-closed: REQUIRE media (don't wrongly waive Law #0 on a bad/forged ref)
  assert.equal(exampleHasMedia("ex-999-nope", FAKE_INDEX), true);
  assert.equal(exampleHasMedia("ex-010-quote-card", null), true);
});

test("mediaOptionalForArchetype keys the TREATMENT gate (#12), not presence", () => {
  assert.equal(mediaOptionalForArchetype("quote-card"), true);   // graphic
  assert.equal(mediaOptionalForArchetype("giant-stat"), true);   // graphic (optional even though an example carries media)
  assert.equal(mediaOptionalForArchetype("action-hero"), false); // photo-led
  assert.equal(mediaOptionalForArchetype("count-up-stats"), true); // data-viz motion
  assert.equal(mediaOptionalForArchetype("nope-not-real"), false); // unknown → false (no throw)
});

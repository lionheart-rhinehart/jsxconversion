// Independent regression test for the Phase 3 media manifest (creative-engine/manifest/).
// Locks in: (1) motion/static derivation, (2) unique IDs, (3) collision-defeat by tag,
// (4) motion/static disambiguation. Runs in `npm test` from the repo root.

import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { deriveTags } from "../creative-engine/manifest/tag-media.mjs";
import { makeId, loadManifest } from "../creative-engine/manifest/manifest.mjs";
import { select } from "../creative-engine/manifest/select.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(here, "..", "creative-engine", "manifest", "_fixtures", "collision", "media-manifest.json");

test("motion is derived from a video extension; static from an image", () => {
  const vid = deriveTags(["agility"], "mp4").tags;
  assert.equal(vid.motion, true, "mp4 must tag motion:true");
  assert.equal(vid.kind, "motion", "mp4 must tag kind:motion");

  const img = deriveTags(["agility"], "jpg").tags;
  assert.equal(img.motion, false, "jpg must tag motion:false");
  assert.equal(img.kind, "static", "jpg must tag kind:static");
});

test("IDs are 10 hex chars and unique per source key", () => {
  const a = makeId("kr-001");
  const b = makeId("kr-002");
  assert.match(a, /^[0-9a-f]{10}$/, "ID must be 10 hex chars");
  assert.notEqual(a, b, "different source keys must yield different IDs");
  assert.equal(makeId("kr-001"), a, "same source key must be deterministic");
});

test("collision folder: a meaning query returns the EXACT asset (3.2)", () => {
  const m = loadManifest(FIXTURE);
  const hits = select(m, { sport: "football", drill: "cone", age: "u16" });
  assert.equal(hits.length, 1, "exactly one football/cone/u16 asset among the collisions");
  assert.equal(hits[0].row.file, "agility-drill-1.mp4", "must be the right file, not a same-named sibling");
});

test("motion/static discriminates; the true match ranks first", () => {
  const m = loadManifest(FIXTURE);
  const both = select(m, { sport: "soccer", drill: "ladder", age: "u12" });
  assert.equal(both.length, 2, "a photo and a video both legitimately match u12 soccer ladder");

  // Take the top result: kind:motion → the motion asset wins.
  const motion = select(m, { sport: "soccer", drill: "ladder", age: "u12", kind: "motion" }, { top: 1 });
  assert.equal(motion[0].row.file, "agility-drill.mp4", "top motion match is the right file");
  assert.equal(motion[0].row.kind, "motion");

  const stat = select(m, { sport: "soccer", drill: "ladder", age: "u12", kind: "static" }, { top: 1 });
  assert.equal(stat[0].row.file, "agility-drill-3.jpg", "top static match is the photo");
});

test("KNOWN behavior: an untagged needsReview clip can match on kind alone, but ranks BELOW real hits", () => {
  // Documents (and guards) the soft-miss rule: rows with no sport/drill/age tags are
  // not excluded, so a kind-only query can surface them — but always ranked lower.
  const m = loadManifest(FIXTURE);
  const r = select(m, { sport: "soccer", drill: "ladder", age: "u12", kind: "motion" });
  assert.equal(r[0].row.file, "agility-drill.mp4", "the fully-tagged match must rank first");
  const leak = r.find((x) => x.row.file === "clip-final-v2.mp4");
  if (leak) assert.ok(leak.score < r[0].score, "any untagged leak must rank strictly below the real match");
});

test("a contradicting facet is a hard miss (excluded, not just low-ranked)", () => {
  const m = loadManifest(FIXTURE);
  const hits = select(m, { sport: "basketball", drill: "ladder" });
  // No basketball+ladder asset exists; basketball assets are cone, so ladder excludes them.
  assert.equal(hits.length, 0, "wrong-sport/drill combos must be excluded, not returned");
});

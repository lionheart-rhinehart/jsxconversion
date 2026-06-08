// ============================================================================
//  test/motion-adherence.test.mjs — 3-frame motion adherence (T2.4, pure)
// ============================================================================
//  The video #15 path samples 3 frames, scores adherence on the BEST-matching one,
//  and WARNS when the frames disagree on the nearest archetype (the motion drifts
//  between looks). Pure: feeds synthetic adherence through buildPerceptual.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPerceptual } from "../scripts/lib/perceptual-merge.mjs";

const vios = (doc, key) => (doc.assets[key]?.violations || []).map((v) => `${v.rule}:${v.severity}`);

test("frames agree + in-lane → no clusterAdherence flag", () => {
  const embed = { ranOk: true, assets: { "a/M": {
    assignedArchetype: "count-up-stats", segment: "a",
    adherence: { landedInLane: true, frameVariance: false, frameCount: 3, nearestArchetype: "count-up-stats", nearestCosine: 0.81, assignedCosine: 0.81 },
    distinctness: [] } } };
  assert.deepEqual(vios(buildPerceptual({ campaign: "c", embed }), "a/M"), []);
});

test("frames DISAGREE but the best frame is in-lane → a soft WARN (not a block)", () => {
  const embed = { ranOk: true, assets: { "a/M": {
    assignedArchetype: "count-up-stats", segment: "a",
    adherence: { landedInLane: true, frameVariance: true, frameCount: 3, nearestArchetype: "count-up-stats", nearestCosine: 0.74, assignedCosine: 0.74 },
    distinctness: [] } } };
  assert.deepEqual(vios(buildPerceptual({ campaign: "c", embed }), "a/M"), ["clusterAdherence:warn"]);
});

test("best frame is OFF-lane → a BLOCK (the variance warn is subsumed, no double-flag)", () => {
  const embed = { ranOk: true, assets: { "a/M": {
    assignedArchetype: "count-up-stats", segment: "a",
    adherence: { landedInLane: false, frameVariance: true, frameCount: 3, nearestArchetype: "scoreboard", nearestCosine: 0.79, assignedCosine: 0.41 },
    distinctness: [] } } };
  assert.deepEqual(vios(buildPerceptual({ campaign: "c", embed }), "a/M"), ["clusterAdherence:block"]);
});

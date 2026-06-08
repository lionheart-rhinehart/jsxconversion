// ============================================================================
//  test/perceptual-merge.test.mjs — perceptual thresholds + sentinel (T2.1, pure)
// ============================================================================
//  No torch: feeds synthetic embed/slop intermediates through buildPerceptual and
//  locks the #14/#15/#16 thresholds, the fail-closed sentinel, and the write/read
//  round-trip. The Python sidecar's own numeric correctness is a separate --selfcheck.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildPerceptual, writePerceptual, readPerceptual } from "../scripts/lib/perceptual-merge.mjs";

const vios = (doc, key) => (doc.assets[key]?.violations || []).map((v) => v.rule);

test("an out-of-lane asset → a clusterAdherence block (#15)", () => {
  const embed = { ranOk: true, embedder: "clip+dino", assets: {
    "ang-1/A1": { assignedArchetype: "giant-stat", segment: "ang-1",
      adherence: { landedInLane: false, assignedArchetype: "giant-stat", assignedCosine: 0.42, nearestArchetype: "kinetic-text", nearestCosine: 0.71 },
      distinctness: [] },
  } };
  const doc = buildPerceptual({ campaign: "c", embed });
  assert.deepEqual(vios(doc, "ang-1/A1"), ["clusterAdherence"]);
  assert.equal(doc.ranOk, true);
});

test("a too-similar pair → selectionDistinctness blocks both members (#14)", () => {
  const pair = (other) => ({ other, combined: 0.81, dino: 0.78 });
  const embed = { ranOk: true, assets: {
    "ang-1/A1": { assignedArchetype: "giant-stat", segment: "ang-1", adherence: { landedInLane: true }, distinctness: [pair("ang-1/A2")] },
    "ang-1/A2": { assignedArchetype: "metric-reveal", segment: "ang-1", adherence: { landedInLane: true }, distinctness: [pair("ang-1/A1")] },
  } };
  const doc = buildPerceptual({ campaign: "c", embed });
  assert.deepEqual(vios(doc, "ang-1/A1"), ["selectionDistinctness"]);
  assert.deepEqual(vios(doc, "ang-1/A2"), ["selectionDistinctness"]);
});

test("DINOv2 alone >= 0.70 flags even when combined is low; a distinct pair passes", () => {
  const embed = { ranOk: true, assets: {
    "a/dino": { assignedArchetype: "x", segment: "a", adherence: { landedInLane: true }, distinctness: [{ other: "a/y", combined: 0.55, dino: 0.72 }] },
    "a/ok": { assignedArchetype: "x", segment: "a", adherence: { landedInLane: true }, distinctness: [{ other: "a/z", combined: 0.55, dino: 0.55 }] },
  } };
  const doc = buildPerceptual({ campaign: "c", embed });
  assert.deepEqual(vios(doc, "a/dino"), ["selectionDistinctness"], "dino>=0.70 alone is a collapse");
  assert.equal(doc.assets["a/ok"], undefined, "both axes < 0.70 = distinct = clean");
});

test("slop flags only when the vision step ran (fail-soft)", () => {
  const base = { ranOk: true, assets: { "a/1": { assignedArchetype: "x", segment: "a", adherence: { landedInLane: true }, distinctness: [] } } };
  const ran = buildPerceptual({ campaign: "c", embed: base, slop: { ran: true, assets: { "a/1": { flagged: true, reason: "garbled text" } } } });
  assert.deepEqual(vios(ran, "a/1"), ["visionSlop"]);
  const notRun = buildPerceptual({ campaign: "c", embed: base, slop: { ran: false, assets: {} } });
  assert.equal(notRun.assets["a/1"], undefined, "an LLM outage must not block");
});

test("a failed/absent embed → a fail-closed sentinel block", () => {
  const s1 = buildPerceptual({ campaign: "c", embed: { ranOk: false, reason: "embedder mismatch" } });
  assert.equal(s1.ranOk, false);
  assert.equal(s1.sentinel.severity, "block");
  assert.match(s1.sentinel.message, /embedder mismatch/);
  const s2 = buildPerceptual({ campaign: "c", embed: null });
  assert.equal(s2.ranOk, false);
  assert.equal(s2.sentinel.rule, "perceptualGate");
});

test("write/read round-trips and is absent => null", () => {
  const dir = mkdtempSync(join(tmpdir(), "perc-"));
  try {
    assert.equal(readPerceptual(dir), null, "absent → null (gate hasn't run)");
    const doc = buildPerceptual({ campaign: "c", embed: { ranOk: true, assets: {} } });
    writePerceptual(dir, doc);
    const back = readPerceptual(dir);
    assert.equal(back.ranOk, true);
    assert.equal(back.schemaVersion, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

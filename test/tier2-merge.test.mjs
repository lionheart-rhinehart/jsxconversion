// ============================================================================
//  test/tier2-merge.test.mjs — Tier-2 is advisory: warn-only, never blocks (T2.3)
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { tier2Violations, writeTier2, readTier2 } from "../scripts/lib/tier2-merge.mjs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const asset = (mean, disagreement, personas = []) => ({ mean, disagreement, personas });

test("a low mean raises a warn; a sharp persona split raises a warn", () => {
  const t = { ranOk: true, assets: {
    "a/low": asset(2, 1, [{ persona: "consumer", score: 2 }]),
    "a/split": asset(4, 3, [{ persona: "perf", score: 5 }, { persona: "cd", score: 2 }]),
  } };
  const { byKey } = tier2Violations(t);
  assert.equal(byKey["a/low"].warn.rule, "tier2");
  assert.equal(byKey["a/low"].warn.severity, "warn");
  assert.equal(byKey["a/split"].warn.severity, "warn");
});

test("a strong, agreed creative attaches the panel but raises NO warn", () => {
  const t = { ranOk: true, assets: { "a/ok": asset(4.5, 1, [{ persona: "consumer", score: 5 }]) } };
  const { byKey } = tier2Violations(t);
  assert.equal(byKey["a/ok"].warn, null);
  assert.deepEqual(byKey["a/ok"].tier2.mean, 4.5);
});

test("a tier2 entry can NEVER be a block (severity is warn by construction)", () => {
  const t = { ranOk: true, assets: { "a/x": asset(1, 4, [{ persona: "p", score: 1 }]) } };
  const { byKey } = tier2Violations(t);
  for (const k of Object.keys(byKey)) {
    if (byKey[k].warn) assert.equal(byKey[k].warn.severity, "warn");
  }
});

test("ranOk:false (Tier-2 didn't run / fail-soft) → no folds", () => {
  assert.deepEqual(tier2Violations({ ranOk: false, assets: {} }).byKey, {});
  assert.deepEqual(tier2Violations(null).byKey, {});
});

test("write/read round-trips; absent → null", () => {
  const dir = mkdtempSync(join(tmpdir(), "tier2-"));
  try {
    assert.equal(readTier2(dir), null);
    writeTier2(dir, { schemaVersion: 1, ranOk: true, assets: {} });
    assert.equal(readTier2(dir).ranOk, true);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

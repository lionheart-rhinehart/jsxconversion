// ============================================================================
//  test/publish-select.test.mjs — only approved+rendered+clean creatives publish (T2.6)
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { selectPublishable } from "../scripts/lib/publish-select.mjs";

const plan = (assets) => ({ campaign: "c", angles: [{ id: "a", assets }] });
const manifest = (cells) => ({ campaign: "c", cells });
const cell = (asset, status = "rendered") => ({ angle: "a", asset, status, output: `out/c/a/${asset}.png`, format: "static" });

test("approved + rendered + perceptually-clean → publishable", () => {
  const r = selectPublishable({
    plan: plan([{ id: "A1", status: "approved" }]),
    manifest: manifest([cell("A1")]),
    perceptual: { ranOk: true, assets: {} },
  });
  assert.equal(r.publishable.length, 1);
  assert.equal(r.publishable[0].name, "c-a-A1");
});

test("excludes unapproved, unrendered, and perceptually-blocked", () => {
  const r = selectPublishable({
    plan: plan([
      { id: "A1", status: "changes" },          // not approved
      { id: "A2", status: "approved" },          // not rendered (no cell)
      { id: "A3", status: "approved" },          // perceptual block
    ]),
    manifest: manifest([cell("A3")]),
    perceptual: { ranOk: true, assets: { "a/A3": { violations: [{ rule: "clusterAdherence", severity: "block" }] } } },
  });
  assert.equal(r.publishable.length, 0);
  assert.deepEqual(r.excluded.map((e) => e.key).sort(), ["a/A1", "a/A2", "a/A3"]);
  assert.match(r.excluded.find((e) => e.key === "a/A3").reason, /perceptual block/);
});

test("a perceptual SENTINEL holds the whole campaign — nothing publishes", () => {
  const r = selectPublishable({
    plan: plan([{ id: "A1", status: "approved" }]),
    manifest: manifest([cell("A1")]),
    perceptual: { ranOk: false, sentinel: { rule: "perceptualGate", severity: "block" }, assets: {} },
  });
  assert.equal(r.publishable.length, 0);
  assert.match(r.excluded[0].reason, /sentinel/);
});

test("a perceptual WARN (not block) does not stop publishing", () => {
  const r = selectPublishable({
    plan: plan([{ id: "A1", status: "approved" }]),
    manifest: manifest([cell("A1")]),
    perceptual: { ranOk: true, assets: { "a/A1": { violations: [{ rule: "tier2", severity: "warn" }] } } },
  });
  assert.equal(r.publishable.length, 1);
});

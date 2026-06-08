// ============================================================================
//  test/validate-plan-perceptual.test.mjs — the perceptual MERGE in validatePlan (T2.2)
// ============================================================================
//  Locks how campaigns/<c>/perceptual.json folds into the gate: absent-after-render
//  blocks (the un-skippable closer), a sentinel blocks, real violations fold per-asset,
//  the human-override downgrades to warn, and a corrupt file degrades (never throws the
//  whole gate open). No torch — fixtures are written directly.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { validatePlan } from "../scripts/validate-plan.mjs";

const REPO = join(import.meta.dirname, "..");
const CAMPAIGNS = join(REPO, "campaigns");
const OUT = join(REPO, "out", "campaigns");

function tmpCampaign(files = {}) {
  const slug = `__perc_${Date.now().toString(36)}_${Math.floor(performance.now() * 1000) % 1e6}`;
  const dir = join(CAMPAIGNS, slug);
  mkdirSync(dir, { recursive: true });
  for (const [rel, c] of Object.entries(files)) {
    const p = join(dir, rel); mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, typeof c === "string" ? c : JSON.stringify(c, null, 2));
  }
  const outDir = join(OUT, slug);
  return {
    slug, dir,
    renderManifest(cells) { mkdirSync(outDir, { recursive: true }); writeFileSync(join(outDir, "manifest.json"), JSON.stringify({ campaign: slug, cells })); },
    cleanup() { rmSync(dir, { recursive: true, force: true }); rmSync(outDir, { recursive: true, force: true }); },
  };
}

const legacy = (assets) => ({ brand: null, angles: [{ id: "a", assets }] });
const tmplAsset = { id: "T1", format: "static", template: "cluster-30", media: "x.jpg" };
const freshPlan = { brand: null, angles: [{ id: "a", assets: [{ id: "F1", source: "fresh", format: "static", media: "x.jpg", archetype: "giant-stat", exampleId: "ex-001-giant-stat" }] }] };
const campVios = (r) => r.campaignViolations.map((v) => v.rule);

test("T2.2: absent perceptual.json is silent PRE-render, a BLOCK after render (the skip closer)", () => {
  const c = tmpCampaign({});
  try {
    const pre = validatePlan(freshPlan, { campaign: c.slug, grandfatherSet: new Set(), env: {} });
    assert.equal(campVios(pre).includes("perceptualGate"), false, "pre-render: nothing to perceive yet");
    c.renderManifest([{ angle: "a", asset: "F1", status: "rendered", output: "out/x/F1.png", format: "static" }]);
    const post = validatePlan(freshPlan, { campaign: c.slug, grandfatherSet: new Set(), env: {} });
    assert.ok(post.campaignViolations.some((v) => v.rule === "perceptualGate" && v.severity === "block"), "after render with no perceptual.json → block");
  } finally { c.cleanup(); }
});

test("T2.2: a sentinel blocks campaign-level AND holds every card", () => {
  const c = tmpCampaign({ "perceptual.json": { schemaVersion: 1, campaign: "x", ranOk: false, sentinel: { rule: "perceptualGate", severity: "block", message: "could not run" }, assets: {} } });
  try {
    const r = validatePlan(legacy([tmplAsset]), { campaign: c.slug, grandfatherSet: new Set(), env: {} });
    assert.ok(r.campaignViolations.some((v) => v.rule === "perceptualGate" && v.severity === "block"));
    assert.ok(r.assets["a/T1"].violations.some((v) => v.rule === "perceptualGate"), "the sentinel holds the card too");
    assert.ok(r.blocking > 0 && r.assets["a/T1"].blocking > 0);
  } finally { c.cleanup(); }
});

test("T2.2: real per-asset violations fold in and recount per-card", () => {
  const perceptual = { schemaVersion: 1, campaign: "x", ranOk: true, assets: { "a/T1": { violations: [
    { rule: "clusterAdherence", severity: "block", message: "off lane" },
  ] } } };
  const c = tmpCampaign({ "perceptual.json": perceptual });
  try {
    const r = validatePlan(legacy([tmplAsset]), { campaign: c.slug, grandfatherSet: new Set(), env: {} });
    assert.ok(r.assets["a/T1"].violations.some((v) => v.rule === "clusterAdherence"));
    assert.equal(r.assets["a/T1"].blocking, 1, "per-card blocking recounted to include the fold");
    assert.ok(r.blocking >= 1 && r.ok === false);
  } finally { c.cleanup(); }
});

test("T2.2: the human-override downgrades perceptual blocks to warn (fails to human, not wedged)", () => {
  const c = tmpCampaign({ "perceptual.json": { schemaVersion: 1, campaign: "x", ranOk: false, sentinel: { rule: "perceptualGate", severity: "block", message: "could not run" }, assets: {} } });
  try {
    const r = validatePlan(legacy([tmplAsset]), { campaign: c.slug, grandfatherSet: new Set(), env: { AA_HUMAN_OVERRIDE: c.slug } });
    assert.equal(r.campaignViolations.some((v) => v.rule === "perceptualGate" && v.severity === "block"), false, "honored → downgraded");
    assert.ok(r.campaignViolations.some((v) => v.rule === "perceptualGate" && v.severity === "warn"), "still surfaced as a warn");
  } finally { c.cleanup(); }
});

test("T2.2: a corrupt perceptual.json degrades to a block, never throws the gate open", () => {
  const c = tmpCampaign({ "perceptual.json": "{ not valid json" });
  try {
    const r = validatePlan(legacy([tmplAsset]), { campaign: c.slug, grandfatherSet: new Set(), env: {} });
    assert.ok(r.assets, "validatePlan returned a normal report (did not throw)");
    assert.ok(r.campaignViolations.some((v) => v.rule === "perceptualMergeError" && v.severity === "block"));
  } finally { c.cleanup(); }
});

test("T2.3: validatePlan folds tier2.json as a warn + attaches the panel; blocking UNCHANGED", () => {
  const tier2 = { schemaVersion: 1, ranOk: true, assets: { "a/T1": {
    mean: 2, disagreement: 3, personas: [{ persona: "perf", score: 1 }, { persona: "consumer", score: 4 }],
  } } };
  const c = tmpCampaign({ "tier2.json": tier2 });
  try {
    const r = validatePlan(legacy([tmplAsset]), { campaign: c.slug, grandfatherSet: new Set(), env: {} });
    assert.equal(r.blocking, 0, "Tier-2 can never add a block");
    assert.ok(r.assets["a/T1"].violations.some((v) => v.rule === "tier2" && v.severity === "warn"), "low-mean/split raises a warn");
    assert.equal(r.assets["a/T1"].tier2.mean, 2, "the persona panel is attached for the review page");
    assert.equal(r.assets["a/T1"].ok, true, "warn-only → the card stays approvable");
  } finally { c.cleanup(); }
});

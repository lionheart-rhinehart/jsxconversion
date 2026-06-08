// ============================================================================
//  test/plan4.test.mjs — Phase 0 (un-bypassable gates) + Phase 1 (copy gate)
// ============================================================================
//  The Batti/ISP failures all lived in DETERMINISTIC SCRIPT territory: the engine
//  downgraded its own gate (validation.config.json {"formatMix":"warn"}), passed
//  --force-unsafe, and reworded/trimmed verbatim copy that slipped through silently.
//  These tests lock the fixes so they can't silently regress (the R0 principle).
//  Pure-logic first; the few fs-touching cases use a self-cleaning temp campaign.
//  Run: `npm test`.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  parseHumanMarkerEnv, humanMarkerPresent, forceUnsafeAllowed,
  applyCampaignOverride, overrideHonored, inheritGrandfather, loadGrandfatherList,
} from "../scripts/lib/human-override.mjs";
import { splitHook } from "../scripts/lib/roles.mjs";
import { classifyVerbatim, isApprovedTrim, verbatimGuard } from "../scripts/lib/copy-resolve.mjs";
import { validatePlan, checkFormatMix } from "../scripts/validate-plan.mjs";

const REPO = join(import.meta.dirname, "..");
const CAMPAIGNS = join(REPO, "campaigns");

// Make a throwaway campaign dir under campaigns/ (validatePlan reads copy-library /
// override / edits from there). Returns { slug, dir, cleanup }.
function tmpCampaign(files = {}) {
  const slug = `__plan4_${Date.now().toString(36)}_${Math.floor(performance.now() * 1000) % 1e6}`;
  const dir = join(CAMPAIGNS, slug);
  mkdirSync(dir, { recursive: true });
  for (const [rel, contents] of Object.entries(files)) {
    const p = join(dir, rel);
    mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, typeof contents === "string" ? contents : JSON.stringify(contents, null, 2));
  }
  return { slug, dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

// ── Phase 0 — the out-of-band marker (pure) ─────────────────────────────────────
test("P0 marker: a bare truthy token is NOT a blanket unlock", () => {
  for (const v of ["1", "true", "yes", "all", "*"]) {
    assert.equal(parseHumanMarkerEnv(v).size, 0, `"${v}" must not unlock anything`);
  }
});

test("P0 marker: only the named campaign(s) are unlocked", () => {
  const env = { AA_HUMAN_OVERRIDE: "grind-trap-manteno, confidence-saco" };
  assert.equal(humanMarkerPresent(env, "grind-trap-manteno"), true);
  assert.equal(humanMarkerPresent(env, "Confidence-Saco"), true); // case-insensitive
  assert.equal(humanMarkerPresent(env, "some-other-campaign"), false);
  assert.equal(humanMarkerPresent({}, "grind-trap-manteno"), false);
});

test("P0 force-unsafe: refused without the named marker, allowed with it", () => {
  assert.equal(forceUnsafeAllowed({ env: {}, campaign: "x" }), false);
  assert.equal(forceUnsafeAllowed({ env: { AA_HUMAN_OVERRIDE: "1" }, campaign: "x" }), false);
  assert.equal(forceUnsafeAllowed({ env: { AA_HUMAN_OVERRIDE: "x" }, campaign: "x" }), true);
});

test("P0 override: a relax is IGNORED when not honored, MERGED when honored", () => {
  const base = { formatMix: "block", verbatim: "substring", _source: "DEFAULT_RULES" };
  const refused = applyCampaignOverride({ baseRules: base, override: { formatMix: "warn", _note: "x" }, honored: false });
  assert.equal(refused.rules.formatMix, "block", "the hard gate must stand");
  assert.deepEqual(refused.ignoredKeys, ["formatMix"], "the _note meta key is not counted");
  const honored = applyCampaignOverride({ baseRules: base, override: { formatMix: "warn" }, honored: true });
  assert.equal(honored.rules.formatMix, "warn");
  assert.equal(honored.ignoredKeys.length, 0);
});

test("P0 override: a non-severity side-door (emptying bannedWords) is also refused", () => {
  const base = { bannedWords: ["scholarship"], voice: { noExclamation: true }, _source: "X" };
  const refused = applyCampaignOverride({ baseRules: base, override: { bannedWords: [], voice: { noExclamation: false } }, honored: false });
  assert.deepEqual(refused.rules.bannedWords, ["scholarship"]);
  assert.equal(refused.rules.voice.noExclamation, true);
});

test("P0 honor: grandfathered OR named marker", () => {
  const gf = new Set(["legacy-camp"]);
  assert.equal(overrideHonored({ campaign: "legacy-camp", grandfatherSet: gf, env: {} }), true);
  assert.equal(overrideHonored({ campaign: "new-camp", grandfatherSet: gf, env: {} }), false);
  assert.equal(overrideHonored({ campaign: "new-camp", grandfatherSet: gf, env: { AA_HUMAN_OVERRIDE: "new-camp" } }), true);
});

test("P0 inherit: a clone inherits grandfather ONLY from an already-grandfathered source", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "gf-"));
  writeFileSync(join(dataDir, "grandfathered-campaigns.json"), JSON.stringify({ campaigns: ["src-ok"] }));
  // source grandfathered → dest appended
  const a = inheritGrandfather({ dataDir, sourceCampaign: "src-ok", destCampaign: "dest-ok" });
  assert.equal(a.inherited, true);
  assert.ok(loadGrandfatherList(dataDir).has("dest-ok"));
  // source NOT grandfathered → nothing granted (can't launder a fresh source)
  const b = inheritGrandfather({ dataDir, sourceCampaign: "src-bad", destCampaign: "dest-bad" });
  assert.equal(b.inherited, false);
  assert.equal(loadGrandfatherList(dataDir).has("dest-bad"), false);
  rmSync(dataDir, { recursive: true, force: true });
});

// ── Phase 1 — splitHook 4-bucket ladder (pure) ─────────────────────────────────
test("P1 splitHook: overflow spills into a verbatim `body`, never trimmed", () => {
  assert.deepEqual(splitHook("Only one."), { headline: "Only one." });
  assert.deepEqual(splitHook("First. Second."), { headline: "First.", subhead: "Second." });
  assert.deepEqual(splitHook("A. B. C."), { kicker: "A.", headline: "B.", subhead: "C." });
  const four = splitHook("A. B. C. D.");
  assert.deepEqual(four, { kicker: "A.", headline: "B.", subhead: "C.", body: "D." });
  // 5 segments: remainder weighted forward, body never empty
  const five = splitHook("A. B. C. D. E.");
  assert.ok(five.body && five.body.length > 0, "body must carry the tail");
  // concatenation reproduces the words in order (verbatim, no loss)
  assert.equal([five.kicker, five.headline, five.subhead, five.body].join(" "), "A. B. C. D. E.");
});

// ── Phase 1 — verbatim classifier (pure) ───────────────────────────────────────
const LIB = ["the fastest athletes train their first three steps"];
test("P1 classify: exact passes, trim flags, rewrite blocks, short-sub is clean", () => {
  assert.equal(classifyVerbatim("the fastest athletes train their first three steps", LIB), "exact");
  assert.equal(classifyVerbatim("the fastest athletes train their first", LIB), "trim");
  assert.equal(classifyVerbatim("train explosive speed in ninety days", LIB), "absent");
  assert.equal(classifyVerbatim("the fastest", LIB), "shortsub"); // < 12 chars → not judged a trim
  assert.equal(classifyVerbatim("", LIB), "absent");
  assert.equal(classifyVerbatim("anything", []), "absent"); // no library → can't trace
});

test("P1 approved-trim: suppressed only for the EXACT approved text", () => {
  const approved = { headline: "the fastest athletes train their first" };
  assert.equal(isApprovedTrim(approved, "headline", "the fastest athletes train their first"), true);
  assert.equal(isApprovedTrim(approved, "headline", "the fastest athletes"), false); // re-edited → re-opens
  assert.equal(isApprovedTrim(approved, "other", "the fastest athletes train their first"), false);
  assert.equal(isApprovedTrim(null, "headline", "x"), false);
});

test("P1 verbatimGuard: an editedAt asset is NO LONGER auto-trusted", () => {
  const placedBySlot = { h: { role: "hook", text: "some reworded line not from copy" } };
  const v = verbatimGuard({
    placedBySlot, provenance: new Set(),
    library: { units: [{ text: "the approved verbatim line" }] },
    asset: { id: "A1", editedAt: "2026-01-01T00:00:00Z" },
  });
  assert.equal(v.length, 1, "a hand-edited reworded slot must still be flagged");
});

// ── Phase 0/1 — integration through validatePlan (temp campaign) ────────────────
function staticHeavyPlan(brand = null) {
  // 4 static, 0 video → format-mix video share 0% (block by default).
  const assets = ["S1", "S2", "S3", "S4"].map((id) => ({ id, beat: null, format: "static", photo: "x.png" }));
  return { brand, angles: [{ id: "a", assets }] };
}

test("INTEG P0: a non-grandfathered relax-file is ignored; the hard gate stands", () => {
  const { slug, cleanup } = tmpCampaign({ "validation.config.json": { formatMix: "warn" } });
  try {
    const r = validatePlan(staticHeavyPlan(), { campaign: slug, grandfatherSet: new Set(), env: {} });
    assert.ok(r.campaignViolations.some((v) => v.rule === "formatMix" && v.severity === "block"),
      "formatMix must still BLOCK — the relax was refused");
    assert.ok(r.campaignViolations.some((v) => v.rule === "overrideIgnored" && v.severity === "warn"),
      "the refused override is surfaced for the review page");
  } finally { cleanup(); }
});

test("INTEG P0: a grandfathered relax-file IS honored (formatMix → warn)", () => {
  const { slug, cleanup } = tmpCampaign({ "validation.config.json": { formatMix: "warn" } });
  try {
    const r = validatePlan(staticHeavyPlan(), { campaign: slug, grandfatherSet: new Set([slug.toLowerCase()]), env: {} });
    assert.equal(r.campaignViolations.some((v) => v.rule === "formatMix" && v.severity === "block"), false);
    assert.ok(r.campaignViolations.some((v) => v.rule === "formatMix" && v.severity === "warn"),
      "honored relax downgrades formatMix to a warning");
    assert.equal(r.campaignViolations.some((v) => v.rule === "overrideIgnored"), false);
  } finally { cleanup(); }
});

test("INTEG P0: the out-of-band env marker honors the relax for the named campaign", () => {
  const { slug, cleanup } = tmpCampaign({ "validation.config.json": { formatMix: "warn" } });
  try {
    const r = validatePlan(staticHeavyPlan(), { campaign: slug, grandfatherSet: new Set(), env: { AA_HUMAN_OVERRIDE: slug } });
    assert.equal(r.campaignViolations.some((v) => v.rule === "formatMix" && v.severity === "block"), false);
  } finally { cleanup(); }
});

test("INTEG P1: generate-world with no copy-library is a hard block (scoped to fresh + not-grandfathered)", () => {
  // generate-world (a source:"fresh" asset), no copy-library, not grandfathered → block
  const fresh = { brand: null, angles: [{ id: "a", assets: [{ id: "F1", source: "fresh", format: "video", clip: "x.mp4", templateData: {} }] }] };
  const { slug, cleanup } = tmpCampaign({});
  try {
    const blocked = validatePlan(fresh, { campaign: slug, grandfatherSet: new Set(), env: {} });
    assert.ok(blocked.campaignViolations.some((v) => v.rule === "copyLibrary" && v.severity === "block"),
      "no copy-library on a generate-world campaign must block");
    // grandfathered → exempt (don't retroactively break velocity-code-youth)
    const gf = validatePlan(fresh, { campaign: slug, grandfatherSet: new Set([slug.toLowerCase()]), env: {} });
    assert.equal(gf.campaignViolations.some((v) => v.rule === "copyLibrary" && v.severity === "block"), false);
  } finally { cleanup(); }
});

test("INTEG P1: a legacy template campaign with no copy-library is NOT retroactively blocked", () => {
  const legacy = { brand: null, angles: [{ id: "a", assets: [{ id: "T1", format: "video", clip: "x.mp4", templateData: {} }] }] };
  const { slug, cleanup } = tmpCampaign({});
  try {
    const r = validatePlan(legacy, { campaign: slug, grandfatherSet: new Set(), env: {} });
    assert.equal(r.campaignViolations.some((v) => v.rule === "copyLibrary"), false);
  } finally { cleanup(); }
});

test("INTEG P1: verbatim — exact passes, trim → copychiefTrim warn, rewrite → block", () => {
  const unit = "The fastest athletes train their first three steps.";
  const lib = { schemaVersion: 1, units: [{ id: "u1", text: unit }], byId: { u1: { id: "u1", text: unit } } };
  const mk = (hook) => ({ brand: null, angles: [{ id: "a", assets: [{ id: "H", beat: null, format: "video", clip: "x.mp4", templateData: { hook } }] }] });

  const { slug, cleanup } = tmpCampaign({ "copy-library.json": lib });
  try {
    const exact = validatePlan(mk(unit), { campaign: slug, grandfatherSet: new Set(), env: {} });
    assert.equal(exact.assets["a/H"].violations.some((v) => v.rule === "verbatim" || v.rule === "copychiefTrim"), false,
      "exact verbatim copy is clean");

    const trim = validatePlan(mk("The fastest athletes train their first three steps"), { campaign: slug, grandfatherSet: new Set(), env: {} });
    const tv = trim.assets["a/H"].violations;
    assert.ok(tv.some((v) => v.rule === "copychiefTrim" && v.severity === "warn" && v.needsApproval),
      "a verbatim trim is flagged for approval, not silently passed");
    assert.equal(tv.some((v) => v.rule === "verbatim" && v.severity === "block"), false, "a trim is not a hard block");

    const rewrite = validatePlan(mk("Train explosive first-step speed in ninety days."), { campaign: slug, grandfatherSet: new Set(), env: {} });
    assert.ok(rewrite.assets["a/H"].violations.some((v) => v.rule === "verbatim" && v.severity === "block"),
      "a reworded line is a hard block");
  } finally { cleanup(); }
});

// ── Phase 2 — brand purity through validatePlan ────────────────────────────────
const leakPlan = (brand, td) => ({ brand, angles: [{ id: "a", assets: [{ id: "X", beat: null, format: "video", clip: "x.mp4", templateData: td }] }] });

test("INTEG P2: AA red leaked onto a NEW franchisee campaign is a hard block", () => {
  const r = validatePlan(leakPlan("smaa", { headline: "Train here", brandColor: "#c4141d" }), { campaign: "__no_such__", grandfatherSet: new Set(), env: {} });
  assert.ok(r.campaignViolations.some((v) => v.rule === "brandPurity" && v.severity === "block"),
    "AA red on a non-AA brand must block");
});

test("INTEG P2: the same leak on a GRANDFATHERED campaign downgrades to a warning", () => {
  const r = validatePlan(leakPlan("smaa", { headline: "Train here", brandColor: "#c4141d" }), { campaign: "__no_such__", grandfatherSet: new Set(["__no_such__"]), env: {} });
  assert.equal(r.campaignViolations.some((v) => v.rule === "brandPurity" && v.severity === "block"), false);
  assert.ok(r.campaignViolations.some((v) => v.rule === "brandPurity" && v.severity === "warn"),
    "pre-existing franchisee work is surfaced, not retroactively broken");
});

test("INTEG P2: AA brand carrying its own red is exempt (0-diff)", () => {
  const r = validatePlan(leakPlan("athletes-acceleration", { headline: "Train here", brandColor: "#c4141d" }), { campaign: "__no_such__", grandfatherSet: new Set(), env: {} });
  assert.equal(r.campaignViolations.some((v) => v.rule === "brandPurity"), false);
});

test("INTEG P2: AA people/proof on a franchisee is a WARNING, never a block", () => {
  const r = validatePlan(leakPlan("smaa", { coachName: "COACH GRAHAM WILKERSON" }), { campaign: "__no_such__", grandfatherSet: new Set(), env: {} });
  const bp = r.campaignViolations.filter((v) => v.rule === "brandPurity");
  assert.ok(bp.length >= 1);
  assert.equal(bp.every((v) => v.severity === "warn"), true, "people/proof is confirm-or-swap, not a hard leak");
});

test("INTEG P1: an approved trim (_approvedTrims) is suppressed", () => {
  const unit = "The fastest athletes train their first three steps.";
  const lib = { schemaVersion: 1, units: [{ id: "u1", text: unit }], byId: { u1: { id: "u1", text: unit } } };
  const trimmed = "The fastest athletes train their first three steps";
  const plan = { brand: null, angles: [{ id: "a", assets: [{
    id: "H", beat: null, format: "video", clip: "x.mp4",
    templateData: { hook: trimmed, _approvedTrims: { hook: trimmed } },
  }] }] };
  const { slug, cleanup } = tmpCampaign({ "copy-library.json": lib });
  try {
    const r = validatePlan(plan, { campaign: slug, grandfatherSet: new Set(), env: {} });
    assert.equal(r.assets["a/H"].violations.some((v) => v.rule === "copychiefTrim"), false,
      "an explicitly approved trim no longer re-flags");
  } finally { cleanup(); }
});

// ── Phase 4 — the trim-approve WRITE path (review button + /approve-trim route) ──
// The button posts { field, text } to /approve-trim; the route stamps
// _approvedTrims[field]=text into the edits config (static) or templateData
// (motion). These lock the two halves of that contract: (1) the gate hands the
// UI everything it needs to act (slot id + exact text); (2) stamping that exact
// shape back where the gate consults it makes the flag drop — proven for the
// STATIC edits-config path the motion test above doesn't cover.
test("INTEG P4: a copychiefTrim violation carries the field + exact text the button needs", () => {
  const unit = "The fastest athletes train their first three steps.";
  const lib = { schemaVersion: 1, units: [{ id: "u1", text: unit }], byId: { u1: { id: "u1", text: unit } } };
  const trimmed = "The fastest athletes train their first three steps";
  const plan = { brand: null, angles: [{ id: "a", assets: [{
    id: "H", beat: null, format: "video", clip: "x.mp4", templateData: { hook: trimmed },
  }] }] };
  const { slug, cleanup } = tmpCampaign({ "copy-library.json": lib });
  try {
    const r = validatePlan(plan, { campaign: slug, grandfatherSet: new Set(), env: {} });
    const tv = r.assets["a/H"].violations.find((v) => v.rule === "copychiefTrim");
    assert.ok(tv, "the trim is flagged");
    assert.equal(tv.field, "hook", "carries the slot id so the route knows what to stamp");
    assert.equal(tv.text, trimmed, "carries the EXACT text the route writes into _approvedTrims");
  } finally { cleanup(); }
});

test("INTEG P4: stamping _approvedTrims into a STATIC edits config suppresses the trim", () => {
  const unit = "The fastest athletes train their first three steps.";
  const lib = { schemaVersion: 1, units: [{ id: "u1", text: unit }], byId: { u1: { id: "u1", text: unit } } };
  const trimmed = "The fastest athletes train their first three steps";
  const editsCfg = { width: 1080, height: 1920, media: { path: "m.jpg" }, elements: [{ id: "el1", role: "hook", text: trimmed }] };
  const plan = { brand: null, angles: [{ id: "a", assets: [{ id: "H", beat: null, format: "static", template: "cluster-1" }] }] };
  const { slug, dir, cleanup } = tmpCampaign({
    "copy-library.json": lib,
    "edits/a__H.config.json": editsCfg,
  });
  try {
    // Before approval: the static trim flags, carrying the element id as its field.
    const before = validatePlan(plan, { campaign: slug, grandfatherSet: new Set(), env: {} });
    const tv = before.assets["a/H"].violations.find((v) => v.rule === "copychiefTrim");
    assert.ok(tv && tv.field === "el1" && tv.text === trimmed, "static trim flags with the element id + text");

    // Exactly what POST /approve-trim writes for a static asset: stamp the
    // edits-config _approvedTrims[field]=text, then re-validate.
    writeFileSync(join(dir, "edits/a__H.config.json"),
      JSON.stringify({ ...editsCfg, _approvedTrims: { [tv.field]: tv.text } }, null, 2));
    const after = validatePlan(plan, { campaign: slug, grandfatherSet: new Set(), env: {} });
    assert.equal(after.assets["a/H"].violations.some((v) => v.rule === "copychiefTrim"), false,
      "the approved static trim no longer re-flags");
  } finally { cleanup(); }
});

// ── G3: generation-engine example-binding gate ───────────────────────────────
const _aVios = (r) => Object.values(r.assets).flatMap((a) => a.violations || []);
const _hasExBind = (r) => _aVios(r).some((v) => v.rule === "exampleBinding" && v.severity === "block");

test("INTEG G3: a fresh creative with no exampleId blocks (non-grandfathered); grandfathered is exempt", () => {
  const fresh = { brand: null, angles: [{ id: "a", assets: [{ id: "F1", source: "fresh", format: "static", media: "x.jpg" }] }] };
  const { slug, cleanup } = tmpCampaign({});
  try {
    const r = validatePlan(fresh, { campaign: slug, grandfatherSet: new Set(), env: {} });
    assert.ok(_hasExBind(r), "fresh asset without exampleId must block");
    assert.ok(r.blocking > 0);
    const gf = validatePlan(fresh, { campaign: slug, grandfatherSet: new Set([slug.toLowerCase()]), env: {} });
    assert.equal(_hasExBind(gf), false, "grandfathered fresh campaign must NOT be retroactively blocked");
  } finally { cleanup(); }
});

test("INTEG G3: a fresh creative WITH exampleId does not trip the gate; a legacy template asset never does", () => {
  const bound = { brand: null, angles: [{ id: "a", assets: [{ id: "F1", source: "fresh", format: "static", media: "x.jpg", exampleId: "ex-001-giant-stat", archetype: "giant-stat" }] }] };
  const legacy = { brand: null, angles: [{ id: "a", assets: [{ id: "T1", format: "static", template: "cluster-30", media: "x.jpg" }] }] };
  const { slug, cleanup } = tmpCampaign({});
  try {
    assert.equal(_hasExBind(validatePlan(bound, { campaign: slug, grandfatherSet: new Set(), env: {} })), false, "a bound fresh asset must not trip exampleBinding");
    assert.equal(_hasExBind(validatePlan(legacy, { campaign: slug, grandfatherSet: new Set(), env: {} })), false, "a non-fresh template asset must never trip exampleBinding");
  } finally { cleanup(); }
});

// ── T1.1c: exampleBindingAuthentic — the stamped id must equal the deterministic pick ──
const _hasAuth = (r) => _aVios(r).some((v) => v.rule === "exampleBindingAuthentic" && v.severity === "block");
// one giant-stat example; an asset bound to giant-stat deterministically selects it
const AUTH_IDX = { examples: {
  "ex-001-giant-stat": {
    archetype: "giant-stat", format: "static", mediaStyleAccepts: ["subject:athlete-face"],
    slotShape: { slots: [{ id: "stat", role: "stat", maxChars: null, required: true }] },
    renderedImagePath: "templates/_examples/ex-001-giant-stat.png",
    clusterMetrics: { nearestNeighbor: { cosine: 0.5 } },
  },
} };
const AUTH_LIB = { schemaVersion: 1, units: [{ id: "u1", text: '+4"' }], byId: { u1: { id: "u1", text: '+4"' } } };
const authAsset = (over = {}) => ({ brand: null, angles: [{ id: "a", assets: [
  { id: "F1", source: "fresh", format: "static", media: "x.jpg", archetype: "giant-stat", copyRefs: { stat: "u1" }, exampleId: "ex-001-giant-stat", ...over },
] }] });

test("T1.1c: a stamped exampleId that EQUALS the deterministic pick passes authenticity", () => {
  const { slug, cleanup } = tmpCampaign({ "copy-library.json": AUTH_LIB });
  try {
    const r = validatePlan(authAsset(), { campaign: slug, grandfatherSet: new Set(), env: {}, index: AUTH_IDX });
    assert.equal(_hasAuth(r), false, "the deterministic id must not trip the authenticity gate");
  } finally { cleanup(); }
});

test("T1.1c: a hand-faked exampleId (≠ the deterministic pick) is a hard block", () => {
  const { slug, cleanup } = tmpCampaign({ "copy-library.json": AUTH_LIB });
  try {
    const r = validatePlan(authAsset({ exampleId: "ex-999-faked" }), { campaign: slug, grandfatherSet: new Set(), env: {}, index: AUTH_IDX });
    assert.ok(_hasAuth(r), "a stamped id that selection would not produce must block");
  } finally { cleanup(); }
});

test("T1.1c: an archetype with no fitting example blocks; an invalid archetype blocks", () => {
  const { slug, cleanup } = tmpCampaign({ "copy-library.json": AUTH_LIB });
  try {
    const noFit = validatePlan(authAsset({ archetype: "versus", exampleId: "ex-001-giant-stat" }), { campaign: slug, grandfatherSet: new Set(), env: {}, index: AUTH_IDX });
    assert.ok(_aVios(noFit).some((v) => v.rule === "exampleBindingAuthentic" && /no fitting example/.test(v.message)), "a valid archetype with no example blocks");
    const bad = validatePlan(authAsset({ archetype: "not-a-real-archetype" }), { campaign: slug, grandfatherSet: new Set(), env: {}, index: AUTH_IDX });
    assert.ok(_aVios(bad).some((v) => v.rule === "exampleBindingAuthentic" && /not a known/.test(v.message)), "an invalid archetype blocks");
  } finally { cleanup(); }
});

test("T1.1c: grandfathered campaigns skip authenticity; an empty index fails OPEN (no block)", () => {
  const { slug, cleanup } = tmpCampaign({ "copy-library.json": AUTH_LIB });
  try {
    const gf = validatePlan(authAsset({ exampleId: "ex-999-faked" }), { campaign: slug, grandfatherSet: new Set([slug.toLowerCase()]), env: {}, index: AUTH_IDX });
    assert.equal(_hasAuth(gf), false, "grandfathered work is not retroactively blocked");
    const empty = validatePlan(authAsset({ exampleId: "ex-999-faked" }), { campaign: slug, grandfatherSet: new Set(), env: {}, index: { examples: {} } });
    assert.equal(_hasAuth(empty), false, "an empty/absent index fails open (infra-absence, not forgery)");
  } finally { cleanup(); }
});

// ── T1.2: Law #0 mirrors the bound example's media (presence) ──────────────────
const _hasMedia = (r) => _aVios(r).some((v) => v.rule === "media" && v.severity === "block");
const IDX_FREE = { examples: { "ex-050-giant-stat-free": {
  archetype: "giant-stat", format: "static", mediaStyleAccepts: [], // media-FREE example
  slotShape: { slots: [{ id: "stat", role: "stat", maxChars: null, required: true }] },
  renderedImagePath: "templates/_examples/ex-050-giant-stat-free.png", clusterMetrics: { nearestNeighbor: { cosine: 0.5 } },
} } };
const mediaFreeAsset = () => ({ brand: null, angles: [{ id: "a", assets: [
  { id: "F1", source: "fresh", format: "static", archetype: "giant-stat", copyRefs: { stat: "u1" }, exampleId: "ex-050-giant-stat-free" },
] }] });

test("T1.2: a design built from a MEDIA-FREE example may omit media (no Law#0 block)", () => {
  const { slug, cleanup } = tmpCampaign({ "copy-library.json": AUTH_LIB });
  try {
    const r = validatePlan(mediaFreeAsset(), { campaign: slug, grandfatherSet: new Set(), env: {}, index: IDX_FREE });
    assert.equal(_hasMedia(r), false, "media-free example → new design needn't carry media");
    assert.equal(_hasAuth(r), false, "and it binds cleanly");
  } finally { cleanup(); }
});

test("T1.2: a design built from a MEDIA-CARRYING example must carry media (Law#0 blocks)", () => {
  const { slug, cleanup } = tmpCampaign({ "copy-library.json": AUTH_LIB });
  try {
    // AUTH_IDX's ex-001-giant-stat carries media (mediaStyleAccepts non-empty); strip the asset's media
    const r = validatePlan(authAsset({ media: undefined }), { campaign: slug, grandfatherSet: new Set(), env: {}, index: AUTH_IDX });
    assert.ok(_hasMedia(r), "media-carrying example → new design must mirror it");
  } finally { cleanup(); }
});

test("T1.2: a legacy template asset keeps the blanket media rule", () => {
  const legacyNoMedia = { brand: null, angles: [{ id: "a", assets: [{ id: "T1", format: "static", template: "cluster-30" }] }] };
  const { slug, cleanup } = tmpCampaign({});
  try {
    const r = validatePlan(legacyNoMedia, { campaign: slug, grandfatherSet: new Set(), env: {} });
    assert.ok(_hasMedia(r), "a legacy template asset with no media still blocks");
  } finally { cleanup(); }
});

// ── T1.3: media-fit gate #12 (full-bleed / accent ceiling / clip reuse) ────────
const _hasFit = (r) => _aVios(r).some((v) => v.rule === "mediaFit" && v.severity === "block");
// media-CARRYING giant-stat (graphic, mediaOptional) + action-hero (photo-led)
const MF_IDX = { examples: {
  "ex-001-giant-stat": { archetype: "giant-stat", format: "static", mediaStyleAccepts: ["subject:athlete-face"],
    slotShape: { slots: [{ id: "stat", role: "stat", maxChars: null, required: true }] },
    renderedImagePath: "templates/_examples/ex-001-giant-stat.png", clusterMetrics: { nearestNeighbor: { cosine: 0.5 } } },
  "ex-010-action-hero": { archetype: "action-hero", format: "static", mediaStyleAccepts: ["subject:athlete-action"],
    slotShape: { slots: [{ id: "stat", role: "stat", maxChars: null, required: true }] },
    renderedImagePath: "templates/_examples/ex-010-action-hero.png", clusterMetrics: { nearestNeighbor: { cosine: 0.5 } } },
} };
const mfAsset = (archetype, exampleId, over = {}) => ({ brand: null, angles: [{ id: "a", assets: [
  { id: "F1", source: "fresh", format: "static", archetype, exampleId, copyRefs: { stat: "u1" }, media: "x.jpg", ...over },
] }] });
const mfRun = (plan, edits) => {
  const files = { "copy-library.json": AUTH_LIB };
  if (edits) files["edits/a__F1.config.json"] = edits;
  const { slug, cleanup } = tmpCampaign(files);
  try { return validatePlan(plan, { campaign: slug, grandfatherSet: new Set(), env: {}, index: MF_IDX }); }
  finally { cleanup(); }
};

test("T1.3: full-bleed media on a graphic design blocks", () => {
  const r = mfRun(mfAsset("giant-stat", "ex-001-giant-stat"), { width: 1080, height: 1920, media: { path: "bg.jpg", tag: "bg_media", z: 0 } });
  assert.ok(_hasFit(r), "full-bleed bg on a graphic archetype must block");
});

test("T1.3: a >20% accent on a graphic design blocks; ≤20% passes", () => {
  const big = mfRun(mfAsset("giant-stat", "ex-001-giant-stat"), { width: 1080, height: 1920, elements: [{ id: "photo", type: "image", x: 100, y: 100, width: 600, height: 800 }] });
  assert.ok(_hasFit(big), "a 23% accent must block");
  const small = mfRun(mfAsset("giant-stat", "ex-001-giant-stat"), { width: 1080, height: 1920, elements: [{ id: "photo", type: "image", x: 100, y: 100, width: 400, height: 400 }] });
  assert.equal(_hasFit(small), false, "a ~8% accent is within the ceiling");
});

test("T1.3: full-bleed media on a PHOTO-LED archetype is fine (its whole point)", () => {
  const r = mfRun(mfAsset("action-hero", "ex-010-action-hero"), { width: 1080, height: 1920, media: { path: "bg.jpg", tag: "bg_media", z: 0 } });
  assert.equal(_hasFit(r), false, "action-hero full-bleed must NOT trip media-fit");
});

test("T1.3: exact clip reuse across the batch is a mediaDiversity block (generate-world)", () => {
  const plan = { brand: null, angles: [{ id: "a", assets: [
    { id: "F1", source: "fresh", format: "video", clip: "same.mp4" },
    { id: "F2", source: "fresh", format: "video", clip: "same.mp4" },
  ] }] };
  const { slug, cleanup } = tmpCampaign({});
  try {
    const r = validatePlan(plan, { campaign: slug, grandfatherSet: new Set(), env: {} });
    assert.ok(r.campaignViolations.some((v) => v.rule === "mediaDiversity" && v.severity === "block"), "reused clip must block in generate-world");
  } finally { cleanup(); }
});

// ── T1.4: format-mix declared intent (override-governed; SMAA-dodge stays shut) ──
const _hasFmtBlock = (r) => r.campaignViolations.some((v) => v.rule === "formatMix" && v.severity === "block");

test("T1.4: checkFormatMix honors intent — mixed floors video, static-only waives, video-only demands it", () => {
  const p = staticHeavyPlan(); // 4 static, 0 video
  assert.equal(checkFormatMix(p, { intent: "mixed" }).ok, false, "mixed: a 0-video batch fails the floor");
  assert.equal(checkFormatMix(p, { intent: "static-only" }).ok, true, "static-only: floor waived");
  assert.equal(checkFormatMix(p, { intent: "video-only" }).ok, false, "video-only: a static batch fails");
});

test("T1.4: a static-only declaration passes ONLY when human-honored (grandfathered/marked)", () => {
  // honored (grandfathered) → intent takes effect, floor waived, audited as a warn
  const gf = tmpCampaign({ "validation.config.json": { formatMixIntent: "static-only" } });
  try {
    const r = validatePlan(staticHeavyPlan(), { campaign: gf.slug, grandfatherSet: new Set([gf.slug.toLowerCase()]), env: {} });
    assert.equal(_hasFmtBlock(r), false, "honored static-only waives the video floor");
    assert.ok(r.campaignViolations.some((v) => v.rule === "formatMix" && v.severity === "warn" && /intent: static-only/.test(v.message)), "the declaration is audited");
  } finally { gf.cleanup(); }

  // NOT honored (fresh, unmarked) → the whole relax-file is ignored → floor STANDS
  const fresh = tmpCampaign({ "validation.config.json": { formatMixIntent: "static-only" } });
  try {
    const r = validatePlan(staticHeavyPlan(), { campaign: fresh.slug, grandfatherSet: new Set(), env: {} });
    assert.ok(_hasFmtBlock(r), "an unmarked fresh campaign cannot silently declare static-only (SMAA dodge stays shut)");
  } finally { fresh.cleanup(); }
});

// ── T1.5: objective anti-slop #16 (placeholder text / CSS-silhouette media) ────
const _hasSlop = (r) => _aVios(r).some((v) => v.rule === "antiSlop" && v.severity === "block");

test("T1.5: placeholder text is a hard block", () => {
  const plan = { brand: null, angles: [{ id: "a", assets: [{ id: "M1", format: "video", clip: "x.mp4", templateData: { line1: "Your text here" } }] }] };
  const { slug, cleanup } = tmpCampaign({});
  try {
    assert.ok(_hasSlop(validatePlan(plan, { campaign: slug, grandfatherSet: new Set(), env: {} })), "a 'your text here' placeholder must block");
  } finally { cleanup(); }
});

test("T1.5: a media slot faked with a CSS shape (no image src) is a hard block; a real image is clean", () => {
  const silhouette = { brand: null, angles: [{ id: "a", assets: [{ id: "S1", format: "static" }] }] };
  const r1 = (() => {
    const { slug, cleanup } = tmpCampaign({ "edits/a__S1.config.json": { width: 1080, height: 1920, elements: [{ id: "bg_media", type: "rect", fill: "#cccccc", x: 0, y: 0, width: 500, height: 500 }] } });
    try { return validatePlan(silhouette, { campaign: slug, grandfatherSet: new Set(), env: {} }); } finally { cleanup(); }
  })();
  assert.ok(_hasSlop(r1), "a media-roled rect/gradient with no image must block");

  const real = { brand: null, angles: [{ id: "a", assets: [{ id: "S1", format: "static" }] }] };
  const r2 = (() => {
    const { slug, cleanup } = tmpCampaign({ "edits/a__S1.config.json": { width: 1080, height: 1920, media: { path: "real.jpg" }, elements: [{ id: "photo", type: "image", path: "real.jpg", x: 100, y: 100, width: 400, height: 400 }] } });
    try { return validatePlan(real, { campaign: slug, grandfatherSet: new Set(), env: {} }); } finally { cleanup(); }
  })();
  assert.equal(_hasSlop(r2), false, "a real image element is not slop");
});

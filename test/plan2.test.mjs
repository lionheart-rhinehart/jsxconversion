// ============================================================================
//  test/plan2.test.mjs — regression tests for the Plan 2 engine-hardening fixes
// ============================================================================
//  Each locked invariant gets a test so it can't silently regress (the R0
//  principle: a fix that isn't enforced gets re-broken). Run: `npm test`.
//  Pure-logic only — no renders, no Kraken, no network.
// ============================================================================

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { checkRenderEnv, formatRenderEnvError } from "../scripts/lib/preflight.mjs";
import { capBgExtraction, MAX_BG_FRAMES } from "../scripts/lib/clip-cap.mjs";
import { exportExitCode, summarizeExport, isPublishable } from "../scripts/lib/export-accounting.mjs";
import { scanBrandIntegrity } from "../scripts/lib/brand-integrity.mjs";
import { checkFormatMix, validatePlan, DEFAULT_RULES } from "../scripts/validate-plan.mjs";
import { mediaDecision } from "../scripts/repurpose-campaign.mjs";

// ── A1: preflight on a deps-stripped dir → not ok (caller exits 3) ──────────────
test("A1 preflight: deps-stripped checkout is not ok", () => {
  const dir = mkdtempSync(join(tmpdir(), "preflight-"));
  const r = checkRenderEnv({ projectRoot: dir, ffmpegOk: true, browserPath: undefined });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.includes("react")), "flags missing react umd");
  assert.ok(r.problems.some((p) => p.includes("puppeteer")), "flags missing puppeteer");
  const fmt = formatRenderEnvError(r);
  assert.match(fmt.head, /render env not ready/);
});

test("A1 preflight: ffmpeg missing is a hard problem", () => {
  // Use the real repo root (deps present) but force ffmpegOk false.
  const repoRoot = join(import.meta.dirname, "..");
  const r = checkRenderEnv({ projectRoot: repoRoot, ffmpegOk: false, browserPath: undefined, fontFamilies: [] });
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => p.toLowerCase().includes("ffmpeg")));
});

test("A1 preflight: a fully-provisioned env is ok (fonts missing only warns)", () => {
  const repoRoot = join(import.meta.dirname, "..");
  const r = checkRenderEnv({ projectRoot: repoRoot, ffmpegOk: true, browserPath: undefined, fontFamilies: ["NoSuchFont"] });
  assert.equal(r.ok, true, JSON.stringify(r.problems));
  assert.ok(r.warnings.some((w) => w.includes("NoSuchFont")));
});

// ── A2: clip cap trims a long clip; leaves a short one alone ────────────────────
test("A2 clip cap: 26s clip is capped to the export duration", () => {
  const r = capBgExtraction({ requestedSpanSec: 26, exportDurationSec: 8, fps: 30 });
  assert.equal(r.spanSec, 8);
  assert.equal(r.capped, true);
  assert.equal(r.frames, 8 * 30);
});

test("A2 clip cap: full clip (null span) is capped to the frame ceiling", () => {
  const r = capBgExtraction({ requestedSpanSec: null, exportDurationSec: 30, fps: 30 });
  assert.equal(r.frames <= MAX_BG_FRAMES, true);
  assert.equal(r.capped, true);
});

test("A2 clip cap: a short trim within the export duration is untouched", () => {
  const r = capBgExtraction({ requestedSpanSec: 3, exportDurationSec: 8, fps: 30 });
  assert.equal(r.spanSec, 3);
  assert.equal(r.capped, false);
});

// ── C/R4: honest export exit codes + status ─────────────────────────────────────
test("C export accounting: pushed:0 on a replace run is a nonzero exit", () => {
  assert.equal(exportExitCode({ pushed: 0, failed: 0, replace: true }), 1);
  assert.equal(exportExitCode({ pushed: 0, failed: 0, replace: false }), 0); // dedup-only is fine
  assert.equal(exportExitCode({ pushed: 5, failed: 0, replace: true }), 0);
  assert.equal(exportExitCode({ pushed: 5, failed: 1, replace: false }), 1); // any failure errors
});

test("R4 export status: distinguishes checked-all vs spot-checked", () => {
  const all = summarizeExport({ pushed: 3, total: 3, scoped: false });
  const some = summarizeExport({ pushed: 1, total: 9, scoped: true });
  assert.match(all, /checked all 3/);
  assert.match(some, /spot-checked/);
  const replaceMiss = summarizeExport({ pushed: 0, total: 9, replace: true });
  assert.match(replaceMiss, /REPLACE pushed nothing/);
});

// ── R2: publish gate — approval gates PUBLISH ───────────────────────────────────
test("R2 publish gate: --approved-only pushes only approved outputs", () => {
  const rendered = { status: "rendered", output: "out/x.png" };
  const approved = { status: "approved", output: "out/x.png" };
  const noOutput = { status: "approved" };
  // default: any rendered output is publishable (proofs + back-compat)
  assert.equal(isPublishable(rendered, {}), true);
  assert.equal(isPublishable(approved, {}), true);
  // approved-only: only the explicitly approved card
  assert.equal(isPublishable(rendered, { approvedOnly: true }), false);
  assert.equal(isPublishable(approved, { approvedOnly: true }), true);
  // never publishable without an output file
  assert.equal(isPublishable(noOutput, { approvedOnly: true }), false);
});

// ── B-brand: AA leaks flagged on a non-AA brand, AA brand clean ─────────────────
test("brand-integrity: AA red + wordmark + asset block on a non-AA brand", () => {
  const texts = [{ source: "edits/x.config.json", text: 'color "#c4141d" ATHLETES ACCELERATION src ./assets/hook-sprint-carmel.jpg' }];
  const r = scanBrandIntegrity({ brand: "smaa", texts });
  assert.equal(r.isAA, false);
  assert.ok(r.blocking.length >= 3, JSON.stringify(r.findings));
  assert.ok(r.blocking.some((f) => f.kind === "aa-red"));
  assert.ok(r.blocking.some((f) => f.kind === "aa-wordmark"));
  assert.ok(r.blocking.some((f) => f.kind === "aa-asset"));
});

test("brand-integrity: AA people/proof are warnings, not blocks", () => {
  const texts = [{ source: "creative-plan.json", text: "COACH GRAHAM WILKERSON TRAINED NFL ATHLETES" }];
  const r = scanBrandIntegrity({ brand: "jarosh", texts });
  assert.equal(r.blocking.length, 0);
  assert.ok(r.findings.some((f) => f.kind === "aa-people-proof"));
});

test("brand-integrity: AA brand is exempt (0-diff)", () => {
  const texts = [{ source: "x", text: "#c4141d ATHLETES ACCELERATION" }];
  const aa = scanBrandIntegrity({ brand: "athletes-acceleration", texts });
  assert.equal(aa.isAA, true);
  assert.equal(aa.findings.length, 0);
  // No brand declared also treated as AA (legacy plans carry AA literals legitimately).
  assert.equal(scanBrandIntegrity({ brand: null, texts }).isAA, true);
});

// ── R3: format-mix hard-fail on a static-heavy plan ─────────────────────────────
function planOf(formats) { return { angles: [{ assets: formats.map((f) => ({ format: f })) }] }; }

test("R3 format mix: a 22%-video plan fails", () => {
  const smaaLike = planOf([
    "video", "video", "gif", "gif",
    "static", "static", "static", "static", "static", "static", "static",
  ]);
  const r = checkFormatMix(smaaLike);
  assert.equal(r.ok, false);
  assert.ok(r.deviations.some((d) => d.bucket === "video"));
});

test("R3 format mix: an on-target 60/15/25 plan passes", () => {
  const formats = Array.from({ length: 20 }, (_, i) => (i < 12 ? "video" : i < 15 ? "gif" : "static"));
  assert.equal(checkFormatMix(planOf(formats)).ok, true);
});

test("R3 format mix: a video-healthy plan with no gifs still passes (no gif↔static penalty)", () => {
  // 11 video / 9 static / 0 gif (more-games-carmel shape): 55% video is on-target.
  const formats = [...Array(11).fill("video"), ...Array(9).fill("static")];
  assert.equal(checkFormatMix(planOf(formats)).ok, true);
});

test("R3 format mix: a 35%-video static-heavy plan fails (motion collapse)", () => {
  const formats = [...Array(7).fill("video"), ...Array(13).fill("static")];
  assert.equal(checkFormatMix(planOf(formats)).ok, false);
});

test("R3 format mix: tiny plans are skipped (rounding noise)", () => {
  const r = checkFormatMix(planOf(["static", "static"]));
  assert.equal(r.ok, true);
  assert.equal(r.skipped, true);
});

// ── Locked invariants: rating-stars + guarantee are rules-driven ────────────────
test("invariant: star ratings (★) do not trip the no-emoji block; real emoji still does", () => {
  const plan = {
    brand: "athletes-acceleration",
    angles: [{ id: "a", assets: [
      { id: "STARS", beat: null, format: "video", clip: "x.mp4", templateData: { statsLabel: "★★★★★" } },
      { id: "EMOJI", beat: null, format: "video", clip: "x.mp4", templateData: { note: "let's go 🔥" } },
    ] }],
  };
  const r = validatePlan(plan, { campaign: "__no_such_campaign__", rules: { ...DEFAULT_RULES } });
  const stars = r.assets["a/STARS"].violations.filter((v) => v.rule === "voiceEmoji");
  const emoji = r.assets["a/EMOJI"].violations.filter((v) => v.rule === "voiceEmoji");
  assert.equal(stars.length, 0, "★ rating must not be flagged as emoji");
  assert.equal(emoji.length, 1, "a real emoji must still be flagged");
});

test("invariant: guarantee drift compares against the brand's rules guaranteeText", () => {
  const td = { guaranteeLine: "+9 mph speed. +9\" vertical. 30 days." }; // paraphrase of AA
  const plan = { brand: "smaa", angles: [{ id: "a", assets: [
    { id: "G1", beat: null, format: "video", clip: "x.mp4", templateData: td },
  ] }] };
  // With a franchisee guaranteeText matching this exact line, it must NOT drift.
  const rulesMatch = { ...DEFAULT_RULES, guaranteeText: "+9 mph speed. +9\" vertical. 30 days." };
  const ok = validatePlan(plan, { campaign: "__no_such_campaign__", rules: rulesMatch });
  assert.equal(ok.assets["a/G1"].violations.some((v) => v.rule === "guaranteeDrift"), false);
  // With the default AA guarantee, this paraphrase DOES drift.
  const drift = validatePlan(plan, { campaign: "__no_such_campaign__", rules: { ...DEFAULT_RULES } });
  assert.equal(drift.assets["a/G1"].violations.some((v) => v.rule === "guaranteeDrift"), true);
});

// ── B-media: media is a required, explicit decision in repurpose ────────────────
test("media decision: missing policy is rejected", () => {
  assert.equal(mediaDecision({ media: undefined }).ok, false);
  assert.equal(mediaDecision({ media: { policy: "bogus" } }).ok, false);
});

test("media decision: reuse on a franchisee brand change is rejected unless opted in", () => {
  assert.equal(mediaDecision({ media: { policy: "reuse" }, dimensions: ["colors"] }).ok, false);
  assert.equal(mediaDecision({ media: { policy: "reuse" }, dimensions: ["identity"], allowSourceMedia: true }).ok, true);
  // Same-brand location variant (no brand-change dims) may reuse.
  assert.equal(mediaDecision({ media: { policy: "reuse" }, dimensions: ["location"] }).ok, true);
});

test("media decision: replace/per-asset require a media map (stop-and-ask if none)", () => {
  assert.equal(mediaDecision({ media: { policy: "replace" } }).ok, false);
  assert.equal(mediaDecision({ media: { policy: "replace", map: { A1: "./x.mp4" } } }).ok, true);
});

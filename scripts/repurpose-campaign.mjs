#!/usr/bin/env node
// ============================================================================
//  scripts/repurpose-campaign.mjs — deterministic repurpose orchestrator
// ============================================================================
//  Takes a repurpose JOB SPEC and spins a variant of one or more rendered
//  campaigns for a new target (location and/or franchisee brand), applying ONLY
//  the dimensions the run declares. The correctness nuances are HARD GATES in
//  code here, not prose an agent can skip:
//    • a target cannot render without the data its active dimensions need
//      (validateKit / location tier / workspace) → abort that target, no writes;
//    • every asset is rendered FULLY via run-campaign --all — there is NO
//      copy-across-targets path, so the motion eyebrow cannot leak;
//    • re-export REPLACES (soft-delete the old Kraken row, then re-ingest).
//
//  Loops targets independently — all-or-nothing PER target (one target's
//  pre-flight failure aborts only that target; the rest proceed). Idempotent
//  (re-run replaces). The /repurpose-campaign skill gathers inputs and writes
//  the job spec; this script owns order + gates.
//
//  Usage:
//    node scripts/repurpose-campaign.mjs --job <spec.json> [--dry-run] [--force]
//
//  Job spec:
//    {
//      "brand": "velocity-sports",                 // target brand slug (kit)
//      "dimensions": ["location","colors","identity","fonts","media","copy"],
//      "targets": [{
//        "source": "more-games-carmel",
//        "dest":   "more-games-velocity-sports",
//        "location": "fishers",                    // slug (location dim)
//        "textSwaps": [{"from":"CARMEL","to":"FISHERS"}],
//        "media": { "policy": "reuse", "map": {} }, // reuse|replace|per-asset
//        "workspace": "velocity-sports",            // kraken workspace (export)
//        "destFolder": "ANGLE 1"
//      }]
//    }
// ============================================================================

import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { loadTier } from "./lib/fill-core.mjs";
import { buildPaletteMap, BANK_AUTHORING_PALETTE } from "./lib/palette.mjs";
import { validateKit } from "./lib/brand-kit.mjs";
import { cloneTarget } from "./lib/clone-core.mjs";
import { resolveWorkspaceId, resolveFolder } from "./lib/kraken.mjs";

const ROOT = resolve(".");
const DATA_DIR = join(ROOT, "data");

function parseArgs(argv) {
  const a = { dryRun: false, force: false, job: null, renderOnly: false, exportOnly: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--dry-run") a.dryRun = true;
    else if (argv[i] === "--force") a.force = true;
    else if (argv[i] === "--render-only") a.renderOnly = true;   // clone+render+verify; STOP before export (review stop)
    else if (argv[i] === "--export-only") a.exportOnly = true;   // publish already-rendered+reviewed proofs
    else if (argv[i] === "--job") a.job = argv[++i];
  }
  return a;
}

function die(msg) { console.error(`[repurpose] FATAL: ${msg}`); process.exit(1); }

// Media must be a DECISION, never a silent default. The old default
// `{policy:"reuse"}` shipped the SOURCE brand's (AA) footage onto a franchisee —
// the exact Jarosh/SMAA failure. This requires an explicit policy, requires a
// media map for replace/per-asset (stop-and-ask if none), and refuses "reuse" on a
// brand change unless the user knowingly opts in (target.allowSourceMedia).
// Pure + exported for tests. Returns { ok, errors[], warnings[], policy, map }.
export function mediaDecision({ media, dimensions = [], allowSourceMedia = false } = {}) {
  const dims = new Set(dimensions);
  const errors = [];
  const warnings = [];
  const ALLOWED = ["reuse", "replace", "per-asset"];
  const policy = media && media.policy;
  if (!policy || !ALLOWED.includes(policy)) {
    errors.push(`media is a required decision — set target.media.policy to one of ${ALLOWED.join(" | ")} (the source brand's footage must not silently ride along)`);
    return { ok: false, errors, warnings, policy: policy || null, map: (media && media.map) || {} };
  }
  const map = media.map || {};
  const brandChange = dims.has("colors") || dims.has("identity") || dims.has("fonts");
  if (policy === "reuse" && brandChange && !allowSourceMedia) {
    errors.push(`media.policy "reuse" on a franchisee brand change would ship the SOURCE brand's footage. Pull the target's OWN media (policy "replace"/"per-asset" + a map from the designated folder), or set target.allowSourceMedia:true to knowingly reuse.`);
  }
  if ((policy === "replace" || policy === "per-asset") && Object.keys(map).length === 0) {
    errors.push(`media.policy "${policy}" but no media map — pull media from the TARGET's designated folder and provide assetId→path (stop-and-ask: nothing to place).`);
  }
  return { ok: errors.length === 0, errors, warnings, policy, map };
}

function loadPlan(campaign) {
  const p = join(ROOT, "campaigns", campaign, "creative-plan.json");
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

function countAssets(plan) {
  return (plan.angles || []).reduce((n, ang) => n + (ang.assets || []).length, 0);
}

function sh(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit" });
  return { ok: r.status === 0, code: r.status };
}

// ── Pre-flight gate (phase 1): resolve everything the active dims need. Returns
// { ok, errors[], warnings[], ctx } where ctx carries resolved palette/identity/
// workspace/folder for the clone+export. NEVER writes. ──────────────────────────
async function preflight(spec, target) {
  const errors = [];
  const warnings = [];
  const dims = new Set(spec.dimensions || []);
  const ctx = { paletteMap: [], identity: null, brand: null, location: null, textSwaps: [...(target.textSwaps || [])], media: target.media || {}, workspace: null, destFolder: target.destFolder || null, srcCount: 0 };

  // Media is a required decision (no silent reuse → AA footage leak).
  const md = mediaDecision({ media: target.media, dimensions: spec.dimensions || [], allowSourceMedia: target.allowSourceMedia === true });
  errors.push(...md.errors);
  warnings.push(...md.warnings);
  if (md.ok) ctx.media = { policy: md.policy, map: md.map };

  const srcPlan = loadPlan(target.source);
  if (!srcPlan) { errors.push(`source campaign not found: ${target.source}`); return { ok: false, errors, warnings, ctx }; }
  ctx.srcCount = countAssets(srcPlan);
  const sourceBrand = srcPlan.brand || "athletes-acceleration";

  // colors / identity → the target brand kit must validate.
  let targetKit = null;
  if (dims.has("colors") || dims.has("identity") || dims.has("fonts")) {
    if (!spec.brand) { errors.push("dimensions include colors/identity/fonts but spec.brand (target kit) is missing"); }
    else {
      const v = validateKit(spec.brand, { dataDir: DATA_DIR, projectRoot: ROOT });
      warnings.push(...v.warnings.map((w) => `kit: ${w}`));
      if (!v.ok) { errors.push(...v.errors.map((e) => `kit: ${e}`)); }
      else {
        targetKit = v.kit;
        ctx.brand = spec.brand;
      }
    }
  }

  // colors → palette remap from the SOURCE brand's colors to the TARGET kit's.
  if (dims.has("colors") && targetKit) {
    const fromTags = loadTier("brand", sourceBrand, DATA_DIR).tags || BANK_AUTHORING_PALETTE;
    ctx.paletteMap = buildPaletteMap(targetKit.tags, fromTags);
  }

  // identity → logo + name/url overlay, and auto-swap the brand wordmark text.
  if (dims.has("identity") && targetKit) {
    ctx.identity = {
      logo: targetKit.tags.logo,
      logoSrc: targetKit.logo_src,
      brand_name: targetKit.tags.brand_name,
      url: targetKit.tags.url,
    };
    const fromName = loadTier("brand", sourceBrand, DATA_DIR).tags?.brand_name;
    if (fromName && targetKit.tags.brand_name && fromName !== targetKit.tags.brand_name) {
      ctx.textSwaps.push({ from: fromName, to: targetKit.tags.brand_name });
    }
  }

  // location → the location tier MUST exist (else the eyebrow renders "{city name}").
  if (dims.has("location")) {
    if (!target.location) errors.push("dimensions include location but target.location (slug) is missing");
    else {
      const lt = loadTier("location", target.location, DATA_DIR);
      if (!lt.found) errors.push(`location tier missing: data/location.${target.location}.json (offer to create it before rendering)`);
      else ctx.location = target.location;
    }
  }

  // (media policy + map already validated as a required decision via mediaDecision.)

  // export → workspace + destination folder must resolve.
  if (!target.workspace) { errors.push("target.workspace (Kraken) is missing"); }
  else {
    const wsId = resolveWorkspaceId(target.workspace);
    if (!wsId) errors.push(`Kraken workspace did not resolve: "${target.workspace}"`);
    else {
      ctx.workspace = { workspace: target.workspace, workspaceId: wsId, destFolder: target.destFolder || null, destFolderId: null };
      if (target.destFolder) {
        try {
          const f = await resolveFolder(wsId, target.destFolder);
          if (!f) errors.push(`destination folder "${target.destFolder}" not found in workspace "${target.workspace}"`);
          else ctx.workspace.destFolderId = f.id;
        } catch (e) { errors.push(`folder resolve failed: ${e.message}`); }
      } else {
        warnings.push("no destFolder set — export will need one");
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings, ctx };
}

// ── Export replace-safe (phase 5): soft-delete any existing Kraken rows for the
// dest assets, then run the proven exporter (which re-ingests fresh). ──────────
function exportTarget(target, ctx, { approvedOnly = false } = {}) {
  // Collect existing kraken ids from the dest plan (present only on a re-run).
  const destPlan = loadPlan(target.dest);
  const ids = [];
  for (const ang of destPlan?.angles || []) for (const a of ang.assets || []) {
    if (a.kraken && a.kraken.id) ids.push(a.id);
  }
  if (ids.length) {
    console.log(`[repurpose] ${target.dest}: soft-deleting ${ids.length} existing Kraken row(s) before re-export`);
    const sd = sh("node", ["scripts/soft-delete-assets.mjs", target.dest, ids.join(",")]);
    if (!sd.ok) return { ok: false, step: "soft-delete" };
  }
  const args = ["scripts/kraken-export.mjs", target.dest, "--workspace", target.workspace];
  if (target.destFolder) args.push("--folder", target.destFolder);
  // After a review stop (--export-only) the user approved on the page → publish ONLY
  // approved proofs. The legacy one-shot chain pushes every rendered proof (back-compat).
  if (approvedOnly) args.push("--approved-only");
  const ex = sh("node", args);
  return { ok: ex.ok, step: "export", replaced: ids.length };
}

// ── Verify gate (phase 4): dest rendered count == source count, files on disk. ──
function verifyTarget(target, ctx) {
  const destPlan = loadPlan(target.dest);
  if (!destPlan) return { ok: false, reason: "dest plan missing after render" };
  let rendered = 0, missing = [];
  for (const ang of destPlan.angles || []) for (const a of ang.assets || []) {
    if (a.status === "rendered" && a.output && existsSync(join(ROOT, a.output))) rendered++;
    else missing.push(`${ang.id}/${a.id}`);
  }
  const ok = rendered === ctx.srcCount && missing.length === 0;
  return { ok, rendered, expected: ctx.srcCount, missing };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.job) die("missing --job <spec.json>");
  const jobPath = resolve(args.job);
  if (!existsSync(jobPath)) die(`job spec not found: ${jobPath}`);
  const spec = JSON.parse(readFileSync(jobPath, "utf8"));
  if (!Array.isArray(spec.targets) || !spec.targets.length) die("job spec has no targets[]");
  if (args.renderOnly && args.exportOnly) die("--render-only and --export-only are mutually exclusive");

  const mode = args.dryRun ? "DRY-RUN " : args.renderOnly ? "RENDER-ONLY " : args.exportOnly ? "EXPORT-ONLY " : "";
  console.log(`[repurpose] ${mode}brand=${spec.brand || "(source)"} dims=[${(spec.dimensions || []).join(",")}] targets=${spec.targets.length}`);
  const report = [];

  for (const target of spec.targets) {
    console.log(`\n──────── ${target.source} → ${target.dest} ────────`);
    const pf = await preflight(spec, target);
    for (const w of pf.warnings) console.warn(`[repurpose] warn: ${w}`);
    if (!pf.ok) {
      for (const e of pf.errors) console.error(`[repurpose] ABORT ${target.dest}: ${e}`);
      report.push({ dest: target.dest, status: "aborted (pre-flight)", errors: pf.errors });
      continue; // all-or-nothing per target; others proceed
    }
    const ctx = pf.ctx;

    if (args.dryRun) {
      console.log(`[repurpose] would clone ${target.source} → ${target.dest}`);
      console.log(`            dims: location=${ctx.location || "-"} colors=${ctx.paletteMap.length ? "yes" : "-"} identity=${ctx.identity ? "yes" : "-"} media=${ctx.media.policy}`);
      console.log(`            textSwaps: ${ctx.textSwaps.map((s) => `${s.from}→${s.to}`).join(", ") || "(none)"}`);
      console.log(`            would render ${ctx.srcCount} assets; export → ${target.workspace}/${target.destFolder || "(no folder)"}`);
      // surface inherited guarantee (kept-by-default visibility)
      const srcPlan = loadPlan(target.source);
      const g = loadTier("brand", srcPlan.brand || "athletes-acceleration", DATA_DIR).tags?.guarantee;
      if (g && !(spec.dimensions || []).includes("copy")) console.log(`            guarantee carried from source (kept): "${g}"`);
      const destPlan = loadPlan(target.dest);
      const existing = destPlan ? (destPlan.angles || []).flatMap((a) => a.assets || []).filter((x) => x.kraken?.id).length : 0;
      console.log(`            export would REPLACE ${existing} existing Kraken row(s)`);
      report.push({ dest: target.dest, status: "dry-run ok", wouldRender: ctx.srcCount });
      continue;
    }

    // Phases 2–3 — clone + render (skipped on --export-only, which resumes from an
    // already-rendered+reviewed dest). The review stop sits between phase 4 and 5.
    if (!args.exportOnly) {
      // Phase 2 — clone + swap
      let cloneReport;
      try {
        cloneReport = cloneTarget({
          projectRoot: ROOT,
          srcCampaign: target.source,
          destCampaign: target.dest,
          textSwaps: ctx.textSwaps,
          paletteMap: ctx.paletteMap,
          identity: ctx.identity,
          brand: ctx.brand,
          location: ctx.location,
          mediaPolicy: ctx.media.policy || "reuse",
          mediaMap: ctx.media.map || {},
          workspace: ctx.workspace,
        });
      } catch (e) {
        console.error(`[repurpose] ABORT ${target.dest}: clone failed — ${e.message}`);
        report.push({ dest: target.dest, status: "aborted (clone)", errors: [e.message] });
        continue;
      }
      console.log(`[repurpose] cloned: ${cloneReport.counts.editConfigs} edit configs (${cloneReport.counts.configChanges} changes), ${cloneReport.counts.templateDataSwaps} templateData swaps, media set ${cloneReport.counts.mediaSet}`);
      for (const w of cloneReport.freshWarnings) console.warn(`[repurpose] warn (fresh asset): ${w}`);

      // Phase 3 — render every asset FULLY (no copy-across path). --force forwards
      // run-campaign's --force-unsafe so a faithful 1:1 of a grandfathered/force-
      // shipped source renders despite its inherited (non-introduced) hard blocks.
      const runArgs = ["scripts/run-campaign.mjs", target.dest, "--all"];
      if (args.force) runArgs.push("--force-unsafe");
      const rr = sh("node", runArgs);
      if (!rr.ok) {
        console.error(`[repurpose] ABORT ${target.dest}: render failed (exit ${rr.code})`);
        report.push({ dest: target.dest, status: "aborted (render)" });
        continue;
      }
    }

    // Phase 4 — verify gate (also the precondition for --export-only)
    const v = verifyTarget(target, ctx);
    if (!v.ok) {
      const why = args.exportOnly
        ? `nothing to publish — run --render-only first (rendered ${v.rendered}/${v.expected})`
        : `verify failed — rendered ${v.rendered}/${v.expected}; missing: ${(v.missing || []).join(", ")}`;
      console.error(`[repurpose] ABORT ${target.dest}: ${why}`);
      report.push({ dest: target.dest, status: "aborted (verify)", rendered: v.rendered, expected: v.expected });
      continue;
    }
    console.log(`[repurpose] verify ok: ${v.rendered}/${v.expected} rendered, files present`);

    // ── REVIEW STOP — proofs are rendered; approval gates the outward publish. ──
    if (args.renderOnly) {
      console.log(`[repurpose] ${target.dest}: proofs rendered — REVIEW + approve on the page, then re-run with --export-only to publish.`);
      report.push({ dest: target.dest, status: "rendered — awaiting review", rendered: v.rendered });
      continue;
    }

    // Phase 5 — export replace-safe (only approved proofs are pushed by kraken-export)
    const ex = exportTarget(target, ctx, { approvedOnly: args.exportOnly });
    if (!ex.ok) {
      console.error(`[repurpose] ${target.dest}: export step "${ex.step}" failed`);
      report.push({ dest: target.dest, status: `export-failed (${ex.step})`, rendered: v.rendered });
      continue;
    }
    report.push({ dest: target.dest, status: "done", rendered: v.rendered, replaced: ex.replaced || 0, folder: target.destFolder });
  }

  // Phase 6 — report
  console.log("\n════════ repurpose report ════════");
  for (const r of report) {
    console.log(`  ${r.dest}: ${r.status}${r.rendered != null ? ` — rendered ${r.rendered}` : ""}${r.replaced != null ? `, replaced ${r.replaced}` : ""}${r.folder ? `, folder ${r.folder}` : ""}`);
    if (r.errors) for (const e of r.errors) console.log(`      ↳ ${e}`);
  }
  const failed = report.filter((r) => r.status !== "done" && r.status !== "dry-run ok").length;
  process.exit(failed > 0 && !args.dryRun ? 2 : 0);
}

// Run main() only when invoked directly (so tests can import mediaDecision).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => die(e.stack || e.message));
}

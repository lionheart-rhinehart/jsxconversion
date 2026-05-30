#!/usr/bin/env node
// ============================================================================
//  scripts/run-campaign.mjs — render approved creatives for a campaign
// ============================================================================
//  Walks a campaigns/<name>/creative-plan.json, renders every APPROVED asset
//  to out/campaigns/<name>/<angle>/<id>.<ext>, and patches each asset's
//  status/output/thumb back into the plan (via the editor-server single-writer
//  route when it's up, else direct file write). Emits a manifest.json.
//
//  Usage:
//    node scripts/run-campaign.mjs velocity-code-youth
//    node scripts/run-campaign.mjs velocity-code-youth --all          (ignore approval gate)
//    node scripts/run-campaign.mjs velocity-code-youth --only A2,F3
//    node scripts/run-campaign.mjs velocity-code-youth --angle angle-1-tries-harder
//    node scripts/run-campaign.mjs velocity-code-youth --keep-variants
//
//  Dispatch (by source × format):
//    template + static          → fill-core (cascade fill) → static render
//    template + video|gif       → motion wrapper in brand/video-templates/ + __CONFIG__
//    fresh    + static          → compose-creative output → static render   (needs P7)
//    fresh    + video|gif       → compose-creative motion output            (needs P7)
//    *gif*                      → render mp4, then ffmpeg palettegen/paletteuse → .gif
//
//  Collision-safety: every cell renders under a UNIQUE basename so two cells
//  of the same template never share out/<basename> or .tmp/<basename>.
//  Rendering is serial (puppeteer/ffmpeg are heavy).
// ============================================================================

import {
  existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, copyFileSync, rmSync,
} from "node:fs";
import { resolve, join, dirname } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import {
  loadTier, mergeTiers, applySubstitutions, emitVariant, renderJsx,
} from "./lib/fill-core.mjs";

const PROJECT_ROOT = resolve(".");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");
const TEMPLATE_DIR = join(PROJECT_ROOT, "templates/multi-sport-foundations");
const VIDEO_DIR = join(PROJECT_ROOT, "brand/video-templates");
const OUT_DIR = join(PROJECT_ROOT, "out");
const RENDERER = ".claude/skills/jsx-to-mp4/scripts/render.mjs";
const SERVER = "http://localhost:5173";

// ── CLI ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const campaign = args.find((a) => !a.startsWith("--"));
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
if (!campaign) {
  console.error("Usage: node scripts/run-campaign.mjs <campaign> [--all] [--only id,id] [--angle id] [--keep-variants]");
  process.exit(1);
}
const renderAll = flag("all");
const onlyIds = opt("only") ? new Set(opt("only").split(",").map((s) => s.trim())) : null;
const onlyAngle = opt("angle");
const keepVariants = flag("keep-variants");

const planPath = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
if (!existsSync(planPath)) {
  console.error(`No creative-plan.json for campaign "${campaign}" at ${planPath}`);
  process.exit(1);
}
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const brand = plan.brand || null;

const campaignOut = join(OUT_DIR, "campaigns", campaign);
mkdirSync(campaignOut, { recursive: true });

// ── plan patching (single-writer aware) ──────────────────────────────────────
async function serverUp() {
  try { const r = await fetch(`${SERVER}/plan?campaign=${encodeURIComponent(campaign)}`); return r.ok; }
  catch { return false; }
}
async function patchAsset(useServer, angleId, assetId, fields) {
  if (useServer) {
    try {
      const r = await fetch(`${SERVER}/plan/${campaign}/${angleId}/${assetId}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields),
      });
      if (r.ok) return;
    } catch { /* fall through to file write */ }
  }
  // Direct atomic-ish read-modify-write fallback.
  const p = JSON.parse(readFileSync(planPath, "utf8"));
  const ang = p.angles.find((a) => a.id === angleId);
  const as = ang && ang.assets.find((a) => a.id === assetId);
  if (as) { Object.assign(as, fields); writeFileSync(planPath, JSON.stringify(p, null, 2)); }
}

// ── helpers ──────────────────────────────────────────────────────────────────
function ffmpegAvailable() {
  return spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
}

// mp4 → gif via two-pass palette (high quality, small size).
function mp4ToGif(mp4Path, gifPath, fps = 15, width = 480) {
  return new Promise((res) => {
    const vf = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
    const p = spawn("ffmpeg", ["-y", "-i", mp4Path, "-vf", vf, gifPath], { stdio: "ignore" });
    p.on("exit", (code) => res(code === 0));
    p.on("error", () => res(false));
  });
}

const slug = (s) => String(s).replace(/[^\w.-]+/g, "-");

// The set of data keys a motion template actually consumes — the real contract.
// We read `data.<key>` usages (what the component renders) rather than trusting
// the *_SPEC list, which can carry stale/extra keys. `map` etc. are filtered.
function templateDataKeys(src) {
  const keys = new Set(
    [...src.matchAll(/\bdata\.([A-Za-z_$][\w$]*)/g)].map((m) => m[1]),
  );
  for (const noise of ["map", "filter", "forEach", "length", "slice"]) keys.delete(noise);
  return [...keys];
}

// Build the `data` object a motion template receives via window.__CONFIG__.
// Priority: asset.templateData (the planner's explicit, key-accurate map) wins;
// otherwise a small heuristic maps headline/microscript onto sensible fields so
// an un-mapped asset still renders campaign-ish copy instead of pure defaults.
// Unknown keys (not in the template's real contract) are warned, not dropped.
function buildMotionData(asset, dataKeys) {
  let data = {};
  if (asset.templateData && typeof asset.templateData === "object") {
    data = { ...asset.templateData };
  } else {
    if (asset.microscript && dataKeys.includes("eyebrow")) data.eyebrow = asset.microscript;
    if (asset.headline) {
      const target =
        dataKeys.find((k) => /^(headline|title1|quote|primaryText|claim|coachName)$/i.test(k)) ||
        dataKeys.find((k) => k !== "eyebrow");
      if (target) data[target] = asset.headline;
    }
  }
  if (dataKeys.length) {
    const unknown = Object.keys(data).filter((k) => k !== "_asset" && !dataKeys.includes(k));
    if (unknown.length) {
      console.error(`[render]   note: ${asset.id} templateData keys not read by template: ${unknown.join(", ")} (valid: ${dataKeys.join(", ")})`);
    }
  }
  return data;
}

// ── per-asset render paths ───────────────────────────────────────────────────

// template + static: cascade-fill the cluster config, render PNG.
async function renderTemplateStatic(asset, angleId) {
  const clusterId = asset.template;
  if (!clusterId || !existsSync(join(TEMPLATE_DIR, `${clusterId}.config.json`))) {
    return { ok: false, error: `template "${clusterId}" not found in ${TEMPLATE_DIR}` };
  }
  const suffix = `.camp-${slug(campaign)}-${slug(angleId)}-${slug(asset.id)}`;
  const sourceConfig = JSON.parse(readFileSync(join(TEMPLATE_DIR, `${clusterId}.config.json`), "utf8"));
  // Cascade tags + per-asset copy overrides (headline→tag 'title'/'headline', microscript→'microscript').
  const brandTier = loadTier("brand", brand, join(PROJECT_ROOT, "data"));
  // For statics, copy maps onto config-layer TAGS. asset.templateData (keyed to
  // the template's tags) wins; else a heuristic maps headline→title/headline,
  // microscript→microscript.
  let overrides = {};
  if (asset.templateData && typeof asset.templateData === "object") {
    overrides = { ...asset.templateData };
  } else {
    if (asset.headline) { overrides.title = asset.headline; overrides.headline = asset.headline; }
    if (asset.microscript) overrides.microscript = asset.microscript;
  }
  const resolved = mergeTiers(brandTier.tags, {}, overrides);
  const { config } = applySubstitutions(sourceConfig, resolved);
  const { fillJsxPath } = emitVariant({ clusterId, config, templateDir: TEMPLATE_DIR, suffix });
  const basename = `${clusterId}${suffix}`;
  const r = await renderJsx({ jsxPath: fillJsxPath, projectRoot: PROJECT_ROOT, renderer: RENDERER, inherit: false });
  const produced = join(OUT_DIR, `${basename}.png`);
  if (!keepVariants) {
    rmSync(fillJsxPath, { force: true });
    rmSync(join(TEMPLATE_DIR, `${basename}.config.json`), { force: true });
  }
  if (!r.ok || !existsSync(produced)) return { ok: false, error: `render failed (exit ${r.code})`, log: r.stderr };
  return { ok: true, produced, ext: "png" };
}

// template + motion: wrapper variation in brand/video-templates/ (so animations.jsx
// + elements/* are siblings) that renders the bank template in a <Stage>, with
// per-asset copy delivered via <id>.data.json → window.__CONFIG__.
// NOTE: requires the live-render spike to confirm Stage/element loading. Built
// here per plan; verified in the deferred test pass.
async function renderTemplateMotion(asset, angleId, wantGif) {
  const tmpl = asset.template;
  const tmplPath = join(VIDEO_DIR, "templates", `${tmpl}.jsx`);
  if (!tmpl || !existsSync(tmplPath)) {
    return { ok: false, error: `motion template "${tmpl}" not found at ${tmplPath}` };
  }
  // Discover the window component + spec names the template registers.
  const src = readFileSync(tmplPath, "utf8");
  const compM = src.match(/window\.([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\s*;/g) || [];
  const compName = (src.match(/window\.([A-Za-z_$][\w$]*Reel)\s*=/) ||
    src.match(/window\.([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\s*;/) || [])[1];
  if (!compName) return { ok: false, error: `could not find window.<Component> in ${tmpl}.jsx` };

  const base = `_camp-${slug(campaign)}-${slug(angleId)}-${slug(asset.id)}`;
  const wrapperPath = join(VIDEO_DIR, `${base}.jsx`);
  const dataPath = join(VIDEO_DIR, `${base}.data.json`);
  // Map campaign copy onto the template's REAL field keys (*_SPEC-driven adapter).
  const dataKeys = templateDataKeys(src);
  const data = buildMotionData(asset, dataKeys);
  writeFileSync(dataPath, JSON.stringify(data, null, 2));

  // Wrapper: define a Stage-wrapping component that mounts the bank template,
  // then INLINE the template source so its window.<compName> global actually
  // exists in the page (the renderer loads animations.jsx + elements/* but NOT
  // templates/*, so the template must be carried in here). The wrapper's window
  // global is written FIRST so detectVariationGlobal picks the wrapper (not the
  // template) as the component to mount — it mounts with {data} from __CONFIG__.
  const W = 1080, H = 1920, D = 8, FPS = 30;
  const wrapperName = `CampWrap_${slug(asset.id).replace(/-/g, "_")}`;
  const wrapper = `// Auto-generated motion wrapper for campaign "${campaign}" asset ${asset.id}.
// Renders bank template ${tmpl} (window.${compName}) inside a Stage with __CONFIG__ data.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', monospace" },
  body: { fontFamily: "'Geist', sans-serif" },
};
function ${wrapperName}({ data }) {
  const Inner = window.${compName};
  if (!Inner) return null;
  return (
    <Stage width={${W}} height={${H}} duration={${D}} fps={${FPS}} background="#0a0b0d">
      <Inner data={data || {}} />
    </Stage>
  );
}
window.${wrapperName} = ${wrapperName};

// ─── inlined bank template: ${tmpl} ───────────────────────────────────────
${src}
`;
  writeFileSync(wrapperPath, wrapper);

  const r = await renderJsx({ jsxPath: wrapperPath, projectRoot: PROJECT_ROOT, renderer: RENDERER, inherit: false });
  const producedMp4 = join(OUT_DIR, `${base}.mp4`);
  let result;
  if (!r.ok || !existsSync(producedMp4)) {
    result = { ok: false, error: `motion render failed (exit ${r.code})`, log: r.stderr };
  } else if (wantGif) {
    const gif = join(OUT_DIR, `${base}.gif`);
    const okGif = await mp4ToGif(producedMp4, gif);
    result = okGif && existsSync(gif)
      ? { ok: true, produced: gif, ext: "gif" }
      : { ok: false, error: "gif conversion failed" };
    rmSync(producedMp4, { force: true });
  } else {
    result = { ok: true, produced: producedMp4, ext: "mp4" };
  }
  if (!keepVariants) {
    rmSync(wrapperPath, { force: true });
    rmSync(dataPath, { force: true });
    rmSync(join(VIDEO_DIR, "__render"), { recursive: true, force: true });
  }
  return result;
}

// fresh: delegate to compose-creative (P7). Until that skill is wired, report
// a clear pending status rather than failing the batch.
async function renderFresh(asset) {
  const gen = join(PROJECT_ROOT, ".claude/skills/compose-creative/scripts/generate.mjs");
  if (!existsSync(gen)) {
    return { ok: false, pending: true, error: "compose-creative generator not built yet (P7)" };
  }
  return { ok: false, pending: true, error: "fresh generation wiring pending live test" };
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const useServer = await serverUp();
  console.error(`[campaign] plan: ${planPath}`);
  console.error(`[campaign] plan patching via ${useServer ? "editor-server (:5173)" : "direct file write"}`);
  if (!ffmpegAvailable()) console.error("[campaign] WARNING: ffmpeg not on PATH — video/gif will fail.");

  const manifest = { campaign, generatedFrom: planPath, cells: [], summary: {} };
  let ok = 0, failed = 0, pending = 0, skipped = 0;

  for (const angle of plan.angles || []) {
    if (onlyAngle && angle.id !== onlyAngle) continue;
    const angleOut = join(campaignOut, angle.id);
    mkdirSync(angleOut, { recursive: true });

    for (const asset of angle.assets || []) {
      if (onlyIds && !onlyIds.has(asset.id)) continue;
      const gated = !renderAll && asset.status !== "approved";
      if (gated) { skipped++; continue; }

      const tag = `${angle.id}/${asset.id} (${asset.source}/${asset.format})`;
      console.error(`[render] ${tag} …`);
      await patchAsset(useServer, angle.id, asset.id, { status: "rendering" });

      let res;
      try {
        if (asset.source === "fresh") res = await renderFresh(asset);
        else if (asset.format === "static") res = await renderTemplateStatic(asset, angle.id);
        else res = await renderTemplateMotion(asset, angle.id, asset.format === "gif");
      } catch (e) {
        res = { ok: false, error: e.message };
      }

      const row = { angle: angle.id, asset: asset.id, source: asset.source, format: asset.format };
      if (res.ok) {
        const destRel = `out/campaigns/${campaign}/${angle.id}/${asset.id}.${res.ext}`;
        const dest = join(PROJECT_ROOT, destRel);
        renameSync(res.produced, dest);
        await patchAsset(useServer, angle.id, asset.id, { status: "rendered", output: destRel, thumb: destRel });
        row.status = "rendered"; row.output = destRel; ok++;
        console.error(`[render] ${tag} ✓ → ${destRel}`);
      } else if (res.pending) {
        await patchAsset(useServer, angle.id, asset.id, { status: "approved" }); // leave for later
        row.status = "pending"; row.error = res.error; pending++;
        console.error(`[render] ${tag} … pending: ${res.error}`);
      } else {
        await patchAsset(useServer, angle.id, asset.id, { status: "failed", notes: (asset.notes || "") });
        row.status = "failed"; row.error = res.error; failed++;
        console.error(`[render] ${tag} ✗ ${res.error}`);
      }
      manifest.cells.push(row);
    }
  }

  manifest.summary = { ok, failed, pending, skipped, total: manifest.cells.length };
  writeFileSync(join(campaignOut, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.error(`[campaign] done — ok:${ok} failed:${failed} pending:${pending} skipped:${skipped}`);
  console.error(`[campaign] manifest: ${join(campaignOut, "manifest.json")}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error("[campaign] fatal:", e.message); process.exit(1); });

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
//    fresh    + static          → compose-creative authored config+jsx → static render
//    fresh    + video|gif       → compose-creative authored Stage component → motion render
//    *gif*                      → render mp4, then ffmpeg palettegen/paletteuse → .gif
//  (fresh == a creative authored INTO the bank's shape; asset.template points at it,
//   so it renders through the same static/motion paths as a bank template.)
//
//  Collision-safety: every cell renders under a UNIQUE basename so two cells
//  of the same template never share out/<basename> or .tmp/<basename>.
//  Rendering is serial (puppeteer/ffmpeg are heavy).
// ============================================================================

import {
  existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, copyFileSync, rmSync, readdirSync, statSync,
} from "node:fs";
import { resolve, join, dirname } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import {
  emitVariant, renderJsx, resolveStaticConfig, buildCopyByRole,
  loadTier, mergeTiers,
} from "./lib/fill-core.mjs";
import { assemble } from "./lib/assemble.mjs";
import { fieldRole, buildEyebrowAnchor } from "./lib/roles.mjs";
import { loadCopyLibrary } from "./lib/copy-library.mjs";
import { buildRefPools, verbatimGuard } from "./lib/copy-resolve.mjs";
import { validateTemplateSource } from "./validate-templates.mjs";
import { BANK_AUTHORING_PALETTE, COLOR_TOKEN_KEYS } from "./lib/palette.mjs";
import { validatePlan, writeValidationReport } from "./validate-plan.mjs";
import { verifyRender } from "./lib/render-qa.mjs";
import { loadBrandFile } from "./lib/brand-kit.mjs";
import { stageKitFonts } from "./lib/fonts-stage.mjs";
import { checkRenderEnv, formatRenderEnvError, REQUIRED_FONT_FAMILIES } from "./lib/preflight.mjs";
import { capBgExtraction } from "./lib/clip-cap.mjs";

const PROJECT_ROOT = resolve(".");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");
const TEMPLATE_DIR = join(PROJECT_ROOT, "templates/multi-sport-foundations");
const VIDEO_DIR = join(PROJECT_ROOT, "brand/video-templates");
const OUT_DIR = join(PROJECT_ROOT, "out");
const RENDERER = ".claude/skills/jsx-to-mp4/scripts/render.mjs";
// Talk to THIS checkout's editor-server. Env wins; else read the port dev.mjs wrote
// for this workspace (.dev-ports.json) so a worktree never stamps another chat's
// server; else the historical default.
function devEditorPort() {
  try {
    const f = join(PROJECT_ROOT, ".dev-ports.json");
    if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8")).editor || null;
  } catch { /* ignore — fall through to default */ }
  return null;
}
const SERVER = process.env.EDITOR_SERVER
  || `http://localhost:${process.env.EDITOR_PORT || devEditorPort() || 5173}`;

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

// Cody's verbatim copy library (null when the campaign has no ad-copy.md → the
// legacy authored-copy path renders, preserving back-compat).
const COPY_LIBRARY = loadCopyLibrary(join(CAMPAIGNS_DIR, campaign));

const campaignOut = join(OUT_DIR, "campaigns", campaign);
mkdirSync(campaignOut, { recursive: true });

const DATA_DIR = join(PROJECT_ROOT, "data");
// Per-asset authoritative static config (the user's hand edits). Tracked in git
// under campaigns/<name>/edits/. Naming MUST match editor-server's route so the
// editor writes and the runner reads the SAME file (B1/B2).
function editsConfigPath(angleId, assetId) {
  return join(CAMPAIGNS_DIR, campaign, "edits", `${angleId}__${assetId}.config.json`);
}

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

// Resolve the puppeteer browser executable WITHOUT launching it (cheap, and never
// throws): a missing browser is a render-killer the React-UMD check alone misses.
// Returns the path string, or undefined when we can't probe (so the pure check
// skips the assertion rather than false-failing).
function probeBrowserPath() {
  try {
    const pmod = createRequire(import.meta.url)("puppeteer");
    if (typeof pmod.executablePath === "function") return pmod.executablePath();
  } catch { /* fall through */ }
  return undefined;
}

// Render-env preflight (fail-fast, ONCE before any asset): React UMD + puppeteer
// browser + ffmpeg + brand fonts. A git worktree gets its OWN node_modules
// (gitignored, NOT auto-installed) and the cloud session installs ffmpeg/chromium
// in a hook — so any can be silently absent, and without this gate the FIRST and
// EVERY asset fails with an opaque "exit 1" after the whole batch churns. Catch it
// here with ONE actionable line, before wasting 20 minutes. Exits 3 on a hard miss.
function preflightRenderEnv() {
  const result = checkRenderEnv({
    projectRoot: PROJECT_ROOT,
    ffmpegOk: ffmpegAvailable(),
    browserPath: probeBrowserPath(),
    fontFamilies: REQUIRED_FONT_FAMILIES,
  });
  for (const w of result.warnings) console.error(`[campaign] preflight warning: ${w}`);
  if (!result.ok) {
    const { head, fix, bullets } = formatRenderEnvError(result);
    console.error(`[campaign] FATAL: ${head}`);
    console.error(bullets);
    console.error(`[campaign] ${fix}`);
    process.exit(3);
  }
}

// mp4 → gif via two-pass palette (high quality, small size).
function mp4ToGif(mp4Path, gifPath, fps = 15, width = 480) {
  return new Promise((res) => {
    const vf = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
    const p = spawn("ffmpeg", ["-y", "-i", mp4Path, "-vf", vf, gifPath], { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    if (p.stderr) p.stderr.on("data", (d) => { err += d.toString(); });
    p.on("exit", (code) => {
      if (code !== 0) {
        // Surface ffmpeg's stderr — gif failures were reported as a bare
        // "gif conversion failed" with the real cause swallowed.
        const tail = err.trim().split(/\r?\n/).filter(Boolean).slice(-4);
        for (const line of tail) console.error(`           │ ${line}`);
      }
      res(code === 0);
    });
    p.on("error", (e) => { console.error(`           │ ffmpeg spawn error: ${e.message}`); res(false); });
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

// The template's `duration` SPEC field, parsed from its *_SPEC `fields:` array
// (same brace-match + JSON.parse the editor-server uses). Its `default` is the
// template's intrinsic animation/loop length L — the "N-second loop" the template
// is authored around; `min`/`max` are the per-template clip-length bounds. Returns
// null if there's no parseable duration field.
function durationField(src) {
  const at = src.indexOf("fields:");
  if (at < 0) return null;
  const open = src.indexOf("[", at);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]" && --depth === 0) {
      try {
        const fields = JSON.parse(src.slice(open, i + 1));
        const f = Array.isArray(fields) && fields.find((x) => x && x.key === "duration");
        return f && typeof f.default === "number" ? f : null;
      } catch { return null; }
    }
  }
  return null;
}

// Build the `data` object a motion template receives via window.__CONFIG__.
// Priority: asset.templateData (the planner's explicit, key-accurate map) wins;
// otherwise a small heuristic maps headline/microscript onto sensible fields so
// an un-mapped asset still renders campaign-ish copy instead of pure defaults.
// Unknown keys (not in the template's real contract) are warned, not dropped.
function buildMotionData(asset, dataKeys, tierTags = {}) {
  let data = {};
  if (asset.templateData && typeof asset.templateData === "object") {
    data = { ...asset.templateData };
  } else {
    // Role-aware JOIN: infer each field's role from its name, then match the
    // asset's copy to fields by role. Copy comes by REFERENCE (verbatim, from the
    // copy-library) when the asset carries copyRefs/hookRef; else the legacy path.
    // Motion has no maxChars, so the hook still splits but there's no length-based
    // alt-hook fallback (known gap — static-only fit).
    const slots = dataKeys.map((k) => ({ id: k, role: fieldRole(k), accepts: [] }));
    if (slots.some((s) => s.role)) {
      const refPools = COPY_LIBRARY
        ? buildRefPools(asset, { library: COPY_LIBRARY, tierTags, warn: (m) => console.error(`[copy] ${m}`) })
        : null;
      const copyByRole = refPools ? refPools.pools : buildCopyByRole(asset);
      const { bySlotId } = assemble({ slots, copyByRole });
      data = { ...bySlotId };
      if (COPY_LIBRARY) {
        const placedBySlot = {};
        for (const s of slots) if (bySlotId[s.id]) placedBySlot[s.id] = { role: s.role, text: bySlotId[s.id] };
        for (const v of verbatimGuard({ placedBySlot, provenance: refPools ? refPools.provenance : new Set(), library: COPY_LIBRARY, asset })) {
          console.error(`[copy] VERBATIM VIOLATION ${asset.id} field "${v.slotId}" (${v.role}): not from copy-library — "${String(v.text).slice(0, 60)}"`);
        }
      }
    } else {
      // Fallback for templates with no role-ish field names.
      if (asset.microscript && dataKeys.includes("eyebrow")) data.eyebrow = asset.microscript;
      if (asset.headline) {
        const target =
          dataKeys.find((k) => /^(headline|title1|quote|primaryText|claim|coachName)$/i.test(k)) ||
          dataKeys.find((k) => k !== "eyebrow");
        if (target) data[target] = asset.headline;
      }
    }
  }
  // S5 — identity sync from the brand-kit cascade. Fill ONLY unset fields whose
  // role is brand/eyebrow (never content/numeric — a string in a stat field
  // would NaN the count-up at render). Explicit templateData already populated
  // `data`, so this only touches keys it didn't set ("explicit wins").
  // Locale eyebrow anchor — SINGLE SOURCE in roles.mjs (shared with the static
  // fill path), so the motion and static eyebrows never diverge. Produces
  // "{CITY} SPORT PARENT" (the user-specified wording). Do NOT re-inline an
  // ad-hoc string here — that would regress the eyebrow on one path only.
  const anchor = buildEyebrowAnchor(tierTags);
  for (const k of dataKeys) {
    const role = fieldRole(k);
    // The eyebrow is the brand's locale anchor on EVERY design — force it, overriding
    // any per-template tagline (e.g. "// THE 10% RULE") or stale copy.
    if (role === "eyebrow") { data[k] = anchor; continue; }
    if (k in data) continue;
    if (role === "brand" && typeof tierTags.brand_name === "string") data[k] = tierTags.brand_name;
  }
  if (dataKeys.length) {
    // `_`-prefixed keys (e.g. _overrides) and added-text keys (data._extras,
    // consumed by ExtrasLayer inside animations.jsx — not via `data.X` in the
    // template source) are intentional — don't flag them as unread.
    const extraKeys = new Set((data._extras || []).map((e) => e && e.key));
    const unknown = Object.keys(data).filter(
      (k) => k !== "_asset" && !k.startsWith("_") && !extraKeys.has(k) && !dataKeys.includes(k));
    if (unknown.length) {
      console.error(`[render]   note: ${asset.id} templateData keys not read by template: ${unknown.join(", ")} (valid: ${dataKeys.join(", ")})`);
    }
  }
  return data;
}

// ── per-asset render paths ───────────────────────────────────────────────────

// template + static: render PNG from the AUTHORITATIVE per-asset config.
//
// Edit-first ordering (B1/B2 — non-negotiable): if a hand-edited config exists
// at campaigns/<name>/edits/<angle>__<asset>.config.json, render straight from
// it and NEVER re-fill (re-filling would silently clobber the user's work).
// Only on first render (no edits file yet) do we resolve the template fill,
// PERSIST it as the seed edits file, then render from that. After that the edits
// file is the single source of truth for both the editor and the renderer.
async function renderTemplateStatic(asset, angleId) {
  const clusterId = asset.template;
  if (!clusterId || !existsSync(join(TEMPLATE_DIR, `${clusterId}.config.json`))) {
    return { ok: false, error: `template "${clusterId}" not found in ${TEMPLATE_DIR}` };
  }
  const suffix = `.camp-${slug(campaign)}-${slug(angleId)}-${slug(asset.id)}`;
  const editsPath = editsConfigPath(angleId, asset.id);
  let config;
  let isFresh = false;
  if (existsSync(editsPath)) {
    config = JSON.parse(readFileSync(editsPath, "utf8"));
  } else {
    const ang = (plan.angles || []).find((a) => a.id === angleId);
    const location = asset.location || (ang && ang.location) || plan.location || null;
    config = resolveStaticConfig({ clusterId, asset, brand, location, campaign, templateDir: TEMPLATE_DIR, dataDir: DATA_DIR });
    if (!config) return { ok: false, error: `could not resolve config for "${clusterId}"` };
    isFresh = true;
  }
  {
    // Background media: opt-in via asset.media (repurpose/clone) OR asset.photo /
    // asset.clip (the editor's media picker). Applied on BOTH the fresh-fill AND the
    // existing-edits path so an editor pick lands on a STATIC (whose edits config the
    // renderer would otherwise use verbatim). On the edits path we re-apply ONLY when
    // there's an explicit pick (photo/clip), so a text-only edit never disturbs an
    // existing background. photo/clip win over the repurposed a.media. Paths may be
    // TEMPLATE_DIR-relative ("./assets/..") OR PROJECT_ROOT-relative (editor picks);
    // resolve both, then STAGE under the served assets/ dir.
    // On the EDITS path the saved config.media is authoritative (it already holds the
    // first-render bg, OR the user's editor media-swap). Re-applying asset.clip here
    // would CLOBBER a hand-swapped background, so only an explicit asset.photo pick
    // overrides on re-render — never the generator's original asset.clip.
    const sbg = isFresh ? (asset.photo || asset.clip || asset.media) : asset.photo;
    if (sbg) {
      const VID_RE = /\.(mp4|mov|webm|m4v|mkv)$/i;
      const baseName = (p) => String(p).split(/[\\/]/).pop();
      const assetsDir = join(TEMPLATE_DIR, "assets");
      // If the template SHIPS a baked background image (e.g. cluster-33 bg_photo),
      // REPLACE its source — a separate z:0 media layer would render BEHIND it and
      // never appear. Otherwise add a full-frame media layer + scrim.
      const bakedBg = [...(config.fixedDesign || []), ...(config.elements || [])]
        .find((e) => e && e.type === "image"
          && (e.z === 0 || /bg|background|photo|hero/i.test(String(e.id || "") + String(e.tag || ""))));
      // Already a template-served "./assets/.." file? use as-is; else resolve + stage.
      let mediaRel = (/^\.\/assets\//.test(String(sbg))
        && existsSync(join(TEMPLATE_DIR, String(sbg).replace(/^\.\//, "")))) ? String(sbg) : null;
      if (!mediaRel) {
        let absSrc = join(TEMPLATE_DIR, String(sbg).replace(/^\.\//, ""));
        if (!existsSync(absSrc)) { const p2 = join(PROJECT_ROOT, sbg); if (existsSync(p2)) absSrc = p2; }
        if (existsSync(absSrc)) {
          mkdirSync(assetsDir, { recursive: true });
          const staged = "bg-" + baseName(absSrc).replace(/[^a-z0-9.]+/gi, "-").toLowerCase();
          copyFileSync(absSrc, join(assetsDir, staged));
          mediaRel = "./assets/" + staged;
        }
      }
      if (mediaRel) {
        if (bakedBg) {
          // An <img> src CANNOT be a video → still-frame it to a PNG. When the user
          // pinned a start (asset.mediaStart) honor it; otherwise let ffmpeg's
          // `thumbnail` filter pick a REPRESENTATIVE (non-black) frame rather than a
          // fixed t≈1s seek, which was landing on black/transition frames (D).
          if (VID_RE.test(mediaRel)) {
            const abs = join(TEMPLATE_DIR, mediaRel.replace(/^\.\//, ""));
            const pngRel = mediaRel.replace(/\.[^.]+$/, "") + "-frame.png";
            const pngAbs = join(TEMPLATE_DIR, pngRel.replace(/^\.\//, ""));
            mkdirSync(dirname(pngAbs), { recursive: true });
            const ffStill = asset.mediaStart != null
              ? ["-y", "-loglevel", "error", "-ss", String(asset.mediaStart), "-i", abs, "-frames:v", "1", pngAbs]
              : ["-y", "-loglevel", "error", "-i", abs, "-vf", "thumbnail=n=100", "-frames:v", "1", pngAbs];
            const ex = spawnSync("ffmpeg", ffStill, { encoding: "utf8" });
            if (ex.status === 0 && existsSync(pngAbs)) mediaRel = pngRel;
            else {
              const t = String(ex.stderr || ex.error?.message || "").trim().split(/\r?\n/).filter(Boolean).slice(-3);
              console.error(`[render]   note: ${asset.id} static bg still-frame failed; using raw path.`);
              for (const line of t) console.error(`           │ ${line}`);
            }
          }
          if ("src" in bakedBg) bakedBg.src = mediaRel; else bakedBg.path = mediaRel;
        } else {
          config.media = { path: mediaRel, tag: "bg_media", z: 0, videoStartTime: asset.mediaStart || 1 };
          config.fixedDesign = config.fixedDesign || [];
          if (!config.fixedDesign.some((e) => e && e.id === "_bg_scrim")) {
            config.fixedDesign.unshift({ id: "_bg_scrim", tag: "_bg_scrim", type: "rect", x: 0, y: 0,
              width: config.width || 1080, height: config.height || 1920,
              fill: "linear-gradient(180deg, rgba(10,11,13,0.66) 0%, rgba(10,11,13,0.54) 45%, rgba(10,11,13,0.90) 100%)", z: 1 });
          }
          // Legibility over footage: give each text layer a drop-shadow. Skip layers
          // that already define one. Only when media is present → solid batch untouched.
          for (const el of config.elements || []) {
            if (typeof el.text === "string" && el.textShadow == null) {
              el.textShadow = "0 2px 12px rgba(0,0,0,0.92)";
            }
          }
        }
      }
    }
    if (isFresh) {
      mkdirSync(dirname(editsPath), { recursive: true });
      writeFileSync(editsPath, JSON.stringify(config, null, 2));
    }
  }
  // Durable static media: if the config points at a media file that's missing
  // locally (e.g. a gitignored swap-* in a fresh worktree) but carries a Kraken
  // ref, re-fetch it from the Content Library so the render isn't black. Mirrors
  // how motion re-extracts asset.clip from the (also gitignored) cache.
  const med = config && config.media;
  if (med && med.path && med.krakenUrl) {
    const medAbs = join(TEMPLATE_DIR, String(med.path).replace(/^\.\//, ""));
    if (!existsSync(medAbs)) {
      try {
        const rr = await fetch(med.krakenUrl);
        if (rr.ok) {
          mkdirSync(dirname(medAbs), { recursive: true });
          writeFileSync(medAbs, Buffer.from(await rr.arrayBuffer()));
          console.error(`[render]   ${asset.id} restored static media from Kraken → ${med.path}`);
        } else {
          console.error(`[render]   note: ${asset.id} media restore failed (${rr.status}); rendering without it.`);
        }
      } catch (e) {
        console.error(`[render]   note: ${asset.id} media restore error: ${e.message}`);
      }
    }
  }
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
  // ENFORCED template contract (no raw <video>, eyebrow present) — a render of a
  // non-compliant template fails here, so the rules can't be silently skipped.
  const tplErrs = validateTemplateSource(src, tmpl);
  if (tplErrs.length) {
    return { ok: false, error: `template "${tmpl}" fails the contract — ${tplErrs.join("; ")} (run: node scripts/validate-templates.mjs ${tmpl})` };
  }
  const compM = src.match(/window\.([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\s*;/g) || [];
  const compName = (src.match(/window\.([A-Za-z_$][\w$]*Reel)\s*=/) ||
    src.match(/window\.([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\s*;/) || [])[1];
  if (!compName) return { ok: false, error: `could not find window.<Component> in ${tmpl}.jsx` };

  const base = `_camp-${slug(campaign)}-${slug(angleId)}-${slug(asset.id)}`;
  const wrapperPath = join(VIDEO_DIR, `${base}.jsx`);
  const dataPath = join(VIDEO_DIR, `${base}.data.json`);
  // Map campaign copy onto the template's REAL field keys (*_SPEC-driven adapter).
  const dataKeys = templateDataKeys(src);
  // Brand-kit cascade for motion too (S5): identity fields (brand/eyebrow) auto-
  // sync from the tiers. Same location resolution as the static path.
  const angM = (plan.angles || []).find((a) => a.id === angleId);
  const motionLocation = asset.location || (angM && angM.location) || plan.location || null;
  const motionTiers = mergeTiers(
    loadTier("brand", brand, DATA_DIR).tags,
    loadTier("location", motionLocation, DATA_DIR).tags,
    loadTier("campaign", campaign, DATA_DIR).tags,
  );
  const data = buildMotionData(asset, dataKeys, motionTiers);
  // Active brand-kit color tokens for motion. The tokenized bank templates/
  // elements read window.__BRAND__.<token> (with their literal as fallback), so
  // a non-AA kit recolors every motion creative; AA resolves to the same hexes
  // (0-diff). Any token the kit omits falls back to the authoring palette.
  const brandPalette = {};
  for (const k of COLOR_TOKEN_KEYS) brandPalette[k] = motionTiers[k] || BANK_AUTHORING_PALETTE[k];
  // Brand IDENTITY for motion chrome (corner wordmark/logo on templates like
  // coach-lower-thirds). Without these, hardcoded "ATHLETES ACCELERATION" + the AA
  // logo leak onto non-AA brands. brand_name is the tier name; logo_motion is a
  // per-brand PNG staged in the motion served dir (assets/<slug>-logo.png) when
  // present — AA has none, so it keeps its built-in fallback (0-diff).
  if (motionTiers.brand_name) brandPalette.brand_name = motionTiers.brand_name;
  if (motionTiers.url) brandPalette.url = motionTiers.url;
  const motionLogoRel = `assets/${brand}-logo.png`;
  if (existsSync(join(PROJECT_ROOT, "brand/video-templates", motionLogoRel))) brandPalette.logo_motion = motionLogoRel;

  // Hand-picked media from the video edit surface (Part 4). asset.clip/photo are
  // REAL served paths under a tracked dir (B10), relative to PROJECT_ROOT. Stage
  // a copy next to the wrapper so the headless page can load it as a sibling,
  // and bind it to the template's media key. (Motion media in render is verified
  // in the deferred live-render pass; the wiring is here.)
  // Resolve the exported clip length D up-front — the bg-frame extraction caps to
  // it (frames past D are never displayed). L = the template's intrinsic loop length.
  const dField = durationField(src);
  const L = dField ? dField.default : 0;
  let D = Math.max(1, Number(asset.templateData?.duration) || L || 8);
  if (dField) {
    if (typeof dField.min === "number") D = Math.max(dField.min, D);
    if (typeof dField.max === "number") D = Math.min(dField.max, D);
  }
  let stagedMedia = null;
  let bgFramesDir = null;        // set when a VIDEO bg is pre-extracted to frames
  let bgFramesInfo = null;       // { base, count, fps, key } → window.__bgFrames in the wrapper
  const picked = asset.photo || asset.clip;
  if (picked) {
    const abs = join(PROJECT_ROOT, picked);
    if (existsSync(abs)) {
      const mediaKey = dataKeys.find((k) => /(clip|photo|image|video|media|bg|src|poster|background)/i.test(k));
      const isVideo = /\.(mp4|mov|webm|m4v|mkv)$/i.test(picked);
      if (mediaKey && isVideo) {
        // Deterministic video background: a browser <video> can't be reliably
        // seeked frame-by-frame in the headless capture (it hyperloops or freezes),
        // so pre-extract the clip to PNG frames at render FPS and let SyncedVideo
        // show the right frame as an <img> per render frame (window.__bgFrames).
        bgFramesDir = join(VIDEO_DIR, `${base}.bgframes`);
        rmSync(bgFramesDir, { recursive: true, force: true });
        mkdirSync(bgFramesDir, { recursive: true });
        // Honor the trim window the user set in the Media tab (data.<key>_clipStart/_clipEnd,
        // editing.jsx convention): extract only [clipStart, clipEnd] so the front/back of the
        // clip is cropped. -ss before -i = fast seek; -t limits the span. No trim → full clip.
        const cs = Math.max(0, Number(data[`${mediaKey}_clipStart`]) || 0);
        const ceRaw = data[`${mediaKey}_clipEnd`];
        const ce = (typeof ceRaw === "number" && ceRaw > cs) ? ceRaw : null;
        // CAP the extraction window so a long source clip can't OOM the render: a
        // 26s clip @ 30fps = 780 PNGs decoded into memory, but frames past the
        // export duration D are never displayed. Cap to D, then to a hard frame
        // ceiling. Log the cap — never silently OOM, never silently drop the bg.
        const requestedSpanSec = ce != null ? (ce - cs) : null;
        const cap = capBgExtraction({ requestedSpanSec, exportDurationSec: D, fps: 30 });
        if (cap.capped) console.error(`[render]   ${asset.id} bg clip ${cap.note}`);
        const ffArgs = ["-y"];
        if (cs > 0) ffArgs.push("-ss", String(cs));
        ffArgs.push("-i", abs);
        ffArgs.push("-t", String(cap.spanSec));
        ffArgs.push("-vf", "fps=30", join(bgFramesDir, "%05d.png"));
        const ex = spawnSync("ffmpeg", ffArgs, { encoding: "utf8" });
        const frames = ex.status === 0 ? readdirSync(bgFramesDir).filter((f) => f.endsWith(".png")).length : 0;
        if (frames > 0) {
          bgFramesInfo = { base: `./${base}.bgframes/`, count: frames, fps: 30, key: mediaKey };
          data[mediaKey] = bgFramesInfo.base;     // truthy → template renders SyncedVideo
          console.error(`[render]   ${asset.id} bg clip → ${frames} frames @ 30fps (deterministic <img> sequence).`);
        } else {
          console.error(`[render]   note: ${asset.id} bg-frame extraction failed; rendering without background.`);
          // Surface ffmpeg's own stderr — the actionable cause (bad codec, missing
          // file, unreadable clip) was being swallowed behind a generic note.
          const errTail = String(ex.stderr || ex.error?.message || "").trim().split(/\r?\n/).filter(Boolean).slice(-4);
          for (const line of errTail) console.error(`           │ ${line}`);
          rmSync(bgFramesDir, { recursive: true, force: true }); bgFramesDir = null;
        }
      } else if (mediaKey) {
        const ext = picked.split(".").pop();
        stagedMedia = join(VIDEO_DIR, `${base}.media.${ext}`);
        copyFileSync(abs, stagedMedia);
        data[mediaKey] = `./${base}.media.${ext}`;
      } else {
        console.error(`[render]   note: ${asset.id} has a picked clip/photo but template ${tmpl} exposes no media key (${dataKeys.join(", ") || "none"}).`);
      }
    } else {
      console.error(`[render]   note: ${asset.id} picked media not found at ${picked}.`);
    }
  }
  // Audio choice persists in the plan but the render is silent for now (ffmpeg
  // mux is deferred). Log so the silent output isn't read as a bug.
  if (asset.audio && asset.audio.src) {
    console.error(`[render]   note: ${asset.id} audio "${asset.audio.src}" recorded; mux deferred (silent render).`);
  }

  writeFileSync(dataPath, JSON.stringify(data, null, 2));

  // Wrapper: define a Stage-wrapping component that mounts the bank template,
  // then INLINE the template source so its window.<compName> global actually
  // exists in the page (the renderer loads animations.jsx + elements/* but NOT
  // templates/*, so the template must be carried in here). The wrapper's window
  // global is written FIRST so detectVariationGlobal picks the wrapper (not the
  // template) as the component to mount — it mounts with {data} from __CONFIG__.
  const W = 1080, H = 1920, FPS = 30;
  // Honor the per-asset duration set via the editor slider (saved in
  // templateData.duration). Coerce to a NUMBER so the value interpolates into
  // the wrapper as a numeric literal — readStageProps (claude-design.mjs) only
  // accepts /^[0-9.]+$/ in `duration={...}`; a quoted/NaN value would silently
  // fall back to DEFAULTS (8s). Fall back to 8 when unset.
  // L = the template's intrinsic animation/loop length (SPEC duration `default`);
  // D/L resolved above (the bg-frame extraction needed D). When D > L the wrapper
  // loops the L-second animation to fill D (LoopRemap); no duration field → L=0.
  const wrapperName = `CampWrap_${slug(asset.id).replace(/-/g, "_")}`;
  const wrapper = `// Auto-generated motion wrapper for campaign "${campaign}" asset ${asset.id}.
// Renders bank template ${tmpl} (window.${compName}) inside a Stage with __CONFIG__ data.
// Active brand-kit color tokens — tokenized bank templates/elements read these via
// window.__BRAND__ (literal fallbacks keep AA + the editor preview correct when unset).
window.__BRAND__ = ${JSON.stringify(brandPalette)};
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', monospace" },
  body: { fontFamily: "'Geist', sans-serif" },
};
function ${wrapperName}({ data }) {
  const Inner = window.${compName};
  if (!Inner) return null;
  const Loop = window.LoopRemap || (function (p) { return p.children; });
  return (
    <Stage width={${W}} height={${H}} duration={${D}} fps={${FPS}} background="#0a0b0d">
      <Loop loopLength={${L}}>
        <Inner data={data || {}} />
        {window.ExtrasLayer ? <window.ExtrasLayer data={data || {}} /> : null}
      </Loop>
    </Stage>
  );
}
window.${wrapperName} = ${wrapperName};

// Pre-extracted background frames (set by run-campaign when the asset has a video
// clip). SyncedVideo renders a stable <img data-bgframe> and the patch below fills
// its src per render frame — deterministic, decode-awaited, no flaky <video> seek.
window.__bgFrames = ${bgFramesInfo ? JSON.stringify(bgFramesInfo) : "null"};

// ─── deterministic background sync ─────────────────────────────────────────
// The headless renderer screenshots each frame after \`await window.__setRenderTime(t)\`.
// We wrap it so it imperatively sets the background <img> to the frame for time t and
// AWAITS img.decode() (img decode is reliable; browser <video> seeking in this capture
// hyperlooped or froze). The renderer's await then blocks until the correct background
// frame is decoded before the screenshot. Render-only (the live preview never loads this).
(function () {
  if (typeof window === "undefined" || window.__videoSyncPatched) return;
  function pad5(n) { n = String(n); while (n.length < 5) n = "0" + n; return n; }
  function install() {
    if (typeof window.__setRenderTime !== "function") { setTimeout(install, 0); return; }
    if (window.__videoSyncPatched) return;
    window.__videoSyncPatched = true;
    var orig = window.__setRenderTime;
    window.__setRenderTime = function (t) {
      orig(t);
      var ps = [];
      var bf = window.__bgFrames;
      if (bf && bf.base && bf.count > 0) {
        var idx = Math.round(t * bf.fps) % bf.count; if (idx < 0) idx += bf.count;
        var url = bf.base + pad5(idx + 1) + ".png";
        var imgs = document.querySelectorAll("img[data-bgframe]");
        Array.prototype.forEach.call(imgs, function (im) {
          if (im.getAttribute("src") !== url) im.setAttribute("src", url);
          if (im.decode) ps.push(im.decode().catch(function () {}));
        });
      }
      // Fallback: any real <video> still present → seek + await its presented frame.
      var vids = document.querySelectorAll("video");
      Array.prototype.forEach.call(vids, function (v) {
        if (!v || !v.duration || !isFinite(v.duration) || v.duration <= 0) return;
        var target = ((t % v.duration) + v.duration) % v.duration;
        ps.push(new Promise(function (res) {
          var done = false, fin = function () { if (done) return; done = true; res(); };
          try { v.currentTime = target; } catch (e) { return fin(); }
          if (typeof v.requestVideoFrameCallback === "function") v.requestVideoFrameCallback(function () { fin(); });
          v.addEventListener("seeked", fin, { once: true });
          setTimeout(fin, 1000);
        }));
      });
      return Promise.all(ps);
    };
  }
  install();
})();

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
  if (result.ok) result.expectSeconds = D;  // render-QA duration check (G3a)
  if (!keepVariants) {
    rmSync(wrapperPath, { force: true });
    rmSync(dataPath, { force: true });
    if (stagedMedia) rmSync(stagedMedia, { force: true });
    if (bgFramesDir) rmSync(bgFramesDir, { recursive: true, force: true });
    rmSync(join(VIDEO_DIR, "__render"), { recursive: true, force: true });
  }
  return result;
}

// fresh: a creative `compose-creative` authored from scratch INTO the bank's own
// file shape (static → templates/multi-sport-foundations/<t>.{config.json,jsx};
// motion → brand/video-templates/templates/<t>.jsx). The compose step sets the
// asset's `template` to that authored basename, so a fresh asset is structurally
// identical to a bank-template asset at render time — we route it through the
// SAME proven static/motion paths. If it hasn't been authored yet, report a
// clear pending status (don't fail the batch): compose-creative runs first.
async function renderFresh(asset, angleId) {
  if (!asset.template) {
    return { ok: false, pending: true,
      error: "fresh asset not composed yet — run compose-creative to author it (it sets asset.template)" };
  }
  const authored = asset.format === "static"
    ? existsSync(join(TEMPLATE_DIR, `${asset.template}.config.json`))
    : existsSync(join(VIDEO_DIR, "templates", `${asset.template}.jsx`));
  if (!authored) {
    return { ok: false, pending: true,
      error: `fresh template "${asset.template}" not authored yet — run compose-creative first` };
  }
  return asset.format === "static"
    ? renderTemplateStatic(asset, angleId)
    : renderTemplateMotion(asset, angleId, asset.format === "gif");
}

// ── uniqueness guard ─────────────────────────────────────────────────────────
// Within each angle, every creative should be a DISTINCT design — a unique
// skeleton AND a unique source clip/image. `knobs.repetitionCap` controls
// strictness: `1` = "strict, every-asset-distinct" mode (any reuse of a template
// OR a media path is a HARD ERROR that aborts the run before rendering); any higher
// value (default 3) only WARNS, so legacy campaigns that intentionally reuse a
// skeleton up to the cap still render. Media reuse always warns; in strict mode it
// throws. Validates the authored plan as a whole (independent of --only).
function validateUniqueness(plan) {
  const cap = (plan.knobs && plan.knobs.repetitionCap) || 3;
  const strict = cap === 1;
  const push = (map, k, v) => { if (!map.has(k)) map.set(k, []); map.get(k).push(v); };
  const problems = [];
  for (const angle of plan.angles || []) {
    const assets = angle.assets || [];
    const mediaMap = new Map();
    const tplMap = new Map();
    for (const a of assets) {
      const m = a.media || a.clip || a.photo;
      if (m) push(mediaMap, m, a.id);
      if (a.template) push(tplMap, a.template, a.id);
    }
    for (const [m, ids] of mediaMap) {
      if (ids.length > 1) problems.push(`[${angle.id}] media "${m}" reused by ${ids.join(", ")}`);
    }
    for (const [tpl, ids] of tplMap) {
      if (ids.length > cap) problems.push(`[${angle.id}] template "${tpl}" used ${ids.length}× (cap ${cap}) by ${ids.join(", ")}`);
    }
  }
  if (!problems.length) return;
  const msg = `uniqueness check failed:\n  - ${problems.join("\n  - ")}`;
  if (strict) throw new Error(msg);
  console.error(`[campaign] WARNING (repetitionCap=${cap}, non-strict) ${msg}`);
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  validateUniqueness(plan);

  // ── Compliance gate (validate-plan.mjs) — refuse to render anything out of
  // spec. FAIL-CLOSED: a thrown validator counts as blocking. --force-unsafe is
  // the deliberately-awkward escape hatch.
  let report;
  try {
    report = validatePlan(plan, { campaign });
  } catch (e) {
    console.error(`[campaign] validation crashed (treated as BLOCKING): ${e.message}`);
    process.exit(2);
  }
  try { writeValidationReport(CAMPAIGNS_DIR, campaign, report, new Date().toISOString()); } catch { /* report write is best-effort */ }
  if (report.blocking > 0 && !flag("force-unsafe")) {
    console.error(`[campaign] ${report.summaryText}`);
    console.error(`[campaign] BLOCKED — ${report.blocking} hard violation(s). Run: node scripts/validate-plan.mjs ${campaign}  (or see campaigns/${campaign}/validation.json). Fix them, or re-run with --force-unsafe.`);
    process.exit(2);
  }
  if (report.blocking > 0) console.error(`[campaign] --force-unsafe set: proceeding despite ${report.blocking} blocking violation(s).`);

  const useServer = await serverUp();
  console.error(`[campaign] plan: ${planPath}`);
  console.error(`[campaign] plan patching via ${useServer ? `editor-server (${SERVER})` : "direct file write"}`);
  if (!ffmpegAvailable()) console.error("[campaign] WARNING: ffmpeg not on PATH — video/gif will fail.");

  const manifest = { campaign, generatedFrom: planPath, cells: [], summary: {} };
  let ok = 0, failed = 0, pending = 0, skipped = 0;

  // Fail loud + early if this checkout can't render anything (missing deps).
  preflightRenderEnv();

  // FONTS follow the active brand kit: stage the kit's custom font files under the
  // bank family names so the preflight resolves to them (no source/renderer edits).
  // No-op for AA / any brand that keeps the bank fonts. Removed in finally.
  const brandFile = brand ? loadBrandFile(brand, DATA_DIR).json : null;
  const cleanupFonts = stageKitFonts({ brandFile, projectRoot: PROJECT_ROOT, projectDirs: [TEMPLATE_DIR, VIDEO_DIR] });
  try {

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
        if (asset.source === "fresh") res = await renderFresh(asset, angle.id);
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
        // Render-truth QA (G3a): a file that EXISTS can still be black/frozen/blank.
        const qa = verifyRender(dest, { kind: res.ext, expectSeconds: res.expectSeconds });
        if (!qa.ok) {
          await patchAsset(useServer, angle.id, asset.id, { status: "failed", notes: `[render-qa] ${qa.reason}` });
          row.status = "failed"; row.error = `render-qa: ${qa.reason}`; row.qa = qa; failed++;
          console.error(`[render] ${tag} ✗ QA: ${qa.reason}`);
        } else {
          await patchAsset(useServer, angle.id, asset.id, {
            status: "rendered", output: destRel, thumb: destRel,
            renderedAt: new Date().toISOString(),
          });
          let fileSize = null; try { fileSize = statSync(dest).size; } catch { /* ignore */ }
          row.status = "rendered"; row.output = destRel; ok++;
          if (qa.durationSec) row.durationSec = qa.durationSec;
          if (fileSize != null) row.fileSize = fileSize;
          if (qa.skipped) row.qaSkipped = true;
          console.error(`[render] ${tag} ✓ → ${destRel}${qa.skipped ? " (qa skipped: no ffmpeg)" : ""}`);
        }
      } else if (res.pending) {
        await patchAsset(useServer, angle.id, asset.id, { status: "approved" }); // leave for later
        row.status = "pending"; row.error = res.error; pending++;
        console.error(`[render] ${tag} … pending: ${res.error}`);
      } else {
        await patchAsset(useServer, angle.id, asset.id, { status: "failed", notes: (asset.notes || "") });
        row.status = "failed"; row.error = res.error; failed++;
        console.error(`[render] ${tag} ✗ ${res.error}`);
        // Surface the captured subprocess stderr — the real, actionable cause
        // (missing dep, bad config, font/asset error) was being swallowed behind
        // a generic "exit N", so every failure looked identical and opaque.
        if (res.log && String(res.log).trim()) {
          const tail = String(res.log).trim().split(/\r?\n/).slice(-8);
          for (const line of tail) console.error(`           │ ${line}`);
        }
      }
      manifest.cells.push(row);
    }
  }

  } finally {
    cleanupFonts();
  }

  manifest.summary = { ok, failed, pending, skipped, total: manifest.cells.length };
  writeFileSync(join(campaignOut, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.error(`[campaign] done — ok:${ok} failed:${failed} pending:${pending} skipped:${skipped}`);
  console.error(`[campaign] manifest: ${join(campaignOut, "manifest.json")}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error("[campaign] fatal:", e.message); process.exit(1); });

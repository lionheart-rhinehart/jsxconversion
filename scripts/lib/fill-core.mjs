// ============================================================================
//  scripts/lib/fill-core.mjs — importable core of the template-fill pipeline
// ============================================================================
//  Extracted from fill-template.mjs so the CLI and the campaign runner share
//  ONE implementation of the cascade / substitution / variant-emit / render
//  steps (they can't drift). fill-template.mjs is now a thin CLI over this.
//
//  Output bytes are identical to the pre-refactor fill-template.mjs for the
//  same inputs (0-diff gate) — same walk order (elements → fixedDesign →
//  media/foreground), same field-aware substitution, same JSON.stringify
//  formatting, same JSX import swap.
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { assemble } from "./assemble.mjs";
import { BEAT_HEADLINE_ROLE, beatLetter, buildEyebrowAnchor } from "./roles.mjs";
import { loadCopyLibrary } from "./copy-library.mjs";
import { buildRefPools, verbatimGuard } from "./copy-resolve.mjs";
import { buildPaletteMap, remapConfigColors } from "./palette.mjs";

// ---------------------------------------------------------------------------
// Data tiers
// ---------------------------------------------------------------------------

// Load one data tier file (data/<kind>.<name>.json → its .tags object).
// Returns { tags, path, found, count }. Quiet — the caller logs.
export function loadTier(kind, name, dataDir) {
  if (!name) return { tags: {}, path: null, found: false, count: 0 };
  const path = join(dataDir, `${kind}.${name}.json`);
  if (!existsSync(path)) return { tags: {}, path, found: false, count: 0 };
  const tags = JSON.parse(readFileSync(path, "utf8")).tags || {};
  return { tags, path, found: true, count: Object.keys(tags).length };
}

// Merge tiers; later (more specific) tiers override earlier ones.
// Matches the original `{ ...brandTags, ...locationTags, ...campaignTags }`.
export function mergeTiers(brandTags = {}, locationTags = {}, campaignTags = {}) {
  return { ...brandTags, ...locationTags, ...campaignTags };
}

// ---------------------------------------------------------------------------
// Field-aware substitution (never touches styling/geometry)
// ---------------------------------------------------------------------------

// Mutates `item` in place, returns the field name written (or null).
//   text element → .text   |   rect → .fill   |   image → .src   |   circle → .label
export function fillField(item, value) {
  if (typeof item.text === "string") return (item.text = value), "text";
  if (item.type === "rect") return (item.fill = value), "fill";
  if (item.type === "image") return (item.src = value), "src";
  if (item.type === "circle") return (item.label = value), "label";
  return null;
}

// Apply all resolved tags onto a config. Works on a structuredClone so the
// caller's source object is never mutated (safe to reuse across campaign cells).
// Returns { config, subs, skipped, unusedTags } — config is the filled clone.
export function applySubstitutions(sourceConfig, resolved) {
  const config = structuredClone(sourceConfig);
  const subs = [];
  const styleSubs = [];
  const skipped = [];

  const walk = (arr) => {
    for (const item of arr || []) {
      if (!item.tag) continue;
      if (!(item.tag in resolved)) continue;
      const value = resolved[item.tag];
      const field = fillField(item, value);
      if (field) subs.push({ id: item.id, tag: item.tag, field, value });
      else skipped.push({ id: item.id, tag: item.tag, reason: "no fillable field" });
    }
  };
  // Brand-token STYLE pass: a color token fills an element's `.fill` (`fillTag`)
  // and/or its text `.color` (`colorTag`) — WITHOUT touching copy. Kept separate
  // from the `tag`→fillField walk on purpose: it must never write a hex into a
  // text slot's `.text`, and it must NOT feed `subs` (the role path derives
  // `tierFilledIds` from `subs`; a color token there would suppress a headline's
  // copy). Color tokens flow only through `styleSubs`. When a token is absent
  // from the tier, the element's literal `fill`/`color` survives as the fallback.
  const walkStyle = (arr) => {
    for (const item of arr || []) {
      if (item.fillTag && item.fillTag in resolved) {
        item.fill = resolved[item.fillTag];
        styleSubs.push({ id: item.id, tag: item.fillTag, field: "fill", value: item.fill });
      }
      if (item.colorTag && item.colorTag in resolved) {
        item.color = resolved[item.colorTag];
        styleSubs.push({ id: item.id, tag: item.colorTag, field: "color", value: item.color });
      }
    }
  };
  walk(config.elements);
  walk(config.fixedDesign);
  walkStyle(config.elements);
  walkStyle(config.fixedDesign);
  // media / foreground are taggable too — fill their .path if a tag resolves.
  for (const slot of ["media", "foregroundMedia"]) {
    const m = config[slot];
    if (m && m.tag && m.tag in resolved) {
      m.path = resolved[m.tag];
      subs.push({ id: slot, tag: m.tag, field: "path", value: resolved[m.tag] });
    }
  }

  const usedTags = new Set([...subs, ...styleSubs].map((s) => s.tag));
  const unusedTags = Object.keys(resolved).filter((t) => !usedTags.has(t));
  return { config, subs, styleSubs, skipped, unusedTags };
}

// ---------------------------------------------------------------------------
// Role-aware fill (copy-role schema) — id-keyed, so two slots that once
// shared a tag can hold different copy. Falls back to the legacy tag path
// when a config carries no `role` annotations (back-compat: untouched configs
// render byte-identically).
// ---------------------------------------------------------------------------

// Mutate `config` in place: set each matching element's fillable field by id.
export function applyById(config, bySlotId = {}) {
  const walk = (arr) => {
    for (const item of arr || []) {
      if (item && item.id && item.id in bySlotId) fillField(item, bySlotId[item.id]);
    }
  };
  walk(config.elements);
  walk(config.fixedDesign);
  for (const slot of ["media", "foregroundMedia"]) {
    const m = config[slot];
    if (m && m.id && m.id in bySlotId) fillField(m, bySlotId[m.id]);
  }
  return config;
}

// Text slots (in document order) carrying the copy-role schema fields.
function collectTextSlots(config) {
  return (config.elements || [])
    .filter((el) => typeof el.text === "string")
    .map((el) => ({
      id: el.id, role: el.role, accepts: el.accepts,
      locked: el.locked, maxChars: el.maxChars, tag: el.tag,
    }));
}

// Build the role→copy pool from a plan asset. The legacy `headline` routes to a
// role chosen by the asset's beat (A/B→hook, C→mechanism, D→reframe, E→claim,
// F→offer); `microscript` routes to reframe (eyebrow as fallback via accepts).
export function buildCopyByRole(asset) {
  const pool = {};
  const add = (role, val) => {
    if (role && typeof val === "string" && val.trim()) (pool[role] = pool[role] || []).push(val);
  };
  add(BEAT_HEADLINE_ROLE[beatLetter(asset.beat)] || "hook", asset.headline);
  add("reframe", asset.microscript);
  // Future: explicit role-keyed copy at asset.copyByRole merges straight in.
  if (asset.copyByRole && typeof asset.copyByRole === "object") {
    for (const [role, vals] of Object.entries(asset.copyByRole)) {
      for (const v of [].concat(vals || [])) add(role, v);
    }
  }
  return pool;
}

// Planner targets: templateData keyed by a slot's id (preferred) or its tag.
function buildExplicit(asset, slots) {
  const td = asset.templateData && typeof asset.templateData === "object" ? asset.templateData : {};
  const explicit = {};
  for (const s of slots) {
    if (typeof td[s.id] === "string") explicit[s.id] = td[s.id];
    else if (s.tag && typeof td[s.tag] === "string") explicit[s.id] = td[s.tag];
  }
  return explicit;
}

// ---------------------------------------------------------------------------
// Static asset config resolution (the ONE fill path)
// ---------------------------------------------------------------------------

// Resolve the filled layer-model config for a static template asset — the
// SINGLE source of the seed config shared by the campaign runner (first render)
// and the editor-server /campaign-config first-fill. Both call this so the
// editor preview and the rendered PNG can never start from different configs
// (B2: one fill path). Returns the filled config object, or null if the
// template's source config is missing.
//
//   clusterId   the asset's `template` (e.g. "cluster-12")
//   asset       the plan asset (reads templateData | headline/microscript)
//   brand       brand slug for the brand data tier
//   templateDir absolute path to templates/multi-sport-foundations
//   dataDir     absolute path to the project's data/ dir
export function resolveStaticConfig({ clusterId, asset, brand, location, campaign, templateDir, dataDir }) {
  const configPath = join(templateDir, `${clusterId}.config.json`);
  if (!existsSync(configPath)) return null;
  const sourceConfig = JSON.parse(readFileSync(configPath, "utf8"));
  // Full cascade (campaign > location > brand). loadTier is null-safe, so an
  // omitted location/campaign degrades to brand-only (back-compat). This is what
  // syncs the chosen brand kit's identity (logo/brand_name) + the per-launch
  // locale (city) onto the template's tagged slots.
  const brandTier = loadTier("brand", brand, dataDir);
  const locationTier = loadTier("location", location, dataDir);
  const campaignTier = loadTier("campaign", campaign, dataDir);
  const tierTags = mergeTiers(brandTier.tags, locationTier.tags, campaignTier.tags);
  // Brand-name alias: the cluster bank tags its wordmark element `brand`, but the
  // brand tier supplies the name as `brand_name`. Mirror it so the ACTIVE kit's
  // name syncs (AA: same text → 0-diff; any other brand: overrides the baked AA
  // wordmark). Without this every non-AA brand leaks "ATHLETES ACCELERATION" on
  // cluster-30..43 (the `brand` tag never resolves against a `brand_name`-only tier).
  if (tierTags.brand_name != null && tierTags.brand == null) tierTags.brand = tierTags.brand_name;
  // Brand-color remap: rewrite the bank's authoring colors to the ACTIVE kit's
  // (hex + rgba tints). Identity/no-op for the AA kit (0-diff); full recolor for
  // any other brand. Applied to the final filled config just before return.
  const paletteMap = buildPaletteMap(tierTags);

  // Cody's verbatim copy library (campaigns/<campaign>/copy-library.json). null
  // for campaigns with no ad-copy.md → the legacy authored-headline path is used.
  const projectRoot = dirname(dataDir);
  const library = campaign ? loadCopyLibrary(join(projectRoot, "campaigns", campaign)) : null;

  const slots = collectTextSlots(sourceConfig);
  const roleAware = slots.some((s) => s.role);

  if (roleAware) {
    // Role-aware path: tier tags fill media/logo/city by tag first, then the
    // role→slot JOIN fills the text slots by id (so duplicate tags can't collide
    // and copy lands by marketing function, not by look).
    const { config, subs } = applySubstitutions(sourceConfig, tierTags);
    const tierFilledIds = new Set(subs.map((s) => s.id));
    const explicit = buildExplicit(asset, slots);
    // S4 — auto-inject the locale context anchor into a clean eyebrow slot so
    // every creative self-contextualizes ("CARMEL SPORTS PARENTS"). The string is
    // built by the shared buildEyebrowAnchor (single source with the motion path).
    // Skips city-tagged eyebrow slots (the big stacked city graphic), tier-filled
    // slots, and any eyebrow the planner set explicitly or via copyByRole.
    const anchor = buildEyebrowAnchor(tierTags);
    if (!(asset.copyByRole && asset.copyByRole.eyebrow)) {
      const eyeSlot = slots.find(
        (s) => s.role === "eyebrow" && s.tag !== "city" && !s.locked
          && !tierFilledIds.has(s.id) && !(s.id in explicit),
      );
      if (eyeSlot) explicit[eyeSlot.id] = anchor;
    }
    // Copy by REFERENCE (verbatim, from the copy-library) when the asset carries
    // copyRefs/hookRef; otherwise the legacy authored headline/microscript path.
    // The hook ladder's budget is the headline slot's maxChars (static only).
    const headRole = BEAT_HEADLINE_ROLE[beatLetter(asset.beat)] || "hook";
    const hookSlot = slots.find((s) => s.role === headRole || (s.accepts || []).includes("hook"));
    const refPools = library
      ? buildRefPools(asset, {
          library, tierTags, maxChars: hookSlot && hookSlot.maxChars,
          warn: (m) => console.error(`[copy] ${m}`),
        })
      : null;
    const copyByRole = refPools ? refPools.pools : buildCopyByRole(asset);
    const provenance = refPools ? refPools.provenance : null;
    const { bySlotId, warnings } = assemble({ slots, copyByRole, explicit });
    for (const w of warnings) {
      console.error(`[fill] ${asset.id || clusterId} overflow: slot "${w.id}" (${w.role}) ${w.len} > maxChars ${w.maxChars}`);
    }
    // Placeholder suppression (schema-aligned anti-bleed): a CONTENT-role slot
    // that got no campaign copy AND no tier value would otherwise render the
    // template's hardcoded placeholder (e.g. "PARENTS IN PORTLAND"). Blank it
    // instead. Identity/structural roles (brand/eyebrow/byline/cta) and locked
    // (guarantee) keep their defaults; tier-filled slots (city/logo) are untouched.
    const CONTENT_ROLES = new Set(["kicker", "hook", "claim", "mechanism", "reframe", "offer", "stat", "testimonial"]);
    for (const s of slots) {
      if (s.id in bySlotId || s.locked || tierFilledIds.has(s.id)) continue;
      if (CONTENT_ROLES.has(s.role)) {
        bySlotId[s.id] = "";
        console.error(`[fill] ${asset.id || clusterId} suppressed unfilled ${s.role} slot "${s.id}" (no copy/tier value — placeholder blanked)`);
      }
    }
    applyById(config, bySlotId);

    // Verbatim guard (report-only): a content-role slot whose text isn't Cody's
    // (not from the copy-library and not a hand-edit) is the planner authoring copy.
    if (library) {
      const placedBySlot = {};
      for (const s of slots) {
        if (s.id in bySlotId && bySlotId[s.id]) placedBySlot[s.id] = { role: s.role, text: bySlotId[s.id] };
      }
      const violations = verbatimGuard({ placedBySlot, provenance: provenance || new Set(), library, asset });
      for (const v of violations) {
        console.error(`[copy] VERBATIM VIOLATION ${asset.id || clusterId} slot "${v.slotId}" (${v.role}): not from copy-library — "${String(v.text).slice(0, 60)}"`);
      }
    }
    remapConfigColors(config, paletteMap);
    return config;
  }

  // Legacy tag path (configs without roles): heuristic maps headline→title/
  // headline and microscript→microscript. Untouched configs render unchanged.
  let overrides = {};
  if (asset.templateData && typeof asset.templateData === "object") {
    overrides = { ...asset.templateData };
  } else {
    if (asset.headline) { overrides.title = asset.headline; overrides.headline = asset.headline; }
    if (asset.microscript) overrides.microscript = asset.microscript;
  }
  const resolved = mergeTiers(tierTags, {}, overrides);
  const { config } = applySubstitutions(sourceConfig, resolved);
  remapConfigColors(config, paletteMap);
  return config;
}

// ---------------------------------------------------------------------------
// Variant emit (non-mutating to source)
// ---------------------------------------------------------------------------

// Write <clusterId><suffix>.config.json + a JSX shell clone whose config
// import is swapped to point at it. `suffix` defaults to ".fill" (matches the
// original CLI); the campaign runner passes a unique per-cell suffix to avoid
// concurrent-render collisions. Returns { fillConfigPath, fillJsxPath }.
// Throws if the source JSX's config import string can't be found.
export function emitVariant({ clusterId, config, templateDir, suffix = ".fill" }) {
  const srcJsxPath = join(templateDir, `${clusterId}.jsx`);
  const fillConfigPath = join(templateDir, `${clusterId}${suffix}.config.json`);
  const fillJsxPath = join(templateDir, `${clusterId}${suffix}.jsx`);

  const srcJsx = readFileSync(srcJsxPath, "utf8");
  const fillJsx = srcJsx.replace(
    `./${clusterId}.config.json`,
    `./${clusterId}${suffix}.config.json`,
  );
  if (fillJsx === srcJsx) {
    throw new Error(
      `Could not find config import "./${clusterId}.config.json" in ${clusterId}.jsx`,
    );
  }

  writeFileSync(fillConfigPath, JSON.stringify(config, null, 2));
  writeFileSync(fillJsxPath, fillJsx);
  return { fillConfigPath, fillJsxPath };
}

// ---------------------------------------------------------------------------
// Render (promisified spawn of the jsx-to-mp4 renderer)
// ---------------------------------------------------------------------------

const DEFAULT_RENDERER = ".claude/skills/jsx-to-mp4/scripts/render.mjs";

// Render children currently in flight, so a SIGINT/SIGTERM on the PARENT (the
// run-campaign CLI, or the editor SIGTERMing run-campaign on a posix abort) can
// tree-kill them instead of orphaning their Chrome grandchild (J: reap on ALL
// exit paths, not only a child's normal exit). The renderer's own try/finally
// already covers a render that finishes or throws; this covers the parent dying.
const activeRenders = new Set();
let signalHooked = false;
function reapActiveRenders() {
  for (const proc of activeRenders) {
    try {
      if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
      else proc.kill("SIGTERM");
    } catch (_) { /* already gone */ }
  }
  activeRenders.clear();
}
function hookRenderSignals() {
  if (signalHooked) return;
  signalHooked = true;
  for (const [sig, code] of [["SIGINT", 130], ["SIGTERM", 143]]) {
    process.on(sig, () => { reapActiveRenders(); process.exit(code); });
  }
}

// Render a jsx file through the renderer. Resolves { code, ok } instead of
// calling process.exit, so it can be awaited inside a loop.
export function renderJsx({ jsxPath, projectRoot, renderer = DEFAULT_RENDERER, inherit = true }) {
  return new Promise((resolve) => {
    hookRenderSignals();
    const proc = spawn("node", [renderer, jsxPath], {
      cwd: projectRoot,
      stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    });
    activeRenders.add(proc);
    const settle = (val) => { activeRenders.delete(proc); resolve(val); };
    let stdout = "", stderr = "";
    if (!inherit) {
      proc.stdout.on("data", (d) => (stdout += d));
      proc.stderr.on("data", (d) => (stderr += d));
    }
    proc.on("exit", (code) => settle({ code, ok: code === 0, stdout, stderr }));
    proc.on("error", (err) => settle({ code: 1, ok: false, stdout, stderr: String(err) }));
    // The child reaps itself on normal exit, and its Chrome grandchild is cleaned
    // up by the renderer's own try/finally (render.mjs/static-react.mjs/
    // claude-design.mjs). If the PARENT is signal-killed mid-render, the
    // SIGINT/SIGTERM hook above tree-kills the in-flight child; the dev-start
    // orphan-sweep is the final backstop for a HARD kill (SIGKILL) that skips it.
  });
}

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
import { join } from "node:path";
import { spawn } from "node:child_process";

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
  walk(config.elements);
  walk(config.fixedDesign);
  // media / foreground are taggable too — fill their .path if a tag resolves.
  for (const slot of ["media", "foregroundMedia"]) {
    const m = config[slot];
    if (m && m.tag && m.tag in resolved) {
      m.path = resolved[m.tag];
      subs.push({ id: slot, tag: m.tag, field: "path", value: resolved[m.tag] });
    }
  }

  const unusedTags = Object.keys(resolved).filter(
    (t) => !subs.some((s) => s.tag === t),
  );
  return { config, subs, skipped, unusedTags };
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
export function resolveStaticConfig({ clusterId, asset, brand, templateDir, dataDir }) {
  const configPath = join(templateDir, `${clusterId}.config.json`);
  if (!existsSync(configPath)) return null;
  const sourceConfig = JSON.parse(readFileSync(configPath, "utf8"));
  const brandTier = loadTier("brand", brand, dataDir);
  // asset.templateData (keyed to the template's tags) wins; else a heuristic
  // maps headline→title/headline and microscript→microscript.
  let overrides = {};
  if (asset.templateData && typeof asset.templateData === "object") {
    overrides = { ...asset.templateData };
  } else {
    if (asset.headline) { overrides.title = asset.headline; overrides.headline = asset.headline; }
    if (asset.microscript) overrides.microscript = asset.microscript;
  }
  const resolved = mergeTiers(brandTier.tags, {}, overrides);
  const { config } = applySubstitutions(sourceConfig, resolved);
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

// Render a jsx file through the renderer. Resolves { code, ok } instead of
// calling process.exit, so it can be awaited inside a loop.
export function renderJsx({ jsxPath, projectRoot, renderer = DEFAULT_RENDERER, inherit = true }) {
  return new Promise((resolve) => {
    const proc = spawn("node", [renderer, jsxPath], {
      cwd: projectRoot,
      stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
    });
    let stdout = "", stderr = "";
    if (!inherit) {
      proc.stdout.on("data", (d) => (stdout += d));
      proc.stderr.on("data", (d) => (stderr += d));
    }
    proc.on("exit", (code) => resolve({ code, ok: code === 0, stdout, stderr }));
    proc.on("error", (err) => resolve({ code: 1, ok: false, stdout, stderr: String(err) }));
  });
}

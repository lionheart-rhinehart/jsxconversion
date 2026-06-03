// ============================================================================
//  scripts/lib/clone-core.mjs — importable campaign cloner (the repurpose hands)
// ============================================================================
//  Generalizes scripts/clone-locations.mjs into one cloneTarget() driven by a
//  spec instead of the hardcoded 3-location / INDIANAPOLIS preset. It copies a
//  source campaign into a destination, applying ONLY the active dimensions:
//    • textSwaps   — city/brand-name/copy token swaps in BOTH edit-config
//                    text/label AND plan templateData string values
//    • paletteMap  — brand-color remap (hex + rgba tints) across edit configs,
//                    templateData, and fresh-asset JSX (palette.mjs)
//    • identity    — logo asset swap (copied into the served dirs) + plan.brand
//    • location    — angle.location (drives the motion eyebrow at render)
//    • media       — reuse source / replace per-asset
//  Resets every asset to "approved" and clears output/thumb/kraken so the
//  orchestrator can render the target FULLY (no copy-across path). Writes the
//  dest kraken.json sidecar. Returns a report; never renders or exports itself.
// ============================================================================

import {
  readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync,
} from "node:fs";
import { join } from "node:path";
import { remapConfigColors, remapColorString } from "./palette.mjs";

const COPY_FILES = ["copy-library.json", "ad-copy.md", "microscripts.md", "brief.md", "campaign-knowledge.json"];
// The renderer serves static assets from the static template dir and motion from
// the video-templates dir; a swapped logo must land in BOTH to resolve at render.
const SERVED_ASSET_DIRS = ["templates/multi-sport-foundations/assets", "brand/video-templates/assets"];

function escapeReg(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Normalize a textSwap {from,to} into a global RegExp + replacement.
function normSwap(sw) {
  const re = sw.from instanceof RegExp
    ? (sw.from.global ? sw.from : new RegExp(sw.from.source, sw.from.flags + "g"))
    : new RegExp(escapeReg(sw.from), "g");
  return { re, to: sw.to };
}

// Apply text swaps + palette remap to a string. Text swaps first (city/brand/copy),
// then color remap (so a swapped string can still be recolored if needed).
function transformString(str, swaps, paletteMap) {
  if (typeof str !== "string") return str;
  let out = str;
  for (const { re, to } of swaps) out = out.replace(re, to);
  out = remapColorString(out, paletteMap);
  return out;
}

// Walk an edit config: text/label via swaps+palette, plus a full color remap of
// every string (catches fill/color/gradients/textShadow). Returns change count.
function transformEditConfig(cfg, swaps, paletteMap, identity) {
  let n = 0;
  for (const arr of [cfg.elements, cfg.fixedDesign, cfg.foregroundMedia]) {
    if (!Array.isArray(arr)) continue;
    for (const el of arr) {
      for (const k of ["text", "label"]) {
        if (typeof el?.[k] === "string") {
          const nx = transformString(el[k], swaps, []);
          if (nx !== el[k]) { el[k] = nx; n++; }
        }
      }
      // logo swap: an element/foreground tagged "logo" gets the new asset path.
      if (identity && identity.logo && (el?.tag === "logo") && typeof el.path === "string") {
        el.path = identity.logo; n++;
      }
    }
  }
  // media/foreground logo on the top-level media slot too.
  for (const slot of ["media", "foregroundMedia"]) {
    const m = cfg[slot];
    if (identity && identity.logo && m && m.tag === "logo" && typeof m.path === "string") {
      m.path = identity.logo; n++;
    }
  }
  // Color remap across the whole config (fill/color/rgba tints/gradients).
  n += remapConfigColors(cfg, paletteMap);
  return n;
}

// Copy a logo source file into the served asset dirs under its render-time
// basename, so the swapped `logo` tag path resolves for both static and motion.
function installLogo(projectRoot, identity) {
  if (!identity || !identity.logo || !identity.logoSrc) return;
  const src = join(projectRoot, identity.logoSrc);
  if (!existsSync(src)) throw new Error(`identity.logoSrc not found: ${src}`);
  const base = String(identity.logo).split("/").pop();
  for (const d of SERVED_ASSET_DIRS) {
    const destDir = join(projectRoot, d);
    if (!existsSync(destDir)) continue;
    copyFileSync(src, join(destDir, base));
  }
}

// Best-effort: remap brand-color literals in a fresh asset's bespoke JSX so it
// doesn't ship the source brand's red (fresh assets bypass the cascade). Returns
// {path, changed} or null when no fresh JSX is found.
function remapFreshJsx(projectRoot, srcCampaign, asset, paletteMap) {
  if (asset.source !== "fresh" || !paletteMap.length) return null;
  const candidates = [
    asset.freshJsx && join(projectRoot, asset.freshJsx),
    asset.template && join(projectRoot, "campaigns", srcCampaign, "fresh", `${asset.template}.jsx`),
    asset.template && join(projectRoot, "templates", "multi-sport-foundations", `${asset.template}.jsx`),
  ].filter(Boolean);
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    const src = readFileSync(p, "utf8");
    const next = remapColorString(src, paletteMap);
    return { path: p, changed: next !== src, exists: true };
  }
  return { path: null, changed: false, exists: false };
}

// Clone one source campaign into destCampaign, applying the active dimensions.
// Pure file work — does not render or export. Returns a report object.
export function cloneTarget({
  projectRoot,
  srcCampaign,
  destCampaign,
  textSwaps = [],
  paletteMap = [],
  identity = null,     // { logo, logoSrc, brand_name, url }
  brand = null,        // target brand slug → plan.brand
  location = null,     // target location slug → angle.location
  mediaPolicy = "reuse",
  mediaMap = {},       // assetId → media path (replace / per-asset)
  workspace = null,    // { workspace, workspaceId, destFolder, destFolderId }
}) {
  const srcDir = join(projectRoot, "campaigns", srcCampaign);
  const destDir = join(projectRoot, "campaigns", destCampaign);
  if (!existsSync(join(srcDir, "creative-plan.json"))) {
    throw new Error(`source campaign plan not found: ${join(srcDir, "creative-plan.json")}`);
  }
  mkdirSync(join(destDir, "edits"), { recursive: true });
  const swaps = textSwaps.map(normSwap);

  // If identity changes the brand wordmark text, swap it everywhere too.
  if (identity && identity.brand_name) {
    // The orchestrator passes the source brand_name as a textSwap when it knows
    // it; nothing to add here unless caller asked. (Kept explicit, not guessed.)
  }
  if (identity) installLogo(projectRoot, identity);

  // ---- plan ----
  const plan = JSON.parse(readFileSync(join(srcDir, "creative-plan.json"), "utf8"));
  plan.campaign = destCampaign;
  if (brand) plan.brand = brand;
  if (location) plan.location = location;
  let tdSwaps = 0, mediaSet = 0, freshRemapped = 0;
  const freshWarnings = [];
  for (const angle of plan.angles || []) {
    if (location) angle.location = location;
    for (const a of angle.assets || []) {
      a.status = "approved";
      delete a.output; delete a.thumb; delete a.renderedAt; delete a.editedAt; delete a.kraken;
      const td = a.templateData || {};
      for (const [k, v] of Object.entries(td)) {
        if (typeof v === "string") {
          const nx = transformString(v, swaps, paletteMap);
          if (nx !== v) { td[k] = nx; tdSwaps++; }
        }
      }
      // media: reuse leaves asset.photo/clip pointing at source media (still
      // resolves). replace/per-asset binds a new path when the map provides one.
      if ((mediaPolicy === "replace" || mediaPolicy === "per-asset") && mediaMap[a.id]) {
        const mp = mediaMap[a.id];
        if (/\.(mp4|mov|webm|m4v|mkv)$/i.test(mp)) { a.clip = mp; delete a.photo; }
        else { a.photo = mp; delete a.clip; }
        mediaSet++;
      }
      // fresh-asset JSX color remap (R8): if a fresh asset's bespoke JSX carries
      // source-brand reds, flag it (the JSX is shared/bank — we don't mutate it
      // here; the orchestrator surfaces this so it can be handled, not shipped).
      const fr = remapFreshJsx(projectRoot, srcCampaign, a, paletteMap);
      if (fr && fr.exists && fr.changed) { freshRemapped++; freshWarnings.push(`${a.id}: fresh JSX ${fr.path} contains source-brand colors`); }
    }
  }
  writeFileSync(join(destDir, "creative-plan.json"), JSON.stringify(plan, null, 2));

  // ---- copy sidecars ----
  for (const f of COPY_FILES) {
    if (existsSync(join(srcDir, f))) copyFileSync(join(srcDir, f), join(destDir, f));
  }

  // ---- edit configs ----
  let cfgFiles = 0, cfgChanges = 0;
  const srcEdits = join(srcDir, "edits");
  if (existsSync(srcEdits)) {
    for (const f of readdirSync(srcEdits)) {
      if (!f.endsWith(".config.json")) continue;
      const cfg = JSON.parse(readFileSync(join(srcEdits, f), "utf8"));
      cfgChanges += transformEditConfig(cfg, swaps, paletteMap, identity);
      writeFileSync(join(destDir, "edits", f), JSON.stringify(cfg, null, 2));
      cfgFiles++;
    }
  }

  // ---- kraken sidecar ----
  const sidecar = {
    workspace: workspace?.workspace ?? null,
    workspaceId: workspace?.workspaceId ?? null,
    destFolder: workspace?.destFolder ?? null,
    destFolderId: workspace?.destFolderId ?? null,
  };
  writeFileSync(join(destDir, "kraken.json"), JSON.stringify(sidecar, null, 2));

  return {
    destCampaign, destDir,
    counts: { editConfigs: cfgFiles, configChanges: cfgChanges, templateDataSwaps: tdSwaps, mediaSet, freshRemapped },
    freshWarnings,
  };
}

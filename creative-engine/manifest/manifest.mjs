// ============================================================================
//  creative-engine/manifest/manifest.mjs — the media library core.
//  CLEAN ROOM: zero imports from creative-engine-v1/.
// ----------------------------------------------------------------------------
//  A manifest is a single JSON file (media-manifest.json) of asset rows. Each
//  asset gets:
//    • a short, STABLE, unique id  (6 hex, deterministic hash of source identity)
//    • a descriptive slug          (tag-derived stem + "-" + id  → collision-proof)
//    • a tagged row                (facets: sport/drill/age/brand/gender + kind)
//
//  Selection happens by TAG/MEANING (see select.mjs), never by raw filename.
//  The id is derived from a stable source key, so re-running the tagger never
//  reshuffles ids (no AI, no randomness in the spine).
// ============================================================================

import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

export const MANIFEST_VERSION = 1;

// 6-hex stable id from a source key (kraken id, or a relative file path). Same
// input → same id, forever. Short enough to read; 16.7M space is ample per folder.
export function makeId(sourceKey) {
  return createHash("sha1").update(String(sourceKey)).digest("hex").slice(0, 6);
}

// Break any raw string into lowercase whole-word tokens for matching/slugging.
export function tokenize(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// Build a descriptive slug stem from a row's tags (most-specific facets first),
// falling back to the source title tokens, then "media". Always suffixed with the
// id so two assets with identical descriptive words still get distinct slugs.
export function makeSlug(row) {
  const t = row.tags || {};
  const parts = [
    ...(t.sport || []),
    ...(t.drill || []),
    ...(t.age || []),
    ...(t.brand || []),
  ];
  let stem = parts.join("-");
  if (!stem) stem = tokenize(row.source?.title).slice(0, 4).join("-");
  if (!stem) stem = "media";
  return `${stem}-${row.id}`.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

// Load a manifest file → { version, rows: [...] }. Missing → empty manifest.
export function loadManifest(path) {
  if (!existsSync(path)) return { version: MANIFEST_VERSION, rows: [] };
  const data = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(data.rows)) data.rows = [];
  return data;
}

// Persist a manifest (pretty-printed, stable key order, sorted by id for clean diffs).
export function saveManifest(path, manifest) {
  const out = {
    version: MANIFEST_VERSION,
    generatedFromVersion: manifest.version || MANIFEST_VERSION,
    count: manifest.rows.length,
    rows: [...manifest.rows].sort((a, b) => a.id.localeCompare(b.id)),
  };
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  return out;
}

// Merge a freshly-built row into a manifest by id (idempotent re-runs: update in
// place, preserving any HUMAN-supplied tag enrichment unless the builder is told
// to overwrite). Returns { manifest, added, updated }.
export function upsertRow(manifest, row, { preserveHuman = true } = {}) {
  const idx = manifest.rows.findIndex((r) => r.id === row.id);
  if (idx === -1) {
    manifest.rows.push(row);
    return { manifest, added: 1, updated: 0 };
  }
  const prev = manifest.rows[idx];
  if (preserveHuman && prev.humanTags) {
    // Human enrichment wins: union derived tags under the human-curated ones.
    row.tags = mergeTags(row.tags, prev.humanTags);
    row.humanTags = prev.humanTags;
  }
  manifest.rows[idx] = row;
  return { manifest, added: 0, updated: 1 };
}

// Union two tag bags (arrays per facet de-duped; booleans OR'd).
export function mergeTags(a = {}, b = {}) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (Array.isArray(v)) {
      out[k] = [...new Set([...(Array.isArray(out[k]) ? out[k] : []), ...v])];
    } else if (typeof v === "boolean") {
      out[k] = Boolean(out[k]) || v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

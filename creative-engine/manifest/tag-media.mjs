#!/usr/bin/env node
// ============================================================================
//  creative-engine/manifest/tag-media.mjs — deterministic media tagger + CLI.
//  CLEAN ROOM: zero imports from creative-engine-v1/.
// ----------------------------------------------------------------------------
//  Scans a media folder and, for every image/video file, writes/updates a
//  manifest row: stable id + descriptive slug + tags derived ONLY from hard
//  signal (filename tokens, folder name, optional per-file sidecar metadata,
//  mime/extension). NO AI, NO guessing. Anything it cannot confidently tag is
//  FLAGGED (`needsReview`) so a human/Kraken can enrich it — never dropped,
//  never silently guessed (Phase-1 discipline).
//
//  Sidecar (optional, mirrors the Kraken content row shape):
//      <file>.meta.json  →  { "title": "...", "krakenId": "...", "folder": "..." }
//  When present, its title is the richest signal. The stable source key prefers
//  krakenId, so re-pulls keep the same id even if the file is renamed.
//
//  Usage:
//    node creative-engine/manifest/tag-media.mjs <mediaDir> [--out <manifest.json>]
//    node creative-engine/manifest/tag-media.mjs <mediaDir> --overwrite
// ============================================================================

import { readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { join, extname, basename, dirname, relative, resolve } from "node:path";
import {
  TOKEN_FACETS,
  AGE_PATTERNS,
  VIDEO_EXT,
  IMAGE_EXT,
} from "./vocab.mjs";
import {
  makeId,
  makeSlug,
  tokenize,
  loadManifest,
  saveManifest,
  upsertRow,
} from "./manifest.mjs";

// ── tag derivation (the deterministic spine) ─────────────────────────────────
// signalTokens = every lowercase token from filename + folder + sidecar title.
// Returns { tags, matchedFacets } where tags is the facet bag.
export function deriveTags(signalTokens, ext) {
  const set = new Set(signalTokens);
  const tags = {};
  const matched = [];

  for (const [facet, vocab] of Object.entries(TOKEN_FACETS)) {
    const hits = [];
    for (const [canonical, tokens] of Object.entries(vocab)) {
      if (tokens.some((tok) => set.has(tok))) hits.push(canonical);
    }
    if (hits.length) {
      tags[facet] = hits;
      matched.push(facet);
    }
  }

  // age — regex per token
  const ages = [];
  for (const tok of set) {
    for (const { canonical, re } of AGE_PATTERNS) {
      if (re.test(tok) && !ages.includes(canonical)) ages.push(canonical);
    }
  }
  if (ages.length) {
    tags.age = ages;
    matched.push("age");
  }

  // kind — hard fact from extension
  const e = ext.replace(/^\./, "").toLowerCase();
  if (VIDEO_EXT.has(e)) {
    tags.motion = true;
    tags.kind = "motion";
  } else if (IMAGE_EXT.has(e)) {
    tags.motion = false;
    tags.kind = "static";
  }

  return { tags, matchedFacets: matched };
}

// Build one manifest row for a media file.
export function buildRow(absFile, rootDir) {
  const ext = extname(absFile);
  const name = basename(absFile, ext);
  const folder = basename(dirname(absFile));

  // sidecar (optional)
  let sidecar = {};
  const sidecarPath = absFile + ".meta.json";
  if (existsSync(sidecarPath)) {
    try {
      sidecar = JSON.parse(readFileSync(sidecarPath, "utf8"));
    } catch {
      sidecar = {};
    }
  }

  // stable source key: krakenId wins; else the path relative to root (rename-stable
  // only if no krakenId, which is the honest best we can do without it).
  const sourceKey = sidecar.krakenId
    ? `kraken:${sidecar.krakenId}`
    : `file:${relative(rootDir, absFile).replace(/\\/g, "/")}`;
  const id = makeId(sourceKey);

  const signal = [
    ...tokenize(name),
    ...tokenize(folder),
    ...tokenize(sidecar.title),
    ...tokenize(sidecar.folder),
  ];

  const { tags, matchedFacets } = deriveTags(signal, ext);

  // FLAG, never guess: a row that has neither sport nor drill is too thin to be
  // selectable by meaning → needs human/Kraken enrichment.
  const meaningful = matchedFacets.filter((f) => f === "sport" || f === "drill");
  const needsReview = meaningful.length === 0;

  const row = {
    id,
    slug: "",
    file: basename(absFile),
    relPath: relative(rootDir, absFile).replace(/\\/g, "/"),
    kind: tags.kind || "unknown",
    tags,
    freeText: [...new Set(signal)],
    source: {
      krakenId: sidecar.krakenId || null,
      title: sidecar.title || name,
      folder: sidecar.folder || folder,
    },
    needsReview,
    reviewReason: needsReview
      ? "no sport/drill tag could be derived from hard signal — enrich manually"
      : null,
  };
  row.slug = makeSlug(row);
  return row;
}

// Walk a directory (one level + nested), returning media file abs-paths.
function listMedia(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue;
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) {
      out.push(...listMedia(abs));
      continue;
    }
    const e = extname(entry).replace(/^\./, "").toLowerCase();
    if (VIDEO_EXT.has(e) || IMAGE_EXT.has(e)) out.push(abs);
  }
  return out;
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function main(argv) {
  const args = argv.slice(2);
  const mediaDir = args.find((a) => !a.startsWith("--"));
  if (!mediaDir) {
    console.error("usage: tag-media.mjs <mediaDir> [--out <manifest.json>] [--overwrite]");
    process.exit(1);
  }
  const root = resolve(mediaDir);
  if (!existsSync(root)) {
    console.error(`media dir not found: ${root}`);
    process.exit(1);
  }
  const outIdx = args.indexOf("--out");
  const outPath = outIdx !== -1 ? resolve(args[outIdx + 1]) : join(root, "media-manifest.json");
  const overwrite = args.includes("--overwrite");

  const manifest = loadManifest(outPath);
  const files = listMedia(root);

  let added = 0,
    updated = 0,
    flagged = 0;
  const ids = new Map(); // collision sanity check
  for (const f of files) {
    const row = buildRow(f, root);
    if (ids.has(row.id) && ids.get(row.id) !== row.relPath) {
      console.error(`! id collision ${row.id}: ${ids.get(row.id)} vs ${row.relPath}`);
    }
    ids.set(row.id, row.relPath);
    if (row.needsReview) flagged++;
    const r = upsertRow(manifest, row, { preserveHuman: !overwrite });
    added += r.added;
    updated += r.updated;
  }

  const saved = saveManifest(outPath, manifest);

  console.log(`manifest: ${outPath}`);
  console.log(
    `scanned ${files.length} media · added ${added} · updated ${updated} · total ${saved.count}`,
  );
  console.log(`flagged needsReview: ${flagged} (0 silent skips — every file got a row)`);
}

// Run as CLI only when invoked directly.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("tag-media.mjs")) {
  main(process.argv);
}

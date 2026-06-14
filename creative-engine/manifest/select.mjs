#!/usr/bin/env node
// ============================================================================
//  creative-engine/manifest/select.mjs — select media BY TAG/MEANING, never by
//  raw filename. CLEAN ROOM: zero imports from creative-engine-v1/.
// ----------------------------------------------------------------------------
//  Given a manifest + a query of facet constraints, return ranked matches. This
//  is the piece that defeats name collisions: a folder full of "agility drill"
//  files all share a title, but their TAGS differ, so a tag query lands the one
//  intended asset.
//
//  Scoring (deterministic):
//    • Each satisfied facet constraint = +10 (the hard signal).
//    • kind/motion match = +10.
//    • Free-text term present = +1 (tiebreaker only).
//    • A constraint the row CANNOT satisfy (facet present but value absent) is a
//      HARD miss → the row is excluded. Absent facet on the row (untagged) is a
//      soft miss → allowed through but unscored, ranked below any real match.
//
//  Usage (CLI):
//    node creative-engine/manifest/select.mjs <manifest.json> \
//        [--sport soccer] [--drill ladder] [--age u12] [--brand aa] \
//        [--kind motion|static] [--text "quick feet"] [--top N] [--json]
// ============================================================================

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { tokenize } from "./manifest.mjs";

const FACET_KEYS = ["sport", "drill", "age", "brand", "gender"];

// Score one row against a query. Returns { score, hits, excluded }.
export function scoreRow(row, query) {
  const tags = row.tags || {};
  let score = 0;
  const hits = [];

  for (const facet of FACET_KEYS) {
    const want = query[facet];
    if (!want) continue;
    const have = Array.isArray(tags[facet]) ? tags[facet] : [];
    if (have.length === 0) continue; // soft miss — untagged, don't exclude
    if (have.includes(want)) {
      score += 10;
      hits.push(`${facet}=${want}`);
    } else {
      return { score: -1, hits: [], excluded: true }; // hard miss
    }
  }

  if (query.kind) {
    if (row.kind && row.kind !== "unknown") {
      if (row.kind === query.kind) {
        score += 10;
        hits.push(`kind=${query.kind}`);
      } else {
        return { score: -1, hits: [], excluded: true };
      }
    }
  }

  if (query.text) {
    const terms = tokenize(query.text);
    const free = new Set(row.freeText || []);
    for (const t of terms) if (free.has(t)) { score += 1; hits.push(`text:${t}`); }
  }

  return { score, hits, excluded: false };
}

// Select ranked matches. Rows with score 0 (no positive evidence) are dropped
// unless the query was empty.
export function select(manifest, query, { top = Infinity } = {}) {
  const rows = manifest.rows || [];
  const hasConstraint = FACET_KEYS.some((k) => query[k]) || query.kind || query.text;
  const scored = [];
  for (const row of rows) {
    const { score, hits, excluded } = scoreRow(row, query);
    if (excluded) continue;
    if (hasConstraint && score <= 0) continue;
    scored.push({ row, score, hits });
  }
  scored.sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id));
  return scored.slice(0, top);
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function parseArgs(args) {
  const q = {};
  let top = Infinity;
  let json = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--json") { json = true; continue; }
    if (a === "--top") { top = Number(args[++i]); continue; }
    if (a.startsWith("--")) { q[a.slice(2)] = args[++i]; continue; }
  }
  return { q, top, json };
}

function main(argv) {
  const args = argv.slice(2);
  const manifestPath = args.find((a) => !a.startsWith("--"));
  if (!manifestPath) {
    console.error('usage: select.mjs <manifest.json> [--sport ..] [--drill ..] [--age ..] [--brand ..] [--kind ..] [--text ".."] [--top N] [--json]');
    process.exit(1);
  }
  const path = resolve(manifestPath);
  if (!existsSync(path)) {
    console.error(`manifest not found: ${path}`);
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  const rest = args.filter((a) => a !== manifestPath);
  const { q, top, json } = parseArgs(rest);
  const results = select(manifest, q, { top });

  if (json) {
    console.log(JSON.stringify(results.map((r) => ({ id: r.row.id, slug: r.row.slug, score: r.score, hits: r.hits })), null, 2));
    return;
  }

  console.log(`query: ${JSON.stringify(q)}`);
  console.log(`${results.length} match(es) from ${manifest.rows.length} assets:\n`);
  for (const { row, score, hits } of results) {
    console.log(`  [${score}] ${row.id}  ${row.slug}`);
    console.log(`        file=${row.file}  kind=${row.kind}  hits=${hits.join(", ")}`);
  }
  if (!results.length) console.log("  (no asset satisfies the query)");
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("select.mjs")) {
  main(process.argv);
}

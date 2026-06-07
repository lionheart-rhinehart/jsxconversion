// ============================================================================
//  scripts/example-sidecar/manifest-util.mjs — shared, SIDE-EFFECT-FREE helpers
// ============================================================================
//  The static generator (author-examples.mjs) and the video generator
//  (author-video-examples.mjs) both write into templates/_examples/ and into the
//  SAME examples.manifest.json. They must NOT clobber each other (D-CRIT in the plan:
//  the old whole-dir rmSync deleted the other generator's work). So each generator
//  OWNS a disjoint id set and uses these helpers to:
//    • remove ONLY its own ids' authored files (jsx + assets — never the rendered .png,
//      which render-examples.mjs owns, and never another generator's ids), and
//    • MERGE its rows into the manifest (replace its own ids, preserve everything else).
//
//  Pure module: exports functions only, no top-level side effects, so importing it
//  from either generator never triggers a write.
// ============================================================================

import { existsSync, readFileSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

// ONE shared note — both generators write this manifest, so a single note describes
// the whole library (otherwise the note would flip to whichever generator ran last).
export const SHARED_NOTE = "Track-B authoring manifest — static examples from author-examples.mjs, video examples from author-video-examples.mjs. Edit the generators' design arrays, not this file.";

// ex-<NNN>-<slug> → the integer NNN (for stable manifest ordering).
export function idNum(id) {
  const m = /^ex-(\d+)-/.exec(id);
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
}

// Remove the AUTHORED files for a set of owned ids: <id>.jsx and assets/<id>-*.*.
// Deliberately does NOT touch <id>.png/.mp4 (render-examples.mjs owns rendered
// artifacts) nor any id outside `ownedIds` (the other generator's work).
export function removeOwnedSources({ examplesDir, assetsDir, ownedIds }) {
  if (existsSync(examplesDir)) {
    for (const f of readdirSync(examplesDir)) {
      const m = /^(ex-\d+-[\w-]+)\.jsx$/.exec(f);
      if (m && ownedIds.has(m[1])) rmSync(join(examplesDir, f), { force: true });
    }
  }
  if (existsSync(assetsDir)) {
    for (const f of readdirSync(assetsDir)) {
      const m = /^(ex-\d+-[\w-]+)-\d+\./.exec(f); // <id>-<n>.<ext>
      if (m && ownedIds.has(m[1])) rmSync(join(assetsDir, f), { force: true });
    }
  }
}

// Replace the rows whose id is in `ownedIds` with `rows`; keep all other rows
// (the other generator's). Stable order by numeric id so the file is diff-friendly
// and BYTE-IDENTICAL when only one generator's rows exist.
export function mergeManifest({ manifestPath, rows, ownedIds }) {
  let existing = { examples: [] };
  if (existsSync(manifestPath)) {
    try { existing = JSON.parse(readFileSync(manifestPath, "utf8")); } catch { /* fall back to empty */ }
  }
  const others = (existing.examples || []).filter((e) => !ownedIds.has(e.id));
  const merged = [...others, ...rows].sort((a, b) => idNum(a.id) - idNum(b.id));
  const out = { note: SHARED_NOTE, examples: merged };
  writeFileSync(manifestPath, JSON.stringify(out, null, 2) + "\n");
  return merged.length;
}

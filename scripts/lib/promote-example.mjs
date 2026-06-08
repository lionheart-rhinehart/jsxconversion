// ============================================================================
//  scripts/lib/promote-example.mjs — harvest an approved creative into the library
// ============================================================================
//  Opt-in "Save as example": a campaign creative that Cody approved becomes a new
//  labeled EXAMPLE (more teaching material + better archetype coverage) — NOT a
//  fill-template. We keep the STRUCTURE (archetype + the copy-shape its slots expose +
//  the rendered artifact for embedding) and drop the campaign-specific copy/brand.
//  The new entry must pass `validateExampleEntry` before it can land (the contract is
//  the authority). Pure derivations are exported + tested; the CLI does the IO + the
//  heavier re-label / centroid-rebuild. Follows the single-writer `writeAtomic` so a
//  crash mid-save can't corrupt the index.
// ============================================================================

import { readFileSync, writeFileSync, renameSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import {
  makeExampleId, isExampleId, validateExampleEntry, exampleImagePath, exampleMotionPath,
  exampleSourcePaths, loadExampleIndex, INDEX_PATH,
} from "./example-library.mjs";

const isStr = (v) => typeof v === "string" && v.trim().length > 0;

// Next free sequence number for a new ex-<NNN>-<slug> id (max existing + 1).
export function nextExampleSeq(index) {
  let max = 0;
  for (const id of Object.keys((index && index.examples) || {})) {
    const m = /^ex-(\d{3,})-/.exec(id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

// Derive the copy SHAPE (the slotShape contract) from what the creative actually
// renders: static → the edits-config `elements` with a role; motion → the roled
// templateData fields (maxChars unknown → null). Campaign-agnostic by construction —
// it's the role/capacity skeleton, never the specific words.
export function deriveSlotShape(resolved) {
  const slots = [];
  const seen = new Set();
  for (const f of (resolved.fields || [])) {
    if (!isStr(f.role) || seen.has(f.key)) continue;
    seen.add(f.key);
    slots.push({
      id: f.key, role: f.role,
      maxChars: (typeof f.maxChars === "number" && f.maxChars > 0) ? f.maxChars : null,
      required: f.required !== false,
    });
  }
  const roleSet = [...new Set(slots.map((s) => s.role))];
  return { slots, roleSet };
}

// Build a contract-VALID example entry (throws if validateExampleEntry rejects it).
export function buildEntry({ exampleId, archetype, format, mediaStyleAccepts = [], slotShape, hasMotion = false }) {
  const entry = {
    archetype, format,
    mediaStyleAccepts: Array.isArray(mediaStyleAccepts) ? mediaStyleAccepts : [],
    slotShape,
    renderedImagePath: exampleImagePath(exampleId),
    sourcePath: exampleSourcePaths(exampleId).jsx,
  };
  if (hasMotion) entry.motionPath = exampleMotionPath(exampleId);
  const { errors } = validateExampleEntry(exampleId, entry);
  if (errors.length) throw new Error(`promote: entry invalid — ${errors.join("; ")}`);
  return entry;
}

function writeAtomic(path, text) {
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, text);
  renameSync(tmp, path);
}

// Append a built entry + copy its rendered artifact(s) into the library. Pure-ish: all
// paths are under `root`. Returns { exampleId, entry }. Refuses a duplicate id and a
// label that collides with an existing slug.
export function appendToLibrary({ root, exampleId, entry, sourceImage, sourceMotion, sourceJsx }) {
  const indexPath = join(root, INDEX_PATH);
  const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")) : loadExampleIndex(root);
  index.examples = index.examples || {};
  if (index.examples[exampleId]) throw new Error(`promote: ${exampleId} already exists in the index`);

  // copy the rendered artifact(s) to the canonical contract paths
  const destImg = join(root, entry.renderedImagePath);
  mkdirSync(dirname(destImg), { recursive: true });
  if (!sourceImage || !existsSync(sourceImage)) throw new Error(`promote: rendered image not found (${sourceImage})`);
  copyFileSync(sourceImage, destImg);
  if (entry.motionPath && sourceMotion && existsSync(sourceMotion)) copyFileSync(sourceMotion, join(root, entry.motionPath));
  if (sourceJsx && existsSync(sourceJsx)) copyFileSync(sourceJsx, join(root, entry.sourcePath));

  index.examples[exampleId] = entry;
  writeAtomic(indexPath, JSON.stringify(index, null, 2) + "\n");
  return { exampleId, entry };
}

export { isExampleId, makeExampleId };

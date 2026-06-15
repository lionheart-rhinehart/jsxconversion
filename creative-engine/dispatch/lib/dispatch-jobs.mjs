// creative-engine/dispatch/lib/dispatch-jobs.mjs
//
// Phase 6 — normalize a render/fanout manifest (Phase 5 output) into a flat list
// of DISPATCH JOBS. This is the seam between render and dispatch: it reads the
// manifest as DATA (no cross-phase code import) and joins each rendered output to
// its brand's routing target from the brand registry.
//
//   render/_out/fanout-manifest.json  { jobs: [{ id, out, ok, attempts, ms }] }
//   render/brands/registry.json       { brands: [{ id, workspace, dest, ... }] }
//                  ↓ joinJobs()
//   [{ id, file, type, brand, workspace, destFolder, ok }]
//
// `id` in a fanout manifest IS the brand id, so the join is by id. A plain pool
// manifest (no brand) joins to nothing → brand/workspace stay null and the caller
// must supply a --workspace/--folder explicitly.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, '..', '..', '..');

// Resolve a manifest's `out` (may be relative to project root, or absolute).
function resolveOut(out) {
  if (!out) return null;
  return path.isAbsolute(out) ? out : path.join(PROJECT_ROOT, out);
}

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const VIDEO_EXT = new Set(['.mp4', '.mov', '.webm', '.m4v']);
export function typeForFile(file) {
  const ext = path.extname(file || '').toLowerCase();
  if (VIDEO_EXT.has(ext)) return 'video';
  if (IMAGE_EXT.has(ext)) return 'image';
  return 'image';
}

export function loadManifest(manifestPath) {
  const abs = path.isAbsolute(manifestPath) ? manifestPath : path.join(PROJECT_ROOT, manifestPath);
  if (!fs.existsSync(abs)) throw new Error(`manifest not found: ${abs}`);
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

export function loadRegistry(registryPath) {
  const abs = registryPath
    ? (path.isAbsolute(registryPath) ? registryPath : path.join(PROJECT_ROOT, registryPath))
    : path.join(PROJECT_ROOT, 'creative-engine', 'render', 'brands', 'registry.json');
  if (!fs.existsSync(abs)) return { brands: [] };
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

// Join manifest jobs → dispatch jobs. Only ok:true jobs are dispatchable — a
// failed/killed render is NEVER pushed (no silent dispatch of a broken file).
// `destFolder` falls back to opts.folder, then the brand's `libraryFolder`, then
// the basename of the brand's local `dest` so a routing target always exists.
export function joinJobs(manifest, registry, opts = {}) {
  const brands = new Map((registry.brands || []).map((b) => [b.id, b]));
  const jobs = [];
  const skipped = [];
  for (const j of manifest.jobs || []) {
    if (!j.ok) { skipped.push({ id: j.id, reason: 'render failed', error: j.error || null }); continue; }
    const file = resolveOut(j.out);
    if (!file || !fs.existsSync(file)) { skipped.push({ id: j.id, reason: 'output file missing', file }); continue; }
    const brand = brands.get(j.id) || null;
    const workspace = opts.workspace || brand?.workspace || null;
    const destFolder = opts.folder || brand?.libraryFolder || (brand?.dest ? path.basename(brand.dest) : null);
    jobs.push({
      id: j.id,
      file,
      type: typeForFile(file),
      brand: brand ? brand.id : null,
      workspace,
      destFolder,
      ok: true,
    });
  }
  return { jobs, skipped };
}

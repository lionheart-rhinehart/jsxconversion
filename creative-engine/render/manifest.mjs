// creative-engine/render/manifest.mjs
//
// 5.2 — the batch manifest. EVERY job's success/failure is written here, so a
// crashed/killed/timed-out job is VISIBLE, never a silent drop. Append-friendly:
// load → push results → save. One file per batch (or a rolling default).

import fs from 'node:fs';
import path from 'node:path';

export function newManifest(batchId) {
  return {
    batchId: batchId || 'batch',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    jobs: [],   // { id, out, ok, attempts, ms, error }
  };
}

export function summarize(manifest) {
  const ok = manifest.jobs.filter((j) => j.ok).length;
  const failed = manifest.jobs.length - ok;
  return { total: manifest.jobs.length, ok, failed };
}

export function writeManifest(manifest, outPath) {
  manifest.finishedAt = manifest.finishedAt || new Date().toISOString();
  manifest.summary = summarize(manifest);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
  return outPath;
}

// creative-engine/dispatch/dispatch.mjs
//
// Phase 6 — the orchestrator. Takes a render/fanout manifest and routes every
// rendered output onward: to the Content Library (6.1) and/or the Meta queue (6.2).
// Brand fan-out auto-routes — each job carries the brand's workspace + dest folder
// from the registry, so a 6-brand batch lands 6 outputs in 6 brand folders with no
// per-brand args.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadManifest, loadRegistry, joinJobs } from './lib/dispatch-jobs.mjs';
import { dispatchBatch } from './content-library.mjs';
import { writePublishPlan } from './meta-queue.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(HERE, '_out');

// Resolve jobs from a manifest + registry, applying caller overrides (workspace/folder).
export function resolveJobs(manifestPath, opts = {}) {
  const manifest = loadManifest(manifestPath);
  const registry = loadRegistry(opts.registry);
  const batchId = opts.batchId || manifest.batchId || 'dispatch';
  const { jobs, skipped } = joinJobs(manifest, registry, opts);
  return { batchId, jobs, skipped };
}

// 6.1 — Content Library lane.
export async function dispatchToLibrary(manifestPath, opts = {}) {
  const { batchId, jobs, skipped } = resolveJobs(manifestPath, opts);
  const { results, summary } = await dispatchBatch(jobs, { ...opts, batchId });
  const report = {
    lane: 'content-library', batchId, live: !!opts.live,
    skipped, results, summary, writtenAt: new Date().toISOString(),
  };
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `dispatch-library-${batchId}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  return { reportPath: out, ...report };
}

// 6.2 — Meta queue lane (always staged; never fires live).
export function dispatchToMeta(manifestPath, opts = {}) {
  const { batchId, jobs, skipped } = resolveJobs(manifestPath, opts);
  const { path: planPath, plan } = writePublishPlan(jobs, { ...opts, batchId });
  return { planPath, plan, skipped };
}

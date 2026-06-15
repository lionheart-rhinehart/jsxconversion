// creative-engine/dispatch/dispatch.mjs
//
// Phase 6 — the orchestrator. Takes a render/fanout manifest and routes every
// rendered output onward: to the Content Library (6.1) and/or the Meta queue (6.2).
// Brand fan-out auto-routes — each job carries the brand's workspace + dest folder
// from the registry, so a 6-brand batch lands 6 outputs in 6 brand folders with no
// per-brand args.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
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

// Remote publish lane — make an intake package reachable off-laptop (upload its tree to
// Storage + register one content_outputs + approvals row per frame). Thin wrapper so
// publish rides the dispatch orchestrator; the real work + the human-authorized DRY-RUN
// default live in publish-package.mjs. Spawned (not imported) so its process-arg CLI runs
// unchanged. opts: { workspace, folder, email, live, replace, limit, portalBase }.
export function dispatchPublishPackage(pkg, opts = {}) {
  const script = path.join(HERE, 'publish-package.mjs');
  const args = ['--pkg', String(pkg)];
  if (opts.workspace) args.push('--workspace', String(opts.workspace));
  if (opts.folder) args.push('--folder', String(opts.folder));
  if (opts.email) args.push('--email', String(opts.email));
  if (opts.portalBase) args.push('--portal-base', String(opts.portalBase));
  if (opts.limit) args.push('--limit', String(opts.limit));
  if (opts.replace) args.push('--replace');
  if (opts.live) args.push('--live');
  const r = spawnSync(process.execPath, [script, ...args], { stdio: 'inherit' });
  return { ok: r.status === 0, status: r.status, args };
}

// 6.2 — Meta queue lane (always staged; never fires live).
export function dispatchToMeta(manifestPath, opts = {}) {
  const { batchId, jobs, skipped } = resolveJobs(manifestPath, opts);
  const { path: planPath, plan } = writePublishPlan(jobs, { ...opts, batchId });
  return { planPath, plan, skipped };
}

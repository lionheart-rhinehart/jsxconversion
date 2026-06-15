// creative-engine/render/pool.mjs
//
// 5.1 — the pooled render queue. A configurable N-at-a-time wrapper around the
// verified single-render path (run-job.mjs → render-frame.mjs child process).
//
// Behavior:
//   - At most `size` jobs run concurrently (default from probe(), capped conservative).
//   - As each slot frees, the next queued job starts — a true sliding window, not
//     fixed batches, so a fast job doesn't idle behind a slow one.
//   - FAILURE ISOLATION (5.2): runJob never throws — one crashed/killed/timed-out
//     job records a failure result and the window keeps moving. Nothing wedges.
//   - Every result (ok or fail) lands in the manifest — no silent drops.

import { runJob } from './run-job.mjs';
import { probe } from './probe.mjs';
import { newManifest, writeManifest, summarize } from './manifest.mjs';

// Run `jobs` with at most `size` concurrent. Returns the populated manifest.
// opts: { size?, batchId?, manifestPath?, onResult?(result) }
export async function runPool(jobs, opts = {}) {
  const size = Math.max(1, opts.size || probe().recommended);
  const manifest = newManifest(opts.batchId);
  manifest.poolSize = size;

  let next = 0;
  const queue = jobs.slice();

  async function worker() {
    while (next < queue.length) {
      const i = next++;
      const job = queue[i];
      const result = await runJob(job);   // never throws
      manifest.jobs.push(result);
      if (opts.onResult) { try { opts.onResult(result, manifest); } catch (_) {} }
      // incremental persistence so a parent crash mid-batch still leaves a manifest
      if (opts.manifestPath) writeManifest(manifest, opts.manifestPath);
    }
  }

  const workers = Array.from({ length: Math.min(size, queue.length) }, () => worker());
  await Promise.all(workers);

  if (opts.manifestPath) writeManifest(manifest, opts.manifestPath);
  return manifest;
}

export { summarize };

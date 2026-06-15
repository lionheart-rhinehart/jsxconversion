// creative-engine/render/poller.mjs
//
// 5.3 — the LOCAL render poller. Long-running process in THIS repo that watches
// Supabase for approved-and-unrendered rows and renders them through the 5.1 pool.
//
// Transport is ONE-DIRECTIONAL (the gap /ultrathink caught): a web app cannot reach
// into a local CLI, so Kraken only ever WRITES status; we only ever POLL + render.
//
// Change-detection is the option-B local ledger keyed on (id, updated_at): a row
// "needs render" when status='approved' AND that exact (id,updated_at) isn't recorded.
// Re-approval after an edit bumps updated_at → re-render; an unchanged done row skips.
//
// Built with an INJECTABLE source so it runs identically against the live Kraken
// (default) OR a local fixture (test-poller.mjs) — no Kraken round-trip needed to prove it.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Ledger } from './ledger.mjs';
import { runPool } from './pool.mjs';
import { buildJobFromApproval, fetchToFile } from './approvals.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default live source: the sanctioned secret-safe transport module.
async function liveSource() {
  const k = await import('../../scripts/lib/kraken.mjs');
  return {
    listApproved: () => k.listApprovedApprovals(),
    getContentOutput: (id) => k.getContentOutput(id),
  };
}

// Run ONE poll cycle. Returns { picked, rendered, failed, skipped, results }.
// opts: { source, ledger, outDir, cacheDir, poolSize, kind, fetchTagged, log }
export async function pollOnce(opts = {}) {
  const source = opts.source || (await liveSource());
  const ledger = opts.ledger || new Ledger();
  const outDir = opts.outDir || path.join(__dirname, '_out', 'rendered');
  const cacheDir = opts.cacheDir || path.join(__dirname, '_state', 'tagged-cache');
  const fetchTagged = opts.fetchTagged || fetchToFile;
  const kind = opts.kind || 'mp4';
  const log = opts.log || (() => {});

  const rows = await source.listApproved();
  const needed = rows.filter((r) => ledger.needsRender(r));
  log(`poll: ${rows.length} approved, ${needed.length} need render`);

  const jobs = [];
  const rowByJobId = {};
  for (const row of needed) {
    try {
      const co = await source.getContentOutput(row.content_output_id);
      if (!co) throw new Error(`content_output ${row.content_output_id} not found`);
      const meta = co.metadata || {};
      const taggedUrl = meta.tagged_url || meta.live_url || co.content;
      if (!taggedUrl) throw new Error(`no tagged_url/live_url in content_output ${co.id} metadata`);
      const taggedPath = await fetchTagged(taggedUrl, cacheDir);
      const job = buildJobFromApproval({ approval: row, contentOutput: co, taggedPath, outDir, kind });
      jobs.push(job);
      rowByJobId[job.id] = row;
    } catch (e) {
      log(`  ✗ ${row.id} skipped (will retry next tick): ${e.message}`);
    }
  }

  if (!jobs.length) return { picked: needed.length, rendered: 0, failed: 0, skipped: needed.length - jobs.length, results: [] };

  const manifest = await runPool(jobs, {
    size: opts.poolSize,
    batchId: `poll-${Date.now()}`,
    manifestPath: path.join(outDir, 'poll-manifest.json'),
    onResult: (r) => {
      if (r.ok) {
        const row = rowByJobId[r.id];
        ledger.record(row.id, row.updated_at, { out: r.out });   // only record SUCCESS → failures retry next tick
        log(`  ✓ rendered ${r.id} → ${r.out}`);
      } else {
        log(`  ✗ render failed ${r.id}: ${r.error.split('\n')[0]} (left un-recorded → retries)`);
      }
    },
  });

  const rendered = manifest.jobs.filter((j) => j.ok).length;
  return {
    picked: needed.length,
    rendered,
    failed: manifest.jobs.length - rendered,
    skipped: needed.length - jobs.length,
    results: manifest.jobs,
  };
}

// Long-running loop. Ctrl-C to stop. intervalMs between cycles.
export async function pollLoop(opts = {}) {
  const intervalMs = opts.intervalMs || 15000;
  const log = opts.log || ((m) => console.log(`[poller ${new Date().toISOString()}] ${m}`));
  const ledger = opts.ledger || new Ledger();
  log(`render poller started — polling every ${intervalMs}ms (Ctrl-C to stop)`);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await pollOnce({ ...opts, ledger, log });
    } catch (e) {
      log(`poll cycle error (continuing): ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

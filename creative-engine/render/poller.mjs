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
import { buildJobFromApproval, fetchToFile, isServedLive, isRemotePackage, materializeRemotePackage } from './approvals.mjs';
import { PROJECT_ROOT } from '../editor/serve.mjs';
import { createServer } from '../editor/serve.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default live source: the sanctioned secret-safe transport module.
async function liveSource() {
  const k = await import('../../scripts/lib/kraken.mjs');
  return {
    listApproved: () => k.listApprovedApprovals(),
    getContentOutput: (id) => k.getContentOutput(id),
  };
}

// Default WRITE-BACK: after a render, upload the MP4 into Kraken and file it in the
// SAME workspace+folder as the source embed, then stamp video_url on the approval so
// Kraken can show the finished result. Runs only against the LIVE Kraken (skipped when
// the caller injected a fake source — i.e. tests). { row } is the approval row (carries
// workspace_id, task_name); { co } is the content_output (carries folder_id, thumbnail_url).
async function defaultWriteBack({ row, co, out }, { log = () => {} } = {}) {
  if (!row || !row.workspace_id) { log(`    ⚠ no workspace_id on ${row && row.id} — skipping write-back`); return; }
  const k = await import('../../scripts/lib/kraken.mjs');
  const mime = 'video/mp4';
  const bucket = k.bucketForMime(mime); // → 'content-videos'
  const stamp = String(row.updated_at || row.responded_at || '').replace(/[^0-9]/g, '').slice(0, 14) || 'render';
  const storagePath = `render-poller/${row.workspace_id}/${row.id}-${stamp}.mp4`;
  const { url } = await k.uploadToStorage(out, bucket, storagePath, mime);
  const ingested = await k.ingestContent({
    workspace_id: row.workspace_id,
    type: 'video',
    title: row.task_name || `Rendered ${row.id}`,
    content: url,
    thumbnail_url: (co && co.thumbnail_url) || null,
    metadata: {
      source: 'render-poller',
      approval_id: row.id,
      content_output_id: row.content_output_id || (co && co.id) || null,
      storage_url: url, storage_bucket: bucket, storage_path: storagePath, mime_type: mime,
      rendered_at: new Date().toISOString(),
    },
  });
  if (co && co.folder_id && ingested && ingested.id) {
    try { await k.setFolder(ingested.id, co.folder_id); }
    catch (e) { log(`    ⚠ setFolder failed: ${e.message}`); }
  }
  try { await k.setApprovalVideoUrl(row.id, url); }
  catch (e) { log(`    ⚠ video_url patch failed: ${e.message}`); }
  log(`    ↑ delivered video → ${url}${co && co.folder_id ? ` (folder ${co.folder_id})` : ' (no folder)'}`);
}

// Run ONE poll cycle. Returns { picked, rendered, failed, skipped, results }.
// opts: { source, ledger, outDir, cacheDir, poolSize, kind, fetchTagged, log }
export async function pollOnce(opts = {}) {
  const source = opts.source || (await liveSource());
  const ledger = opts.ledger || new Ledger();
  const outDir = opts.outDir || path.join(__dirname, '_out', 'rendered');
  const cacheDir = opts.cacheDir || path.join(__dirname, '_state', 'tagged-cache');
  const remoteCacheDir = opts.remoteCacheDir || path.join(__dirname, '_state', 'remote-cache');
  const projectRoot = opts.projectRoot || PROJECT_ROOT;
  const fetchTagged = opts.fetchTagged || fetchToFile;
  const kind = opts.kind || 'mp4';
  const log = opts.log || (() => {});

  const rows = await source.listApproved();
  const needed = rows.filter((r) => ledger.needsRender(r));
  log(`poll: ${rows.length} approved, ${needed.length} need render`);

  // Resolve each needed row's content_output FIRST, so we know whether any of them are
  // ZERO-LOSS live exports — those must be SERVED over HTTP (render-live loads a URL, not a
  // file). If ≥1 is, start ONE local server for the whole cycle (reuse the editor's serve.mjs,
  // the same pattern intake/lib/frame-map.mjs uses) and hand each live job a baseUrl. The
  // server outlives every child render because runPool is awaited before the finally that
  // closes it.
  const resolved = [];
  for (const row of needed) {
    try {
      const co = await source.getContentOutput(row.content_output_id);
      if (!co) throw new Error(`content_output ${row.content_output_id} not found`);
      resolved.push({ row, co });
    } catch (e) {
      log(`  ✗ ${row.id} skipped (will retry next tick): ${e.message}`);
    }
  }
  const anyLive = resolved.some(({ co }) => isServedLive(co.metadata || {}, 'http://x'));

  let server = null, baseUrl = null;
  if (anyLive) {
    const started = await new Promise((resolve, reject) => {
      const s = createServer();
      s.on('error', reject);
      s.listen(0, '127.0.0.1', () => resolve({ s, port: s.address().port }));
    });
    server = started.s; baseUrl = `http://127.0.0.1:${started.port}`;
    log(`  live exports present → serving repo root at ${baseUrl}`);
  }

  try {
    const jobs = [];
    const rowByJobId = {};
    const contentOutputByJobId = {};
    for (const { row, co: co0 } of resolved) {
      try {
        let co = co0;
        let meta = co.metadata || {};
        // REMOTE package (published to Storage): download-and-serve it into a local
        // cache so headless Chrome never loads Storage's text/plain-downgraded HTML.
        // The localized clone makes the existing isServedLive/deriveLiveUrl resolve it
        // against the poller's own server (no Storage content-type / nosniff issue).
        if (isRemotePackage(meta)) {
          meta = await materializeRemotePackage(meta, { cacheRoot: remoteCacheDir, projectRoot });
          co = { ...co, metadata: meta };
          log(`  ↓ ${row.id}: pulled remote package → ${path.relative(projectRoot, meta._remote_cached)}`);
        }
        const taggedUrl = meta.tagged_url || meta.live_url || co.content;
        if (!taggedUrl) throw new Error(`no tagged_url/live_url in content_output ${co.id} metadata`);
        // Live exports are served in place (no local cache); static rows fetch+cache as before.
        // honor asset_base so a remote static design's relative media/fonts still resolve.
        const taggedPath = isServedLive(meta, baseUrl)
          ? null
          : await fetchTagged(taggedUrl, cacheDir, { assetBase: meta.asset_base });
        const job = buildJobFromApproval({ approval: row, contentOutput: co, taggedPath, outDir, kind, baseUrl });
        jobs.push(job);
        rowByJobId[job.id] = row;
        contentOutputByJobId[job.id] = co;
      } catch (e) {
        log(`  ✗ ${row.id} skipped (will retry next tick): ${e.message}`);
      }
    }

    if (!jobs.length) return { picked: needed.length, rendered: 0, failed: 0, skipped: needed.length - jobs.length, results: [] };

    // Write-back is ON by default (live + scoped-live runs both deliver the MP4 to
    // Kraken). Tests opt OUT explicitly by passing writeBack: null (a falsy override),
    // so a fixture run never touches the real Kraken.
    const writeBack = opts.writeBack !== undefined ? opts.writeBack : defaultWriteBack;
    const renderedItems = [];

    const manifest = await runPool(jobs, {
      size: opts.poolSize,
      batchId: `poll-${Date.now()}`,
      manifestPath: path.join(outDir, 'poll-manifest.json'),
      onResult: (r) => {
        if (r.ok) {
          // Defer ledger.record until AFTER write-back so a failed upload re-renders
          // next tick instead of stranding the video locally.
          renderedItems.push({ row: rowByJobId[r.id], co: contentOutputByJobId[r.id], out: r.out });
          log(`  ✓ rendered ${r.id} → ${r.out}`);
        } else {
          log(`  ✗ render failed ${r.id}: ${r.error.split('\n')[0]} (left un-recorded → retries)`);
        }
      },
    });

    let delivered = 0;
    for (const item of renderedItems) {
      try {
        if (writeBack) await writeBack(item, { log });
        ledger.record(item.row.id, item.row.updated_at, { out: item.out }); // record only after the video lands in Kraken
        delivered += 1;
      } catch (e) {
        log(`  ⚠ write-back failed ${item.row.id} (render OK; left un-recorded → retries next tick): ${e.message}`);
      }
    }

    return {
      picked: needed.length,
      rendered: renderedItems.length,
      delivered,
      failed: manifest.jobs.length - renderedItems.length,
      skipped: needed.length - jobs.length,
      results: manifest.jobs,
    };
  } finally {
    if (server) await new Promise((r) => server.close(r));
  }
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

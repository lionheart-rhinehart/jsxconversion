// creative-engine/dispatch/content-library.mjs
//
// Phase 6.1 — CONTENT LIBRARY DISPATCH. Route an approved + rendered creative into
// a chosen Kraken Content-Library folder. Mirrors the proven upload pattern in
// scripts/kraken-export.mjs, but operates on a Phase-5 render manifest (brand
// fan-out auto-routes per brand) instead of a campaign plan.
//
//   per dispatch job (a rendered file + workspace + destFolder):
//     1. resolve workspace + destination folder (create the folder if missing)
//     2. dedup: findExistingByMeta on the dispatch key → skip (or --replace)
//     3. video → ffmpeg poster frame thumbnail
//     4. upload bytes to Storage → public URL
//     5. ingest-content → content id
//     6. PATCH folder_id → destination folder
//
// HUMAN-AUTHORIZED BOUNDARY: pushing to a Content Library is an outward, hard-to-
// reverse write to live Supabase. DRY-RUN IS THE DEFAULT. A live push requires an
// explicit { live: true } — the CLI maps that to --live.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  resolveWorkspaceId, loadWorkspaces, resolveFolder, createFolder, listFolders,
  mimeForExt, bucketForMime, uploadToStorage, ingestContent, setFolder,
  findExistingByMeta, softDeleteContent,
} from '../../scripts/lib/kraken.mjs';

const slug = (s) => String(s).replace(/[^\w.-]+/g, '-');
const TMP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '_out', '.tmp');

// The dispatch idempotency key — analogous to kraken-export's (campaign,angle,asset)
// triple, but a fan-out output is keyed on (source=creative-engine-dispatch, batch,
// brand). Lets re-dispatch be idempotent and --replace work.
function dispatchMeta(job, batchId) {
  return { source: 'creative-engine-dispatch', campaign: batchId, angleId: 'dispatch', assetId: job.id };
}

function posterFrame(videoPath, tag) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const poster = path.join(TMP_DIR, `poster-${slug(tag)}.png`);
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', videoPath, '-vf', 'thumbnail=n=100', '-frames:v', '1', '-q:v', '3', poster], { encoding: 'utf8' });
  if (r.status === 0 && fs.existsSync(poster)) return poster;
  return null;
}

// Dispatch ONE job. Returns a result row { id, ok, dryRun, action, contentId?, url?,
// folder, workspace, error? }. Never throws — failure is captured so a batch is
// failure-isolated (mirrors Phase 5's no-silent-drop discipline).
export async function dispatchJob(job, opts = {}) {
  const { live = false, replace = false, batchId = 'dispatch' } = opts;
  const base = { id: job.id, file: job.file, dryRun: !live, workspace: job.workspace, folder: job.destFolder };
  try {
    if (!job.workspace) throw new Error('no workspace (not in brand registry; pass --workspace)');
    if (!job.destFolder) throw new Error('no destination folder (pass --folder or set brand.libraryFolder/dest)');
    if (!fs.existsSync(job.file)) throw new Error(`render file missing: ${job.file}`);

    const wsId = resolveWorkspaceId(job.workspace);
    if (!wsId) throw new Error(`unknown workspace "${job.workspace}" (known: ${Object.keys(loadWorkspaces()).join(', ')})`);

    const ext = path.extname(job.file).toLowerCase();
    const mime = mimeForExt(ext);
    const bucket = bucketForMime(mime);
    const type = mime.startsWith('video/') ? 'video' : 'image';
    const meta = dispatchMeta(job, batchId);

    // ── DRY RUN: resolve targets + report, write nothing. ────────────────────
    if (!live) {
      let folderState = 'would-resolve';
      try {
        const f = await resolveFolder(wsId, job.destFolder);
        folderState = f ? `exists (${f.id})` : 'would-create';
      } catch { folderState = 'unresolved (offline?)'; }
      return { ...base, ok: true, action: 'dry-run', type, bucket, workspaceId: wsId, folderState };
    }

    // ── LIVE: the real upload → ingest → file. ───────────────────────────────
    let folder = await resolveFolder(wsId, job.destFolder);
    if (!folder) folder = await createFolder(wsId, job.destFolder);
    if (!folder) throw new Error(`could not resolve or create folder "${job.destFolder}"`);

    // 2. Dedup on the dispatch key.
    let existing = null;
    try { existing = await findExistingByMeta(wsId, meta.campaign, meta.angleId, meta.assetId); }
    catch (e) { /* non-fatal: proceed as if new */ }
    if (existing && !replace) {
      try { await setFolder(existing.id, folder.id); } catch { /* best effort */ }
      return { ...base, ok: true, action: 'deduped', contentId: existing.id, url: existing.content, folder: folder.name, workspaceId: wsId };
    }
    if (existing && replace) {
      await softDeleteContent(existing.id);
    }

    // 3. Video poster thumbnail.
    let thumbnailUrl = null;
    if (type === 'video') {
      const poster = posterFrame(job.file, `${batchId}-${job.id}`);
      if (poster) {
        const tpath = `creative-engine-dispatch/${wsId}/${slug(batchId)}-${slug(job.id)}-thumb-${stamp()}.png`;
        const up = await uploadToStorage(poster, 'content-images', tpath, 'image/png');
        thumbnailUrl = up.url;
        fs.rmSync(poster, { force: true });
      }
    }

    // 4. Upload bytes.
    const storagePath = `creative-engine-dispatch/${wsId}/${slug(batchId)}-${slug(job.id)}-${stamp()}${ext}`;
    const { url } = await uploadToStorage(job.file, bucket, storagePath, mime);
    if (type === 'image') thumbnailUrl = url;

    // 5. Register.
    const result = await ingestContent({
      workspace_id: wsId,
      type,
      title: `${job.brand || job.id} — ${batchId}`,
      content: url,
      thumbnail_url: thumbnailUrl,
      metadata: {
        storage_url: url, storage_bucket: bucket, storage_path: storagePath, mime_type: mime,
        original_filename: path.basename(job.file),
        source: meta.source, campaign: meta.campaign, angleId: meta.angleId, assetId: meta.assetId,
        brand: job.brand || null, batchId, uploaded_at: new Date().toISOString(),
      },
    });
    if (!result || !result.id) throw new Error(`ingest returned no id: ${JSON.stringify(result).slice(0, 160)}`);

    // 6. File into the destination folder.
    await setFolder(result.id, folder.id);

    return { ...base, ok: true, action: replace && existing ? 'replaced' : 'pushed', contentId: result.id, url, folder: folder.name, workspaceId: wsId };
  } catch (e) {
    return { ...base, ok: false, action: 'error', error: e.message };
  }
}

// new Date() is fine here (runtime script, not a workflow). Keeps storage paths unique.
function stamp() { return new Date().toISOString().replace(/[^0-9]/g, ''); }

// Dispatch a whole batch (failure-isolated). Returns { results, summary }.
export async function dispatchBatch(jobs, opts = {}) {
  const results = [];
  for (const job of jobs) results.push(await dispatchJob(job, opts));
  const ok = results.filter((r) => r.ok).length;
  return { results, summary: { total: results.length, ok, failed: results.length - ok } };
}

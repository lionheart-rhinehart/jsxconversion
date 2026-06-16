// ============================================================================
//  creative-engine/dispatch/publish-core.mjs
// ============================================================================
//  The SHARED publish core. Used by BOTH the CLI (publish-package.mjs) and the
//  editor's POST /package/publish endpoint (serve.mjs). One path so the button and
//  the command can never diverge (the dependencies rule). It does NOT read argv and
//  NEVER calls process.exit — it throws on error and reports via an injected `log`.
//
//  publishPackage() uploads a package's whole file tree to the content-bundles bucket
//  and registers one content_outputs + approvals row PER FRAME (carrying that frame's
//  saved overrides), then returns structured results (review links). DRY-RUN unless
//  live:true. See publish-package.mjs for the original design notes / content-type gotcha.
// ============================================================================

import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  uploadToStorage, ingestContent, setFolder, resolveFolder, createFolder, loadCreds,
} from '../../scripts/lib/kraken.mjs';
import { manifestToMetadataRows } from '../intake/lib/manifest.mjs';
import { frameOverrides, countEdits } from './overrides-split.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(HERE, '..', '..');
export const PKG_ROOT = path.join(PROJECT_ROOT, 'creative-engine', 'intake', '_packages');

// resolve a package arg (slug or dir) to its dir; throws if not found.
export function locatePkg(arg) {
  const direct = path.resolve(arg);
  if (existsSync(path.join(direct, 'intake.json'))) return direct;
  const bySlug = path.join(PKG_ROOT, arg);
  if (existsSync(path.join(bySlug, 'intake.json'))) return bySlug;
  throw new Error(`no package with an intake.json at "${arg}" or ${bySlug}`);
}

// bare mime per extension (no "; charset" — the bucket allowlist 415s on a suffix)
const MIME = {
  '.html': 'text/html', '.htm': 'text/html',
  '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json', '.txt': 'text/plain',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.ogg': 'audio/ogg',
};
const mimeFor = (rel) => MIME[path.extname(rel).toLowerCase()] || 'application/octet-stream';

function walkFiles(dir, base = dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const abs = path.join(dir, name);
    const st = statSync(abs);
    if (st.isDirectory()) { out.push(...walkFiles(abs, base)); continue; }
    const rel = path.relative(base, abs).split(path.sep).join('/');
    if (rel === 'intake.json') continue;
    out.push({ abs, rel, size: st.size, mime: mimeFor(rel) });
  }
  return out;
}

async function uploadFile(abs, bucket, storagePath, mime, warn = () => {}) {
  try {
    const r = await uploadToStorage(abs, bucket, storagePath, mime);
    return { ...r, mime };
  } catch (e) {
    if (/\b415\b/.test(String(e.message))) {
      warn(`${path.basename(storagePath)}: mime "${mime}" rejected (415) → retrying as application/octet-stream`);
      const r = await uploadToStorage(abs, bucket, storagePath, 'application/octet-stream');
      return { ...r, mime: 'application/octet-stream' };
    }
    throw e;
  }
}

const generateApprovalToken = () => randomBytes(32).toString('hex');

// ── direct PostgREST helpers (service role) — kraken.mjs exports no approvals INSERT
// (read-only there by design; Kraken owns writes). Publish is the one engine-side writer.
async function restPost(table, payload) {
  const { host, serviceKey } = loadCreds();
  const r = await fetch(`https://${host}/rest/v1/${table}`, {
    method: 'POST',
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });
  const body = await r.text();
  if (!r.ok) throw new Error(`PostgREST POST ${table} ${r.status}: ${body.slice(0, 300)}`);
  const rows = body ? JSON.parse(body) : [];
  return Array.isArray(rows) ? rows[0] : rows;
}
async function restGet(query) {
  const { host, serviceKey } = loadCreds();
  const r = await fetch(`https://${host}/rest/v1/${query}`, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } });
  const body = await r.text();
  if (!r.ok) throw new Error(`PostgREST GET ${r.status}: ${body.slice(0, 300)}`);
  return body ? JSON.parse(body) : [];
}
async function restPatch(query, payload) {
  const { host, serviceKey } = loadCreds();
  const r = await fetch(`https://${host}/rest/v1/${query}`, {
    method: 'PATCH', headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`PostgREST PATCH ${r.status}: ${(await r.text()).slice(0, 300)}`);
}
const insertApproval = (payload) => restPost('approvals', payload);
async function findPublishedRow(wsId, slug, frameId) {
  const q = `content_outputs?workspace_id=eq.${wsId}` +
    `&metadata->>slug=eq.${encodeURIComponent(slug)}` +
    `&metadata->>frame_id=eq.${encodeURIComponent(frameId)}` +
    `&deleted_at=is.null&select=id,content,folder_id&limit=1`;
  const rows = await restGet(q);
  return rows[0] || null;
}
const softDeletePublished = (id, stamp) => restPatch(`content_outputs?id=eq.${id}`, { deleted_at: stamp || new Date().toISOString() });

// ── the core ────────────────────────────────────────────────────────────────
// opts: { pkgDir, wsId, workspace?, folderName?, emails?, live?, replace?, limit?, portalBase?, log? }
// returns (dry-run): { live:false, slug, wsId, frames:[{id,label,poster,edits}], totalEdits, fileCount, totalMB }
// returns (live):    { live:true,  slug, wsId, created:[…], receiptPath, reviewLinks:[{frame_id,reviewUrl}] }
export async function publishPackage(opts = {}) {
  const {
    pkgDir, wsId, workspace = null, folderName = null, emails = [],
    live = false, replace = false, limit = null, frameIds = null,
    portalBase = 'https://thekraken.vercel.app', log = () => {},
  } = opts;
  // frameIds (array) publishes EXACTLY those frames (the button's "This design"); falls back
  // to `limit` (first N — the CLI's --limit) then to all frames.
  const pickFrames = (arr) => {
    if (Array.isArray(frameIds) && frameIds.length) return arr.filter((x) => frameIds.includes(x.id || x.frame_id));
    if (limit) return arr.slice(0, limit);
    return arr;
  };
  const warn = (...m) => log('⚠', ...m);
  if (!pkgDir) throw new Error('pkgDir required');
  if (!wsId) throw new Error('wsId required (resolve the workspace first)');

  const manifest = JSON.parse(readFileSync(path.join(pkgDir, 'intake.json'), 'utf8'));
  const slug = manifest.slug || path.basename(pkgDir);

  // saved editor overrides → carried per-frame onto each approval row
  let savedOverrides = {};
  const ovPath = path.join(pkgDir, 'overrides.json');
  if (existsSync(ovPath)) {
    try { savedOverrides = JSON.parse(readFileSync(ovPath, 'utf8')) || {}; } catch (e) { warn(`overrides.json unreadable: ${e.message}`); }
  }
  const overridesForFrame = (frameId) => frameOverrides(savedOverrides, frameId);

  const entryRel = manifest.entryHtml;
  if (!entryRel) throw new Error('intake.json has no entryHtml');
  if (!existsSync(path.join(pkgDir, entryRel))) throw new Error(`entry HTML missing on disk: ${entryRel}`);
  if (!manifest.frames || !manifest.frames.length) throw new Error('intake.json has no frames');

  const files = walkFiles(pkgDir);
  const totalMB = (files.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(1);
  const storagePrefix = `intake-publish/${wsId}/${slug}`;

  log(`package : ${slug}  (${pkgDir})`);
  log(`workspace: ${workspace || wsId} → ${wsId}`);
  log(`entry   : ${entryRel}`);
  log(`tree    : ${files.length} file(s), ${totalMB} MB → content-bundles/${storagePrefix}/`);
  log(`frames  : ${manifest.frames.length}  → one content_outputs + approvals row each`);

  const framePlanAll = manifest.frames.map((f) => ({ id: f.id, label: f.label, poster: f.poster || null, edits: countEdits(overridesForFrame(f.id)) }));
  const framePlan = pickFrames(framePlanAll);
  const totalEdits = countEdits(savedOverrides);

  // ── DRY-RUN ──
  if (!live) {
    log('');
    log('DRY-RUN (no live): would upload the tree above and ingest these rows:');
    for (const f of framePlan) log(`  - frame ${f.id} (${f.label})  poster=${f.poster || 'none'}${f.edits ? `  · ${f.edits} saved edit(s) → approval.overrides` : ''}`);
    if (totalEdits) { log(''); log(`overrides.json present: ${totalEdits} saved edit(s) will be carried onto the approval rows (NO render here).`); }
    return { live: false, slug, wsId, workspace, storagePrefix, frames: framePlan, totalEdits, fileCount: files.length, totalMB };
  }

  // ── LIVE: upload the tree ──
  const { host } = loadCreds();
  const publicBase = `https://${host}/storage/v1/object/public/content-bundles/${storagePrefix}/`;
  const uploaded = [];
  for (const f of files) {
    const sp = `${storagePrefix}/${f.rel}`;
    const r = await uploadFile(f.abs, 'content-bundles', sp, f.mime, warn);
    uploaded.push(f.rel);
    log(`  ↑ ${f.rel}  (${(f.size / 1024).toFixed(0)} KB, ${r.mime})`);
  }
  // files.json — read poller's pull manifest
  const filesManifest = { slug, entry: entryRel, files: uploaded };
  const filesTmpDir = path.join(HERE, '_out', '.tmp');
  mkdirSync(filesTmpDir, { recursive: true });
  const filesTmp = path.join(filesTmpDir, `files-${slug}.json`);
  writeFileSync(filesTmp, JSON.stringify(filesManifest, null, 2));
  await uploadFile(filesTmp, 'content-bundles', `${storagePrefix}/files.json`, 'application/json', warn);
  log(`  ↑ files.json  (${uploaded.length} entries)`);

  const entryUrl = publicBase + entryRel.split(path.sep).join('/').split('/').map(encodeURIComponent).join('/');
  const assetBaseUrl = publicBase;

  let rows = manifestToMetadataRows(manifest, { tagged_url: entryUrl });
  rows = pickFrames(rows);
  if (rows.length !== manifest.frames.length) log(`publishing ${rows.length} of ${manifest.frames.length} frame(s)`);

  let folderId = null;
  if (folderName) {
    try {
      const f = (await resolveFolder(wsId, folderName)) || (await createFolder(wsId, folderName));
      folderId = f && f.id ? f.id : null;
    } catch (e) { warn(`folder "${folderName}" unavailable (${e.message}); filing with folder_id=null`); }
  }

  const stamp = new Date().toISOString();
  const created = [];
  for (const row of rows) {
    let posterUrl = null;
    if (row.poster) {
      const posterAbs = path.join(pkgDir, row.poster);
      if (existsSync(posterAbs)) {
        try {
          const pu = await uploadFile(posterAbs, 'content-images', `intake-publish/${wsId}/${slug}/${row.poster.split('/').pop()}`, mimeFor(row.poster), warn);
          posterUrl = pu.url;
        } catch (e) { warn(`poster ${row.poster}: ${e.message}`); }
      }
    }

    const meta = {
      source: 'creative-engine-publish', render: 'live-html', slug,
      frame_id: row.frame_id, label: row.label,
      tagged_url: entryUrl, live_url: entryUrl, asset_base: assetBaseUrl, poster: posterUrl,
      storage_bucket: 'content-bundles', storage_prefix: storagePrefix, published_at: stamp,
    };

    const existing = await findPublishedRow(wsId, slug, row.frame_id);
    if (existing && !replace) {
      log(`  = frame ${row.frame_id}: row exists (${existing.id}); replace to redo`);
      created.push({ frame_id: row.frame_id, contentId: existing.id, deduped: true });
      continue;
    }
    if (existing && replace) {
      try { await softDeletePublished(existing.id, stamp); } catch (e) { warn(`replace soft-delete ${existing.id}: ${e.message}`); }
    }

    const co = await ingestContent({
      workspace_id: wsId, type: 'embed', title: `${slug} · ${row.label || row.frame_id}`,
      content: entryUrl, thumbnail_url: posterUrl, metadata: meta,
    });
    if (!co || !co.id) throw new Error(`ingest returned no id for frame ${row.frame_id}: ${JSON.stringify(co).slice(0, 200)}`);
    if (folderId) { try { await setFolder(co.id, folderId); } catch (e) { warn(`setFolder ${co.id}: ${e.message}`); } }

    const token = generateApprovalToken();
    const frameOv = overridesForFrame(row.frame_id);
    const hasOv = countEdits(frameOv) > 0;
    const approval = await insertApproval({
      workspace_id: wsId,
      task_id: `ce-publish-${slug}-${row.frame_id}`,
      task_name: `${slug} · ${row.label || row.frame_id}`,
      content_output_id: co.id, content_type: 'embed', status: 'pending',
      approval_token: token,
      client_email: emails[0] || null, client_emails: emails.length ? emails : null,
      image_url: posterUrl,
      ...(hasOv ? { overrides: frameOv } : {}),
    });
    if (hasOv) log(`      ↳ carried ${countEdits(frameOv)} saved edit(s) onto the approval`);

    const reviewUrl = `${portalBase}/portal?token=${token}`;
    log(`  + frame ${row.frame_id} → content ${co.id} / approval ${approval.id}`);
    log(`      review: ${reviewUrl}`);
    created.push({ frame_id: row.frame_id, contentId: co.id, approvalId: approval.id, token, reviewUrl, posterUrl });
  }

  const receipt = { slug, wsId, workspace, storagePrefix, entryUrl, assetBaseUrl, emails, publishedAt: stamp, rows: created };
  const receiptPath = path.join(HERE, '_out', `publish-${slug}.json`);
  mkdirSync(path.dirname(receiptPath), { recursive: true });
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  log('');
  log(`published ${created.length} frame row(s). receipt → ${path.relative(PROJECT_ROOT, receiptPath)}`);

  return {
    live: true, slug, wsId, workspace, storagePrefix, created,
    receiptPath: path.relative(PROJECT_ROOT, receiptPath),
    reviewLinks: created.filter((r) => r.reviewUrl).map((r) => ({ frame_id: r.frame_id, reviewUrl: r.reviewUrl })),
  };
}

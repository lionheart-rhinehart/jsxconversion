#!/usr/bin/env node
// ============================================================================
//  creative-engine/dispatch/publish-package.mjs
// ============================================================================
//  REMOTE PUBLISH — make a v2 intake package reachable off-laptop.
//
//  Today a finished package only lives on this machine's dev server
//  (localhost:5300), so the approve→render loop dies when that server is off.
//  This uploads a package's WHOLE file tree (entry HTML + peer JS/CSS + assets/
//  + fonts/) to the Supabase `content-bundles` bucket, then registers one Kraken
//  content_outputs + approvals row PER FRAME pointing at the public Storage URLs.
//  After that the Kraken portal can open + edit it, and the render poller can pull
//  it from Storage — neither needs this laptop running.
//
//  The content-type gotcha that drives the design (verified by the spike on
//  2026-06-15, lessons-learned/2026-06-10__supabase-serves-html-as-text-plain.md):
//    - the entry .html is served `text/plain` + nosniff  → portal & poller can't
//      load it directly; the Kraken embed route re-serves text/html (portal side,
//      already shipped), and the poller download-and-serves it (poller.mjs).
//    - peer .js/.css/fonts keep their real content-type, no nosniff → they execute
//      from Storage. So `metadata.asset_base` is the ABSOLUTE Storage folder URL —
//      the Kraken view route injects `<base href=asset_base>` so relative refs
//      resolve against Storage.
//
//  HUMAN-AUTHORIZED BOUNDARY: publishing writes to live Supabase (Storage + the
//  content/approval tables) and mints a portal review link. DRY-RUN IS THE DEFAULT.
//  A real publish requires --live. Re-publish is idempotent (x-upsert on Storage;
//  rows deduped on (slug, frame_id) via metadata).
//
//  Usage:
//    node creative-engine/dispatch/publish-package.mjs --pkg carmel-2c7c5b76 --workspace aa-carmel
//    node creative-engine/dispatch/publish-package.mjs --pkg carmel-2c7c5b76 --workspace aa-carmel --email cody@x.com --live
//
//  Flags:
//    --pkg <slug|dir>    package slug under intake/_packages, or an explicit dir
//    --workspace <ws>    Kraken workspace slug/uuid (where the rows + portal land)
//    --folder <name>     optional Content-Library folder to file the rows into
//    --email <a,b>       approver email(s) (carried onto the approval rows)
//    --portal-base <url> portal origin for the printed review link (default https://thekraken.vercel.app)
//    --live              REQUIRED to upload + ingest (else DRY-RUN: walk + plan only)
//    --replace           re-publish: soft-delete the prior (slug,frame_id) row, ingest fresh
// ============================================================================

import {
  existsSync, readFileSync, readdirSync, statSync, mkdirSync, writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  resolveWorkspaceId, uploadToStorage, ingestContent, setFolder,
  resolveFolder, createFolder, loadCreds,
} from '../../scripts/lib/kraken.mjs';
import { manifestToMetadataRows } from '../intake/lib/manifest.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(HERE, '..', '..');
const PKG_ROOT = path.join(PROJECT_ROOT, 'creative-engine', 'intake', '_packages');

// ── CLI ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const log = (...m) => console.log('[publish]', ...m);
const warn = (...m) => console.warn('[publish] ⚠', ...m);
const die = (m) => { console.error('[publish] ERROR:', m); process.exit(1); };

const pkgArg = opt('pkg');
const workspace = opt('workspace');
const folderName = opt('folder');
const emails = (opt('email') || '').split(',').map((s) => s.trim()).filter(Boolean);
const portalBase = (opt('portal-base') || 'https://thekraken.vercel.app').replace(/\/+$/, '');
const live = flag('live');
const replace = flag('replace');
const limit = opt('limit') ? Math.max(1, parseInt(opt('limit'), 10)) : null;

if (flag('help') || flag('h') || !pkgArg) {
  console.log(`Usage: node creative-engine/dispatch/publish-package.mjs --pkg <slug|dir> --workspace <ws> [--folder <name>] [--email a,b] [--live] [--replace]
DRY-RUN by default (walks the tree + plans rows, writes nothing). --live uploads + ingests.`);
  process.exit(pkgArg ? 0 : 1);
}

// ── locate the package dir + read its manifest ────────────────────────────────
function locatePkg(arg) {
  const direct = path.resolve(arg);
  if (existsSync(path.join(direct, 'intake.json'))) return direct;
  const bySlug = path.join(PKG_ROOT, arg);
  if (existsSync(path.join(bySlug, 'intake.json'))) return bySlug;
  die(`no package with an intake.json at "${arg}" or ${bySlug}`);
}

// ── bare mime per extension (NO "; charset" — content-bundles matches the exact
// string against its allowlist and 415s on the suffix). ───────────────────────
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

// Recursively list every file under a dir, returning repo-relative-to-pkg POSIX paths.
// Skips intake.json (a packing slip, not part of the served bundle) and dotfiles.
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

// Upload one file, retrying as application/octet-stream if the bucket allowlist
// rejects the real mime (415). Returns { url, storagePath, mime }.
async function uploadFile(abs, bucket, storagePath, mime) {
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

// ── main ──────────────────────────────────────────────────────────────────────
(async () => {
  const pkgDir = locatePkg(pkgArg);
  const manifest = JSON.parse(readFileSync(path.join(pkgDir, 'intake.json'), 'utf8'));
  const slug = manifest.slug || path.basename(pkgDir);
  const entryRel = manifest.entryHtml;
  if (!entryRel) die(`intake.json has no entryHtml`);
  if (!existsSync(path.join(pkgDir, entryRel))) die(`entry HTML missing on disk: ${entryRel}`);
  if (!manifest.frames || !manifest.frames.length) die(`intake.json has no frames`);

  if (!workspace) die(`--workspace required`);
  const wsId = resolveWorkspaceId(workspace);
  if (!wsId) die(`could not resolve workspace "${workspace}" (check ~/.claude/client-workspaces.json)`);

  const files = walkFiles(pkgDir);
  const totalMB = (files.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(1);
  const storagePrefix = `intake-publish/${wsId}/${slug}`;

  log(`package : ${slug}  (${pkgDir})`);
  log(`workspace: ${workspace} → ${wsId}`);
  log(`entry   : ${entryRel}`);
  log(`tree    : ${files.length} file(s), ${totalMB} MB → content-bundles/${storagePrefix}/`);
  log(`frames  : ${manifest.frames.length}  → one content_outputs + approvals row each`);

  // ── DRY-RUN: report the plan, write nothing. ────────────────────────────────
  if (!live) {
    log('');
    log('DRY-RUN (no --live): would upload the tree above and ingest these rows:');
    for (const f of manifest.frames) {
      log(`  - frame ${f.id} (${f.label})  poster=${f.poster || 'none'}`);
    }
    log('');
    log('Re-run with --live to upload + ingest + mint a portal review link.');
    return;
  }

  // ── LIVE: upload the whole tree to content-bundles. ─────────────────────────
  const { host } = loadCreds();
  const publicBase = `https://${host}/storage/v1/object/public/content-bundles/${storagePrefix}/`;
  const uploaded = [];
  for (const f of files) {
    const sp = `${storagePrefix}/${f.rel}`;
    const r = await uploadFile(f.abs, 'content-bundles', sp, f.mime);
    uploaded.push(f.rel);
    log(`  ↑ ${f.rel}  (${(f.size / 1024).toFixed(0)} KB, ${r.mime})`);
  }

  // files.json — the manifest the render poller reads to know exactly what to pull
  // (avoids HTML-parsing to discover assets). Uploaded LAST so it lists the full set.
  const filesManifest = { slug, entry: entryRel, files: uploaded };
  const filesTmpDir = path.join(HERE, '_out', '.tmp');
  mkdirSync(filesTmpDir, { recursive: true });
  const filesTmp = path.join(filesTmpDir, `files-${slug}.json`);
  writeFileSync(filesTmp, JSON.stringify(filesManifest, null, 2));
  await uploadFile(filesTmp, 'content-bundles', `${storagePrefix}/files.json`, 'application/json');
  log(`  ↑ files.json  (${uploaded.length} entries)`);

  const entryUrl = publicBase + entryRel.split(path.sep).join('/').split('/').map(encodeURIComponent).join('/');
  // asset_base = the ABSOLUTE Storage folder URL (trailing slash). The Kraken view
  // route injects <base href=asset_base> so relative refs resolve against Storage;
  // the poller swaps this for a LOCAL cache base before rendering.
  const assetBaseUrl = publicBase;

  // ── per-frame content rows from the manifest, public-URL'd. ─────────────────
  let rows = manifestToMetadataRows(manifest, { tagged_url: entryUrl });
  if (limit) { rows = rows.slice(0, limit); log(`--limit ${limit}: publishing ${rows.length} of ${manifest.frames.length} frame(s)`); }

  // resolve / create the destination folder (best-effort)
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
    // poster (optional — many JS-driven packages capture none): upload to content-images.
    let posterUrl = null;
    if (row.poster) {
      const posterAbs = path.join(pkgDir, row.poster);
      if (existsSync(posterAbs)) {
        try {
          const pu = await uploadFile(posterAbs, 'content-images', `intake-publish/${wsId}/${slug}/${row.poster.split('/').pop()}`, mimeFor(row.poster));
          posterUrl = pu.url;
        } catch (e) { warn(`poster ${row.poster}: ${e.message}`); }
      }
    }

    const meta = {
      source: 'creative-engine-publish',
      render: 'live-html',
      slug,
      frame_id: row.frame_id,
      label: row.label,
      tagged_url: entryUrl,
      live_url: entryUrl,
      asset_base: assetBaseUrl,
      poster: posterUrl,
      storage_bucket: 'content-bundles',
      storage_prefix: storagePrefix,
      published_at: stamp,
    };

    // De-dup on (slug, frame_id). --replace soft-deletes the prior row first.
    const existing = await findPublishedRow(wsId, slug, row.frame_id);
    if (existing && !replace) {
      log(`  = frame ${row.frame_id}: row exists (${existing.id}); --replace to redo`);
      created.push({ frame_id: row.frame_id, contentId: existing.id, deduped: true });
      continue;
    }
    if (existing && replace) {
      try { await softDeletePublished(existing.id, stamp); } catch (e) { warn(`replace soft-delete ${existing.id}: ${e.message}`); }
    }

    const co = await ingestContent({
      workspace_id: wsId,
      type: 'embed',
      title: `${slug} · ${row.label || row.frame_id}`,
      content: entryUrl,
      thumbnail_url: posterUrl,
      metadata: meta,
    });
    if (!co || !co.id) die(`ingest returned no id for frame ${row.frame_id}: ${JSON.stringify(co).slice(0, 200)}`);
    if (folderId) { try { await setFolder(co.id, folderId); } catch (e) { warn(`setFolder ${co.id}: ${e.message}`); } }

    // paired approval row (mirrors Kraken's send-to-approval insert: token, embed type, pending).
    const token = generateApprovalToken();
    const approval = await insertApproval({
      workspace_id: wsId,
      task_id: `ce-publish-${slug}-${row.frame_id}`,
      task_name: `${slug} · ${row.label || row.frame_id}`,
      content_output_id: co.id,
      content_type: 'embed',
      status: 'pending',
      approval_token: token,
      client_email: emails[0] || null,
      client_emails: emails.length ? emails : null,
      image_url: posterUrl,
    });

    const reviewUrl = `${portalBase}/portal?token=${token}`;
    log(`  + frame ${row.frame_id} → content ${co.id} / approval ${approval.id}`);
    log(`      review: ${reviewUrl}`);
    created.push({ frame_id: row.frame_id, contentId: co.id, approvalId: approval.id, token, reviewUrl, posterUrl });
  }

  // write a local receipt
  const receipt = { slug, wsId, workspace, storagePrefix, entryUrl, assetBaseUrl, emails, publishedAt: stamp, rows: created };
  const receiptPath = path.join(HERE, '_out', `publish-${slug}.json`);
  mkdirSync(path.dirname(receiptPath), { recursive: true });
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  log('');
  log(`published ${created.length} frame row(s). receipt → ${path.relative(PROJECT_ROOT, receiptPath)}`);
  const firstLink = created.find((r) => r.reviewUrl);
  if (firstLink) log(`portal review (frame ${firstLink.frame_id}): ${firstLink.reviewUrl}`);
})().catch((e) => { console.error('[publish] FAILED:', e && e.stack || e); process.exit(1); });

// ── direct PostgREST helpers (service role) — kraken.mjs exports no approvals
// INSERT (it's READ-ONLY there by design; Kraken owns writes). Publish is the one
// engine-side writer, so it talks to PostgREST directly with the service key. ────
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
async function insertApproval(payload) { return restPost('approvals', payload); }
async function findPublishedRow(wsId, slug, frameId) {
  const q = `content_outputs?workspace_id=eq.${wsId}` +
    `&metadata->>slug=eq.${encodeURIComponent(slug)}` +
    `&metadata->>frame_id=eq.${encodeURIComponent(frameId)}` +
    `&deleted_at=is.null&select=id,content,folder_id&limit=1`;
  const rows = await restGet(q);
  return rows[0] || null;
}
async function softDeletePublished(id, stamp) {
  await restPatch(`content_outputs?id=eq.${id}`, { deleted_at: stamp || new Date().toISOString() });
}

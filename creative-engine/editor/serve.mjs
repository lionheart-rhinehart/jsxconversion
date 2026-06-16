// creative-engine/editor/serve.mjs
//
// The editor's dev host. Serves the whole repo over HTTP so the editor page can
// fetch the tagged design + apply-overrides.js + the campaign's media. The ONE
// non-negotiable: it honors HTTP Range (206) — without it a <video> cannot seek, and
// the editor (and the evidence harness) can't freeze a clip at a timestamp.
//
// Phase C extends this file with /kraken/* routes (lazy-import scripts/lib/kraken.mjs).
//
// Usage:  node creative-engine/editor/serve.mjs           (port 5199)
//         PORT=5300 node creative-engine/editor/serve.mjs
// Open:   http://localhost:5199/creative-engine/editor/editor-host.html

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..'); // repo root
const PORT = Number(process.env.PORT) || 5199;

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.aac': 'audio/aac', '.ogg': 'audio/ogg',
};

// Serve one file with Range support. Exported so Phase C's server can fall through to it.
export function serveFile(req, res, absPath) {
  let st;
  try { st = fs.statSync(absPath); } catch { res.writeHead(404); res.end('not found'); return; }
  if (st.isDirectory()) { res.writeHead(404); res.end('is a directory'); return; }
  const ctype = TYPES[path.extname(absPath).toLowerCase()] || 'application/octet-stream';
  const range = req.headers.range;
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
    const start = m[1] ? parseInt(m[1], 10) : 0;
    const end = m[2] ? parseInt(m[2], 10) : st.size - 1;
    res.writeHead(206, {
      'content-type': ctype, 'accept-ranges': 'bytes',
      'content-range': `bytes ${start}-${end}/${st.size}`, 'content-length': end - start + 1,
    });
    fs.createReadStream(absPath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, { 'content-type': ctype, 'accept-ranges': 'bytes', 'content-length': st.size });
    fs.createReadStream(absPath).pipe(res);
  }
}

// Map a request URL to a repo-rooted absolute path, blocking traversal outside the repo.
export function resolveUnderRoot(urlPath) {
  const rel = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const abs = path.resolve(PROJECT_ROOT, rel);
  if (abs !== PROJECT_ROOT && !abs.startsWith(PROJECT_ROOT + path.sep)) return null; // traversal guard
  return abs;
}

// `routes` lets Phase C inject /kraken/* without forking this file.
export function createServer(routes = {}) {
  return http.createServer(async (req, res) => {
    const url = req.url.split('?')[0];
    if (routes[url]) { try { await routes[url](req, res); } catch (e) { res.writeHead(500); res.end(String(e)); } return; }
    const abs = resolveUnderRoot(req.url);
    if (!abs) { res.writeHead(403); res.end('forbidden'); return; }
    serveFile(req, res, abs);
  });
}

// ── Phase C — live Kraken browser routes ───────────────────────────────────
// Each route LAZY-imports scripts/lib/kraken.mjs inside a try/catch (F6). If the
// creds / config are missing (bare checkout, no .env.local) the import or the call
// throws, and we answer HTTP 200 `{available:false}` — NEVER a 500 stack. The
// editor reads `available:false` and hides the Kraken UI, staying fully usable.
function sendJson(res, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); } });
    req.on('error', () => resolve({}));
  });
}
async function withKraken(res, fn) {
  let k;
  try { k = await import('../../scripts/lib/kraken.mjs'); }
  catch (e) { return sendJson(res, { available: false, error: 'kraken module: ' + String(e.message || e) }); }
  try { sendJson(res, { available: true, ...(await fn(k)) }); }
  catch (e) { sendJson(res, { available: false, error: String(e.message || e) }); }
}

// Pinned-folder store (the editor's 🔒 Lock). Independent of Kraken creds — a plain
// JSON map of design-path → {wsId,wsLabel,folderId,folderName}. Tracked so the pin
// survives reloads and is shared across chats working the same project.
const PIN_FILE = path.join(__dirname, 'kraken-pins.json');
function readPins() { try { return JSON.parse(fs.readFileSync(PIN_FILE, 'utf8')); } catch { return {}; } }
function writePins(obj) { fs.writeFileSync(PIN_FILE, JSON.stringify(obj, null, 2)); }

export function krakenRoutes() {
  return {
    '/kraken/pin': async (req, res) => {
      try {
        if (req.method === 'POST') {
          const body = await readBody(req);
          const key = String(body.design || 'default');
          const pins = readPins();
          if (body.pin) pins[key] = body.pin; else delete pins[key];
          writePins(pins);
          return sendJson(res, { available: true, pin: body.pin || null });
        }
        const key = new URL(req.url, 'http://x').searchParams.get('design') || 'default';
        return sendJson(res, { available: true, pin: readPins()[key] || null });
      } catch (e) { sendJson(res, { available: true, pin: null, error: String(e.message || e) }); }
    },
    '/kraken/workspaces': (req, res) => withKraken(res, async (k) => ({ items: await k.listWorkspacesLive() })),
    '/kraken/folders': (req, res) => withKraken(res, async (k) => {
      const ws = new URL(req.url, 'http://x').searchParams.get('ws');
      if (!ws) throw new Error('missing ?ws');
      return { items: await k.listFolders(ws) };
    }),
    '/kraken/files': (req, res) => withKraken(res, async (k) => {
      const q = new URL(req.url, 'http://x').searchParams;
      const ws = q.get('ws'); const folder = q.get('folder') || null;
      if (!ws) throw new Error('missing ?ws');
      const rows = await k.listFolderMedia(ws, folder || null);
      // hand the editor only what a thumbnail grid needs; `url` is the public CDN URL
      // (no download — that happens on pull). type drives <img> vs <video> tile.
      return { items: rows.map((r) => ({
        id: r.id, title: r.title || '', type: r.type, url: r.content,
        metadata: r.metadata || null, content: r.content, created_at: r.created_at || null,
      })) };
    }),
    '/kraken/pull': (req, res) => withKraken(res, async (k) => {
      const body = await readBody(req);
      const row = body.row || body;            // accept {ws,row} or a bare row
      if (!row || !row.content) throw new Error('pull: row.content (the media URL) required');
      const wsSlug = String(body.ws || 'kraken').replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 40) || 'kraken';
      const destDir = path.join(PROJECT_ROOT, 'brand', 'kraken-cache', wsSlug);
      fs.mkdirSync(destDir, { recursive: true });
      const result = await k.downloadToCache(row, destDir);
      // Return a PROJECT_ROOT-rooted "/brand/kraken-cache/…" URL (C3b). Live (served
      // from repo root) the iframe loads it as an absolute-path URL; the renderer
      // rewrites the same leading-slash path to a file:// under PROJECT_ROOT.
      const rel = '/' + path.relative(PROJECT_ROOT, result.path).split(path.sep).join('/');
      return { path: rel, skipped: !!result.skipped };
    }),
  };
}

// ── Audio library routes (local music; Kraken has no audio) ─────────────────
// /audio/list → tracks in music-library/ + uploaded files. /audio/upload → save a
// file the user dropped in. The audio files themselves serve via the normal Range path
// (so <audio> can seek). Degrade-safe: a read error just yields an empty list.
const AUDIO_EXT = ['.mp3', '.m4a', '.wav', '.aac', '.ogg'];
const AUDIO_DIRS = ['music-library', 'brand/audio-cache/uploads'].map((d) => path.join(PROJECT_ROOT, d));
function listAudio() {
  const seen = new Set(); const items = [];
  for (const dir of AUDIO_DIRS) {
    let files = []; try { files = fs.readdirSync(dir); } catch { continue; }
    for (const f of files.sort()) {
      if (!AUDIO_EXT.includes(path.extname(f).toLowerCase())) continue;
      const url = '/' + path.relative(PROJECT_ROOT, path.join(dir, f)).split(path.sep).join('/');
      if (seen.has(url)) continue; seen.add(url);
      items.push({ name: f.replace(/\.[^.]+$/, ''), file: f, url });
    }
  }
  return items;
}
function readRaw(req) {
  return new Promise((resolve) => {
    const chunks = []; req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks))); req.on('error', () => resolve(Buffer.alloc(0)));
  });
}
export function audioRoutes() {
  return {
    '/audio/list': (req, res) => { try { sendJson(res, { available: true, items: listAudio() }); } catch (e) { sendJson(res, { available: false, items: [], error: String(e.message || e) }); } },
    '/audio/upload': async (req, res) => {
      try {
        let name = (new URL(req.url, 'http://x').searchParams.get('name') || 'upload.mp3').replace(/[^a-z0-9._-]/gi, '_');
        if (!AUDIO_EXT.includes(path.extname(name).toLowerCase())) name += '.mp3';
        const buf = await readRaw(req);
        if (!buf.length) return sendJson(res, { available: false, error: 'empty upload' });
        const dir = path.join(PROJECT_ROOT, 'brand', 'audio-cache', 'uploads'); fs.mkdirSync(dir, { recursive: true });
        const dest = path.join(dir, name); fs.writeFileSync(dest, buf);
        sendJson(res, { available: true, name: name.replace(/\.[^.]+$/, ''), file: name, url: '/' + path.relative(PROJECT_ROOT, dest).split(path.sep).join('/') });
      } catch (e) { sendJson(res, { available: false, error: String(e.message || e) }); }
    },
  };
}

// ── Package overrides routes — make local "Save" PERSIST the edit bag ─────────
// The editor's Save posts the override bag here; we write it to the package as
// overrides.json (the editor reloads it on open, and publish-package reads it to carry
// the edits into the approval row). This is pure DATA persistence — nothing renders here.
// Guarded to the _packages/ tree; slug sanitized.
const PKG_ROOT = path.join(PROJECT_ROOT, 'creative-engine', 'intake', '_packages');
function pkgDirFor(slug) {
  const safe = String(slug || '').replace(/[^a-z0-9._-]/gi, '');
  if (!safe) return null;
  const dir = path.resolve(PKG_ROOT, safe);
  if (dir !== PKG_ROOT && !dir.startsWith(PKG_ROOT + path.sep)) return null; // traversal guard
  if (!fs.existsSync(dir)) return null;
  return dir;
}
export function overridesRoutes() {
  return {
    '/package/overrides': async (req, res) => {
      try {
        const slug = new URL(req.url, 'http://x').searchParams.get('pkg');
        const dir = pkgDirFor(slug);
        if (!dir) return sendJson(res, { ok: false, error: 'unknown or invalid pkg' });
        const file = path.join(dir, 'overrides.json');
        if (req.method === 'POST') {
          const body = await readBody(req);
          const bag = (body && body.overrides) || {};
          fs.writeFileSync(file, JSON.stringify(bag, null, 2));
          return sendJson(res, { ok: true, saved: '/creative-engine/intake/_packages/' + path.basename(dir) + '/overrides.json', keys: Object.keys(bag).length });
        }
        // GET → current saved bag (or {} if none yet)
        let bag = {};
        try { bag = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
        return sendJson(res, { ok: true, overrides: bag });
      } catch (e) { sendJson(res, { ok: false, error: String(e.message || e) }); }
    },
  };
}

// ── Pipeline routes — drive the editor → approval → render → library chain from
// BUTTONS instead of CLIs. Each reuses an existing core (publishPackage / pollOnce /
// dispatchToLibrary). Live/outward writes happen ONLY when the request says confirm:true
// (the button's confirm step IS the human authorization). Lazy-imports degrade safe (F6).
const RENDER_OUT = path.join(PROJECT_ROOT, 'creative-engine', 'render', '_out', 'rendered');
function manifestForPkg(dir) {
  try { return JSON.parse(fs.readFileSync(path.join(dir, 'intake.json'), 'utf8')); } catch { return null; }
}
function receiptForSlug(slug) {
  try { return JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'creative-engine', 'dispatch', '_out', `publish-${slug}.json`), 'utf8')); } catch { return null; }
}
export function pipelineRoutes() {
  return {
    // POST { pkg, scope:'this'|'batch', frameId?, wsId, workspace?, folderName?, emails?, confirm }
    // confirm falsy → DRY-RUN (plan only). confirm true → live publish.
    '/package/publish': async (req, res) => {
      try {
        if (req.method !== 'POST') return sendJson(res, { ok: false, error: 'POST only' });
        const body = await readBody(req);
        const dir = pkgDirFor(body.pkg);
        if (!dir) return sendJson(res, { ok: false, error: 'unknown or invalid pkg' });
        const wsId = body.wsId || null;
        if (!wsId) return sendJson(res, { ok: false, needWorkspace: true, error: 'no destination workspace — pin a folder (🔒) or pass wsId' });
        // selection: explicit frameIds[] (multi-select) > scope 'this'+frameId (one) > else all
        const frameIds = Array.isArray(body.frameIds) && body.frameIds.length ? body.frameIds
          : ((body.scope === 'this' && body.frameId) ? [body.frameId] : null);
        const emails = Array.isArray(body.emails) ? body.emails : (body.emails ? [body.emails] : []);
        const lines = [];
        let core;
        try { core = await import('../dispatch/publish-core.mjs'); }
        catch (e) { return sendJson(res, { ok: false, error: 'publish-core unavailable: ' + (e.message || e) }); }
        const result = await core.publishPackage({
          pkgDir: dir, wsId, workspace: body.workspace || null, folderName: body.folderName || null,
          emails, live: !!body.confirm, replace: !!body.replace, frameIds,
          log: (...m) => lines.push(m.join(' ')),
        });
        return sendJson(res, { ok: true, ...result, log: lines });
      } catch (e) { sendJson(res, { ok: false, error: String(e.message || e) }); }
    },

    // GET ?pkg= → per-frame pipeline state for the status panel.
    '/package/status': async (req, res) => {
      try {
        const slug = new URL(req.url, 'http://x').searchParams.get('pkg');
        const dir = pkgDirFor(slug);
        if (!dir) return sendJson(res, { ok: false, error: 'unknown or invalid pkg' });
        const manifest = manifestForPkg(dir);
        if (!manifest) return sendJson(res, { ok: false, error: 'no intake.json' });
        const receipt = receiptForSlug(manifest.slug || path.basename(dir));
        const sentByFrame = {};
        if (receipt && Array.isArray(receipt.rows)) for (const r of receipt.rows) sentByFrame[r.frame_id] = r;

        // saved editor edits per frame (so the panel can show an "Edited" flag + default-select them)
        let savedOv = {};
        try { savedOv = JSON.parse(fs.readFileSync(path.join(dir, 'overrides.json'), 'utf8')) || {}; } catch {}
        const editsFor = (fid) => Object.keys(savedOv).filter((k) => k.indexOf('__') !== 0 && k.indexOf(fid + ':') === 0).length;
        const assetBase = manifest.asset_base || ('/creative-engine/intake/_packages/' + path.basename(dir) + '/');

        // one query for the whole workspace's approved set, then match by approvalId (cheap)
        let approvedIds = new Set();
        if (receipt && receipt.wsId) {
          try {
            const k = await import('../../scripts/lib/kraken.mjs');
            const approved = await k.listApprovedApprovals({ workspaceId: receipt.wsId, limit: 500 });
            approvedIds = new Set((approved || []).map((a) => a.id));
          } catch { /* creds missing → leave approved=false; panel still renders */ }
        }
        const frames = manifest.frames.map((f) => {
          const sent = sentByFrame[f.id] || null;
          const approvalId = sent && sent.approvalId ? sent.approvalId : null;
          const approved = approvalId ? approvedIds.has(approvalId) : false;
          const rendered = approvalId ? fs.existsSync(path.join(RENDER_OUT, `${approvalId}.mp4`)) : false;
          return { id: f.id, label: f.label, poster: f.poster ? (assetBase + f.poster) : null, edits: editsFor(f.id), sent: !!sent, approvalId, reviewUrl: sent ? sent.reviewUrl : null, approved, rendered };
        });
        return sendJson(res, { ok: true, slug: manifest.slug || path.basename(dir), wsId: receipt ? receipt.wsId : null, frames });
      } catch (e) { sendJson(res, { ok: false, error: String(e.message || e) }); }
    },

    // POST { pkg, approvalId?|all } → render the APPROVED row(s) to MP4 (local compute; pulls
    // from Storage, writes render/_out/rendered/<approvalId>.mp4). No outward write → no confirm gate.
    '/package/render': async (req, res) => {
      try {
        if (req.method !== 'POST') return sendJson(res, { ok: false, error: 'POST only' });
        const body = await readBody(req);
        const dir = pkgDirFor(body.pkg);
        if (!dir) return sendJson(res, { ok: false, error: 'unknown or invalid pkg' });
        const receipt = receiptForSlug((manifestForPkg(dir) || {}).slug || path.basename(dir));
        const wsId = receipt && receipt.wsId;
        if (!wsId) return sendJson(res, { ok: false, error: 'package not published yet (no receipt)' });
        const lines = [];
        let k, poller;
        try { k = await import('../../scripts/lib/kraken.mjs'); poller = await import('../render/poller.mjs'); }
        catch (e) { return sendJson(res, { ok: false, error: 'render core unavailable: ' + (e.message || e) }); }
        const approvalId = body.approvalId || null;   // null + all → render every approved row in the ws
        const source = {
          listApproved: () => k.listApprovedApprovals({ workspaceId: wsId, approvalId }),
          getContentOutput: (id) => k.getContentOutput(id),
        };
        const result = await poller.pollOnce({ source, kind: body.png ? 'png' : 'mp4', log: (m) => lines.push(m) });
        // build a dispatch manifest from whatever rendered (scan output dir for the approval mp4s)
        const approved = await k.listApprovedApprovals({ workspaceId: wsId, approvalId, limit: 500 });
        const jobs = (approved || []).map((a) => {
          const out = path.join(RENDER_OUT, `${a.id}.mp4`);
          return { id: a.id, out: '/' + path.relative(PROJECT_ROOT, out).split(path.sep).join('/'), ok: fs.existsSync(out) };
        }).filter((j) => j.ok);
        const slug = (manifestForPkg(dir) || {}).slug || path.basename(dir);
        const manPath = path.join(PROJECT_ROOT, 'creative-engine', 'render', '_out', `pipeline-${slug}.json`);
        fs.mkdirSync(path.dirname(manPath), { recursive: true });
        fs.writeFileSync(manPath, JSON.stringify({ slug, wsId, jobs }, null, 2));
        return sendJson(res, { ok: true, rendered: jobs, manifest: path.relative(PROJECT_ROOT, manPath), result, log: lines });
      } catch (e) { sendJson(res, { ok: false, error: String(e.message || e) }); }
    },

    // POST { pkg, folder?, confirm } → file rendered MP4(s) into the Content Library. DRY-RUN
    // unless confirm:true (outward write to live Supabase = human-authorized).
    '/package/dispatch': async (req, res) => {
      try {
        if (req.method !== 'POST') return sendJson(res, { ok: false, error: 'POST only' });
        const body = await readBody(req);
        const dir = pkgDirFor(body.pkg);
        if (!dir) return sendJson(res, { ok: false, error: 'unknown or invalid pkg' });
        const slug = (manifestForPkg(dir) || {}).slug || path.basename(dir);
        const receipt = receiptForSlug(slug);
        const manPath = path.join(PROJECT_ROOT, 'creative-engine', 'render', '_out', `pipeline-${slug}.json`);
        if (!fs.existsSync(manPath)) return sendJson(res, { ok: false, error: 'nothing rendered yet (render first)' });
        let disp;
        try { disp = await import('../dispatch/dispatch.mjs'); }
        catch (e) { return sendJson(res, { ok: false, error: 'dispatch core unavailable: ' + (e.message || e) }); }
        const result = await disp.dispatchToLibrary(manPath, {
          workspace: body.workspace || (receipt && receipt.workspace) || null,
          folder: body.folder || null,
          live: !!body.confirm,
        });
        return sendJson(res, { ok: true, live: !!body.confirm, ...result });
      } catch (e) { sendJson(res, { ok: false, error: String(e.message || e) }); }
    },
  };
}

const isMain = process.argv[1] && process.argv[1].endsWith('serve.mjs');
if (isMain) {
  createServer({ ...krakenRoutes(), ...audioRoutes(), ...overridesRoutes(), ...pipelineRoutes() }).listen(PORT, () => {
    console.log(`editor dev host → http://localhost:${PORT}/creative-engine/editor/editor-host.html`);
  });
}

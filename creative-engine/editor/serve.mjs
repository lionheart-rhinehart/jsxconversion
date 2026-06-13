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

const isMain = process.argv[1] && process.argv[1].endsWith('serve.mjs');
if (isMain) {
  createServer(krakenRoutes()).listen(PORT, () => {
    console.log(`editor dev host → http://localhost:${PORT}/creative-engine/editor/editor-host.html`);
  });
}

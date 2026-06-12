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

const isMain = process.argv[1] && process.argv[1].endsWith('serve.mjs');
if (isMain) {
  createServer().listen(PORT, () => {
    console.log(`editor dev host → http://localhost:${PORT}/creative-engine/editor/editor-host.html`);
  });
}

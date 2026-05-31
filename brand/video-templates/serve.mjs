// Static server for the AA video-templates gallery.
// The gallery loads .jsx via Babel-standalone over XHR, which the browser
// blocks under file://. Serve over HTTP instead:
//
//   node brand/video-templates/serve.mjs
//   → open the printed http://localhost:<port>/ URL
//
// Optional: pass a port as the first arg (defaults to 5599).
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 5599;
const DEFAULT_PAGE = 'Video Templates Gallery.html';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf', '.mp4': 'video/mp4',
};

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/' + DEFAULT_PAGE;
    const file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
    const buf = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
      // Dev server: never cache. review.html loads ~96 .jsx over XHR via
      // Babel-standalone; without this the browser serves stale compiled code
      // (the "my fix isn't showing" symptom). Matches editor-server.mjs (:5173).
      'Cache-Control': 'no-store',
    });
    res.end(buf);
  } catch {
    res.writeHead(404); res.end('not found: ' + req.url);
  }
});

server.listen(PORT, () => {
  const enc = encodeURIComponent(DEFAULT_PAGE);
  console.log(`AA video-templates gallery serving at:`);
  console.log(`  http://localhost:${PORT}/${enc}`);
  console.log(`  http://localhost:${PORT}/Elements%20Library.html`);
  console.log(`  http://localhost:${PORT}/Social%20Video%20Templates.html`);
  console.log(`Ctrl+C to stop.`);
});

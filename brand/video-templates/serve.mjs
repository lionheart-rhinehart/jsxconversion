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
import { readdirSync } from 'node:fs';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 5599;
const DEFAULT_PAGE = 'Video Templates Gallery.html';

// Auto-discover the motion editor's babel scripts so dropping a new .jsx into
// elements/ or templates/ makes it appear with NO hand-editing of review.html
// (the old ~98-tag hand list). Order matters for babel-standalone: animations.jsx
// + editing.jsx stay hard-coded ABOVE the <!--AUTO_TEMPLATE_SCRIPTS--> marker in
// review.html; here we emit elements/* then templates/*, each sorted. Missing dir
// → [] (never throws). Component names are auto-detected by /template-spec, so any
// dropped-in template is mountable without further wiring.
function templateScriptTags() {
  const tag = (rel) => `<script type="text/babel" src="${rel}"></script>`;
  const list = (sub) => {
    try {
      return readdirSync(join(ROOT, sub))
        .filter((f) => f.endsWith('.jsx'))
        .sort()
        .map((f) => tag(`${sub}/${f}`));
    } catch {
      return [];
    }
  };
  return [...list('elements'), ...list('templates')].join('\n');
}

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
    // H5: ONLY stringify review.html (a Buffer .replace would fail; toString on a
    // .png/.mp4 would corrupt it). Inject the auto-discovered <script> tags into the
    // marker; every other file streams as raw bytes, unchanged.
    if (file.endsWith('review.html')) {
      const html = buf.toString('utf8').replace('<!--AUTO_TEMPLATE_SCRIPTS-->', templateScriptTags());
      res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
      return res.end(html);
    }
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

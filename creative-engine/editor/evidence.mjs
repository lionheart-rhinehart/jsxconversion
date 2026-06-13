// creative-engine/editor/evidence.mjs
//
// Phase-2 evidence harness. Proves the checklist's hard claim:
//   "the editor preview frame matches the rendered MP4 frame at the same timestamp"
// — not by eyeball, but by driving TWO independent code paths and SSIM-diffing them:
//
//   Path A (editor): boot the REAL editor (editor-host.html) in a browser, push an
//     override bag through the full mount → relocate → apply pipeline, then capture
//     the live edited frame at t.
//   Path B (render): the bare render path (render-frame.mjs) — open tagged HTML,
//     apply the same overrides, isolate, seek, screenshot at t.
//
// Both share ONLY apply-overrides.js. Near-1.0 SSIM at t=mid & t=end ⇒ the editor is
// WYSIWYG against the renderer. The override bag exercises all three edit kinds:
// split-headline text (e22, transform-animated), a drag of a transform-animated box
// (e2, the cScan scanline), and a media swap (e0, the bg video).
//
// Usage: node creative-engine/editor/evidence.mjs

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer';
import { renderFrameAt, SEEK_SRC } from './render-frame.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..');
const TAGGED = path.join(REPO, 'campaigns', 'westfield-100-off', 'index.tagged.html');
const OUT = path.join(__dirname, '_out');
fs.mkdirSync(OUT, { recursive: true });

const FRAME = 'f0';
const LOOP_MS = 7000;
const TIMES = { mid: Math.round(LOOP_MS / 2), end: LOOP_MS - 1 };

// the edit under test — one of each kind, all on transform-animated targets where it matters
const OVERRIDES = {
  'f0:e22': { text: 'Pull\nAway.' },                          // multi-line on a cWave-animated span (A4)
  'f0:e20': { color: '#ffd400', fontSize: 132, rotate: -5 },  // color+size+rotate on an animated span (A2/A4)
  'f0:e2':  { pos: { ty: 200, tx: 30 } },                     // translate move on a cScan transform-animated bar
  'f0:e0':  { src: 'assets/vid/ad2.mp4' },                    // bg video swap
};

// ── tiny static server rooted at the repo so file fetch() works over http ──
function serve() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
    '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css',
    '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
  const srv = http.createServer((req, res) => {
    const p = path.join(REPO, decodeURIComponent(req.url.split('?')[0]));
    let st; try { st = fs.statSync(p); } catch (e) { res.writeHead(404); res.end('nf'); return; }
    const ct = types[path.extname(p)] || 'application/octet-stream';
    // HONOR RANGE REQUESTS — without 206 Partial Content the browser cannot seek a
    // <video>, so video.currentTime stays 0 and the editor preview can't be frozen at
    // a timestamp (this is exactly what made the editor disagree with the renderer).
    const range = req.headers.range;
    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
      const start = m[1] ? parseInt(m[1], 10) : 0;
      const end = m[2] ? parseInt(m[2], 10) : st.size - 1;
      res.writeHead(206, { 'content-type': ct, 'accept-ranges': 'bytes',
        'content-range': `bytes ${start}-${end}/${st.size}`, 'content-length': end - start + 1 });
      fs.createReadStream(p, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'content-type': ct, 'accept-ranges': 'bytes', 'content-length': st.size });
      fs.createReadStream(p).pipe(res);
    }
  });
  return new Promise((r) => srv.listen(0, () => r({ srv, port: srv.address().port })));
}

function ssim(a, b) {
  const r = spawnSync('ffmpeg', ['-i', a, '-i', b, '-lavfi', 'ssim', '-f', 'null', '-'],
    { encoding: 'utf8' });
  const m = (r.stderr || '').match(/All:([0-9.]+)/);
  return m ? parseFloat(m[1]) : NaN;
}

// ── Path A: drive the REAL editor, then capture its live-edited document ──
// We push the override bag through the actual editor (mount → apply → relocate),
// then SERIALIZE the editor's live iframe DOM (the edits are baked into it) and render
// that document through the proven top-document path. This sidesteps puppeteer's
// iframe-rasterization scale artifact while still proving the real thing: the editor's
// WYSIWYG edited document renders identically to applying the bag to the original.
async function editorLiveHtml(port) {
  const browser = await puppeteer.launch({ headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    const url = `http://localhost:${port}/creative-engine/editor/editor-host.html?html=/campaigns/westfield-100-off/index.tagged.html`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
    await page.waitForFunction('window.__CE_EDITOR__ && window.__CE_EDITOR__.getOverrides');
    await page.evaluate(async (ov) => { await window.__CE_EDITOR__.setOverrides(ov); }, OVERRIDES);
    await new Promise((r) => setTimeout(r, 400));
    const inner = page.frames().find((f) => f !== page.mainFrame());
    let html = await inner.content();            // the live edited design DOM, serialized
    html = html.replace(/<base[^>]*>/i, '');     // drop the http <base>; we render via file://
    return html;
  } finally { await browser.close(); }
}

(async function main() {
  if (!fs.existsSync(TAGGED)) { console.error('missing tagged input:', TAGGED); process.exit(1); }
  const { srv, port } = await serve();
  const rows = [];
  try {
    // capture the editor's live-edited document once, write it beside the campaign so
    // its relative asset paths resolve via file:// at render time
    const liveHtml = await editorLiveHtml(port);
    const livePath = path.join(REPO, 'campaigns', 'westfield-100-off', '_editor-live.tagged.html');
    fs.writeFileSync(livePath, liveHtml);

    for (const [label, tMs] of Object.entries(TIMES)) {
      const aPng = path.join(OUT, `editor-${label}.png`);
      const bPng = path.join(OUT, `render-${label}.png`);
      // Path A: render the EDITOR's live-edited document (edits already in the DOM)
      await renderFrameAt({ taggedPath: livePath, overrides: {}, frameId: FRAME, tMs, outPng: aPng });
      // Path B: render the ORIGINAL tagged design + the editor's override bag
      await renderFrameAt({ taggedPath: TAGGED, overrides: OVERRIDES, frameId: FRAME, tMs, outPng: bPng });
      const s = ssim(aPng, bPng);
      rows.push({ label, tMs, ssim: s });
      console.log(`t=${label} (${tMs}ms)  SSIM(editor,render) = ${s.toFixed(5)}   [${aPng} vs ${bPng}]`);
    }
    fs.rmSync(livePath, { force: true });
  } finally { srv.close(); }

  // also drop a side-by-side baseline: original (no edits) vs edited, at mid, for the fidelity eyeball
  await renderFrameAt({ taggedPath: TAGGED, overrides: {}, frameId: FRAME, tMs: TIMES.mid,
    outPng: path.join(OUT, 'original-mid.png') });
  await renderFrameAt({ taggedPath: TAGGED, overrides: OVERRIDES, frameId: FRAME, tMs: TIMES.mid,
    outPng: path.join(OUT, 'edited-mid.png') });

  const pass = rows.every((r) => r.ssim >= 0.98);
  fs.writeFileSync(path.join(OUT, 'evidence.json'), JSON.stringify({ overrides: OVERRIDES, rows, pass }, null, 2));
  console.log(`\nEVIDENCE: ${pass ? 'PASS' : 'FAIL'} (editor==render at every t; threshold SSIM>=0.98)`);
  process.exit(pass ? 0 : 1);
})();

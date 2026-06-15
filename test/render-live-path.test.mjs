// test/render-live-path.test.mjs
//
// Regression for wiring the render-on-approval chain to the ZERO-LOSS renderer (render-live).
// Self-contained: builds a tiny export whose frame is BUILT + ANIMATED by an inline <script>
// (a trivial rAF count-up), so the live path (runtime re-tag + injected JS clock + served-over-
// HTTP render) is genuinely exercised — not just static markup. Passes on a bare checkout (no
// gitignored _in/, no network; PNG only so no ffmpeg dependency).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { packageExport } from '../creative-engine/intake/package-export.mjs';
import { pollOnce } from '../creative-engine/render/poller.mjs';
import { Ledger } from '../creative-engine/render/ledger.mjs';
import { buildJobFromApproval, deriveLiveUrl, isServedLive } from '../creative-engine/render/approvals.mjs';

// a stage-sized frame whose content is BUILT by JS at load (the v2 reality), with a rAF count-up
const ANIMATED_EXPORT = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>anim</title></head>
<body style="margin:0">
<div id="stage" style="width:1080px;height:1920px;background:#0a0b0d;color:#fff"></div>
<script>
  // build the frame's content at runtime (JS-driven, like a real Claude Design export)
  var s = document.getElementById('stage');
  var h = document.createElement('h1'); h.textContent = 'LIVE PATH'; s.appendChild(h);
  var n = document.createElement('div'); n.id = 'count'; s.appendChild(n);
  // rAF count-up — the exact animation class the OLD static renderer froze
  function tick(t){ n.textContent = String(Math.floor((t||0)/16)); requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
</script>
</body></html>`;

function mkExport() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-rlp-'));
  fs.writeFileSync(path.join(dir, 'index.html'), ANIMATED_EXPORT);
  return dir;
}

test('live path: packaged JS-built export renders a real PNG via render-live (served over HTTP)', async () => {
  const dir = mkExport();
  try {
    const pkg = await packageExport(dir, { posters: false, log: () => {} });
    assert.equal(pkg.exit, 0, 'clean package');
    const m = pkg.manifest;
    assert.ok(m.frames.length >= 1, 'at least one frame detected on the JS-built design');
    const frameId = m.frames[0].id;

    const source = {
      listApproved: async () => [{ id: 'rlp', status: 'approved', content_output_id: 'co', updated_at: '2026-06-15T00:00:00Z', overrides: {} }],
      getContentOutput: async () => ({ id: 'co', type: 'embed', metadata: { render: 'live-html', tagged_url: m.entryHtml, asset_base: m.asset_base, frame_id: frameId } }),
    };
    const out = path.join(dir, '_out');
    const r = await pollOnce({ source, ledger: new Ledger(path.join(dir, 'ledger.json')), outDir: out, cacheDir: path.join(dir, 'cache'), kind: 'png', poolSize: 1, log: () => {} });
    assert.equal(r.rendered, 1, 'one frame rendered via the live path');
    const png = path.join(out, 'rlp.png');
    assert.ok(fs.existsSync(png) && fs.statSync(png).size > 1000, 'real PNG bytes written (>1KB)');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('gate: a relative live-html row → job.live + http url; a file:// row → static taggedPath', () => {
  const baseUrl = 'http://127.0.0.1:5555';
  // relative packaged export → served live
  const liveMeta = { render: 'live-html', tagged_url: 'design.html', asset_base: '/creative-engine/intake/_packages/x/', frame_id: 'f0' };
  assert.equal(isServedLive(liveMeta, baseUrl), true);
  assert.equal(deriveLiveUrl(liveMeta, baseUrl), 'http://127.0.0.1:5555/creative-engine/intake/_packages/x/design.html');
  const liveJob = buildJobFromApproval({ approval: { id: 'a', overrides: {} }, contentOutput: { metadata: liveMeta }, taggedPath: null, outDir: '/tmp', kind: 'png', baseUrl });
  assert.equal(liveJob.live, true);
  assert.equal(liveJob.url, 'http://127.0.0.1:5555/creative-engine/intake/_packages/x/design.html');
  assert.equal(liveJob.taggedPath, null);

  // file:// pre-tagged artifact (the Westfield fixture shape) → static path, untouched
  const fileMeta = { render: 'live-html', tagged_url: 'file:///C:/x/index.tagged.html', frame_id: 'f0' };
  assert.equal(isServedLive(fileMeta, baseUrl), false);
  const staticJob = buildJobFromApproval({ approval: { id: 'b', overrides: {} }, contentOutput: { metadata: fileMeta }, taggedPath: '/local/index.tagged.html', outDir: '/tmp', kind: 'png', baseUrl });
  assert.ok(!staticJob.live, 'file:// row does NOT use the live path');
  assert.equal(staticJob.taggedPath, '/local/index.tagged.html');

  // an absolute http tagged_url passes through unchanged
  assert.equal(deriveLiveUrl({ tagged_url: 'https://cdn.example/d.html', asset_base: '/x/' }, baseUrl), 'https://cdn.example/d.html');
});

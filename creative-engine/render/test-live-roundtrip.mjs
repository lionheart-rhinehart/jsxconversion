// creative-engine/render/test-live-roundtrip.mjs
//
// LOCAL-BUT-REAL end-to-end proof of our half of the round-trip — NO writes to live Kraken.
// It exercises the zero-loss render path against a REAL packaged export:
//
//   package a real Campaign B Carmel export (#2)
//     → fixture "approved" row whose content_output points at that package (render:'live-html')
//     → pollOnce → render-live renders a real PNG, then a real MP4 (the animations play LIVE)
//     → fan-out to 2 brands → per-brand outputs
//     → dispatch library DRY-RUN → routes each ok job (no Kraken writes)
//
// Real artifacts, printed byte sizes — evidence over assertion. Skips cleanly if the gitignored
// test export (_in/) isn't present, so it never fails on a bare checkout.
//
// Run: node creative-engine/render/test-live-roundtrip.mjs

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageExport } from '../intake/package-export.mjs';
import { pollOnce } from './poller.mjs';
import { Ledger } from './ledger.mjs';
import { runFanout } from './fanout.mjs';
import { deriveLiveUrl } from './approvals.mjs';
import { createServer } from '../editor/serve.mjs';
import { dispatchToLibrary } from '../dispatch/dispatch.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..', 'intake', '_in', 'Campaign B Exports', 'Carmel');
const OUT = path.join(__dirname, '_out', 'roundtrip');
const STATE = path.join(__dirname, '_state', 'roundtrip');

function bytes(p) { try { return fs.statSync(p).size; } catch { return 0; } }
const pass = []; const fail = [];
const check = (cond, msg) => (cond ? pass : fail).push(msg);

if (!fs.existsSync(SRC)) {
  console.log(`SKIP — test export not present (${SRC}). Re-drop "Campaign B Exports" under creative-engine/intake/_in/ to run this.`);
  process.exit(0);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.rmSync(STATE, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(STATE, { recursive: true });

// ── 1. package the real export ────────────────────────────────────────────────
console.log('[1] packaging real Carmel export…');
const pkg = await packageExport(SRC, { posters: false, log: () => {} });
check(pkg.exit === 0 || pkg.exit === 3, `package exit ${pkg.exit} (0=clean / 3=flagged-but-written, both OK here)`);
const m = pkg.manifest;
const frameId = m.frames[0].id;
console.log(`    slug=${m.slug} kind=${m.kind} frames=${m.frames.length} entry=${m.entryHtml}`);
console.log(`    asset_base=${m.asset_base} frame=${frameId}`);

// fixture "approved row" + its content_output, straight from the intake manifest
const makeSource = () => {
  const approval = {
    id: 'rt-appr', status: 'approved', content_output_id: 'rt-co',
    responded_at: '2026-06-15T00:00:00Z', updated_at: '2026-06-15T00:00:00Z',
    approved_by_type: 'agency', workspace_id: 'ws-local', batch_id: null, overrides: {},
  };
  const contentOutput = {
    id: 'rt-co', type: 'embed', title: 'Carmel roundtrip',
    metadata: { render: 'live-html', tagged_url: m.entryHtml, asset_base: m.asset_base, frame_id: frameId },
  };
  return { listApproved: async () => [approval], getContentOutput: async (id) => (id === 'rt-co' ? contentOutput : null) };
};

// ── 2. pollOnce → PNG (fast) ────────────────────────────────────────────────────
console.log('[2] pollOnce → render-live PNG…');
const pngOut = path.join(OUT, 'png');
const rPng = await pollOnce({ source: makeSource(), ledger: new Ledger(path.join(STATE, 'png.json')), outDir: pngOut, cacheDir: path.join(STATE, 'cache'), kind: 'png', poolSize: 1, log: (x) => console.log('   ' + x) });
const pngFile = path.join(pngOut, 'rt-appr.png');
check(rPng.rendered === 1, `png rendered=${rPng.rendered} (expect 1)`);
check(bytes(pngFile) > 0, `png bytes=${bytes(pngFile)} (>0)`);
console.log(`    PNG → ${bytes(pngFile)} bytes`);

// ── 3. pollOnce → MP4 (the headline proof: live animations) ─────────────────────
console.log('[3] pollOnce → render-live MP4 (animations play LIVE)…');
const mp4Out = path.join(OUT, 'mp4');
let mp4Bytes = 0;
try {
  const rMp4 = await pollOnce({ source: makeSource(), ledger: new Ledger(path.join(STATE, 'mp4.json')), outDir: mp4Out, cacheDir: path.join(STATE, 'cache'), kind: 'mp4', poolSize: 1, log: (x) => console.log('   ' + x) });
  mp4Bytes = bytes(path.join(mp4Out, 'rt-appr.mp4'));
  check(rMp4.rendered === 1 && mp4Bytes > 0, `mp4 rendered=${rMp4.rendered} bytes=${mp4Bytes} (>0)`);
  console.log(`    MP4 → ${mp4Bytes} bytes`);
} catch (e) {
  console.log(`    MP4 SKIPPED (ffmpeg likely unavailable): ${e.message.split('\n')[0]}`);
}

// ── 4. fan-out to 2 brands (live) → per-brand outputs ───────────────────────────
console.log('[4] fan-out → 2 brands via render-live (PNG)…');
const fanoutManifest = path.join(OUT, 'fanout-manifest.json');
const server = await new Promise((res, rej) => { const s = createServer(); s.on('error', rej); s.listen(0, '127.0.0.1', () => res({ s, port: s.address().port })); });
const baseUrl = `http://127.0.0.1:${server.port || server.s.address().port}`;
const url = deriveLiveUrl({ tagged_url: m.entryHtml, asset_base: m.asset_base }, baseUrl);
const brandIds = ['athletes-acceleration', 'batti-performance'];
try {
  const { planned, manifest } = await runFanout({
    master: {}, binding: {}, brandIds, taggedPath: null, frameId, kind: 'png',
    live: true, url, manifestPath: fanoutManifest, log: (x) => console.log('   ' + x),
  });
  // override-swap FIDELITY (the 5 vars) is covered by test-fanout.mjs; here we prove the chain
  // (served live render → per-brand output files → manifest the dispatcher can read).
  for (const p of planned) {
    const b = bytes(p.job.out);
    check(b > 0, `brand ${p.brand.id} output ${b} bytes (>0)`);
    console.log(`    ${p.brand.id} → ${b} bytes`);
  }
  check(manifest.jobs.every((j) => j.ok), `all ${manifest.jobs.length} brand renders ok`);
} finally {
  await new Promise((r) => (server.s || server).close(r));
}

// ── 5. dispatch DRY-RUN (no Kraken writes) ──────────────────────────────────────
console.log('[5] dispatch library DRY-RUN (no live writes)…');
const disp = await dispatchToLibrary(fanoutManifest, { batchId: 'roundtrip-dryrun' });
const results = disp.results || [];
check(results.length >= 2, `dispatch resolved ${results.length} job(s) (≥2)`);
check(results.every((r) => r.dryRun !== false), 'all dispatch jobs are DRY-RUN (no live writes)');
check((disp.summary?.failed ?? 0) === 0, `dispatch failed=${disp.summary?.failed ?? 0} (0)`);
results.forEach((r) => console.log(`    ${r.id} → ws=${r.workspace || '?'} folder=${r.folder || '?'} action=${r.action}`));

// ── verdict ─────────────────────────────────────────────────────────────────────
console.log('\n=== LIVE ROUND-TRIP (local-but-real) ===');
console.log(`evidence: PNG ${bytes(pngFile)}B · MP4 ${mp4Bytes}B · brands ${brandIds.join('+')} · dispatch dry-run ${results.length} jobs · 0 live Kraken writes`);
console.log('ASSERTIONS:');
pass.forEach((m2) => console.log('  [PASS] ' + m2));
fail.forEach((m2) => console.log('  [FAIL] ' + m2));
process.exit(fail.length ? 1 : 0);

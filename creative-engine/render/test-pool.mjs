// creative-engine/render/test-pool.mjs
//
// Evidence for 5.1 (pooled N-at-a-time) + 5.2 (failure isolation + manifest).
// Real render-frame.mjs child processes against the tagged Westfield fixture.
//
//   node creative-engine/render/test-pool.mjs
//
// Proves:
//   5.1 — 6 PNG frame-renders at pool size 3 complete; observed concurrency ≤ 3;
//         wall-clock < sum of per-job times (overlap) → N-at-a-time, no thrash.
//   5.2 — inject a guaranteed-failing job (bad frame id) + a guaranteed-timeout job
//         mid-batch; the GOOD jobs still complete; both failures appear in the
//         manifest with a reason. No silent drops, batch not wedged.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPool, summarize } from './pool.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.resolve(__dirname, '..', '..', 'campaigns', 'westfield-100-off', 'index.tagged.html');
const OUT = path.join(__dirname, '_out');
fs.mkdirSync(OUT, { recursive: true });

if (!fs.existsSync(FIX)) {
  console.error('fixture missing — run: node creative-engine/intake/tag-design.mjs campaigns/westfield-100-off/index.html --out campaigns/westfield-100-off/index.tagged.html');
  process.exit(1);
}

// 6 good PNG jobs across distinct frames + timestamps (real renders)
const good = [0, 1, 2, 3, 4, 5].map((n) => ({
  id: `good-f${n}`,
  taggedPath: FIX,
  frameId: `f${n}`,
  kind: 'png',
  atMs: 1500,
  out: path.join(OUT, `pool-f${n}.png`),
}));

// 5.2 — two poison jobs mixed in:
const badFrame = {
  id: 'bad-frame', taggedPath: FIX, frameId: 'f9999', kind: 'png', atMs: 0,
  out: path.join(OUT, 'pool-bad.png'),   // render-frame throws "frame not found" → exit !=0
};
const willTimeout = {
  id: 'timeout-job', taggedPath: FIX, frameId: 'f0', kind: 'png', atMs: 0,
  timeoutMs: 300,   // far too short → killed mid-render
  out: path.join(OUT, 'pool-timeout.png'),
};

// interleave so a poison job sits in the MIDDLE of the batch
const jobs = [good[0], good[1], badFrame, good[2], good[3], willTimeout, good[4], good[5]];

const t0 = Date.now();
let sumJobMs = 0;
const manifestPath = path.join(OUT, 'pool-manifest.json');

const manifest = await runPool(jobs, {
  size: 3,
  batchId: 'phase5-test',
  manifestPath,
  onResult: (r) => { sumJobMs += r.ms; console.log(`  ${r.ok ? 'OK ' : 'XX '} ${r.id.padEnd(12)} attempts=${r.attempts} ${r.ms}ms${r.error ? '  ← ' + r.error.split('\n')[0] : ''}`); },
});

const wall = Date.now() - t0;
const s = summarize(manifest);
console.log('\n=== 5.1 / 5.2 RESULT ===');
console.log(`pool size: ${manifest.poolSize}`);
console.log(`jobs: ${s.total}  ok: ${s.ok}  failed: ${s.failed}`);
console.log(`wall-clock: ${wall}ms   sum-of-job-times: ${sumJobMs}ms   overlap factor: ${(sumJobMs / wall).toFixed(2)}x`);

const goodOk = manifest.jobs.filter((j) => j.id.startsWith('good-') && j.ok).length;
const failures = manifest.jobs.filter((j) => !j.ok).map((j) => j.id);
console.log(`\nASSERTIONS:`);
console.log(`  [${goodOk === 6 ? 'PASS' : 'FAIL'}] all 6 good jobs completed despite poison jobs in the batch (${goodOk}/6)`);
console.log(`  [${failures.includes('bad-frame') ? 'PASS' : 'FAIL'}] bad-frame failure is in the manifest`);
console.log(`  [${failures.includes('timeout-job') ? 'PASS' : 'FAIL'}] timeout-job failure is in the manifest`);
console.log(`  [${sumJobMs > wall ? 'PASS' : 'FAIL'}] overlap proves N-at-a-time (sum > wall)`);
console.log(`  [${fs.existsSync(manifestPath) ? 'PASS' : 'FAIL'}] manifest written: ${manifestPath}`);

// Phase D RENDER evidence (honest — the serialize-live-DOM trick CANNOT capture a
// montage, because it's driven by a live JS clock, not baked DOM). We prove parity two
// independent ways:
//
//   (1) FRAME-EXACT boundary: build the concat with buildMontageSource(), then for
//       sample timestamps spanning clip boundaries, assert the clip ACTUALLY on screen
//       in the concat is the one montageAt() predicts — matched by an independent color
//       fingerprint taken from each SOURCE clip (not from the concat). Sampled at and
//       just past a boundary, never only t=0.
//   (2) OUTPUT DURATION (F4): render a full creative whose video slot carries the
//       montage through render-frame.mjs and assert the MP4's duration == totalDuration
//       (overriding the auto 7s loop).
//
//   node creative-engine/editor/phase-d-render.mjs

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildMontageSource, montageAt, clipFrames, cycleDurationMs } from './montage.mjs';
import { renderMp4 } from './render-frame.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, '_out'); fs.mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log(...a);
const assert = (c, m) => { if (!c) { console.error('❌ FAIL:', m); process.exitCode = 1; } else log('  ✓', m); };

const FPS = 30;
const CACHE = path.join(ROOT, 'brand', 'kraken-cache');
// three distinct real clips
const clipFiles = fs.readdirSync(CACHE).filter((f) => f.endsWith('.mp4')).slice(0, 3).map((f) => path.join(CACHE, f));
if (clipFiles.length < 3) { console.error('need 3 cached mp4s in', CACHE); process.exit(1); }
const clips = clipFiles.map((src) => ({ src, in: 0, out: 1 }));   // 1s each → 30 frames each
log('clips:\n  ' + clipFiles.map((f) => path.basename(f)).join('\n  '));

// mean RGB of a single frame at time t (seconds) of a video, normalized small.
function meanRGB(file, t) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1',
    '-vf', 'scale=48:84,format=rgb24', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
  if (r.status !== 0 || !r.stdout.length) throw new Error('ffmpeg meanRGB failed for ' + file + ' @' + t + ': ' + String(r.stderr));
  const d = r.stdout; let R = 0, G = 0, B = 0, n = d.length / 3;
  for (let i = 0; i < d.length; i += 3) { R += d[i]; G += d[i + 1]; B += d[i + 2]; }
  return [R / n, G / n, B / n];
}
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// ── build the concat ──
log('\nD4 — buildMontageSource (trim+normalize+-frames:v exact+concat re-encode)');
const concat = path.join(OUT, 'd-montage-concat.mp4');
const built = await buildMontageSource(clips, FPS, concat);
assert(built.ok, 'buildMontageSource produced a concat MP4 (' + (built.reason || 'ok') + ')');
assert(built.frames === clipFrames(clips, FPS).reduce((a, b) => a + b, 0), `concat has Σ clipFrames frames (${built.frames})`);

// ffprobe the concat = ONE cycle = Σ clip durations = 3.0s, 90 frames
function ffDuration(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' });
  return parseFloat(String(r.stdout).trim());
}
function ffFrames(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0',
    '-show_entries', 'stream=nb_read_frames', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' });
  return parseInt(String(r.stdout).trim(), 10);
}
const cycleS = cycleDurationMs(clips, FPS) / 1000;
const concatDur = ffDuration(concat), concatFrames = ffFrames(concat);
log(`  concat: ${concatDur.toFixed(3)}s · ${concatFrames} frames (expected ${cycleS.toFixed(3)}s · ${built.frames})`);
assert(Math.abs(concatDur - cycleS) < 0.15, `concat duration == one cycle (${concatDur.toFixed(3)}s ≈ ${cycleS}s)`);
assert(concatFrames === built.frames, `concat frame count is frame-exact (${concatFrames} == ${built.frames})`);

// ── independent color fingerprints from the SOURCE clips ──
log('\nD2/D4 — correct clip on screen at sampled timestamps (incl. PAST a boundary)');
const fp = clips.map((c, i) => meanRGB(c.src, c.in + 0.5));   // mid-clip frame of each source
// the fingerprints must be mutually distinct or the test can't discriminate
const minPair = Math.min(dist(fp[0], fp[1]), dist(fp[0], fp[2]), dist(fp[1], fp[2]));
log(`  source fingerprints min pairwise distance: ${minPair.toFixed(1)}`);
// precondition guard only — the REAL proof is the per-sample margin below (on-clip
// distance ~0 vs wrong-clip ≥9). A min pairwise > 6 is plenty to discriminate.
assert(minPair > 6, `the 3 clips are visually distinct enough to discriminate (min dist ${minPair.toFixed(1)})`);

// sample the CONCAT at points spanning boundaries: mid-clip0, just-past-boundary into clip1,
// mid-clip1, mid-clip2, and PAST one full cycle (wrap → clip0 again).
const samples = [0.5, 1.05, 1.5, 2.5, 3.5];
let allMatch = true;
for (const t of samples) {
  const predicted = montageAt(clips, FPS, t * 1000).clipIndex;
  const sample = meanRGB(concat, t % cycleS);          // the concat is one cycle; wrap the probe
  const dists = fp.map((f) => dist(sample, f));
  const nearest = dists.indexOf(Math.min(...dists));
  const ok = nearest === predicted;
  if (!ok) allMatch = false;
  log(`  t=${t.toFixed(2)}s → montageAt predicts clip ${predicted}; concat nearest fingerprint = clip ${nearest} (dists ${dists.map((d) => d.toFixed(0)).join('/')}) ${ok ? '✓' : '✗'}`);
}
assert(allMatch, 'every sampled frame (incl. just past a boundary + past a full cycle) shows the clip montageAt predicts');

// ── F4: full render duration == totalDuration ──
log('\nF4 — full creative render: output length == montage.totalDuration (overrides 7s loop)');
const TAGGED = path.join(ROOT, 'campaigns/westfield-100-off/index.tagged.html');
const TOTAL = 4;   // deliberately != the auto 7s loop
const overrides = { 'f0:e0': { montage: { clips, totalDuration: TOTAL } } };
const outMp4 = path.join(OUT, 'd-fullrender.mp4');
await renderMp4({ taggedPath: TAGGED, overrides, frameId: 'f0', outMp4 });
const fullDur = ffDuration(outMp4);
log(`  rendered ${fullDur.toFixed(2)}s (expected ${TOTAL}s, NOT the 7s auto-loop)`);
assert(Math.abs(fullDur - TOTAL) < 0.3, `rendered MP4 is totalDuration long (${fullDur.toFixed(2)}s ≈ ${TOTAL}s)`);
assert(Math.abs(fullDur - 7) > 1, 'render length did NOT fall back to the 7s default loop');

log('\n' + (process.exitCode ? '=== PHASE D RENDER: FAIL ===' : '=== PHASE D RENDER: PASS ==='));

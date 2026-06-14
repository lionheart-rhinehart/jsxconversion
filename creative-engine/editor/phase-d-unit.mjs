// Phase D2 — frame-exact timeline math (node --test).
//   node --test creative-engine/editor/phase-d-unit.mjs
//
// Proves the parity contract (F2): montageAt() picks clips using EXACTLY the same
// whole-frame boundaries that buildMontageSource() forces per segment (`-frames:v`).
// If these two ever disagreed, the live preview and the rendered concat would cut at
// different instants. The test asserts the boundaries land on the cumulative
// clipFrames() sums — the same counts the renderer emits.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clipFrames, cycleFrames, cycleDurationMs, montageAt, normalizeMontage } from './montage.mjs';

const FPS = 30;
// three clips of different lengths (note 1.5s → 45 frames is exact; 2.0 → 60; 0.7 → 21)
const clips = [
  { src: 'a.mp4', in: 0, out: 1.5 },
  { src: 'b.mp4', in: 2, out: 4 },
  { src: 'c.mp4', in: 0.3, out: 1.0 },
];

test('clipFrames = round((out-in)*fps), >=1', () => {
  assert.deepEqual(clipFrames(clips, FPS), [45, 60, 21]);
  assert.deepEqual(clipFrames([{ src: 'x', in: 0, out: 0 }], FPS), [1]); // never zero
});

test('cycleFrames / cycleDurationMs are the sum', () => {
  assert.equal(cycleFrames(clips, FPS), 126);
  assert.equal(cycleDurationMs(clips, FPS), 126 / 30 * 1000); // 4200ms
});

test('montageAt cuts on the cumulative clipFrames boundaries (frame-exact)', () => {
  const frames = clipFrames(clips, FPS);            // [45,60,21]
  const bounds = [0, 45, 105];                       // first frame of each clip
  // first frame of each clip
  bounds.forEach((startFrame, i) => {
    const tMs = startFrame / FPS * 1000;
    const at = montageAt(clips, FPS, tMs);
    assert.equal(at.clipIndex, i, `frame ${startFrame} → clip ${i}`);
    assert.equal(at.frameInClip, 0, `frame ${startFrame} is clip ${i}'s first frame`);
    assert.equal(at.localOffsetMs, 0);
  });
  // LAST frame of each clip stays in that clip; the NEXT frame flips to the next clip
  let acc = 0;
  frames.forEach((n, i) => {
    const lastFrame = acc + n - 1;
    assert.equal(montageAt(clips, FPS, lastFrame / FPS * 1000).clipIndex, i, `last frame of clip ${i}`);
    const nextI = (i + 1) % frames.length;
    assert.equal(montageAt(clips, FPS, (lastFrame + 1) / FPS * 1000).clipIndex, nextI, `boundary after clip ${i} → clip ${nextI}`);
    acc += n;
  });
});

test('montageAt loops the cycle (t past one cycle wraps to the same clip/frame)', () => {
  const cyc = cycleDurationMs(clips, FPS);
  const a = montageAt(clips, FPS, 1000);
  const b = montageAt(clips, FPS, 1000 + cyc);
  const c = montageAt(clips, FPS, 1000 + cyc * 3);
  assert.equal(b.clipIndex, a.clipIndex);
  assert.equal(b.frameInClip, a.frameInClip);
  assert.equal(c.clipIndex, a.clipIndex);
  assert.equal(c.frameInClip, a.frameInClip);
});

test('localOffsetMs maps to a real currentTime inside the clip [in,out)', () => {
  // 50 frames in → clip 1 (frames 45..104), frameInClip 5 → 5/30s offset from in=2
  const at = montageAt(clips, FPS, 50 / FPS * 1000);
  assert.equal(at.clipIndex, 1);
  assert.equal(at.frameInClip, 5);
  const currentTime = at.clip.in + at.localOffsetMs / 1000;
  assert.ok(currentTime >= at.clip.in && currentTime < at.clip.out, 'currentTime within [in,out)');
});

test('empty montage is inert (clipIndex -1)', () => {
  assert.equal(montageAt([], FPS, 1234).clipIndex, -1);
});

test('normalizeMontage: total never falls below the clip cycle (no truncation)', () => {
  // 3 clips × 6s = 18s cycle. A bag asking for total=6 must be floored to 18 (all clips play).
  const c3 = [{ src: 'a', in: 0, out: 6 }, { src: 'b', in: 0, out: 6 }, { src: 'c', in: 0, out: 6 }];
  assert.equal(normalizeMontage({ clips: c3, totalDuration: 6 }, FPS).totalDuration, 18, 'floored to the cycle');
  assert.equal(normalizeMontage({ clips: c3, totalDuration: 30 }, FPS).totalDuration, 30, 'longer total preserved (loop-to-fill)');
  assert.equal(normalizeMontage({ clips: c3 }, FPS).totalDuration, 18, 'unset total = cycle');
});

test('normalizeMontage: total clamps up to 90 (raised from 30)', () => {
  const one = [{ src: 'a', in: 0, out: 2 }];
  assert.equal(normalizeMontage({ clips: one, totalDuration: 90 }, FPS).totalDuration, 90, '90 allowed');
  assert.equal(normalizeMontage({ clips: one, totalDuration: 200 }, FPS).totalDuration, 90, 'clamped to 90');
});

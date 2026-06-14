// Phase D audio — RENDER evidence (ffprobe + PCM-energy, deterministic).
//   node creative-engine/editor/phase-d-audio-render.mjs
//
// Proves the audio mux: (1) buildMontageAudio produces a track of length totalDuration;
// (2) the music START-OFFSET lands (a silence-then-tone source started PAST the silence has
// energy at t=0, vs ~silent when started at 0); (3) `native` mode carries the clip's own
// audio; (4) the full renderMp4 montage output has an AAC audio stream of the right length.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildMontageAudio } from './montage.mjs';
import { renderMp4 } from './render-frame.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, '_out'); fs.mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log(...a);
const assert = (c, m) => { if (!c) { console.error('❌ FAIL:', m); process.exitCode = 1; } else log('  ✓', m); };

// silence(2s)+tone(3s) source (built by the test harness step before this; rebuild if missing)
const TONE = path.join(OUT, 'test-silence-tone.m4a');
if (!fs.existsSync(TONE)) {
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-t', '2', '-i', 'anullsrc=r=44100:cl=stereo',
    '-f', 'lavfi', '-t', '3', '-i', 'sine=frequency=440:sample_rate=44100',
    '-filter_complex', '[0:a][1:a]concat=n=2:v=0:a=1[a]', '-map', '[a]', TONE]);
}
const kraken = fs.readdirSync(path.join(ROOT, 'brand', 'kraken-cache')).filter((f) => f.endsWith('.mp4')).slice(0, 2)
  .map((f) => path.join(ROOT, 'brand', 'kraken-cache', f));
if (kraken.length < 2) { console.error('need 2 cached kraken mp4s'); process.exit(1); }

const ffDur = (file) => parseFloat(String(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' }).stdout).trim());
const audioCodec = (file) => String(spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', file], { encoding: 'utf8' }).stdout).trim();
// RMS energy of a [ss, ss+dur] window (mono 8k s16)
function rms(file, ss, dur) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(ss), '-t', String(dur), '-i', file, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1 << 26 });
  const d = r.stdout; if (!d || !d.length) return 0;
  let sum = 0, n = d.length / 2;
  for (let i = 0; i + 1 < d.length; i += 2) { const v = d.readInt16LE(i); sum += v * v; }
  return Math.sqrt(sum / n);
}

const clips = [{ src: kraken[0], in: 0, out: 2 }, { src: kraken[1], in: 0, out: 2 }];

// ── (1) duration + (2) start-offset ──
log('\nA1 — buildMontageAudio: duration == totalDuration, and the music start-offset lands');
const bedAt2 = path.join(OUT, 'aud-bed-start2.m4a');
const r1 = await buildMontageAudio({ clips, totalDuration: 4, audio: { mode: 'music', src: TONE, startAt: 2, volume: 1.0 } }, 30, bedAt2, { resolveSrc: (s) => s });
assert(r1.ok, 'built a music-bed audio track (' + (r1.reason || 'ok') + ')');
const d1 = ffDur(bedAt2);
log(`  track duration ${d1.toFixed(2)}s (expected 4s)`);
assert(Math.abs(d1 - 4) < 0.25, `audio length == totalDuration (${d1.toFixed(2)}s ≈ 4s)`);

const bedAt0 = path.join(OUT, 'aud-bed-start0.m4a');
await buildMontageAudio({ clips, totalDuration: 4, audio: { mode: 'music', src: TONE, startAt: 0, volume: 1.0 } }, 30, bedAt0, { resolveSrc: (s) => s });
const e_at2 = rms(bedAt2, 0, 1);   // startAt=2 → past the 2s silence → TONE at t=0 (loud)
const e_at0 = rms(bedAt0, 0, 1);   // startAt=0 → the silence is at t=0 (quiet)
log(`  energy@t0: startAt=2 → ${e_at2.toFixed(0)} · startAt=0 → ${e_at0.toFixed(0)}`);
assert(e_at2 > 800, `start-offset landed: tone present at t=0 when startAt=2 (RMS ${e_at2.toFixed(0)})`);
assert(e_at2 > e_at0 * 5, `start-offset is honored: startAt=2 is far louder at t=0 than startAt=0 (${e_at2.toFixed(0)} vs ${e_at0.toFixed(0)})`);

// ── (3) native mode carries the clip's own audio ──
log('\nA2 — native mode: the clip’s own audio is in the track');
const nat = path.join(OUT, 'aud-native.m4a');
const r3 = await buildMontageAudio({ clips, totalDuration: 4, audio: { mode: 'native', volume: 1.0 } }, 30, nat, { resolveSrc: (s) => s });
assert(r3.ok, 'built a native-audio track');
const e_nat = rms(nat, 0, 2);
log(`  native energy ${e_nat.toFixed(0)}`);
assert(e_nat > 200, `native clip audio present (RMS ${e_nat.toFixed(0)} > 0)`);

// no-audio case stays silent (mode mute / nothing) → {ok:false}
const none = await buildMontageAudio({ clips, totalDuration: 4, audio: { mode: 'mute' } }, 30, path.join(OUT, 'aud-none.m4a'), { resolveSrc: (s) => s });
assert(none.ok === false, 'mute/no-audio montage produces NO track (render stays silent)');

// ── (4) full renderMp4 mux: output MP4 has an AAC audio stream of totalDuration ──
log('\nA3 — full renderMp4 montage with music → MP4 carries an AAC audio stream');
const TAGGED = path.join(ROOT, 'campaigns/westfield-100-off/index.tagged.html');
const clipRel = fs.readdirSync(path.join(ROOT, 'brand', 'kraken-cache')).filter((f) => f.endsWith('.mp4')).slice(0, 2).map((f) => '/brand/kraken-cache/' + f);
const overrides = { 'f0:e0': { montage: { clips: clipRel.map((s) => ({ src: s, in: 0, out: 2 })), totalDuration: 4, audio: { mode: 'music', src: '/creative-engine/editor/_out/test-silence-tone.m4a', startAt: 2, volume: 1.0 } } } };
const outMp4 = path.join(OUT, 'aud-render.mp4');
await renderMp4({ taggedPath: TAGGED, overrides, frameId: 'f0', outMp4 });
const codec = audioCodec(outMp4), dM = ffDur(outMp4);
log(`  rendered MP4: audio=${codec || 'NONE'} · ${dM.toFixed(2)}s`);
assert(/aac/i.test(codec), `rendered montage MP4 has an AAC audio stream (${codec})`);
assert(Math.abs(dM - 4) < 0.4, `MP4 duration == totalDuration (${dM.toFixed(2)}s ≈ 4s)`);
assert(rms(outMp4, 0, 1) > 600, `the muxed audio is the tone from startAt=2 (RMS ${rms(outMp4, 0, 1).toFixed(0)})`);

log('\n' + (process.exitCode ? '=== PHASE D AUDIO RENDER: FAIL ===' : '=== PHASE D AUDIO RENDER: PASS ==='));

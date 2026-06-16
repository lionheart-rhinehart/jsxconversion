// creative-engine/editor/render-live.mjs
//
// ZERO-LOSS render path for JS-DRIVEN Claude Design exports.
//
// The original render-frame.mjs loads a STATICALLY tagged file and seeks WAAPI + <video>.
// That works for flat .dc.html, but a real export (Campaign B) builds + animates its
// frames with its OWN JS at runtime, and raw requestAnimationFrame count-ups FROZE under
// the static path (seek.js never drove rAF — measured .tmp/spike2.mjs).
//
// This path keeps the design fully LIVE and captures EVERY animation:
//   1. Pre-inject the shared browser modules at document-start — raf-clock FIRST (it
//      replaces requestAnimationFrame/performance.now with a clock WE drive), then
//      frame-detect, runtime-retag, apply-overrides, seek.
//   2. Navigate in REAL time (page.goto). RUNTIME RE-TAG the live DOM (the design's JS
//      built it), then apply the override bag.
//   3. Per frame i: advance the injected JS CLOCK to i/fps (drives rAF/perf.now count-ups
//      — proven .tmp/jsclock.mjs), run seek.js (pins WAAPI + seeks <video>), then capture.
//      → CSS loops + reveals + video + count-ups all play.
//
// Why a JS clock and not CDP virtual time: under Emulation.setVirtualTimePolicy the
// <video> media pipeline never decodes a seeked frame (readyState stalls at 1) and
// captureScreenshot deadlocks on a quiet compositor (measured — .tmp/vidtest2.mjs,
// .tmp/matrix.mjs). rAF count-ups need a controllable clock; <video> needs REAL time. The
// JS fake clock gives both at once (proven on count-up AND video — .tmp/jsclockvid.mjs).
//
// Clean room: imports only sibling creative-engine modules; nothing from
// creative-engine-v1. Serve the export over HTTP (Range) so <video> can seek.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer';
// Audio is the SAME builder the static path uses (render-frame.mjs → buildMontageAudio).
// The live path captures video silently (browser is --mute-audio), so the montage's
// music must be built separately and muxed into the MP4 — otherwise the final render
// is silent. Clip/music srcs are http(s) (portableized) or local; ffmpeg reads both.
import { buildMontageAudio } from './montage.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHARED = path.resolve(__dirname, '..', 'shared');

const RAF_CLOCK_SRC = fs.readFileSync(path.join(SHARED, 'raf-clock.js'), 'utf8');
const FRAME_DETECT_SRC = fs.readFileSync(path.join(SHARED, 'frame-detect.js'), 'utf8');
const RETAG_SRC = fs.readFileSync(path.join(SHARED, 'runtime-retag.js'), 'utf8');
const APPLY_SRC = fs.readFileSync(path.join(__dirname, 'apply-overrides.js'), 'utf8');
const SEEK_SRC = fs.readFileSync(path.join(__dirname, 'seek.js'), 'utf8');
// raf-clock MUST be first — it patches rAF/perf.now before the design's scripts run.
const INJECT = [RAF_CLOCK_SRC, FRAME_DETECT_SRC, RETAG_SRC, APPLY_SRC, SEEK_SRC];

const STAGE_W = 1080, STAGE_H = 1920, FPS = 30, LOOP = 7;

// Find the first montage in an override bag that carries non-mute music — the live
// render captures it silently, so we build + mux its audio. Returns the montage or null.
function montageWithAudio(overrides) {
  for (const k of Object.keys(overrides || {})) {
    const m = overrides[k] && overrides[k].montage;
    const a = m && m.audio;
    if (m && Array.isArray(m.clips) && m.clips.length && a && a.mode && a.mode !== 'mute') return m;
  }
  return null;
}

// Launch flags that make Page.captureScreenshot DETERMINISTIC. Without
// --run-all-compositor-stages-before-draw, captureScreenshot can wait for a natural
// compositor frame that a quiet page never produces, deadlocking the call (measured racy
// — .tmp/matrix.mjs). This flag forces the compositor to run every stage synchronously
// before the draw, so the screenshot is taken from a freshly-composited frame every time.
export const LAUNCH_ARGS = [
  '--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio',
  '--run-all-compositor-stages-before-draw', '--disable-new-content-rendering-timeout', '--disable-gpu',
];

// Open the live design in REAL time with the injected JS clock, re-tag it, apply overrides.
// Returns { page, clock, retag }. `clock` carries the CDP session used for screenshots +
// an advanceTo(ms). `url` MUST be http(s) so <video> Range-seeks/decodes.
export async function openLive(browser, url, { overrides = {}, retagOpts = {}, prepare = null } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width: STAGE_W, height: STAGE_H, deviceScaleFactor: 1 });
  const client = await page.target().createCDPSession();
  await client.send('Page.enable');
  for (const src of INJECT) await client.send('Page.addScriptToEvaluateOnNewDocument', { source: src });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.evaluate(async () => { await (document.fonts ? document.fonts.ready : Promise.resolve()); });
  // flush any build-time rAFs at t=0 so the DOM is in its frame-0 state before tagging
  await page.evaluate(() => window.__ceClock && window.__ceClock.advanceTo(0));

  // optional in-page prep AFTER build, BEFORE re-tag — used by evidence harnesses to
  // surface a specific creative (e.g. mount a particular .story). Production passes none.
  if (prepare) { await page.evaluate(prepare); }

  // RUNTIME RE-TAG the live DOM (deterministic ids on the JS-built elements).
  const retag = await page.evaluate((opts) => window.CEReTag.tag(document, opts), retagOpts);
  if (retag.framesEmpty || !retag.frames) {
    throw new Error('[render-live] runtime re-tag found ZERO frames — design structure unrecognized (NOT silently skipped). url=' + url);
  }
  // apply the override bag with the SAME apply-overrides the editor uses
  const res = await page.evaluate((ov) => window.CEApply.applyOverrides(document, ov), overrides || {});
  if (res.missing.length) console.error('[render-live] WARNING missing override keys (surfaced, not silent):', res.missing);

  const clock = {
    client,
    advanceTo: (tMs) => page.evaluate((t) => window.__ceClock.advanceTo(t), tMs),
    dispose: async () => { try { await client.detach(); } catch (e) {} },
  };
  return { page, clock, retag };
}

// Isolate one frame (by detected/static data-edit-frame id) as the render root at scale 1.
export async function isolateFrame(page, frameId) {
  await page.evaluate((fid) => {
    const frame = document.querySelector('[data-edit-frame="' + fid + '"]');
    if (!frame) throw new Error('frame not found: ' + fid);
    const ce = document.getElementById('ce-iframe-css'); if (ce) ce.remove();
    frame.style.transform = 'none';
    frame.style.transformOrigin = 'top left';
    frame.id = '__rtgt';
    // detach siblings but KEEP the frame's own animation/rAF state alive (we move it, not clone)
    document.body.innerHTML = '';
    document.body.style.margin = '0';
    document.body.style.background = '#0a0b0d';
    document.body.appendChild(frame);
    frame.style.position = 'fixed'; frame.style.top = '0'; frame.style.left = '0';
    Array.from(frame.querySelectorAll('video')).forEach((v) => { try { v.pause(); v.loop = false; } catch (e) {} });
  }, frameId);
}

// advance the JS clock to frame time → drive rAF/perf.now count-ups; then seek.js pins
// WAAPI/CSS + seeks <video> (real-time decode); then capture.
//
// Screenshot via CDP Page.captureScreenshot with an explicit CLIP rect — NOT
// elementHandle.screenshot. Puppeteer's element screenshot does a scrollIntoViewIfNeeded
// that awaits requestAnimationFrame — which our injected clock controls, so it would
// hang. A fixed clip at 0,0 needs no scroll, no rAF.
export async function seekAndShot(page, clock, tMs, outPng) {
  await clock.advanceTo(tMs);                   // injected JS clock: rAF/perf.now → exact frame
  await page.evaluate(async (tMs) => {
    await window.CESeek(document.getElementById('__rtgt') || document, tMs, { noRaf: true });
  }, tMs);
  const { data } = await clock.client.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: STAGE_W, height: STAGE_H, scale: 1 },
    captureBeyondViewport: false,
  });
  const buf = Buffer.from(data, 'base64');
  if (outPng) fs.writeFileSync(outPng, buf);
  return buf;
}

// one frame at a timestamp (single-frame evidence path)
export async function renderFrameAt({ url, overrides, frameId, tMs, outPng, retagOpts, prepare }) {
  const browser = await puppeteer.launch({ headless: true, args: LAUNCH_ARGS });
  try {
    const { page, clock } = await openLive(browser, url, { overrides, retagOpts, prepare });
    await isolateFrame(page, frameId);
    return await seekAndShot(page, clock, tMs, outPng);
  } finally { await browser.close(); }
}

// full MP4 of one creative — ONE page, frames captured forward. The compositor flags
// (LAUNCH_ARGS) make every per-frame capture deterministic; the injected JS clock makes
// each frame's animation state deterministic. No per-frame page churn.
export async function renderMp4({ url, overrides, frameId, outMp4, fps = FPS, loop = LOOP, retagOpts, prepare }) {
  const browser = await puppeteer.launch({ headless: true, args: LAUNCH_ARGS });
  const framesDir = path.join(path.dirname(outMp4), '.frames-' + frameId);
  fs.rmSync(framesDir, { recursive: true, force: true }); fs.mkdirSync(framesDir, { recursive: true });
  try {
    const { page, clock } = await openLive(browser, url, { overrides, retagOpts, prepare });
    await isolateFrame(page, frameId);
    const total = Math.round(fps * loop);
    for (let i = 0; i < total; i++) {
      await seekAndShot(page, clock, (i / fps) * 1000, path.join(framesDir, `f_${String(i).padStart(5, '0')}.png`));
    }
  } finally { await browser.close(); }
  const ff = spawnSync('ffmpeg', ['-y', '-framerate', String(fps), '-i', path.join(framesDir, 'f_%05d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outMp4], { stdio: 'inherit' });
  fs.rmSync(framesDir, { recursive: true, force: true });
  if (ff.status !== 0) throw new Error('ffmpeg failed (is it on PATH?)');

  // AUDIO (mirror of render-frame.mjs): build the montage's mixed track and mux it into
  // the silent video. srcs are passed through (http(s) after portableize, or local) —
  // ffmpeg/ffprobe read both. Never throws on audio failure: a silent video still ships.
  const mont = montageWithAudio(overrides);
  if (mont) {
    const adir = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-live-audio-'));
    try {
      const apath = path.join(adir, 'audio.m4a');
      const ar = await buildMontageAudio(mont, fps, apath, { resolveSrc: (s) => s });
      if (ar.ok && fs.existsSync(ar.path)) {
        const muxed = outMp4.replace(/\.mp4$/i, '.muxed.mp4');
        const mx = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', outMp4, '-i', ar.path,
          '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-map', '0:v:0', '-map', '1:a:0', '-shortest',
          '-movflags', '+faststart', muxed], { encoding: 'utf8' });
        if (mx.status === 0 && fs.existsSync(muxed)) { fs.rmSync(outMp4, { force: true }); fs.renameSync(muxed, outMp4); }
        else console.error('[render-live] audio mux failed (video kept silent):', String(mx.stderr || '').trim().split(/\r?\n/).slice(-2).join(' | '));
      } else {
        console.error('[render-live] montage audio not built (video kept silent):', ar && ar.reason);
      }
    } catch (e) {
      console.error('[render-live] audio step threw (video kept silent):', e.message);
    } finally { try { fs.rmSync(adir, { recursive: true, force: true }); } catch (e) {} }
  }
  return outMp4;
}

// CLI: node render-live.mjs <http-url> <frameId> [--overrides ov.json] [--mp4 out.mp4 | --at <ms> out.png]
const isMain = process.argv[1] && process.argv[1].endsWith('render-live.mjs');
if (isMain) {
  const args = process.argv.slice(2);
  const [url, frameId] = args;
  const overrides = args.includes('--overrides') ? JSON.parse(fs.readFileSync(args[args.indexOf('--overrides') + 1], 'utf8')) : {};
  if (args.includes('--mp4')) {
    const out = args[args.indexOf('--mp4') + 1];
    await renderMp4({ url, overrides, frameId, outMp4: out });
    console.log('wrote', out);
  } else if (args.includes('--at')) {
    const tMs = Number(args[args.indexOf('--at') + 1]);
    const out = args[args.indexOf('--at') + 2];
    await renderFrameAt({ url, overrides, frameId, tMs, outPng: out });
    console.log('wrote', out);
  } else {
    console.error('usage: render-live.mjs <http-url> <frameId> [--overrides ov.json] [--mp4 out.mp4 | --at <ms> out.png]');
  }
}

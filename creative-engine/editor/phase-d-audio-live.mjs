// Phase D audio — UNIFIED window, LIVE UI, REAL mouse (the 2026-06-12 lesson). Requires a
// connected serve.mjs (the /audio/* routes + a music-library/).
//   PORT=5251 node creative-engine/editor/serve.mjs    # (running)
//   PORT=5251 node creative-engine/editor/phase-d-audio-live.mjs
//
// Proves the day-one ask — see the clip AND hear the audio together in ONE window:
//   • clicking a clip opens the trim window with the trim bar AND the audio controls inline,
//     and a VISIBLE video preview (refuting the "waveform with nothing to watch" bug);
//   • picking a track renders the waveform in that same window;
//   • the SINGLE Play drives the video and the <audio> simultaneously;
//   • dragging the waveform sets the start point in clips[i].audio;
//   • mode toggle writes the bag; ✓ Done saves and closes (no separate overlay ever shows);
//   • ♪ Music opens the same window in montage scope (whole-video music, no per-clip bar);
//   • Upload adds a file to the library and selects it.

import puppeteer from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5251;
const OUT = path.join(__dirname, '_out'); fs.mkdirSync(OUT, { recursive: true });
const URL = `http://localhost:${PORT}/creative-engine/editor/editor-host.html?html=/campaigns/westfield-100-off/index.tagged.html`;
const A = '/campaigns/westfield-100-off/assets/vid/ad1.mp4', B = '/campaigns/westfield-100-off/assets/vid/ad2.mp4';
const log = (...a) => console.log(...a);
const assert = (c, m) => { if (!c) { console.error('❌ FAIL:', m); process.exitCode = 1; } else log('  ✓', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--window-size=1500,1050'] });
const page = await browser.newPage();
await page.setViewport({ width: 1500, height: 1050, deviceScaleFactor: 1 });
const bag = () => page.evaluate(() => window.__CE_EDITOR__.getOverrides());
const mAudio = async () => ((await bag())['f0:e0'].montage.audio);
const clipAudio = async (i) => ((await bag())['f0:e0'].montage.clips[i].audio);
const clickEl = async (sel) => { const h = await page.waitForSelector(sel, { visible: true, timeout: 8000 }); const b = await h.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };

async function openArrange() {
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__CE_EDITOR__ && window.__CE_EDITOR__.getOverrides');
  await sleep(400);
  await page.evaluate((a, b) => window.__CE_EDITOR__.setOverrides({ 'f0:e0': { montage: { clips: [{ src: a, in: 0, out: 3 }, { src: b, in: 0, out: 3 }], totalDuration: 6 } } }), A, B);
  await sleep(400);
  const fbox = await (await page.$('.ce-frame-host')).boundingBox();
  const inner = page.frames().find((f) => f !== page.mainFrame());
  const m = await inner.evaluate(() => { const el = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-id="e0"]'); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.click(fbox.x + m.x, fbox.y + m.y);
  await page.waitForFunction(() => { const b = document.querySelector('.ce-edit-montage'); return b && getComputedStyle(b).display !== 'none'; }, { timeout: 8000 });
  await clickEl('.ce-edit-montage');
  await page.waitForFunction(() => document.querySelector('.ce-media-modal.ce-on'), { timeout: 8000 });
  await page.waitForFunction(() => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === 2, { timeout: 8000 });
}

async function openClipTrimmer(n) {
  const thumb = await page.$(`.ce-mont-strip .ce-mont-clip:nth-child(${n}) .ce-mc-thumb`);
  const tb = await thumb.boundingBox(); await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await page.waitForFunction(() => document.querySelector('.ce-mont-trimmer.ce-on'), { timeout: 8000 });
}

try {
  // ── ONE WINDOW: click a clip → trim bar + audio controls + visible video together ──
  log('\nUnified clip window — trim + audio + video in ONE place');
  await openArrange();
  await openClipTrimmer(1);
  // the video needs a moment to load metadata so it has a real rendered height
  await page.waitForFunction(() => { const v = document.querySelector('.ce-tr-video'); return v && v.getBoundingClientRect().height > 40; }, { timeout: 8000 });
  const one = await page.evaluate(() => {
    const bar = document.querySelector('.ce-tr-bar');
    const modes = document.querySelectorAll('.ce-tr-controls .ce-aud-mode').length;
    const wave = document.querySelector('.ce-tr-controls .ce-audio-panel .ce-aud-wave');
    const overlay = document.querySelector('.ce-audio-panel');
    const op = overlay && getComputedStyle(overlay).position;
    const v = document.querySelector('.ce-tr-video'); const vr = v && v.getBoundingClientRect();
    return { bar: !!bar, modes, wave: !!wave, embedded: !!(overlay && document.querySelector('.ce-tr-controls').contains(overlay)), position: op, vis: !!(vr && vr.height > 40 && vr.width > 0) };
  });
  log('  ' + JSON.stringify(one));
  assert(one.bar, 'trim bar present');
  assert(one.modes >= 4, 'audio mode buttons (Native/My audio/Both/Mute) present in the same window');
  assert(one.wave, 'waveform canvas present in the same window');
  assert(one.embedded && one.position !== 'absolute', 'audio panel is INLINE inside the trim controls (not a covering overlay)');
  assert(one.vis, 'video preview is visible (height > 40px) — you can watch the clip while picking audio');

  // pick a track → waveform decodes + renders in the SAME window
  log('\nPick a track → waveform renders inline');
  await clickEl('.ce-tr-controls .ce-aud-mode[data-m="music"]');
  await page.waitForFunction(() => document.querySelector('.ce-aud-list').options.length > 1, { timeout: 8000 });
  const trackUrl = await page.evaluate(() => document.querySelector('.ce-aud-list').options[1].value);
  log('  library track: ' + trackUrl);
  await page.select('.ce-aud-list', trackUrl);
  await page.waitForFunction(() => { const c = window.__CE_EDITOR__.getOverrides()['f0:e0'].montage.clips[0].audio; return c && c.src; }, { timeout: 4000 });
  await page.waitForFunction(() => { const s = document.querySelector('.ce-aud-status'); const c = document.querySelector('.ce-aud-wave'); return s && !/loading/i.test(s.textContent) && c && c.width > 0; }, { timeout: 12000 });
  assert(!!(await clipAudio(0)).src, 'picked track → clips[0].audio.src set + waveform rendered');
  await page.screenshot({ path: path.join(OUT, 'd-unified-clip.png') });

  // the SINGLE Play drives video + audio together
  log('\nSingle Play → video AND audio play together');
  await clickEl('.ce-tr-play');
  await sleep(1000);
  const sync = await page.evaluate(() => { const v = document.querySelector('.ce-tr-video'); const a = document.querySelector('.ce-aud-el'); return { vPaused: v ? v.paused : true, vT: v ? v.currentTime : 0, aHas: !!a, aPaused: a ? a.paused : true, aT: a ? a.currentTime : 0 }; });
  log('  ' + JSON.stringify(sync));
  assert(sync.vPaused === false && sync.vT > 0.05, `video is playing (t=${sync.vT.toFixed(2)}s)`);
  assert(sync.aHas && sync.aPaused === false && sync.aT > 0.1, `audio is playing at the same time (t=${sync.aT.toFixed(2)}s)`);
  await clickEl('.ce-tr-play');   // pause

  // drag the waveform start marker → clips[0].audio.startAt increases
  log('\nDrag the waveform → set where the audio starts');
  const before = (await clipAudio(0)).startAt || 0;
  const wb = await (await page.$('.ce-aud-wavewrap')).boundingBox();
  await page.mouse.move(wb.x + wb.width * 0.20, wb.y + wb.height / 2);
  await page.mouse.down();
  await page.mouse.move(wb.x + wb.width * 0.60, wb.y + wb.height / 2, { steps: 10 });
  await page.mouse.up();
  await sleep(300);
  const after = (await clipAudio(0)).startAt || 0;
  log(`  start: ${before}s → ${after}s`);
  assert(after > before + 0.1, `dragging set the start point (${before} → ${after}s)`);

  // mode toggle → bag updates
  await clickEl('.ce-tr-controls .ce-aud-mode[data-m="native"]');
  await page.waitForFunction(() => { const c = window.__CE_EDITOR__.getOverrides()['f0:e0'].montage.clips[0].audio; return c && c.mode === 'native'; }, { timeout: 4000 });
  assert((await clipAudio(0)).mode === 'native', 'mode toggle wrote clips[0].audio.mode = native');

  // ✓ Done saves + closes; toggling back to music KEEPS the dragged start (no re-pick reset)
  await clickEl('.ce-tr-controls .ce-aud-mode[data-m="music"]');
  await sleep(150);
  await clickEl('.ce-tr-done');
  await page.waitForFunction(() => !document.querySelector('.ce-mont-trimmer.ce-on'), { timeout: 5000 });
  const ca = await clipAudio(0);
  assert(ca && ca.mode === 'music' && ca.src && ca.startAt > 0, `✓ Done saved clips[0].audio {music, src, startAt ${ca.startAt}s}`);
  await page.waitForFunction(() => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === 2, { timeout: 5000 });

  // ── ♪ Music: same window, montage scope (whole-video music, no per-clip trim bar) ──
  log('\n♪ Music — whole-video music in the same unified window (montage scope)');
  await clickEl('.ce-mont-music');
  await page.waitForFunction(() => document.querySelector('.ce-mont-trimmer.ce-on') && document.querySelector('.ce-audio-panel.ce-on'), { timeout: 6000 });
  const noBar = await page.evaluate(() => !document.querySelector('.ce-tr-bar') && document.querySelector('.ce-tr-controls .ce-audio-panel'));
  assert(noBar, 'montage scope: audio controls present, no per-clip trim bar');
  await clickEl('.ce-tr-controls .ce-aud-mode[data-m="music"]');
  await page.waitForFunction(() => { const a = window.__CE_EDITOR__.getOverrides()['f0:e0'].montage.audio; return a && a.mode === 'music'; }, { timeout: 4000 });
  await page.select('.ce-aud-list', trackUrl);
  await page.waitForFunction(() => (window.__CE_EDITOR__.getOverrides()['f0:e0'].montage.audio || {}).src, { timeout: 4000 });
  await clickEl('.ce-tr-play');
  await sleep(1100);
  const msync = await page.evaluate(() => { const v = document.querySelector('.ce-tr-stage .ce-tr-vid.ce-on') || document.querySelector('.ce-tr-vid'); const a = document.querySelector('.ce-aud-el'); return { vPaused: v ? v.paused : true, aHas: !!a, aPaused: a ? a.paused : true, aT: a ? a.currentTime : 0 }; });
  log('  ' + JSON.stringify(msync));
  assert(msync.vPaused === false && msync.aHas && msync.aPaused === false && msync.aT > 0.1, 'montage preview video + music play together');
  await clickEl('.ce-tr-play');
  assert(!!(await mAudio()).src, `montage.audio saved {music, src}`);

  // upload still lands in the library + becomes the src
  log('\nUpload — add a track from disk → joins the library + becomes the src');
  const upSrc = path.join(OUT, 'upload-test.mp3');
  if (!fs.existsSync(upSrc)) { const { spawnSync } = await import('node:child_process'); spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-t', '2', '-i', 'sine=frequency=330', '-c:a', 'libmp3lame', upSrc]); }
  const fileInput = await page.$('.ce-aud-upload');
  await fileInput.uploadFile(upSrc);
  await page.waitForFunction(() => { const a = window.__CE_EDITOR__.getOverrides()['f0:e0'].montage.audio; return a && /\/brand\/audio-cache\/uploads\//.test(a.src || ''); }, { timeout: 15000 });
  const up = (await mAudio()).src;
  log('  uploaded src: ' + up);
  assert(/^\/brand\/audio-cache\/uploads\//.test(up), `upload saved + selected (${up})`);
  await page.screenshot({ path: path.join(OUT, 'd-unified-montage.png') });
  await clickEl('.ce-tr-done');

  log('\n' + (process.exitCode ? '=== PHASE D AUDIO LIVE: FAIL ===' : '=== PHASE D AUDIO LIVE: PASS ==='));
} finally {
  await browser.close();
}

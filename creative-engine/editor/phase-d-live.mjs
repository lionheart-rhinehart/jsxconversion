// Phase D LIVE — D1 (filmstrip UI) + D3 (live preview driver), driven with REAL mouse
// input scoped to the visible frame (the 2026-06-12 lesson: synthetic dispatchEvent
// lies; only real page.mouse proves a human can do it). Requires a connected serve.mjs.
//
//   PORT=5251 node creative-engine/editor/serve.mjs   # (already running)
//   PORT=5251 node creative-engine/editor/phase-d-live.mjs
//
// Proves: dbl-click media → swap bar → real-click 🎬 Montage → filmstrip seeds 1 clip →
// arm Add + real-click two thumbnails → bag holds montage{clips:3} → the bg <video> is
// driven (its src cycles through ≥2 distinct clips within totalDuration) → real-click
// reorder / delete / set total all mutate the portable bag. Screenshots saved to _out.

import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5251;
const OUT = path.join(__dirname, '_out'); fs.mkdirSync(OUT, { recursive: true });
const URL = `http://localhost:${PORT}/creative-engine/editor/editor-host.html?html=/campaigns/westfield-100-off/index.tagged.html`;

const log = (...a) => console.log(...a);
const assert = (c, m) => { if (!c) { console.error('❌ FAIL:', m); process.exitCode = 1; } else log('  ✓', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// REAL click on a parent-doc chrome element (boundingBox center → page.mouse)
async function realClick(page, sel) {
  const h = await page.$(sel); if (!h) throw new Error('no element: ' + sel);
  const b = await h.boundingBox(); if (!b) throw new Error('not visible: ' + sel);
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}

const browser = await puppeteer.launch({ headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--window-size=1400,1000'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__CE_EDITOR__ && window.__CE_EDITOR__.getOverrides');
  await sleep(600);

  // ── open the swap bar on the bg media via a REAL double-click (scoped to the frame) ──
  log('\nD1 — open montage on the bg <video> (real dbl-click → 🎬 Montage)');
  const fbox = await (await page.$('.ce-frame-host')).boundingBox();
  const inner = page.frames().find((f) => f !== page.mainFrame());
  const m = await inner.evaluate(() => {
    const el = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-media][data-edit-media-kind="video"][data-edit-id]');
    const b = el.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  });
  await page.mouse.click(fbox.x + m.x, fbox.y + m.y, { clickCount: 2 });
  await sleep(250);
  await page.waitForFunction(() => { const s = document.querySelector('.ce-swapbar'); return s && getComputedStyle(s).display !== 'none'; }, { timeout: 8000 });

  await realClick(page, '.ce-montage-open');
  await page.waitForFunction(() => document.querySelector('.ce-montage-panel.ce-on'), { timeout: 8000 });
  const seeded = await page.evaluate(() => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length);
  assert(seeded === 1, `montage panel opens with the slot's current clip seeded (${seeded} clip)`);
  await page.screenshot({ path: path.join(OUT, 'd-live-1-open.png') });

  // ── ARM add mode ONCE (real click — it persists so you can add several), then
  //    real-click two static thumbnails to APPEND two more clips ──
  log('\nD1 — arm “＋ Add clip”, real-click two thumbnails → 3-clip montage');
  await realClick(page, '.ce-mont-add');
  await page.waitForFunction(() => document.querySelector('.ce-mont-add.ce-on'), { timeout: 4000 });
  for (let n = 0; n < 2; n++) {
    const thumbs = await page.$$('.ce-thumbs video, .ce-thumbs img');
    const t = thumbs[(n + 1) % thumbs.length];   // ad2, then ad3 → distinct from the ad1 seed
    const b = await t.boundingBox();
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForFunction((want) => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === want, { timeout: 6000 }, seeded + n + 1);
  }
  let bag = await page.evaluate(() => window.__CE_EDITOR__.getOverrides());
  let mont = bag['f0:e0'] && bag['f0:e0'].montage;
  assert(mont && mont.clips.length === 3, `bag holds portable montage{clips:3} (${mont ? mont.clips.length : 0})`);
  assert(typeof mont.totalDuration === 'number' && mont.totalDuration > 0, `montage has a numeric totalDuration (${mont && mont.totalDuration}s)`);
  await page.screenshot({ path: path.join(OUT, 'd-live-2-threeclips.png') });

  // ── D3 — the bg <video> is DRIVEN: its src cycles through ≥2 distinct clips ──
  log('\nD3 — live driver cycles the <video> through the clips (real wall-clock sampling)');
  const driven = await inner.evaluate(() => {
    const v = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-id="e0"]');
    return !!(v && v.__ceMontage && v.__ceMontage.clips && v.__ceMontage.clips.length === 3);
  });
  assert(driven, 'the tagged <video> carries __ceMontage{clips:3} (driver attached, same node)');
  const seen = new Set();
  for (let i = 0; i < 16; i++) {
    const src = await inner.evaluate(() => {
      const v = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-id="e0"]');
      return v ? (v.currentSrc || v.getAttribute('src') || '') : '';
    });
    if (src) seen.add(src.replace(/^.*\//, ''));
    await sleep(400);   // sample across ~6.4s — longer than the default 6s totalDuration
  }
  log('  distinct clip srcs observed on the live <video>:', [...seen]);
  assert(seen.size >= 2, `live preview cycled through ≥2 distinct clips (${seen.size} seen)`);

  // ── D1 — reorder (real ◀/▶), delete (real ✕), and total-duration (real typing) ──
  log('\nD1 — reorder / delete / total-duration via real input');
  const order0 = mont.clips.map((c) => c.src.replace(/^.*\//, ''));
  // move clip #2 earlier with its ◀ button (the 2nd clip's up-arrow)
  const ups = await page.$$('.ce-mont-clip .ce-mc-up');
  let b = await ups[1].boundingBox();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await sleep(250);
  bag = await page.evaluate(() => window.__CE_EDITOR__.getOverrides());
  const order1 = bag['f0:e0'].montage.clips.map((c) => c.src.replace(/^.*\//, ''));
  assert(order1[0] === order0[1] && order1[1] === order0[0], `reorder ◀ swapped clips 1↔2 (${order0.slice(0,2)} → ${order1.slice(0,2)})`);

  // delete the last clip
  const dels = await page.$$('.ce-mont-clip .ce-mc-del');
  b = await dels[dels.length - 1].boundingBox();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForFunction(() => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === 2, { timeout: 5000 });
  bag = await page.evaluate(() => window.__CE_EDITOR__.getOverrides());
  assert(bag['f0:e0'].montage.clips.length === 2, 'delete ✕ removed a clip (3 → 2)');

  // set total duration to 9 via real typing
  const tot = await page.$('.ce-mont-total');
  await tot.click({ clickCount: 3 });        // select existing
  await page.keyboard.type('9');
  await page.keyboard.press('Tab');          // commit on change/blur
  await sleep(250);
  bag = await page.evaluate(() => window.__CE_EDITOR__.getOverrides());
  assert(bag['f0:e0'].montage.totalDuration === 9, `total-duration field set totalDuration=9 (${bag['f0:e0'].montage.totalDuration})`);

  // trim the first clip's out → length readout updates
  const outI = await page.$('.ce-mont-clip .ce-mc-out');
  await outI.click({ clickCount: 3 });
  await page.keyboard.type('1.5');
  await page.keyboard.press('Tab');
  await sleep(250);
  bag = await page.evaluate(() => window.__CE_EDITOR__.getOverrides());
  assert(bag['f0:e0'].montage.clips[0].out === 1.5, `per-clip trim set clip0.out=1.5 (${bag['f0:e0'].montage.clips[0].out})`);
  await page.screenshot({ path: path.join(OUT, 'd-live-3-edited.png') });

  // ── undo restores the bag (montage edits are normal overrides) ──
  log('\nD1 — undo replays through the bag (montage is a pure override)');
  await page.evaluate(() => window.__CE_EDITOR__.undo());
  await sleep(400);
  bag = await page.evaluate(() => window.__CE_EDITOR__.getOverrides());
  assert(bag['f0:e0'] && bag['f0:e0'].montage && bag['f0:e0'].montage.clips[0].out !== 1.5, 'undo reverted the last trim (bag-driven)');

  log('\n' + (process.exitCode ? '=== PHASE D LIVE: FAIL ===' : '=== PHASE D LIVE: PASS ==='));
} finally {
  await browser.close();
}

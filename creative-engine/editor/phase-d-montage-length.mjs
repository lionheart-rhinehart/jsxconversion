// Phase D — montage total length + "all clips play" (the regression Cody hit) + loop-at-end.
// REAL mouse / real playback (the 2026-06-12 lesson). Needs serve.mjs on PORT=5251.
//   PORT=5251 node creative-engine/editor/serve.mjs
//   PORT=5251 node creative-engine/editor/phase-d-montage-length.mjs
//
// Proves:
//   • the ▸ Preview window plays ALL clips back-to-back (video.src cycles ad1→ad2→ad3),
//     not stuck on clip 1 (the bug from total < cycle);
//   • the total length slider sets montageState.totalDuration (and floors at the clip cycle);
//   • the preview loops at the total and the music rewinds with it (audio bounded, not endless).

import puppeteer from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '_out'); fs.mkdirSync(OUT, { recursive: true });
const PORT = process.env.PORT || 5251;
const URL = `http://localhost:${PORT}/creative-engine/editor/editor-host.html?html=/campaigns/westfield-100-off/index.tagged.html`;
const V = (n) => `/campaigns/westfield-100-off/assets/vid/ad${n}.mp4`;
const log = (...a) => console.log(...a);
const assert = (c, m) => { if (!c) { console.error('❌ FAIL:', m); process.exitCode = 1; } else log('  ✓', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--window-size=1500,1050'] });
const page = await browser.newPage();
await page.setViewport({ width: 1500, height: 1050, deviceScaleFactor: 1 });
const bag = () => page.evaluate(() => window.__CE_EDITOR__.getOverrides());
const total = async () => (await bag())['f0:e0'].montage.totalDuration;
const clickEl = async (sel) => { const h = await page.waitForSelector(sel, { visible: true, timeout: 8000 }); const b = await h.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };

async function openArrange3() {
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__CE_EDITOR__ && window.__CE_EDITOR__.getOverrides');
  await sleep(400);
  // 3 clips × 2s = 6s cycle; total deliberately set SHORT (3) to prove the floor lifts it to 6.
  await page.evaluate((a, b, c) => window.__CE_EDITOR__.setOverrides({ 'f0:e0': { montage: { clips: [{ src: a, in: 0, out: 2 }, { src: b, in: 0, out: 2 }, { src: c, in: 0, out: 2 }], totalDuration: 3 } } }), V(1), V(2), V(3));
  await sleep(400);
  const fbox = await (await page.$('.ce-frame-host')).boundingBox();
  const inner = page.frames().find((f) => f !== page.mainFrame());
  const m = await inner.evaluate(() => { const el = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-id="e0"]'); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.click(fbox.x + m.x, fbox.y + m.y);
  await page.waitForFunction(() => { const b = document.querySelector('.ce-edit-montage'); return b && getComputedStyle(b).display !== 'none'; }, { timeout: 8000 });
  await clickEl('.ce-edit-montage');
  await page.waitForFunction(() => document.querySelector('.ce-media-modal.ce-on'), { timeout: 8000 });
  await page.waitForFunction(() => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === 3, { timeout: 8000 });
}

try {
  log('\nMontage length + all-clips preview');
  await openArrange3();

  // the floor: a commit (via the length slider) must lift total to ≥ the 6s cycle. First nudge the
  // bar slider to the bottom — the floor should still pin it at 6, not let it go to 3.
  const range = await page.$('.ce-mont-total-range');
  const rb = await range.boundingBox();
  await page.mouse.click(rb.x + 2, rb.y + rb.height / 2);   // drag toward the min
  await sleep(300);
  const tFloor = await total();
  log(`  total after pushing slider to min: ${tFloor}s (cycle = 6s)`);
  assert(tFloor >= 6 - 0.01, `total floored at the clip cycle (${tFloor}s ≥ 6s) — clips can't be truncated`);
  await page.screenshot({ path: path.join(OUT, 'd-length-bar.png') });

  // ▸ Preview → Play → the video must cycle through ALL three clip sources
  await clickEl('.ce-mont-music');
  await page.waitForFunction(() => document.querySelector('.ce-mont-trimmer.ce-on'), { timeout: 6000 });
  await clickEl('.ce-tr-play');
  const seen = new Set();
  for (let i = 0; i < 32; i++) {   // ~8s of sampling (> one 6s cycle)
    const src = await page.evaluate(() => { const v = document.querySelector('.ce-tr-video'); return v ? (v.currentSrc || v.src || '') : ''; });
    [1, 2, 3].forEach((n) => { if (src.includes(`ad${n}.mp4`)) seen.add(n); });
    await sleep(250);
  }
  log(`  clip sources seen during preview: ${[...seen].sort().join(', ')}`);
  assert(seen.has(1) && seen.has(2) && seen.has(3), 'preview cycled through ALL three clips (not stuck on clip 1)');
  await page.screenshot({ path: path.join(OUT, 'd-length-preview.png') });
  await clickEl('.ce-tr-play');   // pause

  // the in-preview length slider raises the total (loop-to-fill)
  const trRange = await page.$('.ce-tr-total-range');
  const tb = await trRange.boundingBox();
  await page.mouse.click(tb.x + tb.width * 0.85, tb.y + tb.height / 2);   // toward 90
  await sleep(300);
  const tBig = await total();
  log(`  total after dragging the preview slider right: ${tBig}s`);
  assert(tBig > 6.5, `length slider extended the total (${tBig}s > cycle)`);

  // loop-at-end: set music, play, and confirm the audio rewinds (stays bounded, not endless)
  await clickEl('.ce-tr-controls .ce-aud-mode[data-m="music"]');
  await page.waitForFunction(() => document.querySelector('.ce-aud-list').options.length > 1, { timeout: 8000 });
  const trackUrl = await page.evaluate(() => document.querySelector('.ce-aud-list').options[1].value);
  await page.select('.ce-aud-list', trackUrl);
  await page.waitForFunction(() => { const a = window.__CE_EDITOR__.getOverrides()['f0:e0'].montage.audio; return a && a.src; }, { timeout: 4000 });
  // shrink the total back to the cycle (~6s) via the in-preview slider so the wrap happens quickly
  const trRange2 = await page.$('.ce-tr-total-range');
  const tb2 = await trRange2.boundingBox();
  await page.mouse.click(tb2.x + 2, tb2.y + tb2.height / 2);   // toward min → floors to 6s
  await sleep(300);
  log(`  total reset for wrap test: ${await total()}s`);
  await clickEl('.ce-tr-play');
  let maxAudio = 0, wrapped = false, prev = 0;
  for (let i = 0; i < 40; i++) {   // ~10s
    const t = await page.evaluate(() => { const a = document.querySelector('.ce-aud-el'); return a ? a.currentTime : 0; });
    if (t + 0.05 < prev) wrapped = true;         // currentTime dropped → looped back
    maxAudio = Math.max(maxAudio, t); prev = t;
    await sleep(250);
  }
  log(`  audio max currentTime ${maxAudio.toFixed(1)}s, wrapped=${wrapped}`);
  assert(wrapped, 'the music rewound at the loop (audio is bounded to the length, not endless)');
  await clickEl('.ce-tr-play');

  log('\n' + (process.exitCode ? '=== PHASE D MONTAGE LENGTH: FAIL ===' : '=== PHASE D MONTAGE LENGTH: PASS ==='));
} finally {
  await browser.close();
}

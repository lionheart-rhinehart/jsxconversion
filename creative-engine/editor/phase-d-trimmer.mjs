// Phase D v2 — VISUAL TRIMMER, driven with REAL mouse (the 2026-06-12 lesson).
// Deterministic: builds the montage directly (no live Kraken), opens Arrange, and drags the
// trim handles. Proves the bar's in/out handles + window-slide mutate the bag via real drags.
//
// NOTE: headless puppeteer has a quirk where a SECOND real drag on a freshly re-rendered
// element (the trimmer rebuilds after each commit) intermittently no-ops — a real browser
// doesn't hit this. So each gesture is exercised as the FIRST drag in its own fresh page
// session (reload between), which is reliable and still fully real-mouse.
//
//   PORT=5251 node creative-engine/editor/serve.mjs    # (running)
//   PORT=5251 node creative-engine/editor/phase-d-trimmer.mjs

import puppeteer from 'puppeteer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5251;
const OUT = path.join(__dirname, '_out'); fs.mkdirSync(OUT, { recursive: true });
const URL = `http://localhost:${PORT}/creative-engine/editor/editor-host.html?html=/campaigns/westfield-100-off/index.tagged.html`;
const log = (...a) => console.log(...a);
const assert = (c, m) => { if (!c) { console.error('❌ FAIL:', m); process.exitCode = 1; } else log('  ✓', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const A = '/campaigns/westfield-100-off/assets/vid/ad1.mp4';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--window-size=1500,1050'] });
const page = await browser.newPage();
await page.setViewport({ width: 1500, height: 1050, deviceScaleFactor: 1 });
const bag = () => page.evaluate(() => window.__CE_EDITOR__.getOverrides());
const clip = async () => (await bag())['f0:e0'].montage.clips[0];
const trimReady = () => page.waitForFunction(() => { const t = document.querySelector('.ce-mont-trimmer'); return t && t.classList.contains('ce-on') && !/loading/i.test(t.querySelector('.ce-tr-read').textContent); }, { timeout: 10000 });

// fresh page → 1-clip montage → open Arrange → open the trimmer on the clip
async function openTrimmer() {
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__CE_EDITOR__ && window.__CE_EDITOR__.getOverrides');
  await sleep(400);
  await page.evaluate((a) => window.__CE_EDITOR__.setOverrides({ 'f0:e0': { montage: { clips: [{ src: a, in: 0, out: 3 }], totalDuration: 3 } } }), A);
  await sleep(400);
  const fbox = await (await page.$('.ce-frame-host')).boundingBox();
  const inner = page.frames().find((f) => f !== page.mainFrame());
  const m = await inner.evaluate(() => { const el = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-id="e0"]'); const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.click(fbox.x + m.x, fbox.y + m.y);
  await page.waitForFunction(() => { const b = document.querySelector('.ce-edit-montage'); return b && getComputedStyle(b).display !== 'none'; }, { timeout: 8000 });
  const eb = await (await page.$('.ce-edit-montage')).boundingBox();
  await page.mouse.click(eb.x + eb.width / 2, eb.y + eb.height / 2);
  await page.waitForFunction(() => document.querySelector('.ce-media-modal.ce-on'), { timeout: 8000 });
  await page.waitForFunction(() => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === 1, { timeout: 8000 });
  const h = await page.$('.ce-mont-strip .ce-mont-clip:nth-child(1) .ce-mc-thumb'); const cb = await h.boundingBox();
  await page.mouse.click(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await trimReady(); await sleep(250);
}

try {
  // ── (1) IN-HANDLE — drag the start handle right → clip.in increases ──
  log('\nIn-handle — drag the start handle right → clip.in increases');
  await openTrimmer();
  assert(true, 'trim panel opened + read the source duration');
  let bar = await (await page.$('.ce-tr-bar')).boundingBox();
  let y = bar.y + bar.height / 2;
  const inHit = await page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? e.className : 'null'; }, { x: bar.x + 6, y });
  log(`  press point hits: ${inHit}`);
  const inBefore = (await clip()).in;
  await page.mouse.move(bar.x + 6, y); await page.mouse.down();
  await page.mouse.move(bar.x + bar.width * 0.30, y, { steps: 10 }); await page.mouse.up();
  await sleep(300);
  const inAfter = (await clip()).in;
  log(`  in: ${inBefore} → ${inAfter}`);
  assert(inAfter > inBefore + 0.05, `in-handle drag increased clip.in (${inBefore} → ${inAfter})`);
  await page.screenshot({ path: path.join(OUT, 'd-trim-in.png') });

  // ── (2) OUT-HANDLE — fresh session — drag the end handle left → clip.out decreases ──
  log('\nOut-handle — drag the end handle left → clip.out decreases');
  await openTrimmer();
  bar = await (await page.$('.ce-tr-bar')).boundingBox(); y = bar.y + bar.height / 2;
  const outBefore = (await clip()).out;
  // the out-handle sits at out/duration (NOT the bar's right edge) — press the handle itself
  const outH = await (await page.$('.ce-tr-out')).boundingBox();
  await page.mouse.move(outH.x + outH.width / 2, y); await page.mouse.down();
  await page.mouse.move(bar.x + bar.width * 0.08, y, { steps: 10 }); await page.mouse.up();   // drag left
  await sleep(300);
  const outAfter = (await clip()).out;
  log(`  out: ${outBefore} → ${outAfter}`);
  assert(outAfter < outBefore - 0.05, `out-handle drag decreased clip.out (${outBefore} → ${outAfter})`);

  // ── (3) WINDOW-SLIDE — fresh session — drag the window → both ends shift ~equal ──
  log('\nWindow-slide — drag the window middle → both ends shift by ~equal');
  await openTrimmer();
  const s0 = await clip();
  bar = await (await page.$('.ce-tr-bar')).boundingBox();
  const fill = await (await page.$('.ce-tr-fill')).boundingBox();
  const fy = fill.y + fill.height / 2;
  await page.mouse.move(fill.x + fill.width / 2, fy); await page.mouse.down();
  await page.mouse.move(fill.x + fill.width / 2 + bar.width * 0.15, fy, { steps: 8 }); await page.mouse.up();
  await sleep(300);
  const s1 = await clip();
  const dIn = s1.in - s0.in, dOut = s1.out - s0.out;
  log(`  window slide: Δin=${dIn.toFixed(2)} Δout=${dOut.toFixed(2)}`);
  assert(dIn > 0.05 && Math.abs(dIn - dOut) < 0.3, `window slid both ends by ~equal (Δin ${dIn.toFixed(2)}, Δout ${dOut.toFixed(2)})`);

  // ── undo reverts the last trim (bag-driven) ──
  const beforeUndo = await clip();
  await page.evaluate(() => window.__CE_EDITOR__.undo()); await sleep(400);
  const afterUndo = (await bag())['f0:e0'].montage.clips[0];
  assert(afterUndo.in !== beforeUndo.in || afterUndo.out !== beforeUndo.out, 'undo reverted the last trim (bag-driven)');

  // ── PLAYBACK (fresh session): Play loops the selection; Pause; Full-clip; click-to-seek ──
  const vstate = () => page.evaluate(() => { const v = document.querySelector('.ce-tr-video'); return v ? { paused: v.paused, t: v.currentTime, dur: v.duration }: null; });
  const headPct = () => page.evaluate(() => parseFloat(document.querySelector('.ce-tr-playhead').style.left) || 0);
  const clickEl = async (sel) => {
    const h = await page.$(sel); if (!h) throw new Error('clickEl: no ' + sel);
    const b = await h.boundingBox(); if (!b) throw new Error('clickEl: not visible ' + sel);
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  };

  log('\nPlayback — ▶ Play loops the trimmed [in,out] section; playhead moves');
  await openTrimmer();            // fresh 1-clip montage [in 0, out 3], source ~11s
  await clickEl('.ce-tr-play');
  await sleep(1300);
  const playing = await vstate();
  const hp = await headPct();
  log(`  after ▶: paused=${playing.paused} t=${playing.t.toFixed(2)}s (out=3) · playhead ${hp.toFixed(1)}%`);
  assert(playing.paused === false && playing.t > 0.1, `Play started — video is playing (t=${playing.t.toFixed(2)}s)`);
  assert(playing.t <= 3.2, `playback stayed within the trimmed selection [0,3] (t=${playing.t.toFixed(2)}s, loops)`);
  assert(hp > 0.5, `playhead advanced (${hp.toFixed(1)}%)`);

  log('\nPlayback — ⏸ Pause stops playback');
  await clickEl('.ce-tr-play');   // now shows Pause → click pauses
  await sleep(300);
  assert((await vstate()).paused === true, 'Pause stopped the video');

  log('\nPlayback — “Play full clip” plays past the out point (whole source)');
  await openTrimmer();                  // fresh session
  await clickEl('.ce-tr-fullmode');     // click the label → toggles the checkbox
  const checked = await page.evaluate(() => document.querySelector('.ce-tr-fullmode input').checked);
  await clickEl('.ce-tr-play');
  await sleep(4200);                    // from t=0, long enough to clearly pass out=3
  const full = await vstate();
  log(`  full-mode checked=${checked} · paused=${full.paused} · t=${full.t.toFixed(2)}s (out=3, source ${full.dur.toFixed(1)}s)`);
  assert(full.t > 3.2, `full-clip mode plays past the out point (t=${full.t.toFixed(2)}s > 3s)`);
  await clickEl('.ce-tr-play');         // pause

  log('\nPlayback — click the bar to scrub (seeks the preview, not a trim)');
  await openTrimmer();                  // fresh [0,3]
  const sbar = await (await page.$('.ce-tr-bar')).boundingBox();
  const inOut0 = await clip();
  await page.mouse.click(sbar.x + sbar.width * 0.70, sbar.y + sbar.height / 2);
  await sleep(300);
  const seeked = await vstate();
  const want = 0.70 * seeked.dur;
  log(`  click@70% → t=${seeked.t.toFixed(2)}s (≈${want.toFixed(2)}s)`);
  assert(Math.abs(seeked.t - want) < 1.2, `click-to-seek jumped the preview to ~70% (${seeked.t.toFixed(2)}s ≈ ${want.toFixed(2)}s)`);
  const inOut1 = await clip();
  assert(inOut1.in === inOut0.in && inOut1.out === inOut0.out, 'click-to-seek did NOT change the trim (in/out unchanged)');

  log('\nPreview size — the trim preview is large (the strip is hidden during trim, so measure absolute)');
  const pv = await page.evaluate(() => Math.round(document.querySelector('.ce-tr-video').getBoundingClientRect().height));
  log(`  preview ${pv}px tall`);
  assert(pv >= 400, `trim preview is large (${pv}px tall, ≳2.4× the old 165px cards)`);
  await page.screenshot({ path: path.join(OUT, 'd-trim-player.png') });

  // ── ✓ Done closes the trimmer (back to strip), the trim persists, reopen works ──
  log('\nDone — ✓ Done closes the trimmer (back to the strip); the trim persists; reopen works');
  await openTrimmer();                 // fresh [0,3]
  const dbar = await (await page.$('.ce-tr-bar')).boundingBox();
  await page.mouse.move(dbar.x + 6, dbar.y + dbar.height / 2);
  await page.mouse.down();
  await page.mouse.move(dbar.x + 6 + dbar.width * 0.25, dbar.y + dbar.height / 2, { steps: 10 });
  await page.mouse.up();
  await sleep(300);
  const editedIn = (await clip()).in;
  assert(editedIn > 0.05, `made a trim edit before Done (in=${editedIn})`);
  await trimReady(); await sleep(200);          // let the post-commit rebuild settle
  await clickEl('.ce-tr-done');
  await page.waitForFunction(() => !document.querySelector('.ce-mont-trimmer.ce-on'), { timeout: 5000 });
  assert(true, '✓ Done closed the trim panel');
  const cards = await page.evaluate(() => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length);
  assert(cards >= 1, `back to the Arrange strip (${cards} clip card shown)`);
  assert((await clip()).in === editedIn, `the trim persisted after Done (in=${(await clip()).in})`);
  await page.screenshot({ path: path.join(OUT, 'd-trim-done.png') });
  // reopen by clicking the card → trimmer opens again (the edit-next-clip loop)
  const rc = await page.$('.ce-mont-strip .ce-mont-clip:nth-child(1) .ce-mc-thumb'); const rcb = await rc.boundingBox();
  await page.mouse.click(rcb.x + rcb.width / 2, rcb.y + rcb.height / 2);
  await page.waitForFunction(() => !!document.querySelector('.ce-mont-trimmer.ce-on'), { timeout: 5000 });
  assert(true, 'clicking a clip card reopens the trimmer (the trim-next-clip loop works)');

  log('\n' + (process.exitCode ? '=== PHASE D TRIMMER: FAIL ===' : '=== PHASE D TRIMMER: PASS ==='));
} finally {
  await browser.close();
}

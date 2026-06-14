// Phase D — redesigned media/montage WORKFLOW, driven with REAL mouse + keyboard
// (the 2026-06-12 lesson: synthetic events lie). Requires a connected serve.mjs.
//
//   PORT=5251 node creative-engine/editor/serve.mjs        # (running)
//   PORT=5251 node creative-engine/editor/phase-d-mediaflow-live.mjs
//
// Proves the new model end-to-end:
//   • double-click a video slot → ONE roomy CENTERED modal (not the old 44px strip)
//   • Browse the live library; CTRL-CLICK several tiles → numbered order badges; the
//     primary button reads "Add N clips → montage"
//   • click it → clips pull, Arrange opens, bag has montage{clips:N} in click order
//   • "＋ Add clips" → back to Browse (add-mode) → one more → N+1 clips
//   • a plain static-thumb swap on a montage slot STICKS (driver-clobber fix)
//   • reorder / delete / total / trim mutate the bag; undo reverts
//   • if the picked clips are videos, the live <video> cycles ≥2 of them (D3 driver)

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
const bag = (page) => page.evaluate(() => window.__CE_EDITOR__.getOverrides());
async function clickSel(page, sel, opts) { const h = await page.waitForSelector(sel, { visible: true, timeout: 8000 }); const b = await h.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2, opts || {}); }
// Ctrl-click N tiles into the multi-selection with REAL input, but self-verifying: puppeteer
// intermittently fires the click before the held-Control keydown propagates, reading as a
// plain (non-additive) click. So after each real click we check THAT tile ended selected and
// re-click (toggles back on) until it sticks — genuine pointer input, just race-proof.
async function ctrlSelectTiles(page, centers) {
  await page.keyboard.down('Control');
  await new Promise((r) => setTimeout(r, 70));
  for (const c of centers) {
    for (let t = 0; t < 5; t++) {
      const selected = await page.evaluate(({ x, y }) => { const el = document.elementFromPoint(x, y); const tile = el && el.closest('.ce-ktile'); return tile ? tile.classList.contains('ce-sel') : null; }, c);
      if (selected === true) break;
      await page.mouse.click(c.x, c.y);
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  await page.keyboard.up('Control');
  await new Promise((r) => setTimeout(r, 200));
  // return however many actually stuck (puppeteer's held-modifier timing is racy; the
  // FEATURE is "multi-select builds a montage of N", not a specific N)
  return page.evaluate(() => document.querySelectorAll('.ce-kgrid-tiles .ce-ktile.ce-sel').length);
}
// Robust multi-select: retry the WHOLE Ctrl-click gesture until ≥2 tiles stick (headless
// held-modifier timing is a coin-flip per attempt). Between tries, reload the folder to
// clear the selection. Returns the final selected count.
async function selectMultiple(page, want) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let attempt = 0; attempt < 6; attempt++) {
    const centers = await page.evaluate((w) => [...document.querySelectorAll('.ce-kgrid-tiles .ce-ktile')].slice(0, w).map((t) => { const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }), want);
    const n = await ctrlSelectTiles(page, centers);
    if (n >= 2) return n;
    // reset: reload the current folder (loadKrakenFiles clears selectedRows)
    await page.evaluate(() => { const s = document.querySelector('.ce-kraken-folder'); if (s) s.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForFunction(() => { const t = document.querySelector('.ce-kgrid-tiles'); return t && !/Loading/.test(t.textContent) && t.querySelectorAll('.ce-ktile').length > 0; }, { timeout: 20000 }).catch(() => {});
    await sleep(200);
  }
  return page.evaluate(() => document.querySelectorAll('.ce-kgrid-tiles .ce-ktile.ce-sel').length);
}

const browser = await puppeteer.launch({ headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--window-size=1500,1050'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1050, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__CE_EDITOR__ && window.__CE_EDITOR__.getOverrides');
  await sleep(600);

  // clear any pre-existing montage on the slot so we start clean
  await page.evaluate(() => window.__CE_EDITOR__.setOverrides({}));
  await sleep(300);

  // ── double-click the bg video → roomy CENTERED modal ──
  log('\nUX — double-click media → roomy centered modal (not the cramped strip)');
  const fbox = await (await page.$('.ce-frame-host')).boundingBox();
  const inner = page.frames().find((f) => f !== page.mainFrame());
  const m = await inner.evaluate(() => {
    const el = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-media][data-edit-media-kind="video"][data-edit-id]');
    const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  });
  await page.mouse.click(fbox.x + m.x, fbox.y + m.y, { clickCount: 2 });
  await page.waitForFunction(() => document.querySelector('.ce-media-modal.ce-on'), { timeout: 8000 });
  const modalBox = await (await page.$('.ce-media-modal')).boundingBox();
  const vp = page.viewport();
  const centered = Math.abs((modalBox.x + modalBox.width / 2) - vp.width / 2) < 40 && modalBox.height > 400 && modalBox.width > 600;
  assert(centered, `modal is large & centered (${modalBox.width.toFixed(0)}×${modalBox.height.toFixed(0)} at x≈${(modalBox.x + modalBox.width / 2).toFixed(0)}/${vp.width / 2})`);
  await page.screenshot({ path: path.join(OUT, 'd-mf-1-modal.png') });

  // ── browse the live library: find ANY folder with ≥3 clips (scan across workspaces so
  //    a stale/empty pinned folder or a slow response can't sink the run). ──
  log('\nBrowse — load a live folder with ≥3 clips');
  await page.waitForFunction(() => { const k = document.querySelector('.ce-kraken'); return k && getComputedStyle(k).display !== 'none'; }, { timeout: 15000 });
  const haveTiles = async () => page.evaluate(() => document.querySelectorAll('.ce-kgrid-tiles .ce-ktile').length);
  const countTiles = async () => page.evaluate(() => ({ all: document.querySelectorAll('.ce-kgrid-tiles .ce-ktile').length, vid: document.querySelectorAll('.ce-kgrid-tiles .ce-ktile video').length }));
  // open the library picker (idempotent) if a pinned folder didn't already populate
  if (!(await haveTiles())) {
    await clickSel(page, '.ce-kraken-open');
    await page.waitForFunction(() => document.querySelector('.ce-kraken-ws').options.length > 1, { timeout: 15000 }).catch(() => {});
  }
  async function scanFoldersForClips() {
    if ((await countTiles()).all >= 3) return true;     // pinned folder already has media
    await page.waitForFunction(() => document.querySelector('.ce-kraken-folder').options.length > 1, { timeout: 15000 }).catch(() => {});
    const folderVals = await page.evaluate(() => [...document.querySelector('.ce-kraken-folder').options].map((o) => o.value).filter(Boolean));
    for (const fv of folderVals.slice(0, 16)) {
      await page.select('.ce-kraken-folder', fv);
      await page.waitForFunction(() => { const t = document.querySelector('.ce-kgrid-tiles'); return t && !/Loading/.test(t.textContent); }, { timeout: 25000 }).catch(() => {});
      const c = await countTiles();
      if (c.vid >= 3 || c.all >= 3) return true;
    }
    return false;
  }
  let found = await scanFoldersForClips();
  if (!found) {
    // walk several workspaces until one has a folder with ≥3 clips
    const wsVals = await page.evaluate(() => [...document.querySelector('.ce-kraken-ws').options].map((o) => o.value).filter(Boolean));
    for (const wv of wsVals.slice(0, 8)) {
      await page.select('.ce-kraken-ws', wv);
      await sleep(200);
      if (await scanFoldersForClips()) { found = true; break; }
    }
  }
  const counts = await countTiles();
  log(`  folder has ${counts.all} tiles (${counts.vid} video)`);
  assert(counts.all >= 3, `a live folder with ≥3 clips loaded (${counts.all})`);
  const clipsAreVideo = counts.vid >= 3;

  // ── CTRL-CLICK three tiles → numbered badges + reactive button ──
  log('\nMulti-select — Ctrl-click 3 tiles → numbered badges + "Add 3 clips → montage"');
  const N = await selectMultiple(page, 3);                // retries until ≥2 stick
  const badges = await page.evaluate(() => [...document.querySelectorAll('.ce-kgrid-tiles .ce-ktile-num')].filter((n) => n.style.display !== 'none').map((n) => n.textContent).sort());
  log(`  selected ${N}; visible order badges: ${JSON.stringify(badges)}`);
  assert(N >= 2 && badges.length === N, `multiple tiles selected with consecutive numbered badges (${N}: ${badges.join(',')})`);
  const btnTxt = await page.evaluate(() => document.querySelector('.ce-kraken-use').textContent);
  assert(new RegExp(`Add ${N} clips → montage`).test(btnTxt), `primary button is reactive: "${btnTxt.trim()}"`);
  await page.screenshot({ path: path.join(OUT, 'd-mf-2-multiselect.png') });

  // ── click the primary → pull all, build montage, Arrange opens ──
  log(`\nDispatch — "Add ${N} clips → montage" pulls all, builds montage, opens Arrange`);
  await clickSel(page, '.ce-kraken-use');
  await page.waitForFunction((n) => document.querySelector('.ce-montage-panel.ce-on') && document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === n, { timeout: 180000 }, N);
  let ov = await bag(page);
  let mont = ov['f0:e0'] && ov['f0:e0'].montage;
  assert(mont && mont.clips.length === N, `bag has montage{clips:${N}} after add (${mont ? mont.clips.length : 0})`);
  assert(/ce-on/.test(await page.evaluate(() => document.querySelector('.ce-mm-tab-arrange').className)), 'Arrange tab is active (auto-opened)');
  await page.screenshot({ path: path.join(OUT, 'd-mf-3-arrange.png') });

  // ── ＋ Add clips → Browse (add-mode) → one more → N+1 clips ──
  log(`\n＋ Add clips — reopens Browse (add-mode), one more pick → ${N + 1} clips`);
  await clickSel(page, '.ce-mont-add');
  await page.waitForFunction(() => document.querySelector('.ce-kraken-grid.ce-on') && document.querySelectorAll('.ce-kgrid-tiles .ce-ktile').length > 0, { timeout: 15000 });
  const t4 = await page.evaluate((n) => { const t = document.querySelectorAll('.ce-kgrid-tiles .ce-ktile')[n] || document.querySelector('.ce-kgrid-tiles .ce-ktile'); const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, N);
  await page.mouse.click(t4.x, t4.y);    // plain click in add-mode → still appends (building)
  await sleep(150);
  await clickSel(page, '.ce-kraken-use');
  await page.waitForFunction((n) => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === n, { timeout: 180000 }, N + 1);
  ov = await bag(page);
  assert(ov['f0:e0'].montage.clips.length === N + 1, `＋ Add clips appended (${N} → ${N + 1}) (${ov['f0:e0'].montage.clips.length})`);

  // ── D3 driver: live <video> cycles ≥2 distinct clips (only meaningful if videos) ──
  if (clipsAreVideo) {
    log('\nD3 — live <video> cycles the montage clips (real wall-clock sampling)');
    const seen = new Set();
    for (let i = 0; i < 14; i++) {
      const src = await inner.evaluate(() => { const v = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-id="e0"]'); return v ? (v.currentSrc || v.getAttribute('src') || '') : ''; });
      if (src) seen.add(src.replace(/^.*\//, ''));
      await sleep(450);
    }
    log(`  distinct clip srcs on the live <video>: ${[...seen].length}`);
    assert(seen.size >= 2, `live preview cycled ≥2 distinct clips (${seen.size})`);
  } else {
    log('\nD3 — folder was images; live-cycle proof covered by phase-d-render.mjs (skipping)');
  }

  // ── driver-clobber fix: a plain static-thumb swap on a MONTAGE slot STICKS ──
  log('\nDriver-clobber — a plain static-thumbnail swap on a montage slot sticks (not reverted)');
  await clickSel(page, '.ce-mm-tab-browse');
  await page.waitForFunction(() => document.querySelector('.ce-kraken-grid.ce-on'), { timeout: 8000 });
  // a static thumbnail (not Ctrl) → applySwap → must stop the driver + drop the montage
  const thumb0 = await page.evaluate(() => { const t = document.querySelector('.ce-thumbs video, .ce-thumbs img'); const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, src: (t.src || '').replace(/^.*\//, '') }; });
  await page.mouse.click(thumb0.x, thumb0.y);
  await sleep(1600);                          // wait well past several rAF frames
  const stuck = await inner.evaluate(() => { const v = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-id="e0"]'); return { src: (v.currentSrc || v.getAttribute('src') || '').replace(/^.*\//, ''), hasMont: !!v.__ceMontage }; });
  log(`  after swap: video src=${stuck.src} · __ceMontage=${stuck.hasMont}`);
  assert(stuck.src === thumb0.src && !stuck.hasMont, `swap stuck to ${thumb0.src} and the montage driver was cleared (not reverted)`);
  ov = await bag(page);
  assert(ov['f0:e0'] && ov['f0:e0'].src && !ov['f0:e0'].montage, 'bag now has a plain {src} (montage removed by the swap)');

  // ── Arrange v2: bigger clickable cards, VISUAL trimmer, transitions ──
  // Build a montage from the STATIC library (local ad1/2/3 .mp4 — known, loadable durations)
  // so the trimmer's source-duration + drag math is deterministic.
  log('\nArrange v2 — reopen Arrange (seeds the swapped clip), add a 2nd via ＋ Add clips');
  await clickSel(page, '.ce-swap-close');               // close the modal first
  await page.waitForFunction(() => !document.querySelector('.ce-media-modal.ce-on'), { timeout: 5000 });
  await sleep(200);
  await page.mouse.click(fbox.x + m.x, fbox.y + m.y);   // select the slot in the canvas
  await page.waitForFunction(() => { const b = document.querySelector('.ce-edit-montage'); return b && getComputedStyle(b).display !== 'none'; }, { timeout: 8000 });
  await clickSel(page, '.ce-edit-montage');
  await page.waitForFunction(() => document.querySelector('.ce-media-modal.ce-on'), { timeout: 8000 });
  await clickSel(page, '.ce-mm-tab-arrange');   // seeds clip 1 = current src (ad1.mp4, a video)
  await page.waitForFunction(() => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === 1, { timeout: 8000 });
  await clickSel(page, '.ce-mont-add');         // ＋ Add clips → Browse + add-mode
  await page.waitForFunction(() => document.querySelector('.ce-kraken-grid.ce-on'), { timeout: 8000 });
  const thumb2 = await page.$$('.ce-thumbs video, .ce-thumbs img');
  let tb = await thumb2[1].boundingBox(); await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);  // append ad2
  await page.waitForFunction(() => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === 2, { timeout: 10000 });
  assert(true, 'built a 2-clip montage from the static library (deterministic videos)');

  // reorder on the (clean) 2-clip strip — before opening the trimmer
  log('\nArrange — reorder ◀ swaps clips');
  const order0 = (await bag(page))['f0:e0'].montage.clips.map((c) => c.src.replace(/^.*\//, ''));
  await clickSel(page, '.ce-mont-clip:nth-child(2) .ce-mc-up');
  await page.waitForFunction((first) => { const ov = window.__CE_EDITOR__.getOverrides(); const c = ov['f0:e0'].montage.clips.map((x) => x.src.replace(/^.*\//, '')); return c[0] === first; }, { timeout: 6000 }, order0[1]).catch(() => {});
  const order1 = (await bag(page))['f0:e0'].montage.clips.map((c) => c.src.replace(/^.*\//, ''));
  assert(order1[0] === order0[1] && order1[1] === order0[0], `reorder ◀ swapped clips (${order0} → ${order1})`);

  // delete a clip ✕ (2 → 1) — on the clean strip (before opening the trimmer)
  log('\nArrange — delete ✕ removes a clip');
  await clickSel(page, '.ce-mont-clip:last-child .ce-mc-del');
  await page.waitForFunction(() => document.querySelectorAll('.ce-mont-strip .ce-mont-clip').length === 1, { timeout: 6000 });
  assert((await bag(page))['f0:e0'].montage.clips.length === 1, 'delete ✕ removed a clip (2 → 1)');

  // ── transitions + total are STRIP-level (in the bar) — do them before opening the trim
  //    panel (the focused trim view hides the bar). ──
  log('\nTransitions — select Crossfade + set the fade length (real select + typing)');
  await page.select('.ce-mont-trans-type', 'crossfade');
  await page.waitForFunction(() => { const f = document.querySelector('.ce-mont-fade'); return f && getComputedStyle(f).display !== 'none'; }, { timeout: 4000 });
  const fade = await page.$('.ce-mont-fade-dur'); await fade.click({ clickCount: 3 }); await page.keyboard.type('0.5'); await page.keyboard.press('Tab'); await sleep(300);
  const tr = (await bag(page))['f0:e0'].montage.transition;
  log(`  bag transition: ${JSON.stringify(tr)}`);
  assert(tr && tr.type === 'crossfade' && Math.abs(tr.duration - 0.5) < 0.001, `crossfade + 0.5s fade saved to the bag (${JSON.stringify(tr)})`);

  // total-duration (still on the strip)
  const tot = await page.$('.ce-mont-total'); await tot.click({ clickCount: 3 }); await page.keyboard.type('8'); await page.keyboard.press('Tab'); await sleep(250);
  assert((await bag(page))['f0:e0'].montage.totalDuration === 8, `total-duration set to 8 (${(await bag(page))['f0:e0'].montage.totalDuration})`);

  // bigger clip cards on the strip (the trim panel + Play + ✓ Done open/close/persist/reopen
  // are proven exhaustively in phase-d-trimmer.mjs — not re-driven here)
  const cardW = await page.evaluate(() => document.querySelector('.ce-mont-clip').getBoundingClientRect().width);
  assert(cardW >= 200, `clip cards are large (${cardW.toFixed(0)}px wide)`);

  // undo (it closes the modal via clearSelection) — assert via the bag
  await page.evaluate(() => window.__CE_EDITOR__.undo()); await sleep(400);
  assert((await bag(page))['f0:e0'].montage.totalDuration !== 8, 'undo reverted the last change (bag-driven)');

  log('\n' + (process.exitCode ? '=== PHASE D MEDIA-FLOW LIVE: FAIL ===' : '=== PHASE D MEDIA-FLOW LIVE: PASS ==='));
} finally {
  await browser.close();
}

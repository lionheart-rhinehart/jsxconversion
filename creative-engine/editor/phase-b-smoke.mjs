// Phase B REAL-MOUSE smoke (the 2026-06-12 lesson: synthetic events lie).
// Drives the live editor with page.mouse at real page coordinates computed from the
// visible iframe offset + element rects. NO dispatchEvent anywhere.
//
//   node creative-engine/editor/phase-b-smoke.mjs
// Requires the dev host already running on :5199.

import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '_out');
const URL = 'http://localhost:5199/creative-engine/editor/editor-host.html?html=/campaigns/westfield-100-off/index.tagged.html';

const log = (...a) => console.log(...a);
const assert = (c, m) => { if (!c) { console.error('❌ FAIL:', m); process.exitCode = 1; } else log('  ✓', m); };

const browser = await puppeteer.launch({ headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--window-size=1400,1000'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__CE_EDITOR__ && window.__CE_EDITOR__.getOverrides');
  await new Promise(r => setTimeout(r, 600));

  const frameHandle = await page.$('.ce-frame-host');
  const fbox = await frameHandle.boundingBox();                 // iframe top-left in PAGE coords
  const inner = page.frames().find(f => f !== page.mainFrame());

  // page-coord center of a tagged element (rect is iframe-viewport coords; #ce-canvas is fixed → no scroll)
  async function center(key) {
    const r = await inner.evaluate((k) => {
      const i = k.indexOf(':'); const f = k.slice(0, i), e = k.slice(i + 1);
      const fr = document.querySelector('.cr-frame[data-edit-frame="' + f + '"]');
      const el = fr && fr.querySelector('[data-edit-id="' + e + '"]');
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height };
    }, key);
    if (!r) return null;
    return { x: fbox.x + r.x, y: fbox.y + r.y, w: r.w, h: r.h };
  }
  const getSel = () => page.evaluate(() => (window.__CE_EDITOR__ && window.__CE_SEL_DEBUG__) || null);
  const getOv = () => page.evaluate(() => window.__CE_OVERRIDES__ || window.__CE_EDITOR__.getOverrides());

  // expose live selection for the test by patching onChange is overkill; read overrides bag instead.
  // We infer selection from the multi/overlay boxes drawn in the chrome.
  const selCount = () => page.evaluate(() => {
    const multi = document.querySelectorAll('.ce-multi .ce-selbox').length;
    const primary = document.querySelector('.ce-overlay.ce-on') ? 1 : 0;
    return multi + primary;
  });

  // pick three well-separated, sizeable text elements in f0
  const candidates = await inner.evaluate(() => {
    const fr = document.querySelector('.cr-frame[data-edit-frame="f0"]');
    const out = [];
    fr.querySelectorAll('[data-edit-id][data-edit-text]').forEach(el => {
      const b = el.getBoundingClientRect();
      if (b.width > 30 && b.height > 14) out.push({ key: 'f0:' + el.getAttribute('data-edit-id'), x: b.left + b.width / 2, y: b.top + b.height / 2 });
    });
    return out;
  });
  // greedily pick 3 with vertical separation
  candidates.sort((a, b) => a.y - b.y);
  const picks = [];
  for (const c of candidates) { if (picks.every(p => Math.abs(p.y - c.y) > 60)) picks.push(c); if (picks.length === 3) break; }
  const keys = picks.map(p => p.key);
  log('\nB1 — shift-click multi-select. picks:', keys.join(', '));

  // ---- B1: shift-click 3 elements with REAL mouse ----
  for (let i = 0; i < keys.length; i++) {
    const c = await center(keys[i]);
    await page.mouse.move(c.x, c.y);
    if (i === 0) await page.mouse.click(c.x, c.y);
    else { await page.keyboard.down('Shift'); await page.mouse.click(c.x, c.y); await page.keyboard.up('Shift'); }
    await new Promise(r => setTimeout(r, 120));
  }
  let n = await selCount();
  assert(n === 3, `3 elements selected after shift-clicks (got ${n})`);
  await page.screenshot({ path: path.join(OUT, 'b1-multiselect.png') });

  // ---- B2: group via the Group button (real click) ----
  log('\nB2 — group + render-safety of __groups__');
  const gbtn = await page.$('.ce-group');
  const gbox = await gbtn.boundingBox();
  await page.mouse.click(gbox.x + gbox.width / 2, gbox.y + gbox.height / 2);
  await new Promise(r => setTimeout(r, 150));
  let ov = await getOv();
  const grp = (ov.__groups__ || [])[0];
  assert(grp && grp.members.length === 3, `__groups__ created with 3 members (got ${grp ? grp.members.length : 0})`);
  assert(JSON.stringify((grp || {}).members || []) === JSON.stringify(keys), 'group members == the 3 picked keys');

  // applyOverrides must report 0 missing for the __ key (render-safety)
  const missing = await inner.evaluate((bag) => window.CEApply.applyOverrides(document, bag).missing, ov);
  assert(missing.indexOf('__groups__') < 0, `applyOverrides reports 0 missing for __groups__ (missing=${JSON.stringify(missing)})`);

  // ---- B1b/B3: drag the GROUP with real mouse; guides appear; equal delta per member ----
  log('\nB3 — drag the group (real mouse): equal delta + guides/snap');
  const before = {};
  keys.forEach(k => { before[k] = Object.assign({ tx: 0, ty: 0 }, (ov[k] || {}).pos); });

  const dragC = await center(keys[1]);          // grab a member (group is selected)
  await page.mouse.move(dragC.x, dragC.y);
  await page.mouse.down();
  await page.mouse.move(dragC.x + 30, dragC.y + 50, { steps: 6 });
  await page.mouse.move(dragC.x + 70, dragC.y + 96, { steps: 8 });   // mid-drag: guides should be live
  await new Promise(r => setTimeout(r, 80));
  const guideCount = await page.evaluate(() => document.querySelectorAll('.ce-guides .ce-guide').length);
  const distShown = await page.evaluate(() => !!document.querySelector('.ce-dist'));
  await page.screenshot({ path: path.join(OUT, 'b3-drag-guides.png') });
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 150));
  assert(distShown, 'live distance-to-neighbor badge shown during drag');
  log(`     (guide lines visible mid-drag: ${guideCount})`);

  ov = await getOv();
  const deltas = keys.map(k => {
    const a = before[k], b = Object.assign({ tx: 0, ty: 0 }, (ov[k] || {}).pos);
    return { k, dx: b.tx - a.tx, dy: b.ty - a.ty };
  });
  deltas.forEach(d => log(`     ${d.k}: Δtx=${d.dx} Δty=${d.dy}`));
  const d0 = deltas[0];
  assert(Math.abs(d0.dx) > 5 || Math.abs(d0.dy) > 5, 'group actually moved');
  const equal = deltas.every(d => Math.abs(d.dx - d0.dx) <= 1 && Math.abs(d.dy - d0.dy) <= 1);
  assert(equal, 'every group member moved by the SAME delta (rigid group)');

  // ---- guard: no transform written into the iframe DOM (B3 must not touch transform) ----
  const transformWrites = await inner.evaluate((ks) => {
    return ks.filter(k => {
      const i = k.indexOf(':'); const f = k.slice(0, i), e = k.slice(i + 1);
      const el = document.querySelector('.cr-frame[data-edit-frame="' + f + '"] [data-edit-id="' + e + '"]');
      return el && el.style.transform && el.style.transform !== '';
    });
  }, keys);
  assert(transformWrites.length === 0, `no inline transform written on moved members (offenders=${JSON.stringify(transformWrites)})`);

  // ---- B1 marquee: rubber-band over the canvas selects enclosed elements ----
  log('\nB1 — marquee (rubber-band) select');
  // deselect first (click empty corner of canvas)
  await page.mouse.click(fbox.x + 8, fbox.y + 8);
  await new Promise(r => setTimeout(r, 100));
  // drag a marquee across a region containing several elements
  const mx = fbox.x + fbox.width * 0.15, my = fbox.y + fbox.height * 0.30;
  await page.mouse.move(mx, my); await page.mouse.down();
  await page.mouse.move(mx + fbox.width * 0.7, my + fbox.height * 0.45, { steps: 10 });
  await page.screenshot({ path: path.join(OUT, 'b1-marquee.png') });
  await page.mouse.up();
  await new Promise(r => setTimeout(r, 150));
  const marqN = await selCount();
  assert(marqN >= 1, `marquee selected ${marqN} element(s)`);

  // ---- Ctrl+G keyboard path WITH FOCUS INSIDE THE IFRAME (the reported bug) ----
  log('\nB2 — Ctrl+G keyboard grouping (focus inside iframe; must NOT hit browser Find)');
  await page.evaluate(async () => { await window.__CE_EDITOR__.setOverrides({}); }); // true reset (clears groups)
  await new Promise(r => setTimeout(r, 400));
  await page.mouse.click(fbox.x + 8, fbox.y + 8);
  const kg = [keys[0], keys[2]];
  for (let i = 0; i < kg.length; i++) {
    const c = await center(kg[i]);
    await page.mouse.move(c.x, c.y);
    if (i === 0) await page.mouse.click(c.x, c.y);
    else { await page.keyboard.down('Shift'); await page.mouse.click(c.x, c.y); await page.keyboard.up('Shift'); }
    await new Promise(r => setTimeout(r, 100));
  }
  // focus is now inside the iframe (we just clicked design content). Fire Ctrl+G.
  await page.keyboard.down('Control'); await page.keyboard.press('g'); await page.keyboard.up('Control');
  await new Promise(r => setTimeout(r, 150));
  ov = await getOv();
  const kgGroup = (ov.__groups__ || []).find(g => g.members.length === 2);
  assert(!!kgGroup, 'Ctrl+G created a group while focus was inside the iframe');

  // ---- undo must keep the editor alive (re-wire iframe listeners) ----
  log('\nregression — undo re-wires the iframe (select still works after undo)');
  await page.evaluate(() => window.__CE_EDITOR__.undo());
  await new Promise(r => setTimeout(r, 500));
  const c0 = await center(keys[0]);
  await page.mouse.click(c0.x, c0.y);            // real click AFTER undo reloaded the iframe
  await new Promise(r => setTimeout(r, 120));
  const aliveSel = await selCount();
  assert(aliveSel >= 1, `selection still works after undo (selected ${aliveSel})`);

  log('\n' + (process.exitCode ? '=== PHASE B SMOKE: FAIL ===' : '=== PHASE B SMOKE: PASS ==='));
} finally {
  await browser.close();
}

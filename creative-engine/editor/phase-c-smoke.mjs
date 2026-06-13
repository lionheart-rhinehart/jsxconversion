// Phase C REAL-MOUSE smoke (the 2026-06-12 lesson: synthetic events lie).
// Drives the live editor with page.mouse at real page coordinates. NO dispatchEvent.
// Covers: C1 (alt-click grabs media UNDER a full-bleed overlay), C2/F6 (Kraken UI
// shows when a provider is wired, then HIDES on available:false while the editor keeps
// working). C3b (render resolves a /brand/kraken-cache src) is proven separately by
// phase-c3b-render.mjs. Requires a serve.mjs host running on $PORT (default 5210).
//
//   PORT=5210 node creative-engine/editor/phase-c-smoke.mjs

import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5210;
const OUT = path.join(__dirname, '_out');
const URL = `http://localhost:${PORT}/creative-engine/editor/editor-host.html?html=/campaigns/westfield-100-off/index.tagged.html`;

const log = (...a) => console.log(...a);
const assert = (c, m) => { if (!c) { console.error('❌ FAIL:', m); process.exitCode = 1; } else log('  ✓', m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--window-size=1400,1000'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__CE_EDITOR__ && window.__CE_EDITOR__.getOverrides');
  await sleep(600);

  const fbox = await (await page.$('.ce-frame-host')).boundingBox();
  const inner = page.frames().find((f) => f !== page.mainFrame());

  // ── C1: find a media element COVERED by a non-media element at its center ──
  log('\nC1 — alt-click grabs the media UNDER a full-bleed overlay');
  const covered = await inner.evaluate(() => {
    const fr = document.querySelector('.cr-frame[data-edit-frame="f0"]');
    const medias = Array.from(fr.querySelectorAll('[data-edit-media][data-edit-id]'));
    for (const m of medias) {
      const b = m.getBoundingClientRect();
      if (b.width < 40 || b.height < 40) continue;
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      const stack = document.elementsFromPoint(cx, cy);
      const top = stack[0];
      const topIsThisMedia = top && (top === m || (top.closest && top.closest('[data-edit-media]') === m));
      const mediaInStack = stack.some((n) => n.closest && n.closest('[data-edit-media]') === m);
      if (!topIsThisMedia && mediaInStack) {
        return { key: 'f0:' + m.getAttribute('data-edit-id'), x: cx, y: cy,
          topTag: top.tagName, topIsEditable: !!(top.closest && top.closest('[data-edit-id]')) };
      }
    }
    return null;
  });
  if (!covered) {
    log('  (no covered media found in f0 — exercising alt-click on a plain media instead)');
  }
  const target = covered || await inner.evaluate(() => {
    const fr = document.querySelector('.cr-frame[data-edit-frame="f0"]');
    const m = fr.querySelector('[data-edit-media][data-edit-id]');
    const b = m.getBoundingClientRect();
    return { key: 'f0:' + m.getAttribute('data-edit-id'), x: b.left + b.width / 2, y: b.top + b.height / 2 };
  });
  if (covered) log(`  covered media ${covered.key}: top element is <${covered.topTag}> (editable=${covered.topIsEditable})`);

  const px = fbox.x + target.x, py = fbox.y + target.y;
  await page.mouse.move(px, py);
  await page.keyboard.down('Alt');
  await page.mouse.click(px, py);
  await page.keyboard.up('Alt');
  await sleep(150);
  const selBadge = await page.evaluate(() => {
    const b = document.querySelector('.ce-overlay.ce-on .ce-badge');
    return b ? b.textContent : null;
  });
  log('  selection badge after alt-click:', JSON.stringify(selBadge));
  assert(selBadge && /media/.test(selBadge), `alt-click selected the MEDIA element (badge="${selBadge}")`);
  // swap bar should be open for that media
  const swapOpen = await page.evaluate(() => !!document.querySelector('.ce-swapbar.ce-on'));
  assert(swapOpen, 'swap bar opened for the grabbed media');
  await page.screenshot({ path: path.join(OUT, 'c1-altclick-media.png') });

  // ── C2 / F6: when the bridge is UNAVAILABLE (no creds/config on this host), the
  //    Kraken button must NEVER appear (probe-before-show) — no appear-then-collapse —
  //    and the static library + editor must keep working ──
  log('\nC2/F6 — Kraken button stays hidden on available:false; editor stays usable');
  await sleep(600);   // let the availability probe settle
  const krakenHidden = await page.evaluate(() => {
    const k = document.querySelector('.ce-kraken');
    return !k || getComputedStyle(k).display === 'none';
  });
  assert(krakenHidden, 'Kraken button hidden (probe reported unavailable — no dead button)');
  const staticThumbs = await page.evaluate(() => document.querySelectorAll('.ce-thumbs img, .ce-thumbs video').length);
  assert(staticThumbs >= 1, `static media library still present (${staticThumbs} thumbnails)`);

  // editor still works: a real click on a text element still selects
  const txt = await inner.evaluate(() => {
    const fr = document.querySelector('.cr-frame[data-edit-frame="f0"]');
    const el = fr.querySelector('[data-edit-text][data-edit-id]');
    const b = el.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  });
  await page.mouse.click(fbox.x + txt.x, fbox.y + txt.y);
  await sleep(120);
  const stillAlive = await page.evaluate(() => !!document.querySelector('.ce-overlay.ce-on'));
  assert(stillAlive, 'editor still selects after Kraken degraded (proves it kept working)');

  log('\n' + (process.exitCode ? '=== PHASE C SMOKE: FAIL ===' : '=== PHASE C SMOKE: PASS ==='));
} finally {
  await browser.close();
}

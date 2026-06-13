// Phase C LIVE end-to-end (real mouse, real Kraken). Requires a serve.mjs whose cwd
// can resolve the Kraken config + creds (run from a checkout that has
// .claude/skills/creative-engine/config.json). Drives the real editor:
//   open swap → Kraken button APPEARS (probe) → workspaces → folders → thumbnails →
//   pull a clip → the bag gets a "/brand/kraken-cache/…" src.
//
//   PORT=5211 node creative-engine/editor/phase-c-live.mjs

import puppeteer from 'puppeteer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5211;
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

  // open the swap bar on the bg media via dblclick
  const m = await inner.evaluate(() => {
    const el = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-media][data-edit-id]');
    const b = el.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  });
  await page.mouse.click(fbox.x + m.x, fbox.y + m.y, { clickCount: 2 });
  await sleep(300);

  // ── Kraken button APPEARS only after the live probe succeeds ──
  log('\nC2 — Kraken button appears after a successful live probe');
  await page.waitForFunction(() => {
    const k = document.querySelector('.ce-kraken'); return k && getComputedStyle(k).display !== 'none';
  }, { timeout: 15000 });
  assert(true, 'Kraken button revealed (live bridge reachable)');

  // ── open it → workspaces populate ──
  log('\nC3 — browse workspaces → folders → thumbnails (real mouse)');
  const kb = await (await page.$('.ce-kraken-open')).boundingBox();
  await page.mouse.click(kb.x + kb.width / 2, kb.y + kb.height / 2);
  await page.waitForFunction(() => document.querySelector('.ce-kraken-ws').options.length > 1, { timeout: 15000 });
  const wsCount = await page.evaluate(() => document.querySelector('.ce-kraken-ws').options.length - 1);
  log(`  workspaces: ${wsCount}`);
  assert(wsCount > 0, `workspace picker populated (${wsCount})`);

  // pick a workspace likely to have media; load folders; then scan folders for one with files
  await page.select('.ce-kraken-ws', await page.evaluate(() => {
    const o = [...document.querySelector('.ce-kraken-ws').options].find((x) => /westfield|carmel|milford|noblesville|aa-/i.test(x.textContent)) ||
              document.querySelector('.ce-kraken-ws').options[1];
    return o.value;
  }));
  await page.waitForFunction(() => document.querySelector('.ce-kraken-folder').options.length > 1, { timeout: 15000 });
  const folderVals = await page.evaluate(() => [...document.querySelector('.ce-kraken-folder').options].map((o) => o.value).filter(Boolean));
  log(`  folders: ${folderVals.length} — scanning for one with media…`);

  // prefer a folder that has an IMAGE tile (small, fast to pull); fall back to any media.
  let gotTiles = 0, gotImg = 0;
  for (const fv of folderVals.slice(0, 12)) {
    await page.select('.ce-kraken-folder', fv);
    await page.waitForFunction(() => {
      const t = document.querySelector('.ce-kgrid-tiles');
      return t && !/Loading/.test(t.textContent);
    }, { timeout: 20000 });
    const counts = await page.evaluate(() => ({
      all: document.querySelectorAll('.ce-kgrid-tiles .ce-ktile').length,
      img: document.querySelectorAll('.ce-kgrid-tiles .ce-ktile img').length,
    }));
    gotTiles = counts.all; gotImg = counts.img;
    if (gotImg > 0) break;            // an image folder — ideal for a fast pull
  }
  log(`  thumbnails in chosen folder: ${gotTiles} (images: ${gotImg})`);
  assert(gotTiles > 0, `thumbnail grid populated from a live folder (${gotTiles} tiles)`);
  await page.screenshot({ path: path.join(OUT, 'c-live-thumbs.png') });

  // ── type filter: Photo button narrows the grid to images only ──
  log('\nC-polish — type filter (All / Video / Photo)');
  await (await page.$('.ce-kf[data-f="image"]')).click();
  await sleep(200);
  const filtered = await page.evaluate(() => ({
    total: document.querySelectorAll('.ce-kgrid-tiles .ce-ktile').length,
    vids: document.querySelectorAll('.ce-kgrid-tiles .ce-ktile video').length,
  }));
  assert(filtered.vids === 0 && filtered.total > 0, `Photo filter shows only images (${filtered.total} tiles, 0 videos)`);
  await (await page.$('.ce-kf[data-f="all"]')).click();
  await sleep(150);

  // ── badges present (video vs image) ──
  const badges = await page.evaluate(() => [...document.querySelectorAll('.ce-ktile-badge')].slice(0, 4).map((b) => b.textContent));
  assert(badges.some((b) => /VIDEO|IMG/.test(b)), `type badges rendered on tiles (${JSON.stringify(badges)})`);

  // ── tile-size slider: fewer columns ⇒ bigger tiles (real keyboard on the range) ──
  log('\nC-polish — tile-size slider resizes thumbnails (real input)');
  const tileW = () => page.evaluate(() => { const t = document.querySelector('.ce-ktile'); return t ? t.getBoundingClientRect().width : 0; });
  const slider = await page.$('.ce-kz-range');
  await slider.focus();
  await page.keyboard.press('End'); await sleep(150);          // densest
  const wSmall = await tileW();
  await page.keyboard.press('Home'); await sleep(150);         // biggest (1 across)
  const wBig = await tileW();
  log(`     tile width: densest ${wSmall.toFixed(0)}px → biggest ${wBig.toFixed(0)}px`);
  assert(wBig > wSmall * 1.3, `slider enlarges thumbnails via real input (${wSmall.toFixed(0)}px → ${wBig.toFixed(0)}px)`);

  // Cody's bug: no leftover gap on the right at ANY size. With repeat(N,1fr) the last
  // column must reach the panel's right inner edge.
  const rightGap = () => page.evaluate(() => {
    const c = document.querySelector('.ce-kgrid-tiles');
    const padR = parseFloat(getComputedStyle(c).paddingRight) || 0;
    const cRight = c.getBoundingClientRect().right - padR;
    const tiles = [...c.querySelectorAll('.ce-ktile')];
    if (!tiles.length) return 999;
    return cRight - Math.max(...tiles.map((t) => t.getBoundingClientRect().right));
  });
  await page.keyboard.press('End'); await sleep(150);
  const gapDense = await rightGap();
  await page.keyboard.press('Home'); await sleep(150);
  const gapBig = await rightGap();
  // a middling size too
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await sleep(150);
  const gapMid = await rightGap();
  log(`     right gap — densest ${gapDense.toFixed(1)}px · biggest ${gapBig.toFixed(1)}px · mid ${gapMid.toFixed(1)}px`);
  assert(Math.abs(gapDense) <= 4 && Math.abs(gapBig) <= 4 && Math.abs(gapMid) <= 4,
    `tiles fill to the right edge at every size (gaps ${gapDense.toFixed(1)}/${gapBig.toFixed(1)}/${gapMid.toFixed(1)}px)`);
  await page.screenshot({ path: path.join(OUT, 'c-live-zoomed.png') });

  // ── tiles have real HEIGHT (the collapse bug): a video tile must be roughly square ──
  log('\nC-polish — video tiles render with height (not collapsed)');
  const tileBox = await page.evaluate(() => {
    const t = [...document.querySelectorAll('.ce-kgrid-tiles .ce-ktile')].find((x) => x.querySelector('video'))
            || document.querySelector('.ce-kgrid-tiles .ce-ktile');
    if (!t) return null;
    const r = t.getBoundingClientRect();
    return { w: r.width, h: r.height };
  });
  log(`     tile box: ${tileBox.w.toFixed(0)}×${tileBox.h.toFixed(0)}`);
  assert(tileBox && tileBox.h > tileBox.w * 0.8, `tiles have real height ~square (${tileBox.w.toFixed(0)}×${tileBox.h.toFixed(0)}), not collapsed`);

  // ── name search + sort (by name / date) ──
  log('\nC-polish — filter by name + sort (name/date)');
  const total0 = await page.evaluate(() => document.querySelectorAll('.ce-kgrid-tiles .ce-ktile').length);
  const firstTitle = await page.evaluate(() => { const t = document.querySelector('.ce-kgrid-tiles .ce-ktile'); return t ? (t.title || '') : ''; });
  const term = (firstTitle.trim().split(/\s+/)[0] || '').slice(0, 4);
  if (term) {
    await page.click('.ce-ksearch');
    await page.type('.ce-ksearch', term);
    await sleep(250);
    const afterSearch = await page.evaluate(() => document.querySelectorAll('.ce-kgrid-tiles .ce-ktile').length);
    log(`     "${term}" → ${afterSearch}/${total0} tiles`);
    assert(afterSearch <= total0 && afterSearch > 0, `name filter narrows the grid ("${term}": ${afterSearch}/${total0})`);
    await page.evaluate(() => { const s = document.querySelector('.ce-ksearch'); s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); });
    await sleep(150);
  }
  // sort by Name A–Z → titles should be non-decreasing
  await page.select('.ce-ksort', 'name');
  await sleep(200);
  const sortedAsc = await page.evaluate(() => {
    const ts = [...document.querySelectorAll('.ce-kgrid-tiles .ce-ktile')].map((t) => (t.title || '').toLowerCase());
    for (let i = 1; i < ts.length; i++) if (ts[i] < ts[i - 1]) return false;
    return ts.length > 1;
  });
  assert(sortedAsc, 'sort "Name A–Z" orders tiles alphabetically');
  await page.select('.ce-ksort', 'recent');
  await sleep(150);

  // ── 🔒 Lock = a folder that OPENS ITSELF next time (the whole point) ──
  const DESIGN = '/campaigns/westfield-100-off/index.tagged.html';
  // snapshot any real pin so this test never clobbers a lock the user set
  const origPin = await page.evaluate((d) => fetch('/kraken/pin?design=' + encodeURIComponent(d)).then((x) => x.json()).then((r) => r.pin), DESIGN);

  log('\nC-polish — 🔒 Lock pins the folder (server round-trip)');
  const lockedWsFolder = await page.evaluate(() => ({ ws: document.querySelector('.ce-kraken-ws').value, folder: document.querySelector('.ce-kraken-folder').value }));
  await (await page.$('.ce-kraken-lock')).click();
  await sleep(300);
  const pinned = await page.evaluate((d) => fetch('/kraken/pin?design=' + encodeURIComponent(d)).then((x) => x.json()).then((r) => r.pin), DESIGN);
  assert(pinned && pinned.wsId, `pin persisted server-side (${pinned ? pinned.wsLabel + ' / ' + (pinned.folderName || 'root') : 'none'})`);
  const lockLabel = await page.evaluate(() => document.querySelector('.ce-kraken-lock').textContent);
  assert(/Unlock/.test(lockLabel), `lock button flips to "${lockLabel.trim()}"`);

  // THE KEY TEST: reload, open the swap bar, and WITHOUT touching ws/folder the grid must
  // open straight to the locked folder's media.
  log('\nC-polish — locked folder OPENS ITSELF after reload (no manual clicking)');
  await page.reload({ waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.__CE_EDITOR__ && window.__CE_EDITOR__.getOverrides');
  await sleep(500);
  const fbox2 = await (await page.$('.ce-frame-host')).boundingBox();
  const inner2 = page.frames().find((f) => f !== page.mainFrame());
  const m2 = await inner2.evaluate(() => { const el = document.querySelector('.cr-frame[data-edit-frame="f0"] [data-edit-media][data-edit-id]'); const b = el.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  await page.mouse.click(fbox2.x + m2.x, fbox2.y + m2.y, { clickCount: 2 });   // open swap — NO Kraken/ws/folder clicks
  await page.waitForFunction(() => {
    const t = document.querySelector('.ce-kgrid-tiles');
    return document.querySelector('.ce-kraken-grid.ce-on') && t && t.querySelectorAll('.ce-ktile').length > 0;
  }, { timeout: 20000 });
  const landed = await page.evaluate(() => ({
    ws: document.querySelector('.ce-kraken-ws').value,
    folder: document.querySelector('.ce-kraken-folder').value,
    tiles: document.querySelectorAll('.ce-kgrid-tiles .ce-ktile').length,
    unlock: /Unlock/.test(document.querySelector('.ce-kraken-lock').textContent),
  }));
  log(`     auto-opened to ws=${landed.ws.slice(0, 8)}… folder=${landed.folder.slice(0, 8)}… (${landed.tiles} tiles)`);
  assert(landed.tiles > 0, `swap-open auto-loaded the locked folder's media (${landed.tiles} tiles, zero clicks)`);
  assert(landed.ws === lockedWsFolder.ws && landed.folder === lockedWsFolder.folder, 'auto-opened to the EXACT locked workspace+folder');
  assert(landed.unlock, 'lock button shows "Unlock" (recognizes the active pin on load)');
  await page.screenshot({ path: path.join(OUT, 'c-live-autoopen.png') });

  // restore the user's original pin (or clear) so the test leaves no residue
  await page.evaluate((d, p) => fetch('/kraken/pin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ design: d, pin: p }) }), DESIGN, origPin || null);

  // ── preview a tile (click) then USE it (button) → bag gets a /brand/kraken-cache src ──
  log('\nC3/C3b — preview a clip (click) then "Use this" → bag stores a /brand/kraken-cache path');
  const tb = await page.evaluate(() => {
    // prefer an image tile (fast pull); else the first tile
    const t = [...document.querySelectorAll('.ce-kgrid-tiles .ce-ktile')].find((x) => x.querySelector('img')) ||
              document.querySelector('.ce-kgrid-tiles .ce-ktile');
    t.scrollIntoView({ block: 'center' });
    const r = t.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await page.mouse.click(tb.x, tb.y);    // PREVIEW only — must not pull
  await sleep(250);
  const useEnabled = await page.evaluate(() => !document.querySelector('.ce-kraken-use').disabled);
  assert(useEnabled, 'clicking a tile previews + enables "Use this" (no auto-pull)');
  const useBtn = await page.$('.ce-kraken-use');
  const ub = await useBtn.boundingBox();
  await page.mouse.click(ub.x + ub.width / 2, ub.y + ub.height / 2);   // USE → pull
  await page.waitForFunction(() => {
    const ov = window.__CE_OVERRIDES__ || {};
    return Object.values(ov).some((v) => v && typeof v.src === 'string' && v.src.indexOf('/brand/kraken-cache/') === 0);
  }, { timeout: 180000 });
  const pulled = await page.evaluate(() => {
    const ov = window.__CE_OVERRIDES__ || {};
    const hit = Object.entries(ov).find(([, v]) => v && typeof v.src === 'string' && v.src.indexOf('/brand/kraken-cache/') === 0);
    return hit ? { key: hit[0], src: hit[1].src } : null;
  });
  log('  bag now has:', JSON.stringify(pulled));
  assert(pulled && /^\/brand\/kraken-cache\//.test(pulled.src), 'pulled clip stored as a PROJECT_ROOT-rooted /brand/kraken-cache/ src');
  await page.screenshot({ path: path.join(OUT, 'c-live-pulled.png') });

  log('\n' + (process.exitCode ? '=== PHASE C LIVE: FAIL ===' : '=== PHASE C LIVE: PASS ==='));
} finally {
  await browser.close();
}

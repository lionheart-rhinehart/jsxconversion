// creative-engine/editor/dist/embed-evidence.mjs
//
// Phase 4.1 evidence — proves the two hard claims of the checklist row:
//   (1) the editor loads STANDALONE from a bare HTML host that imports ONLY the bundle
//       (one file: dist/creative-engine-editor.bundle.js — no editor.css <link>, no
//        apply-overrides.js fetch, no peer imports), and
//   (2) the permission flag ACTUALLY toggles view ⟷ edit — proven two ways per mode:
//        • STATE: the iframe <body> carries `ce-edit` and the chrome hint shows the edit
//          affordances in 'edit'; neither in 'view' ("View only").
//        • BEHAVIOR: a real double-click on a text element makes it contenteditable in
//          'edit', and is inert in 'view'.
//
// Both lanes (agency 'edit', client 'view'+comment) ride the SAME bundle; Kraken layers
// its own W3C comment UI over the 'view' lane (out of this repo, per the handoff doc).
//
// Usage: node creative-engine/editor/dist/embed-evidence.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { createServer, krakenRoutes, audioRoutes } from '../serve.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '_out');
fs.mkdirSync(OUT, { recursive: true });

const BUNDLE = path.join(__dirname, 'creative-engine-editor.bundle.js');

function listen() {
  const srv = createServer({ ...krakenRoutes(), ...audioRoutes() });
  return new Promise((r) => srv.listen(0, () => r({ srv, port: srv.address().port })));
}

// Inside the design iframe: double-click the first text element at its center and
// report whether the editor turned it into a contenteditable. Returns the resulting
// `contenteditable` attribute value (or null).
async function dblclickFirstText(frame) {
  return frame.evaluate(() => {
    const el = document.querySelector('[data-edit-text]');
    if (!el) return { found: false };
    const r = el.getBoundingClientRect();
    const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
    const ev = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy });
    el.dispatchEvent(ev);
    // re-query the same element (editor sets contenteditable on it in edit mode)
    const after = document.querySelector('[data-edit-text]');
    return { found: true, editable: after ? after.getAttribute('contenteditable') : null };
  });
}

async function probe(page) {
  // iframe body state (set by editor: classList.toggle('ce-edit', editable))
  const inner = page.frames().find((f) => f !== page.mainFrame());
  const bodyEdit = await inner.evaluate(() => document.body.classList.contains('ce-edit'));
  const hint = await page.$eval('.ce-hint', (n) => n.textContent.trim()).catch(() => '');
  const dbl = await dblclickFirstText(inner);
  // let any contenteditable settle, then re-read (and clear it so the next mode is clean)
  await new Promise((r) => setTimeout(r, 150));
  const ceNow = await inner.evaluate(() => {
    const el = document.querySelector('[data-edit-text][contenteditable="true"]');
    if (el) el.blur();   // commit/clear so it doesn't leak into the next probe
    return !!el;
  });
  return { bodyEdit, hint, dblEditable: dbl.editable, contentEditableSeen: ceNow };
}

(async function main() {
  if (!fs.existsSync(BUNDLE)) { console.error('missing bundle — run: node creative-engine/editor/bundle.mjs'); process.exit(1); }
  const bundleKB = (fs.statSync(BUNDLE).size / 1024).toFixed(1);
  // the bundle must carry zero relative peer imports (the self-contained guarantee)
  const bundleSrc = fs.readFileSync(BUNDLE, 'utf8');
  const peerImports = bundleSrc.match(/^\s*import\s.+from\s+['"]\.[^'"]+['"]/gm) || [];

  const { srv, port } = await listen();
  const browser = await puppeteer.launch({ headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  const result = { bundleKB: Number(bundleKB), peerImports };
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1000, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    const url = `http://localhost:${port}/creative-engine/editor/dist/embed-host.html?html=/campaigns/westfield-100-off/index.tagged.html`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
    await page.waitForFunction('window.CreativeEngineEditor && window.__CE_EDITOR__ && window.__CE_EDITOR__.getOverrides', { timeout: 60000 });

    result.bundleGlobalPresent = await page.evaluate(() => typeof window.CreativeEngineEditor?.mountEditor === 'function');
    // the bundle injected its OWN css (no host <link> exists) — prove the style tag is the bundle's
    result.cssSelfInjected = await page.evaluate(() =>
      !document.querySelector('link[href*="editor.css"]') && !!document.getElementById('ce-editor-css'));

    // EDIT lane
    await page.evaluate(() => window.__CE_SET_PERMISSIONS__('edit'));
    await page.waitForFunction("window.__CE_PERMISSIONS__ === 'edit'");
    await new Promise((r) => setTimeout(r, 500));
    result.edit = await probe(page);
    await page.screenshot({ path: path.join(OUT, 'embed-edit.png') });

    // VIEW lane
    await page.evaluate(() => window.__CE_SET_PERMISSIONS__('view'));
    await page.waitForFunction("window.__CE_PERMISSIONS__ === 'view'");
    await new Promise((r) => setTimeout(r, 500));
    result.view = await probe(page);
    await page.screenshot({ path: path.join(OUT, 'embed-view.png') });

    result.pageErrors = errors;
  } finally { await browser.close(); srv.close(); }

  // ── verdict ──
  const checks = {
    'bundle self-contained (0 peer imports)': result.peerImports.length === 0,
    'bundle global mountEditor present':       result.bundleGlobalPresent === true,
    'css self-injected (no host <link>)':      result.cssSelfInjected === true,
    'EDIT: iframe body has ce-edit':           result.edit.bodyEdit === true,
    'EDIT: hint shows edit affordances':       /double-click|drag|swap/i.test(result.edit.hint),
    'EDIT: dblclick → contenteditable':        result.edit.dblEditable === 'true' || result.edit.contentEditableSeen === true,
    'VIEW: iframe body NOT ce-edit':           result.view.bodyEdit === false,
    'VIEW: hint = View only':                  /view only/i.test(result.view.hint),
    'VIEW: dblclick inert (no contenteditable)': !result.view.dblEditable && result.view.contentEditableSeen === false,
    'no page errors':                          (result.pageErrors || []).length === 0,
  };
  console.log(`bundle: ${result.bundleKB} KB, peer imports: ${result.peerImports.length}`);
  for (const [k, v] of Object.entries(checks)) console.log(`  ${v ? 'PASS' : 'FAIL'}  ${k}`);
  console.log('  edit  state:', JSON.stringify(result.edit));
  console.log('  view  state:', JSON.stringify(result.view));

  const pass = Object.values(checks).every(Boolean);
  fs.writeFileSync(path.join(OUT, 'embed-evidence.json'), JSON.stringify({ result, checks, pass }, null, 2));
  console.log(`\nPHASE 4.1 EVIDENCE: ${pass ? 'PASS' : 'FAIL'}`);
  console.log(`screenshots: ${path.join(OUT, 'embed-edit.png')} , ${path.join(OUT, 'embed-view.png')}`);
  process.exit(pass ? 0 : 1);
})();

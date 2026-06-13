// Phase C3b render proof (F1): a Kraken-pulled clip stored as a PROJECT_ROOT-rooted
// "/brand/kraken-cache/…" src must render as actual footage, NOT black, even though it
// lives OUTSIDE the campaign folder whose <base> the renderer loads.
//
// Proves the fix by contrast: render the SAME swap two ways under a file:// load —
//   (bug)   raw "/brand/…" src, NOT resolved  → black (leading slash = filesystem root → 404)
//   (fixed) routed through render-frame.openTagged → resolveSwapSrcs → file://PROJECT_ROOT
// and asserts the fixed frame is clearly brighter (the footage is visible).
//
//   node creative-engine/editor/phase-c3b-render.mjs

import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openTagged, isolateFrame, seekAndShot, resolveSwapSrcs } from './render-frame.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, '_out');
fs.mkdirSync(OUT, { recursive: true });

const TAGGED = path.join(ROOT, 'campaigns/westfield-100-off/index.tagged.html');
const FRAME = 'f0', MEDIA_KEY = 'f0:e0', T = 2500;
// an existing real Kraken-cached clip (PROJECT_ROOT-rooted URL, exactly what /kraken/pull returns)
const CLIP_REL = '/brand/kraken-cache/action-clip-strength-training-jumping-mixed-mixed-jarosh-59037544.mp4';
const overrides = { [MEDIA_KEY]: { src: CLIP_REL } };

const log = (...a) => console.log(...a);
const assert = (c, m) => { if (!c) { console.error('❌ FAIL:', m); process.exitCode = 1; } else log('  ✓', m); };

// raw gray8 bytes of a PNG via ffmpeg (deterministic; avoids a 2nd puppeteer context
// which raced/GC-crashed when chained after the render page).
const GW = 192, GH = 340;
function grayBytes(pngPath) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', pngPath, '-vf', `scale=${GW}:${GH},format=gray`,
    '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error('ffmpeg gray failed: ' + String(r.stderr));
  return r.stdout;
}
function meanLuma(d) { let s = 0; for (let i = 0; i < d.length; i++) s += d[i]; return s / d.length; }
// mean absolute difference + fraction of strongly-changed pixels between two gray frames
function frameDiff(a, b) {
  let sum = 0, big = 0;
  for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); sum += d; if (d > 24) big++; }
  return { mad: sum / a.length, pctChanged: 100 * big / a.length };
}

// 1) unit: resolveSwapSrcs maps the leading-slash src to a real, existing file:// path
log('\nC3b — resolveSwapSrcs maps "/brand/…" → file://PROJECT_ROOT (under a file:// load)');
const fileUrl = pathToFileURL(TAGGED).href;
const resolved = resolveSwapSrcs(overrides, fileUrl);
const resolvedSrc = resolved[MEDIA_KEY].src;
log('  resolved src:', resolvedSrc);
assert(/^file:\/\//.test(resolvedSrc), 'resolved to a file:// URL');
assert(fs.existsSync(fileURLToPath(resolvedSrc)), 'resolved file:// path exists on disk');
// http loads are left untouched (dev server resolves "/brand/…" at its repo root)
assert(resolveSwapSrcs(overrides, 'http://x/')[MEDIA_KEY].src === CLIP_REL, 'http load leaves "/brand/…" untouched');

// render one frame through the REAL path (openTagged → resolveSwapSrcs → isolate → seek)
async function render(browser, ov, outPng) {
  const page = await openTagged(browser, TAGGED, ov);
  await isolateFrame(page, FRAME);
  await seekAndShot(page, T, outPng);
  await page.close();
  return grayBytes(outPng);
}

const browser = await puppeteer.launch({ headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
try {
  // e0 is the FULL-FRAME background <video> sitting behind bright overlays/text, so
  // whole-frame mean luma barely moves — the honest proof is a FRAME DIFF between the
  // real kraken clip and a MISSING clip (resolves to a 404 file:// → black video region).
  // Many changed pixels ⇒ the kraken footage actually rendered (the swap src resolved).
  log('\nC3b — render real /brand/kraken-cache clip vs a 404-missing clip (same path)');
  const missingPng = path.join(OUT, 'c3b-bug-missing.png');
  const fixedPng = path.join(OUT, 'c3b-fixed-kraken.png');
  const missing = await render(browser, { [MEDIA_KEY]: { src: '/brand/kraken-cache/__does_not_exist__.mp4' } }, missingPng);
  const fixed = await render(browser, overrides, fixedPng);

  const diff = frameDiff(fixed, missing);
  log(`  fixed luma ${meanLuma(fixed).toFixed(1)} · missing luma ${meanLuma(missing).toFixed(1)}`);
  log(`  frame diff: MAD=${diff.mad.toFixed(1)} · ${diff.pctChanged.toFixed(1)}% of pixels changed >24`);
  assert(diff.pctChanged > 10, `Kraken footage visibly rendered — ${diff.pctChanged.toFixed(1)}% of the frame changed vs the black 404 baseline`);
  assert(diff.mad > 6, `substantial pixel difference vs black baseline (MAD=${diff.mad.toFixed(1)})`);
  log('  wrote _out/c3b-fixed-kraken.png and _out/c3b-bug-missing.png');
} finally {
  await browser.close();
}
log('\n' + (process.exitCode ? '=== PHASE C3b RENDER: FAIL ===' : '=== PHASE C3b RENDER: PASS ==='));

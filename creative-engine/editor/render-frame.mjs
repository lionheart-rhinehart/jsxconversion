// creative-engine/editor/render-frame.mjs
//
// Phase 2 render path. Takes the Phase-1 TAGGED html + an override bag + a frame id,
// and produces a faithful frame (or a full MP4) of THAT single creative — by
// replaying the override bag with the SAME apply-overrides.js the editor uses, then
// seeking the animation deterministically (the technique mined from the v1
// animated-html renderer: pause every Web-Animations timeline, set currentTime, seek
// every <video>, screenshot). Because the apply step is byte-identical to the
// editor's, the rendered frame and the editor preview cannot disagree.
//
// This is clean-room: it imports nothing from creative-engine-v1 (it re-implements
// the ~15-line seek loop). Phase 5 will wrap this in a pooled queue + ffmpeg-shared
// color pipeline; here we keep it self-contained so the evidence stands alone.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const APPLY_SRC = fs.readFileSync(path.join(__dirname, 'apply-overrides.js'), 'utf8');
export const SEEK_SRC = fs.readFileSync(path.join(__dirname, 'seek.js'), 'utf8');

const STAGE_W = 1080, STAGE_H = 1920, FPS = 30, LOOP = 7;

// C3b (F1) — a Kraken-pulled clip lives at "/brand/kraken-cache/…" (PROJECT_ROOT-rooted),
// OUTSIDE the campaign folder whose <base> the renderer loads. Under a file:// load a
// leading-slash URL points at the FILESYSTEM ROOT (→ 404 → black video), so we rewrite
// any swap `src` that begins with a single "/" to an absolute file:// under PROJECT_ROOT.
// Campaign-local "assets/…" paths (no leading slash) and absolute URLs are left untouched.
// Only when loading via file://; an http(s) load already resolves "/brand/…" against the
// dev server's repo root.
export function resolveSwapSrcs(overrides, url) {
  if (!/^file:/i.test(url || '')) return overrides || {};
  const out = {};
  for (const key of Object.keys(overrides || {})) {
    const ov = overrides[key];
    if (ov && typeof ov === 'object' && typeof ov.src === 'string' && /^\/(?!\/)/.test(ov.src)) {
      const abs = path.join(PROJECT_ROOT, ov.src.replace(/^\/+/, ''));
      out[key] = Object.assign({}, ov, { src: pathToFileURL(abs).href });
    } else {
      out[key] = ov;
    }
  }
  return out;
}

// Resolve relative asset URLs (assets/vid/…) against the tagged file's own folder so
// headless puppeteer finds them whether we load by srcdoc or by file.
export async function openTagged(browser, taggedPath, overrides) {
  const page = await browser.newPage();
  await page.setViewport({ width: STAGE_W, height: STAGE_H, deviceScaleFactor: 1 });
  const url = /^https?:|^file:/.test(taggedPath) ? taggedPath : pathToFileURL(taggedPath).href;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.addScriptTag({ content: APPLY_SRC });
  await page.addScriptTag({ content: SEEK_SRC });
  const resolved = resolveSwapSrcs(overrides || {}, url);   // C3b: PROJECT_ROOT-rooted srcs → file://
  const res = await page.evaluate((ov) => window.CEApply.applyOverrides(document, ov), resolved);
  if (res.missing.length) console.error('[render-frame] WARNING missing override keys (surfaced, not silent):', res.missing);
  return page;
}

// isolate one .cr-frame as the render root at scale 1, return loop length
export async function isolateFrame(page, frameId) {
  return await page.evaluate((fid) => {
    const frame = document.querySelector('.cr-frame[data-edit-frame="' + fid + '"]');
    if (!frame) throw new Error('frame not found: ' + fid);
    // if this HTML was serialized from the live editor, drop the editor's injected
    // chrome style (its `body>*{display:none}` would hide the frame once we reparent it)
    const ce = document.getElementById('ce-iframe-css'); if (ce) ce.remove();
    // strip the gallery scale; pin top-left
    frame.style.transform = 'none';
    frame.style.transformOrigin = 'top left';
    frame.id = '__rtgt';
    document.body.innerHTML = '';
    document.body.style.margin = '0';
    document.body.style.background = '#0a0b0d';
    document.body.appendChild(frame);
    frame.style.position = 'fixed'; frame.style.top = '0'; frame.style.left = '0';
    Array.from(frame.querySelectorAll('video')).forEach((v) => { try { v.pause(); v.loop = false; } catch (e) {} });
    return true;
  }, frameId);
}

export async function seekAndShot(page, tMs, outPng) {
  // the SHARED deterministic seek (seek.js) — identical to the editor capture path
  await page.evaluate(async (tMs) => {
    await window.CESeek(document.getElementById('__rtgt') || document, tMs);
  }, tMs);
  const el = await page.$('#__rtgt');
  const buf = await el.screenshot({ type: 'png' });
  if (outPng) fs.writeFileSync(outPng, buf);
  return buf;
}

// one frame at a timestamp (the evidence path)
export async function renderFrameAt({ taggedPath, overrides, frameId, tMs, outPng }) {
  const browser = await puppeteer.launch({ headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  try {
    const page = await openTagged(browser, taggedPath, overrides);
    await isolateFrame(page, frameId);
    return await seekAndShot(page, tMs, outPng);
  } finally { await browser.close(); }
}

// full MP4 of one creative (fidelity eyeball, 2.5)
export async function renderMp4({ taggedPath, overrides, frameId, outMp4, fps = FPS, loop = LOOP }) {
  const browser = await puppeteer.launch({ headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  const framesDir = path.join(path.dirname(outMp4), '.frames-' + frameId);
  fs.rmSync(framesDir, { recursive: true, force: true }); fs.mkdirSync(framesDir, { recursive: true });
  try {
    const page = await openTagged(browser, taggedPath, overrides);
    await isolateFrame(page, frameId);
    const total = Math.round(fps * loop);
    for (let i = 0; i < total; i++) {
      await seekAndShot(page, (i / fps) * 1000, path.join(framesDir, `f_${String(i).padStart(5, '0')}.png`));
    }
  } finally { await browser.close(); }
  const ff = spawnSync('ffmpeg', ['-y', '-framerate', String(fps), '-i', path.join(framesDir, 'f_%05d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outMp4], { stdio: 'inherit' });
  fs.rmSync(framesDir, { recursive: true, force: true });
  if (ff.status !== 0) throw new Error('ffmpeg failed (is it on PATH?)');
  return outMp4;
}

// CLI: node render-frame.mjs <tagged.html> <frameId> [--overrides ov.json] [--mp4 out.mp4] [--at 3500 out.png]
const isMain = process.argv[1] && process.argv[1].endsWith('render-frame.mjs');
if (isMain) {
  const [tagged, frameId] = process.argv.slice(2);
  const args = process.argv.slice(2);
  const ovPath = args[args.indexOf('--overrides') + 1];
  const overrides = args.includes('--overrides') ? JSON.parse(fs.readFileSync(ovPath, 'utf8')) : {};
  if (args.includes('--mp4')) {
    const out = args[args.indexOf('--mp4') + 1];
    await renderMp4({ taggedPath: tagged, overrides, frameId, outMp4: out });
    console.log('wrote', out);
  } else if (args.includes('--at')) {
    const tMs = Number(args[args.indexOf('--at') + 1]);
    const out = args[args.indexOf('--at') + 2];
    await renderFrameAt({ taggedPath: tagged, overrides, frameId, tMs, outPng: out });
    console.log('wrote', out);
  } else {
    console.error('usage: render-frame.mjs <tagged.html> <frameId> [--overrides ov.json] [--mp4 out.mp4 | --at <ms> out.png]');
  }
}

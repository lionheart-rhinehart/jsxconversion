// test/intake-package.test.mjs
//
// Regression for the INTAKE PACKAGER (#2). Self-contained: it BUILDS its own minimal export
// fixtures in a temp dir, so it passes on a bare checkout (the real test exports under
// creative-engine/intake/_in/ are gitignored). Exercises the full pipeline end-to-end —
// detect → normalize → frame-map (real headless openLive + shared retag) → manifest →
// posters → exit-code verdicts — and the never-silent guards (0 frames → 2, broken → 3).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { packageExport } from '../creative-engine/intake/package-export.mjs';
import { detect } from '../creative-engine/intake/lib/detect.mjs';

// a stage-sized (1080×1920) creative div with direct text + an <img>; N of them = N frames
function frameHtml(i, imgSrc) {
  return `<div style="width:1080px;height:1920px;background:#111;color:#fff" aria-label="Frame ${i}">` +
    `<h1>Creative ${i}</h1><img src="${imgSrc}" alt="hero" style="width:200px;height:200px">` +
    `</div>`;
}
function exportHtml(frames) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>fixture</title></head>` +
    `<body style="margin:0">${frames.join('')}</body></html>`;
}

function mkFixture(name, html, assets = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `ce-intake-test-${name}-`));
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  for (const [rel, buf] of Object.entries(assets)) {
    const p = path.join(dir, rel); fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, buf);
  }
  return dir;
}
// 1×1 transparent PNG
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

test('packages a healthy 2-frame export → kind/frames/posters/ok:true, exit 0', async () => {
  const dir = mkFixture('ok', exportHtml([frameHtml(1, 'hero.png'), frameHtml(2, 'hero.png')]), { 'hero.png': PNG_1PX });
  const r = await packageExport(dir, { posters: true, log: () => {} });
  assert.equal(r.exit, 0, 'clean export exits 0');
  const m = r.manifest;
  assert.equal(m.schema, 1);
  // fixture has no .cr-frame class, no peer JS, no <x-dc> → classify returns "unknown"
  // (still fully processed + frame-mapped — unknown is FLAGGED-but-handled, never dropped)
  assert.equal(m.kind, 'unknown');
  assert.equal(m.frames.length, 2, 'two stage-sized creatives detected');
  assert.equal(m.ok, true);
  assert.equal(m.brokenAssets.length, 0);
  assert.ok(m.counts.text >= 2, 'headline text counted');
  // every frame got a poster PNG with real bytes
  for (const f of m.frames) {
    assert.ok(f.poster, `frame ${f.id} has a poster path`);
    const pp = path.join(r.pkgDir, f.poster);
    assert.ok(fs.existsSync(pp) && fs.statSync(pp).size > 1000, `poster ${f.poster} written with real bytes`);
  }
  // manifest written to disk
  assert.ok(fs.existsSync(path.join(r.pkgDir, 'intake.json')));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('0-frame input → exit 2, package still written', async () => {
  const dir = mkFixture('neg', exportHtml([`<div style="width:200px;height:80px">no stage here</div>`]));
  const r = await packageExport(dir, { posters: false, log: () => {} });
  assert.equal(r.exit, 2);
  assert.ok(fs.existsSync(r.pkgDir), 'package written for inspection even with zero frames');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('broken asset → flagged, ok:false, exit 3, package still written', async () => {
  // a stage-sized frame whose <img> points at a file we never create → 404 under /_packages/
  const dir = mkFixture('broken', exportHtml([frameHtml(1, 'missing-clip.png')]));
  const r = await packageExport(dir, { posters: false, log: () => {} });
  assert.equal(r.exit, 3);
  assert.equal(r.manifest.ok, false);
  assert.ok(r.manifest.brokenAssets.length >= 1, 'the missing image is flagged');
  assert.match(r.manifest.brokenAssets[0].url, /missing-clip\.png/);
  assert.ok(fs.existsSync(path.join(r.pkgDir, 'intake.json')), 'package still written');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('detect: ambiguous folder (2 .dc.html) throws with candidate list', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-intake-test-amb-'));
  fs.writeFileSync(path.join(dir, 'a.dc.html'), '<x-dc></x-dc>');
  fs.writeFileSync(path.join(dir, 'b.dc.html'), '<x-dc></x-dc>');
  assert.throws(() => detect(dir), /ambiguous/i);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('detect: single .dc.html classifies dc-html, siblings travel via parent srcRoot', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-intake-test-dc-'));
  fs.writeFileSync(path.join(dir, 'design.dc.html'), '<html><head><script src="./support.js"></script></head><body><x-dc></x-dc></body></html>');
  fs.writeFileSync(path.join(dir, 'support.js'), '// runtime');
  const det = detect(path.join(dir, 'design.dc.html'));
  assert.equal(det.kind, 'dc-html');
  assert.equal(path.basename(det.srcRoot), path.basename(dir), 'srcRoot is the parent folder (siblings travel)');
  assert.equal(det.entryRel, 'design.dc.html');
  fs.rmSync(dir, { recursive: true, force: true });
});

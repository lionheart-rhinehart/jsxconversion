// creative-engine/intake/lib/manifest.mjs
//
// PHASE D — assemble + write the packing slip (intake.json), the single source of truth the
// editor host, the renderer, and the Kraken content-row builder all read. Also owns the
// poster capture (Phase E) and the ok/exit-code verdict (Phase F).
//
// intake.json schema:1 —
//   { schema, slug, kind, entryHtml, asset_base,
//     createdFrom:{ source, isZip, detectedReason, at },
//     frames:[{ id, label, size:{w,h}, detected, text, media, flagged, poster }],
//     counts:{ frames, tagged, text, media }, flagged:[…], brokenAssets:[…], ok }
//
// `ok` is true ONLY when there were frames AND no broken assets. A non-ok package is STILL
// written (for inspection) — the caller decides the exit code.

import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { createServer } from '../../editor/serve.mjs';
import { openLive, isolateFrame, seekAndShot, LAUNCH_ARGS } from '../../editor/render-live.mjs';

function startServer() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

// Capture one poster PNG per frame. isolateFrame is DESTRUCTIVE (it empties document.body to
// move the frame to the render root), so we open a FRESH live page per frame — never reuse
// one across frames. t=0 is first-frame-safe for these exports (the renderer's own default).
// We serve over HTTP (Range) via serve.mjs so any <video> in the frame can seek/decode —
// frame-map's server is already closed by now, so posters own their own short-lived one.
export async function capturePosters({ pkgRelUrl, frames, postersDir, posterAtMs = 0 }) {
  fs.mkdirSync(postersDir, { recursive: true });
  const { server, port } = await startServer();
  const url = `http://127.0.0.1:${port}${pkgRelUrl}`;
  const browser = await puppeteer.launch({ headless: true, args: LAUNCH_ARGS });
  const written = [];
  try {
    for (const f of frames) {
      const { page, clock } = await openLive(browser, url);  // fresh page: isolateFrame is destructive
      await isolateFrame(page, f.id);
      const out = path.join(postersDir, `${f.id}.png`);
      await seekAndShot(page, clock, posterAtMs, out);
      await clock.dispose();
      await page.close();
      written.push({ id: f.id, poster: `posters/${f.id}.png` });
    }
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
  return written;
}

// Assemble the manifest object (no I/O). posterById maps frame id → "posters/<id>.png".
export function assembleManifest({ slug, kind, entryRel, asset_base, frameMap, source, isZip, detectedReason, at, posterById = {} }) {
  const frames = frameMap.frames.map((f) => ({
    id: f.id,
    label: f.label,
    size: f.size,
    detected: f.detected,
    text: f.text,
    media: f.media,
    flagged: f.flagged,
    poster: posterById[f.id] || null,
  }));
  const ok = frames.length > 0 && frameMap.brokenAssets.length === 0;
  return {
    schema: 1,
    slug,
    kind,
    entryHtml: entryRel,
    asset_base,
    createdFrom: { source, isZip: !!isZip, detectedReason, at },
    frames,
    counts: frameMap.counts,
    flagged: frameMap.flagged,
    brokenAssets: frameMap.brokenAssets,
    ok,
  };
}

export function writeManifest(pkgDir, manifest) {
  const dest = path.join(pkgDir, 'intake.json');
  fs.writeFileSync(dest, JSON.stringify(manifest, null, 2));
  return dest;
}

// One row per frame for the Kraken content-row builder / contact-sheet case — closes the
// frame_id contract crack (render/approvals.firstFrameId regexes a STATIC tagged file v2 no
// longer produces). Each row carries the explicit frame_id from the manifest.
export function manifestToMetadataRows(manifest, { tagged_url } = {}) {
  return manifest.frames.map((f) => ({
    render: 'live-html',
    tagged_url: tagged_url || manifest.entryHtml,
    asset_base: manifest.asset_base,
    frame_id: f.id,
    poster: f.poster,
    label: f.label,
  }));
}

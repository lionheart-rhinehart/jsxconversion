// creative-engine/intake/lib/frame-map.mjs
//
// PHASE C + F(broken-assets) — "count the creatives with the SAME eyes the editor + renderer use."
//
// The trust move of the whole packager: we don't parse the HTML ourselves. We serve the
// normalized package over HTTP (Range-capable, via the editor's serve.mjs) and open it with
// render-live.mjs openLive() — the EXACT path the renderer uses. openLive injects the shared
// frame-detect + runtime-retag, flushes rAF at t=0, runs CEReTag.tag, and THROWS on zero
// frames. So the frame map can never disagree with what the renderer captures, and the
// 0-frame guard is free (re-thrown to the CLI as exit 2).
//
// Broken-asset detection (Phase F) is wired here because this is the one place we actually
// load every asset over the wire: we attach requestfailed + response>=400 listeners BEFORE
// goto, so a missing clip/poster/font is caught and flagged (never silent).
//
// Clean room: imports only sibling creative-engine modules (serve.mjs, render-live.mjs).

import http from 'node:http';
import puppeteer from 'puppeteer';
import { createServer, PROJECT_ROOT } from '../../editor/serve.mjs';
import { openLive, LAUNCH_ARGS } from '../../editor/render-live.mjs';

// Start serve.mjs on an ephemeral port (0 → OS picks a free one). Returns { server, port }.
function startServer() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

// buildFrameMap({ pkgRelUrl }) →
//   { frames:[{id,label,size:{w,h},detected,text,media,flagged,brokenAssets}], counts, flagged, brokenAssets, port }
//   pkgRelUrl = repo-rooted URL path to the entry, e.g.
//               "/creative-engine/intake/_packages/<slug>/<entryRel>"
// Throws on zero frames (openLive re-throws) → caller maps to exit 2.
export async function buildFrameMap({ pkgRelUrl }) {
  const { server, port } = await startServer();
  const url = `http://127.0.0.1:${port}${pkgRelUrl}`;
  const browser = await puppeteer.launch({ headless: true, args: LAUNCH_ARGS });
  const broken = [];
  try {
    // openLive owns the real page + retag + the 0-frame throw. We can't pass it a pre-watched
    // page (it calls browser.newPage internally), so openLiveWatched shims newPage to attach
    // requestfailed/response listeners to the design's page BEFORE goto, then restores it. We
    // only flag refs under /_packages/ (the design's own assets); a stray external 404 is not ours.
    const { page: livePage, clock, retag } = await openLiveWatched(browser, url, broken, port);

    // Pull a per-frame record straight off the tagged DOM, so labels/sizes come from the SAME
    // stamped elements runtime-retag produced. Merge counts from retag.perFrame by index.
    const domFrames = await livePage.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[data-edit-frame]'));
      return els.map((el) => {
        const cs = getComputedStyle(el);
        return {
          id: el.getAttribute('data-edit-frame'),
          label: el.getAttribute('data-label') || el.getAttribute('aria-label') ||
                 (el.getAttribute('id') && !/^__/.test(el.id) ? el.id : null),
          size: { w: Math.round(parseFloat(cs.width)), h: Math.round(parseFloat(cs.height)) },
          detected: el.getAttribute('data-edit-frame-detected') === '1',
        };
      });
    });

    const perFrameById = {};
    (retag.perFrame || []).forEach((pf) => { perFrameById['f' + pf.frame] = pf; });

    const frames = domFrames.map((f, i) => {
      const pf = perFrameById[f.id] || {};
      return {
        id: f.id,
        label: f.label || `Frame ${i + 1}`,
        size: f.size,
        detected: f.detected,
        text: pf.text || 0,
        media: pf.media || 0,
        flagged: pf.flagged || 0,
      };
    });

    await clock.dispose();

    const counts = {
      frames: frames.length,
      tagged: retag.tagged || 0,
      text: retag.text || 0,
      media: retag.media || 0,
    };
    return { frames, counts, flagged: retag.flagged || [], brokenAssets: dedupeBroken(broken), port };
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
}

function dedupeBroken(arr) {
  const seen = new Set(); const out = [];
  for (const b of arr) { const k = b.url + '|' + b.status; if (seen.has(k)) continue; seen.add(k); out.push(b); }
  return out;
}

// openLive creates its own page internally, so to attach requestfailed/response listeners to
// THAT page we replicate openLive here but with the listeners attached before goto. We import
// openLive for the production single-frame path; for the frame-map load we need the wire hooks,
// so this thin variant calls the same shared injection contract. Kept tiny + faithful.
async function openLiveWatched(browser, url, broken, port) {
  // Re-enter openLive but capture its page via a newPage hook: openLive uses browser.newPage();
  // we shim it so the very next newPage gets our listeners, then restore.
  // net::ERR_ABORTED is a CANCELLATION, not a missing asset — the browser routinely aborts a
  // <video> range-fetch it no longer needs (e.g. after we pause it). A genuinely-missing file
  // returns HTTP 404, which we DO flag. So ignore cancellation errorTexts here (not silent on
  // real breakage — only on browser-initiated cancels).
  const isCancel = (txt) => /ERR_ABORTED|ERR_CACHE_MISS|ERR_BLOCKED_BY_CLIENT/i.test(txt || '');
  const realNewPage = browser.newPage.bind(browser);
  browser.newPage = async (...a) => {
    const p = await realNewPage(...a);
    p.on('requestfailed', (r) => {
      const u = r.url(); const err = (r.failure() && r.failure().errorText) || 'requestfailed';
      if (u && u.includes('/_packages/') && !isCancel(err)) broken.push({ url: u.replace(`http://127.0.0.1:${port}`, ''), status: err });
    });
    p.on('response', (r) => { if (r.status() >= 400) { const u = r.url(); if (u && u.includes('/_packages/')) broken.push({ url: u.replace(`http://127.0.0.1:${port}`, ''), status: r.status() }); } });
    browser.newPage = realNewPage; // only the first page (the design) is watched
    return p;
  };
  try {
    return await openLive(browser, url);
  } finally {
    browser.newPage = realNewPage;
  }
}

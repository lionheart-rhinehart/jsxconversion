// portableize-overrides.mjs
//
// Make an override bag PORTABLE: any media src that points at a LOCAL file
// (a Kraken-pulled clip at /brand/kraken-cache/…, a /music-library/… track,
// a file:// path, or a bare relative path) is uploaded to Kraken Storage and
// the src is rewritten to the public Kraken URL.
//
// Why: the live PORTAL preview (and the client's browser) can't read engine-
// local paths — they 404. Rewriting to Kraken URLs lets the preview PLAY the
// montage with zero render, and the final local render still works (ffmpeg
// reads the http(s) URL fine). Already-http(s) srcs are left untouched.
//
// Media locations walked: top-level `.src` (single swap),
// `.montage.clips[].src`, `.montage.audio.src`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { uploadToStorage, mimeForExt, bucketForMime } from '../../scripts/lib/kraken.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..'); // …/jsxconversion

// Resolve a src to a local filesystem path, or null if it's already remote /
// can't be resolved locally. Mirrors resolveClipPath in render-frame.mjs.
function resolveLocal(src) {
  if (!src || typeof src !== 'string') return null;
  if (/^https?:/i.test(src)) return null;          // already remote — skip
  if (/^data:/i.test(src)) return null;            // inline — skip
  if (/^file:/i.test(src)) return fileURLToPath(src);
  if (/^\/(?!\/)/.test(src)) return path.join(PROJECT_ROOT, src.replace(/^\/+/, '')); // "/brand/…", "/music-library/…"
  return path.join(PROJECT_ROOT, src);             // bare relative — best effort
}

// Upload one local file to Kraken Storage (idempotent via x-upsert) and return
// its public URL. Cached by source path so each unique file uploads once.
function makeUploader({ wsId, cache, log }) {
  return async function uploadOne(src) {
    if (cache.has(src)) return cache.get(src);
    const abs = resolveLocal(src);
    if (!abs || !fs.existsSync(abs)) {
      log(`    ⚠ portableize: cannot resolve local media "${src}" — leaving as-is`);
      cache.set(src, src);
      return src; // leave untouched; preview may miss it but publish won't break
    }
    const ext = path.extname(abs).toLowerCase();
    const mime = mimeForExt(ext);
    const bucket = bucketForMime(mime);
    const storagePath = `override-media/${wsId}/${path.basename(abs)}`;
    try {
      const { url } = await uploadToStorage(abs, bucket, storagePath, mime);
      cache.set(src, url);
      log(`    ↑ portableized ${path.basename(abs)} → ${bucket}`);
      return url;
    } catch (e) {
      log(`    ⚠ portableize upload failed for ${path.basename(abs)}: ${e.message}`);
      cache.set(src, src);
      return src;
    }
  };
}

// Walk + rewrite a single frame's override bag. Returns a NEW bag (does not
// mutate the input). Safe to call with an empty/undefined bag.
export async function portableizeOverrides(bag, { wsId, log = () => {} } = {}) {
  if (!bag || typeof bag !== 'object' || !Object.keys(bag).length) return bag || {};
  if (!wsId) throw new Error('portableizeOverrides: wsId required');
  const cache = new Map();
  const uploadOne = makeUploader({ wsId, cache, log });
  const out = {};

  for (const key of Object.keys(bag)) {
    const ov = bag[key];
    if (!ov || typeof ov !== 'object') { out[key] = ov; continue; }
    const next = { ...ov };

    // single media swap
    if (typeof next.src === 'string') next.src = await uploadOne(next.src);

    // montage: clips[].src + audio.src
    if (next.montage && typeof next.montage === 'object') {
      const m = { ...next.montage };
      if (Array.isArray(m.clips)) {
        m.clips = [];
        for (const c of next.montage.clips) {
          if (c && typeof c.src === 'string') m.clips.push({ ...c, src: await uploadOne(c.src) });
          else m.clips.push(c);
        }
      }
      if (m.audio && typeof m.audio === 'object' && typeof m.audio.src === 'string') {
        m.audio = { ...m.audio, src: await uploadOne(m.audio.src) };
      }
      next.montage = m;
    }

    out[key] = next;
  }
  return out;
}

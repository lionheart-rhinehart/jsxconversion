// Split a flat editor override bag into the slice that belongs to ONE frame.
//
// The bag is keyed "fN:eM" (frame:element). When publishing, each frame becomes its own
// approval row, so a frame's approval should carry ONLY its own keys (the ones starting
// "<frameId>:"). Editor-metadata keys (reserved "__…" keys like "__groups__") are skipped
// here — they are cross-frame bookkeeping, not per-frame element edits. Pure + side-effect
// free so it's shared by publish-package.mjs and unit-tested directly.

export function frameOverrides(bag, frameId) {
  const out = {};
  if (!bag || typeof bag !== 'object') return out;
  const prefix = frameId + ':';
  for (const k of Object.keys(bag)) {
    if (k.indexOf('__') === 0) continue;          // editor metadata, not a per-frame element edit
    if (k.indexOf(prefix) === 0) out[k] = bag[k];
  }
  return out;
}

// how many REAL element edits a frame's slice carries (ignores metadata keys)
export function countEdits(bag) {
  if (!bag || typeof bag !== 'object') return 0;
  return Object.keys(bag).filter((k) => k.indexOf('__') !== 0).length;
}

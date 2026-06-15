---
title: The intake packager (#2) — one front door, one manifest, the SAME eyes as the renderer
date: 2026-06-15
branch: main
---

## What this built

The "mailroom" of /creative-engine v2: `creative-engine/intake/package-export.mjs <path>` takes any
finished Claude Design export (a `.zip`, a folder, or a single `.dc.html`), normalizes it into a
self-contained `_packages/<slug>/`, and emits ONE packing slip — `intake.json` — that the editor host,
the renderer, and the Kraken content-row builder all read. Plus one poster PNG per frame.

Files (clean room, zero v1 imports): `lib/detect.mjs` (A), `lib/normalize.mjs` (B), `lib/frame-map.mjs`
(C+broken-assets), `lib/manifest.mjs` (D+E posters), `package-export.mjs` (orchestration + exit codes).

## The one idea that makes it trustworthy

The frame map is NOT parsed from the HTML. We serve the normalized package over HTTP (Range, via the
editor's `serve.mjs`) and open it with `render-live.mjs openLive()` — the EXACT path the renderer uses.
openLive injects the shared `frame-detect` + `runtime-retag`, flushes rAF at t=0, runs `CEReTag.tag`, and
THROWS on zero frames. So the packager's count can never disagree with what the renderer captures, and the
0-frame guard came free. Receipts: Carmel→10 frames, Westfield→36, AA-Static.dc.html→20 — all matching.

## Landmines hit (real data taught these)

1. **`net::ERR_ABORTED` is NOT a broken asset.** Campaign B's `<video>`s get their range-fetch cancelled by
   the browser routinely (we pause them during poster capture). A genuinely-missing file returns HTTP 404,
   which we DO flag. Flagging ERR_ABORTED gave a false "broken" on `carries-hs-m-indy.mp4` (which exists).
   Fix: ignore `ERR_ABORTED|ERR_CACHE_MISS|ERR_BLOCKED_BY_CLIENT`; keep 404/4xx/5xx.
2. **`support.js` in a COMMENT mis-classified Westfield as dc-html.** Westfield's standalone `index.html`
   *says* "support.js runtime replaced…" in a comment. Classify must match the real signature — an `<x-dc>`
   element or a `<script src=…support.js>` TAG — not loose text. (38 `.cr-frame`, no real support.js → cr-frame.)
3. **Real exports can genuinely be missing assets.** All four Campaign B locations reference
   `assets/clips-b/ag-ms-f-indy.mp4` — only the poster `.jpg` ships, the `.mp4` does not. The packager
   correctly flags it (ok:false, exit 3) and STILL writes the package. This is the broken-asset receipt on
   real data; do not "fix" it by fabricating the clip.
4. **`openLive` makes its own page**, so to attach `requestfailed`/`response>=400` listeners to the design's
   page we shim `browser.newPage` to wire the very next page, then restore it (`openLiveWatched`).
5. **`isolateFrame` is destructive** (empties `document.body`) — posters use a FRESH `openLive` page per
   frame, never reuse one.

## The frame_id contract crack — now closed

v2 tags at runtime, so the on-disk HTML carries no static `data-edit-frame` tags. `render/approvals.mjs`
`firstFrameId()` regexed those out of a static file → finds nothing on a live export. Fix:
`manifest.mjs manifestToMetadataRows()` emits one metadata row per frame WITH an explicit `frame_id`; and
`buildJobFromApproval` now THROWS for a `render:'live-html'` approval that lacks `frame_id` (loud, never a
silent wrong guess). `firstFrameId` is kept only for legacy statically-tagged HTML.

## Wiring + evidence

`editor-host.html?pkg=<slug>` fetches `intake.json` and loads `entryHtml` + `asset_base` from it (the
existing `?html=` path is untouched). Verified at localhost:5300: `?pkg=carmel-2c7c5b76` mounts, the frame
dropdown shows "Creative 1 of 10" (the manifest's map), the real creative renders live, 0 console errors.
`test/intake-package.test.mjs` (self-contained fixtures, passes on a bare checkout) + `npm test` 179/179.
`_packages/` gitignored.

## Where it lives / still open

`creative-engine/intake/{package-export.mjs, lib/*}`. Follow-ups noted but descoped: a `--clean`/TTL sweep
for `_packages/` disk growth; nested-zip handling (flagged, not expanded); auto-packaging a folder of many
`.dc.html` (deliberately ambiguous → throws; point at one file).

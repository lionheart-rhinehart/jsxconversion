---
title: Wiring the live editor to runtime re-tagging (zero-loss v2, #5/#9)
date: 2026-06-15
branch: main
---

## What this finished

The renderer chat proved the architecture (`2026-06-15__zero-loss-live-render-injected-js-clock.md`):
real Claude Design exports are JS-driven, so tagging must happen on the LIVE DOM after the design's
JS builds it. This chat wired the **editor** to the same shared modules, so an edit authored in the
editor lands on the EXACT same element when the renderer makes the MP4.

## The four wiring changes (editor-only, clean room)

1. **Host hands over the two stamping tools.** `editor-host.html` now fetches
   `../shared/frame-detect.js` + `../shared/runtime-retag.js` and sets `__CE_FRAME_DETECT_SRC__` /
   `__CE_RETAG_SRC__` (alongside the existing `__CE_APPLY_SRC__`). `loadIframe()` injects all three
   into the srcdoc iframe. **raf-clock.js is deliberately NOT injected** — that's the renderer's
   deterministic freeze clock; the live editor must animate freely.
2. **`tagLive()` replaces the static `injectIframeRuntime()`.** It `await`s the build
   (`waitForBuild()` = fonts.ready + poll `CEFrames.detect` up to ~60 rAFs), then calls
   `window.CEReTag.tag(document)` and builds the frame dropdown from `indexFrames()`
   (`querySelectorAll('[data-edit-frame]')`, not a hardcoded `.cr-frame`). Zero frames → throws
   (never silent), same discipline as `render-live.mjs`.
3. **Rebuild watch (#9 "tags survive").** A `MutationObserver` on the iframe's `documentElement`
   fires `reTagAndReapply()` (re-stamp + replay the override bag) when the design rebuilds its own
   DOM. It watches only for the CATASTROPHE — the relocated frame detaching or `#ce-canvas`
   vanishing — so the editor's own edits (translate / contenteditable / applyOverrides) don't trip
   it. A `suspendWatch` flag fences our own re-stamp; a `setTimeout(0)` re-checks so a transient
   state (mid-`showFrame`) doesn't false-trigger. `undo/redo`'s `rerenderPristine()` now awaits
   `tagLive()` too.
4. **8 `.cr-frame[data-edit-frame…]` selectors → `[data-edit-frame…]`** in editor.js + the CSS rule.

## The landmine (and why it mattered for the renderer too)

`apply-overrides.js` is the SHARED replay function — the editor calls it AND the renderer injects it
headless. Its `frameEl()` still hardcoded `.cr-frame[data-edit-frame="X"]`. Detected Campaign B
`.story` frames carry the `data-edit-frame` stamp but **no `.cr-frame` class**, so EVERY override
resolved to `null` (`missing` listed all keys) — the editor preview AND the rendered MP4 would both
silently drop edits on JS-driven designs. Fixed `frameEl()` to query by the stamp alone (still
matches Westfield's cr-frames, which also carry the stamp). Locked with
`test/apply-overrides-detected-frame.test.mjs`.

## Evidence (all in-browser at localhost:5300, real Campaign B Carmel export)

- Mount → **animates live** (transform matrix 1.59369→1.59299 over 300ms; raf-clock not injected).
- Text edit + media swap + drag → **full reload** (design JS rebuilt from scratch) → 10 frames
  re-detected, all 3 survived (`CARMEL — REBUILD SURVIVED` + swapped footage).
- **Spontaneous rebuild** (body subtree wiped + replaced, editor-not-initiated) → watcher
  auto-recovered: re-stamped + re-applied (`WATCHER RECOVERED IT`).
- Same bag rendered headless via `render-live.mjs` → `_out/ev-renderer-match.png` (616KB,
  `RENDERER MATCH` eyebrow + same clip) → **editor ids === renderer ids**.
- `npm test` → 174/174.

## Where it lives

`creative-engine/editor/editor.js` (tagLive/indexFrames/rebuild watch), `editor-host.html` (tool
handoff), `apply-overrides.js` (frameEl fix). `.claude/launch.json` gained a `ce-editor` preview
config (port 5300, `creative-engine/editor/serve.mjs`).

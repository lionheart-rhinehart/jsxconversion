---
title: Every media-application path shares one dependency — the host must be a <video>; fix it in the shared spot or fix them all
date: 2026-06-16
branch: main
---

## What happened

"Image swapped to video goes black" came back **three times** in one session. Each fix patched one
code path and missed the siblings that share the same dependency.

1. **Single swap** (`apply-overrides.js` `setSrc`): an `<img>` slot fed a video stayed an `<img>` →
   black. Fixed by `replaceMediaEl` (convert `<img>`→`<video>`).
2. **I "verified" with a local test file, not a Kraken-pulled clip.** Different path (the pull resolves
   a cache URL); my proof didn't cover the user's real workflow.
3. **Montage path** (`setMontage` + `editor.js` `startMontageDriver`): the driver set `el.src` per clip
   on whatever element `el` was. On an image-origin slot `el` is an `<img>` → setting `<img>.src` to an
   `.mp4` → black. Intermittent because committing audio re-applied the montage onto the slot after a
   rebuild reverted it to its original `<img>`.

## Root cause (the real one)

**Multiple independent paths all require the media host to be a `<video>`:** single swap, montage
driver, and the headless renderer. Fixing only `setSrc` left `setMontage` broken. The fix is to enforce
the dependency in the **shared** function (`apply-overrides.js`, which the editor preview AND the
renderer both use): `setMontage` now converts a non-`<video>` host via `replaceMediaEl` before attaching
the montage, exactly like the single-swap path. One guarantee, both paths.

## The rule (now in CLAUDE.md rule 6 + creative-engine/README.md)

- **Before changing code, map its dependents.** Grep the symbol, read the callers, find every path that
  shares the dependency. `apply-overrides.js` is shared by preview + render — a change there hits both.
- **After changing code, verify the whole feature, not the line.** Full `npm test` PLUS the live
  harnesses (`phase-c-live`, `phase-d-mediaflow-live`, `phase-d-montage-length`), and reproduce the
  user's REAL workflow (Kraken clip, not a local stand-in — they behave differently).
- **Lock every fix with a regression test that fails without it,** wired into pre-commit.

## Guards added this session
- `test/apply-overrides-media-interchange.test.mjs` — img↔video single swap.
- `test/apply-overrides-montage-img.test.mjs` — montage on an `<img>` slot converts to `<video>`.
- `test/apply-overrides-move-inline.test.mjs` — inline text moves (position:relative, not translate).
- `test/editor-lock-visibility.test.mjs` — lock button can't be clipped off the toolbar.
- `test/serve-package-overrides.test.mjs` + `test/publish-overrides-split.test.mjs` — Save persists + publish carries edits.
All wired into `scripts/githooks/pre-commit` so a sibling path can't silently reintroduce any of them.

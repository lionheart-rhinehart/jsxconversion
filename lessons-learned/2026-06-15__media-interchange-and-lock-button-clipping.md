---
title: Media must be interchangeable in any slot + the Kraken Lock button was clipped off the toolbar
date: 2026-06-15
branch: main
---

## What happened

First real run of the new package-mode editor (`editor-host.html?pkg=<slug>`) on the AA Multi-Sport
exports surfaced two issues that *looked* like "the editor suddenly broke" but were not regressions
introduced that session (`git status` was clean throughout):

1. **Swapping a video into a static-photo slot went blank.** Swapping a photo worked.
2. **The 🔒 Lock button (pin the selected Kraken folder) "disappeared."**

## Root causes (both verified from git history, not guessed)

### 1. Media swap keyed off the element's tag, not the incoming media's type
`apply-overrides.js` `setSrc()` was **byte-identical since it was first written (2026-06-12)** — it had
NEVER handled cross-type swaps. It only ever worked because every prior swap was same-type
(video→video on motion templates, photo→photo on statics). The first time a **video** was dropped into
an `<img>` slot, it just did `<img src="x.mp4">` — an `<img>` can't play video → blank.

**Fix:** `setSrc()` now classifies the INCOMING src by extension and, when the type differs from the
live element, **replaces the element itself** (`<img>`↔`<video>`), carrying over `data-edit-*` ids +
class + inline style so the slot stays findable and styled. Because this file is the SHARED
preview+render function, the fix lands in the editor preview AND the rendered MP4 at once. Montages can
now mix photos + videos too (image clips render as a held still via `-loop 1` in `montage.mjs`; the
live driver paints image clips with an `<img>` overlay over the `<video>` box).

### 2. The Lock button was clipped off the right edge of the media toolbar
The button was never removed — its code was intact and it *worked* (the live Kraken pin round-trip
passes). But `.ce-kgrid-bar` was a **single non-wrapping flex row** inside
`.ce-kraken-grid { overflow:hidden }`, with a `flex:1` spacer pushing the lock to the far right. When
the toolbar was wider than the panel (long workspace/folder names like "AA - Carmel" / "IG stories" +
all the filters, at a ~1133px window), the lock overflowed **past the clipped right edge** and vanished.

**Fix (editor.css):** `flex-wrap:wrap` on `.ce-kgrid-bar` + `.ce-kraken-lock { flex-shrink:0 }` +
shrinkable search. The lock now wraps to a second row instead of being clipped — visible at any width.

## The trap I fell into (and how to avoid it)

I initially "verified" the lock was fine because the existing `phase-c-live.mjs` harness passed — but
that harness runs at a **1400px viewport**, wide enough that the toolbar never overflows. It tested the
wrong condition and I reported "no bug." **A passing test at one viewport says nothing about a layout
bug at another.** Cody's screenshot (at 1133px) is what exposed it. Lesson: layout/overflow bugs need a
test at the cramped size that actually triggers them — reproduce the *user's* conditions, not the
harness's convenient ones.

## How this is kept fixed permanently

Two committed regression tests, both **proven to fail if the fix is reverted**:
- `test/apply-overrides-media-interchange.test.mjs` — img↔video element replacement + same-type.
- `test/editor-lock-visibility.test.mjs` — renders the real toolbar + `editor.css` in a NARROW panel
  (forces overflow) and asserts the lock stays inside the panel (`lockRight <= panelRight`).

Both are wired into `scripts/githooks/pre-commit` (the active hooksPath) so **every commit runs them
and is blocked if either breaks** (bypass: `CE_SKIP_EDITOR_TESTS=1`). Verified: reverting `flex-wrap`
made the lock test fail with `lockRight 1091 > panelRight 740`; restoring it passed.

## Takeaways
- A swap/transform should key off the **incoming** data's type, never the current element's tag.
- A latent bug that "never happened" usually means the triggering case never occurred — new front doors
  (here: package-mode `?pkg=`) expose latent code paths; treat first-run as first-exposure, not regression.
- For a layout bug, write the regression test at the width that breaks it, and prove the test fails
  without the fix — a green test you haven't seen go red is not yet a guard.

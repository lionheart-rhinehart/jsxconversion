---
title: "Building a real editor: headless-puppeteer flakiness + flex/sticky overflow (and how to verify)"
date: 2026-06-14
branch: main
---

# The trimmer/montage build took many iterations. Almost none were the *feature* — they were the
# test harness lying and CSS layout overflowing. Here's what bit, repeatedly, and the rules.

This session built a real Canva-grade editor surface (roomy media modal, Ctrl-multi-select, montage
build, a visual trimmer with drag/play/scrub/Done, crossfade transitions). Every feature shipped, but
each cost 3–6 extra round-trips to the **same two classes of problem**.

## 1. Headless puppeteer interaction is flaky in ways a real browser is NOT. Isolate + retry.

Symptoms seen over and over (the feature worked in a real browser every time):
- **Held-modifier clicks** (`keyboard.down('Control')` + `mouse.click`) intermittently register as a
  *plain* click — the keydown hasn't propagated. Multi-select landed 3, then 0, then 4 (a phantom).
- **Back-to-back drags on a re-rendered element** silently no-op. The trimmer rebuilds after every
  commit (the video reloads, `dur=0` until `loadedmetadata`); a drag fired before it settled does
  nothing. The *first* drag in a session always worked; the second didn't.
- **A tiny 16px handle at the very edge** (in=0): clicking its visual center lands just *outside* the
  bar. Press a few px INSIDE the track instead, or press the handle element's own rect.
- `boundingBox()` returns `null` for an element that has scrolled out of the modal (overflow), and
  `waitForSelector({visible:true})` rejects some genuinely-visible elements (a wrapped `<label>`).

Rules that finally made tests deterministic:
- **Drive ONE gesture per fresh page session** (reload between) when a feature re-renders mid-flow.
  Each gesture as "the first action" is reliable; chaining them on a rebuilt DOM is not.
- **Retry the gesture until the state sticks** (read `.ce-sel` count / the bag, re-click). This is
  still *real* input — it compensates for the harness, not the result.
- **Wait for the thing to settle** (`loadedmetadata`/your "ready" predicate + a short sleep) before
  the next real interaction. Don't trust a fixed sleep across a rebuild.
- **Make assertions count-agnostic** where the harness is racy: assert "≥2 selected and the bag has
  N clips matching", not "exactly 3" — the feature guarantees the relationship, not the flaky count.
- A probe script (build state via `setOverrides`, then drive + `elementFromPoint` + dump rects) found
  every one of these in minutes. Reach for it before theorizing. (Still verify with REAL `page.mouse`,
  never synthetic `dispatchEvent` — see [[2026-06-12__synthetic-events-are-not-real-interaction]].)

## 2. A tall element in a flex/sticky panel will overflow the modal — controls land off-screen.

The trim preview grew to fill space; suddenly the Play/Done controls rendered *below* the viewport
(y≈1100 in a 1050px window) and couldn't be clicked. Three real causes, stacked:
- **Sticky `bottom:0` only works if the scroll container is height-bounded.** Our montage panel
  wasn't, so the "sticky" controls floated at the panel's true content bottom (below the modal).
- **A `flex:1` child with a loaded `<video>` and `max-height:none` renders near the video's intrinsic
  size** (1920px tall) → the panel exploded. Cap the media, or flex it with `min-height:0`.
- **The real culprit was a hidden sibling stealing height:** a pinned-folder Kraken grid was
  `display:flex` (auto-opened by an async probe) *behind* the Arrange view, taking 178px + `flex:1`.
  A probe dumping the modal's flex children (`top`/`height`/`display`) exposed it instantly.

Rules:
- When "the control is off-screen," **dump the box geometry of the whole flex chain** (modal → panel →
  trimmer → video → controls): `top`, `height`, `display`, `flex`. The gap tells you who's unbounded.
- **Don't auto-open a heavy sibling pane behind the active view.** Probe Kraken only in Browse;
  guard `autoOpenPin()` against the Arrange view.
- For a focused editing view, **hide the competing siblings** (the strip + bars during trim) so the
  big preview + controls own a bounded box and always fit — far more robust than fighting sticky.

## Meta
The features were the easy part. Budget the time for: (a) a deterministic harness (fresh session +
retry + settle), and (b) bounded layout (cap/flex media, hide competing panes, dump geometry when a
control vanishes). Both are reusable across every future editor feature (audio is next).

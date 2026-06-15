---
title: Rendering JS-driven Claude Design exports zero-loss — use an injected JS clock, not CDP virtual time
date: 2026-06-15
branch: main
---

## The problem

Cody's real Claude Design exports are **JS-driven**: the design's own JavaScript builds and
animates the frames at runtime. The old static intake (parsing `.cr-frame` out of the HTML byte
stream) found nothing in them, and at render time **raw `requestAnimationFrame` count-ups froze**
— the injected counter read one value at every seek time. Hard constraint from Cody: **lose
nothing** — every animation that plays live must play in the MP4, including the count-ups.

## What we tried first (and why it failed)

**CDP virtual time (`Emulation.setVirtualTimePolicy`).** It *does* drive `requestAnimationFrame`
and `performance.now`, so it animated the count-ups deterministically (proven). But it has two
fatal walls for our use:

1. **`<video>` never decodes under virtual time.** Set `video.currentTime`, grant budget, wait in
   real Node time — `readyState` stalls at 1 (metadata only), `seeked` never fires, no frame paints.
   The media pipeline is gated by the virtual clock. (`.tmp/vidtest2.mjs`)
2. **`Page.captureScreenshot` deadlocks** when the virtual clock is paused and the compositor is
   quiet — racy, depends on whether a frame happened to be in flight. A page with a *playing*
   `<video>` kept the compositor alive so it worked; an isolated static creative hung. (`.tmp/matrix.mjs`)

So: count-ups want a controllable clock; `<video>` wants real time. CDP virtual time can't give both.

## The fix that works: an injected JS fake-clock

`creative-engine/shared/raf-clock.js` is injected at **document-start** (via
`Page.addScriptToEvaluateOnNewDocument`, BEFORE the design's scripts run). It replaces the page's
`requestAnimationFrame` / `cancelAnimationFrame` / `performance.now` with a clock **we** hand-crank
per frame (`window.__ceClock.advanceTo(ms)` ticks queued rAF callbacks in substeps).

- The page runs in **real time** → `<video>` decodes + seeks normally (`readyState` 4), screenshots
  don't deadlock.
- The design's rAF/`performance.now` animations are driven **deterministically** by our clock →
  count-ups render the right value at every frame.

This is the timesnap/timecut "fake clock" technique. Proven on BOTH a count-up creative AND a video
creative in one pass (`.tmp/jsclock.mjs`, `.tmp/jsclockvid.mjs`). The CDP virtual-clock module was
deleted.

## Division of labor (each animation class, who drives it)

| Animation | Driven by | Notes |
|---|---|---|
| raw `rAF` / `performance.now` count-ups | the **injected JS clock** | the thing that used to freeze |
| CSS `@keyframes` / WAAPI reveals | **manual `currentTime` pin** in `seek.js` | the JS clock does NOT advance the document timeline — measured |
| `<video>` decode | **manual real-time seek** in `seek.js` | needs real time; that's why we abandoned virtual time |

All three keyed to the same per-frame timestamp.

## Other landmines hit

- **Screenshot must be CDP `Page.captureScreenshot` with an explicit clip rect**, NOT
  `elementHandle.screenshot()` — the latter does a `scrollIntoViewIfNeeded` that awaits `rAF`, which
  our injected clock controls, so it hangs. Pin the frame at fixed `0,0` and clip `{0,0,1080,1920}`.
- **Launch flag `--run-all-compositor-stages-before-draw`** (+ `--disable-new-content-rendering-timeout
  --disable-gpu`) makes `captureScreenshot` deterministic — forces the compositor to run every stage
  before the draw, so there's always a fresh frame to capture. Without it, capture is racy.
- **`seek.js` got a `noRaf` option** for the render path: skip the `requestAnimationFrame` paint-settle
  (it would hang since page rAF only ticks when we advance the clock).
- **`HeadlessExperimental.beginFrame` is gone in new headless** — don't reach for it.

## Frame detection (`creative-engine/shared/frame-detect.js`)

Exports vary wildly in how they wrap creatives, so detect by **size + containment depth**, not class:

- Candidates = elements whose **computed** width/height ≈ 1080×1920. (Computed size ignores
  `transform: scale()`, so a gallery thumbnail scaled to 300px still matches at its authored 1080.)
- The creatives are the **most-numerous cohort at one containment depth**. This cleanly handles both:
  - Campaign B gallery → 10 `.story` creatives (media nested below them, ignored).
  - `.dc.html` contact sheet → 20 creatives nested inside `dc-root`/`sc-host` wrappers (both 1080×1920);
    depth-cohort picks the 20, ignores the 2 lone wrappers above and the media below.
- A naive "outermost wins" grabbed the wrapper and missed all 20. A "≥2 direct children = wrapper"
  rule was too fragile (creatives legitimately hold bg-div + `<video>`). Depth-cohort is robust.
- `isolateFrame` sets `transform: none` to un-scale a thumbnail back to full 1080×1920.

## Where it lives

- `creative-engine/shared/{raf-clock,frame-detect,runtime-retag}.js` — browser-injected, shared by
  editor + renderer (single source of truth, like `apply-overrides.js`).
- `creative-engine/editor/render-live.mjs` — the wired renderer.
- Evidence harnesses: `creative-engine/editor/_out/evidence-{countup,video,dchtml}.mjs` (re-droppable
  test exports; `_out/` and `intake/_in/` are gitignored — 180MB of test clips, not source).

## Still open (next chats)

Editor wiring (#5/#9 — mount the live design, edits survive the JS DOM rebuild) and the standalone
intake packager (#2 — normalize paths / `asset_base` / frame map for arbitrary exports). The
renderer currently loads the on-disk export directly over HTTP (with Range, so `<video>` seeks).

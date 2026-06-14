---
title: ▸ Preview montage flicker at clip cuts — what we tried, why tests passed anyway (STILL UNSOLVED)
date: 2026-06-14
branch: main
status: UNRESOLVED — shipped an improvement, flicker remains. Start here next time.
---

## Symptom (Cody's words)
The ▸ Preview montage player (the `montMode` branch of `renderTrimmer` in
`creative-engine/editor/editor.js`) **flickers/glitches** at clip-to-clip transitions and at the loop
restart. After the warm-clips fix it narrowed to **"only happening after clip 1"** (i.e. when the
first clip hands off to clip 2, and onward), but it is **NOT fixed**. We shipped the improvement
(commit 119729f) and moved on; this file is so the next session debugs faster.

## What we tried, in order (each reduced it but did NOT eliminate it)
1. **Single `<video>` + `video.load()` on every cut** (original). Guaranteed black reload flash —
   `load()` re-decodes from cold each boundary. *Removed this.*
2. **Stacked preloaded `<video>` per src, PAUSED, opacity switch + seek-on-show.** Incoming clip was
   paused → it had to wake + decode its first frame when shown → blank-frame flash "after clip 1".
3. **Stacked `<video>` per src, ALL playing continuously (warm), each looping its own [in,out], pure
   opacity flip, no seek-on-show** (current shipped state, `warmAndLoop()` + `show()`). Cody still
   sees flicker. So warm + opacity-flip is NOT sufficient.

## The real debugging lesson (why we wasted iterations)
**The automated tests went GREEN the whole time while the flicker persisted.** `phase-d-montage-length.mjs`
asserts *proxies* — "no `src` reassigned", "no `readyState===0`", "all videos `!paused` (warm)",
"exactly one `.ce-on`". All true, all passing, **none of them actually look at whether a blank/black
frame appears at the cut.** A green proxy test ≠ visually smooth.

**Next time: assert the SYMPTOM, not the mechanism.** Capture actual pixels across a transition —
e.g. `page.screenshot` (or `canvas.toDataURL` of the stage) every ~16–33ms through one clip boundary,
and assert no sampled frame is near-uniform black / drops luminance vs. its neighbors. If a frame goes
black at the cut, that's the flicker, reproduced in-test. Only chase fixes once the test fails the way
Cody sees it.

## Hypotheses still on the table (try these next, roughly in order)
- **Is it the cut, or the clip's OWN segment loop?** `warmAndLoop()` resets `currentTime = seg.in`
  when a clip passes `seg.out`. That reset happens to the *visible* clip too, and a seek mid-playback
  can hitch. "After clip 1" might actually be clip 1's segment looping, not the 1→2 handoff. Confirm
  which by logging timestamps of (a) opacity switches vs (b) per-clip loop resets vs (c) the visible hitch.
- **Opacity toggling may force a compositor repaint.** Try `visibility`/`z-index` stacking (paint all,
  raise the active) instead of `opacity:0/1`, or a true 1–2 frame **opacity crossfade overlap** so
  there's never a bare swap.
- **Decoder contention:** N simultaneous `<video>` decodes can stress the GPU decoder and drop frames.
  Try limiting to TWO warm videos (current + next-in-timeline) instead of all N.
- **Canvas compositor (most robust known fix):** keep the videos offscreen and `drawImage` the active
  one onto a single `<canvas>` every rAF. Canvas compositing has no per-element swap flash at all.
  This is the standard glitch-free montage-preview technique; reach for it if the above don't land.
- **Reuse the iframe design-canvas driver** (`startMontageDriver`) instead of a second editor-side
  driver — it already plays the montage on the design; consider surfacing THAT inside the preview
  rather than maintaining a parallel player.

## Files
- `creative-engine/editor/editor.js` — `renderTrimmer()` `montMode` branch (`segs`, `warmAndLoop`,
  `show`, `montStep`).
- `creative-engine/editor/editor.css` — `.ce-tr-stage` / `.ce-tr-vid(.ce-on)`.
- `creative-engine/editor/phase-d-montage-length.mjs` — the proxy tests (add a real blank-frame check).

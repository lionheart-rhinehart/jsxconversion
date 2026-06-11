---
title: Editor/render parity + headless-animation pitfalls (animation-aware layer editing)
date: 2026-06-11
branch: main
---

Building "edit a Claude Design motion design as layers AND keep its 7-second motion through
to the rendered MP4" surfaced three traps that each cost real time. Write them down.

## 1. There are FOUR renderers that must agree — change one, check the others
The same design is painted by separate code in separate files, and a change in one **silently
no-ops** if another loads a different source:
- `scripts/westfield-flatten.mjs` — captures the design → `config.json` (geometry + motion).
- `templates/<campaign>/_helpers.jsx` `LayerStack` — the JSX **render** path (→ PNG/MP4).
- `out/editor/editor.html` `renderStage()` — the **editor preview** (its OWN JS renderer, NOT `_helpers`).
- `scripts/lib/layer-config-video.mjs` — the **video** wrapper + the deterministic frame driver.

The bite: `layer-config-video.mjs` hard-coded `HELPERS_PATH = templates/multi-sport-foundations/_helpers.jsx`.
We added motion to the **Westfield** `_helpers.jsx`, rendered, and the overlays were frozen — because
the render loaded the *multisport* helpers. Fix: prefer `templateDir/_helpers.jsx` when it exists.
**Rule:** when you touch how a layer paints, grep all four and confirm which file the path actually loads.

## 2. The headless preview tab FREEZES animation — verify motion via a rendered MP4, not the preview
`mcp__Claude_Preview` runs the page in a hidden/background tab. Browsers throttle `requestAnimationFrame`
to ~0 and freeze CSS animation there (measured: `document.hidden=true`, `rafFramesPerSec=0`,
`getAnimations()[0].currentTime` stuck at 0). So you can confirm an animation is **attached**
(`getAnimations()` lists it) but you **cannot observe it playing**. To actually prove motion: render the
MP4 and inspect frames with ffmpeg at different timestamps (e.g. count-up reads 39% @1.0s, 27% @5.6s).
Don't claim "it animates" from the headless preview — get a real browser (the user) or a rendered file.

## 3. `style.animation` serializes WITH the word "none" — don't reject by substring
Setting inline `animation: cWave 7s ease-in-out infinite` reads back from `el.style.animation` as the
full longhand `"7s ease-in-out 0s infinite normal none running cWave"` — it legitimately contains
**"none"** (the fill-mode) and already bakes in any `animation-delay`. A guard like `!/\bnone\b/.test(anim)`
silently drops every animation. Reject only the exact `anim === "none"`/empty; store the whole serialized
shorthand (delay included). Related: capture `transform-origin` too (gauges grow from `left center`).

## 4. Deterministic render needs the CSS clock bound to `__renderTime`
The renderer steps a virtual clock via `__setRenderTime(t)` far faster than real time, but CSS keyframes +
the count-up rAF driver run on wall-clock → frozen/non-deterministic frames. Wrap `__setRenderTime` (a
sibling to the bg-sync patch) to `pause()` all animations once and seek each `getAnimations()[].currentTime`
to `(t*1000) % perAnimDuration`, and compute count-up values from `t`. Then editor-applied motion and the
MP4 share one clock → deterministic, and a frame at t=5.6s shows the exact phased value.

## Also: server-process staleness
`scripts/lib/*.mjs` imported by the **editor server** (e.g. `aa-renderer.mjs` `chooseRender`) are loaded at
boot — editing them does nothing until the server restarts (it doesn't run `--watch`). But scripts spawned
as a **subprocess per render** (`layer-config-video.mjs`) ARE fresh each run. Symptom: a routing change in
`chooseRender` didn't take until a `preview_stop`/`preview_start`.

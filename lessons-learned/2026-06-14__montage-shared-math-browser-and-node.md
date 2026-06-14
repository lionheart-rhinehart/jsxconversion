---
title: "Shared timeline math across browser + Node + classic-injected scripts — the three traps"
date: 2026-06-14
branch: main
---

# Phase D montage: one math module, three runtimes, three landmines

Phase D put `clipFrames()`/`montageAt()` into a NEW `creative-engine/editor/montage.mjs` that
has to run in three different places at once: the live editor (ES-module `import`), the
headless renderer (`render-frame.mjs` ES-`import`), and the deterministic seek (`seek.js`,
which is injected into puppeteer as a *classic* `<script>`). Getting one file to serve all
three surfaced three traps worth remembering.

### 1. A module imported by the browser must keep its TOP LEVEL Node-free.
`montage.mjs` also owns `buildMontageSource()` which needs `node:child_process`/`fs`/`path`.
If those were top-level `import`s the browser would choke the instant `editor.js` imported the
file. Fix: the top level is pure math only; `buildMontageSource` does `const {spawnSync} =
await import('node:child_process')` INSIDE the function. One file, browser-safe to import,
Node-capable when called. (Same shape the plan demanded; easy to forget under time pressure.)

### 2. A classic injected script can't `import` — hand it a global.
`seek.js` is loaded via `page.addScriptTag({content})` and as a host global; it's an IIFE, not
a module, so it physically cannot `import { montageAt }`. The bridge: `montage.mjs` does
`if (typeof window!=='undefined') window.CEMontage = {clipFrames,montageAt,…}`, and `editor.js`
also copies it INTO the iframe window (`iwin().CEMontage = …`) after each load. seek.js reads
`root.CEMontage.montageAt`, guarded so it no-ops where the global is absent. Don't duplicate the
math into seek.js — that's exactly the preview≠render drift the frame-exact design exists to kill.

### 3. A clip `src` set on a `<video>` resolves against the IFRAME's `<base>`, not the host.
The live driver does `video.setAttribute('src', clip.src)` inside the design iframe, whose
`<base href>` is the *campaign folder*. A host-relative demo path like
`../../campaigns/westfield-100-off/assets/vid/ad2.mp4` resolved wrong there and the clip never
loaded — the live preview silently stuck on clip 1. Origin-absolute (`/campaigns/…`) and Kraken
(`/brand/kraken-cache/…`) paths resolve correctly. Fix was to make the demo library absolute.
General rule: any URL you inject INTO the iframe must be absolute or iframe-base-relative —
never host-page-relative. (And: a "passed" override-bag assertion would NOT have caught this;
only sampling the real `<video>.currentSrc` over wall-clock did — same family as the
2026-06-12 "synthetic events lie" lesson.)

## Meta
The honest montage proof can't use the serialize-live-DOM→render trick (a montage is a live JS
clock, not baked DOM). It needs: a unit test that `montageAt()` cuts on the cumulative
`clipFrames()` sums, a render test that samples the concat PAST a boundary and checks the clip
on screen via independent color fingerprints, and a real-mouse live test that watches the
actual `<video>` cycle. Three surfaces, three proofs.

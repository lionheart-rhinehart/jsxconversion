# Editor-first workflow for template iteration

**Date:** 2026-05-28
**Branch:** main
**Commit:** 497c758

## Context

Build session for `aa-creative-engine` — converting 22 Canva ad templates (Multi-Sport Foundations program) into a programmable creative engine. Started the session thinking "hand-code each template in JSX from the PNG reference." Ended the session having built a drag-drop visual editor because hand-coding was an unrecoverable iteration trap.

## The trap (what we tried first that didn't work)

**Approach A: Hand-code each template in JSX from PNG reference.**

This felt like the obvious path — look at the original PNG, write JSX that recreates it, render, compare, iterate. We spent three rounds on cluster-1 alone (the foundational/youth/program football helmet template) before hitting the wall.

What broke down per round:
- Round 1 — clearly off, "not even close." Wrong corner accents (rotated bars instead of stacked rectangles), no arched text, microscript had a background plate.
- Round 2 — added SVG textPath for arching, drop-shadow for red glow, removed plate. Closer but still wrong. Hairlines were full-width instead of corner-emanating. YOUTH was Anton-in-red instead of script font.
- Round 3 — fixed those. Then discovered: cluster-2 used a DIFFERENT script font, cluster-3 had a wildly different arch, cluster-4 had a BATTI logo, cluster-6 had a TITLE placeholder.

Each cluster turned out to have its own micro-decisions. Scaling that to 22 templates × N iterations each = many tens of hours of "move that 20px right, no a bit more, no down a bit." Both of us reaching the same dead end at different times: pixel-perfect via hand-coded JSX from a flattened PNG is mathematically unreachable. You can only get to "pretty close."

## The pivot

User explicitly chose "Option A: full JSX rebuild, accept 'pretty close' fidelity" after weighing it against:
- Option B (SVG composite using Canva's exported SVG as the design layer — exact fidelity, but text in SVG is outlined as paths and not editable)
- Option C (Canva Bulk Create — Canva's native CSV→PNG system, exact but Canva-owned workflow)

The decision turned on: with so many editable zones (microscripts × 2, title, city name, campaign hook, brand mark across different templates), making "some fields editable, others not" felt more complex than "everything editable but pretty close." Simplicity of the mental model beat fidelity here.

## Why the editor became necessary

Even after committing to Option A, the per-template iteration was still gruelling — every render generated 5-10 "tweak this position" / "tweak that font size" comments. Each cycle = me editing JSX constants, re-rendering, user reloading the compare view.

At cluster-5 the user asked: "Can we make a drag-and-drop editor? It would be 1000x faster."

The math:
- 17 templates remaining × ~5 iteration rounds × 5 min per round = ~7 hours of pure positioning work
- Editor MVP estimate: 4-6 hours

Editor pays for itself within 3-4 templates. ROI was clear. **Lesson: build the visual tool before you start iterating, not after.**

## Editor architecture — what worked

Built across `scripts/editor-server.mjs` (tiny Node http server) + `out/editor/editor.html` (single-page UI).

### Decisions that mattered

1. **Config files separate from JSX.** Each template gets a `cluster-N.config.json` with `media + elements[]`. JSX defines structure and style (line-height, shadows, transforms); config defines data (position, size, text, color). Editor persists by writing JSON; render reads JSON. Clean separation.

2. **Single global drag handler.** First version added mousemove/mouseup listeners inside `attachDragHandlers(box)` — which ran on every re-render. After 6 re-renders, the same drag fired 6 handlers in parallel. Result: jittery, glitchy drag. Fix: ONE global mousemove/mouseup that reads `state.drag = { elId, startElX, startElY, ... }`. Smooth.

3. **No DOM rebuilds during drag.** During mousemove, only update the dragged element's `style.left/top`. Don't re-render the element list, don't re-render the props panel, don't re-render anything else. Update those only on mouseup.

4. **WYSIWYG via live photo + live HTML text overlays.** First version showed the rendered PNG as a faded background underneath the drag handles. Looked janky because the PNG had text+photo baked together — dragging shifted everything visually. Fix: load the raw photo from `media.path` as the background (via a `/templates/...` route on the server), render text overlays as live HTML at config positions. Now dragging shows the actual rendered result with no PNG fakery.

5. **Photo always covers frame via clamped offset (no black edges).** Drag handler clamps `media.offsetX/Y` so the cover-fit photo can't be pulled past its own edges. Scale clamped to min 1.0. Pair with Crop tool for cases that need to actually crop.

6. **Mode toggles should feel like the same view.** First implementation of Crop mode replaced the entire stage with a different UI (photo + crop rectangle, no text overlays). User reported "it's almost like it opens another page." Lesson: tools (Move, Crop) should overlay on the same composite, not navigate to a different view. The crop tool should be a layer on top of the Move view.

7. **Auto-switch to Move on Save+Render from Crop mode.** When user finishes cropping and clicks Save+Render, switch back to Move so they immediately see the cropped composite. Was a UX trap when we left them stuck in Crop mode staring at "is something happening?"

8. **Apply crop on initial photo load, not just on drag.** The `img.onload` handler in Move mode initially did its own naive positioning logic, ignoring `media.crop`. Fix: have onload call the same `repositionPhoto(img)` function that's used everywhere else — single source of truth for "how this photo should sit in the frame."

### Decisions that needed correction mid-session

- **First attempt to "live preview" media drag:** translated the rendered PNG via CSS transform. Caused black edges to appear because the PNG was exactly container-sized and had no overflow to shift into. Had to switch to using the raw photo image (which has natural overflow when cover-fit to the 9:16 frame).
- **First crop initialization:** defaulted the crop rectangle to the full photo. User saw it and asked "why isn't this the frame size?" — they expected a sensible 9:16 starting region they could adjust. Fix: initialize to frame-aspect rectangle centered in the photo.
- **First Move-after-Crop view:** didn't apply the crop, showed the full photo as if no crop existed. Fix: `repositionPhoto` now branches on `media.crop`. Same math as the renderer's `MediaSlot` crop branch.

## Other things worth remembering for next time

- **Canva SVG export ALWAYS outlines text into vector paths.** Tested with Bulk Create field markup — same export, no editable text preserved. Don't waste time trying to extract text from Canva SVG exports.

- **The renderer's font preflight only scans the entry JSX file, not imports.** When templates import font constants from `_helpers.jsx`, those references don't get caught. Workaround: add a `const _FONT_PREFLIGHT = { display: { fontFamily: "'Anton', sans-serif" }, ... }` block to the entry file. Marker pattern.

- **`scripts/inspect-svg-images.mjs` is the right tool for measuring positions of vector image elements in Canva SVGs.** Extracts rendered pixel positions/sizes from `<image>` `<g transform="matrix(...)">` wrappers. Use it first before eyeballing positions from a PNG. (See `templates/multi-sport-foundations/AUTHORING.md` for the workflow.)

- **The renderer's image-load timing is fragile.** `static-react.mjs` waits for fonts.ready + 250ms before screenshot. If a template's `MediaSlot` uses an `onLoad` callback to apply crop styling (which it does), the screenshot might fire before that callback runs. The crop applied correctly in my testing, but it's not bulletproof. Real fix would be to extend the renderer to wait for all images to be `complete` before snapping — requires `/unlock-skills`.

- **Pattern-matching is the failure mode when recreating designs from screenshots.** I kept generating diagonal "racing stripes" for the corner accent because that's what "corner accent" feels like to me. The original was 4 stacked horizontal red/black rectangles. The fix isn't to try harder — it's to LIST EVERY ELEMENT LITERALLY before coding ("4 rectangles, top one red 290×52, second black 260×50, ..."). Documented as anti-pattern in `templates/multi-sport-foundations/AUTHORING.md`.

- **Brand kit photos all have AA/Genesis watermarks baked in.** Per the kit's README. When swapping photos for production, expect the watermark — either crop it out via `objectPosition`, mask it with a colored bar, or use unwatermarked source photos.

## What we shipped

- 5 templates (cluster-1 through 5) — config-driven positions where appropriate
- Drag-drop editor with Move/Crop modes, photo clamping, font-size editing
- `inspect-svg-images.mjs` — SVG image-position extractor
- `inspect-svg-text.mjs` — SVG text-region extractor (incomplete, paths don't cluster cleanly)
- `editor-server.mjs` — local http server backing the editor (GET/POST config, trigger render)
- `out/compare/compare.html` — slideshow comparison viewer for all 22 clusters
- `AUTHORING.md` — per-template workflow documentation

## What's still pending

- 17 more templates to build (cluster-6 onwards)
- cluster-1 through 4 need config refactor to appear in editor dropdown
- Text overlays should show in Crop mode (current limitation — they only show in Move mode)
- Editor MVP missing: undo/redo, alignment guides, multi-element selection
- Renderer should wait for image-load before screenshot (requires skill unlock to fix in `static-react.mjs`)
- Background-removal pre-processing for transparent-photo templates (deferred per user request)

## TL;DR for future Claude

If you're building a creative engine that requires per-element positioning iteration, **build the visual editor early**. Don't iterate JSX constants with the user giving verbal feedback. The editor build takes ~5 hours; it saves 20+ hours across 20+ templates. Architecture: config JSON + JSX renders config + editor mutates config + server persists + render reads config. The trap is "let me just hand-tune a few templates first" — by the time you realize iteration is the bottleneck, you've already spent the editor's build budget on back-and-forth.

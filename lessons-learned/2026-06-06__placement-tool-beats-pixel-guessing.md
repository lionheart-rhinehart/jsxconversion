---
title: When eyeballing/pixel-measuring a placement fails, build a WYSIWYG tool — and make it persist
date: 2026-06-06
branch: main
---

Placing ONE element — the date on the AA birthday graphic — into a tilted, busy "white box" took ~2 hours
of me iterating on rotation/size/position and still getting it wrong. What actually worked, and the traps:

## 1. Pixel-measuring a glyph in a busy region is unreliable — stop trusting it
The date sits in a wedge-shaped white tab bordered by a red torn band (above) and the tilted black polaroid
(below), with a comma + the "J" descender confusing every envelope. My measurements **contradicted each
other** (PCA −8.6° vs cap-line −5.7° vs baseline flipping sign) and I kept "fixing" it in the wrong
direction. Connected-component isolation helped but still merged the glyph into the polaroid. Lesson: when
a region is busy enough that two reasonable measurement methods disagree by >2°, **stop measuring and let
the human place it by eye.**

## 2. The fix: a tiny WYSIWYG drag/rotate/size tool that writes the values back
Built `D:/aa-bday-preview/date-editor.html` + a save endpoint: the real background, the date as a draggable
element styled **identically** to the production `#date`, sliders + numeric inputs for angle/size, a
"Lock & Save" that POSTs `{left,top,rotate,fontSize}` to a JSON the server writes. Cody drags it perfect,
I bake the four numbers into `template.html` verbatim. Minutes, not hours. The human's eye + hands beat my
guessing every time for "does this look right in the box."

## 3. The bug that destroyed trust: an AMNESIAC tool
First version **hardcoded a default seed** (`state = {rotate:-6, …}`) and reset to it on every reload. So:
Cody locked −9.9°, I applied/rendered −9.9° correctly, but when he reopened the tool it showed −6° — and he
(rightly) concluded I'd reverted his work. The render was correct; **the tool's display lied.** Fix: on
startup `GET` the saved JSON and initialize from it, falling back to the seed only if no file exists. **A
placement/editor tool MUST load its persisted state, never silently reset to a default.**

## 4. Verify the RIGHT thing
I "proved" 0.00% pixel-diff between my render and a *replica I rendered* — both with the real font. That
proved nothing about Cody's browser, where the tool's `@font-face` (separate file request) may not have
loaded, so he was placing against a fallback font. Fix: **embed the font as base64** in the tool so the
browser is guaranteed to show the exact final typeface. A "match" proof is only as good as it being the two
things the user actually cares about — here, *his tool view* vs *the render*, not render-vs-replica.

## 5. Also: don't keep machine-local preview/render scratch in `out/`
A parallel chat kept wiping `out/` (it re-renders there), repeatedly deleting my preview server + reference
images mid-task. Moved the whole preview/editor harness to a stable sibling dir (`D:/aa-bday-preview/`).
Relatedly, `render.mjs` moved its PNG with `renameSync` which throws `EXDEV` across drives — use
copy-then-unlink so output can land on any drive.

> Pairs with [[2026-06-05__birthday-template-tilted-design]] and [[2026-06-06__handoff-to-a-project-you-cant-see]].

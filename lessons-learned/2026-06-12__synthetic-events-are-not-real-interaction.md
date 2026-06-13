---
title: "Synthetic dispatchEvent ≠ real interaction — verify editor UX in a real browser"
date: 2026-06-12
branch: main
---

# The editor "passed" every test and was unusable. Here's why, and the rule.

I built Phase A of the creative editor (Canva clicks, free-move, rotate, color, size,
multi-line), verified each with puppeteer, got **SSIM 1.0** render parity, and reported it
working. Cody opened it and **almost nothing worked**: clicking the kicker didn't select
it, dragging a headline flung "Pull Ahead" off-screen and collapsed the whole text block,
double-click "only highlighted," color/size/rotate did nothing.

Two failures, one root cause each:

### 1. Synthetic events lie. Use real mouse input.
My tests did `el.dispatchEvent(new MouseEvent('click'))` and checked the override bag.
That bypasses everything that actually breaks: real `mousedown→mousemove→mouseup`
ordering, the 3px drag threshold, native text-selection, focus, dblclick timing, and
**hit-testing**. With REAL `page.mouse.click(x,y)` the same flows failed. A synthetic
event that "passes" tells you the function runs — not that a human can trigger it.
- Rule: verify any interaction feature by driving it the way a human does — real mouse
  events with real coordinates (`page.mouse`), or a real browser (preview/computer-use).
  An SSIM/override assertion proves the render math, never the UX.

### 2. Full-bleed overlays intercept clicks.
The killer bug: clicking the headline landed on a transparent **gradient overlay `<div>`**
stacked on top of the text (`elementFromPoint` returned a DIV with no `data-edit-id`).
So selection silently failed, and with no selection, edit/color/size/rotate never engage.
Same family as "I had to move the filter to grab the media." Designs layer gradients over
content constantly.
- Rule: selection must resolve the most specific EDITABLE element *under* the cursor
  (`elementsFromPoint` → first `[data-edit-id]` that's text/media), not just `e.target` /
  `closest()` from whatever's on top.

### 3. Absolute-promotion on flow HTML destroys layouts.
"Free-floating move" by promoting one in-flow element to `position:absolute` collapses its
(possibly untagged, bottom-anchored) container and flings the siblings. A height-freeze +
sibling-pin fixed ONE case (dragging the eyebrow) but exploded on another (dragging a
headline span inside an `<h2>`). True free-float on flow-based designs needs a **flatten-
to-absolute** foundation (pin every element once, losslessly), not per-drag promotion.
Interim: a margin nudge is safe (never flings anything off-screen) even if it can't lift an
in-flow element clear of its siblings.

## The meta-lesson
Render fidelity and interaction correctness are **different test surfaces**. We proved the
first and shipped claiming the second. When a feature is something a user clicks and drags,
"done" requires watching a real pointer do it — ideally the user's, or a real-browser
driver — before the word "works" is allowed.

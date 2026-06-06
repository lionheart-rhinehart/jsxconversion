---
title: Reproducing a tilted Canva/Illustrator design as an automation template
date: 2026-06-05
branch: main
---

Built the AA Weekly Birthday automation template (`automation/`): a text-free background plate + live
date/names rendered on top, driven by `render.mjs` (system Chrome headless) from a data JSON. The hard
part wasn't the pipeline — it was reproducing a **slightly rotated** design **exactly**. Lessons:

## 1. Never cover baked-in text on a rotated design — get a clean plate
The source art (polaroid + date strip) is rotated ~4.6°. The first instinct (rasterize the design, then
lay an axis-aligned black box over the old names) **fails**: a straight rectangle's corners protrude past
the tilted polaroid onto the grunge. This had already burned a prior session. The fix: get a **genuinely
text-free export** from the designer (empty polaroid + empty strip) and render the new date/names directly
onto it — **no cover boxes, ever**. When the user gives you a clean plate, use it; don't reconstruct.

## 2. Measure the design off rendered pixels, don't eyeball
The text in the source SVG was outlined (no font names, no coordinates). To match angles/positions, I
**decoded the PNGs in pure Python** (zlib + un-filter — no PIL/ffmpeg needed; ffmpeg pipes to stdout choke
on Windows) and measured: bullet centroids, the polaroid's left-edge slope, the date baseline, the white
strip's vertical room. Every calibration decision came from a number, then a re-render + visual check.
`git-bash /tmp` is invisible to Windows Python — write scratch files into the repo dir, not `/tmp`.

## 3. "Parallel to the edge" ≠ "matches the original text angle"
The original bullets measured ~3.2°, but the **polaroid edge** is 4.6°. Matching the text angle left the
bullet-to-edge gap drifting 62→73px down a 14-item list. The user wanted every bullet **equidistant from
the paper edge** → the bullet column must match the **edge angle (4.6°)**, not the text's. After the fix,
the 13-bullet gap spread was 0.4px. Lesson: when someone says "parallel to the edge," measure the *edge*.

## 4. A rotated text element can fall off its background
The date is on a white strip that **tapers on the right**. At 50px + down-right tilt, the "2026" swung
below the strip into the dark and vanished (dark-on-dark — looked "cut off"). Fix = size it to the strip's
width and raise it so the whole line stays on white. Always check a rotated element against the *room* its
background actually gives it, across the full string length.

## 5. Lock geometry in CSS, make the folder self-contained
Separation that makes it automation-safe: **geometry = CSS in `template.html` (frozen)**, **content = data
injected as `window.BIRTHDAY_DATA` (the only weekly change)**. The geometry can't drift because nothing
edits it. For portability to another project, the killer detail was the **font**: `render.mjs` read it from
the repo's `fonts/` — moved the TTFs into `automation/assets/fonts/` and repointed it, then **proved**
portability by copying the folder outside the repo and rendering successfully. Bundle every dependency
*inside* the handoff folder; verify by running it from a copy with no repo around.

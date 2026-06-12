---
title: Deterministic intake — tag by range-splice, tag-everything + flag-unknowns
date: 2026-06-11
branch: main
---

# Phase 1 (creative-engine v2): how to tag a Claude Design export without harming it

The v1 disease was **AI judgment in a mechanical path** (an AI "figured out" each design's
editable layers → 30 designs tagged 30 different ways) and **lossy rebuilds** (forcing the HTML into a
layer model re-drew the design). Phase 1's cure, proven on real files:

## 1. Splice attributes into the ORIGINAL byte stream — never re-serialize

`node-html-parser` exposes `el.range = [start, end]` (offsets in the source string). To tag an element,
compute `insertAt = range[0] + 1 + rawTagName.length` and string-splice ` data-edit-id="…"` there.
Apply all edits **high-offset-first** so earlier offsets stay valid. Result: the output is
**byte-identical** to the original after you strip the injected attrs (verified:
`stripped === orig`). Re-serializing via the parser (or `outerHTML` in puppeteer) would normalize
quoting/whitespace and risk fidelity — don't. This is the fidelity guarantee the whole rebuild needed.

## 2. "Deterministic" is not the same as "correct" — so tag everything, flag unknowns

A script can be reliably *wrong* on a structure it's never seen. So: **every element inside a
`.cr-frame` gets an id + `data-edit-pos`** (everything is positionable), text-bearing elements also get
`data-edit-text`, media gets `data-edit-media`. Any element whose **tag isn't in the known set is still
tagged but pushed onto a `flagged` list** in the coverage report. The bar is **0 *silent* skips**, not
0 flags — unknowns are made loud, never dropped. On `index.html`: 791 tagged, 0 flagged, 0 skips.

## 3. The canonical input is `campaigns/<slug>/index.html`, and it already holds the variety

That standalone gallery (`.dc.html` minus `support.js`) carried **36 genuinely distinct techniques**
(HUD count-up, clip-wipe, iris letterbox, typewriter, EKG draw, receipt-print, odometer, needle gauge,
…) in one file — enough style diversity to prove consistency. Honest caveat surfaced to Cody: Westfield
is the **only** Claude Design export in the repo, so "≥2 distinct styles, not Westfield-only" was met by
its 36 techniques, not a second campaign. Don't pretend a second source was tested.

## 4. Text has 3 modes; word-split headlines are per-LINE child spans

Claude Design splits an animated `<h2>` into child `<span>`s, one per line (`animation: cWave` +
staggered delay). Tag each line-span as its own text element and link them with
`data-edit-split="<parentId>"` so Phase 2 can re-distribute. Plain text and SVG `<text>`
(`data-edit-mode="svg"`) are the other two modes.

## 5. Brand-kit media: hide from the picker, NEVER strip from the render

"Ignore brand-kit media" means exclude logos/wordmarks from the *swap picker* — flag them
`data-edit-brandkit="1"` — but keep them tagged and rendered. Stripping = broken-image holes. Verified
headless: 0 broken images/videos across 50 imgs + 12 videos.

## 6. Verify the contract against the REAL schema before writing it down

The Kraken handoff doc names `approvals` fields taken from the actual
`D:\Claude CODE\The Kraken\lib\database.types.ts` (status / content_output_id / responded_at /
approved_by_type / client_edited / updated_at) — not guessed. Found the real gap: **no `rendered_at`
column**, so the render poller must own a local rendered-ledger keyed on `(id, updated_at)` to avoid
re-rendering. Keeps Kraken write-only (it only ever sets `status='approved'`).

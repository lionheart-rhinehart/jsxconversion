# Render a Claude Design handoff from its `export/` folder, not the `.dc.html` gallery

**Date:** 2026-06-11
**Context:** Converting Westfield Campaign C (12 selected creatives) to MP4 from a Claude Design handoff.

## What went wrong

A Claude Design "Fetch this design file…" link downloads as a `gzip` **tar bundle** (`.dc.html`
is really a `.tar.gz`). The first bundle I rendered contained the **gallery** files
(`Westfield Campaign C - Review.dc.html`, `… - sharable.dc.html`, the full `…C.dc.html`). I
rendered each creative straight out of the gallery — faithfully — and shipped 12 MP4s.

They were wrong. The user had edited copy **and** media, and the result was an inconsistent mix:
- **Media swaps showed up** — because a swap that reuses the same filename (`ad1.jpg`) changes the
  *file bytes*, which the render picks up.
- **Copy edits did NOT show up** — because copy is **text baked into the gallery HTML**, and every
  gallery `.dc.html` in the bundle (Review, sharable, full C) still carried the *pre-edit* text.
  Filename-changing media swaps were missing too.

The gallery `.dc.html` is a **snapshot that lags the user's edits.** Rendering it faithfully still
produces the wrong creative.

## The fix

The same bundle (from a freshly re-shared link) also contained an **`export/` folder**: 12
**standalone** `NN_<label>.html` files, one per creative, with an `index.html` that literally says
*"Standalone 1080×1920 looping ads **with your edits baked in**. Render each to MP4."* Those are the
source of truth — own `@keyframes`, brand CSS via `../_ds`, media via `../assets`, real `<video>`
where the user swapped to video. Rendering from `export/` produced the correct set.

**Rule: when handed a Claude Design handoff, render the `export/` standalone files. Never the
`.dc.html` gallery.** If there's no `export/`, ask the user to re-share with the export enabled —
don't fall back to the gallery.

## Capability added

`jsx-to-mp4` now renders **animated standalone HTML** directly (the previously-stubbed
`kind=animated`): `.claude/skills/jsx-to-mp4/scripts/animated-html.mjs`. It frame-steps the Web
Animations timeline (CSS `@keyframes` are seekable), syncs each `<video>` to `t mod duration`, and
encodes through the shared BT.709 pipeline. Size + loop length auto-detect (root box; loop = mode of
infinite-animation durations → 7s for the AA master loop), overridable via sibling
`<name>.config.json` or a `data-loop-seconds` root attribute. Just pass the `.html` path to
`render.mjs`; loop the command over a folder for the whole set.

## Also worth remembering

- The handoff README says **read `chats/` and render from the file the user had open** — the
  `open_file=` query param names it. The second link used `open_file=export/index.html`, which was
  the explicit pointer at the right source. Honor that param.
- A 1080×1920 creative inside a gallery is scaled (`transform: scale(0.34)`) for the thumbnail;
  the standalone `export/` version is the un-scaled real thing.

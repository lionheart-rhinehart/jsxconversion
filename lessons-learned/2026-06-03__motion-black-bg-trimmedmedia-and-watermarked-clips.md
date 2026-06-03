# The real motion-black-bg fix (TrimmedMedia), watermarked Kraken clips, and how to verify footage

**Date:** 2026-06-03
**Branch:** claude/angle3-motion-footage-fix

Three findings from finishing angle 3 (`multisport-foundations-more-games`) and chasing the
recurring "motion renders black" bug.

## 1. The black-bg bug was only HALF fixed on main — `TrimmedMedia` was still broken

The deterministic bg-frames pipeline (run-campaign pre-extracts a clip to PNG frames →
`window.__bgFrames` → a stable `<img data-bgframe>` filled per render frame) was fixed for
`SyncedVideo` but **not** for `TrimmedMedia`.

- `SyncedVideo` (animations.jsx) gates the frame-`<img>` on `window.__bgFrames` alone → worked
  (grind-trap A1 showed footage).
- `TrimmedMedia` (brand/video-templates/editing.jsx) gated on `useFrames = isVideo && bf…`. But
  run-campaign signals the frames case by **rewriting the media src to the frames *directory* base**
  (`./E1.bgframes/`), which has no video extension → `isVideoSrc()` is false → `useFrames` false →
  it fell through to `<img src="<a directory>">` → broken image → **black background**. This hit
  EVERY TrimmedMedia template: meet-coach, quote-card, and ~30 others.

**Fix (one line):** `useFrames = !!bf && !!bf.base && bf.count>0 && (isVideo || src === bf.base)`.
Gate on "src equals the frames base," not on `isVideo`. Safe for real static photos (a real jpg src
never equals `bf.base`). Live preview is unaffected (`__bgFrames` is null there).

> LESSON: when a "fix" lives in a shared runtime, check EVERY consumer of the mechanism, not just the
> one you tested. SyncedVideo and TrimmedMedia are two separate components doing the same job with
> different gates.

## 2. Verifying footage: YAVG brightness is necessary but NOT sufficient

There's no brightness-probe script — use ad-hoc ffmpeg:
`ffmpeg -i x.mp4 -vf "signalstats,metadata=print:key=lavfi.signalstats.YAVG" -frames:v 60 -f null -`
Near-0 YAVG = black = failed. BUT a text-on-black card also reads YAVG ~25–40, which *looks* "not
black" while the footage is actually missing. Always **also extract a mid-clip frame and eyeball it**
(`ffmpeg -ss <t> -i x.mp4 -frames:v 1 f.png`). That eyeball is what caught this bug — the probe alone
would have passed it.

## 3. The Kraken Content Library has clips with creator IG handles burned into the footage

3 of ~11 pulled clips had a `@handle` watermarked top-left **in the video pixels** (`@mthompson.33`,
`@colt_.w`, `@auwin2030`) — not a template bug, not in any code (grepping the repo for the handle
finds nothing). `media-dedup.mjs` / `prep-media.mjs` do NOT filter these, so they get pulled silently.
Fix is to extract a raw frame from each candidate clip and eyeball it before committing it as media.
A pull-pool watermark filter is a worthwhile future improvement.

## Also worth knowing

- **Pure-animation video templates expose no media key**, so a `clip` on them is silently ignored
  (run-campaign logs "template … exposes no media key"). These are graphic cards by design:
  `stat-reveal`, `logo-sting`, `two-truths-lie`. Don't try to force footage onto them.
- **The `motionRatio` knob (60/15/25) is aspirational — not enforced anywhere in code.** Both shipped
  angles undershot it (grind-trap 7 motion, more-games started at 5). Rebalancing is manual.
- **Message-over-footage motion templates are scarce in the bank:** really just `fresh-…-A1`
  (line1/line2 hook, 3s) and `velocity-drop` (1-line claim). `manifesto` is 4-line; `coach-lower-thirds`
  is coach-credential only. Hitting a high video share without authoring new motion templates is hard.
- The **static render path injects `config.media` (full-frame bg + scrim) behind ANY template**
  (run-campaign.mjs ~261) — even templates whose own comment says "no photo" (cluster-36/37/34). So a
  text/chart card still carries footage once `asset.media` exists.

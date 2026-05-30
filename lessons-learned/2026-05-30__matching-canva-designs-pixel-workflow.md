# Matching Canva designs faithfully: the pixel-measurement workflow

- **Date:** 2026-05-30
- **Branch:** main
- **Commit:** 70a7769
- **Context:** Built cluster-21 (baseball batter) and cluster-22 (two-panel field
  hockey) from raw Canva SVGs into config-backed LayerStack templates, matching
  the originals within a few pixels.

This is the repeatable recipe for turning a Canva export into a faithful
`cluster-N.config.json`. Five hard-won techniques:

## 1. Get exact rectangles from clipPaths, not from `<rect>`

Canva exports its colored boxes/frames/panels as `<path>` elements, so
`extractBodyRects` (which only returns `<rect>`) misses them. But the matching
**clipPaths in `<defs>`** give the exact rectangular regions in viewBox units.
Multiply by `VIEWBOX_TO_PX` (= 1.333, since the 810-unit viewBox maps to 1080px)
to get pixel geometry. This is how the red panel (x0 y617 w550 h1303) and photo
panel (x570 y617 w510 h1303) were derived for cluster-22.

## 2. Pixel-scan the original PNG for text "bands" — but INSET the scan

Load the original into a puppeteer canvas, scan rows for a color predicate
(`isDark` = all channels <70, `isRed` = r>170/g<90/b<90, `isWhite` = all >200),
and group contiguous rows into bands. Each band gives top/bottom (→ cap height),
left/right (→ width), and center-x. This is the ground truth for every text
layer's size and position. See `.tmp/measure-22.mjs`.

**Gotcha:** scan INSET from any shape edge. Scanning right up against a red
box / photo boundary catches dark photo pixels at the seam and inflates the
measured width / shifts the center. cluster-21's FOUNDATIONAL looked
right-shifted until the scan window was pulled in ~13px on each side.

## 3. Match Canva's ultra-condensed display font with Anton + `scaleX`

Canva's headlines use a Bebas-Neue-like ultra-condensed face. Brand Anton is
the closest licensed display font but renders noticeably wider. The fix:
`transform: "scaleX(0.70–0.78)"` + `transformOrigin: "center"`. Calibrate per
word: drive **cap height** with `fontSize` (Anton cap/fontSize ≈ 0.87) and
**width** with `scaleX`. Scale from a known-good word — e.g. cluster-21's
PROGRAM (fontSize80 scaleX0.72 → w203, cap67) scaled cleanly to cluster-22's
PROGRAM (fontSize147 scaleX0.70 → w361, cap123) by ratioing cap heights then
trimming scaleX to hit the target width. The same scaleX trick works on
JetBrains Mono panel labels (`[TITLE]` needed scaleX0.73 to stop being 37% too wide).

## 4. The scaleX centering gotcha

A single unbreakable word that is wider than its text box overflows BEFORE the
transform, then `scaleX` condenses around center and leaves it visibly
mis-centered. Fix: make the element wide enough to contain the **pre-scale**
text and center that box on the target center. For the big cluster-22 headlines
(pre-scale width ~1100px) the box is `x:-100, width:1280` (center = 540),
`textAlign:center`. Always size for the pre-scale width.

## 5. For PHOTO crops, trust your eyes, not the SVG matrix

Deriving `objectPosition` from the SVG image matrix is unreliable — Canva
combines an image transform with a separate clipPath, and the math led to
"73%" (the background players) when the original clearly showed the main player
at ~45%. **Crop the photo region out of the original PNG, open the full-res
source, and set `objectFit:cover` + `objectPosition` by eye, then tune.** With a
tall-narrow box and a landscape source, `cover` scales to fill height and crops
width only, so `objectPosition` Y often does nothing — only X matters.

## Process checklist

1. Inspect SVG (`.tmp/inspect-NN-detail.mjs`) → images, paths, clipPaths.
2. Geometry of boxes/panels from clipPaths × 1.333.
3. `measure-NN.mjs` (inset scans) → target text bands.
4. Build config; render; re-measure the render with the SAME script; diff bands.
5. Iterate fontSize/scaleX/x-y until bands match within a few px.
6. Photo `objectPosition` by eye against a crop of the original.
7. Side-by-side (`.tmp/sidebyside.mjs`) for the final gut check.
8. Confirm font preflight lists every primary font (Anton + JetBrains Mono).

## Deploy footnote

Before shipping, `git status` surfaced an unexpected `cluster-17.config.json`
diff. It turned out to be an intentional manual edit by the user — but the right
move was to **ask** rather than auto-revert. A working-copy diff that looks like
a regression may be deliberate; never discard changes you didn't make without
confirming. (`out/` is gitignored, so rendered PNGs never enter the commit —
only templates/configs/assets do.)

# Westfield Founding Member — Campaign C (runnable gallery)

Paid-social Creative Matrix for **Athletes Acceleration · Westfield, IN** — the founding-member
offer (first 40 athletes lock in $100 off for life). This is **Campaign C**, the fully
motion-designed cut: 36 creatives (12 message angles × 3 routes A/B/C), each a 1080×1920 story
frame, all animating on a shared 7-second master loop, first-frame-safe.

## How to open it

Just open **`index.html`** in any browser — double-click it, or serve the folder. Everything is
self-contained and relative to this folder:

- `index.html` — the gallery. Click any creative for a full-size lightbox (← / → to flip, Esc closes).
- `assets/` — logo, photos (`img/`), and looping videos (`vid/`).
- `_ds/.../colors_and_type.css` + `fonts/` — the Athletes Acceleration brand tokens and typefaces.

> Videos autoplay muted on loop. A few browsers block autoplay over `file://` until you click the
> page — if a Route-A background looks frozen, click once and it plays. Serving the folder over a
> local web server avoids that entirely.

## What this was built from

This is a standalone build of the Claude Design handoff **`Westfield Campaign C.dc.html`** (kept
here for reference, alongside the design `CLAUDE.md` brief). The only change made to turn the
prototype into a file that runs anywhere: Claude Design's `support.js` runtime was replaced with the
equivalent plain DOM + `requestAnimationFrame` logic (the count-up driver + lightbox), and the
`<helmet>` styles were hoisted into `<head>`. No creative, copy, layout, or motion was altered.

## The 12 angles → ad-copy map

Each row is one approved ad; routes A/B/C are the same message at three media-coverage bands
(A = full-bleed video, B = partial/bounded media, C = no photo media). Labeling is `{angle}{route}`
— `1A 1B 1C 2A …`. The on-image copy is the **hook**; the full approved ad text is the Meta post
body, not baked onto the image.

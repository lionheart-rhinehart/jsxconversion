# creative-engine/intake — Phase 1: deterministic TAG

Turns a finished Claude Design export into faithfully **tagged, editable** HTML — with **no AI in the
path**. A script walks each `.cr-frame` and stamps stable ids; the original byte stream is preserved
(attributes are spliced in via the parser's source ranges, never re-serialized), so the render stays
pixel-faithful.

## Run

```bash
node creative-engine/intake/tag-design.mjs <export.html> [--out tagged.html] [--report report.json] [--check]
```

- `<export.html>` — a Claude Design `.dc.html` handoff **or** the standalone gallery `index.html`
  (`.dc.html` minus the `support.js` runtime — the editable source).
- `--check` — print the coverage report only, write nothing.
- default outputs: `<name>.tagged.html` next to the input + `<name>.coverage.json`.

## What it stamps (per editable element, inside each frame)

`data-edit-frame="fN"` · `data-edit-id="eN"` (stable, document-order) · role flags
`data-edit-text` / `data-edit-media` (`data-edit-media-kind`) / `data-edit-logo` / `data-edit-pos` ·
`data-edit-mode="plain|svg"` · `data-edit-split="eP"` (split-headline line-spans → logical parent) ·
`data-edit-brandkit="1"` (brand-kit assets — kept in render, hidden from the swap picker).

## The non-negotiable: 0 silent skips

Any element whose tag isn't in the known set is **still tagged** (stays positionable) **and surfaced**
in the report's `flagged` list — a script can be reliably *wrong* on an unseen structure, so unknowns
are made loud, never dropped.

## Phase-1 evidence (verified 2026-06-11)

Input: `campaigns/westfield-100-off/index.html` (36 genuinely distinct Claude Design techniques —
HUD count-up, clip-wipe, iris letterbox, word-flip, typewriter, EKG draw, receipt-print, odometer,
needle gauge, pyramid, waterline, map-pin, …).

- **791** elements tagged (text 438, media 61) across **36** frames — **0 flagged, 0 silent skips**.
- **Fidelity:** tagged output is **byte-identical** to the original after stripping injected
  `data-edit-*` attributes.
- **Render:** headless load of the tagged HTML → **0 broken images, 0 broken videos, 0 failed
  requests** (50 imgs + 12 videos). Proof screenshot: `_out/tagged-render-proof.png`.
- **Brand-kit:** 36 logo assets flagged `brandKit` (hidden from picker) while still rendering.

`_out/` holds the coverage JSON + render-proof screenshot. `_probe-render.mjs` is the headless check.

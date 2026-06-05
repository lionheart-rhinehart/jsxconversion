---
title: Location clones reuse media + the brand-gate trips on hex mentioned in NOTES
date: 2026-06-05
branch: main
---

# Cloning a campaign to another location (the Batti Manteno → Gilbert pattern)

When the ONLY change between two campaigns is the location name (eyebrow city),
do NOT rebuild — clone with `scripts/lib/clone-core.mjs` `cloneTarget()`. The
small driver `scripts/clone-batti-gilbert.mjs` is the worked example.

What makes it "only change the name":

- **`location: "<slug>"` drives the eyebrow at render.** `buildEyebrowAnchor`
  (scripts/lib/roles.mjs) reads `data/location.<slug>.json`'s `tags.city`, strips
  the trailing state suffix, and applies `{CITY} SPORT PARENTS`. So
  `location.gilbert.json` (`"GILBERT, AZ"`) → `GILBERT SPORT PARENTS` automatically
  on both statics (fresh-fill) and motion (force-set from the location tier). You
  do NOT hand-edit eyebrows.
- **`mediaPolicy: "reuse"` (the default) leaves `asset.clip/photo` pointing at the
  SOURCE campaign's media.** That's correct and wanted — the clone reuses the same
  footage; the path still resolves (the cache dir already exists). Do not copy or
  rename the media cache.
- **`cloneTarget` resets every asset to `approved` and clears
  `output/thumb/kraken/renderedAt`** so `run-campaign … --all` renders the dest
  fully and a later export is a fresh first-export (no dedup collision — the dedup
  key is the `(campaign, angle, asset)` triple, and the campaign name differs).

### The case-sensitivity trap when cleaning leftover location names

`cloneTarget` only swaps strings you pass in `textSwaps`, and it applies them to
plan `templateData` + edit configs — NOT to copied sidecars (`brief.md`,
`copy-library.json` are `copyFileSync`'d verbatim) and NOT to `_planNotes`. So a
stale `MANTENO`/`Manteno` survives in prose. When you sweep those up, swap **only
upper- and title-case** (`/MANTENO/g`, `/Manteno/g`) — NEVER lowercase
`/manteno/g`, because the lowercase form is in the media/output PATH segments
(`brand/kraken-cache/grind-trap-manteno/…`). Blanket-lowercasing those paths to a
location that has no cache dir = missing media at render.

# Brand-integrity gate false-positives on a hex string in NOTES

`scripts/kraken-export.mjs` runs a brand-integrity scan (`scanBrandIntegrity` over
`gatherCampaignTexts`) that BLOCKS export if it finds AA-red `#c4141d` on a non-AA
brand. It is a **substring scan** — it does not care whether the hex is an actual
color or just mentioned in a comment.

Symptom: `[export] AA LEAK on brand "<franchisee>" — aa-red (#c4141d) in
creative-plan.json` even though every rendered pixel is correctly the franchisee
red (the authoring red `#c4141d` is remapped to the kit red at render via
`palette.mjs`). The trigger was a `_planNotes` string literally documenting the
remap: `"Palette remaps authoring red #c4141d -> Batti #cb0202."`.

Fix the SOURCE, don't reach for `--allow-aa`: strip the stray hex from the note
(`/\s*#c4141d/g` → ``). `--allow-aa` would keep the safety net tripping on every
future export and trains you to ignore it. Only override when you've confirmed a
real leak is actually intended. Verify the rendered bytes are the right red first
(eyeball a frame), THEN clean the note so the gate passes honestly.

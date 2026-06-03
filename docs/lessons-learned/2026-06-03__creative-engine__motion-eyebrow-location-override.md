---
created: 2026-06-03
area: creative-engine
title: Motion eyebrow is force-set from the location tier — videos are not copyable across locations
tags: [creative-engine, location-variants, render, kraken, eyebrow]
---

# Motion eyebrow location-override (per-location campaign variants)

## Summary
Producing per-AA-location variants (Carmel/Milford/Noblesville) of an angle where ONLY the
location text changes. The optimization "render each video once, copy the file into the other
locations" is INVALID for motion, and it silently shipped Carmel's eyebrow into the other
locations' folders before it was caught on visual verification.

## Problem
`run-campaign.mjs` (~line 216, `buildMotionData`) **force-overrides every motion template's
eyebrow-role field** with `buildEyebrowAnchor(tierTags)` = `"<CITY> SPORT PARENTS"`, derived from
the location data tier — overriding whatever `templateData.eyebrow` holds. So:
- Every video with an eyebrow field is location-specific (this includes `logo-sting`/BR1, which
  looked neutral because its `templateData` had no `eyebrow` key — but the TEMPLATE defines one).
- Copying a rendered video from Carmel into Milford/Noblesville bakes in "CARMEL SPORT PARENTS".
- A location with no `data/location.<slug>.json` renders the literal placeholder
  `{city name} SPORT PARENTS` (Milford had no tier).

Compounding it: `kraken-export.mjs` **dedups on (campaign, angleId, assetId)** and SKIPS rows that
already exist, so a plain re-export does NOT replace a wrong upload already in the Content Library.

## Solution
1. Create a `data/location.<slug>.json` (`{"tags":{"city":"<CITY>, <ST>"}}`) for every target
   location. `buildEyebrowAnchor` strips the `, ST` suffix → `"<CITY> SPORT PARENTS"`.
2. Render EVERY motion asset per-location (no copying). Statics are fine to clone+swap because they
   render from their baked `edits/*.config.json` (no cascade re-fill).
3. To replace a wrong file already in Kraken: soft-delete the row first
   (`PATCH content_outputs?id=eq.<id> {deleted_at}` — `findExistingByMeta` filters
   `deleted_at=is.null`), then re-export re-ingests. Stored ids live in `asset.kraken.id`.
4. Verify by extracting a frame (`ffmpeg -ss`) and reading the eyebrow — don't trust the data swap.

## Prevention
- Treat NO motion asset as location-neutral. When cloning an angle to N locations, render all N
  fully; never copy eyebrow-bearing (i.e. essentially all) videos.
- Add the location tier BEFORE rendering, or the eyebrow renders a `{city name}` placeholder.

## References
- `scripts/run-campaign.mjs` `buildMotionData` (eyebrow override) + `scripts/lib/roles.mjs`
  `buildEyebrowAnchor`.
- `scripts/lib/kraken.mjs` `findExistingByMeta` (dedup), `restPatch` (soft-delete pattern).
- Helpers written this session: `scripts/clone-locations.mjs`, `scripts/soft-delete-assets.mjs`.

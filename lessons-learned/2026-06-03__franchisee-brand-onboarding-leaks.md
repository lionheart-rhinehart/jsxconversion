# Onboarding a non-AA brand surfaces 5 latent AA-leak bugs

**Date:** 2026-06-03
**Branch:** main

Registering **SMAA (Southern Maine Athlete Academy)** as the creative engine's first
real non-AA brand (after Jarosh, which was never run through a campaign) exposed five
places where Athletes Acceleration identity was hardcoded or where `asset.media` didn't
actually drive the output. All were invisible for AA (the baked value *is* AA) and only
appear once a different brand runs. All five are now fixed at the root and verified
0-diff for AA. The next franchisee should hit none of them.

## The five bugs (all fixed)

1. **Copy parser — `**Ad type:**` mis-read as an ad-block header.** `splitAdBlocks` in
   `scripts/lib/copy-library.mjs` matched `AD\b` case-insensitively, so the metadata line
   `**Ad type:**` truncated every real ad block and misfiled its copy under `ad-type`,
   `ad-type-2`… Fix: exclude colons from the header label (`[^*:]`) — block headers never
   carry a colon; metadata fields always do.

2. **Copy parser — paren-form `(Archetype: X)` not stripped.** The parser only handled the
   dash form `— Archetype: X`. Added a paren-form branch so alt-hooks come out clean with
   the archetype captured.

3. **Static wordmark leak.** Every clean cluster (cluster-30..43) tags its wordmark element
   `brand`, but the brand tier supplies the name as `brand_name` — they never matched, so
   `applySubstitutions` left the baked "ATHLETES ACCELERATION" text. Fix: alias
   `tierTags.brand → tierTags.brand_name` in `fill-core.mjs` after the tier merge.

4. **Motion corner-logo leak.** `coach-lower-thirds.jsx` hardcoded an AA logo + "ATHLETES
   ACCELERATION" top-left, and `window.__BRAND__` only carried COLOR tokens. Fix:
   `run-campaign.mjs` now injects `brand_name` + `logo_motion` (a per-brand
   `assets/<slug>-logo.png` staged in the motion served dir) into `__BRAND__`; the template
   shows the kit logo (text hidden when a kit logo exists). For a new brand, stage
   `brand/video-templates/assets/<slug>-logo.png`. **Other motion templates with baked AA
   chrome may need the same treatment — audit each one a brand actually uses.**

5. **Static baked-background leak.** Some clusters ship a baked background `image` element
   (cluster-33 `bg_photo`, default an AA Carmel photo). `asset.media` was added as a
   *separate* z:0 layer BEHIND it, so the baked AA photo won. Fix: when a template has a
   baked bg image, REPLACE its `src` with `asset.media` instead of layering behind it
   (`run-campaign.mjs`).

## Process gotchas worth remembering

- **Motion templates leak AA stock defaults for ANY unset key** (e.g. meet-coach `facts` =
  "237 ATHLETES · 12 D1 COMMITS · 8 YRS AT AA"). Set EVERY content key on a motion asset,
  or it shows AA's stock copy. The clean footage-free hook templates are the `fresh-e2e-*`
  set (no AA hardcoding, no guarantee slot) — good for animated-hook GIFs.
- **The static renderer freezes the resolved config** to `campaigns/<c>/edits/<angle>__<asset>.config.json`
  on first render and REUSES it. After changing fill/media wiring you MUST delete the stale
  edits file for affected assets so they regenerate.
- **Replacing an item in Kraken needs a soft-delete first.** The exporter dedups on the
  (campaign, angle, asset) triple and SKIPS re-ingest if a non-deleted row exists. To push
  a re-render, PATCH `content_outputs.deleted_at` on the old id (it disappears from folder
  views AND frees the dedup key), then re-export `--only <ids>`.
- **"Save and Render" in the editor can silently no-op** — confirm a re-render actually
  registered by checking the asset's `editedAt` is set and `renderedAt` is newer, not just
  trusting the click. (Saco B2 looked done but had no `editedAt` until redone.)
- **No clean offer (F-beat) static** exists without a guarantee slot (only cluster-32, which
  would render AA's guarantee on a non-AA brand). An on-creative offer card needs a confirmed
  brand guarantee or a promoted offer template.
- **Placeholder media is fine to ship for review** but flag it: the SMAA campaigns went out
  with 5 reused kit photos; real training media + real fonts (Oswald/Montserrat) are the
  upgrade pass.

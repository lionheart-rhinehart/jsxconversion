# Franchisee creatives: build from scratch, not AA-recolored — and protect Meta variety

**Date:** 2026-06-04
**Branch:** main

## What happened
Spinning up Ideal Sports Performance (ISP) — a franchisee with its own blue/Barlow design system — exposed that large parts of the AA template bank have **AA assumptions baked in**, which leak the moment a non-AA brand uses them:

- **Baked copy** in "fresh-*" motion templates (e.g. grind-trap-A1 rendered "THE TIRED REP ISN'T EFFORT" regardless of ISP's copyRefs). Those templates are campaign-specific, not generic.
- **Hardcoded AA red** on the motion eyebrow pill (`animations.jsx` hardcoded `#c4141d` instead of reading `window.__BRAND__.brand_red`). Fixed this session → now brand-aware (AA unchanged, ISP blue).
- **Guarantee-shaped templates** (stat-reveal, season-clock, static cluster-32) either fail to render or leave a big empty box for a brand with **no guarantee** like ISP.
- **Contaminated source stills** — some Kraken "IG stories" stills are finished social graphics (competitor logos, baked text). Use action **clips** as backgrounds (the runner ffmpeg-thumbnails a clean frame) instead of blind stills.
- **Stale editor `_extras`** from a prior AA session bled an AA caption ("Need A Place To Train This Summer?") onto ISP motion via the running editor-server.

## The takeaway
1. **For a franchisee, build creatives from scratch on THEIR design system** — author config+JSX (static) / Stage component (motion) directly in the franchisee's tokens (color, fonts, scrims, eyebrow). Do NOT reach for AA bank templates and recolor; the baked AA bits leak.
2. **Meta variety is a hard requirement, not polish.** If many creatives share one layout, Meta clusters them as a single creative and throttles reach — defeating the point of a batch. A franchisee needs its OWN deep bank of **distinct layouts** (target ~12–16), not a few archetypes reused. The repetition cap exists for this reason; respect it across the whole campaign.
3. **The flywheel still applies** — each from-scratch franchisee template is promotable into that franchisee's bank, so the next campaign starts ahead.

## Static-fill gotchas worth remembering
- Background must be set as `asset.clip` (not `asset.media`) — the runner only re-applies clip/photo on the existing-edits re-render path, so `asset.media` silently no-ops after the first render.
- Content-role slots are blanked if unbound; to keep a baked factual number on a stat card, give it role `proof` (not `stat`).
- Motion `*_SPEC.fields[]` keys MUST be JSON-quoted — `validate-templates.mjs` `JSON.parse`s that array.
- `rules.<brand>.eyebrowPattern` must match what the fill emits (`{CITY} SPORT PARENTS`) or the city-leak check blocks every static.

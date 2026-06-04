---
title: Brand kit is the single source of truth — enforced in code, not prose (repurpose-campaign build)
date: 2026-06-03
branch: feat/repurpose-campaign
---

# repurpose-campaign — brand kit as source of truth

## Summary
Built `/repurpose-campaign`: take a rendered campaign and spin a variant for a new target
(another AA location, or a franchisee with their own brand kit), changing ONLY the dimensions a
run declares (location / colors / identity / fonts / media / copy). The guiding principle, carried
over from the eyebrow-leak lesson: **nuances that must not be skipped live in code that fails loud,
not in prose an agent can skim.**

## The core principle (what the user insisted on)
> "If I give you a brand kit and it's different than the template, then the template has to change.
> That's the whole point of the template… whatever the brand kit says, that's what needs to be in
> the designs, no exceptions."

Templates/elements/configs carry **no brand identity of their own**. Colors AND fonts (AND logo /
name / url) come from the **active brand kit** (`data/brand.<slug>.json` + a kit folder at
`kitPath`). The bank's literal values are the **authoring baseline + fallback**, so AA renders
byte-for-byte unchanged while any other kit fully overrides.

## What "no exceptions" actually means — the misstep
I initially scoped tokenization to **colors only** and deferred fonts ("motion-only for v1"). That
was wrong: "whatever the kit says, no exceptions" includes fonts. **Lesson: when the user draws an
absolute line, don't quietly carve out the hard part — implement the whole line or surface the
trade-off explicitly and get a decision.** Fonts were closed the same session.

## The mechanisms (each a no-op for AA → 0-diff by construction)
- **Colors — one unified remap** (`scripts/lib/palette.mjs`): rewrites the bank's authoring colors
  to the active kit's at every point a creative is materialized — static fill (`fill-core.mjs`
  `resolveStaticConfig`), motion (`window.__BRAND__` injected into the wrapper by
  `run-campaign.mjs`, read by the tokenized bank `const RED = window.__BRAND__... || '#c4141d'`),
  and clone time (`clone-core.mjs`). Handles hex AND rgb triples inside `rgba()`/gradients (alpha
  preserved). For AA the map is empty → nothing changes.
- **Fonts — aliasing, not source edits** (`scripts/lib/fonts-stage.mjs`): the strict preflight
  resolves a family from `<projectDir>/fonts/<Family>/` before the repo `fonts/`. So stage the
  kit's font FILES under the bank family names ("Anton"/"Geist"/"JetBrains_Mono") for the render,
  then remove them. Every `fontFamily:'Anton'` reference (templates + all elements + configs)
  renders the kit's face — zero source/renderer edits. AA ships no `font_files` → no staging.
- **Guardrail** (`validate-templates.mjs`): a bare `#c4141d`/`#a30f17` that isn't the fallback of a
  `window.__BRAND__` read is a hard error — keeps tokenization non-optional for future bank files.

## Deviations from the plan that were better (and why)
- Plan said *tag 200+ bank config color literals*; configs are hand-formatted, so tagging = a
  fragile, noisy diff. The **fill-time palette remap** achieves the same outcome, covers rgba tints,
  and is AA-safe. Tag the plan's intent, not its letter, when a cleaner mechanism appears.
- Plan said motion `data.brand_red ?? …`; elements don't always receive `data`, so a browser global
  (`window.__BRAND__`) is more robust. Fonts could NOT use a global (the preflight needs literal
  family names) → that's why fonts use aliasing instead. **Pick the mechanism the constraint allows;
  don't force one pattern everywhere.**

## Correctness gates that paid off
- **Footage is never recolored** — verified by eye: a franchisee render turned the brand graphics
  pink but left the red gym wall red (it's footage, not a brand element). Pixel counts alone gave a
  false alarm; the visual check resolved it. **Eyeball the frame; don't trust a color-count heuristic.**
- **No copy-across path** — the orchestrator only ever shells `run-campaign --all`, so a motion
  eyebrow physically cannot leak across targets (the original bug).
- **Pre-flight fails loud** — missing kit/location tier/workspace aborts that target with zero writes.
- **Export replaces, never duplicates** — soft-delete the old Kraken row then re-ingest; verified
  live (push → dedup-skip on re-run → soft-delete+replace → exactly one live row), then fully cleaned
  up (rows + folder + storage blobs deleted via the `DELETE /storage/v1/object/<bucket>` bulk
  `{prefixes}` body — a plain object DELETE returns 400).

## Verification recipe (reusable)
Clone AA→temp (no dims) and AA→temp (franchisee kit), render one static + one motion each, then:
(1) decode to rgb24 and count brand-color pixels, (2) **extract a frame and look at it**, (3) confirm
AA renders identical, (4) confirm the temp/test artifacts and any live Kraken rows are removed.

## References
- `scripts/lib/{palette,clone-core,brand-kit,fonts-stage}.mjs`, `scripts/repurpose-campaign.mjs`
- `scripts/lib/fill-core.mjs` (`resolveStaticConfig` remap), `scripts/run-campaign.mjs` (motion
  `window.__BRAND__` + font staging), `scripts/validate-templates.mjs` (guardrail)
- `.claude/skills/repurpose-campaign/SKILL.md`; `data/brand.athletes-acceleration.json` (token contract)
- Prior: `lessons-learned/2026-06-03__creative-engine__motion-eyebrow-location-override.md`

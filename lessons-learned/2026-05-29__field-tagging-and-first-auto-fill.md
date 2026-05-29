# Field tagging + first auto-fill — name every block, then fill one from data

**Date:** 2026-05-29
**Branch:** main
**Commit:** 0551186

## Context

Build session for `aa-creative-engine`. The unified layer model already shipped: every
drawable is data in `cluster-N.config.json`, rendered by a generic `LayerStack`, editable in
the position editor. This session added the **foundation of the brief→auto-generate endgame**:
give every editable layer a stable *semantic name* (`tag`) that is independent of the text
inside it, then prove a real data→template→render fill pipeline end-to-end.

The motivating insight (the user's): a layer's only human-facing name today is its free-form
`label` ("Microscript") or its content `text` ("{{MICRO - SCRIPTS}}"). Both break down because
**the text changes per campaign** — eventually a microscript field won't contain the word
"microscript" at all. To let the engine answer "which field is the city / the guarantee / the
title?" you must name the *field itself*, not its current contents. This mirrors how GoHighLevel
custom values work: data lives centrally, the design references it by name, and per campaign or
client you change the database, not the design.

## The data model — four distinct strings per layer

| field   | role                                | example              | who sets it |
|---------|-------------------------------------|----------------------|-------------|
| `id`    | React key / editor selection handle | `city_1`, `text_3`   | auto        |
| `tag`   | **semantic binding key (NEW)**      | `city`, `microscript`| user/agent  |
| `label` | free-form UI description (optional) | `City row 1 (solid)` | user        |
| `text`  | current content                     | `PORTLAND`           | user/fill   |

`tag` is a **dedicated new field, not a reuse of `label`** — circles render `label` as their
visible badge, and `label` is descriptive prose, not a clean key. Keeping them separate avoided
a whole class of collisions.

## What worked — three patterns worth reusing

### 1. "Tags are inert" + a 0-diff pixel gate to prove it
The whole safety story rests on one claim: **adding a `tag` cannot change a single rendered
pixel**, because `_helpers.jsx` only ever reads `text`/`fill`/`src` — never `tag`. We didn't
assert this, we *gated* it: render a fresh pre-tag baseline, add all 9 tags, re-render,
pixel-compare. Result: `diffPx: 0, maxDelta: 0`. This is the same self-describing,
verify-don't-assume discipline as the font preflight. Any future "inert metadata" change should
get the same treatment.

### 2. Fill produces a *variant pair in the template dir*, never touching source
`scripts/fill-template.mjs` does NOT mutate `cluster-N.config.json` or `_helpers.jsx`. It emits
`cluster-N.fill.config.json` + `cluster-N.fill.jsx` (a clone of the thin shell with the config
import swapped, **retaining the `_FONT_PREFLIGHT` markers**) *into the template dir* so the
`./_helpers.jsx` and `./assets/*` relative imports still resolve, then renders that. The source
template stays byte-identical. Variants are gitignored (`templates/**/*.fill.*`). This preserved
the 0-diff guarantee on source while still proving the pipeline.

### 3. Cascade resolution, GHL-style: campaign → location → brand → template default
The resolver merges value bundles `{ ...brandTags, ...locationTags, ...campaignTags }` so a more
specific tier overrides a broader one, and **any unresolved tag falls through to the value
already in the config** (the template default). MVP only exercises brand (+ optional campaign),
with location as a no-op layer — but the chain is built so adding tiers later is data, not code.

## The UX trap (what confused the user, and the fix)

First cut of the inline Layers row rendered the **type badge** ("TEXT") in the primary
read position, immediately left of the field name. The user saw `TEXT microscript` and couldn't
tell whether the rename had even worked — the type was sitting where they expected the *name*,
and this layer's old `label` already read "Microscript" so nothing looked changed.

**Lesson: the type of a thing and the name of a thing are different questions, and the name is
the one the user is editing — so the name must win the primary position.** Fix: made the field
name a prominent, obviously-editable bordered text box (the thing you click and type into), and
demoted the type to a small secondary chip *after* it. Implemented the reorder purely in CSS
(`.lyr-chip { order: 2 }`) so the JS append order didn't have to change. Each row now reads
`[ editable field name ]  TYPE  z##` — name first.

When you build an inline editor where one token is editable and others are descriptive, put the
editable token where the user's eye lands first. Don't make them parse "which of these is the
thing I change?"

## Gotchas

- **Config drift from a live editor save invalidated the first baseline.** Mid-session the
  on-disk `foregroundMedia` offsets/scale changed (the user was dragging in the live editor),
  so my earlier baseline was no longer apples-to-apples. Fix: re-render a *fresh* baseline
  immediately before the change you're isolating. If a long-lived editor server is running,
  assume the config on disk can move under you.
- **Inline inputs must `stopPropagation` on `mousedown`/`click`/`dblclick`**, or typing/clicking
  in the field selects/deselects the layer or starts a drag. And do NOT call a full
  `renderElementList()` on each keystroke — it steals focus mid-type. Write `layer.data.tag`
  directly and let the value persist.
- **Empty tag = delete the key**, don't store `""`. Keeps untagged layers truly untagged
  (absent = unaffected by fill), so the "untagged is byte-identical" invariant holds.

## Files

- `out/editor/editor.html` — inline `.lyr-tag` input per Layers row, shared `<datalist
  id="fieldTagList">`, `layerLabel`/`deriveTagDefault`/`slugifyTag` prefer the tag, name-first
  CSS. (Protected-folder-adjacent but editor is tracked source.)
- `templates/multi-sport-foundations/cluster-8.config.json` — worked example, 9 tags seeded from
  existing labels; `label`/`text`/styling untouched.
- `scripts/fill-template.mjs` — NEW. Cascade-resolve onto tagged fields, emit variant, render.
- `data/brand.athletes-acceleration.json` — NEW. Starter brand kit (`{ tags: {...} }`).
- `.gitignore` — ignore `templates/**/*.fill.*` generated variants.

## Verification (all passed)

1. Inline rename persists across save → reload (puppeteer round-trip, no JS errors, config left
   clean).
2. **0-diff** with tags added vs pre-tag baseline (`diffPx: 0`).
3. Auto-fill proof: `node scripts/fill-template.mjs cluster-8 --brand athletes-acceleration` →
   `out/cluster-8.fill.png` shows **FORT WAYNE** in all three city rows (one data field driving
   three layers), **row 1 stays solid, rows 2–3 stay outlined** (shared `city` tag, distinct
   styling preserved), and the font preflight still lists Anton + JetBrains Mono.

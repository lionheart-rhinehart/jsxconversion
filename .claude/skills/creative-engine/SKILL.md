---
name: creative-engine
description: >-
  Take a finished Claude Design export and carry it to delivered, brand-applied creatives —
  intake → edit (one portable editor) → approve (agency/client) → render-on-approval (+ brand
  fan-out) → dispatch (Content Library / Meta). Use when the user runs /creative-engine, hands
  you a Claude Design export to edit/finish, wants to fan a finished creative out to multiple
  brands, send it for approval, or push approved creatives to the content library or a Meta
  campaign. This is the EDITING pipeline (not from-scratch creation).
---

# /creative-engine (v2 — clean rebuild, under active construction)

> ⏳ **Status: being built per the approved master plan**
> `C:\Users\lionh\.claude\plans\so-i-see-that-memoized-parnas.md`.
> Phase 0 (clean room + guardrails) is in progress. Sub-commands below light up as their phases land.
> The old, retired implementation is archived read-only at `creative-engine-v1/` (locked zone
> `creative-v1`) — **reference only, never import from it.**

## What this is

One master command for the **editing pipeline**: a finished Claude Design export goes in; an
approved, brand-applied, dispatched creative comes out. The design's real HTML is the canvas —
edits are deterministic surgical overrides, never a rebuild. Rendering to MP4/PNG happens once, at
the very end, only on approved work.

## Sub-commands (per phase)

| Sub-command | Phase | Does |
|---|---|---|
| `/creative-engine intake` | 1 | Claude Design export → faithfully tagged, editable HTML (ignores brand-kit media) |
| `/creative-engine edit` | 2 | The one portable editor: text / media-swap / drag, override model |
| `/creative-engine manifest` | 3 | Media library: unique ID + slug + tags; select media by meaning |
| `/creative-engine approve` | 4 | Send as live HTML to the portal (agency/client lanes; view-comment ⟷ edit) |
| `/creative-engine render` | 5 | Render-on-approval (pooled queue) + brand fan-out (swap name/color/logo/eyebrow/media) |
| `/creative-engine dispatch` | 6 | Final screen: Content Library folder → Meta queue → schedule |

## Non-negotiables (from the plan)

- **Clean room:** zero imports from `creative-engine-v1/`. Mine it for ideas only; bring code over
  only when it passes a clean test in its new home.
- **Mechanical core:** intake/edit/render are deterministic scripts, not AI guessing. Consistency
  is a tested goal (the bar: many real designs → all correct, every time).
- **One portable editor**, mounted in the review page and in The Kraken portal — same code, toggled
  permissions.
- **Render at the end:** stays HTML/JSX through editing and approval; approval is the render trigger.

Implementation code lives at the project root in `creative-engine/` (not inside this skill folder).

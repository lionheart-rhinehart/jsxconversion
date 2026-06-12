---
name: repurpose-campaign
description: >-
  Take an already-rendered campaign and spin a variant for a new target — another
  AA location, or a franchisee with their own brand kit (colors / logo / name /
  fonts) — keeping the source's copy and structure. Each run ASKS which dimensions
  change (location, colors, identity, fonts, media, copy) and applies ONLY those;
  everything else is held identical to source. Trigger when the user runs
  /repurpose-campaign, or asks to repurpose / adapt / re-skin / franchise / clone
  an existing campaign for another location or brand.
---

# Repurpose Campaign

The front door for adapting an existing campaign to a new target. **You gather the
inputs; the deterministic orchestrator (`scripts/repurpose-campaign.mjs`) does the
mechanical work and owns the order + the hard gates.** Do NOT re-implement render or
export in prose — only build the job spec and invoke the script.

> Why a script owns it: the predecessor session shipped the wrong city's eyebrow into
> three location folders because "render once, copy the video" was prose an agent could
> skim. The correctness nuances now live in code that fails loud (see
> `lessons-learned/2026-06-03__creative-engine__motion-eyebrow-location-override.md`).
> Trust the gates; don't work around them.

## The model

A creative is brand-agnostic; it renders whatever the **active brand kit** says. A kit is
`data/brand.<slug>.json` (identity + color/font tokens) + a kit folder at its `kitPath`.
Kits are registered via **`/creative-engine` intake** — repurpose only *consumes* one.
"Repurpose" = render a cloned campaign under a (possibly different) brand/location, then
export replace-safe. Colors follow the kit automatically (the bank's authoring colors are
remapped to the kit's at render/clone time); for the AA kit that remap is a no-op.

## Absorb a target-led opening (don't loop on source)

Users almost always lead with the TARGET, not the source: *"repurpose this for Pelham"*,
*"make a Jarosh version"*. **Absorb that answer — do not re-ask for the source as if they
said nothing.** From a target-led opening:
- If the target is a **registered brand kit** (`data/brand.<slug>.json` exists) or a **known
  AA location** (`data/location.<slug>.json`), record it as the answer to step 2/3 and move
  straight to picking the source.
- If the target is **NOT registered**, STOP and route to **`/creative-engine` intake** to
  register the kit/location first (colors, logo, name, url, fonts), then resume here.

Source selection is a **single flat pick** from the rendered campaigns — never bifurcate it
into an angle-then-location sub-flow (that two-step loop was the intake failure). One list,
one (multi-)selection.

## Question order (ASK in this sequence; collect, then run)

1. **Source campaign(s)** — list the rendered campaigns under `campaigns/` (those with a
   `creative-plan.json` whose assets are `rendered`) and present them as ONE **multi-select**
   flat list. The user checks one or several (angles are often run as separate campaigns).
   (If they already named the target above, you still ask THIS — the source — here, once.)
2. **Target brand** — the kit to repurpose TO (asked ONCE, applies to all selected).
   Confirm `data/brand.<slug>.json` + `brand/<slug>/` exist. **If the kit is not registered,
   STOP and route the user to `/creative-engine` intake to register it** (capture colors,
   logo, name, url, fonts into the tier + scaffold the kit folder). Never invent a brand
   value. If the target brand is the same as the source (intra-AA location variant), the
   brand dimension is simply not active.
3. **What's changing** — multi-select the dimensions (asked ONCE, applies to all):
   `location`, `colors`, `identity` (logo/name/url), `fonts`, `media`, `copy`
   (**copy defaults to KEPT** — the guarantee rides along as copy unless `copy` is checked).
   Fire per-dimension follow-ups ONLY for what's checked:
   - **location** → city slug; ensure `data/location.<slug>.json` exists, **offer to create
     it** (`{"tags":{"city":"<CITY>, <ST>"}}`) — a missing tier renders a `{city name}`
     placeholder.
   - **colors / identity / fonts** → confirm the target kit (already collected in step 2).
   - **fonts** → if checked AND any selected campaign has statics, **warn** that static font
     tokenization is deferred (motion picks up the new face; statics keep the bank face).
   - **media** → reuse source / replace from the franchisee's Kraken workspace / per-asset.
     For replace/per-asset, pull the franchisee's media (kraken-pull) and build an
     `assetId → local path` map.
   - **copy** → keep verbatim, or swap specific units (then re-run `verbatimGuard`).
4. **Per selected campaign** (offer a "same for all" shortcut on each):
   - **Destination name** — propose `<src>-<brand-slug>` (or `<src-base>-<city>` when location
     is the change) and let the user **confirm/edit** it.
   - **Source folder** — media source (Kraken workspace + folder), for the chosen media policy.
   - **Destination folder** — the target Kraken workspace + folder to export into (each maps to
     its own, e.g. ANGLE 1/2/3).
5. **Write the job spec, dry-run, render proofs, REVIEW, then publish.** Build `<spec>.json`
   (schema below), run `--dry-run` and show the user the set (clone plan, would-render count,
   inherited guarantee text, Kraken rows that would be REPLACED). On confirm, **render proofs
   only** (`--render-only`) — clone + render + verify, NO export. Point the user at the review
   page for the dest campaign(s) to check the real pixels and approve. **Only after they say go**
   do you publish (`--export-only`). Approval gates the outward push, never the render.

## Building the job spec

Write a JSON job spec and pass it with `--job`:

```json
{
  "brand": "<target-brand-slug or null>",
  "dimensions": ["location","colors","identity","fonts","media","copy"],
  "targets": [
    {
      "source": "more-games-carmel",
      "dest": "more-games-velocity-sports",
      "location": "fishers",
      "textSwaps": [{ "from": "CARMEL", "to": "FISHERS" }],
      "media": { "policy": "replace", "map": { "A1": "brand/kraken-cache/velocity-sports/drill-1.mp4" } },
      "workspace": "velocity-sports",
      "destFolder": "ANGLE 1"
    }
  ]
}
```

- `brand` is required when `colors`/`identity`/`fonts` are active (the orchestrator validates
  the kit and aborts if incomplete). The brand-name wordmark swap is added automatically from
  the source vs target tiers — you only add `textSwaps` for things the orchestrator can't
  infer (e.g. a city token like `INDIANAPOLIS`/`CARMEL` → the new city).
- `media.policy` is **required — there is no silent default**. `reuse` keeps source clips/photos
  (rejected on a brand change unless you also set `"allowSourceMedia": true`, since reuse would
  ship the source brand's footage); `replace`/`per-asset` binds `media.map[assetId]` paths you
  pulled from the franchisee workspace (a map is required — the run stops-and-asks if it's empty).
- `textSwaps[].from` may be a plain string (matched literally, global) — the orchestrator
  handles the color remap and brand-name swap itself.

## Run

```
node scripts/repurpose-campaign.mjs --job <spec>.json --dry-run        # show the set, no writes
node scripts/repurpose-campaign.mjs --job <spec>.json --render-only    # clone+render+verify; STOP for review
#   … user reviews + approves the dest campaign on the review page …
node scripts/repurpose-campaign.mjs --job <spec>.json --export-only    # publish approved proofs (replace-safe)
```

The orchestrator loops each target through hard gates — **pre-flight** (active-dim data must
resolve, else abort that target with zero writes), **clone+swap**, **render every asset via
`run-campaign --all`** (no copy-across path → no eyebrow leak), **verify** (rendered count ==
source count, files on disk), then — **after a review stop** — **export replace-safe**
(soft-delete the old Kraken row, then re-ingest), **report**. `--render-only` stops after verify
(the review stop); `--export-only` resumes at publish. A bare run (neither flag) still does the
whole chain for back-compat, but the **two-phase render→review→publish flow is the default you
drive**. All-or-nothing per target, idempotent (re-run replaces), ends with a per-target report.

## Non-negotiables (the script enforces; don't fight them)

- A target never renders without its active-dimension data (kit / location tier / workspace).
- Every asset is rendered fully per target — there is NO copy-across-targets path.
- **Review before publish**: render proofs, let the user approve, THEN export. Approval gates
  the outward push, not the render (`--render-only` → review → `--export-only`).
- Re-export REPLACES (soft-delete then re-ingest); it never leaves a stale creative.
- **Media is a required decision** — the orchestrator refuses a silent `reuse` on a brand change
  (it would ship the SOURCE brand's footage). Pull the target's own media, or set
  `allowSourceMedia:true` to knowingly reuse.
- The export runs a **brand-integrity gate** — AA red / wordmark / assets on a non-AA brand block
  the publish (AA people/proof are flagged to confirm-or-swap).
- Colors follow the active kit everywhere; the AA kit is unchanged by construction.

---
name: compose-creative
description: >-
  Compose a brand-new, on-brand static or motion creative from scratch when no
  bank template fits — author a config.json + thin JSX (static) or a Claude
  Design Stage component (motion) on brand rails, in the same shape the template
  bank uses, so a good result can be promoted into the bank. Trigger when
  /creative-engine marks an asset source:"fresh", or the user asks to design a
  new creative from scratch rather than fill a template.
---

# Compose Creative (fresh generator)

Produce a NEW creative that doesn't exist in the bank, on brand rails, in the
bank's own file shape so it is **promotable**. This is invoked per-asset by
`/creative-engine` for `source:"fresh"` assets, or directly by the user.

## Brand rails (non-negotiable)
- **Read the ACTIVE brand's `<kitPath>/DESIGN.md` first** — the design-constraint
  layer (visual theme, ROLE-labeled colors, typography, placement laws, component
  specs, do's/don'ts). Resolve the slug from the campaign's recorded brand —
  `plan.brand` in `creative-plan.json` (canonical: `run-campaign.mjs` does
  `const brand = plan.brand`); if a campaign hasn't recorded one, default to the
  single registered brand in `.claude/skills/creative-engine/config.json` (today
  `athletes-acceleration`) — **never hardcode AA** (a solo-franchisee workspace must
  resolve to ITS brand). Then `<kitPath>` from that `data/brand.<slug>.json` (e.g.
  `brand/aa-design-system/DESIGN.md`). **If that `DESIGN.md` is absent** (a brand
  registered before the generator existed), run `node scripts/gen-design-md.mjs` to
  create it, then read it — do NOT silently fall back to AA's `#c4141d`/Anton.
- Colors/type/voice come from that DESIGN.md / the brand kit — **pull every color and
  font from it, never hardcode** (AA's `#c4141d` + Anton/Geist/JetBrains Mono is just
  AA's default; franchisees differ — e.g. ideal `#2573b7`, smaa `#017ee6`). Then the
  kit's `project/README.md` **if present** for anything `DESIGN.md` marks TODO.
  **No emoji, no exclamation points. Guarantee verbatim** (per the active brand's DESIGN.md).
- 1080×1920 vertical. Respect safe zones (keep key text within ~8% margins; avoid
  the bottom ~270px where platform UI sits). Ensure text legibility over photos
  (scrim/overlay where needed). **Never** place text the user must later move to
  read — compose it correctly the first time, but expose every value as data so
  the user can still tweak in the editor.
- **Follow `docs/creative-playbook.md`** (the canonical rulebook). Place roles by the beat's
  recipe + placement laws: hook in the top third (a lone cold hook → anchor it in the lower
  third over the gradient, not floating mid-frame), proof in the first half, offer/guarantee/cta
  in the bottom band, eyebrow as a **legible chip** (not thin mono over a busy photo). **Motion
  authoring rules** (hard-won): author **vertical-native** (fill the 1080×1920 frame, don't drop a
  square layout in); call **`useTime()` INSIDE `<Stage>`** (in a child component — calling it in
  the Stage host returns t=0 and everything renders invisible); give **every** text an explicit
  `color`; captions carry the whole message (mute viewing).

## Example-guided (the generation contract — Track A)
`/creative-engine` selects an EXAMPLE for this asset (via `scripts/lib/example-select.mjs`) and stamps
`asset.exampleId` + `asset.archetype` before invoking you. Build **guided by that example**:
- Read the example's `sourcePath` `.jsx` (look it up in `templates/_example-index.json` by
  `asset.exampleId`) as the **structural reference** — same archetype / layout family — and its
  `renderedImagePath` for the visual target. You are building *"a creative shaped like this example,
  with THIS copy + THIS brand kit"* — NOT copying it: brand pours from the kit/`DESIGN.md`, copy comes
  verbatim from the copy-library.
- **Media per the measured rubric** (`docs/media-integration-findings.md`): **no full-bleed** photo/video
  on a graphic design; give media large presence ONLY via a knockout **CUTOUT** on a color field or a
  ~45% **SPLIT-panel**; contained accent media **≤ ~20%** of the frame (varied position, never a
  full-width same-position band); **footage diversity is mandatory** (never reuse a clip); facility
  imagery diversifies. (This rubric is GUIDANCE — it is not gated yet; compose to honor it.)
- If this asset has **no `asset.exampleId`**, STOP and tell the engine to run its select step — the
  compliance gate blocks an unbound fresh creative (`exampleBinding`).

## Must pass the compliance gate
The fresh asset is validated like any other: after composing, `validate-plan.mjs` checks the
rendered bytes and **blocks** on no media, non-verbatim persuasive copy, missing/wrong eyebrow city,
emoji/exclamation/banned words, a paraphrased guarantee, or non-9:16. Compose to pass it the first
time (real media placed, copy bound to the copy-library, guarantee verbatim). For drag-positioning,
wrap each editable text node in `<TplText field=… data=…>` (see `did-you-know.jsx` for the pattern)
so the result is editable in the review page's Position tab.

## Output shapes (match the bank exactly)

### Static (the common case)
Emit a pair into `templates/multi-sport-foundations/` (so `./_helpers.jsx` and
`./assets/*` resolve), named `fresh-<campaign>-<angle>-<assetId>`:
- `<name>.config.json` — the data-driven layer model: `{ width, height, media?,
  fixedDesign[], elements[], foregroundMedia? }`. Each editable text layer carries a
  semantic `tag` **plus a copy-role header — `role` (one of the 13 in
  `scripts/lib/roles.mjs`), `accepts` (other roles the slot can hold), and `maxChars`** — so
  the role-aware fill lands copy correctly and the result is promotable into the role-aware bank.
  Validate JSON before writing.
- `<name>.jsx` — the thin shell, **with `_FONT_PREFLIGHT` markers** (else fonts
  silently fall back to sans-serif), importing the config and rendering
  `<LayerStack config={config} />` via `./_helpers.jsx`.
- Render: `node .claude/skills/jsx-to-mp4/scripts/render.mjs <name>.jsx` → PNG.
- **Do NOT include `<Stage>`, `useTime`, or animation-hint substrings** in a
  static file — the renderer's classifier routes anything containing them to the
  video path. Keep statics free of those tokens.

### Motion (video/gif)
Emit a Claude Design Stage component into `brand/video-templates/templates/` (so
`animations.jsx` + `elements/*` are siblings), shaped like the existing bank
templates: a `function XReel({ data })` that reads `data.*` with `?? default`
fallbacks, plus `window.XReel = XReel` and an `X_SPEC = { fields: [...] }` **where every
field carries a `role` (one of the 13 in `scripts/lib/roles.mjs`)** — so the planner's
role-fit selection (`templates/_role-index.json`) and the role-aware fill both see it —
so the gallery + tweaks panel can drive it. Per-asset copy arrives via
`window.__CONFIG__` (the renderer injects it). Register the window global or the
renderer throws.

**Keep the `data.<key>` reads and the `X_SPEC.fields[].key` list in sync** — those
keys ARE the template's public contract. The campaign planner targets them via the
asset's `templateData` object, and the runner extracts the real keys from the
`data.<key>` reads to validate. A field the component renders but doesn't expose as
a `data.<key>` read can never be filled, so every fillable slot must read from
`data`.

## Process
1. Read the asset spec (concept, headline, microscript, photo source, beat) and
   the relevant `campaign-knowledge.json` entries.
2. Resolve the image: library/client path, or a JSX-rendered sub-asset. Stage any
   external image into a sibling `assets/` before render so relative `src` works.
3. Compose the file(s) per the shapes above.
4. Render; if it fails on fonts, drop the real font into `fonts/<Family>/` (per
   the font-preflight contract) — never substitute silently.
5. **Set `asset.template = "fresh-<campaign>-<angle>-<assetId>"`** on the plan via the editor-server
   single-writer `/plan` route (the basename of the files you just wrote) — this is what makes
   `renderFresh` dispatch and what both the compliance gate and the renderer resolve from.
   **Single source of truth:** do NOT *also* hand-write a `campaigns/<c>/edits/<angle>__<asset>.config.json`
   — let the gate AND the render both FILL from `asset.template` so they validate and render identical
   bytes (writing both risks a split-brain where the gate passes one thing and the render produces another).
6. Hand the output path back to the runner / show it on the review page.
7. **Prove ONE before scaling** a batch of fresh assets — get the user's eyes on
   the first fresh creative's quality before generating the rest.

## Promotion (flywheel)
If the user approves a fresh creative, offer to rename it from the
`fresh-<...>` scratch name into a permanent bank entry (a numbered `cluster-*` for
statics, or a named `templates/*.jsx` + `*_SPEC` for motion) and remove the
campaign-scoped prefix, so the next campaign can reuse it.

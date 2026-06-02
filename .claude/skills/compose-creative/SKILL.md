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
- Read the brand kit first (e.g. `brand/aa-design-system/project/README.md`).
- Colors/type/voice from the kit. Brand red `#c4141d`; Anton (display), Geist
  (body), JetBrains Mono (mono/metrics). **No emoji, no exclamation points.**
  Guarantee verbatim.
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
5. Hand the output path back to the runner / show it on the review page.
6. **Prove ONE before scaling** a batch of fresh assets — get the user's eyes on
   the first fresh creative's quality before generating the rest.

## Promotion (flywheel)
If the user approves a fresh creative, offer to rename it from the
`fresh-<...>` scratch name into a permanent bank entry (a numbered `cluster-*` for
statics, or a named `templates/*.jsx` + `*_SPEC` for motion) and remove the
campaign-scoped prefix, so the next campaign can reuse it.

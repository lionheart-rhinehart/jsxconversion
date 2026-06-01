# Handoff — Copy-role schema (for parallel sessions)

> A session built the **copy-role schema** in this repo. This doc tells another session
> what it touched, the stable contracts, and where edits are likely to collide.
> **Git state:** work is on branch `copy-role-schema` (switched off `main`), 2 commits,
> PR #10 open (not merged). Both sessions share the working tree, so these files are already present.

## What it does
Separates a text slot's marketing **role** (hook / proof / offer / …) from its visual
**treatment**, and joins campaign copy → slot **by role**. Replaces the old static
tag-heuristic and the motion regex guess, and fixes the duplicate-`tag` collision (two
`headline` slots can now hold different copy). Configs/templates **without** a `role` fall
back to the old behavior (back-compat). See `docs/creative-playbook.md` for the rulebook.

## New files (stable contracts — import these, don't reimplement)
- **`scripts/lib/roles.mjs`** — `ROLES` (closed 13-string enum), `LOCKED_ROLES` (`['guarantee']`),
  `GUARANTEE_TEXT` (the verbatim guarantee — use this, never hardcode the string),
  `roleFromKnowledgeRef()`, `BEAT_HEADLINE_ROLE`, `beatLetter()`, `fieldRole(name)`.
- **`scripts/lib/assemble.mjs`** — `assemble({ slots, copyByRole, explicit }) → { bySlotId, warnings }`.
  Governed join: explicit target → default-role match → `accepts` fallback; skips `locked`;
  warns (never truncates) on `maxChars`. Returns an **id-keyed** map.
- `scripts/{annotate-roles,annotate-video-roles,retune-maxchars}.mjs` — one-time migration
  scripts, already run, idempotent.
- `docs/creative-playbook.md` — the rulebook. `campaigns/playbook-validation-aa/` +
  `brand/video-templates/fullarc-validation.jsx` — throwaway validation samples.

## Modified files — what changed (preserve if you edit these)
- `scripts/lib/fill-core.mjs` — new exports `applyById`, `buildCopyByRole`; `resolveStaticConfig`
  branches to the role-aware path (via `assemble`) when a config's text slots carry `role`,
  else the legacy tag path.
- `scripts/run-campaign.mjs` — `buildMotionData` else-branch role-routes via `assemble` over
  `fieldRole(dataKey)` (regex kept as final fallback). Explicit `templateData` still wins.
- `scripts/editor-server.mjs` — `/campaign-values` now also returns a `byRole` pool (alongside
  `byKey` / `microscript` / `headline` / `all`).
- `out/editor/editor.html` — `valuesForTag(el, vals)` now takes the **element** (was a tag
  string) and prefers `vals.byRole[el.role]`.
- `brand/video-templates/review.html` — `valuesForKey(field, vals)` now takes the **field
  object** and prefers `vals.byRole[field.role]`.
- `templates/multi-sport-foundations/cluster-*.config.json` (19 files) — every text element
  gained `role`, `accepts` (roles it can hold), `maxChars`.
- `brand/video-templates/templates/{stat-reveal,quote-card,coach-lower-thirds,logo-sting,meet-coach}.jsx`
  — each `*_SPEC.fields[]` entry gained a `role`.

## Slot data shape (now expected on text elements)
`{ id, role, accepts:[...], maxChars, locked?, tag, text, …visual }`. `role` ∈ the 13 in
`roles.mjs`. Fill happens by **id** (`applyById`), not by tag.

## Most likely collisions
- A parallel session is editing `.claude/skills/jsx-to-mp4/scripts/render.mjs` +
  `static-react.mjs` — the schema does **not** touch those, but depends on them still rendering
  the layer-model config (`elements` / `fixedDesign` / `media`) and the Stage runtime exactly as
  before. Don't change the config shape they consume.
- Editing `fill-core.mjs`, `run-campaign.mjs`, `editor-server.mjs`, `editor.html`, `review.html`,
  the `cluster-*.config.json`, or the 5 video `*_SPEC`s → conflicts with PR #10. Rebase against
  branch `copy-role-schema` (or merge #10 first).
- **e2e campaign rendering:** statics now route copy by role (cluster configs carry roles).
  Planner `templateData` keyed by tag still works (mapped tag→id, explicit wins), but anything
  relying on the *old* duplicate-tag double-fill behaves differently. New templates added
  *without* `role` use the legacy path — safe.

## Follow-ons not yet in code (documented in the playbook)
`beat:null`, media-as-role, a `carousel` format, and the "1 dominant + ~2 supporting" role-count
model are described in `docs/creative-playbook.md` but not enforced in code.

# FIX: make every creative on the review page actually editable

> This is a **bug-fix / new-capability plan**, NOT the pipeline we already built. The pipeline
> (plan → review → background render) is done and pushed. This plan fixes the **3 specific things
> that broke when you tried to edit creatives on the review page** — nothing here re-does prior work.
>
> _Saved from the plan-mode draft so it isn't lost. Not yet approved/executed._

## The 3 problems you hit (root cause confirmed in code)

1. **Static "Edit" opens the wrong content.** Clicking Edit on F3 loaded the *source template*
   (cluster-12, the "Microscript" placeholder) — not F3's actual campaign creative. Cause:
   `review.html:250` opens `/editor#<template>`, and the runner *deletes* the filled variant after
   render (`run-campaign.mjs:175` `keepVariants=false`), so the campaign version doesn't even exist
   to edit. **→ Parts 2,3,5: persist a per-asset config; point Edit at it.**
2. **Clicking "Changes" makes the static vanish.** Cause: `review.html` `previewHTML()` only shows the
   creative when `status === "rendered"`; flipping to `changes` reverts the card to the placeholder.
   Review status and render output are wrongly coupled. **→ Part 1 (quick fix).**
3. **Video "Edit" is blocked entirely.** Cause: `review.html:251-254` only wires Edit for `cluster-*`
   statics; video/fresh hit the "editing comes with the embed phase" alert — that phase was stubbed.
   **→ Part 4: build the video edit modal (copy / clip-photo / audio / template-swap).**

**Your intent:** one polished app where *everything* can be edited in place; **hand edits are
authoritative** (persist + survive re-render); video editing = copy + clip/photo + audio + template-swap.

## Scope decisions (locked with user)
- **Static editor = embedded iframe** in a review-page modal (the "one place" feel), not a new tab.
- **Fresh ([F]) assets = copy-edit only this round.** Their Edit modal edits copy/plan-fields (saved
  via `/plan`); the card shows a clear **"fresh render pending"** state. No fresh rendering until
  `compose-creative` is built (deferred). 11 template assets are fully editable+renderable now.

## Walkthrough findings folded in (from the dry-run)
- **Part 1 fix is `previewHTML` keying on `a.output || a.thumb`, not `status`** (review.html:174-182).
- **`editor.html:956`** uses `/out/<cluster>.png` **only as the crop-mode background reference** —
  repoint to the campaign output path for camp assets (non-fatal if missing; move/text unaffected).
- **Do NOT reuse the gallery's `useTemplateEdits` (localStorage) or its dataURL/blob image drops** —
  neither reaches the headless renderer. Bind forms to `templateData` (persisted via `/plan`); pickers
  must yield **real served paths**.
- **Atomic writes** (temp+rename) for `/campaign-config` first-fill and `/plan` patches.
- **Audio persists but renders silent** (mux deferred) — label it in the UI so it's not read as a bug.
- **Edit-vs-render staleness:** POST routes stamp `editedAt`; runner stamps `renderedAt`; card shows
  "re-render needed" when `editedAt > renderedAt`.
- **Template-swap remaps field keys** explicitly (carry best-match, clear the rest) — never silent loss.
- **Single-asset renders** patch the plan *through* the single-writer `/plan` route to avoid races.

## 2am-review hardening (load-bearing — must be honored)
- **B1 (data-loss): Parts 2+3+5 ship in ONE commit, runner reads the edits file FIRST.** Currently
  `run-campaign.mjs:175-178` always re-fills + deletes the variant. If edit-persist lands before the
  runner is taught to read `edits/<angle>__<asset>.config.json`, the next batch render silently
  overwrites hand edits. Non-negotiable ordering.
- **B2 (divergence): one fill path.** `/campaign-config` GET first-fill WRITES the edits file; the
  runner RENDERS FROM that file (never re-derives). Editor preview and rendered PNG can't disagree.
- **B3 (blank preview): review.html is served ONLY from :5599.** Its video modal loads template
  `.jsx` same-origin; editor-server's `/templates/` is guarded to `multi-sport-foundations`
  (`editor-server.mjs:264-268`) and won't serve `brand/video-templates/templates/`. Document the
  :5599 requirement; the modal references `templates/<t>.jsx` relative to the page.
- **B4 (stale card): cross-origin needs postMessage.** Static edit = `:5599` page → iframe
  `http://localhost:5173/editor#camp:…` (cross-origin → no DOM access). Add `window.postMessage`
  `{type:'camp-rendered', id}` to `editor.html` `doSaveAndRender` (~2087); review.html listens and
  refreshes that card. Without it the thumb never updates after an edit.
- **B5 (blank editor): fix the init gate.** `editor.html:2135`
  `if (initial && r.clusters.includes(initial))` drops a `camp:` hash — add a camp-id branch in init
  too, not just in `loadCluster`/the 3 I/O fns.
- **B6 (cross-asset bleed): do NOT reuse `useTemplateEdits` localStorage** (keys by `spec.id`,
  editing.jsx ~80) — E1 & E2 share `stat-reveal` and would clobber each other. Drive the lifted
  `EditPanel` with our own state object keyed by **asset id** (`campaign:angle:asset`), persisted via
  `/plan`. (editing.jsx has no imports — React global only — so lifting it is clean.)
- **B7 (renders old copy): await the `/plan` patch before `POST /render-asset`** — the runner reads
  the plan from disk at start.
- **B8 (preview lies about framing): preview through the SAME 9:16 wrapper** the runner builds, not the
  template's native aspect (stat-reveal is 1:1 → would mislead).
- **B9:** `editor.html:965` crop-mode background falls back to `/out/<cluster>.png` → 404 for camp ids;
  repoint to the campaign output path (move/text unaffected; crop degraded if missing).
- **B10:** staged swap clip/photo must land in a TRACKED dir (`campaigns/<name>/assets/`), never
  `out/`/`.tmp/` — the edits file references those paths and must survive a clean checkout.
- **Babel order in review.html:** add scripts as `editing.jsx → animations.jsx → elements/* →
  templates/*` (gallery order, 878-883) or `Stage is not defined` at mount.

## Build & commit ordering (per B1)
1. **Commit A (independent, safe):** Part 1 display fix.
2. **Commit B (atomic — all three together):** Part 2 routes + Part 3 static editor + **Part 5 runner
   reads edits file**. Shipping any subset risks clobbering edits (B1/B2).
3. **Commit C:** Part 4 video modal.

## Build parts

### Part 1 — Fix the two display bugs (review.html; quick, unblocks immediately)
- **Decouple preview from status:** `previewHTML(a)` shows the rendered media whenever `a.output`
  (or `a.thumb`) exists, regardless of `status`. Approve/Changes only changes the badge/border — never
  hides the creative.
- Add a subtle "edited / re-render needed" hint when an asset has edits newer than its last render
  (compare an `editedAt` vs `renderedAt` stamp set by the routes).

### Part 2 — Server routes (extend `scripts/editor-server.mjs`; namespaced, do NOT loosen the `cluster-` regex)
- `GET/POST /campaign-config/:campaign/:angle/:asset` — load/save the static per-asset config. GET
  **creates on first access** by filling the template (fill-core) with the asset's `templateData`/brand
  cascade, writing the `edits/…json`, then returning it. POST saves it + stamps `editedAt`.
- `POST /render-asset/:campaign/:angle/:asset` — render ONE asset by spawning
  `node scripts/run-campaign.mjs <campaign> --only <assetId> --all` (bypasses the approval gate for a
  single edit-render), then return the new output path. Runner patches the plan thumb/output.
- `GET /template-spec/:template` — return a motion template's `*_SPEC.fields` (parsed from
  `brand/video-templates/templates/<t>.jsx`) to build the copy form.
- `GET /bank?type=motion|static` — list bank templates for the "swap template" dropdown.
- `GET /media?brand=<slug>&kind=photo|clip` — list selectable media from `Kraken\<brand>` + project
  `assets/` for the photo/clip picker (returns served paths under a guarded root).
- Reuse existing `send/sendJson/readBody`, CORS, MIME, static `/out` + `/templates`; add a guarded
  static root for `brand/video-templates/` and the Kraken media dir.

### Part 3 — Static editing: campaign-aware position editor, embedded in the modal
- **`out/editor/editor.html`:** when the load target is a campaign asset (hash like
  `#camp:<campaign>:<angle>:<asset>`), route `fetchConfig/saveConfig/triggerRender` to the
  `/campaign-config` + `/render-asset` routes instead of `/config` + `/render`. Add the camp id to the
  loadable set so `loadCluster` runs it. ~1 new branch in each of the 3 API fns + the init loader.
  Existing cluster editing is untouched.
- **`review.html`:** the edit modal for a static embeds the editor via
  `<iframe src="/editor#camp:…">` (full drag/position/text/media editing). The editor's Save+Render
  hits `/render-asset`; on modal close the review card refreshes its thumb.

### Part 4 — Video/gif editing: lift the gallery modal into the review page
(Fresh `[F]` assets reuse this modal's **copy fields only**; their Save writes `templateData`/notes to
the plan and the card shows "fresh render pending" — no render path until `compose-creative` exists.)
- Pre-load every motion template script (`templates/*.jsx`) into `review.html` (like the gallery) so
  components are on `window` for the live preview.
- Lift **`EditPanel` + field controls + Stage live-preview (MiniStage RAF loop)** + modal shell. Bind
  the form to the asset's `templateData`; the live `<Stage>` preview shows campaign copy as you type
  (preview == render, via the shared `data` prop).
- Add four control groups to the tweaks panel:
  1. **Copy** — fields from `GET /template-spec/:template`, editing `templateData`.
  2. **Clip/photo** — the photo-picker grid (from `GET /media`), writing a real path to the media key.
  3. **Audio** — the audio-picker list, writing `{src,startAt,volume}` (silent at render for now; choice
     persists for the deferred mux).
  4. **Swap template** — dropdown from `GET /bank?type=motion`; on change, refetch the spec, remap
     `templateData` keys (carry over by best-match), re-preview.
- **Save & Re-render** button → patch the asset (`templateData`/`clip`/`photo`/`audio`/`template`) via
  `/plan`, then `POST /render-asset`; card thumb updates on completion.
- Gotchas to honor: one RAF loop, `cancelAnimationFrame`+`root.unmount()` on close; persist real media
  paths (never blob URLs); `data` prop is the shared contract; own state keyed by asset id (not
  localStorage by spec.id — B6).

### Part 5 — Runner: respect authoritative edits + new fields
- `renderTemplateStatic`: if `campaigns/<name>/edits/<angle>__<asset>.config.json` exists, render
  directly from it (skip the fill); else fill, **write it there**, render. Stamp `renderedAt`.
- `renderTemplateMotion`: honor `asset.template` (swap), `asset.clip`/`photo` (stage into the wrapper's
  assets + set the media key in `data`), `asset.audio` (record; mux deferred). Keep
  inlined-template + `__CONFIG__` mechanism.

## Critical files
| File | Action |
|------|--------|
| `brand/video-templates/review.html` | modify (preview-bug fix; edit modal; lift gallery tweaks+preview; pickers; save/re-render) |
| `out/editor/editor.html` | modify (campaign-asset load/save/render branch + hash; postMessage on render) |
| `scripts/editor-server.mjs` | modify (campaign-config, render-asset, template-spec, bank, media routes; guarded static roots) |
| `scripts/run-campaign.mjs` | modify (authoritative edits; template-swap/clip/photo/audio) |
| `campaigns/velocity-code-youth/edits/` | new (per-asset static configs; tracked) |
| `campaigns/velocity-code-youth/assets/` | new (staged swap clips/photos; tracked) |
| `.gitignore` | verify edits/ + assets/ stay tracked; campaign render outputs already ignored |
| `docs/PROCESS.md` | modify (document the editing model + persistence) |

## Verification (end-to-end, the user's exact failures)
1. **Bug 1 gone:** render F3, click Changes → the rendered PNG stays visible; only the badge changes.
2. **Static edit correct content:** click Edit on F3 → modal shows the **campaign creative** (real
   copy), not the "Microscript" source template. Drag a layer, change text, Save+Render → the card
   thumb updates with the change; re-render again → the hand edit persists (authoritative).
3. **Video edit works:** click Edit on E1 → modal with live preview + copy fields (eyebrow/title1/
   title2/ctaText), a clip/photo picker, audio picker, and template-swap. Change a title → preview
   updates live → Save+Render → E1.mp4 reflects it.
4. **Swap template:** change E-asset from stat-reveal → quote-card, edit its fields, render → new look.
5. **Source immutability:** `git status` clean on `cluster-*` + `templates/*` after edits (edits live
   under `campaigns/<name>/edits/`).
6. **Full-campaign feel:** open review page, walk several cards, edit each in place, approve, batch
   render — no dead-ends, no "not wired" alerts.

## Out of scope this round (still deferred)
- ffmpeg audio-mux (audio choice persists but renders silent).
- nano-banana AI image-gen; flat-image→template; autonomous agent; direct Meta upload.
- `compose-creative` fresh-generation quality pass (fresh assets reuse the same edit surfaces once they
  have a persisted config/templateData, but proving fresh-render quality is its own task).

# The Creative Engine — end-to-end process

The canonical map of how `aa-creative-engine` turns a campaign into shipped ad
creatives. This is the reference doc for the `/creative-engine` skill. When this
doc and a stray older note disagree, **this doc wins** (see "Superseded" below).

## One sentence

Run `/creative-engine`, hand it a **brand + a full campaign** (reverse brief + ad
copy + microscripts); it deep-reads the inputs, plans ~10-20 angle-coherent
creatives per angle (video / GIF / static), you review and approve them on a page,
and it renders the approved ones in the background while you move to the next angle.

## The pipeline

```
/creative-engine
  1. BRAND      → pick AA LOCATION → Kraken workspace; pull SOURCE-folder raw media
                  (kraken-pull.mjs --per-campaign → brand/kraken-cache/<campaign>/,
                   OR browse+pull right in the review page) + data tier + brand kit
  2. INTAKE     → campaigns/<name>/{brief.md, ad-copy.md, microscripts.md, named templates}
  3. DEEP READ  → 1 sub-agent per doc/section → campaign-knowledge.json (quoted, auditable)
  4. PLAN       → creative-plan.json (angles × assets: format, source, copy, microscript, image, flags)
  5. REVIEW     → review.html (served): approve / note / tweak / edit          ── STOPS HERE
  6. RENDER     → run-campaign.mjs: approved only, background, render-then-move
                  → out/campaigns/<name>/<angle>/<id>.<ext> + manifest.json
                  → good fresh assets ⇒ promote into the bank
  7. EXPORT     → kraken-export.mjs: push rendered creatives into the chosen
                  DESTINATION folder in the Kraken Content Library (idempotent)
  └─ while rendering, loop back to step 4 for the next angle
```

The Kraken (per-AA-location workspace + source/destination folders) is chosen **per
run** and saved to `campaigns/<name>/kraken.json` — not hardcoded.

## Components (what does what)

| Concern | File | Notes |
|---|---|---|
| Front door | `.claude/skills/creative-engine/SKILL.md` (+ `config.json`) | Orchestrator; phase-aware; brand→Kraken map. |
| Fresh generator | `.claude/skills/compose-creative/SKILL.md` | New on-brand creatives in the bank's shape (promotable). |
| Renderer | `.claude/skills/jsx-to-mp4/scripts/render.mjs` (+ `claude-design.mjs`, `static-react.mjs`) | Classifies + renders. `claude-design.mjs` injects `window.__CONFIG__`. |
| Static fill core | `scripts/lib/fill-core.mjs` | Cascade + substitution + variant-emit + render. Shared by CLI + runner. |
| Single-template CLI | `scripts/fill-template.mjs` | Thin CLI over fill-core. |
| Campaign runner | `scripts/run-campaign.mjs` | Renders approved assets; render-then-move; gif post-step; manifest. |
| Kraken connector | `scripts/lib/kraken.mjs` | Supabase Content-Library client (PostgREST + Storage + ingest edge fn); workspace resolve; creds from Kraken `.env.local`. |
| Kraken pull | `scripts/kraken-pull.mjs` | Caches a source-folder's raw media for hand placement; `--per-campaign` → `brand/kraken-cache/<campaign>/`. Also driven in-page via `POST /kraken/pull`. |
| Kraken list | `scripts/kraken-list.mjs` | Read-only JSON lister (`workspaces` / `folders`) the review page's folder browser spawns via `/kraken/workspaces` + `/kraken/folders`. |
| Kraken export | `scripts/kraken-export.mjs` | Pushes rendered creatives into a destination Content-Library folder (dedup + folder PATCH). |
| Review API | `scripts/editor-server.mjs` (:5173) | `/plan`, `/plan/:campaign/:angle/:asset` (single writer), `/render`, static `/out`. |
| Review page | `brand/video-templates/review.html` (:5599 via `serve.mjs`) | Card grid by angle→beat; badges; dashboard; approve/note/edit. |
| Position editor | `out/editor/editor.html` (:5173) | Hand-tweak layer positions for `cluster-*` statics. |

## Data model

### Layer model (statics)
`cluster-N.config.json`: `{ width, height, media?, fixedDesign[], elements[],
foregroundMedia? }`. Every editable layer has a semantic `tag`. `tag` is inert —
it never changes a rendered pixel; it's the binding key for fill (GoHighLevel
custom-values style). `_helpers.jsx` `<LayerStack>` renders the whole config.

### Substitution (field-aware, fill-core)
`text → .text · rect → .fill · image → .src · circle → .label · media/foreground → .path`.
Validate tag→layer-type before binding (don't write an image path into a rect's `.fill`).

### Cascade (most specific wins)
`campaign > location > brand > template default`. Tiers are `data/{brand,location,
campaign}.<name>.json`, each `{ "tags": { <tag>: <value> } }`. **Wired through BOTH
statics (`resolveStaticConfig`) AND motion (`buildMotionData`, identity roles only),
via `run-campaign.mjs` + `editor-server.mjs` — so the editor preview and the render
seed from the SAME cascade.** The `location` slug comes from the plan (`angle.location`
or per-asset `location`); `mergeTiers(brand, location, campaign)` makes campaign most
specific (so per-location-VARYING values like `city` live in the LOCATION tier, never
the campaign tier, or campaign would always win).
- **Brand tier = identity only** (`logo`, `brand_name`, `url`, verbatim `guarantee`). Campaign-
  specific values (`city`, `subhead`, `microscript`) live in the campaign/location tiers so they
  can't bleed across campaigns. Colors stay per-template (don't blanket-override).
- **Auto locale-anchor eyebrow:** `resolveStaticConfig` injects `// <audience> · <city>` (from the
  merged tier) into an empty, non-`city` eyebrow slot — null-guarded (no city → audience only), and
  `buildMotionData` does the same for an unset `eyebrow`-role motion field. Leave the eyebrow unset
  to get it; set it explicitly to override.
- **Placeholder suppression:** a CONTENT-role slot (hook/claim/mechanism/reframe/offer/stat/
  testimonial) that gets neither campaign copy nor a tier value is blanked (not rendered with the
  template's hardcoded placeholder). Identity/locked roles + tier-filled slots are untouched.

### creative-plan.json (the campaign contract)
```
{ schemaVersion, campaign, brand, knobs{assetsPerAngle, motionRatio, freshnessFloor, repetitionCap},
  angles: [ { id, name, location?, mechanism, emotionalJob, voice,
    assets: [ { id, beat, format(video|gif|static), source(template|fresh),
      template, templateQuery, freshConcept, headline, microscript, visual, location?,
      image{tag,source,ref}, media?(static bg image/clip), clip?(motion bg), audio, flags[],
      status(planned|approved|changes|rendering|rendered|failed), notes, output, thumb,
      knowledgeRefs[] } ] } ] }
```
`location` (angle or asset) selects the location tier for the cascade + locale anchor. `media`
(static) injects a full-frame background + scrim (opt-in); `clip` (motion) binds a bg clip via the
runner's media key.

## Image sources (the four)
1. **library** — raw media in The Kraken **Content Library** (Supabase, per-AA-location
   workspace). Pulled into `brand/kraken-cache/<campaign>/` and placed by hand in the editor
   (`/media` picker for motion; `/media-into-template` swap for statics). The review page and the
   position editor have a **built-in Kraken bar**: browse the location's folder tree, pull a chosen
   folder into the campaign, and tiles tag their `source` (`kraken`/`uploaded`/`brand`). No CLI step
   needed (the CLI `kraken-pull.mjs --per-campaign` remains for scripted/bulk pulls).
2. **client** — campaign/location-specific media the client supplies. **Upload from computer**
   straight into the campaign via the Kraken bar's Upload button (`POST /media-upload`), tagged
   `uploaded`.
3. **jsx-render** — render a sub-template to PNG, then use it as another creative's
   image layer (compositional). Memoized; cycle-guarded.
4. **ai-gen** — *stub seam* (nano-banana, future). Uses a `fallback` and logs
   `AI-GEN PENDING` until wired.

## The two banks
- **Static bank** — `templates/multi-sport-foundations/cluster-*` (config + thin JSX).
- **Motion bank** — `brand/video-templates/templates/*.jsx` (Claude Design `Stage`
  components reading `data.*`, with `*_SPEC.fields`) + shared `elements/*`.

## Source-selection policy
No fixed template:fresh ratio. **Fit-first**: use a bank template when one truly
expresses the message; else generate fresh. Bounded by a **repetition cap**
(≤ ~3 reuses of a skeleton per angle) and a **freshness floor** (~45% now, tapering
to ~25-30% as the bank deepens). The observed split is an output, not an input.

Selection is **role-fit + playbook-driven**: `docs/creative-playbook.md` is the rulebook for which
**roles** each beat (A–F) needs and how many; `templates/_role-index.json` (regenerate with
`node scripts/build-template-index.mjs`) maps each role-ready template → its `roles`/`accepts`, so
the planner picks a template that exposes the beat's roles (native `roles` preferred, `accepts` =
hijackable) before falling to `fresh`. Most of the bank is **not** yet role-ready, so fresh still
dominates until templates are retrofitted.

## The flywheel
Every good `fresh` asset is **promoted into the bank** (static → a `cluster-*`;
motion → a `templates/*.jsx` + `*_SPEC`). Generation isn't a competitor to the
bank — it's how the bank grows, so we never "burn through" the library.

## Motion data injection (`window.__CONFIG__`)
Bank video templates read `data.*` with `?? default`. The runner writes a sibling
`<name>.data.json`; `claude-design.mjs` reads it, injects `window.__CONFIG__`, and
mounts the component as `createElement(Comp, { data })`. It also auto-loads
`animations.jsx` + `editing.jsx` + `elements/*` so element-dependent templates
(e.g. `window.StarRating`) render fully.

## Editing creatives on the review page (authoritative hand edits)
Every creative is editable in place from the review page; **hand edits are
authoritative** — they persist and survive re-render.

- **Statics** edit in an embedded position-editor iframe (`/editor#camp:<campaign>:<angle>:<asset>`).
  The editor's I/O routes branch on the `camp:` id to `GET/POST /campaign-config`
  + `POST /render-asset`. The per-asset config lives at
  `campaigns/<name>/edits/<angle>__<asset>.config.json` — **tracked in git**, it is
  the user's layer work. `GET /campaign-config` seeds it on first access from the
  ONE shared fill path (`resolveStaticConfig` in `fill-core`); after that the runner
  renders straight from it and **never re-fills** (so a batch render can't clobber
  edits). The editor postMessages `camp-rendered` so the cross-origin review page
  refreshes the card thumb.
- **Video/gif** edit in a React modal lifted from the gallery: a live `<Stage>`
  preview (mounting the same component the runner wraps → preview == render), copy
  fields (the bank's `EditPanel`, driven by asset-id-keyed state — **not**
  `useTemplateEdits`/localStorage), a clip/photo picker (`GET /media?campaign=` → a real served
  path, with the campaign-scoped Kraken browse/pull/upload bar above it), an audio picker, and a
  template-swap dropdown (`GET /bank`). Save writes
  `templateData`/`clip`/`photo`/`audio`/`template` to the plan via the single-writer
  `/plan` route, then `POST /render-asset`. Picked media must be a **real served
  path** (never a `blob:`/dataURL — those can't be headlessly rendered).
- **Fresh `[F]`** assets edit copy only this round (saved to the plan); they show a
  "fresh render pending" state until `compose-creative` ships.
- **Staleness**: edit routes stamp `editedAt`; the runner stamps `renderedAt`; the
  card shows "edited — re-render needed" when `editedAt > renderedAt`.

### Full video editing = `TplText` + promoted fields (per-template, lazy)
A motion template is fully editable in the modal once every text element renders through
`TplText` (animations.jsx) and every string is a `data` field. Retrofit a template **when a
campaign first uses it** (don't pre-do all 72). The pattern (see stat-reveal / quote-card /
coach-lower-thirds / logo-sting / meet-coach for worked examples):
1. **Wrap each text element in `<TplText>`** — pass the element's existing animated style as
   `style`, its default position as `base`, a `field` key (becomes `data-ov-key` → drag
   handle + the override slot), a `fitKey` (the text, so auto-fit only re-measures on change),
   and `maxWidth`/`maxHeight` where overflow is a risk. For flex-laid-out elements wrap
   **in place** (`base={{}}`) — the drag override is a `translate`, so flow is preserved; no
   flex→absolute rework needed.
2. **Promote hardcoded literals to `data` fields** (default = the literal) and add each to the
   template's `*_SPEC.fields` so the COPY tab lists them. Delimited groups (chips, stat pairs)
   become one `text` field parsed at render (e.g. `"a|b · c|d"`).
3. **Preserve animation** — the template still computes its per-frame `opacity`/`transform`;
   just hand them to `TplText` via `style`.
4. **Verify by render** — render the asset (looks identical at defaults) + open it in the
   modal (a handle on every element, COPY lists every text). Re-check the gallery (H7).
**New templates** should author text via `TplText` from the start. Added text boxes
(`ExtrasLayer`) already work on ANY template with no retrofit. Audio mux + the planner's
`templateData` key-mapping remain deferred.

## Non-negotiables
- **No skim**: deep-read via sub-agents into `campaign-knowledge.json`.
- **Hand placement sacred**: fill/generate set data only.
- **Voice**: no emoji, no exclamation points; guarantee verbatim.
- **Approval gate**: only approved assets render.
- **Render-then-move + unique basenames**: the renderer writes `out/<basename>.<ext>`;
  the runner uses a unique per-cell basename and moves the result into the campaign
  folder, so concurrent/background renders never collide in `out/` or `.tmp/`.

## Run it
```
node scripts/editor-server.mjs            # :5173 plan API + render
node "brand/video-templates/serve.mjs"    # :5599 serves the review page
# open http://localhost:5599/review.html?campaign=<name>
node scripts/run-campaign.mjs <name>      # render approved (background-friendly)
```

## Deferred (future stages)
- ffmpeg **audio-mux** into video (renders are silent for now).
- **nano-banana** AI image-gen (resolver seam in place).
- Flat-image → editable template ("image duplicator").
- Moving the brand kit into the Kraken; per-template `/make-*` wrappers; autonomous
  brief→creatives agent; direct Meta upload.

## Superseded
This doc + the hybrid `/creative-engine` architecture **supersede** the
per-template-skill approach sketched in
`planning/2026-05-21__template-library-vision.md`. We kept that doc's good bones —
typed per-template field contracts (now the bank's `*_SPEC.fields`), a shared
render engine, and `window.__CONFIG__` injection — but the top-level interface is
one campaign-aware engine, not one slash command per template. See that file's
header note.

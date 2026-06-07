---
name: creative-engine
description: >-
  Campaign-in, approved-creatives-out. Turn a full marketing campaign (reverse
  brief + ad copy + microscripts) for a brand into ~10-20 on-brand,
  angle-coherent creatives per angle (video / GIF / static), reviewed and
  approved on a page, then rendered in the background. Trigger when the user
  runs /creative-engine, or asks to build/generate a campaign's ad creatives
  from a brief, or to plan/produce a batch of angle-specific ads.
---

# Creative Engine

The front door for producing a whole campaign's ad creatives. You orchestrate;
deterministic scripts do the mechanical work. **You are the brain (matching copy →
angle → creative); the scripts are the hands (rendering).**

Read `docs/PROCESS.md` for the full machine, and **`docs/creative-playbook.md` — the
canonical rulebook for WHICH copy roles each beat (A–F) needs, how many, and where they
sit.** The planner MUST apply it (Step 4). This skill is phase-aware: it inspects what
already exists on disk for the campaign and resumes from there.

## Hard rules (never violate)

1. **No skimming.** Input documents (the reverse brief especially) are huge and
   dense. You MUST deep-read every line — but NOT in this context. Fan out **one
   sub-agent (Task tool) per document, and one per major section of the reverse
   brief**, each returning a quoted, structured extraction. Aggregate into
   `campaigns/<name>/campaign-knowledge.json`. The main context holds only the
   digests. This both forces depth and protects the context window.
2. **Hand placement is sacred.** Filling/generation sets DATA only (copy, colors,
   image paths). Never auto-move or auto-place layers. Per-creative position
   tweaks happen in the editor, by the user.
3. **Brand voice is law** (from the brand kit): head-coach-to-parent, declarative,
   metric-driven, **no emoji, no exclamation points**. The guarantee is verbatim,
   never paraphrased — the canonical string is `GUARANTEE_TEXT` in
   `scripts/lib/roles.mjs` (currently `+1 mph speed. +3" vertical. 90 days. Or your
   training is on us.`). The `guarantee` role is auto-fill-locked, so the renderer
   never overwrites it; don't hand-paste a different wording.
4. **Approval gates PUBLISH, not render.** Render a PROOF of every planned asset FIRST
   (`run-campaign.mjs --all`), so the review page shows real pixels — never an empty page.
   The user approves the proofs; ONLY approved proofs are pushed to the live Kraken library
   (`kraken-export.mjs --approved-only`). Rendering is cheap, local, and reversible; publishing
   outward is the hard-to-reverse step the gate guards.
5. **You never write copy — you select and place it (verbatim).** The user wrote
   every hook, headline, and line in `ad-copy.md` / `microscripts.md`; it is already
   good. Your job is casting, not copywriting: pick which of HIS units goes on which
   creative and compose the visual around it. The copy that lands on a creative comes
   ONLY from `campaigns/<name>/copy-library.json` (the parsed verbatim units),
   referenced by id — never authored, paraphrased, reworded, or truncated. The brief
   is for strategy/thinking only; nothing paraphrased from it lands on a creative. If
   a hook is too long, drop to a shorter alternative hook (also his), split it across
   kicker/headline/subhead, or flag it — never reword. (`verbatimGuard` in
   `scripts/lib/copy-resolve.mjs` flags any on-creative text that isn't his.)

## The flow

### Step 1 — Brand + Kraken (workspace → source media)
Read `.claude/skills/creative-engine/config.json` → `brands` and pick the brand:
- **Exactly one registered** (today's state) → don't ask open-ended. State it and
  confirm, e.g. *"Only one brand kit is set up right now: **Athletes Acceleration**.
  Using it for this campaign. (When you add more clients I'll ask you to pick.)"* —
  proceed once the user confirms. This still records the brand on the campaign, so
  nothing has to be retrofitted when more brands exist.
- **More than one registered** → list them and ask **"Which brand?"** (the real
  pick — scales automatically, no further change needed). Resolve the answer against
  `brands[<slug>]` (match `slug` or any `aliases`).
- **Unknown name / none match** → ask for the brand's slug + data tier and add it to
  `config.json`.

**Registering a NEW brand kit (franchisee intake).** When the user hands you a new brand
(colors / logo / name / url / fonts), register it so templates can follow it — this is the
single place a kit is created, and `/repurpose-campaign` consumes the same tier:
1. Write `data/brand.<slug>.json` carrying the **full token contract** under `tags`:
   identity (`logo`, `brand_name`, `url`, `guarantee` — may be `""` if the brand has none) +
   **color tokens** (`brand_red`, `brand_red_deep`, `ink_950`, `ink_900`, `white`) + **font
   tokens** (`font_display`, `font_body`, `font_mono`); plus top-level `kitPath`
   (`brand/<slug>`) and `logo_src` (the canonical logo file).
2. Scaffold the kit folder `brand/<slug>/assets/` and place the logo there.
3. Validate it: `node -e "import('./scripts/lib/brand-kit.mjs').then(m=>console.log(m.validateKit('<slug>',{dataDir:'data',projectRoot:'.'})))"`
   — fix every reported error before planning (the kit must be complete or renders fall back).
   Color/identity then flow automatically: the bank's authoring colors are remapped to the
   kit's at render time (`scripts/lib/palette.mjs`); AA's kit is unchanged.
4. **Generate the brand's design-constraint layer (do this LAST — after step 3 passes):**
   `node scripts/gen-design-md.mjs` → writes `<kitPath>/DESIGN.md` from the tokens just
   registered (the agent-facing brand contract `/compose-creative` reads). Run it AFTER
   validation so it isn't built from a half-written kit; it FLAGS missing tokens as TODO
   (never substitutes AA), and is idempotent — it regenerates every brand harmlessly.

The resolved brand gives:
- the **data tier** for the cascade fill (`data/brand.<dataTier>.json`);
- the brand kit path → **read the active brand's `<kitPath>/DESIGN.md`** (the
  design-constraint layer: colors/type/voice/placement/components) before selecting
  templates or composing anything fresh; it's the canonical on-brand contract for that
  brand. Key it by the brand's OWN slug (`plan.brand` / the kit just resolved), **NOT**
  the `<dataTier>` above — a franchisee that fills from AA's data tier still uses its OWN
  DESIGN.md. If the file is absent, run `node scripts/gen-design-md.mjs` first (never fall
  back to AA's defaults).

Then resolve **The Kraken Content Library** (raw source media lives there — a Supabase
store, NOT local folders; connector is `scripts/lib/kraken.mjs`):
1. **Ask which AA LOCATION this campaign is for.** AA is multi-location — Indy/Carmel/
   Noblesville/Westfield/Milford each map to a DIFFERENT workspace in
   `~/.claude/client-workspaces.json` (bare `athletes-acceleration` → Milford). Never assume
   Genesis. The location decides the whole library you read and write.
2. **Pick the SOURCE folder.** Two equivalent paths:
   - **In the review page (preferred for the user)** — the media picker (video edit modal) and the
     position editor both have a **Kraken bar**: pick the AA location, browse its folder TREE, and
     **Pull** the chosen folder into this campaign. It also has an **Upload** button to add media
     straight from the computer. No CLI needed. (Folders are pulled by id, so duplicate folder names
     can't pull the wrong one; the editor-server reaches the Kraken only by spawning the CLIs.)
   - **CLI (scripted/bulk)** — `node scripts/kraken-pull.mjs <campaign> --workspace <loc> --per-campaign`.
     With no `--folder` it prints that workspace's live folder list and exits — show it to the user
     and ask which folder holds the raw media, then re-run with `--folder "<name|uuid>"`.
   Either path caches media into `brand/kraken-cache/<campaign>/` (isolated per campaign) and saves
   the picks to `campaigns/<name>/kraken.json`.

**Kraken is lazy.** Don't block a template-only or jsx-render campaign on a Kraken pull —
only do the location + source-folder pull when the plan actually contains an asset whose
image `source` is `library` or `client` (i.e. raw media is genuinely needed at render time).

Pulled (and uploaded) media appears in the editor `/media` picker (motion) and via
`/media-into-template` (statics) for **hand placement**, each tile tagged by `source`
(`kraken`/`uploaded`/`brand`) — pulling/uploading surfaces media, it does not auto-place it, and does
not auto-clear `needs-kraken-path` (a human placement does).

### Step 2 — Collect inputs + build the copy library
Ensure `campaigns/<name>/` contains: `brief.md` (reverse brief), `ad-copy.md`,
`microscripts.md`, and any named templates for this campaign. Ask the user for any
that are missing. Confirm the campaign slug.

Then build the **verbatim copy library** BEFORE planning (order gate — the plan
references it by id):
`node scripts/intake-copy.mjs <name>` → `campaigns/<name>/copy-library.json`. It parses
`ad-copy.md` + `microscripts.md` into verbatim units (each with an `id`, `role`, `chars`)
and fails loud on malformed input. Re-run it whenever `ad-copy.md`/`microscripts.md`
change — a stale library means the plan's refs miss. This file is the ONLY source of copy
allowed on a creative.

### Step 3 — Deep read (no skim — sub-agent fan-out)
If `campaigns/<name>/campaign-knowledge.json` does not yet exist (or is stale),
fan out Task sub-agents — one per input doc and one per major reverse-brief
section (target market, mechanisms, characterizations, hooks, proof, metaphors,
paradoxes, fascinations, beat maps, myths, testimonials). Each returns a JSON
block of quoted items with source lines. Aggregate, then **assert every expected
section produced output** before planning; re-run any that came back empty.

### Step 4 — Plan
**Plan by the playbook (`docs/creative-playbook.md`).** For each angle, author assets up to
`knobs.assetsPerAngle`. For each asset:
- **Pick the beat + roles by the selection rule** (audience temperature → beat → format →
  role-count): COLD → beat A, `hook` (+`brand`), 1–2 roles, static/short video; WARM → beats
  C/D/E, reframe/mechanism + proof/stat/testimonial, 2–3 roles, video shines; HOT → beat F,
  offer+guarantee+cta, 2–3 roles. Hold **role-count** to **1 dominant + ~2 supporting** (cold = 1).
  Use `beat: null` for brand bumpers / logo stings (no funnel step).
- **Spread beats A–F across the angle's mix** (rough lead-gen budget ≈ 70% warm proof/offer ·
  20% hot retarget · 10% cold hook) — the plan is the coverage map; don't ship all one beat.
- **Select a template by ROLE-FIT.** Read `templates/_role-index.json` **if present** (regenerate
  with `node scripts/build-template-index.mjs` when templates changed): pick a role-ready template
  of the right `format` whose `roles` expose the beat's required roles (or whose `accepts` can hold
  them — a hijackable slot). **Fit-first:** only mark `source:"fresh"` when nothing fits. If the
  index is missing, fall back to reading specs / judgment. **Prefer the clean AA-native bank**
  (statics `cluster-30..37`, motion `stat-reveal`/`velocity-drop`/`season-clock`/`meet-coach`/
  `logo-sting`) — the legacy `cluster-1..22` are reskinnable but only render correctly once the
  brand-kit sync (data tiers) replaces their logo/city/name.
- **Variety — ENFORCE, don't just hope (the #1 past failure).** Track templates used in this angle.
  Do NOT reuse a skeleton beyond `knobs.repetitionCap` (default 3), and use a **distinct skeleton for
  each asset WITHIN a beat** (A2≠A3≠A4; D1≠D2≠D3; F1≠F3). When the best-fit template is already taken,
  drop to the next-best role-fit; mark `source:"fresh"` only when no distinct fit remains. Two assets
  that share a skeleton AND look alike is the bug to avoid. **Strict mode:** set `knobs.repetitionCap:1`
  for a "every asset a distinct design" batch — then `run-campaign.mjs` HARD-FAILS the render if any
  template repeats within an angle (not just guidance). Prefer the clean AA-native bank
  `cluster-30..42`; the legacy `cluster-1..22` are Canva imports with baked photos / competitor
  watermarks — do not reuse them for an on-brand batch.
  - **Rotate the WHOLE bank, not the same 3–4 clusters (past failure: stuck on 33/34/35/39).** Track
    template usage across the ENTIRE campaign (every angle), not just within one beat, and deliberately
    reach for role-fit clusters you haven't used yet before repeating a familiar one. A campaign that
    only ever touches a handful of skeletons reads as one ad restyled, not a varied set — spread across
    the full role-ready bank (`templates/_role-index.json`).
- **No media reused in a batch (the footage version of variety).** Every media-backed asset gets a
  DISTINCT source clip/still — never the same `media`/`clip`/`photo` path on two assets, and avoid the
  same *movement* (a video and a static of the same drill reads as a repeat). `run-campaign.mjs`
  validates this per angle and HARD-FAILS on any duplicate path (always, regardless of repetitionCap).
  Pull distinct scenes from the Kraken cache; prefer the campaign's school level (middle-school for the
  8–12 foundations work) and clips with no competitor equipment branding.
  - **Assign media by SCENE diversity, not pool order (past failure: every static the same shot).**
    Don't walk the cached media list top-to-bottom handing out the next file — deliberately vary the
    drill / movement / framing across the set so no two creatives read as the same moment. (The runner
    auto-extracts a video still with ffmpeg's `thumbnail` filter — a representative bright frame, not a
    fixed ~1s seek — so a video bg won't land on a black/transition frame.)
- **One red — and it comes from the active kit.** A creative carries exactly one brand red; never
  introduce a second (the legacy clusters once carried `#ed1c24`/`#fe3430` — normalized out). The red
  is NOT hardcoded: the bank's authoring red `#c4141d` (`--aa-red-600`) is the AA kit's value AND the
  fallback, and it is remapped to whatever the active brand kit's `brand_red` is at render/clone time
  (`scripts/lib/palette.mjs`). New skeletons keep using `AA_RED` from `_helpers.jsx` (statics) or
  `const RED = (window.__BRAND__ && window.__BRAND__.brand_red) || '#c4141d'` (motion) — the literal
  is the AA fallback, the kit overrides it.
- **Bind copy by REFERENCE, never by authoring.** Set `asset.copyRefs` (a `{role: id}` map,
  e.g. `{proof:"ad-2.altHook.3"}`) and/or `asset.hookRef` (one copy-library id) pointing at
  units in `copy-library.json`. The resolver lays a `hookRef` across **kicker → headline →
  subhead** automatically (verbatim split). **Prefer the doc's on-creative copy** — each ad's
  `imageHeadline` / `imageSubhead` are the exact words meant for the creative (use them for the
  headline/subhead). Do NOT write `asset.headline`/`microscript` strings (legacy/back-compat
  only). Never paraphrase from `campaign-knowledge.json` onto a creative — it is strategy only.
  Validate tag→layer-type before binding an image tag.
- **Stands alone — EVERY non-`null`-beat asset (the #2 past failure).** A creative must read on its
  own (who it's for + what it's about) WITHOUT the ad's body copy. (a) Set `angle.location` (or
  per-asset `location`); the cascade auto-injects an audience+locale **eyebrow** anchor (e.g.
  `// AGES 8-12 · HAMILTON COUNTY, IN`) into a clean eyebrow slot from the location/campaign tiers —
  leave the eyebrow unset so it fills automatically. (b) The hook/headline must be a **complete
  thought**, never a bare brand-IP fragment ("THE LAST REP LIE" is a tag, not a hook — pair it with
  a self-contextualizing line). Brand identity (logo/city/name) syncs from the data tiers — never
  hand-paste a city or rely on a template's placeholder.

**Constraint priority** when they conflict: brand-voice & guarantee > beat & role correctness >
beat coverage (A–F spread) > the knobs (motionRatio / freshnessFloor / repetitionCap).
Write `campaigns/<name>/creative-plan.json` (schema in `docs/PROCESS.md`).

**`templateData` — precise per-slot fill (selection ≠ fill).** The role-index only *picks* a
template; copy then lands two ways. (a) The **role-aware auto-join** now routes `headline` → the
beat's role-slot and `microscript` → the `reframe` slot automatically, so a simple template fills
with no `templateData`. (b) **`templateData`** gives precise/complete control — still required for
multi-field templates (e.g. `stat-reveal`'s eyebrow/title1/title2/stat*/cta) which otherwise show
stock defaults. Key it by the slot's **`id`** (precise) or its tag/field name (back-compat);
explicit `templateData` always wins. The `guarantee` slot is **locked** (renders the verbatim
guarantee, won't auto-fill — don't override). Find the keys by reading the template:
- **Motion** (`brand/video-templates/templates/<t>.jsx`): the keys are the
  `data.<key>` reads (and the `*_SPEC.fields[].key` list). Examples:
  `stat-reveal` → `{eyebrow,title1,title2,ctaText}`; `quote-card` →
  `{eyebrow,quoteText,bylineName,bylineMeta,statsLabel}`; `coach-lower-thirds` →
  `{coachName,coachTitle}`; `meet-coach` →
  `{eyebrow,coachFirst,coachLast,coachTitle,ctaText,ctaMicro}`; `logo-sting` →
  `{wordmark1,wordmark2,tagline,url}`.
- **Static** (`cluster-*`): the keys are the layer `tag` names in
  `<cluster>.config.json` (e.g. `title`, `microscript`, `city`, `guarantee`).
The runner uses `templateData` verbatim when present (warning on keys the template
doesn't read), and otherwise the **role-aware join** (`buildCopyByRole` → `assemble` in
`scripts/lib/`) routes headline/microscript onto the right role-slots.

### Step 4b — Compliance gate (MANDATORY — do not skip)
Before rendering proofs, validate the plan and **loop-fix until it is clean**:

```
node scripts/validate-knowledge.mjs <name>   # deep-read completeness (must exit 0)
node scripts/validate-plan.mjs <name>         # compliance gate (must exit 0 — no blocking)
```

`validate-plan.mjs` checks the bytes that actually render (static edits config / motion
templateData) against `data/rules.<brand>.json`: it **blocks** on a creative with no media,
copy not traced to the copy-library (verbatim, persuasive roles), a missing/wrong eyebrow city,
off-voice copy (emoji / exclamation / banned words), a paraphrased guarantee, or a non-9:16
static; it **warns** on beat-role fit and coverage/reuse. Fix every ✗ (rebind copy to a library
unit, place media, correct the city/guarantee, etc.) and re-run until `blocking: 0`. **Do NOT open
the review page or tell the user to review while any blocking violation remains** — the runner will
refuse to render it anyway (exit 2), so catching it here saves a round trip. The report is written
to `campaigns/<name>/validation.json` and surfaced live on the review page.

### Step 5 — Render proofs (so review has real pixels)
Review happens on RENDERED proofs, never on a promise — an empty review page was a real
failure. Once the gate is clean, render a proof of **every planned asset**:
`node scripts/run-campaign.mjs <name> --all`  (add `--angle <id>` to scope to one angle).
It re-runs the compliance gate (refuses on any block unless `--force-unsafe`), renders each
asset, runs render-QA (black/frozen/wrong-duration → failed), writes
`out/campaigns/<name>/<angle>/<id>.<ext>`, patches each card's status/thumb (the page updates
live), and emits `manifest.json`. Background-friendly — while a proof batch renders, return to
Step 4 for the next angle. Good fresh proofs ⇒ offer to promote into the bank.

### Step 6 — Review (stop here)
Ensure the dev servers are up with **`npm run dev`** — it starts BOTH the plan/render
server and the review page, auto-picks free ports (so a second chat/worktree never
collides), writes the chosen ports to `.dev-ports.json`, and prints a ready-to-open
review URL.

Tell the user to open the **review URL `npm run dev` printed** — of the form
`http://localhost:<review>/review.html?campaign=<name>&api=http://localhost:<editor>&editor=http://localhost:<editor>`
(on the main checkout that's `:5599`/`:5173`). They review the rendered proofs, tweak/note/edit
(an edit re-renders that card), and **Approve** the ones to publish. **Then STOP.** Approval
gates the outward PUBLISH — nothing is pushed to the live library until the user says go.

### Step 7 — Publish approved proofs to The Kraken (after review)
Push ONLY the approved proofs into a **destination folder** in the Content Library
(same workspace as the source). Run `node scripts/kraken-export.mjs <name> --approved-only` —
with no `--folder` it prints the live folder list and exits; show it, ask which folder is the
DESTINATION, then re-run with `--folder "<name>" --approved-only`. **Run `--dry-run` first** (it
reports the push set + resolved workspace UUID, writing nothing). `--approved-only` publishes only
cards the user approved (the publish gate); omit it only to push every rendered proof deliberately.
The exporter dedups on the (campaign, angle, asset) triple (safe to re-run; pass `--replace` to
overwrite a stale row), attaches a video thumbnail, assigns the folder, runs the **brand-integrity
gate** (blocks AA leaks on a non-AA brand), and writes `asset.kraken = {id,url,folder}` back into
the plan. The workspace/folder picks persist in `campaigns/<name>/kraken.json`.

## Dispatch (which renderer per asset)
- `template` + `static` → `fill-core` cascade fill → static render (PNG).
- `template` + `video`/`gif` → motion wrapper + `window.__CONFIG__` injection
  (`brand/video-templates/templates/*.jsx`); gif = mp4 → ffmpeg palette.
- `fresh` + any → `compose-creative` skill output, then the matching renderer.

## Flywheel
When a `fresh` asset turns out well, offer to **promote it into the bank**
(static → a `cluster-*` template; motion → a `brand/video-templates/templates/*`
with a `*_SPEC`). The library compounds; next campaign the bank is bigger.

## Scope notes (current)
- Video renders are **silent** for now (audio-mux is a later phase; the
  audio-picker chooses tracks but muxing isn't wired).
- AI image-gen (nano-banana) is stubbed in the image resolver; `fresh` images use
  JSX-rendered or library/client sources for now.

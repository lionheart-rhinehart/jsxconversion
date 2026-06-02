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
4. **Approval gate is mandatory.** You produce the plan; the user approves on the
   review page; ONLY approved assets render. Never render unapproved assets unless
   the user explicitly passes `--all`.
5. **You do not write the core ad copy.** The user provides it. You MATCH it to
   angles and the brief, and compose visuals around it. You may derive slot-level
   fragments (a short microscript variant) only from the brief, flagged for
   approval — never invent claims.

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

The resolved brand gives:
- the **data tier** for the cascade fill (`data/brand.<dataTier>.json`);
- the brand kit path (read it before composing anything fresh).

Then resolve **The Kraken Content Library** (raw source media lives there — a Supabase
store, NOT local folders; connector is `scripts/lib/kraken.mjs`):
1. **Ask which AA LOCATION this campaign is for.** AA is multi-location — Indy/Carmel/
   Noblesville/Westfield/Milford each map to a DIFFERENT workspace in
   `~/.claude/client-workspaces.json` (bare `athletes-acceleration` → Milford). Never assume
   Genesis. The location decides the whole library you read and write.
2. **Pick the SOURCE folder.** Run `node scripts/kraken-pull.mjs <campaign> --workspace <loc>`.
   With no `--folder` it prints that workspace's live folder list and exits — show it to the
   user and ask which folder holds the raw media, then re-run with `--folder "<name>"`. It
   caches the media into `brand/kraken-cache/` and saves the picks to
   `campaigns/<name>/kraken.json`.

**Kraken is lazy.** Don't block a template-only or jsx-render campaign on a Kraken pull —
only do the location + source-folder pull when the plan actually contains an asset whose
image `source` is `library` or `client` (i.e. raw media is genuinely needed at render time).

Pulled media appears in the editor `/media` picker (motion) and via `/media-into-template`
(statics) for **hand placement** — pulling surfaces media, it does not auto-place it, and does
not auto-clear `needs-kraken-path` (a human placement does).

### Step 2 — Collect inputs
Ensure `campaigns/<name>/` contains: `brief.md` (reverse brief), `ad-copy.md`,
`microscripts.md`, and any named templates for this campaign. Ask the user for any
that are missing. Confirm the campaign slug.

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
- **No media reused in a batch (the footage version of variety).** Every media-backed asset gets a
  DISTINCT source clip/still — never the same `media`/`clip`/`photo` path on two assets, and avoid the
  same *movement* (a video and a static of the same drill reads as a repeat). `run-campaign.mjs`
  validates this per angle and HARD-FAILS on any duplicate path (always, regardless of repetitionCap).
  Pull distinct scenes from the Kraken cache; prefer the campaign's school level (middle-school for the
  8–12 foundations work) and clips with no competitor equipment branding.
- **One red.** The brand red is `#c4141d` (`--aa-red-600`, "matches logo"). Never introduce another red
  (the legacy clusters once carried `#ed1c24`/`#fe3430` — normalized out). New skeletons use `AA_RED`
  from `_helpers.jsx` (statics) or `const RED = '#c4141d'` (motion).
- Bind a headline + microscript pulled/derived from `campaign-knowledge.json` to the beat, format,
  and image source. Validate tag→layer-type before binding an image tag.
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

### Step 5 — Review (stop here)
Ensure the servers are up:
- `node scripts/editor-server.mjs` (:5173 — plan API + render)
- `node "brand/video-templates/serve.mjs"` (:5599 — serves the review page)

Tell the user to open **http://localhost:5599/review.html?campaign=<name>**, review
the cards, tweak/note, and **Approve** the ones to build. **Then STOP.** Do not render.

### Step 6 — Render (only after approvals)
When the user says go (re-invoke `/creative-engine <name>` or "render approved"),
run the background runner:
`node scripts/run-campaign.mjs <name>`  (add `--angle <id>` to scope, `--all` to
ignore the gate). It renders approved assets, writes
`out/campaigns/<name>/<angle>/<id>.<ext>`, patches each card's status/thumb (the
page updates live), and emits `manifest.json`. While it runs in the background,
return to Step 4 for the next angle.

### Step 7 — Export to The Kraken (after render)
Push the rendered creatives into a **destination folder** in the Content Library
(same workspace as the source). Run `node scripts/kraken-export.mjs <name>` — with no
`--folder` it prints the live folder list and exits; show it, ask which folder is the
DESTINATION, then re-run with `--folder "<name>"`. **Run `--dry-run` first** (it reports the
push set + resolved workspace UUID, writing nothing). The exporter dedups on the
(campaign, angle, asset) triple (safe to re-run), attaches a video thumbnail, assigns the
folder, and writes `asset.kraken = {id,url,folder}` back into the plan. The workspace/folder
picks persist in `campaigns/<name>/kraken.json`.

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

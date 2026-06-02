# Copy-Role Schema — design handoff (brainstorm, not yet built)

> Status: **DESIGN ONLY — nothing built.** Captures a brainstorm so it isn't lost.
> The decisions in "OPEN" below are not final.

## Why this exists
Template text fields are named by how they LOOK, not by what the copy DOES.
Symptoms Cody hit: a program name jammed into a "microscript" slot sized for a
one-liner; two slots in one template both named `headline` (the editor flags
"name used 2×"); the full A2 sentence dumped into an arched *display* slot meant
for 2–3 punchy words. Root cause: nothing carries a copy's marketing role down to
the slot, so the fill step guesses.

## The key realization — 80% already exists
Three copy-structure layers already exist; they just don't connect:
1. **Beats (funnel arc)** — every asset has a `beat`: A Stop-the-scroll · B Name-
   the-moment · C Reveal-mechanism · D Remove-blame · E Prove-it · F Offer
   (`campaigns/<c>/creative-plan.json`).
2. **Knowledge types (source taxonomy)** — `knowledgeRefs` already tag copy as
   `hook:` `metaphor:` `proof:` `reframe:` `offer:` `speaker:` `testimonial:`.
3. **Template fields (slots)** — `headline`, `microscript`, `eyebrow`,
   `title1/title2`, `quoteText`, `bylineName`, `ctaText`, …

The fill step bridges campaign copy → slot with **hardcoded tag names** (static)
or a **regex that guesses** (motion). No role travels down. That's the whole bug.

## The core model — fields are TREATMENTS pretending to be ROLES
`headline` = a look (big arched display). `microscript` = a look (small mono
anchor). Neither is a marketing role. That's exactly why two `headline` slots
confuse — same treatment, different intended job (one's a `hook`, one's a
`program_name`); and why a microscript holds a claim in one asset, a mechanism in
another.

So: **every text field = (treatment, role).**
- **Treatment** already exists — it's the field's visual props (`arch`, `fontSize`,
  `color`, `transform`) or a named look. NOTHING new needed.
- **Role** is the missing axis. Add it.
- Plus **`maxChars`** per slot (a length budget) — arguably fixes more of the
  "doesn't fit" pain than the renaming does.

Result: duplicate-name confusion dies, copy lands by function, the editor swap can
filter "show me all the hooks," and display slots stop overflowing.

## Proposed role vocabulary (funnel-function, derived from the beats + knowledge types)
`eyebrow · hook · claim · mechanism · reframe · proof · stat · testimonial ·
byline · offer · guarantee · cta · brand`
- `headline` and `microscript` are NOT roles — they're treatments.
- `guarantee` is verbatim-locked: `+1 mph speed, +3" vertical, 90 days, or
  training is free.` (never paraphrased).
- Keep the list SMALL and stable — don't fragment (one `hook`, not
  hook / paradoxical-question / pattern-interrupt).

## Beat derivation (probably free)
A template's funnel position can be INFERRED from the roles its fields expose
(e.g. `{proof, stat, cta}` → beat E/F). So the planner can pick templates by beat
without anyone hand-tagging beats. Less to maintain.

## Where it plugs in (highest-leverage code)
- **Static fill:** `scripts/lib/fill-core.mjs` `resolveStaticConfig` (~108-116) —
  today keys substitution on element `tag`. Add role → slot matching.
- **Motion fill:** `scripts/run-campaign.mjs` `buildMotionData` (~128-158) — today
  a regex guesses (`headline → first field matching
  /headline|title1|quote|claim|coachName/`). Replace with role lookup.
- **Campaign values:** `scripts/editor-server.mjs` `/campaign-values` (~316-352) —
  could add a `byRole` pool so the editor swap is role-aware.
- The static editor already surfaces whatever `tag` exists in its swap dropdown
  (`out/editor/editor.html` `valuesForTag`); once tags carry roles it improves for
  free.

## Current-state facts (from exploration)
- Video templates already use role-ish field names (`eyebrow`, `quoteText`,
  `ctaText`) — they're the GOOD examples. Static clusters are the messy ones.
- Duplicate generic tags are widespread in static configs (many clusters have two
  `headline`/`title` or three `city`/`title_*`).
- NO `maxChars`/`role`/`copyRole` metadata exists anywhere today; `_helpers.jsx`
  reads only visual props.
- Brand canon (guarantee verbatim; pillars ACCELERATE/DOMINATE/UNLEASH;
  code-comment eyebrows) are candidate locked roles/values.

## Recommended direction (mine — to confirm)
Funnel-function roles · treatment stays as-is · derive beat from roles · build
80/20 (dedupe tags + add `maxChars` + add `role` to templates lazily as campaigns
use them), with the role→slot fill rewrite as the high-leverage core.

## OPEN — not yet decided (forks were dismissed mid-discussion; revisit)
1. Role-vocab shape: funnel-function (recommended) vs lean-visual vs explicit
   two-axis. Also: reshape the role list itself?
2. Beat: derive-from-roles (recommended) vs explicit per-template tag.
3. Build scope: 80/20-lazy (recommended) vs full-now vs design-doc-only.

## Do NOT lose
- Design only — nothing built. Let the in-progress end-to-end test inform the
  final vocab (derive roles from where real copy lands wrong, not a whiteboard).
- The field-name / duplicate-tag mess and "wrong copy in wrong slot" are the SAME
  problem this schema solves.

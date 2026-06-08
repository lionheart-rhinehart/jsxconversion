# Creative-engine — STATUS LEDGER (single source of truth)

**This file is the status of record for the creative-engine "bulletproofing" effort.** It exists because
the work spans many chats + a separate editor track + context compactions, and there was no shared record of
what is *designed* vs *actually built* — so a whole layer (the generation-quality gates) looked done when it
wasn't. (Recovery record: `~/.claude/plans/ready-fuzzy-origami.md`, 2026-06-08.)

**The rule:** every item carries **STATUS + the commit/test that proves it**. An item is "done" ONLY with a
commit hash + a passing test cited. "Designed in a chat" never counts as done. When you build a ledger item,
update its row **before you wrap up**. Master-plan phases are **0–6**; the editor track is **A–F** — never
reuse numbers across tracks.

## Two tracks ran in parallel — DO NOT conflate them

| Track | Phases | What it is | Built? |
|---|---|---|---|
| **Master plan** (`~/.claude/plans/well-it-happened-again-linked-dream.md`) | 0 → 6 | the generation-quality bulletproofing (gates the engine can't dodge) | 0/1/2 + library built; **3–6 NOT built** |
| **Editor product** (separate plan) | A → F | the in-browser creative editor | A–E built; **F (motion presets) PARKED** |

There is **no "phase 3/4/5/6 — creative engine" execution chat** in the session history. The "F / 6 phases"
memory is the editor's A–F track overlaid on the master plan's 0–6.

## STATUS LEDGER — master plan

| Item | Status | Evidence | 
|---|---|---|
| **Phase 0** un-bypassable gates | ✅ BUILT+TESTED | `scripts/lib/human-override.mjs`, `data/grandfathered-campaigns.json`, validate-plan override-honored, run-campaign `--force-unsafe` refusal; `test/plan4.test.mjs` |
| **Phase 1** copy gate | ✅ BUILT+TESTED | validate-plan substring verbatim + `classifyVerbatim` + `copychiefTrim`; `body` role; `POST /approve-trim` + review button; `test/plan4.test.mjs` |
| **Phase 2** brand-purity + eyebrow + format-mix | ✅ BUILT+TESTED | `scanBrandIntegrity` in validate-plan; eyebrow kit-driven in `animations.jsx`; `checkFormatMix` |
| **Tier-1 #1–#7** (verbatim, media-present, guarantee, voice, brand-purity, eyebrow, spec) | ✅ BUILT | `validate-plan.mjs` |
| **#11** renders-correctly (render-QA) | ✅ BUILT | `render-qa.mjs` (black/frozen/blank/duration) |
| **#13** batch completeness (coverage) | ✅ BUILT (warn) | validate-plan coverage + run-campaign manifest |
| **Track-A∥B contract** | ✅ BUILT+TESTED | `scripts/lib/example-library.mjs`, `docs/example-index-contract.md`, `test/example-contract.test.mjs` |
| **Track B example library** | ✅ BUILT | `templates/_example-index.json` v2 (~109 examples / 31 archetypes), `templates/_examples/*`, `scripts/example-sidecar/*` |
| **DESIGN.md layer** | ✅ BUILT | `scripts/gen-design-md.mjs` + skills wiring (commits e534273, 3e9fec7) |
| **Execution-discipline hooks** | ✅ BUILT | foreman Stop hook `check-plan-complete.ps1` + seed-active-plan PostToolUse + /double-check + /ultrathink |
| **Generation spine** (G1/G3/G4) | ✅ BUILT+TESTED | `example-select.mjs`, exampleBinding gate in validate-plan, `uniqueness.mjs` re-key; commit `a301f72`; `npm test` 104 |
| **Skills wired (G5/G6)** | 🟡 BUILT (prose only) | compose-creative example-guided + creative-engine Step 4a; commit `88fd44a`. NOT auto-invoked by code |
| — — — | | |
| **Auto-invoked example-guided generation** | ❌ DESIGNED ONLY | `selectExample` is never called by production code (only tests) → generation is manual agent prose → skippable (the bad-creatives failure) |
| **#9 element/structure-fit gate** | ❌ ABSENT | nothing blocks a visual that fights the angle |
| **#12 media-fit + media-rubric gate** | ❌ ABSENT | media PRESENCE gated (Law #0); no style-match, no "no full-bleed on graphics" enforcement |
| **#14 output distinctness (Marker-2, selection-time segments)** | ❌ ABSENT | library is clustered; no runtime grouping of the chosen batch |
| **#15 cluster-adherence (Marker-1 vision check)** | ❌ ABSENT | no check a finished creative matches its assigned archetype |
| **#16 anti-slop** | ❌ ABSENT | no objective huashu guardrails / no vision check |
| **Sidecar → review merge** | ❌ ABSENT | `/validation` is plan-only; no `campaigns/<c>/perceptual.json` consumer → ML gates have no path to the gate |
| **Tier-2 advisory panel** (multi-persona) | ❌ ABSENT | no evaluator / per-creative scores |
| **Phase 5 — harvest** | ❌ DESIGNED ONLY | spec'd as `POST /promote` + `scripts/promote-example.mjs` + "Save as example" button — none exist |
| **Phase 6 — Remotion consolidation / Meta publish / dashboard** | ❌ DESIGNED ONLY | plan text + "for later"; zero `ads_create_creative` calls; no dashboard |
| **G2** editor-server `/plan` ALLOWED += exampleId/archetype | ❌ ABSENT | needed for review-page re-stamps |
| **Motion generation** | ❌ ABSENT | static-only |

## What's genuinely LEFT = the master plan's Phases 3–6 (the generation-quality JUDGMENT layer)

In dependency order (this is the priority list for the next effort — see "Next effort" below):
1. **Make generation un-skippable + example-faithful** — auto-invoke select→compose; then **media-fit/rubric
   gate (#12)** + **element-fit (#9)**. (Fixes exactly what produced the bad creatives.)
2. **Vision/ML gates** — cluster-adherence (#15), anti-slop (#16), output distinctness (#14) + the
   **sidecar→review merge** so they block approval.
3. **Resolve two design conflicts** — media-gate vs media-less graphic archetypes; formatMix vs static-only batch.
4. **Tail** — Phase 5 harvest, Phase 6 publish/dashboard, Tier-2 panel, motion generation, G2, dedup.

## Next effort (do NOT blindly execute the old Phase 3–6 text)

Phases 3–6 predate the Phase-2-era changes (archetype model, measured media rubric, distinctness →
selection-time) and the verified fact that generation was never automated. The next effort is a **fresh,
reconciled plan** for the generation-quality layer grounded in this ledger, then `/double-check` + `/ultrathink`.

## If this ledger ever drifts again (recovery routine)

`list_sessions` + `search_session_transcripts` for the deliverable names (e.g. `promote-example`, `media-fit
gate`) + cross-check `git log --all` and worktrees. That triangulation (code + transcripts + git) is how this
record was rebuilt on 2026-06-08.

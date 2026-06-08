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
| **Auto-invoked example-faithful generation** (selection-in-code + authenticity) | ✅ BUILT+TESTED | `scripts/lib/bind-examples.mjs` + CLI `scripts/bind-examples.mjs` stamp exampleId; `exampleBindingAuthentic` re-derives + blocks a faked/stale id (un-forgeable). commit `a8ae203`; `test/bind-examples.test.mjs` (7) + `test/plan4.test.mjs` T1.1c (4); `npm test` 131 |
| **Law #0 mirrors the bound example's media** | ✅ BUILT+TESTED | validate-plan `media` block waives when `!exampleHasMedia(exampleId)` (example-aware, format-agnostic); supersedes the stale blanket rule. commit `a8ae203`; plan4 T1.2 (3) |
| **#9 element/structure-fit gate** | 🟡 DEFERRED → vision #15 | Cody's call: folded into cluster-adherence (the vision gate carries "the visual means the angle"); no separate deterministic map |
| **#12 media-fit + media-rubric gate** (deterministic core) | ✅ BUILT+TESTED | validate-plan `mediaFit` (no full-bleed on graphic / >20% accent / `mediaDiversity` clip-reuse) from `docs/media-integration-findings.md`; `resolveAssetCopy` mediaGeom. commit `a8ae203`; plan4 T1.3 (4). Style-tag subset + perceptual near-twin → Track 2 |
| **format-mix INTENT** (override-governed; SMAA dodge shut) | ✅ BUILT+TESTED | `rules.formatMixIntent` (NOT a plan knob); static-only/video-only honored only when grandfathered/marked. commit `a8ae203`; plan4 T1.4 (2) |
| **#14 output distinctness (Marker-2, selection-time segments)** | ✅ BUILT+TESTED | `embed_campaign.py` per-segment pairwise (combined<0.70 AND dino<0.70), folded by `perceptual-merge.mjs`. commit `12b3c65`; `test/perceptual-merge.test.mjs` (6) |
| **#15 cluster-adherence (Marker-1 vision check, carries #9)** | ✅ BUILT+TESTED | `_archetype-centroids` + `embed_campaign.py` cosine-to-assigned-centroid → landedInLane. commit `12b3c65`; REAL-RENDER verified (F1 in-lane 0.82; mislabeled → block 0.38). `test/centroids.test.mjs` (4) |
| **#16 anti-slop** | ✅ BUILT+TESTED | objective (T1.5 `antiSlop`, commit `a8ae203`) + subjective (`slop_flag.py` Gemini, fail-soft, commit `12b3c65`) |
| **Sidecar → review merge** | ✅ BUILT+TESTED | `validatePlan` reads `campaigns/<c>/perceptual.json` + folds (absent-after-render block / sentinel / override-downgrade / corrupt-degrade) — ZERO editor-server edits. commit `12b3c65`; `test/validate-plan-perceptual.test.mjs` (5) |
| **Tier-2 advisory panel** (multi-persona) | ✅ BUILT+TESTED | `tier2-merge.mjs` (warn-only fold) + `tier2_eval.py` (3-persona Gemini, fail-soft) folded via validatePlan. commit `9cbea77`; `test/tier2-merge.test.mjs` (5) + integration; real Gemini scored isp-ad-series-1 |
| **Phase 5 — harvest** | ✅ BUILT (CLI; button DEFERRED) | `lib/promote-example.mjs` + `scripts/promote-example.mjs` (assert approved → buildEntry/validate → append + centroid rebuild). commit `84721d3`; `test/promote-example.test.mjs` (4). The review.html button → `POST /promote` route is editor-server-coupled → DEFERRED (`docs/DEFERRED-promote-route.md`) |
| **Phase 6 — Meta publish + dashboard** | ✅ BUILT (dry-run; API call human-fired) | `lib/publish-select.mjs` (approved+rendered+clean only) + `publish-meta.mjs` (dry-run, writes publish-plan.json) + `cockpit.mjs` (standalone read-only dashboard). commit `f4e4415`; `test/publish-select.test.mjs` (4). Actual `ads_create_creative` is a deliberate human-authorized MCP action, never script-fired |
| **Cleanup — unified similarity map** | ✅ BUILT | `diversity_all.py` → `_similarity-map.json` (109-example cross-archetype map + unified diversity). commit `e22bf8a`; `test/diversity-all.test.mjs` (2) |
| **G2** editor-server `/plan` ALLOWED += exampleId/archetype | ❌ ABSENT | needed for review-page re-stamps |
| **Motion generation + gate** | ✅ BUILT | fresh-motion render already wired (run-campaign); video centroids (T2.0); 3-frame video cluster-adherence + frameVariance warn. commit `076bf81`; `test/motion-adherence.test.mjs` (3); verified on isp-ad-series-1 video |

## What's LEFT (2026-06-08) — Phases 3–6 are BUILT; only the pre-live gate + deferred wiring remain

Phases 3–6 (the whole generation-quality layer: un-skippable example-faithful generation, media-fit,
format-intent, anti-slop, vision #14/#15/#16, sidecar→review merge, Tier-2, motion gate, harvest, publish,
dashboard, similarity-map) are **BUILT + TESTED + committed + validated by a blind run** (Test Run 1).
What remains:
- **The PRE-LIVE HARDENING GATE (PL-1..PL-4 above)** — must clear before any campaign goes live.
- **Editor-server-coupled wiring (DEFERRED, forbidden-file zone):** the "Save as example" `POST /promote`
  button (`docs/DEFERRED-promote-route.md`) + G2 (exampleId/archetype in the `/plan` ALLOWED allowlist).
- **Minor:** the `formatMixIntent` skill-prose note (batched into the PL-2 skill-prose pass — same locked zone).

## Next effort (do NOT blindly execute the old Phase 3–6 text)

Phases 3–6 predate the Phase-2-era changes (archetype model, measured media rubric, distinctness →
selection-time) and the verified fact that generation was never automated. The next effort is a **fresh,
reconciled plan** for the generation-quality layer grounded in this ledger, then `/double-check` + `/ultrathink`.

## Test Run 1 (2026-06-08) — the engine VALIDATED under a blind run + 4 PRE-LIVE items

A blind `/creative-engine` run (Cody's own ISP baseball copy, 6 from-scratch, 2 video/2 gif/2 static →
`isp-ad-series-1`) confirmed the anti-cheat thesis HOLDS: `--force-unsafe` refused; the 2/2/2 mix hit the
60%-video block and the agent did NOT silently downgrade it — it STOPPED, surfaced the fork, and proceeded only
on Cody's explicit override (human-override worked as designed); 0/6 copied (adversarially audited); all 6
rendered + QA-passed; the perceptual sidecar ran on real pixels. Full record:
`~/.claude/plans/re-plan-and-build-the-twinkly-micali.md` ("Test Run 1").

### PRE-LIVE HARDENING GATE — CLEARED 2026-06-08 (was tabled, then completed before go-live)
- [x] **PL-1 — override granularity.** `validate-plan.mjs` `ruleSev`: a real perceptual block downgrades ONLY
      when the honored `validation.config.json` relaxes THAT rule (`{"clusterAdherence":"warn"}`); the sentinel +
      absent stay campaign-wide downgradable. commit `322daca`; +2 tests.
- [x] **PL-2 — agent reuse-drift.** creative-engine skill: an explicit "from scratch" / exact count+mix overrides
      the phase-aware resume + is honored literally; + the `formatMixIntent` note. commit `5ed525e`.
- [x] **PL-3 — vision-gate franchisee false-positives.** #15 cluster-adherence now uses **DINOv2-only**
      (brand-agnostic structure); distinctness #14 stays combined. commit `4763c9a`. **FINDING: the color-
      false-positive hypothesis is REFUTED** — isp-ad-series-1 A1/B1/C1 stay off-lane on the structure axis
      (assigned 0.29–0.50), so they're genuine structural mismatches (A1 confounded by PL-4 baked-in text), and
      the gate is correctly fail-closed-to-human (per-rule override via PL-1 after review).
- [x] **PL-4 — Kraken source-media discipline.** Raw-footage folders only; finished-post folders (IG stories)
      bake text/emoji into pixels (invisible to the gate). Documented: `docs/creative-playbook.md` Law 0 +
      memory `feedback-kraken-raw-footage-source`.

## If this ledger ever drifts again (recovery routine)

`list_sessions` + `search_session_transcripts` for the deliverable names (e.g. `promote-example`, `media-fit
gate`) + cross-check `git log --all` and worktrees. That triangulation (code + transcripts + git) is how this
record was rebuilt on 2026-06-08.

---
title: Building the creative-engine compliance gate — what worked
date: 2026-06-03
branch: lockdown-finish
---

# Locking down the creative engine — lessons

Context: turned the creative playbook from "prose the AI follows when it wants to"
into a hard, brand-agnostic gate (`validate-plan.mjs`) + runner enforcement +
review-page surfacing + render-truth QA. Lessons that generalize:

## 1. Parallel chats in ONE checkout collide — isolate or pay later
Two Claude sessions edited this same working tree at once. `git checkout -b` does
NOT separate them — branches share one working tree, so the next commit sweeps up
BOTH chats' changes, and any `reset`/`checkout`/branch-switch can wipe the other's
uncommitted work. **Rule (already in CLAUDE.md): one chat = one git worktree;
combine only via git merge.** Recovery when already entangled: commit ONLY your
own files (verify each shared file's `git diff` is purely yours before `git add`),
leave the other chat's changes untouched, then have that chat commit to its own
branch and merge. After the merge, re-run your tests against the merged code to
catch dependency drift (the other chat had modified `fill-core.mjs`, which my
validator imports — it still worked, but that's the thing to verify).

## 2. Measure blast-radius on REAL data before flipping a hard gate
A "block on non-verbatim copy" rule sounded clean. Run against a real campaign it
was **44 blocking / 20 assets** — it would have bricked all 17 existing campaigns.
Running the validator as a read-only CLI first turned an abstract rule into a
number, which drove two good decisions: scope verbatim to *persuasive* roles
(skip factual credentials/citations/stat-labels that legitimately aren't in the
ad copy) and grandfather existing campaigns. **Always dry-run a new hard rule
across real data and read the count before enforcing.**

## 3. Enforce against the bytes that ACTUALLY render, not the plan
Statics render from a hand-edited `edits/*.config.json` after the first render and
bypass the fill-time guards; motion copy is inline in `templateData`. Checking only
the plan would miss every hand-edit. The validator resolves the *rendered* view
(edits config when present, else the fill; templateData for motion). A gate that
checks a different artifact than what ships is theater.

## 4. Hard-block only what's machine-certain; warn on judgment
First pass made beat→role coverage a hard block — it false-blocked legit
single-dominant-role cards because the playbook itself allows roles to play out of
position / be carried by media. Downgraded to a warning. **Block: media present,
ratio, verbatim, voice (emoji/!/banned), guarantee, wrong-city leak. Warn:
beat-role fit, coverage, reuse.** Over-blocking erodes trust as much as
under-enforcing — false positives ARE inconsistency.

## 5. Render-QA: decoder-free + tool-resilient
Node has no image decoder and `ffprobe`/lavfi isn't guaranteed on PATH. Detect a
black/frozen video by extracting a few frames with `ffmpeg` (already required) and
**byte-comparing** them (all-identical = dead render); parse duration from ffmpeg
stderr. If a tool is missing, **degrade to skip, never fail** — a missing binary
must not zero out a batch. Tune the heuristic to reality: the Stage background is
near-black `#0a0b0d` and logo stings are legitimately dark, so "frozen/uniform
over time" beats a brightness threshold (which false-positives).

## 6. Don't change a shared loader's contract — add a strict variant
Making `loadCopyLibrary` throw on corrupt files would have hung the editor (it's
called inside an unwrapped server handler). Added `loadCopyLibraryStrict` used only
where a throw is safe (validate-plan / intake). When a function has many callers,
add a stricter sibling rather than changing the shared contract.

## 7. Roll out with a per-item override, not a big-bang flip
"Hard-block new, warn existing" was implemented with a per-campaign
`validation.config.json {verbatim:"warn"}` grandfather file. New campaigns (no
file) get the hard block. Lets you tighten enforcement without halting in-flight
work — migrate at your own pace.

## Meta
The plan-mode discipline paid off: a code walkthrough before implementing caught
two load-bearing assumptions that were wrong (city rotation fought the
one-city-per-clone architecture; verbatim copy was authored inline, not by
reference). Finding those on paper was far cheaper than finding them at 2am.

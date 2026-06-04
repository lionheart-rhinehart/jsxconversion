---
title: Hardening gates — enforce the canonical target, calibrate on real data, stay grandfather-able
date: 2026-06-04
branch: main
---

Three lessons from building Plan 2's correctness gates (format-mix, brand-integrity,
media-decision, preflight). They generalize to any "stop shipping the wrong thing" rule.

## 1. Enforce against the canonical target, not a self-declared knob

The format-mix gate (R3) was supposed to catch a campaign that ships mostly static when
the target is 60% video. The trap: the SMAA plan had quietly set its **own**
`knobs.motionRatio` to `video: 0.22` to match what it actually produced. If the gate
compared "actual vs the plan's own knob," 22% vs 22% would have **passed** — the planner
had defeated the check by lowering the bar to meet itself.

Fix: the target is the **canonical** value from `config.json` (`CANONICAL_MOTION_RATIO`,
60/15/25), hardcoded in `validate-plan.mjs` — never read from the plan being judged. A
gate keyed on a value the thing-under-test can edit is not a gate.

## 2. Calibrate a hard gate against real data BEFORE shipping it

First cut of the ratio gate compared every bucket (video/gif/static) to its target with a
slack window. It promptly flagged `more-games-carmel` — a perfectly **healthy** 55%-video
campaign — only because it had zero gifs, so the statics absorbed the gif share (45% vs
25% target). That's a false positive that would have blocked good work.

Before trusting the rule, I dumped the actual format mix of all ~25 existing campaigns. The
real failure mode was always the same: **video collapsing** (SMAA 18%, grind-trap 35%,
confidence 24%) — never a gif↔static trade. So the gate now keys on **video share alone**
(below 60% − 15pp = block). Healthy 55%-video plans pass; motion-collapse blocks. Lesson:
a gate's threshold is an empirical question — check it against the population it will judge,
or it will block the wrong things on day one.

## 3. New rules block by default but stay grandfather-able

Turning on the format-mix block surfaced that ~15 existing AA campaigns are genuinely
under-target and would now block at re-render. Two bad options: silently rewrite 15 plans
(destroying user data), or weaken the rule so it never bites. The right answer was the
codebase's existing rollout pattern: **block by default, relax per-campaign** via
`campaigns/<c>/validation.config.json {"formatMix":"warn"}`, plus the global
`--force-unsafe` escape. New work is held to the standard; an old campaign can be
grandfathered with a one-line file — a decision the user makes, not one the engine makes
for them. Don't brick the back catalog and don't neuter the rule; give a cheap, explicit
opt-out.

## Bonus: make every fix testable by extracting a pure function

Each gate's logic lives in a small pure module (`scripts/lib/{preflight,clip-cap,
export-accounting,brand-integrity}.mjs`, `checkFormatMix`, `mediaDecision`) that takes
already-probed facts and returns a verdict — no I/O, no `process.exit` inside. The thin CLI
wrapper does the probing and exits. That's the only reason 22 regression tests could lock
these behaviors without rendering anything or hitting Supabase. A rule you can't unit-test
is a rule that silently rots (the R0 principle: an unenforced fix gets re-broken).

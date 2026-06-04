# Re-verify a plan's "verified state" against live git before acting on it

**Date:** 2026-06-04
**Branch:** main

A plan captured in plan mode is a point-in-time snapshot. Its "verified state"
section can go stale between planning and execution — especially in this repo,
where long-lived sessions and out-of-band deploys keep moving `main`.

**What happened.** Plan 1's whole premise was that `main` was fractured: a local
tip (`73472ea`, SMAA, never pushed) and a remote tip (`b7ddc20`, Castille, never
pulled) built on a common base, so a fast-forward was impossible and converging
them would conflict on `clone-core.mjs` + `run-campaign.mjs`. Task 1 was to hand-
resolve that merge as the UNION of both fixes.

But the very first thing I did was `git fetch` + `git rev-list --left-right
--count HEAD...origin/main` → `0 0`. Local and remote were already identical at
`53c051e`. The live Jarosh session (which the plan said to "land first") had
already converged everything and deployed it. The static-media union was already
present in both files. **Task 1 was done before I started.** Had I trusted the
plan's snapshot and started merging, I'd have manufactured a conflict to resolve
on an already-clean tree.

**The rule.** Before executing any step a plan calls "verified," run the cheap
check that re-derives it from live state (`git status`, `rev-list --left-right`,
a `grep` for the claimed code). Treat the plan's findings as *hypotheses to
confirm*, not facts. This is the same R0 disease the hardening effort is fixing —
state drifts, so enforce/verify against the live thing rather than a stored
belief.

**A second instance, same shape.** The SessionStart hook was assumed to be
running everywhere, but it was Linux-only (`sudo`/`apt`/`dpkg` with `set -e`) and
silently dying on the Windows desktop. The fix is the same principle applied to
code: don't assume the environment, *detect* it (`uname` gate), drop `set -e`,
and make every step best-effort so a single failure can't kill the rest — and
print one clear line either way so "it ran" is observable, not assumed.

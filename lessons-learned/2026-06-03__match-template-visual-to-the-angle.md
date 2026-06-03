# Match a template's VISUAL to the angle's meaning, not just the copy slot

**Date:** 2026-06-03
**Branch:** claude/angle-coherence-myth-truth

When choosing a template for a creative, role-fit ("does it have a claim/mechanism slot over
footage?") is necessary but NOT sufficient. The template's **graphic / visual metaphor** has to mean
what the angle means.

## What happened

Rebalancing `multisport-foundations-more-games` (angle: *"more games isn't enough — a game measures
speed, training builds it"*), I reached for `velocity-drop` and `cluster-37` because they had the
right copy slot (a claim over footage). Both render a **"BAR VELOCITY · REP BY REP" chart** — a
velocity-based-training concept (a set ends when bar speed drops 10%). That graphic has nothing to do
with "games vs training," so it actively distracted from the message. Cody flagged it.

## The fix + the insight

Replaced them with angle-coherent templates:
- C1 → `myth-vs-truth` (busts "more games → faster") — I added optional footage support to the
  template (`bgClip` + conditional `SyncedVideo` + scrim, same pattern as velocity-drop/season-clock).
- D1 → `fresh-e2e-d1` ("blame lifted line by line" over footage) — a literal D-beat blame-removal
  template.
- C3 → `cluster-13` (clean claim card, chart-free) instead of the `cluster-37` chart.

Then I audited the other angles. The punchline: **the same velocity chart is RIGHT on the
`grind-trap` angle and WRONG on `more-games`.** grind-trap is "The Last Rep Lie — the tired rep isn't
effort, it's instruction," which IS about rep velocity, so the bar-velocity-drop chart literally
visualizes the mechanism. `proof-confidence` was clean (proof/testimonial/credential templates fit a
proof angle). No other campaign misused a data-viz template.

> LESSON: before picking a template, read its header `//` comment (the visual concept) and ask "does
> this graphic mean what the angle means?" The bank has ~22 elements + ~80 templates — there's almost
> always one whose visual matches. Don't default to whatever has the right copy role. And a template
> that's perfect for one angle can be exactly wrong for another — judge per angle, not globally.

See `feedback_template_must_match_angle` in memory and the earlier lesson on the TrimmedMedia
footage fix (same session).

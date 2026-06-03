# A saved edit-snapshot silently overrides an asset's template change

**Date:** 2026-06-03
**Branch:** claude/a2-c3-d3-media-stale-edit-fix

## Symptom

Changed asset C3 in `multisport-foundations-more-games` from `cluster-37` (a velocity-bar chart) to
`cluster-13` (a clean claim card) in `creative-plan.json`, re-rendered with
`--only C3 --all`, and the MP4/PNG **still showed the chart** — repeatedly, even after confirming the
plan said `cluster-13` and that `cluster-13.{jsx,config.json}` contain no chart.

## Cause

For STATIC assets, `run-campaign` writes a per-asset rendered-config **snapshot** to
`campaigns/<campaign>/edits/<angle>__<id>.config.json`, and on subsequent renders it **prefers that
saved edit over the template** (hand-edits are treated as authoritative). The snapshot was frozen
while C3 was still `cluster-37`, so it carried the chart elements (`bar0..bar7`, `cutoff`,
`BAR VELOCITY · REP BY REP`). Switching the template in the plan did nothing because the renderer
never looked at the template — it replayed the stale snapshot.

## Fix

Delete the stale snapshot, then re-render:

```
rm campaigns/<campaign>/edits/<angle>__<id>.config.json
node scripts/run-campaign.mjs <campaign> --only <id> --all
```

It rebuilds from the new template + the asset's copyRefs and writes a fresh, correct snapshot.

## Rules of thumb

- **Changing a static asset's `template` (or its design) requires clearing its `edits/` snapshot.**
  The plan's `template` field alone is not enough.
- This only affects STATIC assets. Motion (video/gif) assets don't use the static `edits/` snapshots,
  so converting a static → motion and back can leave an orphaned (ignored) snapshot — harmless, but
  it bites if the asset is later a static again.
- When a render's output contradicts the plan, suspect a saved edit/snapshot before suspecting the
  template or the renderer.

Related: this session also fixed off-angle template choices (see
`2026-06-03__match-template-visual-to-the-angle.md`) — the C3 chart was the same off-angle visual,
just persisted via the snapshot.

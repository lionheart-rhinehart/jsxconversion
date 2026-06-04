// ============================================================================
//  scripts/lib/export-accounting.mjs — honest exit codes + status (C / R4)
// ============================================================================
//  kraken-export reported success on `pushed:0 deduped:N` and on internal aborts;
//  a re-export that REPLACED nothing still exited 0, so a stale creative could
//  silently survive. These pure helpers make the exit code and the human status
//  line tell the truth: a replace run that pushed nothing is an ERROR, any per-
//  asset failure is an ERROR, and the status distinguishes "did the whole set"
//  from "spot-checked a subset" (--only).
// ============================================================================

// Publish gate (R2): which rendered assets may be pushed to the live library.
//   default        — any asset with a rendered output (proofs + back-compat).
//   approvedOnly   — ONLY assets the user approved on the review page
//                    (status:"approved"); this is how approval gates PUBLISH
//                    under the render-proofs-first flow.
// An asset always needs an output file on disk to be publishable.
export function isPublishable(asset, { approvedOnly = false } = {}) {
  if (!asset || !asset.output) return false;
  if (approvedOnly) return asset.status === "approved";
  return asset.status === "rendered" || asset.status === "approved";
}

// Decide the process exit code from the run tallies.
//   failed > 0                       → 1 (something errored)
//   replace requested but pushed 0   → 1 (the "re-export REPLACES" promise failed —
//                                         nothing was actually re-ingested)
//   else                             → 0
export function exportExitCode({ pushed = 0, failed = 0, replace = false } = {}) {
  if (failed > 0) return 1;
  if (replace && pushed === 0) return 1;
  return 0;
}

// One honest status line. `scoped` is true when --only narrowed the run (then we
// say "spot-checked", not "checked all N"); `total` is the plan's full asset count.
export function summarizeExport({ pushed = 0, deduped = 0, skipped = 0, failed = 0, total = 0, replace = false, dryRun = false, scoped = false } = {}) {
  const evaluated = pushed + deduped + skipped + failed;
  const coverage = scoped
    ? `spot-checked ${evaluated} of ${total}`
    : `checked all ${total}`;
  const mode = dryRun ? "  (DRY RUN — nothing written)" : (replace ? "  (REPLACE)" : "");
  let warn = "";
  if (replace && pushed === 0 && !dryRun) warn = "  ✗ REPLACE pushed nothing — stale rows may remain";
  return `pushed:${pushed} deduped:${deduped} skipped:${skipped} failed:${failed} — ${coverage}${mode}${warn}`;
}

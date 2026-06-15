// creative-engine/dispatch/test-content-library.mjs
// 6.1 proof (offline part) — the fan-out manifest resolves to per-brand dispatch
// jobs, each auto-routed to its brand's workspace + destination folder, and a
// DRY-RUN reports exactly what WOULD be pushed without writing to Supabase.
//
// The LIVE push proof is a separate explicit run (cli.mjs library ... --live) so a
// test run never writes outward.

import assert from 'node:assert';
import { resolveJobs, dispatchToLibrary } from './dispatch.mjs';

const manifest = 'creative-engine/render/_out/fanout-manifest.json';

// 1. join: every ok fan-out job → a job carrying brand workspace + dest folder.
const { batchId, jobs, skipped } = resolveJobs(manifest);
assert.ok(jobs.length === 6, `expected 6 brand jobs, got ${jobs.length}`);
for (const j of jobs) {
  assert.ok(j.workspace, `${j.id} must auto-route to a workspace`);
  assert.ok(j.destFolder, `${j.id} must auto-route to a dest folder`);
  assert.ok(j.brand, `${j.id} must bind to a registry brand`);
}
console.log(`PASS — auto-route: ${jobs.length} brand jobs, each → its own workspace+folder (batch "${batchId}", ${skipped.length} skipped)`);
for (const j of jobs) console.log(`  • ${j.id} → ws=${j.workspace} folder="${j.destFolder}" (${j.type})`);

// 2. dry-run: reports, writes nothing outward (no --live). Every result is a
//    dry-run (nothing live), and each brand is EITHER a would-push or an honest
//    flagged error (e.g. an unresolved registry workspace) — never a silent drop.
const r = await dispatchToLibrary(manifest, { batchId: 'test-dryrun' });
assert.ok(r.results.every((x) => x.dryRun === true), 'no result may be a live write in a dry-run');
assert.ok(r.results.every((x) => x.action === 'dry-run' || x.action === 'error'), 'dry-run yields only would-push or flagged-error');
const would = r.results.filter((x) => x.action === 'dry-run');
const flagged = r.results.filter((x) => x.action === 'error');
// All 6 brand workspaces resolve against the LIVE Kraken DB (castille via live
// lookup; ideal via its real isp-zach-decant slug). 0 flagged is the corrected
// state — a regression here means a registry slug or the live resolver broke.
assert.strictEqual(would.length, 6, `expected 6 would-push, got ${would.length}`);
assert.strictEqual(flagged.length, 0, `expected 0 flagged, got ${flagged.length}: ${flagged.map((f) => f.id + ':' + f.error).join('; ')}`);
console.log(`PASS — dry-run: ${would.length} would-push, ${flagged.length} flagged (all workspaces resolve live), report → ${r.reportPath}`);

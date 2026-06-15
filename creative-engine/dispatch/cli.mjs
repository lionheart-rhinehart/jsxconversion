#!/usr/bin/env node
// creative-engine/dispatch/cli.mjs
//
// Phase 6 dispatch CLI — the "final screen" from the terminal.
//
//   node creative-engine/dispatch/cli.mjs library <manifest> [--live] [--replace]
//        [--workspace <ws>] [--folder <name>] [--batch <id>]
//   node creative-engine/dispatch/cli.mjs meta <manifest>
//        [--account <id>] [--campaign <id>] [--objective <OBJ>] [--batch <id>]
//
// `library` DEFAULTS TO DRY-RUN. Add --live to actually push to the Content Library
// (outward write to live Supabase — human-authorized). `meta` is ALWAYS staged: it
// writes a publish-plan and never fires a live Meta call.

import { dispatchToLibrary, dispatchToMeta } from './dispatch.mjs';

const argv = process.argv.slice(2);
const cmd = argv[0];
const manifest = argv[1];
const flag = (n) => argv.includes(`--${n}`);
const opt = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };

function usage() {
  console.error('Usage:');
  console.error('  cli.mjs library <manifest> [--live] [--replace] [--workspace ws] [--folder name] [--batch id]');
  console.error('  cli.mjs meta <manifest> [--account id] [--campaign id] [--objective OBJ] [--batch id]');
  process.exit(1);
}

if (!cmd || !manifest || (cmd !== 'library' && cmd !== 'meta')) usage();

const common = {
  workspace: opt('workspace'),
  folder: opt('folder'),
  registry: opt('registry'),
  batchId: opt('batch'),
};

if (cmd === 'library') {
  const r = await dispatchToLibrary(manifest, {
    ...common,
    live: flag('live'),
    replace: flag('replace'),
  });
  console.error(`[dispatch:library] ${r.live ? 'LIVE' : 'DRY-RUN'} batch "${r.batchId}" — ${r.summary.ok}/${r.summary.total} ok, ${r.summary.failed} failed, ${r.skipped.length} skipped`);
  for (const res of r.results) {
    if (res.ok && res.action === 'dry-run') console.error(`  • ${res.id} → WOULD push (${res.type}) to ${res.workspace} / folder "${res.folder}" [${res.folderState}]`);
    else if (res.ok) console.error(`  ✓ ${res.id} → ${res.action} ${res.contentId || ''} (folder "${res.folder}")`);
    else console.error(`  ✗ ${res.id} → ${res.error}`);
  }
  for (const s of r.skipped) console.error(`  ⊘ ${s.id} skipped: ${s.reason}`);
  console.error(`[dispatch:library] report → ${r.reportPath}`);
  process.exit(r.summary.failed > 0 ? 1 : 0);
}

if (cmd === 'meta') {
  const r = dispatchToMeta(manifest, {
    ...common,
    account: opt('account'),
    campaign: opt('campaign'),
    objective: opt('objective'),
  });
  console.error(`[dispatch:meta] STAGED ${r.plan.entries.length} creative(s) — liveFired=${r.plan.liveFired} (no Meta API call)`);
  for (const e of r.plan.entries) console.error(`  • ${e.creativeId} (${e.brand}) → status=${e.status} target.campaign=${e.target.campaign_id || '(unset)'}`);
  console.error(`[dispatch:meta] publish-plan → ${r.planPath}`);
  process.exit(0);
}

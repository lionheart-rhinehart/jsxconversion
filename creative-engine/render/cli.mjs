// creative-engine/render/cli.mjs
//
// Phase 5 entry point. Thin dispatcher over the render modules.
//
//   node creative-engine/render/cli.mjs probe
//       → print the recommended pool size for this machine.
//
//   node creative-engine/render/cli.mjs poll [--once] [--interval 15000] [--png] [--pool N]
//         [--workspace <slug|uuid>] [--approval <uuid>]
//       → start the local render poller (watches Supabase approvals='approved').
//         --once runs a single cycle and exits; otherwise loops until Ctrl-C.
//         --workspace / --approval SCOPE the poll to one workspace / one approval row
//         (default = all approved rows workspace-wide). Use a scope for a clean test run
//         so the poller doesn't churn unrelated approved rows.
//
//   node creative-engine/render/cli.mjs fanout --master ov.json --binding bind.json \
//         --tagged design.tagged.html --frame f0 [--brands id,id] [--png] [--pool N]
//       → fan one approved master out to the chosen registry brands (all if omitted).
//
// (The pooled queue itself is library code — pool.mjs / runPool — driven by poll + fanout.)

import fs from 'node:fs';
import { probe } from './probe.mjs';

const [cmd, ...rest] = process.argv.slice(2);
const flag = (name, def) => { const i = rest.indexOf(name); return i >= 0 ? rest[i + 1] : def; };
const has = (name) => rest.includes(name);
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

if (cmd === 'probe') {
  const p = probe();
  console.log(JSON.stringify(p, null, 2));
  console.log(`\nrecommended pool size: ${p.recommended}  (${p.reason})`);
} else if (cmd === 'poll') {
  const { pollOnce, pollLoop } = await import('./poller.mjs');
  const opts = {
    kind: has('--png') ? 'png' : 'mp4',
    poolSize: flag('--pool') ? Number(flag('--pool')) : undefined,
    intervalMs: flag('--interval') ? Number(flag('--interval')) : undefined,
    log: (m) => console.log(`[poller ${new Date().toISOString()}] ${m}`),
  };
  // Optional scoping: --workspace (slug/uuid) and/or --approval (uuid) build a scoped
  // live source so a test run only renders the intended row(s). pollOnce/pollLoop honor
  // an injected `source` (the same seam the fixtures use); omit it → default live source.
  const wsArg = flag('--workspace');
  const approvalId = flag('--approval');
  if (wsArg || approvalId) {
    const k = await import('../../scripts/lib/kraken.mjs');
    const workspaceId = wsArg ? k.resolveWorkspaceId(wsArg) : null;
    if (wsArg && !workspaceId) { console.error(`poll: could not resolve --workspace "${wsArg}"`); process.exit(1); }
    opts.source = {
      listApproved: () => k.listApprovedApprovals({ workspaceId, approvalId }),
      getContentOutput: (id) => k.getContentOutput(id),
    };
    console.log(`[poller] scoped to${workspaceId ? ` workspace ${wsArg}` : ''}${approvalId ? ` approval ${approvalId}` : ''}`);
  }
  if (has('--once')) { const r = await pollOnce(opts); console.log(JSON.stringify(r, null, 2)); }
  else await pollLoop(opts);
} else if (cmd === 'fanout') {
  const { runFanout } = await import('./fanout.mjs');
  const master = readJson(flag('--master'));
  const binding = readJson(flag('--binding'));
  const brandIds = flag('--brands') ? flag('--brands').split(',') : undefined;
  const { manifest } = await runFanout({
    master, binding, brandIds,
    taggedPath: flag('--tagged'), frameId: flag('--frame', 'f0'),
    kind: has('--png') ? 'png' : 'mp4',
    poolSize: flag('--pool') ? Number(flag('--pool')) : undefined,
    log: (m) => console.log(m),
  });
  console.log(`\n${manifest.summary.ok}/${manifest.summary.total} brands rendered.`);
} else {
  console.error('usage: cli.mjs <probe|poll|fanout> …  (see header for flags)');
  process.exit(1);
}

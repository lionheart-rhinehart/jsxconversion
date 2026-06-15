// creative-engine/render/test-poller.mjs
//
// Evidence for 5.3 — the local render poller, driven by a LOCAL FIXTURE (no live
// Kraken round-trip needed; same poller code that will hit Supabase in production).
//
//   node creative-engine/render/test-poller.mjs
//
// Fixture = a fake approved `approvals` row + a fake `content_outputs` row whose
// metadata.tagged_url points at the local tagged Westfield file. We drive the real
// pollOnce() three times to prove:
//   1. status='approved' + unseen (id,updated_at) → picked up + rendered locally.
//   2. SAME (id,updated_at) on the next poll → SKIPPED (ledger hit, 0 rendered).
//   3. re-approval bumps updated_at → poller re-renders automatically.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Ledger } from './ledger.mjs';
import { pollOnce } from './poller.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.resolve(__dirname, '..', '..', 'campaigns', 'westfield-100-off', 'index.tagged.html');
const OUT = path.join(__dirname, '_out', 'poller');
const STATE = path.join(__dirname, '_out', 'poller-state');
fs.rmSync(OUT, { recursive: true, force: true });
fs.rmSync(STATE, { recursive: true, force: true });

// ── fixture source (stands in for kraken.mjs) ───────────────────────────────
const approval = {
  id: 'appr-0001',
  status: 'approved',
  content_output_id: 'co-0001',
  responded_at: '2026-06-14T10:00:00Z',
  approved_by_type: 'agency',
  updated_at: '2026-06-14T10:00:00Z',
  workspace_id: 'ws-test',
  batch_id: null,
  overrides: {},   // a real override bag would key on fN:eM; empty renders the design as-is
};
const contentOutput = {
  id: 'co-0001', type: 'embed', title: 'Westfield 100 off', thumbnail_url: 'poster.png',
  content: 'https://example/live.html',
  metadata: {
    render: 'live-html', live_url: 'https://example/live.html',
    tagged_url: pathToFileURL(FIX).href,   // fixture: local tagged file (Windows-correct)
    asset_base: 'https://example/assets/', mime_type: 'video/mp4',
    frame_id: 'f0',   // pin one frame so the test renders a single creative fast
  },
};
const source = {
  listApproved: async () => [approval],
  getContentOutput: async (id) => (id === 'co-0001' ? contentOutput : null),
};

const ledger = new Ledger(path.join(STATE, 'ledger.json'));
const common = { source, ledger, outDir: OUT, cacheDir: path.join(STATE, 'cache'), kind: 'png', poolSize: 2,
  log: (m) => console.log('   ' + m) };

console.log('--- POLL 1: fresh approved row ---');
const r1 = await pollOnce(common);

console.log('--- POLL 2: same (id,updated_at) — should SKIP ---');
const r2 = await pollOnce(common);

console.log('--- POLL 3: re-approval bumps updated_at — should RE-RENDER ---');
approval.updated_at = '2026-06-14T12:30:00Z';
const r3 = await pollOnce(common);

console.log('\n=== 5.3 RESULT ===');
console.log(`poll1: picked=${r1.picked} rendered=${r1.rendered}`);
console.log(`poll2: picked=${r2.picked} rendered=${r2.rendered}`);
console.log(`poll3: picked=${r3.picked} rendered=${r3.rendered}`);
console.log('\nASSERTIONS:');
console.log(`  [${r1.rendered === 1 ? 'PASS' : 'FAIL'}] poll1 rendered the fresh approved row locally`);
console.log(`  [${r2.picked === 0 && r2.rendered === 0 ? 'PASS' : 'FAIL'}] poll2 skipped the already-rendered (id,updated_at)`);
console.log(`  [${r3.rendered === 1 ? 'PASS' : 'FAIL'}] poll3 re-rendered after updated_at bumped`);
console.log(`  [${fs.existsSync(path.join(OUT, 'appr-0001.png')) ? 'PASS' : 'FAIL'}] rendered output exists`);

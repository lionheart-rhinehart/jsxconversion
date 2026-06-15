// creative-engine/dispatch/test-meta-queue.mjs
// 6.2 proof — a creative enters the Meta queue as a STAGED publish-plan, no live fire.

import assert from 'node:assert';
import fs from 'node:fs';
import { resolveJobs } from './dispatch.mjs';
import { dispatchToMeta } from './dispatch.mjs';

const manifest = 'creative-engine/render/_out/fanout-manifest.json';
const { jobs } = resolveJobs(manifest);
assert.ok(jobs.length >= 1, 'expected at least one dispatchable job');

const r = dispatchToMeta(manifest, { account: 'act_TEST', campaign: 'camp_TEST_123', batchId: 'test-meta' });

assert.strictEqual(r.plan.kind, 'meta-publish-plan');
assert.strictEqual(r.plan.liveFired, false, 'liveFired MUST be false');
assert.strictEqual(r.plan.summary.published, 0, 'nothing may be published');
assert.ok(r.plan.entries.length === jobs.length, 'one entry per job');
for (const e of r.plan.entries) {
  assert.strictEqual(e.status, 'staged', `entry ${e.creativeId} must be staged`);
  assert.strictEqual(e.publishCall, null, 'publishCall must be null (never auto-built)');
}
assert.ok(fs.existsSync(r.planPath), 'publish-plan file written');

console.log(`PASS — Meta queue: ${r.plan.entries.length} creatives STAGED, liveFired=false, published=0`);
console.log(`  plan → ${r.planPath}`);
console.log(`  sample entry: ${JSON.stringify(r.plan.entries[0], null, 2)}`);

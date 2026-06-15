// creative-engine/dispatch/meta-queue.mjs
//
// Phase 6.2 — META / FACEBOOK QUEUE. Stage an approved + rendered creative for a
// Meta campaign. The ACTUAL publish to Meta is a deliberate, human-authorized
// action, so this module DELIBERATELY DOES NOT FIRE IT. It writes a PUBLISH-PLAN:
// a self-contained JSON describing exactly what a human (or a future authorized
// step) would push, and where.
//
// Tooling check (done, recorded here): the only Meta tools connected to this repo
// are third-eye-ads `meta_ad_accounts` / `meta_campaigns` / `meta_campaign_insights`
// — all READ-ONLY insights. There is NO publish/create-ad tool. So there is nothing
// to accidentally fire; the staged plan IS the artifact. If a publish tool is added
// later, it consumes this plan — it is never invoked from here.
//
//   dispatch jobs → buildPublishPlan() → _out/meta-publish-plan-<batch>.json
//
// The plan is a queue entry per creative: { creative file, brand, target account +
// campaign (placeholders until a human fills them), objective, status:'staged' }.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(HERE, '_out');

// A single queue entry. `status:'staged'` is the hard guarantee — nothing here is
// 'published'. account_id / campaign_id are nullable targets a human supplies.
function planEntry(job, opts) {
  return {
    creativeId: job.id,
    brand: job.brand || job.id,
    file: job.file,
    type: job.type,
    target: {
      ad_account_id: opts.account || null,
      campaign_id: opts.campaign || null,
      objective: opts.objective || 'OUTCOME_ENGAGEMENT',
      placement: job.type === 'video' ? ['reels', 'stories', 'feed'] : ['feed'],
    },
    status: 'staged',          // INVARIANT: never 'published' — publish is human-fired
    publishCall: null,         // a future authorized step fills this; we never do
  };
}

// Build the publish-plan object (no file write). Pure → unit-testable.
export function buildPublishPlan(jobs, opts = {}) {
  const dispatchable = jobs.filter((j) => j.ok !== false);
  return {
    kind: 'meta-publish-plan',
    batchId: opts.batchId || 'dispatch',
    createdAt: opts.now || null,        // stamped by caller; keeps this pure
    liveFired: false,                   // PROOF: no live Meta API call was made
    note: 'STAGED ONLY — Meta publish is human-authorized. No tool fired this; a human reviews this plan then publishes.',
    target: { ad_account_id: opts.account || null, campaign_id: opts.campaign || null },
    entries: dispatchable.map((j) => planEntry(j, opts)),
    summary: { staged: dispatchable.length, published: 0 },
  };
}

// Write the plan to _out/. Returns { path, plan }. This is the ONLY side effect —
// a local JSON file. It cannot reach Meta.
export function writePublishPlan(jobs, opts = {}) {
  const plan = buildPublishPlan(jobs, { ...opts, now: new Date().toISOString() });
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, `meta-publish-plan-${plan.batchId}.json`);
  fs.writeFileSync(out, JSON.stringify(plan, null, 2));
  return { path: out, plan };
}

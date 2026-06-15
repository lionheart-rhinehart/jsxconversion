// creative-engine/dispatch/live-proof-6-1.mjs
// 6.1 LIVE proof — push ONE fixture render (athletes-acceleration) into a clearly
// labeled test folder in AA's OWN workspace, then read it back to show the row +
// folder. Human-authorized (Cody chose the live push to AA's own workspace).

import { resolveJobs } from './dispatch.mjs';
import { dispatchJob } from './content-library.mjs';
import { resolveWorkspaceId, resolveFolder, listFolderMedia } from '../../scripts/lib/kraken.mjs';

const manifest = 'creative-engine/render/_out/fanout-manifest.json';
const FOLDER = 'creative-engine-dispatch-test';

const { jobs } = resolveJobs(manifest, { folder: FOLDER });
const aa = jobs.find((j) => j.id === 'athletes-acceleration');
if (!aa) throw new Error('athletes-acceleration job not found in fanout manifest');

console.log(`[live] pushing ${aa.id} (${aa.file}) → ws "${aa.workspace}" / folder "${FOLDER}"`);
const res = await dispatchJob(aa, { live: true, batchId: 'phase6-live-proof' });
console.log('[live] dispatch result:', JSON.stringify(res, null, 2));
if (!res.ok) process.exit(1);

// Read it back — prove the row exists IN the chosen folder.
const wsId = resolveWorkspaceId(aa.workspace);
const folder = await resolveFolder(wsId, FOLDER);
const media = await listFolderMedia(wsId, folder.id);
const landed = media.find((m) => m.id === res.contentId);
console.log(`\n[verify] folder "${folder.name}" (${folder.id}) now holds ${media.length} item(s).`);
console.log('[verify] our row in that folder:', landed ? JSON.stringify({ id: landed.id, title: landed.title, type: landed.type, content: landed.content }, null, 2) : 'NOT FOUND');
process.exit(landed ? 0 : 1);

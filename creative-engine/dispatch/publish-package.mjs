#!/usr/bin/env node
// ============================================================================
//  creative-engine/dispatch/publish-package.mjs  —  THIN CLI WRAPPER
// ============================================================================
//  The publish LOGIC lives in publish-core.mjs (shared with the editor's
//  /package/publish endpoint so the button and the command can't diverge — the
//  dependencies rule). This file only parses argv, resolves the workspace, and
//  prints. DRY-RUN is the default; --live is required to write.
//
//  Usage:
//    node creative-engine/dispatch/publish-package.mjs --pkg carmel-2c7c5b76 --workspace aa-carmel
//    node creative-engine/dispatch/publish-package.mjs --pkg carmel-2c7c5b76 --workspace aa-carmel --email cody@x.com --live
//  Flags: --pkg <slug|dir> --workspace <ws> [--folder <name>] [--email a,b]
//         [--portal-base <url>] [--limit N] [--live] [--replace]
// ============================================================================

import { resolveWorkspaceId } from '../../scripts/lib/kraken.mjs';
import { publishPackage, locatePkg } from './publish-core.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const log = (...m) => console.log('[publish]', ...m);
const die = (m) => { console.error('[publish] ERROR:', m); process.exit(1); };

const pkgArg = opt('pkg');
const workspace = opt('workspace');
const folderName = opt('folder');
const emails = (opt('email') || '').split(',').map((s) => s.trim()).filter(Boolean);
const portalBase = (opt('portal-base') || 'https://thekraken.vercel.app').replace(/\/+$/, '');
const live = flag('live');
const replace = flag('replace');
const limit = opt('limit') ? Math.max(1, parseInt(opt('limit'), 10)) : null;

if (flag('help') || flag('h') || !pkgArg) {
  console.log(`Usage: node creative-engine/dispatch/publish-package.mjs --pkg <slug|dir> --workspace <ws> [--folder <name>] [--email a,b] [--limit N] [--live] [--replace]
DRY-RUN by default (walks the tree + plans rows, writes nothing). --live uploads + ingests.`);
  process.exit(pkgArg ? 0 : 1);
}

try {
  if (!workspace) die('--workspace required');
  const pkgDir = locatePkg(pkgArg);
  const wsId = resolveWorkspaceId(workspace);
  if (!wsId) die(`could not resolve workspace "${workspace}" (check ~/.claude/client-workspaces.json)`);

  const res = await publishPackage({ pkgDir, wsId, workspace, folderName, emails, live, replace, limit, portalBase, log });

  if (!res.live) {
    log('Re-run with --live to upload + ingest + mint a portal review link.');
  } else {
    const first = res.reviewLinks[0];
    if (first) log(`portal review (frame ${first.frame_id}): ${first.reviewUrl}`);
  }
} catch (e) {
  console.error('[publish] FAILED:', (e && e.stack) || e);
  process.exit(1);
}

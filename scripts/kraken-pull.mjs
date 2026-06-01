#!/usr/bin/env node
// ============================================================================
//  scripts/kraken-pull.mjs — pull a Content-Library SOURCE folder's raw media
//  into a local cache so it can be PLACED into creatives (hand placement).
// ============================================================================
//  Usage:
//    node scripts/kraken-pull.mjs <campaign> --workspace <loc> [--folder "<name>"]
//
//  Resolution order (each can come from the flag or the per-campaign sidecar
//  campaigns/<campaign>/kraken.json):
//    1. workspace (AA LOCATION) — required; folders are workspace-scoped.
//    2. source folder — if unset, prints the live folder list and exits asking
//       you to pick one (the skill relays it).
//
//  Downloads image/video rows into a FLAT cache dir brand/kraken-cache/ (the
//  editor /media route reads each root non-recursively, so it must be flat).
//  The skill then surfaces these in the editor picker; the user places by hand —
//  we surface media, we do NOT auto-place it.
// ============================================================================

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import {
  resolveWorkspaceId, loadWorkspaces, listFolders, resolveFolder,
  listFolderMedia, downloadToCache,
} from "./lib/kraken.mjs";

const PROJECT_ROOT = resolve(".");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");
const CACHE_DIR = join(PROJECT_ROOT, "brand/kraken-cache");

// ── CLI ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const campaign = args.find((a) => !a.startsWith("--"));
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
if (!campaign) {
  console.error('Usage: node scripts/kraken-pull.mjs <campaign> --workspace <loc> [--folder "<name>"]');
  process.exit(1);
}

const planPath = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
const sidecarPath = join(CAMPAIGNS_DIR, campaign, "kraken.json");
const sidecar = existsSync(sidecarPath) ? JSON.parse(readFileSync(sidecarPath, "utf8")) : {};
const plan = existsSync(planPath) ? JSON.parse(readFileSync(planPath, "utf8")) : {};
const brand = plan.brand || "brand";
const brandPrefix = String(brand).replace(/[^a-z0-9]+/gi, "-").toLowerCase() + "-";

function saveSidecar(patch) {
  mkdirSync(join(CAMPAIGNS_DIR, campaign), { recursive: true });
  const next = { ...sidecar, ...patch };
  writeFileSync(sidecarPath, JSON.stringify(next, null, 2));
  return next;
}

async function main() {
  // 1. Workspace (AA location) — required.
  const wsName = opt("workspace") || sidecar.workspace || null;
  if (!wsName) {
    console.error("[pull] No workspace. AA is multi-location — pass --workspace <location>.");
    console.error("       Known: " + Object.keys(loadWorkspaces()).join(", "));
    process.exit(2);
  }
  const wsId = resolveWorkspaceId(wsName);
  if (!wsId) {
    console.error(`[pull] Could not resolve workspace "${wsName}".`);
    console.error("       Known: " + Object.keys(loadWorkspaces()).join(", "));
    process.exit(2);
  }
  console.error(`[pull] workspace "${wsName}" → ${wsId}`);

  // 2. Source folder — flag or sidecar; else list and exit asking for a pick.
  const folderName = opt("folder") || sidecar.sourceFolder || null;
  if (!folderName) {
    const folders = await listFolders(wsId);
    console.error(`[pull] No source folder chosen. Folders in "${wsName}":`);
    for (const f of folders) console.error(`  - ${f.name}`);
    console.error('\nRe-run with --folder "<name>" to choose the SOURCE folder.');
    process.exit(2);
  }
  const folder = await resolveFolder(wsId, folderName);
  if (!folder) {
    const folders = await listFolders(wsId);
    console.error(`[pull] Folder "${folderName}" not found in "${wsName}". Folders:`);
    for (const f of folders) console.error(`  - ${f.name}`);
    process.exit(2);
  }
  console.error(`[pull] source folder "${folder.name}" → ${folder.id}`);

  // 3. List media + cache it (flat dir, skip already-cached).
  const media = await listFolderMedia(wsId, folder.id);
  if (!media.length) {
    console.error(`[pull] folder "${folder.name}" has no image/video media.`);
  }
  mkdirSync(CACHE_DIR, { recursive: true });
  let cached = 0, skipped = 0, failed = 0, imgs = 0, vids = 0;
  for (const row of media) {
    try {
      const { skipped: was } = await downloadToCache(row, CACHE_DIR, { prefix: brandPrefix });
      if (was) skipped++; else cached++;
      if (row.type === "image") imgs++; else if (row.type === "video") vids++;
    } catch (e) {
      failed++;
      console.error(`[pull]   ✗ ${row.title || row.id}: ${e.message}`);
    }
  }

  // 4. Persist the picks so a resumed run doesn't re-ask.
  saveSidecar({
    workspace: wsName, workspaceId: wsId,
    sourceFolder: folder.name, sourceFolderId: folder.id,
  });

  console.error(
    `[pull] done — ${cached} new, ${skipped} already cached, ${failed} failed ` +
    `(${imgs} image, ${vids} video) → ${CACHE_DIR}`,
  );
  console.error(`[pull] sidecar: ${sidecarPath}`);
  console.error("[pull] open the editor and place these by hand (hand placement is sacred).");
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error("[pull] fatal:", e.message); process.exit(1); });

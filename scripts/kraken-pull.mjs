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
  listFolderMedia, downloadToCache, cacheFileName,
} from "./lib/kraken.mjs";

const PROJECT_ROOT = resolve(".");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");
const CACHE_ROOT = join(PROJECT_ROOT, "brand/kraken-cache");

// ── CLI ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const campaign = args.find((a) => !a.startsWith("--"));
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const PER_CAMPAIGN = args.includes("--per-campaign"); // editor-server passes this
const JSON_OUT = args.includes("--json");             // emit one __PULL_JSON__ line on stdout
const FILE_ID = opt("file");                          // pull ONE content item (per-file pull) instead of the whole folder
if (!campaign) {
  console.error('Usage: node scripts/kraken-pull.mjs <campaign> --workspace <loc> [--folder "<name|uuid>"] [--per-campaign] [--json]');
  process.exit(1);
}

// Per-campaign cache isolates each campaign's pulled media (the editor /media
// route reads brand/kraken-cache/<campaign>/); --flat keeps the legacy shared
// dir. Either way the dir is FLAT inside (no nesting) so the picker sees it.
const CACHE_DIR = PER_CAMPAIGN ? join(CACHE_ROOT, campaign) : CACHE_ROOT;

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

// ── cache manifest: filename → durable Kraken ref ──────────────────────────────
// Maps each cached file to its Kraken content {id,url,...} so the editor /media
// route can surface a durable reference and the static renderer can re-fetch a
// missing photo (durability mirrors how motion re-extracts asset.clip). Lives
// next to the cached bytes at <CACHE_DIR>/.manifest.json.
const manifestPath = join(CACHE_DIR, ".manifest.json");
function loadManifest() {
  try { return JSON.parse(readFileSync(manifestPath, "utf8")); } catch (_) { return {}; }
}
function recordManifest(man, row, folderId) {
  const fn = cacheFileName(row, brandPrefix);
  man[fn] = {
    id: row.id, url: row.content, title: row.title || null,
    mime: (row.metadata && row.metadata.mime_type) || null,
    type: row.type, folderId: folderId || null,
  };
  return fn;
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

  // 3. List media. For a per-file pull, narrow to the chosen content id.
  let media = await listFolderMedia(wsId, folder.id);
  if (FILE_ID) {
    const one = media.find((r) => r.id === FILE_ID);
    if (!one) {
      console.error(`[pull] file "${FILE_ID}" not found in folder "${folder.name}".`);
      process.exit(2);
    }
    media = [one];
  }
  if (!media.length) {
    console.error(`[pull] folder "${folder.name}" has no image/video media.`);
  }
  mkdirSync(CACHE_DIR, { recursive: true });
  const man = loadManifest();
  let cached = 0, skipped = 0, failed = 0, imgs = 0, vids = 0;
  let onePath = null, oneFile = null; // for the per-file JSON output
  for (const row of media) {
    try {
      const { path: dest, skipped: was } = await downloadToCache(row, CACHE_DIR, { prefix: brandPrefix });
      if (was) skipped++; else cached++;
      if (row.type === "image") imgs++; else if (row.type === "video") vids++;
      oneFile = recordManifest(man, row, folder.id); // filename → durable ref
      onePath = dest;
    } catch (e) {
      failed++;
      console.error(`[pull]   ✗ ${row.title || row.id}: ${e.message}`);
    }
  }
  // Persist the filename→ref manifest next to the cached bytes.
  try { writeFileSync(manifestPath, JSON.stringify(man, null, 2)); }
  catch (e) { console.error("[pull] manifest write failed:", e.message); }

  // 4. Persist the folder picks (resume) — NOT for an ad-hoc per-file pull.
  if (!FILE_ID) {
    saveSidecar({
      workspace: wsName, workspaceId: wsId,
      sourceFolder: folder.name, sourceFolderId: folder.id,
    });
  }

  const rel = (p) => p.slice(PROJECT_ROOT.length + 1).replace(/\\/g, "/");
  console.error(
    `[pull] done — ${cached} new, ${skipped} already cached, ${failed} failed ` +
    `(${imgs} image, ${vids} video) → ${CACHE_DIR}`,
  );
  if (!FILE_ID) console.error(`[pull] sidecar: ${sidecarPath}`);
  console.error("[pull] open the editor and place these by hand (hand placement is sacred).");

  // Machine-readable summary for the spawning editor-server (one clean stdout
  // line; all the human logs above went to stderr).
  if (JSON_OUT) {
    const summary = {
      cached, skipped, failed, imgs, vids,
      sourceFolder: folder.name, sourceFolderId: folder.id,
      cacheDir: rel(CACHE_DIR),
    };
    // Per-file pull: include the placed file's relative path + Kraken ref so the
    // editor can place it directly (and statics can stamp a durable reference).
    if (FILE_ID && onePath) {
      const ref = man[oneFile] || {};
      summary.file = {
        name: oneFile, path: rel(onePath), type: ref.type,
        krakenId: ref.id, krakenUrl: ref.url, mime: ref.mime, title: ref.title,
      };
    }
    process.stdout.write("__PULL_JSON__ " + JSON.stringify(summary) + "\n");
  }
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => { console.error("[pull] fatal:", e.message); process.exit(1); });

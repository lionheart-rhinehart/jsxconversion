#!/usr/bin/env node
// ============================================================================
//  scripts/kraken-list.mjs — read-only JSON lister for the in-page Kraken
//  browser. The editor-server SPAWNS this (it never imports kraken.mjs itself)
//  so the credentialed surface stays entirely inside standalone CLI scripts.
// ============================================================================
//  Usage:
//    node scripts/kraken-list.mjs workspaces
//    node scripts/kraken-list.mjs folders --workspace <name|uuid>
//    node scripts/kraken-list.mjs files   --workspace <name|uuid> --folder <name|uuid>
//
//  Prints ONE JSON object to stdout (errors as {error,...}). Human logs, if any,
//  go to stderr so stdout stays parse-clean for the spawning server.
// ============================================================================

import { loadWorkspaces, listWorkspacesLive, resolveWorkspaceId, listFolders, resolveFolder, listFolderMedia } from "./lib/kraken.mjs";

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--"));
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };

function out(obj) { process.stdout.write(JSON.stringify(obj) + "\n"); }

async function main() {
  if (cmd === "workspaces") {
    // LIVE list from the Kraken DB (every workspace, always current). Fall back to
    // the static client-workspaces.json dedupe if the live query fails (offline/creds).
    try {
      const live = await listWorkspacesLive();
      if (live && live.length) {
        out({ workspaces: live.map((w) => ({ name: w.name, id: w.id, label: w.label })) });
        return;
      }
    } catch (e) {
      process.stderr.write(`[kraken-list] live workspaces query failed, falling back to static: ${e.message}\n`);
    }
    // Fallback: loadWorkspaces() → { name: uuid }. Many aliases map to one UUID
    // (genesis / gsp / genesis-sports-performance → same id). Dedupe by id and
    // label each with its longest (most descriptive) alias.
    const map = loadWorkspaces();
    const byId = new Map();
    for (const [name, id] of Object.entries(map)) {
      if (!id) continue;
      const cur = byId.get(id);
      if (!cur || name.length > cur.length) byId.set(id, name);
    }
    const workspaces = [...byId.entries()]
      .map(([id, name]) => ({ name, id }))
      .sort((a, b) => a.name.localeCompare(b.name));
    out({ workspaces });
    return;
  }

  if (cmd === "folders") {
    const ws = opt("workspace");
    if (!ws) { out({ error: "missing --workspace" }); process.exit(2); }
    const wsId = resolveWorkspaceId(ws);
    if (!wsId) {
      out({ error: `unknown workspace "${ws}"`, known: Object.keys(loadWorkspaces()) });
      process.exit(2);
    }
    const folders = await listFolders(wsId); // [{id,name,parent_id}]
    out({ workspace: ws, workspaceId: wsId, folders });
    return;
  }

  if (cmd === "files") {
    // The individual media items WITHIN a folder (for per-file pull / direct
    // placement). Folder accepts a NAME or UUID; the browser passes the id.
    const ws = opt("workspace");
    const folderArg = opt("folder");
    if (!ws || !folderArg) { out({ error: "missing --workspace and/or --folder" }); process.exit(2); }
    const wsId = resolveWorkspaceId(ws);
    if (!wsId) { out({ error: `unknown workspace "${ws}"`, known: Object.keys(loadWorkspaces()) }); process.exit(2); }
    const folder = await resolveFolder(wsId, folderArg);
    if (!folder) { out({ error: `folder "${folderArg}" not found in "${ws}"` }); process.exit(2); }
    const media = await listFolderMedia(wsId, folder.id); // [{id,type,title,content,metadata}]
    out({
      workspace: ws, workspaceId: wsId, folder: folder.id, folderName: folder.name,
      files: media.map((m) => ({
        id: m.id, type: m.type, title: m.title || null,
        mime: (m.metadata && m.metadata.mime_type) || null,
        url: m.content, // public CDN url → browser thumbnails (image tiles)
      })),
    });
    return;
  }

  out({ error: `unknown command "${cmd || ""}" (use: workspaces | folders | files)` });
  process.exit(2);
}

main().catch((e) => { out({ error: e.message }); process.exit(1); });

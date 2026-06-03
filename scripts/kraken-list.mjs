#!/usr/bin/env node
// ============================================================================
//  scripts/kraken-list.mjs — read-only JSON lister for the in-page Kraken
//  browser. The editor-server SPAWNS this (it never imports kraken.mjs itself)
//  so the credentialed surface stays entirely inside standalone CLI scripts.
// ============================================================================
//  Usage:
//    node scripts/kraken-list.mjs workspaces
//    node scripts/kraken-list.mjs folders --workspace <name|uuid>
//
//  Prints ONE JSON object to stdout (errors as {error,...}). Human logs, if any,
//  go to stderr so stdout stays parse-clean for the spawning server.
// ============================================================================

import { loadWorkspaces, resolveWorkspaceId, listFolders } from "./lib/kraken.mjs";

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--"));
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };

function out(obj) { process.stdout.write(JSON.stringify(obj) + "\n"); }

async function main() {
  if (cmd === "workspaces") {
    // loadWorkspaces() → { name: uuid }. Many aliases map to one UUID
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

  out({ error: `unknown command "${cmd || ""}" (use: workspaces | folders)` });
  process.exit(2);
}

main().catch((e) => { out({ error: e.message }); process.exit(1); });

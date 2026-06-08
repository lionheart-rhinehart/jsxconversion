// ============================================================================
//  creative-editor/providers/kraken-media.mjs — a `remoteBrowse` provider that
//  wraps the standalone kraken-list / kraken-pull CLIs (so the credentialed
//  surface stays in spawned child processes, never in the editor server).
// ----------------------------------------------------------------------------
//  createKrakenMediaProvider({ cwd, scriptsDir }) -> { remoteBrowse }
//
//  It is BROWSE-ONLY (workspaces -> folders -> files -> pull-file). The media
//  GRID (list/filePath) + upload come from a LOCAL media provider; a host
//  composes them: { ...localProvider, remoteBrowse: krakenProvider.remoteBrowse }.
//  The campaign-specific routes (/kraken/state, whole-folder /kraken/pull) are
//  NOT here — a host plugin owns those (it needs the campaigns/ dir + sidecar).
//
//  `cwd` MUST be the host project root: the CLIs resolve their config + creds
//  relative to it (.../config.json -> The Kraken's .env.local). NODE-ONLY.
// ============================================================================
import { spawn } from "node:child_process";
import { join } from "node:path";

export function createKrakenMediaProvider({ cwd = process.cwd(), scriptsDir = "scripts" } = {}) {
  const runNode = (args) =>
    new Promise((resolve) => {
      const p = spawn("node", [join(scriptsDir, args[0]), ...args.slice(1)], { cwd });
      let stdout = "", stderr = "";
      p.stdout.on("data", (d) => (stdout += d));
      p.stderr.on("data", (d) => (stderr += d));
      p.on("error", (e) => resolve({ code: -1, stdout, stderr: String((e && e.message) || e) }));
      p.on("exit", (code) => resolve({ code, stdout, stderr }));
    });
  const parse = (stdout) => { try { return JSON.parse((stdout || "").trim() || "{}"); } catch { return null; } };
  const pullSummary = (stdout) => { const m = (stdout || "").match(/__PULL_JSON__ (.+)/); if (m) { try { return JSON.parse(m[1]); } catch { /* fall */ } } return null; };

  return {
    remoteBrowse: {
      // { workspaces:[{name,id,label?}] } — degrades to [] (never throws); one
      // self-heal retry, mirroring the AA route's behaviour under load.
      async workspaces() {
        const attempt = async () => {
          const { code, stdout, stderr } = await runNode(["kraken-list.mjs", "workspaces"]);
          const j = parse(stdout) || {};
          const ok = code === 0 && !j.error && Array.isArray(j.workspaces) && j.workspaces.length > 0;
          return { ok, code, j, stderr };
        };
        let r = await attempt();
        if (!r.ok) r = await attempt();
        if (r.code !== 0 || r.j.error) return { workspaces: [], error: r.j.error || (r.stderr || "").slice(-300) };
        return { workspaces: r.j.workspaces || [] };
      },
      // { workspace, workspaceId, folders:[{id,name,parent_id}] } | { error }
      async folders({ workspace } = {}) {
        if (!workspace) return { error: "missing workspace" };
        const { stdout, stderr } = await runNode(["kraken-list.mjs", "folders", "--workspace", workspace]);
        const j = parse(stdout);
        return (j && !j.error) ? j : (j || { error: (stderr || "").slice(-300) || "folder list failed" });
      },
      // { workspace, workspaceId, folder, folderName, files:[{id,type,title,mime,url}] } | { error }
      async files({ workspace, folder } = {}) {
        if (!workspace || !folder) return { error: "missing workspace/folder" };
        const { stdout, stderr } = await runNode(["kraken-list.mjs", "files", "--workspace", workspace, "--folder", folder]);
        const j = parse(stdout);
        return (j && !j.error) ? j : (j || { error: (stderr || "").slice(-300) || "file list failed" });
      },
      // { exitCode, ...summary, stderr } — campaign-optional per-file pull. WITH a
      // campaign -> its per-campaign cache; WITHOUT -> the neutral CACHE_ROOT (the
      // "_library" placeholder satisfies the CLI's positional; a per-file pull writes
      // no sidecar, so no campaigns/_library/ is created).
      async pullFile({ workspace, folder, file, campaign } = {}) {
        if (!workspace || !folder || !file) return { exitCode: 1, error: "need workspace, folder, file" };
        const args = campaign
          ? ["kraken-pull.mjs", campaign, "--workspace", workspace, "--folder", folder, "--file", file, "--per-campaign", "--json"]
          : ["kraken-pull.mjs", "_library", "--workspace", workspace, "--folder", folder, "--file", file, "--json"];
        const { code, stdout, stderr } = await runNode(args);
        return { exitCode: code, ...(pullSummary(stdout) || {}), stderr: (stderr || "").slice(-2000) };
      },
    },
  };
}

#!/usr/bin/env node
// ============================================================================
//  scripts/dev.mjs — one-command local dev for the creative engine.
//  Launches BOTH servers in one terminal, with the editor server on `--watch`
//  so server-side code changes (editor-server.mjs + its in-process imports like
//  fill-core/roles) reload AUTOMATICALLY — no manual Ctrl+C restart.
//
//  Why this exists: editor-server is a plain Node process and does NOT hot-reload
//  on its own; without --watch you must restart it by hand after every server
//  change (the recurring "my fix isn't live" trap). The review server reads files
//  fresh per request, so its content is always live — --watch there just covers
//  edits to serve.mjs itself.
//
//  PARALLEL CHATS: ports are picked PER WORKSPACE so two checkouts can run at once
//  without an EADDRINUSE clash (see docs/parallel-chats.md). The MAIN checkout keeps
//  the historical 5173/5599 so the primary chat is unchanged; a git worktree (cwd
//  under .claude/worktrees/<name>) starts higher, and either way we probe for the
//  first FREE port so two worktrees can't deadlock on the same base. The chosen
//  ports are written to ./.dev-ports.json so the render scripts (run-campaign.mjs,
//  kraken-export.mjs) talk to THIS workspace's server, not another chat's.
//
//  Usage:  npm run dev        (Ctrl+C stops both)
//          EDITOR_PORT / REVIEW_PORT env vars force an exact port (skip the probe).
//  Run it from the checkout you want to serve (main OR a worktree root).
// ============================================================================
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const CWD = resolve(".");
const isWorktree = CWD.replace(/\\/g, "/").includes("/.claude/worktrees/");
// Worktrees start 10 above main; the free-port probe below settles the exact value,
// so several worktrees just cascade upward instead of colliding.
const EDITOR_BASE = isWorktree ? 5183 : 5173;
const REVIEW_BASE = isWorktree ? 5609 : 5599;

// First free port at or above `start` (bounded so a bug can't scan forever).
// IMPORTANT: probe with `listen(p)` and NO host — the real servers
// (editor-server.mjs:945, serve.mjs) bind dual-stack `::` the same way. Probing
// 127.0.0.1 instead would report a port "free" that another `::`-bound server
// already holds, then the real bind would EADDRINUSE.
function findFreePort(start) {
  return new Promise((res, rej) => {
    const tryPort = (p) => {
      const srv = createServer();
      srv.once("error", (e) => {
        srv.close();
        if (e.code === "EADDRINUSE" && p < start + 100) tryPort(p + 1);
        else rej(e);
      });
      srv.once("listening", () => srv.close(() => res(p)));
      srv.listen(p);
    };
    tryPort(start);
  });
}

// Explicit env wins (exact port, no probe); otherwise grab the first free one.
const editorPort = process.env.EDITOR_PORT
  ? Number(process.env.EDITOR_PORT)
  : await findFreePort(EDITOR_BASE);
const reviewPort = process.env.REVIEW_PORT
  ? Number(process.env.REVIEW_PORT)
  : await findFreePort(REVIEW_BASE);

// Record the chosen ports for this checkout so render scripts find THIS server.
writeFileSync(
  join(CWD, ".dev-ports.json"),
  JSON.stringify({ editor: editorPort, review: reviewPort }, null, 2) + "\n",
);

const SERVERS = [
  // editor: plan API + render. Reads EDITOR_PORT from its env (editor-server.mjs:38).
  { name: "editor", args: ["--watch", "scripts/editor-server.mjs"], env: { ...process.env, EDITOR_PORT: String(editorPort) } },
  // review: static review page. Takes its port as argv[2] (serve.mjs:15).
  { name: "review", args: ["--watch", "brand/video-templates/serve.mjs", String(reviewPort)] },
];

const procs = SERVERS.map(({ name, args, env }) => {
  const p = spawn(process.execPath, args, { stdio: "inherit", env: env || process.env });
  p.on("exit", (code) => console.error(`[dev] ${name} exited (code ${code})`));
  p.on("error", (e) => console.error(`[dev] ${name} failed to start: ${e.message}`));
  return p;
});

// Print a ready-to-open review URL. The ?api=/&editor= params are ALWAYS included so
// the page hits this workspace's editor-server regardless of port (review.html falls
// back to :5173 only on the default :5599 — a worktree port would otherwise 404).
const editorOrigin = `http://localhost:${editorPort}`;
console.log(`\n[dev] workspace: ${isWorktree ? "worktree" : "main"} (${CWD})`);
console.log(`[dev] editor : ${editorOrigin}/`);
console.log(`[dev] review : http://localhost:${reviewPort}/review.html?campaign=<name>&api=${editorOrigin}&editor=${editorOrigin}`);
console.log(`[dev] ports → .dev-ports.json (editor ${editorPort}, review ${reviewPort})\n`);

const stop = () => { for (const p of procs) { try { p.kill(); } catch (_) {} } process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

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
//  Usage:  npm run dev        (Ctrl+C stops both)
//  Run it from the MAIN checkout (D:\Claude CODE\jsxconversion), not an old worktree.
// ============================================================================
import { spawn } from "node:child_process";

const SERVERS = [
  { name: "editor", args: ["--watch", "scripts/editor-server.mjs"] }, // :5173, auto-reload
  { name: "review", args: ["--watch", "brand/video-templates/serve.mjs"] }, // :5599
];

const procs = SERVERS.map(({ name, args }) => {
  const p = spawn(process.execPath, args, { stdio: "inherit" });
  p.on("exit", (code) => console.error(`[dev] ${name} exited (code ${code})`));
  p.on("error", (e) => console.error(`[dev] ${name} failed to start: ${e.message}`));
  return p;
});

const stop = () => { for (const p of procs) { try { p.kill(); } catch (_) {} } process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

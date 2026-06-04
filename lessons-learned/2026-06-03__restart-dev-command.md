# A dev-server restart command must scope its kills to the workspace's own ports

**Date:** 2026-06-03
**Branch:** restart-dev-command

## Why this exists

After the per-workspace port change to `dev.mjs`, the running dev server had to be
restarted to pick up the new launcher (`--watch` covers the server *code* —
`editor-server.mjs`/`serve.mjs` and their imports — but NOT `dev.mjs` itself, which
is run without `--watch` and only picks ports once at startup). Rather than make the
user do the Ctrl+C-then-rerun dance, we added `scripts/restart-dev.mjs` (exposed as
`npm run restart` and, once skills are unlocked, the `/restart-dev` slash command).

## The key design rule: scope kills to THIS workspace's ports

A restart command that kills "the dev server" by a hardcoded port (or by a broad
`node` / `*dev.mjs*` command-line match) will, in a parallel-chats setup, **kill other
worktrees' servers too**. The fix:

- Resolve the target ports from **this checkout's `.dev-ports.json`** (the exact pair
  `dev.mjs` last bound). Only if that's absent fall back to the *base pair for this
  checkout type* — main `5173/5599`, worktree `5183/5609` — **never a bare 5173/5599
  from a worktree**, or a worktree restart would nuke the main checkout's server.
- Kill by **who is listening on those ports**, then walk up the node-only parent chain
  (worker → `--watch` supervisor → `dev.mjs`/`npm`) so the whole tree dies and nothing
  lingers or respawns. Starting from the port listener keeps it scoped to this tree.

This mirrors the same principle as the port isolation itself: identify work by the
port the workspace actually owns, not by a global name.

## Gotchas worth remembering

- **`$pid` is a PowerShell automatic variable** (the current process's PID). Never use
  it as a loop variable when finding processes to kill — it silently shadows nothing
  and you'll target the wrong thing. Used `$owner` / `$cur` / `$par` instead.
- **Relaunch detached** (`spawn(..., { detached: true, stdio: [..,file,file] }).unref()`)
  so the new servers outlive the command **and** the chat/terminal that launched them.
  Logs go to `.tmp/dev-server.log`; follow with `Get-Content … -Wait`. A server started
  in my Bash background instead would die when the session ends — wrong for a long-lived
  dev server.
- The global `/dev-restart-refresh` skill targets ports **3000/3001** — it's for a
  different project and will NOT touch the creative-engine servers (5173/5599). Don't
  reach for it here.

## Verifying a restart actually took

Confirm the NEW process is live, not the old one: check `.dev-ports.json` was rewritten,
the log shows the new launcher banner (`[dev] workspace: …`), and the listening PIDs
differ from the pre-restart ones. "It printed a URL" is not proof the old one died.

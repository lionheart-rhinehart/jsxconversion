---
name: restart-dev
description: Restart this project's creative-engine dev servers (the editor server + review-page server). Frees THIS workspace's ports and relaunches dev.mjs detached so the servers persist after the command and the chat exit. Trigger when the user runs /restart-dev, or asks to restart / bounce / reload / kick the dev server or preview server for the creative engine — especially after editing scripts/dev.mjs (which --watch does NOT hot-reload).
---

# /restart-dev — Restart the creative-engine dev servers

Run this from the repo root:

```
node scripts/restart-dev.mjs
```

(equivalently `npm run restart`.)

## What it does

`scripts/restart-dev.mjs` frees **this workspace's** editor/review ports — the exact
pair in `.dev-ports.json`, else the base pair for this checkout type (main `5173/5599`,
worktree `5183/5609`) — kills the old server tree, and relaunches `scripts/dev.mjs`
**detached** so the servers keep running after this command (and this chat) exit. Server
logs go to `.tmp/dev-server.log`.

Because it scopes by this workspace's own ports, running it in a worktree never kills
the main checkout's server (or another worktree's).

## After it runs

Report to the user the **review URL the script printed** — of the form
`http://localhost:<review>/review.html?campaign=<name>&api=http://localhost:<editor>&editor=http://localhost:<editor>`
— and mention the log path (`.tmp/dev-server.log`; follow with
`Get-Content "<path>" -Wait`).

If ports weren't confirmed within the script's wait window, tell the user to check the
log — the most common cause is the servers still warming up.

## Do NOT confuse with /dev-restart-refresh

The global `/dev-restart-refresh` skill targets ports **3000/3001** — it's for a
different project and will NOT touch the creative-engine servers. Use `/restart-dev`
(this one) here.

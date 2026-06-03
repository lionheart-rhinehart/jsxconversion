# Browse-first Kraken, the real "not live" fix (--watch), and: check main before rebuilding

- **Date:** 2026-06-03
- **Branch:** claude/kraken-browse-livereload

## The two problems behind "the IG pull is stuck and my changes never go live"

### 1. The pull hung because it bulk-downloaded the whole folder
The Kraken "Pull" button downloaded *every* file in a folder before showing anything. IG Stories =
6 images + **207 videos** (many GB), downloaded sequentially with no timeout/progress, so it sat on
"Pulling…" for minutes — or forever if one video stalled. The right model is **browse-first**: list
the folder's media as thumbnails straight from the public Supabase URLs (no download), and download
only the one file the user places.

**Key surprise:** that browse-first model had **already been built and merged to `main` by a parallel
session** (`/kraken/files` lists remote items; `/kraken/pull-file` downloads one on place; the
KrakenBar renders remote thumbnails). I almost rebuilt it from scratch because my worktree was **4
commits behind main**. All that was actually left to do was delete the leftover bulk **"Pull" button**
(the footgun) from `review.html` + `out/editor/editor.html`.

> **LESSON: before building a feature, sync to and READ current `main`.** In a multi-worktree / parallel-
> chat setup, another session may have already shipped it. `git fetch origin main` + branch fresh off
> `origin/main` before implementing — never build on a stale worktree (you'll rebuild or clobber).

### 2. "My changes aren't live" (the ~8th time) = a bare Node server with no hot-reload
`editor-server.mjs` (:5173) is a plain `node` process. It loads its route/logic code **once at start**
and does NOT hot-reload. So every server-side change was invisible until that process was **restarted**
— and nothing restarted it. Cursor never required this because those projects ran a framework dev
server (Vite/Next/nodemon) with a built-in file watcher; this is bare `node`.

**Fix:** `npm run dev` (new `scripts/dev.mjs`) runs editor-server under **`node --watch`**, which
auto-restarts on any change to it or its in-process imports (`fill-core.mjs`/`roles.mjs`) — including
when a deploy fast-forwards the main checkout. Verified: editing `editor-server.mjs` triggered
`Restarting…` and it kept serving, no manual step. Also `dev:editor` / `dev:review` for two terminals.

> What is/ isn't live without a restart: **live** = client files (`review.html`/`.jsx`/`editor.html`,
> served fresh + `no-store`) and the spawned Kraken CLIs (fresh child process per call). **NOT live
> until restart** = `editor-server.mjs` + its in-process imports. Only that one server needs `--watch`.

## Also
- Run the app from the **main checkout** (`D:\Claude CODE\jsxconversion`), never a stale worktree.
  `/full-deploy-light` already fast-forwards the main checkout after merge (`syncLocalMainAfterMerge`).
- The `/kraken/pull` (bulk) endpoint stays for CLI use; only the UI button was removed.

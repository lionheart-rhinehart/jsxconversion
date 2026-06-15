# Phase 5 — pool render in CHILD PROCESSES for real failure isolation

**Date:** 2026-06-14 · **Area:** `creative-engine/render/`

## The gotcha

The pooled render queue (5.1) must guarantee that one bad creative can't wedge the batch
(5.2). The tempting implementation is an in-process concurrency limiter that `await`s N
`render-frame.mjs` calls via `Promise.all`. **That cannot deliver the guarantee.**
`render-frame.mjs` drives a headless Chrome in the same process tree; a job that hangs has
no clean kill, and an uncaught throw inside the shared browser context can poison siblings.

## The fix

Run **each job as a child process** (`run-job.mjs` → `spawn(node, render-frame.mjs …)`).
Then:
- **timeout** = `child.kill('SIGKILL')` after N ms — a real, OS-level stop.
- **crash** = a non-zero exit code the parent reads; nothing propagates into the scheduler.
- **retry-once** = re-spawn; 2 attempts total (watch the loop counter — a `for` post-increment
  over-reports `attempts` as 3; track the iteration explicitly).
- success is gated on `exit 0 AND output file exists AND size > 0` (a 0-exit that produced
  no MP4 is still a failure — no silent "rendered nothing").

`pool.mjs` is then a trivial sliding-window scheduler; `manifest.mjs` records every result
so failures are visible, never silently dropped. Proven: 2 poison jobs (bad frame id +
300ms timeout) injected mid-batch → 6/6 good jobs completed, both failures in the manifest.

## Windows `file://` landmine (again)

The poller fetches the tagged HTML to a local file before rendering. Parsing a `file://`
URL with `new URL(url).pathname` doubles the drive letter and leaves `%20` in spaces on
Windows (`D:\D:\Claude%20CODE\…` → ENOENT). Always use `fileURLToPath()` / `pathToFileURL()`
from `node:url` — never hand-roll. (Same lesson the renderer already learned for swap srcs.)

## Brand fan-out maps cleanly onto the existing override model

No new render path was needed for 5.4: the 5 swap vars (name/eyebrow→`text`, logo/media→`src`,
color→`color`) are all fields `apply-overrides.js` already applies. Fan-out = clone the master
bag + a per-design **binding** (which element key is each var) + the brand's values. A per-field
`diffOverrides()` then *proves* only those 5 changed — receipts over assertion.

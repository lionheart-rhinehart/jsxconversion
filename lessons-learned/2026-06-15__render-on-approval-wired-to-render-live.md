---
title: Wiring render-on-approval to the zero-loss renderer — one gate, one batch server, real MP4
date: 2026-06-15
branch: main
---

## What this finished

The render-on-approval chain (poller → pool → run-job → renderer; + fan-out) was built in Phase 5
BEFORE the zero-loss `render-live.mjs` existed, so it still rendered through the OLD static
`render-frame.mjs` — which freezes JS-driven animations (Campaign B). This wired the chain to
`render-live` for live exports and proved it end-to-end LOCALLY with a real MP4. No live Kraken writes
(Cody chose "local-but-real"; live recon showed the organic round-trip is blocked on the Kraken repo —
39 approved rows, zero are v2 embed/live-html).

## The shape of the change (small + surgical)

Two optional job fields are the hinge: `job.live` (bool) + `job.url` (http). `run-job.mjs buildArgs`
branches on `job.live` — `render-live.mjs <http-url> <frameId>` vs `render-frame.mjs <file> <frameId>`;
the flag grammar (`--overrides`/`--at`/`--mp4`) is identical for both CLIs, so only the executable +
first positional differ. Child-process isolation/timeout/retry untouched.

## Two decisions that made it clean

1. **The liveness gate: `render==='live-html' && !file://`.** This is the keystone. The existing
   `test-poller.mjs` fixture is `live-html` BUT points at a `file://` PRE-TAGGED Westfield artifact.
   Gating on "not file://" routes that fixture to the STATIC renderer (correct — it's pre-tagged) and
   routes real packaged exports (relative/http `tagged_url`) to the LIVE renderer. Net result: every
   existing test stayed green with ZERO edits to them. `isServedLive(meta, baseUrl)` is the one
   predicate; `deriveLiveUrl(meta, baseUrl)` is the one URL rule (`baseUrl + asset_base + basename`),
   both exported from `approvals.mjs` and asserted by a fast unit test.

2. **The poller owns ONE HTTP server per cycle.** `render-live` needs the design served over HTTP (so
   `<video>` Range-seeks) — it can't take a file path. So `pollOnce` resolves every content_output
   FIRST, and if ANY are served-live it starts one `createServer()` (the editor's `serve.mjs`) on an
   ephemeral port (the exact pattern `intake/lib/frame-map.mjs` uses), hands each live job a
   `baseUrl`, and closes the server in a `finally` AFTER `runPool` is awaited — so the server outlives
   every child render. Live jobs bypass `fetchToFile` entirely (no local cache; served in place).

## Evidence (real artifacts, not assertions)

`creative-engine/render/test-live-roundtrip.mjs` (real Carmel, skips if `_in/` absent): PNG 526KB +
**MP4 1.42MB** rendered via render-live; fan-out to 2 brands (per-brand outputs); dispatch library
DRY-RUN routed both, 0 live Kraken writes — 10/10 PASS. **Motion proven, not claimed:** `ffprobe`
shows 210 frames @30fps/7s and frame@0.2s ≠ frame@3s (the count-up the static path used to freeze).
Committed regression `test/render-live-path.test.mjs` (bare-checkout safe: an inline-rAF JS-built
export + the gate unit asserts). `npm test` 181/181; `test-poller.mjs` 4 PASS (static path intact).

## Landmines / notes

- `dispatchToLibrary(manifestPath, opts)` takes a PATH (reads the file), not the manifest object —
  the harness writes the fan-out manifest then passes its path.
- Fan-out shares ONE source url across all brands (it swaps overrides only); the harness used an empty
  binding to prove the chain — override-swap fidelity (the 5 vars) is already covered by `test-fanout.mjs`.
- MP4 is ~210 captures + ffmpeg → slow; the committed test uses PNG (no ffmpeg), the harness wraps MP4
  in try/catch for a clean skip. Never lower run-job's 5-min default.

## Still open (the genuinely-remote half)

Remote publish (upload a package → Kraken Storage → public `tagged_url`) and the Kraken-repo editor
mount + embed-row creation + override persistence — those produce the REAL approved live-html rows.
Until they exist, the organic round-trip can't run; our half is now proven and waiting.

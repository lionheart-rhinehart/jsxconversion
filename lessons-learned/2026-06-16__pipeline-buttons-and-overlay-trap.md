---
title: Pipeline behind buttons (publish-core reuse) + don't drop a floating button on top of existing UI
date: 2026-06-16
branch: main
---

## What shipped

The creative-engine pipeline is now button-driven, reusing the working engine (no rebuild):
- `publish-core.mjs` — the publish loop extracted from the CLI; `publish-package.mjs` is now a thin
  wrapper. ONE shared core so the button and the command can't diverge.
- `serve.mjs` `pipelineRoutes()` — `/package/publish` (dry-run + confirm-live), `/package/status`
  (receipt + `listApprovedApprovals` + rendered-file check + poster/edits), `/package/render`
  (scoped `pollOnce` source), `/package/dispatch` (`dispatchToLibrary`, confirm-gated).
- `pipeline.html` — a control surface: every frame as a row with a **thumbnail**, an **Edited** flag,
  a **checkbox** (edited rows auto-selected), and **Send selected / Send all / Render / To library**.
- Editor host: a **💾 Save & Send to approval** button that saves the current edits THEN opens the
  pipeline (so "send" can never ship unsaved work).
- Email stays Kraken's job (documented in the handoff doc; no mailer in this repo by design).

## Two traps hit (both = the dependencies/verify rule)

1. **A floating button covered the Save button.** I added a fixed-position button at top-right without
   checking the toolbar layout — it landed exactly on top of `.ce-save`, so the user thought Save was
   removed. Lesson: after adding any floating/overlay UI, VERIFY it doesn't overlap existing controls
   (measure `getBoundingClientRect` of both, assert no overlap). Moved it top-left; proven no overlap.

2. **"Empty pipeline page" was a stale server, not a bug.** New `serve.mjs` routes only exist on a
   server STARTED AFTER the change (Node doesn't hot-reload). The user's long-lived editor server had
   no `/package/status` → the page's fetch 404'd → blank table. Lesson: when adding server routes,
   remember the user must restart/redeploy + open a FRESH port; and pages should show a clear
   "server may be running older code — redeploy + fresh port" empty-state instead of a blank table.

## Verified
- CLI publish unchanged; `test/serve-pipeline.test.mjs` (frameIds/limit/all, endpoint dry-run,
  needWorkspace, status); full suite 211/0; editor harnesses (phase-c, phase-d-mediaflow) PASS.
- Live: pipeline page renders 20 designs with loaded thumbnails, edited frame (f0) auto-selected,
  "Send selected (1)"; Save button no longer covered; Save & Send POSTs overrides before opening.
- Gated on the human approval step: render + "To library" LIVE proof happens once a row is approved
  in the portal.

---
title: Creative-engine — verbatim copy re-bind, Kraken media UI, durable static media, and the multi-worktree server trap
date: 2026-06-03
branch: claude/condescending-murdock-1bbecd
---

A long session on `multisport-foundations-media`: re-binding copy to verbatim references, fixing the Kraken media UI, adding per-file pull + durable static media, and several debugging traps. The reusable lessons:

## 1. The multi-worktree server trap (cost the most time)
Multiple chats/worktrees run `serve.mjs` / `editor-server.mjs` on various ports. **A port like `:5710` may belong to a *different* worktree.** A feature looked completely broken (an effect "never ran") — but I was testing another worktree's older `review.html`.
- **Before debugging a "broken" front-end, confirm the served file contains your edit:** `curl -s localhost:<port>/review.html | grep -c "<a-string-from-your-edit>"`. If 0, you're hitting the wrong server.
- Start your own isolated pair on free ports and pass `?api=http://localhost:<editorPort>` to `review.html`. `editor-server` honors `EDITOR_PORT`; `serve.mjs` takes the port as `argv[2]`.
- `run-campaign.mjs` patches the plan via `EDITOR_SERVER`/`EDITOR_PORT` (default **5173**) — always run it with `EDITOR_PORT=<your port>` or it writes status into another worktree's plan. The `"plan patching via editor-server (:5173)"` log string is hardcoded and misleading; it actually uses your env.
- `out/`, `brand/kraken-cache/`, `node_modules/`, and `templates/**/assets/swap-*` are all **gitignored** → a fresh worktree has none of them. Renders/media/deps don't travel via git; only the plan + tracked `edits/*.config.json` do.

## 2. Copy is verbatim BY REFERENCE; the render path, not the plan, is the source of truth
- On-creative copy must come from `campaigns/<c>/copy-library.json` via `asset.copyRefs`/`asset.hookRef` (resolved in `scripts/lib/copy-resolve.mjs` → `assemble.mjs`). The engine **never authors** copy. `verbatimGuard` flags anything not traceable to the docs.
- **Statics freeze:** once `edits/<angle>__<asset>.config.json` exists, the renderer + editor read it and **never re-fill** (protects hand placement). So re-binding copy in the plan does NOT reach a static — you must rewrite the `.text` of each layer in the edit file (built `scripts/rebind-static-copy.mjs` for this: re-resolve via `resolveStaticConfig`, write only matching `el.text`, preserve geometry/media).
- **Motion is either/or:** `buildMotionData` uses `asset.templateData` wholesale and skips the ref branch if it exists. To rebind motion copy, put the verbatim text directly into `templateData` (it still renders verbatim). It also **force-overrides `eyebrow`** with the locale anchor (`run-campaign.mjs:218`).
- **The `hookRef` length-ladder hijack:** for a tight `maxChars` slot, the ladder swaps your hook for the shortest alt-hook *in the same `ad`* — and two different ads can share the label `"AD 2"`, so it can grab an off-theme hook (and duplicate copy across assets). For tight/precise slots use `copyRefs` (exact, no ladder), not `hookRef`.
- **Tiny "kill-phrase" templates** (cluster-34/35/41, maxChars 22–28) can't hold a verbatim sentence; `renderTextLayer` uses a fixed `fontSize` (no shrink-to-fit). Swap to a roomier cluster (and bump `knobs.repetitionCap` since the AA-native bank is only 30–42, all used once). Constraint priority: voice/guarantee > beat/role correctness > coverage > knobs.

## 3. Picked media: two representations, don't conflate them
- `data[imageKey]` (e.g. `bgClip`) is an **absolute `http://localhost:<port>/media-file/...` URL** used ONLY by the live `<Stage>` preview (the browser needs an http URL).
- The render **ignores it**: `renderTemplateMotion` uses `asset.clip`/`asset.photo` (a **project-relative** path), `join(PROJECT_ROOT, ...)`, then ffmpeg-extracts frames (`run-campaign.mjs:342-371`). So rendering is already portable via `asset.clip`. **Do not "migrate" `data[imageKey]` to a relative path — it would black out the preview and fix nothing.**
- Upload/place must go through `pickClip`/`pickPhoto` (set the `clip`/`photo` STATE → `asset.clip` on save), NOT a bare `setField(imageKey,…)`, or the render loses the footage.

## 4. Durability pattern (per-file Kraken pull + restore-at-render)
Neither `swap-*` nor `kraken-cache` travel via git, so "durable" = **a tracked reference + re-fetch**, mirroring how motion re-extracts `asset.clip`.
- `kraken.mjs` already exposes the primitives: `listFolderMedia(ws, folderId)` + `downloadToCache(row, dir)` + `cacheFileName`. No new core functions needed.
- `kraken-pull.mjs --file <id>` pulls one item and writes `brand/kraken-cache/<campaign>/.manifest.json` (`filename → {krakenId, krakenUrl}`). `/media` passes the ref through; placements stamp it into `config.media`. `renderTemplateStatic` re-fetches a missing photo from `krakenUrl` before render (verified: "restored static media from Kraken"). Backward-compatible — committed `batch-media` statics never hit the restore path.
- **`--per-campaign` caches to a subdir** (`brand/kraken-cache/<campaign>/`), but flat plan clip paths reference `brand/kraken-cache/<file>` — a mismatch that renders video without footage. Keep the placed path consistent with where the file actually lands.

## 5. Process
- **Outbound writes (Kraken export, push/merge) are gated by the safety classifier** even when in an approved plan — surface it and let the user authorize; don't route around it.
- The `Edit` tool fails with "modified since read" whenever a background script (rebind/render) rewrote the file — re-read before editing. For multi-field JSON patches, a small `node -e` script is more robust than several `Edit`s.
- Verify front-end changes by **loading the page headlessly with Puppeteer** (already installed) and asserting components mount / requests fire — but first confirm you're hitting the right server (lesson #1).

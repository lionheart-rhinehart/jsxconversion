# Starter prompt — mount the CreativeEngine editor in the Kraken approval portal

> Paste the block below into a NEW chat opened with the working directory set to the **Kraken repo**
> (`D:\Claude CODE\The Kraken`). It closes the only remaining gap in the /creative-engine v2 pipeline:
> the engine repo's half is built + proven locally; Kraken needs to mount the editor, persist edits,
> and flip approval status so the engine's poller renders.

---

We're closing the live cross-repo round-trip for the **/creative-engine v2** pipeline. The ENGINE repo
(`D:\Claude CODE\jsxconversion`) is DONE and proven locally end-to-end; this chat builds the **Kraken
side** so a real human approval in the portal triggers a branded render back on the engine machine.

## READ FIRST (full paths)
- **The complete build spec + the exact verified Kraken file paths + the data contract:**
  `D:\Claude CODE\jsxconversion\docs\kraken-editor-mount-handoff.md` — read this in full before coding.
- Master plan (Phases 4–5 context): `C:\Users\lionh\.claude\plans\so-i-see-that-memoized-parnas.md`.
- Engine-side state / what's already built: `D:\Claude CODE\jsxconversion\docs\creative-engine-roadmap.md`
  and `D:\Claude CODE\jsxconversion\HANDOFF.md`.

## This repo / stack
Kraken = `D:\Claude CODE\The Kraken` (Next.js + Supabase). Supabase host
`xdszlcvmfjdjvqxhyxly.supabase.co`; relevant tables: `approvals`, `content_outputs`, `content_folders`,
`workspaces`. Creds live in `D:\Claude CODE\The Kraken\.env.local` (already used by the engine's
read-only poller).

## What the ENGINE repo already delivers (do NOT rebuild — iframe it / read it)
- **The editor is a URL, not a code import.** Kraken iframes it exactly like it iframes html-preview
  rows. Served by the engine repo: `node D:\Claude CODE\jsxconversion\creative-engine\editor\serve.mjs`
  (port 5300; see `D:\Claude CODE\jsxconversion\.claude\launch.json` config `ce-editor`).
  - Edit lane: `http://localhost:5300/creative-engine/editor/editor-host.html?pkg=<slug>`
  - View+comment lane: same URL + `&view=1` (read-only; Kraken's annotation overlay rides on top).
  - `<slug>` = the intake package slug; the editor loads `…/_packages/<slug>/intake.json` for the
    design URL + `asset_base` + per-frame ids.
- **The editor posts every edit OUT via `postMessage`:** `{ type: 'ce-overrides', overrides, meta }` to
  `window.parent` (fires only when iframed). Source: `creative-engine/editor/editor-host.html`.
- **The content-row metadata contract** (one row per frame) is produced by
  `D:\Claude CODE\jsxconversion\creative-engine\intake\lib\manifest.mjs` → `manifestToMetadataRows()`:
  `{ render:'live-html', tagged_url, asset_base, frame_id, poster, label }`.
- **The engine's local render poller** (`D:\Claude CODE\jsxconversion\creative-engine\render\poller.mjs`)
  watches `approvals.status='approved'`, reads the linked `content_outputs.metadata`, and renders via the
  zero-loss `render-live`. It is READ-ONLY against Kraken (never writes). So Kraken only needs to WRITE.

## Build these THREE things in Kraken (detail + verified file refs in the handoff doc)
1. **Embed render path** — for a `content_outputs` row of kind `embed`, render `<iframe src={editorUrl}>`
   instead of `<img>` (reuse the existing html-preview iframe path). Verified mount point already exists:
   `D:\Claude CODE\The Kraken\app\portal\review\[id]\review-client.tsx` (it already iframes HTML +
   overlays a separate annotation iframe).
2. **Permission toggle (no code import)** — set the iframe `src` per `ReviewMode`
   (`D:\Claude CODE\The Kraken\components\approvals\edit-comment-mode-toggle.tsx`,
   `type ReviewMode = 'edit' | 'comment'`): `'comment'` → `editor-host.html?pkg=<slug>&view=1` (existing
   annotation overlay on top), `'edit'` → `editor-host.html?pkg=<slug>`.
   ⚠️ **Vertical-canvas gotcha:** `components\approvals\annotation-overlay.tsx` defaults
   `canvasDimensions={1920×1080}`; our creatives are **1080×1920** — pass `{width:1080,height:1920}` (or
   read the design's real frame size) for `embed` rows or comments land in the wrong place.
3. **Persist overrides + the status trigger** — `window.addEventListener('message', …)` (pin
   `event.origin` to the editor host), write `overrides` to the approval row, set `client_edited=true`; on
   approve set `status='approved'`. The approve route already writes status:
   `D:\Claude CODE\The Kraken\app\api\portal\approvals\[id]\approve\route.ts` (lines ~134–147).
   **`approvals` has no override column today** — add `overrides jsonb` to `approvals` (one small
   migration), per the handoff doc.

## Verified Kraken files to read/touch (full paths)
- `D:\Claude CODE\The Kraken\lib\database.types.ts` — `approvals` schema (fields confirmed: id, status,
  content_output_id, responded_at, approved_by_type, client_edited, updated_at, workspace_id, batch_id;
  status enum `pending|approved|revisions_needed|denied`; **no** `rendered_at`, **no** `overrides` yet).
- `D:\Claude CODE\The Kraken\app\portal\review\[id]\review-client.tsx` — the iframe mount + annotation.
- `D:\Claude CODE\The Kraken\components\approvals\edit-comment-mode-toggle.tsx` — the view/edit toggle.
- `D:\Claude CODE\The Kraken\components\approvals\annotation-overlay.tsx` + `lib\feedback-widget\src\AnnotationTool.ts` — comment layer (canvasDimensions).
- `D:\Claude CODE\The Kraken\app\api\portal\approvals\[id]\approve\route.ts` — sets status='approved'.
- `D:\Claude CODE\The Kraken\app\api\portal\approvals\[id]\comments\route.ts` — W3C comments (reuse; build nothing new).

## Cross-repo dependency to flag (don't silently assume)
For a remotely-approved design to render, the poller must reach the design at `metadata.tagged_url`.
Today the engine produces **local** packages served at `localhost:5300`. For first integration on one
machine that's reachable; for production, the engine still needs a **remote-publish step** (upload the
package → Kraken Storage → public `tagged_url`/`asset_base`) — that's an ENGINE-repo task, NOT this chat.
For this chat, validate against a locally-served package URL.

## Definition of done (verify, don't assert)
Mount an `embed` row in the portal → the live design plays in the iframe → switch to edit → retype text /
swap media → confirm Kraken received `ce-overrides` and persisted it to `approvals.overrides` →
approve → confirm `approvals.status='approved'`. Then on the engine machine run the poller
(`node D:\Claude CODE\jsxconversion\creative-engine\render\poller.mjs` or its CLI) and confirm it picks up
that row and renders an MP4. That full chain = the organic round-trip closed.

## Rules
- Cody is a marketer, not a developer — explain with plain-language analogies from the first sentence.
- **iframe-by-URL, never import the editor code** (verified: Kraken has no editor-import path).
- **Do not conflate or rebuild commenting** — it's Kraken's existing W3C feature; the editor is edit-only.
- Evidence over assertion; verify in the running portal, not just in code.

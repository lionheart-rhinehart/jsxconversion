---
name: creative-editor
description: >-
  Take a Claude Design handoff and make it live-editable in the position editor —
  connected to the campaign with the right Kraken workspace auto-pinned, motion
  preserved, no rendering. Flattens the raw designs into editable layers (footage =
  live clip, overlays = editable layers that still animate), scaffolds the minimal
  campaign, and prints the per-design editor URLs. Trigger when the user runs
  /creative-editor, hands you a Claude Design "Fetch this design file…" link/bundle
  and wants to edit it, or asks to connect designs to the editor.
---

# Creative Editor

**One job: turn a Claude Design handoff into designs you can edit in the position editor,
connected to the campaign. Nothing else.** If a step needs you to *patch the editor* to work,
that's an editor bug to fix at the source — never paper over it here.

The pipeline is proven (Westfield was the first run). Each step has a deterministic script; you
orchestrate.

## What you produce
- `templates/<slug>/wf-<N><A|B|C>.{config.json,jsx}` — the raw designs flattened to **editable
  layers WITH motion** (`@keyframes` + per-layer `animation` + count-ups captured).
- `campaigns/<slug>/{creative-plan.json, kraken.json, edits/<angle>__<asset>.config.json}` +
  a `.editor-config.json` root registration — the minimal campaign wrapper.
- The `#camp:<slug>:<angle>:<asset>` editor URLs (Kraken auto-pinned, motion playing, editable).

## Steps

1. **Ingest the handoff.** If given a "Fetch this design file…" URL, download + unpack it
   (`curl` the bundle → it's a gzip'd tar → `gunzip` + `tar -xf`). Read the bundle README +
   `CLAUDE.md` + chat transcripts to learn the project (location, the approved copy, which file is
   the latest cut). Identify the **campaign slug** (e.g. `westfield-100-off`) and the **location**
   (e.g. "Westfield").

2. **Make the runnable gallery** (the flatten source). Copy the design's assets + DS tokens into
   `campaigns/<slug>/`, then build `campaigns/<slug>/index.html` from the chosen `.dc.html` by
   dropping the Claude Design `support.js` runtime (hoist `<helmet>`→`<head>`, `<x-dc>` body→`<body>`,
   the `dc-script` componentDidMount → a plain `DOMContentLoaded` script — **strip its trailing `}`**).
   For Westfield this is `scripts/westfield-flatten-gallery.mjs`; generalize/copy it per handoff.
   (See the `reference-dc-html-to-standalone` memory.)

3. **Flatten to editable, animated layers — NO render.**
   `node scripts/westfield-flatten.mjs --all` (reads `campaigns/<slug>/index.html`, writes
   `templates/<slug>/wf-*.{config.json,jsx}` + copies media into `templates/<slug>/assets/`). It
   freezes each design to its first frame for geometry **and** captures its motion (the `@keyframes`
   library, each layer's inline `animation` + `transform-origin` + custom props, `data-countup`
   metadata, `masterLoop`). Geometry stays byte-identical; motion is additive.
   *(If the flattener is still hard-pinned to `westfield-100-off`, parameterize its `GALLERY`/`OUT_DIR`
   by a `--campaign <slug>` arg first — do NOT copy a new design over Westfield's.)*

4. **Auto-detect + CONFIRM the Kraken workspace.** Fetch the live list
   (`curl -s http://localhost:<editorPort>/kraken/workspaces`) and match the location name to a
   workspace (e.g. "Westfield" → `AA - Westfield`, name `aa-westfield`, with its `id`). **Show the
   match and ask the user to confirm** before writing it. If no clean match, list the options and ask.

5. **Connect (scaffold the campaign).**
   `node scripts/creative-editor-connect.mjs <slug> --workspace <name> --workspace-id <uuid>`
   writes `creative-plan.json` (angles N × assets A/B/C → template), pre-seeds
   `edits/<angle>__<asset>.config.json` from each flattened config (the editor returns these
   verbatim — `aa-campaign-plugin.mjs:207`), writes `kraken.json` (editor auto-pins it via
   `/kraken/state`), and registers `templates/<slug>` in `.editor-config.json`. It prints the
   `#camp:<slug>:<angle>:<asset>` URLs.

6. **Ensure the dev servers — NON-DESTRUCTIVELY.** NEVER port-kill (it kills the user's other
   servers/chats). If `.dev-ports.json` shows live ports, reuse them; otherwise start a fresh
   `node scripts/dev.mjs` detached. (Do NOT run `restart-dev.mjs`.)

7. **Hand off the URLs.** Give the user the `#camp:<slug>:<angle>:<asset>` links (Kraken auto-pinned
   to their location, the 7-second motion playing, every layer editable). A render to PNG/MP4 happens
   ONLY when they explicitly export — editing is fully live, zero renders, zero tokens.

## Contract / guardrails
- **No render to edit.** The flatten produces the editable layer model; the editor composes it live.
- **Don't patch the editor.** It must already be correct standalone — if it isn't, fix the editor.
- **Motion survives editing.** Edited exports keep the 7s overlay motion (the render bakes it via the
  `MOTION_SYNC_PATCH` in `layer-config-video.mjs` — Route-A/B footage path proven; Route-C no-footage
  cells use `renderLayerConfigMotion`).
- **Verify in a VISIBLE browser.** The headless preview tool freezes animation (hidden tab); confirm
  motion playback with the user, or via a rendered MP4 (`/render-template/<id>` → inspect frames).

## Proven reference
Westfield (`westfield-100-off`): 36 designs flattened with motion, connected, Kraken pinned to
AA - Westfield; `#camp:westfield-100-off:a1:A` opens campaign-bound with 8 animations attached, footage
loading, 0 broken media. See the `project-westfield-editor-templates` memory.

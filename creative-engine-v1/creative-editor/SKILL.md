---
name: creative-editor
description: >-
  Take a Claude Design handoff and present every design LIVE on the engine review
  page, each fully editable in the position editor (media + Kraken auto-pinned),
  motion preserved, no rendering to view or edit. Asks which campaign + zip-or-link,
  ingests, flattens to editable animated layers, scaffolds the campaign, and opens
  the review page. Trigger when the user runs /creative-editor, hands you a Claude
  Design "Fetch this design file…" link/bundle and wants to edit it, or asks to
  connect designs to the editor / review page.
---

# Creative Editor

**One job: turn a Claude Design handoff into a review page where every design shows LIVE and is
fully editable — connected to the campaign with the right Kraken workspace. Nothing else.** If a
step needs you to *patch the editor* to work, that's an editor bug to fix at the source.

The pipeline is proven (Westfield was the first run). Each step has a deterministic script; you
orchestrate. **No rendering is needed to view or edit** — render only on explicit export.

## Intake — ASK FIRST (use AskUserQuestion)

1. **Q1 — "Which campaign are we working on?"** Free-text (e.g. "Westfield Campaign C"). This both
   names the campaign **and disambiguates** which design to use when the handoff holds multiple cuts
   (A/B/C `.dc.html` files). Derive the slug (`westfield-100-off`) + the location ("Westfield").
2. **Q2 — "Is this a zip or a direct link?"** Then collect:
   - **Zip** → the local path; unpack it (`gunzip`/`tar -xf`).
   - **Direct link** → the Claude Design "Fetch this design file…" URL; `curl` it (it's a gzip'd
     tar) → unpack.
3. **Ingest + disambiguate.** Read the bundle `README.md`/`CLAUDE.md`/chats. **List the `.dc.html`
   files**; pick the one matching Q1. If still ambiguous, show the list and ask.
4. **Q3 — Confirm the Kraken workspace.** `curl -s http://localhost:<editorPort>/kraken/workspaces`,
   match the location → e.g. `AA - Westfield` (`aa-westfield`). **Show the match + confirm** before
   writing. No clean match → list options and ask.

## Build (run these — all parameterized)

5. **Copy assets + build the runnable gallery** (the flatten source). Copy the design's `assets/` +
   `_ds/` into `campaigns/<slug>/`, then:
   `node scripts/westfield-flatten-gallery.mjs --campaign <slug> --src "<chosen .dc.html>"`
   (drops the Claude Design `support.js` runtime → `campaigns/<slug>/index.html`).
6. **Flatten to editable, ANIMATED layers — NO render.**
   `node scripts/westfield-flatten.mjs --campaign <slug> --all`
   → `templates/<slug>/wf-*.{config.json,jsx}` (each layer's `animation` + `@keyframes` + count-ups
   captured; geometry byte-identical) + media copied into `templates/<slug>/assets/`.
7. **Connect (scaffold the campaign).**
   `node scripts/creative-editor-connect.mjs <slug> --workspace <name> --workspace-id <uuid>`
   → `creative-plan.json` (all assets `format:"static"`+`animated:true` so they open in the POSITION
   editor and export as MOTION; stamps `source:"claude-design"`+`skipValidation:true`), pre-seeds
   `edits/<angle>__<asset>.config.json` from each flattened config (returned verbatim —
   `aa-campaign-plugin.mjs:207`), writes `kraken.json` (editor auto-pins it), registers
   `templates/<slug>` in `.editor-config.json`.

## Deliver — open the REVIEW PAGE (not raw URLs)

8. **Ensure dev servers — NON-DESTRUCTIVELY.** NEVER port-kill (kills the user's other servers).
   If `.dev-ports.json` shows live ports, reuse; else start `node scripts/dev.mjs` detached
   (editor:5173 + review:5599). Do NOT run `restart-dev.mjs`.
9. **Hand over ONE URL — the review page:**
   `http://localhost:<review>/review.html?campaign=<slug>&api=<editor>&editor=<editor>`
   Every design is a **LIVE animated card** (no render). **Click any card → the full position
   editor** — text, layers, MEDIA tab with the **Kraken browser auto-pinned**, clip swap/trim, reel,
   audio, draw, copy-swap, Save/Save+Render. Editing is 100% live; a motion MP4 is produced only when
   the user clicks Save+Render / exports.

## Contract / guardrails
- **No render to view or edit.** Flatten → editable layer model; the review cards + editor compose it
  live.
- **Don't patch the editor.** It must already be correct standalone.
- **Motion survives editing.** Edited exports keep the 7s motion (run-campaign routes `animated`
  configs through the motion path even though `format:"static"`; Route-A/B over footage, Route-C over
  a synthesized solid bg).
- **Validation is SKIPPED for these** (`source:"claude-design"`+`skipValidation`) — they're pre-made,
  human-approved content, not engine-generated, so the generation-quality gate doesn't apply. (A
  future opt-in "analyze against brand rules" button is the right place for that check — deferred.)
- **Verify in a VISIBLE browser.** The headless preview tool freezes animation (hidden tab) and is
  slow with many live-card iframes; confirm playback with the user, or via a rendered MP4
  (`/render-asset/<c>/<a>/<as>` → inspect frames).

## Proven reference
Westfield (`westfield-100-off`): 36 designs flattened with motion, connected, Kraken pinned to
AA - Westfield; review page shows 36 live cards (validation clean), click → full editor; campaign
render bakes motion (count-up 39%→27%). See the `project-westfield-editor-templates` memory.

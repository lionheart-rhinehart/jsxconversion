---
name: design-to-approval
description: >-
  Send finished Claude Design creatives to a client through the Kraken approval portal as LIVE,
  self-contained HTML — no MP4/PNG render of the design first. Takes the pasted "Send to Claude Code"
  design (often many options grouped by theme, e.g. "the 30 with media"), builds one portable animated
  HTML proof per design with a "<Theme> · Design <N>" header band, shows a partition table for sign-off,
  then uploads + sends each to the portal for the client to comment on. Trigger when the user runs
  /design-to-approval, pastes a Claude Design "Fetch this design file…" prompt and asks to send it to a
  client / get approval / get sign-off, or asks to push designs to the Kraken approval portal without
  rendering.
---

# design-to-approval

Turn finished **Claude Designs** into client-reviewable creatives in the **Kraken approval portal**
**without rendering** the design to video/image. Each design becomes a **self-contained live HTML proof**
(the animated design, header band, scrub bar kept) that the client views and comments on like normal.

The heavy lifting is a deterministic CLI — `scripts/design-to-approval.mjs`. This skill ORCHESTRATES it
and makes the one MCP call the script can't (`send_to_approval`).

> **Read `docs/kraken-embed-approval-handoff.md`** — it's the cross-system contract. The portal showing the
> **live** HTML (vs. the still) is a Kraken-side build (separate chat). Until it lands, this ships a
> **still-thumbnail bridge**: the client sees a still frame (with the theme/number baked in) + approves;
> the live design rides in `metadata.live_url`. **Tell the user this plainly before any real-client send.**

## Inputs to gather (at the start)
1. **The design** — the user pastes the Claude Design "Send to Claude Code" prompt (a
   `…/v1/design/h/<id>?open_file=<Name>.dc.html` URL + maybe an instruction like *"only the ones WITH MEDIA"*).
   The Claude-Desktop handoff materializes the export folder on disk; this skill does **not** fetch the URL.
2. **Workspace** — ask which Kraken workspace each run (slug like `jarosh`, `aa-noblesville`, `cody-personal`).
3. **Approver email(s)** — ask up front.

## Steps

1. **Locate + enumerate + show the table (no `--confirm`).** Run:
   ```
   node scripts/design-to-approval.mjs --folder "<export folder>" --media <with|without|all> [--only IDS]
   ```
   (Or pass `--url "<the pasted prompt>"` to auto-match the folder by its `open_file` name and infer the
   media filter.) It prints a **partition table** (theme · # · variation · has-media · matched assets · keep)
   and **stops at the HARD CONFIRM GATE** — nothing is built, uploaded, or sent. It refuses to auto-pick a
   "newest" folder; if several match it asks you to choose `--folder`.

2. **Show the table to the user and get explicit sign-off.** Do not proceed past the gate on your own —
   this is the guard against shipping the wrong subset/designs to a client. If a design with media shows as
   `no` (assets via a computed JS path the scan can't see), surface it.

3. **Build + deliver (with `--confirm`).** Add `--workspace` + `--email`:
   ```
   node scripts/design-to-approval.mjs --folder "<…>" --media <…> --confirm \
     --workspace <slug> --email a@b.com[,c@d.com]
   ```
   This builds each proof (CSP-safe: React/ReactDOM inlined from node_modules, JSX pre-transpiled with
   `@babel/standalone` preset-react, assets ffmpeg-recompressed + base64-inlined), captures a deterministic
   poster, uploads poster (`content-images`) + HTML (`content-bundles`), ingests a bridge row
   (`type:"image"`, `content`=poster, `metadata.live_url`=html, `metadata.render:"live-html"`), groups a
   theme's options in one folder, dedups (`--replace` to redo), and writes
   `out/approval/<campaign>/manifest.json`.
   - Use `--build-only` first if the user wants to eyeball proofs locally before any upload.

4. **Send each for approval (this skill's MCP step — the script can't).** Read the manifest's `rows`. For
   each row call:
   ```
   mcp__third-eye-library__send_to_approval({
     contentId: <row.id>, workspace: <slug>, approverEmails: <row.emails>,
     contentTypeOverride: "image", sendEmail: <true ONLY for the first row, false for the rest>
   })
   ```
   **`sendEmail:true` on the FIRST row only** — otherwise a 30-design batch sends 30 "ACTION NEEDED" emails.
   Every row still becomes a pending approval; the client gets ONE notification. Report the returned
   `approvalUrl`(s) back to the user.

## Hard rules
- **Never bypass the confirm gate.** Show the table, get a yes, then `--confirm`.
- **Be honest about the interim:** until the Kraken embed display ships (handoff doc), the client sees a
  **still**, not the live animation. Get the user's OK before sending to a real client.
- **One email per batch** (`sendEmail:true` first row only).
- **Verify safely:** test against the user's own `cody-personal` workspace + their own email before pointing
  at a real client. Open a row's `metadata.live_url` to eyeball the live proof.
- The script writes to **live Supabase** once past the gate (outward, hard to reverse). `out/` is gitignored.

## Key files
- `scripts/design-to-approval.mjs` — the pipeline (locate → enumerate → gate → build → poster → deliver → manifest).
- `scripts/lib/kraken.mjs` — `uploadToStorage`/`ingestContent`/`setFolder`/`createFolder`/`findExistingByDesign`/`resolveWorkspaceId`.
- `docs/kraken-embed-approval-handoff.md` — the Kraken-side contract (embed render via proxy/`srcdoc`; storage serves `.html` as `text/plain`).
- `mcp__third-eye-library__send_to_approval` — the approval + email step.

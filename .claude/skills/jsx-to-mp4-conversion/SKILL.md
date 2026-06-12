---
name: jsx-to-mp4-conversion
description: Render ALREADY-APPROVED Claude Design export bundles to MP4. Use when the user runs /jsx-to-mp4-conversion, or hands over a Claude Design "Download project as .zip" of finished/approved creatives and just wants them turned into videos — no intake/edit/approval. Asks for the zip path, lists every campaign found inside, lets the user pick one by number, then renders that campaign's standalone export HTML to MP4 (auto-detects size + loop length per file). Built fresh; does NOT touch the archived creative-engine-v1 renderer.
---

# /jsx-to-mp4-conversion — approved Claude Design exports → MP4

This is the **fast lane** for creatives that are already finished and approved. No intake, no editing,
no approval gate — the user hands over a Claude Design export `.zip` and wants MP4s back.

A Claude Design **"Download project as .zip"** contains, per campaign, a `project/export/` folder of
standalone 1080×1920 looping HTML creatives **with the user's edits baked in** — Claude Design's own
`export/index.html` literally says *"Render each to MP4."* That `export/` folder is the source of truth
(NEVER the `.dc.html` gallery, which lags edits). One zip can hold **multiple campaigns**, so we discover
them first and let the user pick.

The engine is `scripts/jsx-to-mp4-conversion.mjs` (puppeteer + ffmpeg, built from scratch — it does not
import, run, or reference the archived v1 renderer). This skill is just the front door.

## Steps — follow in order

1. **Ask for the zip path.** Say something like: *"Paste the path to the `.zip` you downloaded from
   Claude Design (Share → Download project as .zip). You can also drag the file into the terminal to
   paste its path."* Do NOT say "upload" — there's no upload button here; we need a file path.

2. **Discover campaigns.** Run:
   ```
   node scripts/jsx-to-mp4-conversion.mjs "<zip-path>" --list
   ```
   This extracts the zip once and prints a numbered list of every campaign found (name · title ·
   creative count) plus a `WORKDIR:` path. **Capture that WORKDIR** — you'll reuse it so the zip isn't
   unpacked twice.

3. **Show the list and ask which one.** Present the numbered campaigns to the user and ask: *"Which one
   are we working on?"* Let them answer by **number**. (Their own name for it may not match the zip —
   that's exactly why we list the real names and let them pick.) If only one campaign is found, show it
   and confirm.

4. **Ask where the MP4s should go** (default `out/campaigns/<campaign-name>/`). The user said "a folder
   you name," so confirm the destination.

5. **Render.** Run:
   ```
   node scripts/jsx-to-mp4-conversion.mjs --workdir "<WORKDIR>" --campaign <#> --out "<folder>"
   ```
   Optional: `--seconds N` to force a loop length, `--fps N` to override frame rate. Each creative
   auto-detects its own dimensions and loop length otherwise.

6. **Report the receipt** the engine prints: each `source.html → output.mp4` with dimensions / loop
   seconds / size, the rendered-vs-failed count, and the output folder. If any creative failed, say so
   plainly and name it — never report a partial run as complete.

## Notes & guardrails

- **Multiple campaigns:** only the picked campaign renders; the others are left untouched.
- **A passed `--workdir` is reused, not deleted** — so you can render a second campaign from the same
  `--list` extraction without re-unzipping. A zip handed straight to render mode (no `--workdir`) is
  extracted and cleaned up automatically.
- **Output lands under `out/` by default, which is git-ignored** (machine-local, by design). Deliver the
  MP4s from the output folder; they won't show in `git status`.
- **rAF warning:** if a creative uses `requestAnimationFrame` count-ups/typewriters, the engine prints a
  warning naming that file — CSS/video render deterministically, but eyeball that one creative.
- **Needs network** for the Google-CDN brand fonts (Anton / JetBrains Mono / Geist); if a render looks
  wrong-fonted, check the connection.

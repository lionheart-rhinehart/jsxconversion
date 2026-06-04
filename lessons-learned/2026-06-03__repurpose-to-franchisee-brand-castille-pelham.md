# Repurposing AA campaigns to a franchisee brand (Castille / Pelham): the gotchas

**Date:** 2026-06-03
**Branch:** claude/jovial-kapitsa-21ffc7

Registered a new standalone brand (Castille Academy) from a Claude Design handoff
bundle, stood up the Pelham location, and repurposed three rendered AA Carmel
campaigns (grind-trap / confidence / more-games → 57 creatives) to Castille at
Pelham, exported to the franchisee's Kraken angle 1/2/3 folders. It worked, but
only after hitting a chain of real holes. Capturing all of them.

## Environment / harness

- **A fresh git worktree has its OWN `node_modules`** — gitignored, NOT shared
  with the main checkout and NOT auto-installed. The renderer needs React's UMD
  builds from there, so every render failed with an opaque `exit 1` until
  `npm install` was run in the worktree. Fixes shipped: `new-workspace.ps1` now
  runs `npm install`; `run-campaign.mjs` preflights the UMD builds and fails loud
  with the actionable message; and it now **surfaces the captured subprocess
  stderr on render failure** (it was swallowing the real cause behind "exit N").
- **`run_in_background` bash tasks die when the app/client closes.** A long render
  launched that way was killed mid-batch when the user closed the app. Use a
  **detached** process (`Start-Process -WindowStyle Hidden -RedirectStandardOutput
  ...`) for long renders that must survive an app close; monitor via the log file
  + the Kraken state instead of task notifications.
- **Don't conclude a render is "dead" from a short observation window.** Motion
  renders take 15–30s each; a 6-second window with no new output file is normal
  mid-render. I wrongly declared a still-running job dead and launched a duplicate.
  Confirm via the report line / process liveness, not a brief disk-count snapshot.

## Brand-kit registration (what a franchisee needs)

- `data/brand.<slug>.json` (identity + 5 color tokens + 3 font tokens) + a kit
  folder at `kitPath` holding the logo. `validateKit` is the gate; logo asset must
  exist on disk (rendered the Castille typographic placeholder from its own
  `brand-logo.html` to satisfy it).
- **Also write `data/rules.<brand>.json`** — without it the brand falls back to
  `DEFAULT_RULES`, which is stricter and lacks `mediaExempt` (false-flagged the
  motion `stat-reveal`/`logo-sting` cards as "no media"). Mirror the AA ruleset.
- **Carry the grandfather override to clones.** Source campaigns ship
  `campaigns/<c>/validation.config.json` (`{"verbatim":"warn"}`) that downgrades
  the verbatim trace; the clone didn't copy it, so the clone over-blocked. Copy it.
- Custom fonts (Caslon/Hanken/Saira) are **deferred for statics** — motion honors
  the family strings, statics keep the bank face until the `.woff2` binaries are
  registered. `validateKit` warns (doesn't block) on this.

## The repurpose clone

- **`media: replace` only swapped MOTION clips, not STATIC backgrounds.** A static's
  background renders from the cloned **edits config's `media` layer**, not the plan
  asset — but the clone's media-map only set `a.clip`/`a.photo` on the plan (and
  `a.photo` is dead for statics). Patched `clone-core.mjs` to apply the map to
  `cfg.media.path` in the edits config too. A VIDEO entry is valid there — the
  static renderer still-frames it (a different action clip per card = real variety).

## Rendering footage

- **Long source clips OOM the motion render.** The motion renderer extracts the
  **entire clip** as a per-frame `<img>` sequence. AA clips were ~3s (~93 frames,
  fine); the Castille clips were 26–27s (~800 frames) → page crash
  (`Protocol error (Page.captureScreenshot): Target closed`, `frame=0`). Fix: trim
  source clips to ~6s before use (`ffmpeg -t 6 -c:v libx264 -an`).
- **Video still-frames can land on black intro frames.** Using a clip as a static
  background at a fixed `videoStartTime=1` produced **pure-black cards** where the
  clip faded in — and render-QA didn't catch it (the text pixels kept it from
  reading as fully black). Fix: extract a representative bright frame with ffmpeg's
  **`thumbnail` filter** (`-vf thumbnail=120 -frames:v 1`) and use that JPG instead.

## Kraken export (replace-safe is broken)

- **Re-export DEDUPS instead of REPLACES on a re-run.** The orchestrator's
  soft-delete reads `a.kraken.id` from the dest plan, but the re-clone **wipes
  `a.kraken`** → no ids → soft-delete skipped → `kraken-export` then finds the old
  rows "already in library" and skips them. Net: a re-run leaves the STALE
  creatives published (this is how angle 1 kept the wrong media after the media
  fix). Manual workaround used: `soft-delete-assets.mjs <campaign> <ids>` BEFORE
  the re-clone (while the plan still has the kraken ids), then re-export pushes
  fresh. **Root fix still pending:** make the orchestrator soft-delete by querying
  existing rows via `findExistingByMeta` (campaign,angle,asset), independent of the
  wiped `a.kraken`.

## Media assignment "by fit"

- **Don't walk the pool in order** — it produced a monotonous confidence angle
  (every static a "signing/writing on the wall" shot). Assign for genuine
  variance: distinct activity per card, deliberately spread across exercises/scenes.
  The 43 action clips (as still-frames) gave far more variety than the photo pool
  (which skewed to Posing/Signing/Writing). Verify the final set visually — a
  montage of several cards — before declaring done.

## Meta

The biggest time sink was opaque failures (swallowed stderr) and prematurely
trusting "done" without looking. The fixes that pay off most: fail-loud preflights,
surfacing real errors, detached long runs, and **always eyeballing a sample of the
output** before calling it finished.

---
name: creative-engine
description: >-
  Take a finished Claude Design export and carry it to delivered, brand-applied creatives —
  intake → edit (one portable editor) → approve (publish to the portal) → render-on-approval
  (+ brand fan-out) → dispatch (Content Library / Meta). Use when the user runs /creative-engine,
  hands you a Claude Design export to edit/finish, wants to fan a finished creative out to multiple
  brands, send it for approval, or push approved creatives to the content library or a Meta
  campaign. This is the EDITING pipeline (not from-scratch creation).
---

# /creative-engine — the editing pipeline (runbook)

A finished Claude Design export goes in; an approved, brand-applied, dispatched creative comes out.
The design's real HTML is the canvas — edits are deterministic surgical overrides, never a rebuild.
Rendering to MP4/PNG happens **once, at the very end, only on approved work**. Implementation code lives
at the repo root in `creative-engine/` (not in this skill folder). The retired v1 system is archived
read-only at `creative-engine-v1/` — **reference only, never import from it.**

## How to run it

- **`/creative-engine`** (no args) → walk the user through the phases in order, pausing at each gate for
  their input (which export, which workspace, when to go live).
- **`/creative-engine <sub> [args]`** → run just that phase (parse `<sub>` from the skill args).

The whole loop is machine-independent: `approve` publishes to public Supabase Storage and `render` pulls
from Storage, so **no local dev server is needed** for approve/render (the editor's local preview is the
only step that uses one). `ffmpeg` must be on PATH for MP4 renders.

## The phases (each = the exact command to run)

The package `<slug>` comes from intake (e.g. `carmel-2c7c5b76`); packages live in
`creative-engine/intake/_packages/`. Workspace `<ws>` is an AA-location slug/uuid (e.g. `aa-carmel`).

### 1. intake — export → tagged, editable package
```
node creative-engine/intake/package-export.mjs "<path-to-.zip|folder|.dc.html>"
```
Prints the package `slug`, frame count, and any flagged/broken assets. Hand the user the slug.
(Exit 2 = no frames; exit 3 = broken assets — both still write the package for inspection.) If a re-run
reports the package is open in the editor (file lock), have the user close it in the editor and re-run.

### 2. edit — optional local pre-edit (the one portable editor)
Open in the user's running dev server (they keep one on `localhost:5300`; do NOT start/kill servers):
```
http://localhost:5300/creative-engine/editor/editor-host.html?pkg=<slug>
```
Click-text to retype, click-media to swap, drag to move; it emits an override bag. In the *organic*
flow the user usually edits **in the portal** instead (step 4) — this local step is optional.

### 3. approve — publish to the portal (HUMAN-AUTHORIZED)
This uploads the package to Storage and creates the portal review rows. **Always show the DRY-RUN first**,
then run `--live` only on the user's go-ahead.
```
# DRY-RUN (walks the tree + plans rows, writes nothing):
node creative-engine/dispatch/publish-package.mjs --pkg <slug> --workspace <ws>
# LIVE (uploads + ingests + mints portal link). --email so the user can see it in the portal;
# --limit 1 for a single clean review link (first pass); omit --limit to publish all frames:
node creative-engine/dispatch/publish-package.mjs --pkg <slug> --workspace <ws> --email <e> --limit 1 --live
```
Hand the user the printed **portal review link** (`https://thekraken.vercel.app/portal?token=…`). Re-publish
is idempotent (deduped on slug+frame_id; `--replace` to force-refresh).

### (user acts) — review + edit + approve in the portal
The user opens the link, watches the design play, switches to the edit lane to change text / swap media
(overrides persist to `approvals.overrides`), and clicks **Approve** (sets `status='approved'`). Nothing
renders until this human approval — the safety gate.

### 4. render — render-on-approval (pull from Storage, no localhost)
**Scope the poll** so it only renders the intended row(s), not unrelated approved rows workspace-wide:
```
node creative-engine/render/cli.mjs poll --once --workspace <ws>
# (or --approval <uuid> for a single row; drop --once to loop; --png for a still)
```
The poller pulls the package from Storage into a local cache, renders, and writes the MP4 to
`creative-engine/render/_out/rendered/<approvalId>.mp4`. Prove it with `ffprobe` (1080×1920 / 30fps /
motion) and eyeball a frame showing the edit. Brand fan-out: `cli.mjs fanout …` (one master → N brands).

### 5. dispatch — file the rendered output (HUMAN-AUTHORIZED for `--live`)
```
node creative-engine/dispatch/cli.mjs library <render-manifest.json> --workspace <ws> --folder "<name>" [--live]
```
DRY-RUN by default; `--live` pushes to the Content-Library folder. `meta` is always staged (never fires a
live Meta call). Scheduling is a deliberate later add-on.

## Maintenance

Intake copies each export (~20-30MB) into `_packages/`, and the test suites leave throwaway packages
(`ce-intake-test-*`, `ce-rlp-*`). To reclaim disk:
```
node creative-engine/intake/cleanup-packages.mjs                 # dry-run (test packages)
node creative-engine/intake/cleanup-packages.mjs --apply         # delete them
node creative-engine/intake/cleanup-packages.mjs --max-age-days 30 --apply   # + old real packages
```

## Non-negotiables (from the master plan)

- **Clean room:** zero imports from `creative-engine-v1/` — mine it for ideas only.
- **Mechanical core:** intake / edit / render are deterministic scripts, not AI guessing.
- **One portable editor**, mounted in the local preview AND the Kraken portal — same code, toggled
  permissions (`editor-host.html?view=1` = view+comment; no param = edit).
- **Render at the end:** stays HTML/JSX through editing and approval; a human approval is the render trigger.
- **Human-authorized writes:** `approve` and `dispatch --live` write to live Supabase — always show the
  dry-run/plan and get the user's go-ahead before the live call.

## Known limitation (deferred)
SVG `<text>` multi-line editing isn't supported (`creative-engine/editor/apply-overrides.js:62`) — real
designs only use SVG text for single-line badges, so this is parked.

> Full master plan + phase ledger: `docs/creative-engine-roadmap.md`,
> `C:\Users\lionh\.claude\plans\so-i-see-that-memoized-parnas.md`. Cross-repo contract:
> `docs/kraken-editor-mount-handoff.md`.

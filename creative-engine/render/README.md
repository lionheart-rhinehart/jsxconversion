# creative-engine/render — Phase 5: render-on-approval + brand fan-out

Render happens **once, at the end, only on APPROVED work.** This folder is the local
render tier of the v2 pipeline. Clean room: zero imports from `creative-engine-v1/`; it
wraps the verified v2 renderer `../editor/render-frame.mjs` (which replays the editor's
own `apply-overrides.js`, so a rendered frame can't disagree with the editor preview).

## Modules

| File | Role |
|---|---|
| `probe.mjs` | 5.1 — recommends a **conservative** pool size (cores−2, RAM/job, hard ceiling 4). |
| `run-job.mjs` | 5.2 — ONE render as a **child process** of `render-frame.mjs`; per-job timeout + retry-once. |
| `pool.mjs` | 5.1 — sliding-window **N-at-a-time** scheduler; never wedges; writes the manifest. |
| `manifest.mjs` | 5.2 — every job's success/failure recorded — **no silent drops**. |
| `ledger.mjs` | 5.3 — local rendered-ledger on `(id, updated_at)` (contract **option B**; no Kraken migration). |
| `approvals.mjs` | 5.3 — resolves the **embed-row contract** → a render job. |
| `poller.mjs` | 5.3 — long-running loop: approved → diff vs ledger → pool render → record. |
| `brands.mjs` + `brands/registry.json` | 5.4 — brand registry + **clone-and-swap-5-vars**. |
| `fanout.mjs` | 5.4 — 1 master → N brands → pool → route to dest; `diffOverrides()` proof. |
| `cli.mjs` | entry: `probe \| poll \| fanout`. |

## Why child processes (not in-process `Promise.all`)

`render-frame.mjs` launches its own headless Chrome per call. Running each render as a
child process is what makes failure isolation **real**: a timeout becomes `child.kill()`,
a crash is a non-zero exit code, and neither can corrupt the parent scheduler.

## The transport (one-directional — the gap `/ultrathink` caught)

A web app can't reach into a local CLI. Kraken **only writes** `approvals.status`; this
poller **only polls + renders**. Change-detection is the option-B ledger: a row needs
render when `status='approved'` AND `(id, updated_at)` isn't recorded. Re-approval after
an edit bumps `updated_at` → auto re-render. See `docs/kraken-editor-mount-handoff.md`.

## Run it

```bash
node creative-engine/render/cli.mjs probe                 # recommended pool size
node creative-engine/render/cli.mjs poll --once --png     # one poll cycle (live Kraken)
node creative-engine/render/cli.mjs poll                  # long-running poller
node creative-engine/render/cli.mjs fanout --master ov.json --binding bind.json \
     --tagged design.tagged.html --frame f0               # 1 master → registry brands
```

## Evidence (reproducible; `_out/`, `_state/`, `_fixture/` are gitignored)

```bash
node creative-engine/intake/tag-design.mjs campaigns/westfield-100-off/index.html \
     --out creative-engine/render/_fixture/westfield.tagged.html   # build the fixture first
node creative-engine/render/test-pool.mjs      # 5.1 N-at-a-time + 5.2 isolation/manifest
node creative-engine/render/test-poller.mjs    # 5.3 pickup / skip / re-render on bumped updated_at
node creative-engine/render/test-fanout.mjs    # 5.4 1 master → 6 brands, only-5-vars diff proof
```

Live cross-repo round-trip (Kraken approves → poller renders) is FINAL verification, done
later with the Kraken chat against `editor-host.html` mounted in the portal.

## Brand fan-out: how the 5 vars map

The 5 swap vars are just override fields on known element keys (a per-design **binding**
authored from the design's `data-edit-*` roles): `name`→`text`, `eyebrow`→`text`,
`logo`→`src`, `media`→`src`, `color`→`color`. The registry holds the values; everything
else stays byte-identical. `diffOverrides()` proves only those fields changed.

## Known boundaries (flagged, not silently assumed)

- **Frame id** isn't in the embed contract → poller defaults to the first `.cr-frame`,
  overridable by `metadata.frame_id`. If a real embed needs a specific frame, Kraken
  should add `frame_id` to `content_outputs.metadata` (contract addition — flag, don't guess).
- Output is **MP4/PNG** now; **SVG later** (per plan).
- `approvals.overrides jsonb` is read if present; absent → renders the design as-tagged.

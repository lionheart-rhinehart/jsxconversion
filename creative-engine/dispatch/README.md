# creative-engine/dispatch — Phase 6 (the final screen)

Routes an **approved + rendered** creative to its destination. Takes a Phase-5 render
manifest (`creative-engine/render/_out/*-manifest.json`) + the brand registry as
**input data** (no cross-phase code import) and sends each output onward.

Two lanes:

| Lane | Module | Default | Outward? |
|---|---|---|---|
| **6.1 Content Library** | `content-library.mjs` | **dry-run** | live behind `--live` (human-authorized) |
| **6.2 Meta / Facebook queue** | `meta-queue.mjs` | **staged plan** | **never** — writes a publish-plan, no live API |

## How routing works (brand fan-out auto-routes)
`lib/dispatch-jobs.mjs` joins each manifest job (`{ id, out, ok }`) to its brand in
`render/brands/registry.json` by `id`. The brand carries `workspace` + `dest`, so a
6-brand fan-out lands 6 outputs in 6 brand folders with **no per-brand args**. Only
`ok:true` jobs dispatch; a failed render or missing file is **skipped loudly**, never
silently. An unresolved workspace is a **flagged error**, not a silent drop.

## CLI
```
# 6.1 — Content Library (DRY-RUN by default)
node creative-engine/dispatch/cli.mjs library <manifest> [--folder <name>] [--workspace <ws>]
node creative-engine/dispatch/cli.mjs library <manifest> --live [--replace]   # real push

# 6.2 — Meta queue (ALWAYS staged; no live fire)
node creative-engine/dispatch/cli.mjs meta <manifest> [--account <id>] [--campaign <id>]
```

## Human-authorized boundary
- Content Library push writes to **live Supabase** → `--live` required; dry-run is default.
- Meta publish is a deliberate human action. The only connected Meta tools
  (`third-eye-ads`) are **read-only insights** — there is no publish tool to fire. The
  staged publish-plan (`status:'staged'`, `liveFired:false`, `publishCall:null`) IS the
  artifact a human reviews before publishing.

## Proof (this repo, real fixtures)
- **6.1** — `live-proof-6-1.mjs`: the AA fan-out fixture uploaded → ingested → filed into
  `creative-engine-dispatch-test` in AA's own workspace; read back from that folder
  (content id `3ac74364…`). Re-run → `deduped` (idempotent, no duplicate row).
- **6.1 auto-route** — `test-content-library.mjs`: 6 brand jobs each → their own
  workspace+folder; dry-run = would-push + flagged (2 registry workspaces unresolved).
- **6.2** — `test-meta-queue.mjs`: 6 creatives STAGED, `liveFired=false`, `published=0`.

Out of scope (per master plan): scheduling.

---
title: Parallel chats need per-workspace dev ports — and a dual-stack free-port probe
date: 2026-06-03
branch: dev-port-isolation
---

## Context

Goal: let several Claude Code chats run against this repo at once — some building new
campaigns (`/creative-engine`), some repurposing (`/repurpose-campaign`) — without
clobbering each other. Verification of the existing code showed almost everything was
already safe; only one thing collided. This lesson records both what was already safe
(so nobody re-solves it) and the non-obvious bug found while fixing the one gap.

## What was ALREADY safe for parallel chats (don't re-build this)

- **Git isolation** via worktrees: `./scripts/new-workspace.ps1 <name>` creates
  `.claude/worktrees/<name>/` on branch `chat/<name>` from `origin/main`. Rules in
  `docs/parallel-chats.md`. Chats combine only through merge — never by copying files.
- **All on-disk outputs are campaign-namespaced**, so two *differently named* campaigns
  never touch the same path even in one checkout: renders → `out/campaigns/<c>/<angle>/<id>.<ext>`,
  edits → `campaigns/<c>/edits/…`, plan/validation/manifest → `campaigns/<c>/…`, Kraken
  media cache → `brand/kraken-cache/<c>/`. Temp render artifacts embed a
  `campaign-angle-asset` slug in the basename (`run-campaign.mjs`), so even `out/`/`.tmp/`
  intermediates don't collide.
- **Kraken/Supabase export** dedups on the `(campaign, angle, asset)` triple with
  soft-delete + re-ingest — idempotent, no locks.
- **Plan writeback already self-protects**: `run-campaign.mjs` `patchAsset()` probes
  `serverUp()` first; if the campaign isn't on that server (the distinct-name case) it
  falls back to a direct file write into its own `PROJECT_ROOT = resolve(".")`. So
  cross-write only risks two chats reusing the *exact same campaign name*.

**Rule for the user:** one chat = one worktree; keep campaign names distinct.

## The one gap: fixed dev-server ports

`npm run dev` launched editor-server on a hardcoded `:5173` and the review server on
`:5599`. Ports are machine-global, so worktrees don't help — a second `npm run dev`
died with `EADDRINUSE`. The fix made `scripts/dev.mjs` pick per-workspace ports
(main keeps 5173/5599; worktrees start higher), probe for the first free port, write
the chosen pair to `./.dev-ports.json`, and print a ready-to-open review URL. The
render scripts (`run-campaign.mjs`, `kraken-export.mjs`) now read `.dev-ports.json` so
each chat talks to its OWN server. The building blocks already existed: `review.html`
honored `?api=`/`?editor=` overrides, `editor.html` used same-origin relative fetches,
and the servers already read `EDITOR_PORT`/argv.

## THE BUG worth remembering: probe must bind the way the servers bind

First version of the free-port probe did `srv.listen(p, "127.0.0.1")`. It reported
5173/5599 as **free** even though a server was already running on them — then the real
servers crashed with `EADDRINUSE`. Cause: the real servers call `server.listen(PORT)`
with **no host**, which binds **dual-stack `::`** (all interfaces). A probe bound to
`127.0.0.1` only checks the IPv4 loopback socket, which doesn't conflict with an
existing `::`-bound socket — so it lies. Fix: probe with `srv.listen(p)` (no host) so
it conflicts exactly where the real bind will.

**Generalize:** a "is this port free?" check is only valid if it binds the same
host/family as the thing that will actually use the port. Mismatched bind scope =
false "free". This is exactly the kind of thing that passes a code read and only shows
up when you run it against a live server — the dry-run earned its keep.

## Process gotcha: can't end-to-end test a new launcher in a fresh worktree

A new worktree is created from `origin/main`, so **uncommitted changes don't propagate
into it** — it'd run the OLD `dev.mjs`. And copying files across checkouts is forbidden
here. So the true "two `npm run dev` at once" test can only be done after the change is
committed + pushed. The stand-in: run the new launcher in the main checkout while the
existing server holds 5173/5599 — same code path (probe finds base busy → cascades),
which is what a second worktree would hit.

## Verify-live reminder (matches prior feedback)

Cody runs long-lived dev servers, so a running server may be OLD code. After changing
`dev.mjs`, the running server must be restarted to pick it up. "Merged" ≠ "live".

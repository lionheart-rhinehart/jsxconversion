---
title: Remote-publish a v2 package — the spike that decided download-and-serve
date: 2026-06-15
branch: main
---

# Closing the last v2 gap: packages reachable off-laptop

Built `creative-engine/dispatch/publish-package.mjs` (upload a package's whole tree to the
`content-bundles` bucket + register one Kraken `content_outputs`+`approvals` row per frame at public
Storage URLs) and the poller's remote download-and-serve branch (`render/poller.mjs` +
`approvals.mjs`). The loop now runs with every local dev server stopped.

## The content-type spike (gated the poller design — do this BEFORE writing the poller)

`HEAD`/ranged-`GET` on the same objects uploaded to `content-bundles` with **bare** mime strings:

| object | uploaded as | **served** content-type | nosniff |
|---|---|---|---|
| entry `.html` | `text/html` | **`text/plain`** | **yes** |
| `.js` | `application/javascript` | `application/javascript` | no |
| `.css` | `text/css` | `text/css` | no |
| font `.ttf` | `font/ttf` | `font/ttf` | no |

So **only the entry HTML is downgraded** (the documented XSS guard) — and it carries `nosniff`, so
headless Chrome loading the Storage URL directly renders raw text. The peer JS/CSS/fonts keep their
real type and execute. Two consequences:

1. **Poller → download-and-serve** (the robust default). The poller reads a `files.json` the publisher
   writes, pulls the whole tree into `render/_state/remote-cache/<slug>/`, and serves it from its OWN
   ephemeral server — sidestepping every Storage content-type/nosniff issue. The localized metadata
   clone (`asset_base` → local path, `tagged_url` → entry basename) makes the EXISTING
   `isServedLive`/`deriveLiveUrl` resolve it with no new render code.
2. **`metadata.asset_base` MUST be the absolute Storage folder URL** (not a local path) — the Kraken
   portal view route injects `<base href=asset_base>` so the design's relative refs resolve against
   Storage. Verified on prod: `GET /api/portal/embeds/<id>?mode=view&token=…` returns `text/html` with
   that `<base>` injected.

## The keystone gate (broke a test once — now pinned)

`isRemotePackage(meta)` must require **both** `tagged_url` AND `asset_base` to be http. Keying on
`asset_base` alone wrongly caught the legacy static fixture (`test-poller.mjs`), whose `asset_base` is
a throwaway `https://example/assets/` but whose `tagged_url` is a `file://` pre-tagged artifact →
network fetch → fail. Three cases the gate separates: Storage publish (both http → remote/download),
localhost-served (http tagged + `/creative-engine/…` asset_base → serve-in-place), legacy static
(`file://` tagged → pre-tagged file). Pinned in `test/remote-package-gate.test.mjs`.

## Other landmines

- `content-bundles` allowlist matches the EXACT mime string — upload `text/html`, never
  `text/html; charset=utf-8` (415). `publish-package.mjs` retries any allowlist-missing type as
  `application/octet-stream`; the poller re-serves locally by file extension, so Storage's stored mime
  on non-HTML assets is irrelevant to the render.
- `scripts/lib/kraken.mjs` is READ-ONLY on `approvals` by design (Kraken owns writes). The publisher
  is the one engine-side writer, so it inserts the `approvals` row via PostgREST directly with the
  service key — mirroring Kraken's `send-to-approval` insert (token = 32-byte hex, `content_type:'embed'`,
  `status:'pending'`). Portal review link = `${portalBase}/portal?token=<token>`.

## Evidence

`publish-package.mjs --pkg carmel-2c7c5b76 --workspace aa-carmel --live` → 45 files in Storage +
content/approval rows. Prod portal embed route served the design as `text/html`. Simulated the portal
edit (`approvals.overrides = {"f0:e5":{text:"REMOTE PUBLISH PROOF"}}`) + approve (the same DB writes
the Kraken portal makes — Kraken side verified separately), ran the poller: it pulled the package from
Storage and rendered a **1080×1920 / 30fps / 210-frame (7s) / 1.39 MB MP4** with the edited eyebrow
visible and real footage (not black) — **no `localhost:5300` in the path**. `npm test` 181/181 +
`render-live-path` 2/2 + `remote-package-gate` 4/4 + `test-poller` 4/4.

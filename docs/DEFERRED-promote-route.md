# DEFERRED — the "Save as example" review-page button (editor-server route)

The harvest CLI (`node scripts/promote-example.mjs <campaign> <angle> <asset> --label="..."`)
is fully usable now. The one-click **"Save as example"** button in `brand/video-templates/review.html`
needs a `POST /promote` route in `editor-server.mjs` — and editor-server is owned by a concurrent
editor chat (the forbidden-file zone), so this wiring is **deferred**, not built. Recorded here so it
isn't lost.

## When the editor-server is free, add (one route + one button):

**`editor-server.mjs`** — a new route mirroring the existing single-writer pattern (e.g. `POST /approve-trim`):
```
POST /promote/:campaign/:angle/:asset   body: { label }
  → import { runPromote } from "./promote-example.mjs"  (or shell `node scripts/promote-example.mjs ...`)
  → return { ok, exampleId } | { ok:false, error }
```
Use the same `writeAtomic` single-writer discipline; the CLI already does the index/centroid work, so the
route can simply spawn it (keeps the heavy centroid rebuild out of the request path — or return 202 + run async).

**`brand/video-templates/review.html`** (editable, NOT forbidden) — a "Save as example" button beside
Approve/Changes/Edit, enabled only when the card `status==="approved"`, that POSTs to the route and toasts the
returned `exampleId`.

## Related deferred item — G2
The same editor-server-coupling blocks **G2** (adding `exampleId`/`archetype` to the editor-server `/plan`
`ALLOWED` patch allowlist) so a review-page re-pick can persist the binding. Wire both together when the
editor-server is free.

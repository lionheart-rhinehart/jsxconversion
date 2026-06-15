# Handoff — mount the live CreativeEngine editor inside the Kraken approval portal

> **For the Kraken chat / repo (`D:\Claude CODE\The Kraken`, Next.js + Supabase).**
> This **supersedes** the still-thumbnail bridge described in `docs/kraken-embed-approval-handoff.md`.
> That earlier doc shipped a frozen poster PNG so approvals worked at all. This doc is the real target:
> **mount the one portable CreativeEngine editor live in the portal**, with a permission toggle
> (view+comment ⟷ full edit), and define the **Supabase status-field contract** that triggers a render
> back on Cody's machine — with no web-app-reaching-into-a-laptop magic.

---

## Plain-language model (read this first)

Today a "creative" in the portal is a **file the client looks at** — an image or a video. We are adding
a third kind: the **live design itself**. A finished Claude Design export is a self-contained `.html`
that *is* the animated creative (it carries its own runtime + code + images). The portal drops that one
URL into an `<iframe>` and the design plays. The **same** `<iframe>` can run in two modes:

- **View + comment** (Google-Docs style): the client watches it play and highlights-to-comment. Nothing
  about the design changes. This reuses Kraken's existing W3C comment/highlight system.
- **Full edit**: the agency (Cody) — or, if allowed, the client — clicks text to retype, clicks media to
  swap (Kraken media bar), drags to reposition. Every change is a **surgical override** on the untouched
  original HTML — the design is *never re-drawn*. (This is the whole point of the v2 rebuild: no lossy
  rebuilds.)

A single URL param flips the mode (`editor-host.html?view=1` vs no param) — same editor page, both lanes.

> **⚠️ Two SEPARATE systems — do not conflate (and do not build a new comment system):**
> - **Commenting / highlighting = Kraken's EXISTING approval-portal feature.** It already exists:
>   `app/portal/review/[id]/review-client.tsx` + `app/api/portal/approvals/[id]/comments/route.ts`
>   (W3C annotations). The "view" lane just shows the live design read-only *with this existing UI* —
>   **reuse it, build nothing new.**
> - **Editing = the CreativeEngine editor (iframed by URL)**, and it is **EDIT-ONLY** (retype / swap /
>   drag → overrides). It has no commenting of its own. Iframe `editor-host.html` (no param) for the
>   edit lane; `editor-host.html?view=1` is just read-only display.
> So: `?view=1` → read-only design + Kraken's existing comment UI; no param → the editor in edit mode.
> The portal is a section of Kraken, so "the approval portal" and "Kraken" are the same app — the
> commenting lives in that portal.

---

## What THIS repo delivers vs. what the Kraken repo builds

| Piece | Lives in | Status |
|---|---|---|
| Deterministic intake/TAG (stable `data-edit-*` ids on the real HTML) | this repo — `creative-engine/intake/tag-design.mjs` | **built (Phase 1)** |
| The one portable editor (consumes tagged HTML → emits overrides) | this repo — `creative-engine/editor/` | **built (Phase 2)** |
| Hostable editor URL + `permission` flag | this repo — `creative-engine/editor/editor-host.html` (`?view=1` = view; no param = edit) | **built (Phase 2/4)** — this IS the page Kraken iframes; no bundle, no code import |
| Local render poller (watches Supabase, renders approved rows) | this repo | Phase 5 |
| **The Next.js mount** (`<iframe src=…>` the editor URL, wire the permission toggle, persist overrides) | **Kraken repo** | **your task** |

> **Integration model (locked 2026-06-14): iframe-by-URL.** Kraken embeds the editor exactly the
> way it already embeds previews — point an `<iframe src>` at the editor's hosted URL. Kraken does
> **not** import our editor code (verified: a repo-wide grep for `mountEditor`/`creative-engine`/
> `CreativeEngine` in Kraken returns zero; Kraken renders all content via iframes). There is no
> "editor bundle" to import — the deliverable is the **URL** + this contract.

The editor is **the only thing that travels into Kraken** (as a URL in an iframe). The render
engine stays here.

---

## The tagged-HTML contract (what the editor mounts)

Phase-1 intake stamps the real design HTML deterministically. Every editable element inside each
`.cr-frame` carries:

- `data-edit-frame="fN"` on the frame, `data-edit-id="eN"` on each element (stable, document-order).
- role flags: `data-edit-text="1"`, `data-edit-media="1"` (`data-edit-media-kind="video|image|css-bg"`),
  `data-edit-logo="1"`, `data-edit-pos="1"` (everything is positionable).
- `data-edit-mode="plain|svg"` for text; `data-edit-split="eP"` ties split-headline line-spans to their
  logical parent.
- `data-edit-brandkit="1"` on brand-kit assets (logo/wordmark) — **kept in the render, hidden from the
  swap picker.**

The editor reads these ids; overrides are keyed to them: `{ "f3:e12": { text? , src? , pos? } }`. Because
ids are stamped by a script (not an AI), the same design tags the same way every time — so an override set
stays valid across re-intake.

---

## The render trigger — Supabase status-field contract (the gap `/ultrathink` caught)

A web app **cannot reach into a local CLI.** So the transport is **Supabase-mediated and one-directional**:
Kraken only ever writes status to a row; **this repo's local poller** watches for it and renders. Kraken
never calls the laptop.

### Verified `approvals` table fields (from `lib/database.types.ts`, table `approvals`)

> **Re-verified 2026-06-14 (Phase 4) against the live Kraken repo (`D:\Claude CODE\The Kraken`):**
> - **Fields confirmed present** in `lib/database.types.ts` `approvals.Row` (lines 268–307): `id`, `status`,
>   `content_output_id`, `responded_at`, `approved_by_type`, `client_edited`/`client_edited_at`,
>   `client_media_replaced`/`client_media_replaced_at`, `updated_at`, `workspace_id`, `batch_id`.
> - **Render trigger confirmed in code**: `app/api/portal/approvals/[id]/approve/route.ts` (lines 134–147)
>   gates on `approval.status === 'pending'`, then writes `{ status: 'approved', responded_at: <now>,
>   approved_by_type: 'client' }` — exactly the contract below.
> - **Status values confirmed** (`components/approvals/approval-status-badge.tsx:15`):
>   `'pending' | 'approved' | 'revisions_needed' | 'denied'`.
> - **Confirmed ABSENT** (so the two design decisions below stand): no `rendered_at` column, no
>   structured-`overrides` column on `approvals.Row`.

The render contract uses fields that **already exist** — no new columns required on the Kraken side:

| Field | Type | Role in the contract |
|---|---|---|
| `id` | uuid | the approval row identity the poller keys on |
| `status` | text | `'pending' \| 'approved' \| 'revisions_needed' \| 'denied'` — **`'approved'` is the render trigger** |
| `content_output_id` | uuid \| null | links the approval to the content/output row to render |
| `responded_at` | timestamptz \| null | when the client/agency acted (poller orders by this) |
| `approved_by_type` | text \| null | `client` vs `agency` lane — both lanes trigger render |
| `client_edited`, `client_edited_at` | bool / ts | client made edits in the mounted editor |
| `client_media_replaced`, `client_media_replaced_at` | bool / ts | client swapped media |
| `updated_at` | timestamptz | poller's change-detection key (see "no rendered flag" below) |
| `workspace_id`, `batch_id` | uuid | routing / brand-fan-out grouping |

### Where the editor's overrides are stored

`approvals` has **no structured-override column today.** The mounted editor must persist its override bag
(`{ "fN:eM": {text?,src?,pos?} }`) somewhere the poller can read. Recommended (Kraken-side, one small
migration): add `overrides jsonb` to `approvals` (or to the linked `content_outputs` row). The poller
applies that bag to the tagged HTML before rendering. `client_edited=true` flips when it's non-empty.

### "Approved-and-**un**rendered" — the one missing piece

There is **no `rendered_at` column** on `approvals`. Two ways to avoid re-rendering the same row, contract
states **option B** (keeps Kraken write-only, no migration):

- **A (Kraken-side):** add `rendered_at timestamptz null`; poller sets it after a successful render.
- **B (this-repo-side, chosen):** the local poller keeps its own ledger of rendered `(id, updated_at)`
  pairs. A row counts as "needs render" when `status='approved'` **and** `(id, updated_at)` isn't in the
  ledger. Re-approval after an edit bumps `updated_at` → re-renders automatically. **Kraken only ever sets
  `status`; render bookkeeping is wholly owned here.** This is the Phase-5 poller's job.

### Sequence

```
1. Engine (this repo) tags the design → uploads live .html + poster → registers content row (+approval, status='pending').
2. Kraken portal mounts the editor in an <iframe>:
     permission="view"  → comment/highlight only   (client lane, or agency preview)
     permission="edit"  → full edit; writes overrides jsonb back to the approval row
3. Reviewer approves → Kraken sets approvals.status='approved' (sets responded_at, approved_by_type).
4. Local render poller here sees status='approved' AND (id,updated_at) not in its rendered-ledger
     → applies overrides to tagged HTML → pooled render → MP4/PNG → dispatch (Phase 6).
5. Poller records (id,updated_at) in the ledger. Re-approval after edits bumps updated_at → re-render.
```

Nothing renders until a human approves — the safety net that makes hands-off media pull safe.

---

## The view+comment lane — it already exists in Kraken (verified 2026-06-14)

This was checked against the live Kraken repo so the contract is exact, not assumed. **The
"comment" half of the toggle needs NOTHING from this repo** — Kraken already owns it:

| Kraken piece (verified) | What it already does |
|---|---|
| `components/approvals/edit-comment-mode-toggle.tsx` | The segmented toggle itself — `export type ReviewMode = 'edit' \| 'comment'`. Used in both client + admin review screens. |
| `app/portal/review/[id]/review-client.tsx` | **Already renders HTML content in an `<iframe>`** (`iframeUrl`, "render iframe directly") with a **separate annotation iframe**, and even injects CSS into the iframe to fix `100vh` viewport units. The mount target already exists. |
| `components/approvals/annotation-overlay.tsx` + `lib/feedback-widget/src/AnnotationTool.ts` | The comment layer is a **coordinate-based SVG overlaid ON TOP of the surface** (normalized `{x,y,width,height}` against a `canvasDimensions` reference; the tool draws on its own SVG via `getBoundingClientRect` scaling). It does **not** hook into DOM elements inside the content — so it overlays an iframe exactly as it overlays an `<img>`. |

**The mapping Kraken wires (the only integration work):**

- `ReviewMode === 'comment'` → iframe **`editor-host.html?view=1`** (read-only) and let the existing
  annotation overlay sit on top. The editor's view mode does not capture pointer events for editing
  (`body` lacks `ce-edit`, dblclick is inert), so the overlay receives the draw events cleanly.
- `ReviewMode === 'edit'` → iframe **`editor-host.html`** (no param — the surgical editor). Note: this
  REPLACES Kraken's legacy copy/media-replace "edit" with the real design editor for `embed` rows.

**⚠️ One real gotcha — the annotation canvas is landscape by default.**
`AnnotationOverlay` defaults `canvasDimensions = { width: 1920, height: 1080 }`. Our creatives are
**vertical 1080×1920**. A comment drawn near the top of a vertical ad will land in the wrong place
unless Kraken passes `canvasDimensions={{ width: 1080, height: 1920 }}` (or reads the design's real
frame size) when overlaying an `embed`. Document/handle this on the Kraken side.

---

## The three things to build in the Kraken repo

1. **Embed render path** — given a content row of kind `embed`, `<iframe src={editorUrl}>` instead of an
   `<img>`. Poster PNG stays as the fallback/thumbnail. (Kraken already iframes `html-preview`/`website`
   rows today — reuse that path; the `src` is the editor's hosted URL.)
2. **Permission toggle (no code import)** — set the iframe `src` per `ReviewMode`:
   **`'comment'` → `editor-host.html?view=1`** (the annotation overlay rides on top — see "The
   view+comment lane" above), **`'edit'` → `editor-host.html`** (click-to-retype / swap / drag).
   Same page, both lanes. Mind the vertical `canvasDimensions` gotcha noted above.
3. **Persist overrides + set status (the edit lane's transport)** — the edit lane runs cross-origin
   inside the iframe, so it hands its changes OUT via `postMessage`. The editor host posts
   `{ type: 'ce-overrides', overrides, meta }` to `window.parent` on every change (it only fires when
   iframed). Kraken: `window.addEventListener('message', …)` (pin `event.origin` to the editor's host),
   write `overrides` to the approval row (`overrides jsonb`, per above) + set `client_edited`; on
   approve set `status='approved'`. That's the entire render trigger — the poller in this repo does
   the rest. (View+comment+approve need none of this — that loop works on the editor as-is.)

---

## Cross-references

- Master plan: `C:\Users\lionh\.claude\plans\so-i-see-that-memoized-parnas.md` (Phases 4–5).
- Tagger + coverage proof: `creative-engine/intake/tag-design.mjs`, `creative-engine/intake/_out/`.
- Superseded bridge doc: `docs/kraken-embed-approval-handoff.md` (poster-PNG fallback still valid).
- Kraken approvals schema: `D:\Claude CODE\The Kraken\lib\database.types.ts` (table `approvals`).

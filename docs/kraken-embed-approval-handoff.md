# Handoff — render a live-HTML "embed" creative in the Kraken approval portal

> **For the Kraken chat.** The creative-engine's new `/design-to-approval` command pushes finished Claude
> Designs into the Content Library as **live, self-contained HTML** (the animated design, not a render) so a
> client can review and comment on it in the approval portal **without anyone rendering an MP4/PNG first**.
>
> The engine side is built. **This doc is the contract for the one piece that lives in The Kraken:** showing
> that HTML to the client. Until you build it, the engine ships a **still-thumbnail bridge** (a normal
> `type:"image"` row) so approvals work today — but the client sees a frozen frame, not the live design. The
> moment you ship the three changes below, those same items light up as the fully-interactive design.

---

## The mental model (plain language)

A "creative" in the library today is an **image** or a **video** — a file the portal shows the client. We're
adding a third kind: an **embed** — a single `.html` file that, when opened in a browser, *is* the animated
design (it carries its own React runtime + the design code + the images, all inlined). The portal doesn't
need to understand the design; it just needs to drop that one URL into an `<iframe>` and the design plays.

The engine uploads two files per design to Supabase Storage and registers **one** Content-Library row:
- a **poster PNG** (one still frame) — what the bridge shows today, and a safe fallback forever, and
- the **live `.html`** — the URL you'll `<iframe>` once embed support lands.

---

## The row shape the engine writes (read these fields)

`/design-to-approval` calls the existing `ingest-content` edge function. **Today** (bridge) it writes a
`type:"image"` row whose `content` is the poster PNG, with everything needed to upgrade living in `metadata`:

```jsonc
{
  "type": "image",                 // TODAY (bridge). TARGET: "embed" (see change #1)
  "title": "<Theme> · Design <N>", // e.g. "Westfield Campaign · Design 1A"
  "content": "https://<host>/storage/v1/object/public/content-images/…poster….png",
  "thumbnail_url": "https://…/…poster….png",
  "folder_id": "<per-theme folder, or null>",
  "metadata": {
    "source": "design-to-approval",
    "render": "live-html",         // ← THE FLAG. "this row has a live HTML proof; iframe it"
    "live_url": "https://<host>/storage/v1/object/public/content-bundles/…proof….html",
    "campaign": "westfield-campaign",
    "theme": "Westfield Campaign",
    "designNumber": "1A",
    "variation": "VariationA",
    "has_media": true,
    "storage_path": "design-to-approval/<wsId>/…proof….html",
    "storage_bucket": "content-bundles",
    "mime_type": "text/html",
    "uploaded_at": "2026-06-10T…Z"
  }
}
```

**TARGET row** (after change #1 lands): identical, but `type:"embed"` and `content` = the **live HTML URL**
(the poster moves to `thumbnail_url` only). `metadata.render:"live-html"` is present either way — key your
display logic on **`metadata.render === "live-html"` OR `type === "embed"`** so it works during the transition.

The `.html` is **self-contained and CSP-safe by construction** (engine side): React + ReactDOM are inlined
from `node_modules` (no CDN), JSX is **pre-transpiled** (no in-browser Babel, so **no `unsafe-eval` needed**),
and images are base64-embedded. The only external request is the Google-Fonts `<link>` (see CSP note).

---

## What The Kraken must build (3 changes)

### 1. Accept `type:"embed"` in `ingest-content`
The edge function's type validation currently whitelists `image | video | copy-only` (this is why the engine
uses the `image` bridge today). Add `embed` as a valid `type`. No new storage logic — `content` is just a
public URL like any other; the bytes are already uploaded by the engine.

### 2. Render an embed as an `<iframe>` — in BOTH surfaces
Wherever the portal renders a creative's media — **the Content-Library card/detail AND the approval/review
page** — branch on `metadata.render === "live-html" || type === "embed"` and iframe the bundle.

> **⚠ Critical gotcha (verified against live storage):** Supabase Storage serves the uploaded `.html` with
> **`content-type: text/plain`** (a security downgrade — object stores refuse to serve user HTML as
> `text/html` on the storage domain). So a naive `<iframe src={live_url}>` shows the **HTML source**, not the
> rendered design. Use ONE of these instead:

**Option A — proxy route (recommended).** A tiny portal API route fetches `metadata.live_url` server-side and
returns it with `content-type: text/html`. Then `src` works, it's same-origin (no CORS), and you control CSP:
```js
// app/api/embed/[id]/route.ts  → fetch the row's metadata.live_url, return new Response(html, {
//   headers: { "content-type": "text/html; charset=utf-8" } })
```
```html
<iframe src={`/api/embed/${row.id}`} sandbox="allow-scripts"
        style="width:100%;height:100%;border:0;display:block" title={row.title}></iframe>
```

**Option B — `srcdoc` (no server route).** Fetch the bundle text client-side and inject it:
```js
const html = await fetch(row.metadata.live_url).then(r => r.text()); // text/plain is fine for .text()
// <iframe srcdoc={html} sandbox="allow-scripts" …>
```
Public `content-bundles` objects send `Access-Control-Allow-Origin: *`, so the cross-origin fetch works; if a
future bucket policy blocks it, fall back to Option A. (`srcdoc` runs inline scripts under `allow-scripts`.)

- **`sandbox="allow-scripts"` is sufficient** — the proof needs to run JS, nothing else. Do **not** add
  `allow-same-origin` (the design's `localStorage` playhead-save is wrapped in try/catch and degrades to t=0;
  it does not need persistence). No `allow-popups`, no `allow-forms`.
- **The iframe MUST have a definite height.** The design's `<Stage>` auto-scales itself to its container via a
  `ResizeObserver` computing `scale = min(w/1080, (h-44)/1920)`. If the iframe is `height:auto`/`0`, the Stage
  scales to nothing and the client sees a blank box. Give the iframe a real height — e.g. a **9:16 box**
  (`aspect-ratio: 9/16`) or a fixed `height` (the design is 1080×1920, portrait). The proof already paints a
  `"<Theme> · Design <N>"` header band at the top and keeps the scrub bar at the bottom (intentional — lets the
  client pause/scrub to a moment and comment on it, matching the portal's timestamped comments).

### 3. Accept an embed row in `send_to_approval`
`send_to_approval`'s `contentTypeOverride` enum is `image | video | copy-only`. The engine currently passes
`contentTypeOverride:"image"` (bridge). Once embeds render, allow embed rows through (add `"embed"` to the
override enum, **or** simply let a row with `metadata.render==="live-html"` create a pending approval without a
media-type gate). The approval/comment flow itself is unchanged — the client comments on the iframe exactly as
they comment on an image/video today (W3C annotations per `docs/review-notes-plumbing.md`).

---

## CSP note (so the design isn't blank or unstyled)

The portal's frame/page CSP must permit what the proof loads:
- **Scripts:** all inlined → `script-src` needs only to allow inline classic scripts inside the sandboxed
  iframe (the `sandbox="allow-scripts"` frame runs them). **No `unsafe-eval`, no external script host.**
- **Fonts:** the proof keeps a Google-Fonts `<link>` (`Anton`/`Fraunces`/etc. are load-bearing). Allow
  `style-src https://fonts.googleapis.com` + `font-src https://fonts.gstatic.com` for the iframe. *(If you'd
  rather have zero external requests, tell the engine chat — it can self-host the fonts as base64 `@font-face`,
  at the cost of a build-time fetch and larger files.)*
- **Images:** base64 `data:` URIs → `img-src data:` (and `style-src 'unsafe-inline'`/`data:` for CSS).

---

## How to verify your side (without a real client)

1. Have the engine run `node scripts/design-to-approval.mjs … --workspace cody-personal --dry-run` to create
   one `image`/`embed` row in the **`cody-personal`** workspace, and grab the `metadata.live_url`.
2. Open that `live_url` directly in a browser → you should see the animated design with the header band + scrub
   bar. (Proves the artifact; independent of the portal.)
3. Drop it into your `<iframe src=… sandbox="allow-scripts">` at a 9:16 height in a scratch page → confirm it
   renders identically (catches CSP/sandbox/height issues).
4. Then in the portal's library + approval view for that row → confirm the iframe shows and comments save.

---

## Contract summary (the stable bits — don't drift)

| Field | Meaning | Stable? |
|---|---|---|
| `metadata.render === "live-html"` | "this row is a live-HTML proof — iframe it" | **Yes — key on this** |
| `metadata.live_url` | the self-contained `.html` to iframe | **Yes** |
| `content` (bridge) | poster PNG today; live HTML once `type:"embed"` | transitional |
| `thumbnail_url` | poster PNG (always a safe still) | **Yes** |
| `type` | `"image"` (bridge) → `"embed"` (target) | transitional |
| iframe sandbox | `allow-scripts` only; needs a **definite height** | **Yes** |

Engine-side entry points (for reference, you don't edit these): `scripts/design-to-approval.mjs`,
`scripts/lib/kraken.mjs` (`uploadToStorage`/`ingestContent`), `.claude/skills/design-to-approval/SKILL.md`.

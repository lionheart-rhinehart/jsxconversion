# Review-notes plumbing (markup feedback storage)

Markup notes (the Frame.io-style timestamped circles + comments left in the editor's
**Markup** mode) are **review feedback only** — they are **never** baked into the
exported PNG/MP4. This doc is the contract for storing them and connecting them to
anything later (the Kraken approval portal, a webhook, email, an MCP).

> TL;DR for a future integration: the notes are already stored in a portable,
> self-describing shape. To send them somewhere real, implement the **publish seam**
> in `scripts/editor-server.mjs` (`/annotations/publish`). That is the single place
> to wire it — nothing else changes.

## Where notes live

`/.annotations-store/<safe-editor-id>.json` — machine-local, **gitignored**. One file
per creative. Written atomically (temp file + rename). The editor id is slugged to a
safe filename (`camp:c:a:as` → `camp_c_a_as`).

## The record shape (self-describing)

Each file is one object — a `creative` block (so the file is portable: a consumer
knows *what* the notes are about without any outside context) + the W3C Web-Annotation
array (the exact shape the Kraken portal's `VideoAnnotation` already speaks):

```jsonc
{
  "creative": {
    "editorId": "camp:multisport-foundations:confidence:proof-A1", // authoritative (from ?id=)
    "kind": "video",                 // "video" | "image"
    "mediaPath": "./assets/clip.mp4",
    "campaign": "multisport-foundations", // parsed from a camp: id, else null
    "angle": "confidence",
    "asset": "proof-A1",
    "brand": "smaa",                 // attached brand slug, or null
    "source": "aa-creative-engine",  // stamped by the server
    "schemaVersion": 1,              // stamped by the server
    "updatedAt": "2026-06-07T23:03:16.635Z" // stamped by the server
  },
  "annotations": [
    {
      "id": "an-tmm1nj",
      "type": "Annotation",
      "target": { "selector": {
        "type": "FragmentSelector",
        "conformsTo": "http://www.w3.org/TR/media-frags/",
        "timestamp": 1.99,                 // clip-relative seconds (omitted on images)
        "region": "xywh=pixel:158,602,293,427" // a drawn shape's bbox (optional)
      }},
      "metadata": {
        "comment": "tighten the landing here",
        "color": "#c4141d",
        "x": 158, "y": 602,                // pin position
        "shapes": [ { "type": "ellipse", "x": 158, "y": 602, "width": 293, "height": 427, "stroke": "#c4141d", "strokeWidth": 12, "fill": "none" } ]
      },
      "createdAt": "2026-06-07T23:03:16.635Z"
    }
  ]
}
```

The editor sends `creative` best-effort on every save; the **server owns** `editorId`,
`source`, `schemaVersion`, `updatedAt` (so they can't drift).

## Endpoints (`scripts/editor-server.mjs`)

| Method + path | Purpose |
|---|---|
| `GET /annotations?id=<editorId>` | Read one creative's `{ creative, annotations }`. |
| `POST /annotations?id=<editorId>` | Save one creative's notes. Body: `{ creative, annotations }`. |
| `GET /annotations` *(no id)* | **List every stored note-set** — `{ sets: [{ editorId, creative, count, updatedAt }] }`. How a future dashboard / "send all pending" discovers what exists. |
| `GET\|POST /annotations/publish?id=<editorId>` | **The publish seam.** Returns the full outbound `{ ok, published, package:{ creative, annotations, publishedAt } }`. |

## The publish seam (the one place to connect later)

`/annotations/publish` currently just returns the package so the editor's **Send for
review** button can download it. To connect a real destination, add the send at the
`── FUTURE INTEGRATION POINT ──` comment in that route, e.g.:

```js
await fetch(KRAKEN_PORTAL_URL + "/annotations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(pkg),          // pkg = { creative, annotations, publishedAt }
});
```

Flip `published` to `true` on success. The editor keeps downloading a confirmation
copy regardless, so nothing in the author's flow changes.

## Editor side

- `buildCreativeMeta()` builds the `creative` block (reuses `parseCampId`).
- `saveMarkup()` POSTs `{ creative, annotations }` (debounced).
- **Send for review** button (Markup panel) → flush save → `POST /annotations/publish`
  → downloads `<editor-id>-review-notes.json`. Disabled until there's at least one note.

Markup is still **never** written into `config.fixedDesign` and **never** rendered —
see `commitDraw` in `out/editor/editor.html` (the `_draw.mode === 'markup'` branch).

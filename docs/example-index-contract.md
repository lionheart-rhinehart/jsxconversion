# The example-index contract — Track A ∥ Track B

This is the **one seam** between the two parallel builds:

- **Track A — the engine** (the hardening plan's Phases 0–6): generation, gates, cluster-variety
  logic, scorecard, harvest. It **references examples by id** and reads this index.
- **Track B — the example library:** (B1) Cody gathers/creates ~150–240 example creatives across the
  kinds; (B2) a render→embed→vision-label sidecar (CLIP/DINOv2 + a vision LLM) **produces** this index
  + diversity metrics.

If the two sides disagree on the schema, the id, the kind vocabulary, the media-style vocabulary, or
where rendered images live, they **drift** and integration breaks. So the contract isn't prose you're
trusted to follow — it's **code that runs**: [`scripts/lib/example-library.mjs`](../scripts/lib/example-library.mjs).
Both tracks `import` it; there's only one definition, so neither can drift. This doc is the human
reading of that file, and [`test/example-contract.test.mjs`](../test/example-contract.test.mjs) pins it
in CI. **If this doc and the module ever disagree, the module wins** — update the doc.

> Analogy: think of it as a shipping container standard. Track A builds trucks, Track B builds the
> cargo, and neither has to coordinate on the day of delivery — they only had to agree, once, on the
> exact dimensions of the container. This file is those dimensions.

---

## 1. Storage locations (fixed)

| What | Path | Notes |
|---|---|---|
| The index | `templates/_example-index.json` | Track B writes it; Track A reads it. |
| Rendered images | `templates/_examples/<exampleId>.png` | The still CLIP/DINOv2 + the vision LLM label. For a **video** example this is the representative/poster frame. |
| Motion clip (optional) | `templates/_examples/<exampleId>.mp4` | Video examples only. |
| Source (optional, recommended) | `templates/_examples/<exampleId>.jsx` (+ `.config.json` for static) | Co-located so an example is self-contained. |

All paths inside the index are **repo-root-relative with forward slashes** — never backslashes, even on
Windows. The validator enforces that `renderedImagePath` is **exactly** `templates/_examples/<id>.png`,
so the index key and the image path can't drift apart.

Helpers (don't hand-build paths): `exampleImagePath(id)`, `exampleMotionPath(id)`, `exampleSourcePaths(id)`.

---

## 2. The example-id convention (fixed)

```
ex-<NNN>-<slug>
```

- **`ex-`** — namespaces examples **apart from the legacy template bank** (`cluster-*`, `fresh-*`), so
  the two coexist without key collisions.
- **`<NNN>`** — a zero-padded **≥3-digit sequence**: stable + unique. **An id never changes**, so an
  example ref survives a re-label.
- **`<slug>`** — a kebab human hint (`a–z 0–9`, hyphen-separated). A **hint only** — the authoritative
  kind is the `kind` *field*, not the slug, so re-labeling never forces a rename.

Examples: `ex-001-coach-to-camera-gym`, `ex-014-giant-pr-number`.
Build one with `makeExampleId(seq, label)`; validate with `isExampleId(id)` / `EXAMPLE_ID_RE`.

> **Why the kind isn't in the id:** clustering can re-label an example (the CLIP/DINOv2 + vision pass may
> decide `ex-008` is really `training-scene`, not `action-hero-text`). If the kind lived in the id, that
> would rename the file and break every ref. So kind is a mutable **field**; the id is forever.

---

## 3. The schema

The index file:

```jsonc
{
  "note": "…",
  "schema": "example-library/v1",
  "generatedAt": "<iso8601 | null>",
  "examples": {
    "<exampleId>": { /* entry, below */ }
  }
}
```

One **entry**:

```jsonc
{
  "kind": "coach-direct-address",          // closed KIND enum (§4)
  "format": "video",                       // "static" | "video"; must be allowed for the kind
  "mediaStyleAccepts": [                    // closed MEDIA-STYLE tags (§5); ⊆ the kind's allowed set
    "production:cinematic", "subject:coach-face"
  ],
  "slotShape": {                           // the copy SHAPE this example exposes (§6)
    "slots": [
      { "id": "eyebrow",  "role": "eyebrow", "maxChars": 24, "required": true  },
      { "id": "headline", "role": "hook",    "maxChars": 48, "required": true  },
      { "id": "cta",      "role": "cta",     "maxChars": 20, "required": false }
    ],
    "roleSet": ["eyebrow", "hook", "cta"]   // optional; if present must equal the slots' roles
  },
  "renderedImagePath": "templates/_examples/ex-001-coach-to-camera-gym.png",
  "motionPath": "templates/_examples/ex-001-coach-to-camera-gym.mp4",  // optional, video only
  "sourcePath": "templates/_examples/ex-001-coach-to-camera-gym.jsx",  // optional
  "clusterMetrics": {                      // Track B's sidecar fills this (§7); may be absent pre-label
    "subLook": "gym-warm",
    "labeledBy": "gemini-2.x",
    "labeledAt": "2026-06-06T00:00:00.000Z",
    "intraKindMaxCosine": 0.61,
    "silhouette": 0.42,
    "nearestNeighbor": { "exampleId": "ex-002-coach-to-camera-field", "cosine": 0.58 }
  }
}
```

**Required:** `kind`, `format`, `mediaStyleAccepts`, `slotShape`, `renderedImagePath`.
**Optional / forward-compatible:** `motionPath`, `sourcePath`, `clusterMetrics` (and the sidecar may add
unknown keys to `clusterMetrics` without a contract bump). Validate with
`validateExampleEntry(id, entry)` → `{ errors, warnings }` (errors block trust; warnings are soft, e.g.
"not labeled yet"). `validateExampleIndex(index)` aggregates the whole file.

---

## 4. The KIND vocabulary (closed — §`KINDS` / `KIND_SPECS`)

Visual archetypes, cut by **visual structure** (subject × composition × production × motion), *not* by
message — the axis Meta's Andromeda + the embedding models actually cluster on. First-pass **accepted**;
the CLIP/DINOv2 validation + real performance may prune/merge. Each kind declares its allowed media tags
and valid formats in `KIND_SPECS` (the map the engine's media-fit gate **and** Track B's labeler share).

| Kind | Formats | Media (allowed superset) |
|---|---|---|
| `authentic-selfie` | static, video | ugc-selfie + athlete/coach-face |
| `coach-direct-address` | video, static | mid-fi/cinematic + coach-face |
| `action-hero-text` | static, video | cinematic + athlete-action |
| `training-scene` | static, video | cinematic/lifestyle + action + gym/field/outdoor |
| `before-after-split` | static, video | 2× athlete action/face |
| `proof-collage` | static | athlete/parent-face stills |
| `giant-stat` | static | media-optional (any) |
| `metric-reveal` | video | media-optional (any) |
| `kinetic-statement` | video | media-optional (any) |
| `list-steps` | static, video | media-optional (any) |
| `offer-guarantee` | static, video | media-optional (any) |
| `versus` | static | media-optional (any) |

"Media-optional" = the **style** isn't constrained for this kind (any real media, or a small support
graphic). It does **not** waive the separate rule that every creative carries real media (Tier-1 #2).

To change the list: edit `KINDS` + `KIND_SPECS` in the module (one place — both tracks + the validator
see it at once). Don't fork it into a second list.

---

## 5. The MEDIA-STYLE vocabulary (closed — §`MEDIA_STYLE_TAGS`)

Namespaced `facet:value` flat tags. A Kraken media file (Track B tags it) and a kind both speak this
vocabulary; the engine may pull a clip **only** where the media's tags satisfy the kind's `accepts` — so
it can't fake UGC from cinematic footage, or vice-versa. Mirrors the existing element `role`/`accepts`
pattern.

- **subject:** `athlete-face` · `athlete-action` · `coach-face` · `parent-face` · `no-human`
- **production:** `ugc-selfie` · `cinematic` · `studio` · `lifestyle` · `mid-fi`
- **env:** `gym` · `field` · `outdoor` · `home` · `studio` · `none`

Extend in the module (`MEDIA_SUBJECT` / `MEDIA_PRODUCTION` / `MEDIA_ENV`), not in a campaign or a
side file.

---

## 6. `slotShape` — the copy shape

The engine **designs around the copy**: it computes the copy's shape (segments + lengths) first, then
matches/generates to an example whose `slotShape` can hold it. Each slot:

- **`id`** — unique within the example.
- **`role`** — a closed **ROLE** ([`scripts/lib/roles.mjs`](../scripts/lib/roles.mjs)): what the copy
  *does* (hook / claim / stat / cta / body / …), not how it looks. Mirrors static `elements[].role` and
  motion `*_SPEC` roles.
- **`maxChars`** — capacity (static configs carry it; `null` when unknown, e.g. most motion).
- **`required`** — must a segment land here, or is the slot optional.

`roleSet` is an optional derived convenience; if present it **must** equal the distinct slot roles (the
validator rejects a mismatch).

---

## 7. `clusterMetrics` — produced by Track B's sidecar

Track B's render→embed→label pipeline fills this; **before that it may be absent** (a warning, not an
error — the entry is still structurally valid). Known fields (all optional/nullable, validated softly):

- `subLook` — the sub-look label (a kind needs ≥3 sub-looks so it isn't one look repeated).
- `labeledBy` / `labeledAt` — provenance of the labeling pass.
- `intraKindMaxCosine` / `meanCrossKindCosine` / `silhouette` — the diversity numbers (the "measured
  spectrum"). Thresholds the library should hit (from the research): cross-kind cosine **< 0.70**,
  silhouette **≥ 0.35**, Vendi **≥ 8** for a 12-kind set, intra-kind pairwise **< 0.75**.
- `nearestNeighbor` — `{ exampleId, cosine }`, the closest other example.

The sidecar may add more keys; unknown keys are allowed (forward-compatible). Keep **big embedding
vectors out of this file** — store them in a sidecar artifact and reference them, so the index stays
small and diff-able. Two correctness notes the contract assumes: **seed the clustering**
(`random_state`) so assignments are stable run-to-run, and **embed only render-QA-passed images** so a
black/frozen frame can't poison the matrix.

---

## 8. How each track uses it

**Track A (engine):** `loadExampleIndex(root)` → falls back to a valid empty index when the file is
absent, so the engine never crashes pre-library. Pick examples by `kind` (variety/cluster caps) and by
`slotShape` fit (copy shape), pull media that satisfies `mediaStyleAccepts`, and read images from
`renderedImagePath`. Develop against the **empty stub** that ships today.

**Track B (library):** create example creatives → render → write `templates/_examples/<id>.png` (+ source)
→ run the embed/label sidecar → write `templates/_example-index.json` with a conformant entry per example.
**Run `npm test` (or `validateExampleIndex`) before committing the index** — a non-conformant entry is a
drift the contract catches here, not in a campaign.

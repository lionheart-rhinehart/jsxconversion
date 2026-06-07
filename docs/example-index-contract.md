# The example-index contract — Track A ∥ Track B

This is the **one seam** between the two parallel builds:

- **Track A — the engine** (the hardening plan's Phases 0–6): generation, gates, cluster-variety
  logic, scorecard, harvest. It **references examples by id** and reads this index.
- **Track B — the example library (SHIPPED):** the palette of **109 examples / 31 archetypes** (15 static
  designs + 16 motion archetypes), produced by a render→embed→vision-label sidecar
  (`scripts/example-sidecar/`, CLIP-L/14 + DINOv2-L + a vision LLM) that writes this index + diversity
  metrics. (How media goes *into* the designs: `docs/media-integration-findings.md`.)

If the two sides disagree on the schema, the id, the **archetype** vocabulary, the media-style vocabulary,
or where rendered images live, they **drift** and integration breaks. So the contract isn't prose you're
trusted to follow — it's **code that runs**: [`scripts/lib/example-library.mjs`](../scripts/lib/example-library.mjs).
Both tracks `import` it; there's only one definition, so neither can drift. This doc is the human
reading of that file, and [`test/example-contract.test.mjs`](../test/example-contract.test.mjs) pins it
in CI. **If this doc and the module ever disagree, the module wins** — update the doc.

> **Vocabulary:** **ARCHETYPE** = the category a creative belongs to (its visual structure). **CLUSTER** =
> the grouping an archetype's examples form in embedding space (the `clusterMetrics`). Two different things —
> don't conflate the words. (The old term "kind" was renamed to "archetype" everywhere; the index is
> `schema: example-library/v2`.)

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
  archetype is the `archetype` *field*, not the slug, so re-labeling never forces a rename.

Examples: `ex-001-giant-stat`, `ex-046-metric-reveal`.
Build one with `makeExampleId(seq, label)`; validate with `isExampleId(id)` / `EXAMPLE_ID_RE`.

> **Why the archetype isn't in the id:** the labeler can re-label an example (the CLIP/DINOv2 + vision pass
> may decide `ex-008` is really `training-scene`, not `action-hero`). If the archetype lived in the id, that
> would rename the file and break every ref. So archetype is a mutable **field**; the id is forever.

---

## 3. The schema

The index file:

```jsonc
{
  "note": "…",
  "schema": "example-library/v2",
  "generatedAt": "<iso8601 | null>",
  "diversity": { /* palette-wide DIAGNOSTICS — see §7 (not a gate) */ },
  "examples": {
    "<exampleId>": { /* entry, below */ }
  }
}
```

One **entry** (mirrors a real v2 entry, `ex-001-giant-stat`):

```jsonc
{
  "archetype": "giant-stat",                 // closed ARCHETYPE enum (§4)
  "format": "static",                        // "static" | "video"; must be allowed for the archetype
  "mediaStyleAccepts": [],                    // closed MEDIA-STYLE tags (§5); ⊆ the archetype's allowed set ([] = unconstrained)
  "slotShape": {                             // the copy SHAPE this example exposes (§6)
    "slots": [
      { "id": "label", "role": "kicker", "maxChars": 20, "required": false },
      { "id": "stat",  "role": "stat",   "maxChars": 8,  "required": true  },
      { "id": "sub",   "role": "claim",  "maxChars": 28, "required": false }
    ],
    "roleSet": ["kicker", "stat", "claim"]    // optional; if present must equal the slots' roles
  },
  "renderedImagePath": "templates/_examples/ex-001-giant-stat.png",
  "sourcePath": "templates/_examples/ex-001-giant-stat.jsx",          // optional
  // "motionPath": "templates/_examples/<id>.mp4",                    // video examples only
  "clusterMetrics": {                        // Track B's sidecar fills this (§7); may be absent pre-label
    "subLook": "giant-stat-a",
    "labeledBy": "gemini:gemini-2.5-flash",
    "labeledAt": "2026-06-07T18:42:38.342Z",
    "embedder": "openai/clip-vit-large-patch14 + facebook/dinov2-large",
    "intraArchetypeMaxCosine": 0.4932,
    "meanCrossArchetypeCosine": 0.4042,
    "silhouette": -0.2942,
    "nearestNeighbor": { "exampleId": "ex-007-kinetic-text", "cosine": 0.6154 }
  }
}
```

**Required:** `archetype`, `format`, `mediaStyleAccepts`, `slotShape`, `renderedImagePath`.
**Optional / forward-compatible:** `motionPath`, `sourcePath`, `clusterMetrics` (and the sidecar may add
unknown keys to `clusterMetrics` without a contract bump). Validate with
`validateExampleEntry(id, entry)` → `{ errors, warnings }` (errors block trust; warnings are soft, e.g.
"not labeled yet"). `validateExampleIndex(index)` aggregates the whole file.

---

## 4. The ARCHETYPE vocabulary (closed — §`ARCHETYPES` / `ARCHETYPE_SPECS`)

Visual archetypes, cut by **visual structure** (subject × composition × production × motion), *not* by
message — the axis Meta's Andromeda + the embedding models actually cluster on. **The 15 static archetypes**
(each declares its allowed media tags + formats in `ARCHETYPE_SPECS`):

| Archetype | Formats | Media (allowed superset; [] = unconstrained) |
|---|---|---|
| `giant-stat` | static | [] (media-optional) |
| `metric-reveal` | static, video | [] (media-optional) |
| `kinetic-text` | static, video | [] (media-optional) |
| `quote-card` | static | [] (media-optional) |
| `before-after-split` | static, video | athlete-action / athlete-face |
| `versus` | static | [] (media-optional) |
| `proof-collage` | static | athlete-face / parent-face |
| `list-steps` | static, video | [] (media-optional) |
| `offer-card` | static | [] (media-optional) |
| `action-hero` | static, video | cinematic + athlete-action |
| `training-scene` | static, video | cinematic/lifestyle + action + gym/field/outdoor |
| `ugc-selfie` | static, video | ugc-selfie + athlete/coach-face |
| `split-panel` | static, video | mid-fi/cinematic + coach-face |
| `timeline-schedule` | static | [] (media-optional) |
| `benefit-iconrow` | static | [] (media-optional) |

The **16 motion archetypes** are a **separate vocabulary** (`MOTION_ARCHETYPES` — `count-up-stats`,
`radar-stats`, `stopwatch-countdown`, `bracket-tree`, `comic-strip`, `star-testimonial`, `macro-ring`,
`scoreboard`, `streak-counter`, `slot-roll`, `tier-list`, `sprint-trace`, `calendar-fill`,
`leaderboard-roll`, `velocity-gauge`, `anatomy-diagram`; all video-only, media-optional). The engine's
static paths use `isArchetype`/`ARCHETYPE_SPECS` (15 only); Track B's validator uses the union
(`isAnyArchetype`/`specFor`). **The module is the canonical list** — don't duplicate all 31 here.

"Media-optional" = the **style** isn't constrained (any real media, or a small support graphic). It does
**not** waive the separate rule that every creative carries real media (Tier-1 #2).

To change the set: edit `ARCHETYPES`/`MOTION_ARCHETYPES` + their `*_SPECS` in the module (one place — both
tracks + the validator see it at once). Don't fork it into a second list.

---

## 5. The MEDIA-STYLE vocabulary (closed — §`MEDIA_STYLE_TAGS`)

Namespaced `facet:value` flat tags. A Kraken media file (Track B tags it) and an archetype both speak this
vocabulary; the engine may pull a clip **only** where the media's tags satisfy the archetype's `accepts` —
so it can't fake UGC from cinematic footage, or vice-versa. Mirrors the existing element `role`/`accepts`
pattern.

- **subject:** `athlete-face` · `athlete-action` · `coach-face` · `parent-face` · `no-human`
- **production:** `ugc-selfie` · `cinematic` · `studio` · `lifestyle` · `mid-fi`
- **env:** `gym` · `field` · `outdoor` · `home` · `studio` · `none`

Extend in the module (`MEDIA_SUBJECT` / `MEDIA_PRODUCTION` / `MEDIA_ENV`), not in a campaign or a
side file. How much media a design can carry without collapsing distinctness is measured in
`docs/media-integration-findings.md` (no full-bleed on graphic designs; cutout/split-panel for large media;
accent ≤ ~20%; footage diversity mandatory; facility imagery diversifies).

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

## 7. `clusterMetrics` — produced by Track B's sidecar (PALETTE DIAGNOSTICS, not a gate)

Track B's render→embed→label pipeline fills this; **before that it may be absent** (a warning, not an
error — the entry is still structurally valid). Known fields (all optional/nullable, validated softly):

- `subLook` — the sub-look label (when an archetype has more than one execution).
- `labeledBy` / `labeledAt` / `embedder` — provenance of the labeling/embed pass.
- `intraArchetypeMaxCosine` / `meanCrossArchetypeCosine` / `silhouette` — diversity numbers.
- `nearestNeighbor` — `{ exampleId, cosine }`, the closest other example.

**These are diagnostics, NOT a pass/fail gate.** The library is a diverse **palette**, not a globally-
distinct set — a real shipped example even has a *negative* silhouette (−0.29), and the palette's max
cross-archetype cosine is ≈ 0.76. That's fine: **distinctness is enforced at SELECTION time** (per running
segment — Track A's Marker 2), never on the whole library. Palette-wide diagnostics (Vendi ≈ 14.6, mean
cross-archetype ≈ 0.36, k-means purity) live in the index's top-level `diversity` block for eyeballing.

The sidecar may add more keys; unknown keys are allowed (forward-compatible). Keep **big embedding
vectors out of this file** — store them in a sidecar artifact (the `.npz` in `scripts/example-sidecar/`)
and reference them, so the index stays small and diff-able. Two correctness notes: **seed the clustering**
(`random_state`) so assignments are stable run-to-run, and **embed only render-QA-passed images** so a
black/frozen frame can't poison the matrix.

---

## 8. How each track uses it

**Track A (engine):** `loadExampleIndex(root)` → falls back to a valid empty index when the file is
absent, so the engine never crashes. Pick examples by `archetype` (variety/cluster caps, at selection
time) and by `slotShape` fit (copy shape), pull media that satisfies `mediaStyleAccepts`, and read images
from `renderedImagePath`.

**Track B (library):** create example creatives → render → write `templates/_examples/<id>.png` (+ source)
→ run the embed/label sidecar → write `templates/_example-index.json` with a conformant entry per example.
**Run `npm test` (or `validateExampleIndex`) before committing the index** — a non-conformant entry is a
drift the contract catches here, not in a campaign.

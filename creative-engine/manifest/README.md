# creative-engine/manifest — media manifest & naming (Phase 3)

**The problem this solves.** Kraken hands us media where many clips share the same
human title — "agility drill", "agility drill", "agility drill"… The local cache
filename collapses them all to `agility-drill*`, so **selecting the right clip by name
is impossible**. The cure: stop selecting by name. Give every asset a stable identity
+ machine-readable **tags**, and select by **meaning**.

> **Clean room.** Zero imports from `creative-engine-v1/`. The `kraken.mjs` row shape
> (`{id,title,content,metadata}`) was matched by reading the *active* repo connector,
> not the locked archive.

## The four pieces

| File | Role |
|---|---|
| `vocab.mjs` | Controlled vocabulary — maps raw words → canonical facet values (sport, drill, age, brand, gender) + the mime→motion/static rule. The dictionary, extend freely. |
| `manifest.mjs` | Library core — stable 6-hex `id` (deterministic hash of source identity), descriptive `slug` (tags + `-id`, collision-proof), load/save/upsert, human-tag preservation. |
| `tag-media.mjs` | The builder/CLI — scans a media folder, derives tags from **hard signal only** (filename, folder, optional `<file>.meta.json` sidecar, extension). Anything too thin to select by gets **flagged `needsReview`** — never silently guessed, never dropped (Phase-1 discipline). |
| `select.mjs` | The query engine/CLI — `select(manifest, {sport,drill,age,brand,kind,text})` → ranked matches. Facet hits score high; a facet the row *contradicts* is a hard miss (excluded); free-text is a tiebreaker. |

## A row

```jsonc
{
  "id": "aba3ed",
  "slug": "soccer-agility-ladder-quick-feet-u12-aba3ed",   // descriptive + id → unique
  "file": "agility-drill.mp4",                              // raw name COLLIDES with 4 others
  "kind": "motion",
  "tags": { "sport": ["soccer"], "drill": ["agility","ladder","quick-feet"],
            "age": ["u12"], "motion": true, "kind": "motion" },
  "freeText": ["agility","drill","ladder","quick","feet","u12","soccer"],
  "source": { "krakenId": "kr-001", "title": "Agility Drill - Ladder Quick Feet U12 Soccer",
              "folder": "raw-footage/agility" },
  "needsReview": false
}
```

## Usage

```bash
# 1. Tag a media folder (writes media-manifest.json into it)
node creative-engine/manifest/tag-media.mjs <mediaDir> [--out <manifest.json>] [--overwrite]

# 2. Select by meaning
node creative-engine/manifest/select.mjs <manifest.json> \
    [--sport soccer] [--drill ladder] [--age u12] [--brand aa] \
    [--kind motion|static] [--text "quick feet"] [--top N] [--json]
```

`--overwrite` re-derives tags; without it, re-runs preserve any `humanTags` enrichment.

## Proof (3.2 — name-collision swamp)

Rebuild the fixture and reproduce the proof any time:

```bash
node creative-engine/manifest/_fixtures/make-collision-fixture.mjs
node creative-engine/manifest/tag-media.mjs creative-engine/manifest/_fixtures/collision
node creative-engine/manifest/select.mjs \
  creative-engine/manifest/_fixtures/collision/media-manifest.json \
  --drill ladder --age u12 --kind motion
```

All 5 fixture assets share the filename handle `agility-drill`; each tag query
returns **exactly the one intended asset**. The decisive case: `ladder + u12` exists
as both a **motion** clip and a **static** image — `--kind` splits them to different
files. Selection by filename could never do that.

Generated manifests + placeholder fixture media are gitignored (reproducible from the
deterministic maker).

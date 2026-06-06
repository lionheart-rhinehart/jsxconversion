# Track B — the example-library sidecar

This folder is **Track B** of the creative-engine hardening effort: it turns example
creatives into the labeled cookbook the engine (Track A) reads. It **produces**
`templates/_example-index.json`; it never changes the contract that file must obey.

> **Analogy.** Track A is the chef; this folder writes the chef's recipe book. Each
> recipe is a rendered example labeled by its **kind** (the visual archetype — "giant
> stat," "before/after split"), the **media styles** it accepts, and the **copy shape**
> its text slots expose. The contract — [`scripts/lib/example-library.mjs`](../lib/example-library.mjs)
> + [`docs/example-index-contract.md`](../../docs/example-index-contract.md) — is the
> page format every recipe must follow so the chef can read it. **It is LOCKED. We
> consume it; we don't edit it.** If a kind or a media-style tag genuinely needs to
> change, that's a shared seam with Track A — flag it to Cody, don't change it here.

## The pipeline (4 stages, one entry point)

```
node scripts/example-sidecar/run.mjs
```

1. **`render-examples.mjs`** (Node) — render each manifest example's `<id>.jsx` to
   `templates/_examples/<id>.png` (the labeled artifact; a video example's poster
   frame), then run **render-QA**. Only QA-passed images go downstream — a blank /
   failed still must never reach the embedding matrix. Runs **sequentially** (one
   Chrome at a time) on purpose: parallel Chrome is the documented Windows leak path.
2. **`embed.py`** (Python) — embed each passed image with **CLIP** (semantic / theme /
   in-image text — the axis Meta's Andromeda shares) **and DINOv2** (spatial layout /
   structure). Compute the *measured spectrum*: intra-kind vs cross-kind cosine,
   silhouette over the authored kinds, a Vendi diversity score, nearest-neighbor, and a
   seeded k-means cross-check. **Everything is seeded (`random_state=42`)** so the
   numbers are stable run-to-run. A second blank-check (pixel variance) drops any
   near-uniform frame the size-floor QA couldn't see. Raw vectors →
   `embeddings.vectors.npz` (**gitignored, regenerable**); only small metrics →
   `embeddings.artifact.json`.
3. **`label.py`** (Python) — the **vision-LLM kind cross-check** (Gemini). Asks an
   independent model "what kind is this, by the pixels?" and compares to the authored
   kind; disagreement is flagged for review. **Fails soft:** with no `GEMINI_API_KEY`
   it's a no-op that defers to the authored, eyeball-confirmed kind, so the loop still
   produces a valid index.
4. **`build-index.mjs`** (Node) — fold all four artifacts into one contract-conformant
   index and **validate it with the locked module before writing**. Any contract
   violation → it prints the error and **refuses to write**. This is where a drift is
   caught — in Track B, not in a campaign.

## Files

| File | What it is | Committed? |
|---|---|---|
| `examples.manifest.json` | The human-declared half of each example (kind / format / mediaStyleAccepts / slotShape). **The input you edit to add examples.** | yes |
| `render-examples.mjs` · `embed.py` · `label.py` · `build-index.mjs` · `run.mjs` | The pipeline. | yes |
| `requirements.txt` | Python deps (all already in this repo's env except optional Gemini). | yes |
| `render-report.json` · `embeddings.artifact.json` · `labels.json` | Provenance of the last run (no raw vectors). | yes |
| `embeddings.vectors.npz` | Raw CLIP/DINOv2 vectors + cosine matrices. Big, regenerable. | **no (gitignored)** |
| `../../templates/_examples/<id>.jsx` + `assets/` | Example sources + real media. | yes |
| `../../templates/_examples/<id>.png` | Rendered labeled artifact (contract-required). | yes |
| `../../templates/_example-index.json` | **The deliverable** the engine reads. | yes |

## How to add examples (scale B1 → 150–240)

1. Author `templates/_examples/ex-<NNN>-<slug>.jsx` — a **plain static React component**
   (`export default`) that carries **real media** (an `<img>` from `templates/_examples/assets/`).
   Avoid the literal tokens `<Stage` / `<Sprite` / `useTime(` / `<Composition` / CSS
   `animation:` / `transition={` **even in comments** — the renderer's classifier is a
   naive regex and will mis-route the file to the video path. (Video examples are
   supported by the contract — author them as Claude-Design/Remotion — but the static
   slice is the proven path; a poster-frame extractor for video is the next increment,
   marked TODO in `render-examples.mjs`.)
2. Add a matching entry to `examples.manifest.json` (kind from the closed `KINDS`,
   `mediaStyleAccepts` ⊆ the kind's allowed set, a `slotShape` whose roles are real
   `ROLES`). `build-index.mjs` validates all of this — a wrong tag or role fails loud.
3. `node scripts/example-sidecar/run.mjs` → re-renders, re-embeds, re-labels, re-writes
   the index. `npm test` to confirm the contract still holds.

**Targets (the measured spectrum, from the plan's research):** 10–20 examples per kind,
each spanning **≥3 sub-looks** (different environments / lighting / sub-style), with
cross-kind cosine **< 0.70**, mean cross-kind **< 0.55**, silhouette **≥ 0.35**, Vendi
**≥ 8** for a 12-kind set, intra-kind pairwise **< 0.75**. If two kinds you *think* are
different land too close, that's the signal to **prune/merge** — the kinds list is a
first-pass hypothesis the embeddings validate, not gospel.

## What the proving slice measured (15 examples, 10 kinds, CLIP + DINOv2)

| Metric | This slice | Target | Read |
|---|---|---|---|
| max cross-kind cosine | **0.79** | < 0.70 | `before-after-split ~ proof-collage` — both are *panel-divided layouts of action photos*, so DINOv2 reads their structure as similar. A real merge-risk to watch as the library grows (the plan predicted the multi-panel kinds verge on collapse). |
| mean cross-kind cosine | **0.47** | < 0.55 | ✅ kinds are broadly separated on average. |
| max intra-kind cosine | **0.61** | < 0.75 | ✅ within a kind, the sub-looks are genuinely distinct — no "one look repeated." |
| mean silhouette | **0.24** | ≥ 0.35 | Low — expected with only 1–3 examples/kind and some structurally-adjacent kinds; rises with 10–20/kind and wider sub-look spread. |
| Vendi | **6.5** | ≥ 8 (full set) | Reasonable for a 10-kind / 15-example partial set; the ≥8 target is for the full 12-kind library. |
| k-means purity | **0.78** | (diagnostic) | Unsupervised clusters map ~78% to the authored kinds — decent agreement that the kinds are real visual groupings. |

The two slightly-over signals (panel kinds at 0.79; low silhouette) are **honest
findings, not bugs** — the slice's job was to prove the loop and produce a *measured*
spectrum, which it did. Hitting every threshold needs the full 150–240-example library
(B1 at scale). To run the automated Gemini kind cross-check, set `GEMINI_API_KEY` and
`pip install google-generativeai`, then re-run — labeling upgrades from
`authored-manifest+curator-eyeball` to `gemini:<model>` automatically.

> **Repo-size note:** the rendered PNGs (contract-required) + source photos are ~3–4 MB
> each. At 150–240 examples consider git-lfs for `templates/_examples/*.png` (and/or
> dropping the source `assets/*.jpg` from git, keeping only the rendered artifact).

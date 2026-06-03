# The "copy rewrite" bug was at plan time, not in the render code

- **Date:** 2026-06-02
- **Branch:** claude/hardcore-einstein-c11aaf
- **Commit:** bc119a8 (PR #17)

## The symptom
Hand-written hooks were coming out reworded into nonsense on the creatives. The
obvious assumption was "the fill/render code is mangling or truncating my copy."

## What was actually true
The render path was innocent. Reading the code proved it:
- `scripts/lib/fill-core.mjs` and `scripts/lib/assemble.mjs` place
  `asset.headline` / `asset.microscript` **verbatim**.
- `assemble.mjs` overflow handling **WARNS, never truncates**.
- `buildMotionData` in `run-campaign.mjs` is equally faithful.

The rewriting happened **upstream, at plan time**: the model authored
`asset.headline` as a *fresh* string from the **paraphrased**
`campaign-knowledge.json`, then that already-restated line was what got placed.
Your words went through: your doc → deep-read paraphrase → planner re-author →
(maybe a squeeze to fit). Four hands on the sentence.

## Why it matters / how to apply
- When copy comes out wrong, **trace the data backward from the pixel to the
  source doc** before suspecting the renderer. The bug is usually at the earliest
  transform that "restates" content, not the last one that draws it.
- The fix was therefore **data + instructions + a guard**, not a renderer patch:
  a verbatim `copy-library.json` (parsed from `ad-copy.md` + `microscripts.md`),
  the planner selecting copy **by reference** (`asset.copyRefs` / `asset.hookRef`)
  instead of authoring strings, and a `verbatimGuard` (`scripts/lib/copy-resolve.mjs`)
  that flags any on-creative text not traceable to the user's docs.
- **`campaign-knowledge.json` is strategy-only.** Anything that paraphrases is fine
  for the engine's *thinking* but must never land on a creative. Keep the
  "knowledge" (paraphrase OK) and the "copy" (verbatim, by reference) as separate
  artifacts.
- Process note: the integration test (resolving a real `hookRef` through the
  ladder) caught a parser bug — alt-hooks ending `— Archetype: Warning` with no
  `(V#)` code — that the byte-diff spot-check missed. **Exercise the real path,
  not just sampled units.**

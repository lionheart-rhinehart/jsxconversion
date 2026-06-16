# creative-engine/ — clean implementation home (v2)

This folder holds the **implementation code** for the `/creative-engine` editing pipeline
(intake, editor, manifest, render, dispatch). The **command/skill definition** lives separately at
`.claude/skills/creative-engine/`.

**Master plan:** `C:\Users\lionh\.claude\plans\so-i-see-that-memoized-parnas.md`

## Clean-room rule (non-negotiable)

- **Zero imports from `creative-engine-v1/`** (the archived, retired old system — locked zone
  `creative-v1`). Read it for *ideas* only.
- Old code may cross into here **only after it passes a clean test on a real file in this home** —
  "it already exists" is never a reason.

## Dependencies rule (non-negotiable)

Earned the hard way: the "image swapped to video goes black" bug returned **three times** because each
fix patched one code path and ignored the siblings that shared the same dependency.

- **Before changing code, map its dependents.** Media application has MULTIPLE paths that all require the
  host element to be a `<video>`: the single swap (`apply-overrides.js` `setSrc` → `replaceMediaEl`), the
  montage driver (`setMontage` + `editor.js` `startMontageDriver`), and the headless renderer. `apply-overrides.js`
  is **shared by the live editor preview and the renderer** — a change there hits both. Fix the dependency
  in the shared spot, or fix *every* path that has it. Never patch one and assume the rest are fine.
- **After changing code, verify the whole feature, not the line.** Run `npm test` **and** the live
  harnesses (`phase-c-live.mjs`, `phase-d-mediaflow-live.mjs`, `phase-d-montage-length.mjs`), and
  reproduce the user's **real** workflow (a Kraken-pulled clip, not a local stand-in — they behave differently).
- **Every fix ships with a regression test that fails without it,** wired into `scripts/githooks/pre-commit`.

## Phase status

Built phase-by-phase per the plan. Phase 0 (clean room + guardrails) in progress; subfolders for
intake / editor / manifest / render / dispatch land as their phases are built.

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

## Phase status

Built phase-by-phase per the plan. Phase 0 (clean room + guardrails) in progress; subfolders for
intake / editor / manifest / render / dispatch land as their phases are built.

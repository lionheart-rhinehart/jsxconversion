# Huashu Design — borrowed reference (NOT wired into the pipeline)

**Reference only.** These are plain-text documents copied from an external open-source project so we
can study and borrow *patterns*. They are **not** part of the creative engine, are not imported by any
script, and nothing here runs. Do not point pipeline code at this folder.

## Source & license
- **Repo:** https://github.com/alchaincyf/huashu-design (`alchaincyf/huashu-design`)
- **What it is:** an open-source, HTML-native *design* skill for Claude Code — the community clone of
  "Claude Design." Generates prototypes / slide decks / motion graphics from a prompt.
- **License:** MIT (free for commercial use; keep their attribution). Copied **2026-06-05**.
- **What we deliberately LEFT BEHIND:** the `scripts/` folder (executable), `package.json` (the
  `playwright` dependency), and the `.env` / ByteDance TTS keys. We took text, nothing that executes —
  so there is no supply-chain link and we are unaffected by any future changes upstream. This is a
  frozen snapshot, not a subscription.

## What's here
- `SKILL.md` — the workflow "brain": the Junior-Designer flow, 🛑 stop-and-ask checkpoints, the
  5-dimension expert review, and the anti-"AI-slop" guardrails. (Originally Chinese.)
- `references/` — the full companion library (23 docs) the brain points to. The ones most relevant to
  *our* ad-creative engine:
  - `design-styles.md` — the 20-style taste library (5 schools) + AI prompt templates **(taste/variety)**
  - `critique-guide.md` — the detailed expert-review rubric **(our "definition of done" scorecard)**
  - `content-guidelines.md` — copy/content rules **(voice + anti-slop)**
  - `animation-pitfalls.md` + `animation-best-practices.md` + `cinematic-patterns.md` — motion-quality
    rules **(if we lean into video)**
  - `workflow.md`, `design-context.md`, `verification.md`, `tweaks-system.md` — process + checkpoints
  - `multi-perspective-parallel-case-study.md` — the "N parallel directions" pattern **(variety/anti-cluster)**
  - Mostly-not-us (slides / TTS / iOS / Apple-film craft), kept for completeness, low priority:
    `slide-decks.md`, `editable-pptx.md`, `voiceover-pipeline.md`, `audio-design-rules.md`,
    `sfx-library.md`, `video-export.md`, `react-setup.md`, `scene-templates.md`, `animations.md`,
    `apple-gallery-showcase.md`, `hero-animation-case-study.md`, `launch-film-director-notes.md`.

## English translations
The originals are Chinese. We translated the six files we'll actually use into `*.en.md` companions
(trimmed to ad-creative relevance — slide-deck / PPTX / iOS / voiceover / SFX material cut):
`SKILL.en.md`, and under `references/`: `critique-guide.en.md`, `design-styles.en.md`,
`content-guidelines.en.md`, `animation-pitfalls.en.md`, `animation-best-practices.en.md`. **All Chinese
originals (and the ~18 untranslated docs) are archived, frozen and untouched, in `_originals-zh/`** —
kept as the source of truth to diff against if a translation ever looks wrong.

## Why we kept it — patterns worth lifting into OUR engine (rework, don't copy verbatim)
1. **"3 directions from 3 different families" advisor** — a built-in mechanism that *forces visual
   difference*. Directly relevant to our Meta-clustering / variety gate.
2. **5-dimension review scorecard** (score + Keep / Fix / Quick-Wins) — a ready shape for our missing
   "definition of done" acceptance gate (swap in our dimensions: brand-fit, real-media, copy-verbatim,
   variety, eyebrow-consistency).
3. **Anti-AI-slop guardrails** — e.g. "never a CSS silhouette instead of a real product image" maps to
   our "every creative carries real media" rule; also their no-emoji stance.
4. **Stop-and-ask checkpoints** — "use the logo if it exists; if not, stop and ask" — the
   un-bypassable-gate behavior we want (the engine pausing instead of quietly doing the wrong thing).

Not relevant to us (skip): slide-deck / PPTX / iOS-prototype / infographic machinery, and the TTS
voiceover pipeline.

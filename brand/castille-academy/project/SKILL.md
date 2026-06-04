---
name: castille-academy-design
description: Use this skill to generate well-branded interfaces and assets for Castille Academy — an elite youth athletic-development academy — for production or throwaway prototypes/mocks. Contains essential design guidelines, colors (black/white/red), type (Libre Caslon · Saira Condensed · Hanken Grotesk), fonts, photography, and UI-kit components for prototyping.
user-invocable: true
---

# Castille Academy — Design Skill

Read `README.md` first — it carries the full brand context, content fundamentals, visual foundations and iconography. Then explore the other files.

## The 30-second brief
- **Brand:** Castille Academy — "the prep school of athletic performance." Composed, exacting, premium. *Disciplina · Vis · Victoria.*
- **Palette (strict):** Black `#000000` · White `#ffffff` · Red `#a81918`. Red is the *only* accent. On dark grounds brighten to `#c01f1c`. Everything else is neutral graphite.
- **Type:** Libre Caslon Display (Title-Case headlines + wordmark) · Saira Condensed (UPPERCASE eyebrows/labels/stats) · Hanken Grotesk (body/UI). All in `colors_and_type.css`.
- **Photography:** black & white (`grayscale(1)`), so the red pops; black bottom protection gradient.
- **Signature object:** the **Castille Index** (0–100) — a red ring + Velocity/Force/Craft breakdown. Reuse it.
- **Icons:** Lucide, stroke 1.75. **No emoji.** No second accent color. No all-caps Caslon.

## How to use it
- **Visual artifacts** (slides, mocks, throwaway prototypes): link `colors_and_type.css`, copy assets you need out of `assets/`, and output static HTML. Start from a `preview/` card or a `ui_kits/` component for correct styling.
- **Production code:** read the tokens + rules here and become an expert in the brand; copy assets as needed.
- If invoked with no other guidance, ask what they want to build, ask a few sharp questions, then act as an expert designer who outputs HTML artifacts *or* production code.

## What's here
- `colors_and_type.css` — all color + type tokens and semantic classes (`.ca-display`, `.ca-eyebrow`, `.ca-data`, `.ca-photo`, …).
- `preview/` — design-system cards across Colors, Type, Spacing, Components, Brand and Slides (rendered in the Design System tab).
- `ui_kits/marketing-site/` — homepage recreation (hero, pillars, Index, programs, campuses, booking modal). Reusable JSX primitives in `primitives.jsx`.
- `ui_kits/dashboard/` — parent/athlete Index portal.
- `ui_kits/mobile-app/` — athlete app (dark) with a working exercise-clip library.
- `slides/` — deck template (`index.html`) + one HTML file per slide type.
- `assets/` — black-&-white-ready photography + `assets/clips/` video library.

## House rules (don't break these)
- Headlines: **Title Case Caslon**, one red accent word max. Never all-caps Caslon.
- Eyebrows/labels/buttons: **UPPERCASE Saira Condensed**, letterspaced.
- Red is surgical — CTAs, accents, the Index. Never a red body background.
- No emoji, no exclamation points, no "journey/passion/family" filler. Anchor claims to a measurement.
- Photography is black & white. Replace the legacy-watermarked stock with clean Castille imagery for production.

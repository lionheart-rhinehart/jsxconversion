---
name: batti-performance-design
description: Use this skill to generate well-branded interfaces and assets for Batti-Performance (youth sports-performance training — "Where Athletes Come To Dominate"), either for production or throwaway prototypes/mocks/decks. Contains essential design guidelines, colors, type, fonts, assets, and UI-kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## What's here
- `README.md` — brand context, content fundamentals (voice, casing, the guarantee), visual foundations, iconography.
- `colors_and_type.css` — the locked 5-color palette + type tokens and semantic rules. Import it and use the `--bp-*` / `--bg` / `--fg` variables.
- `preview/` — one small HTML card per design-system concept (colors, type, spacing, components).
- `ui_kits/marketing-site/` — interactive recreation of battiperformancetraining.com with reusable JSX components. Start here to assemble new pages.

## The non-negotiables
- **Palette:** `#000000`, `#ffffff`, `#e6e6e6`, `#6b6b6b`, `#cb0202` only. Red is surgical (CTAs, accent words, step numerals). High-contrast black/white bands are the core rhythm.
- **Voice:** blunt head-coach-to-parent; metric-driven; never hype. Pair every physical claim with a character claim. The guarantee ("+3″ vertical, +1 mph in 30 sessions — or we train them free") is set verbatim.
- **Type:** condensed ALL-CAPS display (Saira Condensed sub), clean sans body (Saira sub), tabular mono for metrics. Stacked caps headlines.
- **No emoji, no decorative gradients, no soft/rounded "friendly-app" styling.** Squared corners, hard contrast, photographic.

## Known gaps (ask the user)
- Confirm **fonts** (currently best-match substitutes: Saira Condensed / Saira / Spline Sans Mono).
- **Logo:** integrated — circular BP badge in `assets/` (`logo-badge.png` chrome, `logo-badge-white.png` flat, `logo-monogram.png` mark). For a monogram on light backgrounds, a transparent-bg export would help.
- Production icons use **Material Symbols Rounded**; the kit ships inline-SVG equivalents because the icon-font CDN is sandbox-blocked.

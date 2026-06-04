---
name: jarosh-performance-design
description: Use this skill to generate well-branded interfaces and assets for Jarosh Performance (youth/HS/collegiate sports-performance training, Ankeny IA), either for production or throwaway prototypes/mocks/decks/social/marketing artifacts. Contains essential design guidelines, colors, type, fonts, the icon vocabulary, a placeholder logo, and four UI kits (marketing site, social ads, parent dashboard, slide deck) built on a premium, data-forward "performance-lab" aesthetic.
user-invocable: true
---

Read `README.md` first. It covers brand context, content fundamentals (voice: measured, parent-facing, no hype), the visual foundations (signal red `#fa3f36` + cool carbon neutrals + steel, calibration-grid motif, mono metrics), and the iconography system. Then explore:

- `colors_and_type.css` — every brand token (`--jp-red`, `--fg-1`, `--grid-dark`, etc.) plus semantic rules for `h1`–`p`, `.jp-display`, `.jp-eyebrow`, `.jp-tag`, `.jp-data`. **Import this first in any new artifact.**
- `fonts/` — Anton (display), Geist (body, variable), JetBrains Mono (data, variable). Served locally.
- `assets/logo-mark.svg` — **placeholder** brand mark (speed chevrons + calibration ruler). Replace with the official logo when available. The full lockup pairs it with an Anton "JAROSH / PERFORMANCE" wordmark in CSS — see any kit's nav.
- `preview/` — individual token + component cards (type, colors, spacing, components, brand). Good visual reference for any single element (button, metric tile, pillar card, etc.).
- `ui_kits/marketing-site/` — homepage + booking flow. `components.jsx` (`NavBar`, `Footer`, `Button`, `Icon`, `Tag`, `LogoLockup`); `sections.jsx` (`Hero`, `Pillars`, `Method`, `Results`, `Supercharged`, `Guarantee`, `Booking`, `FinalCTA`); `hero-directions.html` (3 hero options).
- `ui_kits/social-ads/` — Instagram square/portrait/story templates on a design canvas.
- `ui_kits/parent-dashboard/` — parent-facing athlete progress report (metric tiles, trend chart, history, attendance, coach note).
- `slides/` — 7-slide deck template on `deck-stage.js`.

If creating visual artifacts (slides, mocks, prototypes, social posts, marketing pages):
1. Copy needed assets (logo, fonts) into the artifact's own folder, or reference `colors_and_type.css`.
2. Import `colors_and_type.css` and use the tokens / semantic classes.
3. Load Material Symbols Rounded for icons (link in `README.md` → ICONOGRAPHY).
4. For React mocks, reuse the patterns from `ui_kits/marketing-site/`. Same vocabulary, same tropes: bracket-tag eyebrows `[ … ]`, split-color display headlines, the four pillars (Speed · Agility · Strength · Power), mono metrics with muted units, the calibration grid on dark panels, gain-green only on improvement.
5. Match the voice from CONTENT FUNDAMENTALS: measured, parent-facing, metric-first, calm authority. No emoji or exclamation hype in UI. "Not just a speed program."
6. Replace every photo placeholder slot with real Jarosh photography when available — never stock.

If working on production code, copy assets out, read `README.md` to internalize the rules, and treat this folder as the brand source of truth.

If the user invokes this skill without other guidance, ask what they want to build (a deck? a landing page? an Instagram ad? a parent report?), ask a few clarifying questions (audience, fidelity, length), and act as an expert designer who outputs HTML artifacts — or production code, depending on the need.

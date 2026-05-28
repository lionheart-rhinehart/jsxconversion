---
name: athletes-acceleration-design
description: Use this skill to generate well-branded interfaces and assets for Athletes Acceleration (youth sports performance training, ages 8–18), either for production or throwaway prototypes/mocks/decks/marketing artifacts. Contains essential design guidelines, colors, type, fonts, action photography, the icon vocabulary, and a high-fidelity marketing-site UI kit ready for prototyping.
user-invocable: true
---

Read `README.md` first. It covers brand context, content fundamentals, visual foundations, and the iconography system. Then explore:

- `colors_and_type.css`. Every brand token (`--aa-red`, `--fg-1`, etc.) plus semantic rules for `h1`–`p`, `.aa-display`, `.aa-eyebrow`, `.aa-data`, `.aa-code-comment`. Always import this file at the top of any new artifact.
- `assets/`. Primary logo (`logo.png`), animated logo sting (`logo-animated.mp4`), 20+ pieces of action photography, and 2 short action video clips. Use these instead of generating new imagery.
- `ui_kits/marketing-site/`. Pixel-faithful recreation of [athletesaccel.com](https://athletesaccel.com). `components.jsx` has `NavBar`, `Footer`, `Button`, `Icon`, `Eyebrow`. `sections.jsx` has `Hero`, `Pillars`, `Programs`, `Method`, `Testimonials`, `Guarantee`, `LocationFinder`, `FinalCTA`. Lift these components into new pages rather than rebuilding from scratch.
- `preview/`. Individual component / token cards. Useful as visual reference for any single element (button, stat block, pillar card, etc.).

If creating visual artifacts (slides, mocks, throwaway prototypes, marketing pages):
1. Copy needed assets out of `assets/` into the artifact's own folder.
2. Import `colors_and_type.css` and use the tokens / semantic classes.
3. Load Material Symbols Rounded for icons (link in `README.md` → ICONOGRAPHY).
4. For React mocks, reuse the patterns from `ui_kits/marketing-site/`. Same component vocabulary, same content tropes (code-comment eyebrows, split-color display headlines, numbered protocols, mono data callouts).
5. Match the voice from the CONTENT FUNDAMENTALS section: blunt, parent-facing, metric-driven. No emoji. No exclamation points.

If working on production code, copy assets out, read `README.md` to internalize the rules, and treat this folder as the brand source of truth.

If the user invokes this skill without other guidance, ask them what they want to build or design (a deck? a landing page? a mock? an Instagram ad?), ask a few clarifying questions (audience, fidelity, length), and act as an expert designer who outputs HTML artifacts. Or production code, depending on the need.

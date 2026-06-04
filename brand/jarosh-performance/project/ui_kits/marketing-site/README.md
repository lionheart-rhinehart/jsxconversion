# Marketing Site — UI Kit

A high-fidelity recreation of the Jarosh Performance public marketing site, built on the **premium / data-forward / performance-lab** direction. This is a **recreation for prototyping**, not production code — components are cosmetic and modular.

> ⚠️ Copy, programs, metrics, and testimonials are **plausible reconstructions** in the brand voice (sourced/paraphrased from public Jarosh/NJF material). Photography is **placeholder slots** — drop Jarosh's own images in. The logo is a placeholder mark. Swap all of these as real assets arrive.

## Files

| File | What's in it |
|---|---|
| `index.html` | Interactive site — full homepage + 2-step booking modal. Open this. |
| `hero-directions.html` | Design canvas with **3 hero treatments** (A data / B photo / C split). Pick one. |
| `kit.css` | All kit styles, built on `../../colors_and_type.css` tokens. |
| `components.jsx` | `Icon`, `Eyebrow`, `Tag`, `Button`, `LogoLockup`, `NavBar`, `Footer`. |
| `sections.jsx` | `Hero`, `Pillars` (the four), `Method`, `Results`, `Supercharged`, `Guarantee`, `Booking`, `FinalCTA`. |

## Sections (index.html)

1. **Hero** — dark calibration-grid panel, split headline, live "instrument" readout, metric strip.
2. **Pillars** — the four systems: Speed · Agility · Strength · Power, as dark instrument cards with outlined numerals + a metric line each.
3. **Method** — Test → Build → Retest, the measurement loop.
4. **Results** — metric tiles + a scrollable testimonial track with gain tags.
5. **Supercharged** — the flagship acceleration program feature, with a photo slot + measured bullets.
6. **Guarantee** — the measured-outcome stat block.
7. **Booking** — location card + an inline assessment request form (also opens the modal).
8. **Final CTA** — full-bleed photo slot + urgency headline.

## How to reuse

1. Load order in HTML: `kit.css` → React/Babel → `components.jsx` → `sections.jsx` → your app script.
2. Components export to `window` (cross-`<script>` sharing). Add new sections the same way.
3. Use the brand tokens and the tropes: bracket-tag eyebrows (`<Tag>`), split-color display headlines, the four pillars, mono metrics with muted units, the calibration grid on dark panels, gain-green only on improvement.
4. Replace every `.photo-slot` with a real `<img>` (cover) when photography lands.

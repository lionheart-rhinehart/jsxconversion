<!-- @dsCard group="Brand" -->
# Marketing-site UI kit — Batti-Performance

A faithful, interactive recreation of **battiperformancetraining.com** ("Where Athletes Come To Dominate"), built from the live site's real copy, structure, and the locked brand palette. Open `index.html` for the full click-through page.

## Run it
Open `index.html`. It's a single React page (React 18 + in-browser Babel, pinned). Tokens come from `../../colors_and_type.css`; kit-specific layout lives in `kit.css`.

## What's interactive
- **Sticky header** that goes opaque + blurs on scroll; **mobile drawer** under 1024px (hamburger).
- **Apply / "Claim your athlete analysis" funnel** — a 3-step modal (athlete → goal → contact) with a progress indicator and a success state. Wired to every primary CTA on the page.
- **FAQ accordion** with red active state.
- Hover/press states on all buttons and cards per the brand spec.

## Components (well-factored, reusable)
| File | Exports | Notes |
|---|---|---|
| `components.jsx` | `Icon`, `Btn`, `Eyebrow`, `Photo` | Primitives. `Icon` is an **inline-SVG set** keyed by Material Symbols names (see Iconography note). `Photo` is the training-photo placeholder. |
| `Header.jsx` | `Header`, `Logo` | Sticky nav + mobile drawer. |
| `Hero.jsx` | `Hero` | Full-bleed black hero, stacked ALL-CAPS headline, guarantee line, CTA. |
| `Sections.jsx` | `CharacterSection`, `PromisesSection`, `GuaranteeSection`, `StepsSection` | Character statements, program cards, guarantee strip, 3-step system. |
| `SectionsB.jsx` | `ApproachSection`, `AthleteWall`, `WhySection`, `FaqLocations` | Proof + testimonial, athlete photo wall, long-copy "why", FAQ + locations. |
| `Footer.jsx` | `Footer` | Dark footer, links, locations, contact. |
| `ApplyModal.jsx` | `ApplyModal` | The athlete-analysis funnel. |

Each component file exports to `window` (separate Babel scopes don't share scope). Compose them by editing the `App` in `index.html`.

## Notes / caveats
- **Photography is placeholder.** Every `<Photo>` is a branded striped placeholder with an icon + label, sized and positioned exactly where real training photos belong (hero, program cards, 3-step images, athlete wall). Drop in real shots to finish it.
- **Icons are inline SVG.** Google's icon-font CDN (Material Symbols / Material Icons) is unreachable in this sandbox, so the kit ships a small inline-SVG set in clean Material-compatible stroke style, keyed by Material Symbols names. In production with network access you can swap back to the Material Symbols font documented in the root `README.md`.
- **Fonts are substitutes** (Saira Condensed / Saira / Spline Sans Mono) pending the brand's real typefaces.
- **Logo integrated.** The header uses the real **BP monogram** (`assets/logo-monogram.png`) + an HTML lockup (**BATTI** red / **−PERFORMANCE** white) so it scales crisply. The full circular badge lives in `assets/logo-badge.png` (chrome) and `assets/logo-badge-white.png` (flat).
- This is a cosmetic recreation for prototyping, not production code; the funnel doesn't submit anywhere.

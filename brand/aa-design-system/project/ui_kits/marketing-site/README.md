# Athletes Acceleration. Marketing Site UI Kit

A high-fidelity recreation of the public marketing site at [athletesaccel.com](https://athletesaccel.com). Componentized as React JSX modules. Open `index.html` for an interactive view of the full homepage flow.

## Files

| File | Purpose |
|---|---|
| `index.html` | Compose all sections into a live homepage. Includes scroll, hover, and primary-CTA interactions. |
| `kit.css` | Site-specific layout CSS that imports `../../colors_and_type.css`. |
| `components.jsx` | Shared atoms. `Button`, `Eyebrow`, `Icon`, `NavBar`, `Footer`. |
| `sections.jsx` | `Hero`, `PillarsSection`, `ProgramsSection`, `MethodSection`, `GuaranteeSection`, `TestimonialsSection`, `LocationFinderSection`, `FinalCTASection`. |

## What we modeled

- Sticky blurred top nav with location pin + primary CTA
- Promo banner ("Become a Founding Athlete. Westfield, IN")
- Hero: full-bleed photo + bottom-up protection gradient + split-color display headline
- Three-pillar dark section (Accelerate / Dominate / Unleash) with numbered protocol cards
- Programs ladder (Multi-Sport Foundation / Competitive Edge / College Prep)
- Method section (Assess. Build. Dominate.). Three numbered protocol steps
- Real Results. Testimonial carousel with prev/next controls
- Guarantee stat block (+1 mph · +3″ · 90 days)
- ZIP-code location finder
- Final CTA over photo
- Five-column footer

## What we skipped

- The full `/programs/*`, `/training/*`, `/locations/*` sub-pages are out of scope for the kit. The component vocabulary established here covers what those pages would need.
- The booking flow modal is represented as a CTA only.

## Sources

- [athletesaccel.com](https://athletesaccel.com). Content + visual reference.
- Asset photography in `../../assets/`.

# SMAA Website — UI Kit

A high-fidelity, interactive recreation of the **Southern Maine Athlete Academy** marketing funnel (the brand's single core product surface). Built from the live site at https://southernmaineathleteacademy.com/.

Open **`index.html`** for the full click-through experience: scroll the funnel, hover the CTAs and benefit cards, and click any **Get Started** button to open the **Free 1:1 Evaluation** lead-capture modal (fill it in → success state).

## Files
| File | Contents |
|---|---|
| `index.html` | Mounts the full page + wires the Get Started modal state. Loads React + Babel + Lucide from CDN. |
| `ui.jsx` | Shared primitives: `Icon` (Lucide wrapper), `Container`, `Section`, `Eyebrow`, `CTAButton`, `Reveal`. |
| `Header.jsx` | Sticky dark nav — logo, links, blue CTA, responsive burger menu. |
| `Sections1.jsx` | `Hero`, `Benefits` ("Do You Want Your Child To…"), `Steps` (3-step program). |
| `Sections2.jsx` | `Difference`, `Founder`, `Guarantee`, `Reviews`, `FreeTools`, `Footer`. |
| `Modal.jsx` | `GetStartedModal` — lead-capture form with validation + success confirmation. |

## How to compose
Each section is a standalone component exported to `window`. Build a new page by importing the same scripts and arranging the components you need inside an `App`. All components take an `onGetStarted` callback to open the lead modal. Colors/type come from `../../colors_and_type.css`.

## Notes / fidelity
- **Copy** is lifted from the real funnel (hero promise, benefit list, 3 steps, the SMAA Difference, the 30-day guarantee, free tools, locations).
- **Reviews** use representative placeholder testimonials — the live site embeds a third-party review widget we can't reproduce. Swap in real quotes when available.
- **Icons:** Lucide (CDN) as a substitute — the source site ships no icon set. See root `README.md` → Iconography.
- **Fonts:** Oswald + Montserrat substitutes — see root `README.md` → Visual Foundations.
- **Entrance animations** are pure-transform slides (no opacity fade) so content is never hidden if animations are paused (print/offscreen/reduced-motion).

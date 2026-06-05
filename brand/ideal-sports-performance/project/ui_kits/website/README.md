# ISP Website — UI Kit

A high-fidelity recreation of the **Ideal Sports Performance** marketing site (the brand's one live product). It's a cosmetic, click-through prototype — not production code — built to be modular and reusable.

## Run
Open `index.html`. It links the root `../../colors_and_type.css` (fonts + tokens) and loads Lucide from CDN. React + Babel are loaded inline (pinned).

## Components
| File | Exports | Notes |
|---|---|---|
| `ui.jsx` | `Button`, `Eyebrow`, `Icon` | Primitives. `Button` variants: `primary` / `secondary` / `ghost` / `light`; sizes `sm`/`md`/`lg`; hover-darken + lift, press-scale. `Icon` wraps Lucide. |
| `Header.jsx` | `Header`, `ISP_NAV` | Sticky nav, logo left, pill CTA right, translucent-on-scroll, mobile burger menu. |
| `Hero.jsx` | `Hero` | Full-bleed training photo + diagonal blue/ink scrim, big two-line headline with the velocity hook. |
| `StatBand.jsx` | `StatBand` | Ink band of big tabular metrics. |
| `Programs.jsx` | `Programs`, `ISP_PROGRAMS` | The three program cards (Baseball / Sports / Adult), photo or blue-gradient header, kicker overlay, hover lift. |
| `SignupForm.jsx` | `SignupForm` | "First class free" split card; interactive — submit shows a confirmation state. |
| `Footer.jsx` | `Footer` | Ink footer with on-dark logo, program links, address, socials. |

## Interactions
- Sticky header turns translucent + blurs after scroll; nav + CTA smooth-scroll to sections.
- Mobile (<820px): desktop nav collapses to a burger menu; signup + footer grids stack.
- Program cards lift on hover.
- Signup form validates required fields and swaps to a success state on submit.

## Fidelity notes
The live site is a generic HighLevel/LeadConnector template; this kit keeps the **real brand content** (programs, copy, contact, photography, logo, palette) but expresses it through the ISP design system rather than copying the template's stock chrome. No screens were invented beyond the existing single-page site.

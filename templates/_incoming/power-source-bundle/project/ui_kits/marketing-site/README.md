# UI Kit — Power Source Marketing Site

A brand-faithful recreation of the Power Source marketing homepage, built from the live site's content (https://powersourceleominster.com/) and the supplied brand assets. It composes the design-system foundations (tokens, type, color) and mirrors the authored core components.

## Run it
Open `index.html`. Fully interactive:
- Sticky header that gains a border/solid background on scroll.
- "Start Training" / "Claim 2 Free Sessions" open a **lead-capture modal** with a working form → success state.
- "Explore Programs" smooth-scrolls to the programs grid.
- Hero photo is an `<image-slot>` — drop a real training-floor photo onto it.

## Sections
1. **Header** — logo, nav, phone, primary CTA.
2. **Hero** — arena backdrop, condensed display headline, dual CTA, trust stats, photo slot + champion-mindset chip.
3. **Programs** — the four real offerings (Youth PT, Speed School, Adult PT, Adult Team Training) as `ProgramCard`s.
4. **Proof** — "Measured. Tracked. Proven." stat band using `StatTile`.
5. **Testimonials** — real parent reviews (Julie E, Jen L, Tina D).
6. **Get Started** — the site's three steps on a light section.
7. **Footer** — contact, programs, socials.

## Files
- `index.html` — page shell, layout CSS, app state (scroll + modal).
- `ui.jsx` — self-contained kit primitives (Button, Badge, SectionHeading, Card, ProgramCard, StatTile, Avatar, Testimonial, Input, Icon) exposed on `window`, using the same token-driven CSS classes as `/components/core`.
- `sections.jsx` — page sections.
- `image-slot.js` — user-fillable hero photo placeholder.

## Notes
- Stat figures (−0.34s, +4.2in, +38%, 92%) are realistic **placeholders** — swap for real measured numbers.
- Imagery: the hero uses a drop slot; no stock photos are bundled. The brand's photo vibe is warm, contrasty, athletic (gym light, motion, sweat).
- Icons: Lucide (CDN). Social links use mono `IG/FB/YT` labels because Lucide no longer ships those brand glyphs.
- This kit re-declares lightweight primitives so it renders anywhere (including this preview). In production, import the real components from the compiled bundle instead.

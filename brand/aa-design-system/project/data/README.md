# Data

Structured reference data for use across the design system.

## `testimonials.csv` / `testimonials.json`

**68 real, dated parent + athlete reviews** sourced from the Genesis Sports Performance / Athletes Acceleration facility, spanning Nov 2020 – Jan 2025.

Many reviews predate the Athletes Acceleration franchise rollout and mention "Genesis" by name or "Graham" (the founder). When using them in AA marketing materials, prefer the more recent (2024–2025) entries and edit Genesis-specific names out as needed. Older entries are still useful for sentiment patterns and copy inspiration.

### Schema (JSON)

```json
{
  "date":   "2025-01-31 17:24:54",  // ISO-ish, descending order in the file
  "name":   "Lyndsy Harrington",
  "review": "Our son has been attending workouts for about 5 months..."
}
```

### Use cases

- **Marketing pages:** pick 4–6 with clear, brand-aligned outcomes (speed, strength, confidence) for testimonial carousels.
- **Decks & ads:** the strongest one-line pull-quotes (Danny O'Neil, Brandon Merrill, Andrew O.) work well as full-bleed slides.
- **Sales collateral:** the data is dated, so it's safe to cite ranges ("verified reviews 2020–2025").

### Load it

```js
const testimonials = await fetch('data/testimonials.json').then(r => r.json());
```

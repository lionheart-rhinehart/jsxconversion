# Parent Dashboard — UI Kit

A parent-facing **athlete progress report** — the data-forward heart of the brand rendered as a product. Open `index.html`.

> ⚠️ All athlete data is fictional sample data. Photo avatar is a placeholder slot. Logo is a placeholder mark.

## What it shows

- **Top bar** — logo lockup + "Athlete Report" + a working **athlete switcher** (two sample athletes; the whole dashboard re-renders on switch).
- **Athlete header** — name, sport, age, program, a 90-day badge and a percentile gain pill.
- **Metric tiles** (4) — 10-yd split, vertical, top speed, force output. Each shows current value + a gain/loss delta (gain-green for improvement, including the *lower-is-better* logic on the 10-yd split). **Click a tile** to drive the trend chart.
- **Trend chart** — dark panel, a 6-test line chart that swaps to the selected metric, baseline + latest markers, dated axis.
- **Test history** — mono tabular table of 10/20/40 + vertical across every test, baseline and latest flagged.
- **Side column** — next assessment + confirm button, **pillar percentile bars** (Speed/Agility/Strength/Power), an **attendance ring**, and a **coach note** from Nick.

## System rules used

- The **metric tile** and **calibration grid** from the design system, scaled into an app surface.
- Mono tabular numerals everywhere; muted units; **gain-green only on improvement**.
- Dark data panel for the chart; light panels for the rest.
- Charts are simple inline SVG (data viz) — no chart library.

## Reuse

- `dash.css` holds all styles on the brand tokens. The `LineChart` and ring are tiny inline SVG components — copy them into other data views.
- Swap the sample `ATHLETES` object for real data; the UI is fully driven by it.
- Replace the avatar `.ath-photo` slot with a real athlete `<img>`.

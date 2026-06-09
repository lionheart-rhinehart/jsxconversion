**StatTile** — the performance readout that powers "Measured. Tracked. Proven." Big condensed numeral, optional bolt-yellow unit, mono eyebrow, caption, and a trend chip.

```jsx
<StatTile eyebrow="40-yd dash" value="−0.34" unit="s"
          caption="avg improvement / 12 wks"
          trend={{ dir: "up", label: "faster" }} />
<StatTile accent="bolt" eyebrow="Since" value="1998" caption="Leominster, MA" />
```

- `accent`: "electric" (default) · "bolt"
- Use in 2–4 column grids on dark surfaces.

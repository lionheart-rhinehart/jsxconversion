**Card** — surface container (`raised` dark / `steel` navy / `light`), optional top `accent` bar and `interactive` hover-lift. **ProgramCard** composes Card into the marketing program tile (icon + condensed title + description + CTA).

```jsx
<Card variant="steel" accent="bolt">…</Card>

<ProgramCard
  icon={<i data-lucide="zap" />}
  meta="Ages 8–18"
  title="Speed School"
  description="Sprint mechanics, agility and explosiveness."
  cta="Explore Speed School"
  accent="bolt"
/>
```

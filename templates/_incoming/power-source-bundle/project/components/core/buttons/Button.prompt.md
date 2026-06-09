**Button** — the athletic, uppercase call-to-action. Use for any primary/secondary action; `primary` (electric blue) is the default, `bolt` (yellow) is the high-emphasis "spark" CTA used sparingly, `secondary` (steel navy) and `ghost` (outline) are lower emphasis.

```jsx
<Button variant="bolt" size="lg" iconRight={<i data-lucide="arrow-right" />}>
  Claim 2 Free Sessions
</Button>
<Button>Start Your Training</Button>
<Button variant="ghost">Book a Tour</Button>
```

- Variants: `primary` · `bolt` · `secondary` · `ghost`
- Sizes: `sm` · `md` (default) · `lg`
- Props: `fullWidth`, `disabled`, `iconLeft`, `iconRight`, `as="a"` (with `href`)
- Hover lifts with an electric/bolt glow; press darkens + insets. Yellow always carries dark text.

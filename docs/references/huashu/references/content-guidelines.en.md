# Content Guidelines (English, trimmed to ad-creative relevance)

> English translation of `content-guidelines.md` from the Huashu Design repo (MIT). Slide/app-specific material trimmed. See the original for the full Chinese.

---

# Content Guidelines: Anti-AI-slop, content rules, scale standards

The traps you're most likely to fall into when designing with AI. This is a "what NOT to do" checklist — and it matters more than the "what to do" list, because AI slop is the default: if you don't actively avoid it, it happens on its own.

## The Complete AI Slop Blacklist

### Visual traps

**❌ Aggressive gradient backgrounds**
- Purple → pink → blue full-screen gradients (the classic smell of an AI-generated webpage)
- Rainbow gradients in any direction
- Mesh gradients tiled across the whole background
- ✅ If you must use a gradient: keep it subtle, single-hue, and applied with intent as an accent (e.g. a button hover)

**❌ Rounded cards + a left-border accent color**
```css
/* This is the signature look of an AI-flavored card */
.card {
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  padding: 16px;
}
```
These cards flood every AI-generated dashboard. Want emphasis? Use a more deliberate, design-forward method: background-color contrast, weight/size contrast, a plain divider line — or just don't break it into cards at all.

**❌ Emoji decoration**
Unless the brand itself uses emoji (e.g. Notion, Slack), don't put emoji in the UI. **Especially avoid**:
- 🚀 ⚡️ ✨ 🎯 💡 in front of headings
- ✅ on feature lists
- → inside CTA buttons (a standalone arrow is fine; an emoji arrow is not)

If you have no icon, use a real icon library (Lucide / Heroicons / Phosphor), or a placeholder.

**❌ Drawing imagery with SVG**
Don't try to draw people, scenes, devices, objects, or abstract art with SVG. AI-drawn SVG imagery reads as AI at a glance — childish and cheap. **A gray rectangle plus the label "illustration slot 1200×800" beats a clumsy SVG hero illustration by 100×.**

The only valid uses of SVG:
- Real icons (16×16 to 32×32 range)
- Geometric shapes as decorative elements
- Data-viz charts

**❌ Too much iconography**
Not every heading / feature / section needs an icon. Overusing icons makes the interface look like a toy. Less is more.

**❌ "Data slop"**
Fabricated stats used as decoration:
- "10,000+ happy customers" (you don't even know if it's true)
- "99.9% uptime" (don't write it without real data)
- Decorative "metric cards" made of icon + number + phrase
- Mock tables dressed up with fake data

If you don't have real data, leave a placeholder or ask the user for it.

**❌ "Quote slop"**
Fabricated testimonials and celebrity quotes used to decorate a page. Leave a placeholder and ask the user for a real quote.

### Typeface traps

**❌ Avoid these played-out typefaces:**
- Inter (the AI-generated-webpage default)
- Roboto
- Arial / Helvetica
- A pure system-font stack
- Fraunces (AI discovered it and ran it into the ground)
- Space Grotesk (AI's recent favorite)

**✅ Use a display + body pairing with character.** Directions to draw from:
- Serif display + sans body (editorial feel)
- Mono display + sans body (technical feel)
- Heavy display + light body (contrast)
- A variable font for animated weight on the hero

Type resources:
- The lesser-known good picks on Google Fonts (Instrument Serif, Cormorant, Bricolage Grotesque, JetBrains Mono)
- Open-source font sites (Fraunces' sibling fonts, Adobe Fonts)
- Don't invent font names out of thin air

### Color traps

**❌ Inventing colors from scratch**
Don't design a whole unfamiliar palette from nothing. It usually ends up disharmonious.

**✅ Strategy:**
1. Have a brand color → use it, and fill missing color tokens by interpolating in oklch
2. No brand color but have a reference → eyedropper colors from a reference product's screenshots
3. Truly from zero → pick a known color system (Radix Colors / Tailwind's default palette / Anthropic brand); don't mix your own

**Defining color in oklch** is the most modern approach:
```css
:root {
  --primary: oklch(0.65 0.18 25);       /* warm terracotta */
  --primary-light: oklch(0.85 0.08 25); /* lighter, same hue */
  --primary-dark: oklch(0.45 0.20 25);  /* darker, same hue */
}
```
oklch keeps the hue from drifting when you adjust lightness — more reliable than hsl.

**❌ Slapping inverted colors on for dark mode**
A good dark mode isn't a simple color invert. It needs re-tuned saturation, contrast, and accent colors. If you don't want to do dark mode properly, don't do it.

### Layout traps

**❌ Bento-grid overload**
Every AI-generated landing page wants to do a bento grid. Unless your information structure genuinely suits bento, use another layout.

**❌ Big hero + 3-column features + testimonials + CTA**
This landing-page template is worn out. If you want to innovate, actually innovate.

**❌ Every card in a card grid looking identical**
Asymmetry, cards of varying size, some with an image and some text-only, some spanning columns — *that's* what a real designer's work looks like.

## Content Rules

### 1. Don't add filler content

Every element must earn its place. Whitespace is a *composition* problem — solve it with **composition** (contrast, rhythm, breathing room), **not** by stuffing in content.

**Questions to spot filler:**
- If you removed this content, would the design get worse? If the answer is "no," remove it.
- What real problem does this element solve? If the answer is "make the page feel less empty," cut it.
- Does this stat / quote / feature have real data behind it? If not, don't make it up.

"One thousand no's for every yes."

### 2. Ask before adding material

Think an extra paragraph / page / section would be better? Ask the user first — don't add it unilaterally.

Why:
- The user knows their audience better than you do
- Adding content has a cost, and the user may not want it
- Adding content unilaterally violates the "junior designer reporting to a client" relationship

### 3. Create a system up front

After exploring the design context, **state the system you intend to use out loud first** and have the user confirm it:

```markdown
My design system:
- Color: #1A1A1A body + #F0EEE6 background + #D97757 accent (from your brand)
- Type: Instrument Serif for display + Geist Sans for body
- Rhythm: section titles on a full-bleed colored background with white text; regular sections on white
- Imagery: full-bleed photo for the hero, placeholders in feature sections pending your assets
- Use at most 2 background colors to avoid clutter

Confirm this direction and I'll start.
```

Start only after the user confirms. This check-in avoids the "halfway done before realizing the direction was wrong" trap.

## Scale Standards

> [trimmed: slide (1920×1080) and print-document scale tables — not relevant to 1080×1920 ad creatives]

### Web and mobile

- Body text minimum **14px** (16px for senior-friendly)
- Mobile body text **16px** (avoids iOS auto-zoom)
- Hit target (clickable element) minimum **44×44px**
- Line height 1.5–1.7 (Chinese 1.7–1.8)

### Contrast

- Body text vs. background **at least 4.5:1** (WCAG AA)
- Large text vs. background **at least 3:1**
- Check with Chrome DevTools' accessibility tools

## CSS Power Tools

**Advanced CSS features** are a designer's best friend — use them boldly:

### Typography

```css
/* Wrap headings more naturally so the last line isn't a lonely single word */
h1, h2, h3 { text-wrap: balance; }

/* Wrap body text to avoid widows and orphans */
p { text-wrap: pretty; }

/* Chinese typography power tools: punctuation kerning, line-start/end control */
p {
  text-spacing-trim: space-all;
  hanging-punctuation: first;
}
```

### Layout

```css
/* CSS Grid + named areas = readability through the roof */
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
}

/* Subgrid to align card content */
.card { display: grid; grid-template-rows: subgrid; }
```

### Visual effects

```css
/* A scrollbar with some design to it */
* { scrollbar-width: thin; scrollbar-color: #666 transparent; }

/* Glassmorphism (use sparingly) */
.glass {
  backdrop-filter: blur(20px) saturate(150%);
  background: color-mix(in oklch, white 70%, transparent);
}

/* View Transitions API for silky page changes */
@view-transition { navigation: auto; }
```

### Interaction

```css
/* The :has() selector makes conditional styling easy */
.card:has(img) { padding-top: 0; } /* cards with an image get no top padding */

/* Container queries make components truly responsive */
@container (min-width: 500px) { ... }

/* The new color-mix function */
.button:hover {
  background: color-mix(in oklch, var(--primary) 85%, black);
}
```

## Decision Cheat Sheet: When You Hesitate

- Want to add a gradient? → Probably don't
- Want to add an emoji? → Don't
- Want to give a card rounded corners + a border-left accent? → Don't; use another method
- Want to draw a hero illustration in SVG? → Don't; use a placeholder
- Want to add a quote for decoration? → Ask the user first whether there's a real quote
- Want to add a row of icon features? → Ask first whether icons are wanted; they may not be
- Using Inter? → Swap in something with more character
- Using a purple gradient? → Swap in a palette with some basis

**When you feel like "adding this would look a bit nicer" — that's usually a sign of AI slop.** Build the simplest version first, and add only when the user asks.

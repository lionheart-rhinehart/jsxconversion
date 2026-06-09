# Power Source — Design System

The brand & UI system for **Power Source Training Center** (a.k.a. **Power Source Athletics**), the premier athletic development and sports-performance facility in Leominster, MA. Founded **1998**. This system gives design agents everything needed to produce on-brand marketing, product, and collateral.

> **Tagline:** *Train Hard. Rise Higher. Compete Stronger.*
> **Promise:** *Where every athlete is treated like a champion.*

---

## 1. Company context

Power Source is a youth + adult athletic-training gym. They sell coaching, not equipment — the product is measurable physical progress (speed, strength, conditioning, coordination) **plus** character habits (focus, effort, perseverance, commitment). Tone is motivational, blue-collar, championship-grade, and family-trusted.

**Programs (the core taxonomy):**
- **Youth Personal Training** — 1:1 athletic development for kids/teens
- **Speed School** — speed, agility, explosiveness
- **Adult Personal Training** — 1:1 for adults, any starting level
- **Adult Team Training** — small-group / team strength & conditioning

**Audience:** parents of young athletes (primary buyers), the athletes themselves (teens, hockey-heavy), and adults seeking fitness/strength. Serves Leominster, Lancaster, Sterling, Princeton & surrounding MA communities.

**Proof points used in copy:** since 1998, thousands of families, athletes who reached collegiate & pro levels, "measured, tracked, proven" performance numbers, glowing parent testimonials.

### Sources used to build this system
- **Website:** https://powersourceleominster.com/ (Programs, Coaches, Reviews, "The Power Source Approach", Blog, Schedule, Members Only). Site is a LeadConnector/HighLevel funnel.
- **Instagram:** https://www.instagram.com/powersource_athletics/
- **Logo:** provided by client → `assets/logo/power-source-logo.webp`
- **Color palette:** provided swatch set → `assets/reference/color-palette-reference.png`
- **Contact (for collateral):** 450 Research Dr, Suite B, Leominster, MA 01453 · (978) 678-3145
- Facebook: /powersourcetraining · YouTube: @jimherrick1150

> No codebase or Figma was provided. UI kits here are **brand-faithful recreations** built from the live marketing site's content and the supplied brand assets — not pixel copies of proprietary screens.

---

## 2. Content fundamentals — how Power Source writes

**Voice:** a demanding-but-caring head coach. Confident, plainspoken, motivational. Talks to parents like a trusted partner and to athletes like a team.

**Casing:** Headlines are **ALL-CAPS** and clipped into short, punchy commands, often three beats: *"Train Hard. Rise Higher. Compete Stronger."* Section labels are uppercase. Body copy is sentence case.

**Person:** Mostly **"we" / "our"** (the gym) talking to **"you" / "your athlete"** (the parent/athlete). Inclusive and direct: *"we help you achieve your full potential."*

**Sentence style:** Short declaratives. Em-dashes for momentum. **Bold** drops on power words (*greatness, potential, transformation, confidence, results*). Light use of stat fragments: *"Measured. Tracked. Proven."*

**Recurring phrases / motifs:**
- "Train Hard. Rise Higher. Compete Stronger."
- "Where every athlete is treated like a champion"
- "Claim 2 FREE Training Sessions" / "Start Your Training" (primary CTAs)
- "Measured. Tracked. Proven."
- "the hardest worker in the room"
- "for life and sport"

**Vocabulary:** athlete, develop(ment), speed, strength, agility, explosive, conditioning, coordination, confidence, habits, champion, potential, results, injury-prevention, science-based.

**CTAs:** verb-first and benefit-led. Primary: **Start Your Training**. Lead magnet: **Claim 2 Free Sessions**. Secondary: **Book a Tour**, **Meet Your Coach**.

**Emoji:** none. The brand is not emoji-driven. Don't add them. Energy comes from type, the bolt, and color — not emoji.

**Do / Don't:**
- ✅ "Train like a champion." ✅ "Real numbers. Real results." ✅ "Your athlete's blind spots, solved."
- ❌ corporate jargon, ❌ hype with no proof, ❌ emoji, ❌ soft hedging ("maybe", "kind of").

---

## 3. Visual foundations

The look is **athletic varsity meets dark arena**: heavy condensed type, jersey-block navy, a high-voltage yellow bolt, and signal blue for action. Default surface is near-black; light sections are used for long-form content.

**Color** — five brand anchors: white `#ffffff`, **bolt yellow** `#e1cc42`, **electric blue** `#2c97c9`, **steel navy** `#31456e`, black `#010101`. Roles:
- **Electric blue** = primary action / interactive (buttons, links, focus).
- **Bolt yellow** = energy accent / highlight / the "spark" — used sparingly for emphasis, stat callouts, the bolt motif. Yellow always carries **dark** text.
- **Steel navy** = structural blocks, headers, jersey panels (mirrors the logo lockup).
- **Ink/black** = the home background; **white** = light content sections.
Full 50→900 tints exist for each (`tokens/colors.css`). Imagery leans **warm, contrasty, athletic** — sweat, motion, gym light; treat photos with a slight dark scrim so white headlines read.

**Type** — `Saira Condensed` (800/900, uppercase) for display & big stat numerals; `Saira` (400–700) for headings, UI, and body; `Space Mono` for eyebrows, data labels, timers and stat units. Display is set tight (line-height .9, tracking −0.01em). This pairing evokes athletic scoreboards and team jerseys without resorting to a literal collegiate slab.

**Spacing & layout** — 8px grid. Generous, blocky section rhythm (`--section-pad-y` clamps 64→128px). Max content width 1200px. Layouts favor strong horizontal bands, full-bleed hero blocks, and 2–4 column stat/feature grids. Fixed sticky header on dark.

**Backgrounds** — primarily flat ink/near-black, occasionally the `--grad-arena` radial (a faint stadium-light glow from top-center). Steel-navy panels for feature blocks. Light (`#fff` / `--gray-50`) for editorial/long copy. No busy patterns; energy comes from type + the bolt, not texture. A subtle hairline grid (`--hairline-grid`) is allowed on hero backdrops.

**Corner radii** — restrained and a touch hard-edged to feel sturdy/athletic: cards/buttons 8–12px, pills for tags/CTAs-secondary, 0–4px for stat blocks and jersey bars. Avoid pill-shaped primary buttons; keep them blocky (radius-md).

**Borders** — thin hairlines on dark (`rgba(255,255,255,.08–.28)`); 2–3px accent borders (`--bw-3`) in bolt or electric for emphasis blocks and active states.

**Shadows & glows** — deep, soft shadows on dark (`--shadow-md/lg/xl`). The signature is the **bolt glow** (`--glow-bolt`) and **electric glow** (`--glow-electric`) on hover/active for key CTAs and stat tiles. Light sections use soft `--shadow-light-*`.

**Cards** — dark raised surface (`--surface-raised`), 1px subtle border, radius-lg, `--shadow-md`. A featured card gains a 3px bolt or electric top/left accent and a glow on hover. Light-section cards: white, `--border-on-light`, `--shadow-light-md`.

**Motion** — decisive and sporty. `--ease-out` (fast, confident) for most transitions, `--ease-snap` (slight overshoot) for emphatic entrances. Durations 120–320ms. Fades + short translateY rises for section reveals; the bolt may have a quick one-shot "charge" flicker — never long looping decoration. Respect `prefers-reduced-motion`.

**Hover / press states:**
- *Hover:* primary buttons lighten one electric step (`--action-primary-hover`) and gain electric glow; bolt buttons lighten to `--bolt-300`; ghost buttons get an 8% white wash.
- *Press:* darken one step (`--action-primary-press`) and apply `--inset-press` + a ~1px nudge / `scale(.98)`. Decisive, not bouncy.
- *Focus:* always `--ring-focus` (electric) — never remove outlines.

**Transparency & blur** — used for sticky header (translucent ink + backdrop-blur) and overlays/scrims over imagery. Keep blur subtle; this is a gritty brand, not a glassmorphism brand.

---

## 4. Iconography

Power Source's marketing site uses generic line icons (LeadConnector funnel set) and social glyphs — there is **no proprietary icon font**. For this system we standardize on **[Lucide](https://lucide.dev)** (CDN) — clean, consistent 2px stroke, rounded joins — which matches the brand's clean-but-sturdy feel.

- **Substitution flag:** Lucide is our chosen stand-in for the site's mismatched funnel icons. If the client adopts a specific icon set, swap here.
- **Style:** stroke icons, ~2px weight, `currentColor`. Size 20–24px in UI, up to 32px for feature blocks. On dark, icons are white or `--electric-300`; accent icons may use `--bolt-400`.
- **The bolt** ⚡ is the brand's hero symbol (from the logo). Use the actual logo mark for brand moments; for inline UI energy use Lucide `zap`. Don't redraw the fist-and-bolt logo by hand — always use `assets/logo/power-source-logo.webp`.
- **Emoji / unicode as icons:** not used. Avoid.
- **Load Lucide:** `<script src="https://unpkg.com/lucide@latest"></script>` then `lucide.createIcons()`, or `<i data-lucide="zap"></i>`.

**Assets on disk:**
- `assets/logo/power-source-logo.webp` — **primary** lockup (fist + bolt + wordmark). Full-color; use on light/white surfaces, or on a steel-navy / white plate.
- `assets/logo/logo-reversed.png` — **reversed** lockup for dark surfaces: the brand bolt + "POWER SOURCE" in white Saira Condensed. Use in dark nav bars, footers, app chrome (it's used in both UI kits). Built from the brand's own bolt + type.
- `assets/logo/bolt-mark.png` — the isolated yellow bolt glyph (cropped from the logo) for standalone accent use.
- `assets/reference/color-palette-reference.png` — the supplied palette swatch (reference only).

---

## 5. Index / manifest

**Root**
- `styles.css` — global entry point (import this). `@import`s everything below.
- `readme.md` — this file.
- `SKILL.md` — Agent-Skill wrapper for use in Claude Code.

**Tokens** (`tokens/`)
- `fonts.css` — self-hosted `@font-face` (Saira Condensed, Saira, Space Mono).
- `colors.css` — brand scales + semantic aliases.
- `typography.css` — families, scale, weights, line-height, tracking.
- `spacing.css` — 8px spacing, radii, control sizing, borders, z-index.
- `effects.css` — shadows, glows, gradients, motion.
- `base.css` — light reset + element defaults.

**Foundation cards** (`guidelines/cards/`) — specimen cards rendered in the Design System tab (Colors, Type, Spacing, Brand).

**Components** (`components/core/`) — reusable React primitives: Button, Badge, Tag, StatTile, Card, FeatureCard, Input, ProgramCard, Avatar, SectionHeading, Testimonial. (See each `.prompt.md`.)

**UI kits** (`ui_kits/`)
- `marketing-site/` — Power Source marketing homepage recreation (hero, programs, stats, testimonials, CTA).
- `athlete-portal/` — member/athlete app surface (dashboard, program, progress stats, schedule).

**Assets** (`assets/`) — `logo/`, `fonts/`, `reference/`.

---

*Built June 2026. Type: Saira / Saira Condensed / Space Mono (OFL, via Fontsource), self-hosted in `assets/fonts/`. Power Source has no proprietary typeface, so Saira Condensed is the **official house display face** for this system — chosen to match the logo's bold varsity character.*

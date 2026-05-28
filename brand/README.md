# Brand

Source of truth for **Athletes Acceleration** brand identity, used by every JSX template the renderer produces.

## What's here

- `aa-design-system/` — the full Athletes Acceleration design system bundle (downloaded from Claude Design 2026-05-27). Includes:
  - `project/README.md` — brand context, voice, visual foundations, iconography. **Read top to bottom before authoring any creative.**
  - `project/colors_and_type.css` — every brand token (colors, type scale, spacing, motion, shadows) as CSS variables. Import this at the top of any JSX template.
  - `project/SKILL.md` — the kit's own usage skill (how to lift components, what to copy where).
  - `project/assets/` — logo, 20+ action photographs, 2 action video clips, animated logo sting. Use these instead of generating new imagery.
  - `project/ui_kits/marketing-site/` — pixel-faithful React components (`NavBar`, `Hero`, `Pillars`, `Programs`, `Method`, `Testimonials`, `Guarantee`, `LocationFinder`, `FinalCTA`). These are **desktop-web-scale** — lift the visual language, but rebuild layouts for 1080×1920 ad creatives.
  - `project/preview/` — one HTML card per design system element (button, eyebrow, pillar card, stat block, etc.). Use as visual reference.
  - `project/fonts/` — Anton-Regular.ttf, Geist-Variable.ttf, JetBrainsMono-Variable.ttf (already mirrored into the project's top-level `fonts/` so the renderer's preflight finds them).
  - `chats/chat1.md` — original brand-creation conversation, useful as context.

## Fonts

The kit ships three fonts; all three are installed at the project's top-level `fonts/` directory so the JSX-to-MP4 renderer's font preflight resolves them:

| Family | Role | Source |
|---|---|---|
| Anton | Display (all-caps headlines) | `fonts/Anton/` (Google Fonts cache, woff2) |
| Geist | Body (variable, 100–900) | `fonts/Geist/Geist-Variable.ttf` (from kit) |
| JetBrains Mono | Metrics, eyebrows, code-comment openers | `fonts/JetBrains_Mono/` (Google Fonts cache, woff2) |

## Voice (one-line reminder)

A head coach talking to a parent who wants the truth. Direct, declarative, metric-driven. Never hype, never fluff, never emoji, never exclamation points. Always grounded in the +1 mph / +3" / 90-day guarantee.

## When authoring a new creative

1. Read `aa-design-system/project/README.md` once per session if you haven't.
2. In the JSX template, import `aa-design-system/project/colors_and_type.css` (or inline the relevant CSS variables).
3. Reference photos from `aa-design-system/project/assets/` rather than generating new ones.
4. Match the voice rules under "CONTENT FUNDAMENTALS" in the README.
5. The renderer outputs 1080×1920 by default — design for vertical (Reels/Stories/Shorts).

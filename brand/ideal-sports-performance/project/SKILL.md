---
name: isp-design
description: Use this skill to generate well-branded interfaces and assets for Ideal Sports Performance (ISP) — a premier performance-training facility in Fort Worth, TX — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, logo assets, and a website UI kit for prototyping.
user-invocable: true
---

# ISP — Ideal Sports Performance Design System

Read **`README.md`** first — it holds the brand context, content fundamentals (voice, casing, recurring phrases), visual foundations (color, type, photography, motion, radii, shadows), and the iconography approach. Then explore the other files.

## What's here
- `colors_and_type.css` — the single source of truth for all tokens (color, type, spacing, radius, shadow) plus semantic helpers (`.eyebrow`, `.stat`, `.lead`, `.isp h1…`). Link this in any artifact.
- `fonts/` — self-hosted Barlow + Barlow Condensed (referenced by the CSS).
- `assets/` — logo lockups (`logo-full.png` on light, `logo-on-dark.png` for ink/blue backgrounds, `logo-badge.png` standalone app mark) and `hero-original.webp` training photography.
- `preview/` — small reference cards for the Design System tab.
- `ui_kits/website/` — high-fidelity React recreation of the ISP marketing site; reuse its components (`Button`, `Eyebrow`, `Icon`, `Header`, `Hero`, `Programs`, `StatBand`, `SignupForm`, `Footer`).

## How to work
- **Visual artifacts** (slides, mocks, throwaway prototypes): copy the assets you need out of this folder, link `colors_and_type.css`, and produce static/standalone HTML for the user to view. Pull real components from `ui_kits/website/` rather than rebuilding.
- **Production code**: copy assets and read the rules here to design natively in the brand.
- Honor the brand: **ISP blue `#2573b7` is the only hero color**; ink `#1c1c1d` + white carry the rest. Headlines are UPPERCASE Barlow Condensed, often two lines with one word in blue. Pill-shaped CTAs. Real in-gym photography under ink/blue diagonal scrims. Lucide stroke icons, never emoji. The standing offer is *"Your first class is free / Try ISP Free."*

If the user invokes this skill without other guidance, ask what they want to build or design, ask a few focused questions, then act as an expert designer who outputs **HTML artifacts** or **production code** depending on the need.

# Design Review — Deep Guide (English)

> English translation of `critique-guide.md` from the Huashu Design repo (MIT). Lightly trimmed to
> ad-creative relevance. This is the rubric we're adapting into our two-tier "definition of done"
> scorecard. See the original file for the full Chinese.

> Detailed reference for the review phase: scoring bands, scenario weighting, common-problem checklist.

---

## Scoring bands in detail

### 1. Philosophy Alignment
| Score | Standard |
|------|----------|
| 9–10 | Perfectly embodies the core spirit of the chosen design philosophy; every detail has a rationale |
| 7–8 | Direction correct, core traits present, a few details drift |
| 5–6 | Intent visible, but execution mixes in other styles — not pure |
| 3–4 | Surface imitation only; doesn't grasp the core |
| 1–2 | Essentially unrelated to the chosen philosophy |

**Checkpoints:** Does it use that designer/studio's signature techniques? Do color, type, and layout fit
the philosophy? Any self-contradicting elements (e.g. chose Kenya Hara minimalism but crammed it full)?

### 2. Visual Hierarchy
| Score | Standard |
|------|----------|
| 9–10 | Eye flows naturally along the designer's intent; zero friction getting the info |
| 7–8 | Clear primary/secondary; 1–2 fuzzy spots |
| 5–6 | Can tell title from body, but the middle levels are muddled |
| 3–4 | Info laid flat; no clear visual entry point |
| 1–2 | Chaotic; the viewer doesn't know where to look first |

**Checkpoints:** Title-to-body size contrast enough (at least 2.5×)? Do color/weight/size build 3–4 clear
levels? Does whitespace guide the eye? **Squint test:** squint your eyes — is the hierarchy still clear?

### 3. Craft Quality
| Score | Standard |
|------|----------|
| 9–10 | Pixel-precise; alignment, spacing, color flawless |
| 7–8 | Polished overall; 1–2 tiny alignment/spacing issues |
| 5–6 | Basically aligned, but spacing inconsistent and color use unsystematic |
| 3–4 | Obvious alignment errors, messy spacing, too many colors |
| 1–2 | Rough; looks like a draft |

**Checkpoints:** Unified spacing system (e.g. 8pt grid)? Same-type elements spaced consistently? Color
count controlled (usually ≤3–4)? Font families unified (usually ≤2)? Edge alignment precise?

### 4. Functionality
| Score | Standard |
|------|----------|
| 9–10 | Every element serves the goal; zero redundancy |
| 7–8 | Clearly function-driven; minor removable decoration |
| 5–6 | Usable, but obvious decorative elements distract |
| 3–4 | Form over function; the viewer has to hunt for info |
| 1–2 | Drowned in decoration; lost the ability to communicate |

**Checkpoints:** Delete any one element — does the design get worse? (If not, delete it.) Is the CTA / key
info in the most prominent spot? Any "added because it looks nice" elements? Does info density match the
medium?

### 5. Originality
| Score | Standard |
|------|----------|
| 9–10 | Fresh; found a unique expression *within* the chosen philosophy |
| 7–8 | Has its own ideas; not just a template fill |
| 5–6 | Conventional; looks like a template |
| 3–4 | Heavy cliché use (e.g. gradient orb = "AI") |
| 1–2 | Pure template or stock assembly |

**Checkpoints:** Avoids common clichés (see list below)? Personal expression while still following the
philosophy? Any "unexpected but fitting" decisions?

---

## Scenario weighting (their deliverable types)
Different outputs weight the five dimensions differently. The *concept* is what we reuse — for us the
"scenario" is the **ad beat** (Hook / Mechanism / Proof / Offer), not these Chinese-platform formats.

| Scenario | Most important | Secondary | Can relax |
|------|------|------|------|
| Social cover / feature image | Originality, Hierarchy | Philosophy | Functionality (single image, no interaction) |
| Infographic | Functionality, Hierarchy | Craft | Originality (accuracy first) |
| Slide deck | Hierarchy, Functionality | Craft | Originality (clarity first) |
| PDF / whitepaper | Craft, Functionality | Hierarchy | Originality (professionalism first) |
| Landing page | Functionality, Hierarchy | Originality | — (all-round) |
| App UI | Functionality, Craft | Hierarchy | Philosophy (usability first) |

---

## Common design problems — Top 10
1. **AI tech cliché** — gradient orbs, digital rain, blue circuit boards, robot faces. *Why bad:* viewers
   are fatigued by these; you blend in. *Fix:* abstract metaphor over literal symbol.
2. **Weak size hierarchy** — title/body gap too small (<2.5×). *Fix:* title ≥3× body (16px body → 48–64px title).
3. **Too many colors** — 5+ with no hierarchy. *Fix:* 1 primary + 1 secondary + 1 accent + grayscale.
4. **Inconsistent spacing.** *Fix:* an 8pt grid (use only 8/16/24/32/48/64px).
5. **Too little whitespace** — every space filled. *Fix:* whitespace ≥40% of area (minimalist ≥60%).
6. **Too many fonts** (3+). *Fix:* ≤2 (one display + one body); vary by weight and size.
7. **Inconsistent alignment** — some left, some center, some right. *Fix:* pick one (prefer left), apply globally.
8. **Decoration over content** — background patterns/gradients/shadows steal focus. *Fix:* "if I delete this
   decoration, does the design get worse?" If not, delete it.
9. **Cyber-neon overuse** — dark blue (#0D1117) + neon glow. *Fix:* a more distinctive palette.
10. **Density–medium mismatch.** *Fix:* one core point per slide; one focal point per cover image; layer an
    infographic; a PDF can be denser but needs clear navigation.

---

## Review output template
```
## Design Review Report

Overall: X.X/10  [Excellent 8+ / Good 6–7.9 / Needs work 4–5.9 / Fail <4]

Per dimension:
- Philosophy Alignment: X/10 — [one line]
- Visual Hierarchy:     X/10 — [one line]
- Craft Quality:        X/10 — [one line]
- Functionality:        X/10 — [one line]
- Originality:          X/10 — [one line]

### Keep (what's working)
- [specific, in design language]

### Fix (ranked by severity)
1. [name] — ⚠️ fatal / ⚡ important / 💡 polish
   - Now: [current state]
   - Why: [why it's a problem]
   - Fix: [specific action, with numbers]

### Quick Wins (if you only have 5 minutes, do these 3)
- [ ] [highest-impact fix]
- [ ] [second]
- [ ] [third]
```

# Research handoff — how to put real media into ad creatives without a full-bleed wash

> Paste this into a fresh chat (use `/deep-research` if available). It is self-contained.
> Goal: **targeted, actionable** findings — not an academic survey. Time-box it.

## Who this is for / context

We're building the creative engine for **Athletes Acceleration (AA)** — youth sports performance
(ages 8–18). We've built a library of **15 visually-distinct ad designs** (vertical 1080×1920) that act
as the reference set teaching a generative engine "here are the kinds of creatives to build." Brand:
red `#c4141d`, fonts Anton / Geist / JetBrains Mono / Saira Condensed, voice = head-coach-to-parent,
metric-driven, no emoji/exclamation. Guarantee line (verbatim): *+1 mph speed. +3" vertical. 90 days.
Or your training is on us.*

**Why distinctness matters:** Meta's Andromeda/Entity-ID retrieval collapses near-duplicate creatives
into one auction candidate. We validate distinctness with embedding models **CLIP ViT-L/14 (semantic)
+ DINOv2-L (spatial/layout)**; our hard gate is **every cross-design cosine < 0.70**. The 15 designs
currently pass (max cross-design 0.695, purity 1.0).

## The problem we need solved

The 15 split into ~6 photo-led designs (action-hero, training-scene, before/after, proof-collage,
ugc-selfie, coach-portrait) and ~9 graphic/text-led (giant-stat, metric-reveal, kinetic-text,
quote-card, list-steps, offer-card, versus, timeline-schedule, benefit-iconrow). AA is a
**creative/image-heavy category** — audiences expect to see athletes, the facility, the environment —
so we want the option to put real imagery into MORE of the designs. But our own measurements show a
hard tension:

**Measured (our experiment, 7 graphic designs, CLIP-L/14 + DINOv2-L):**
| Media treatment | max cross-design cosine | designs that collapse (≥0.70) | human quality |
|---|---|---|---|
| No media (current) | 0.695 | 0 / 21 | good |
| **Full-bleed photo, same clip** | **0.916** | **21 / 21 (total collapse)** | ok but identical |
| Full-bleed photo, different clips | 0.772 | 4 / 21 | ok |
| Small corner "accent" card, different clips | 0.634 | 0 / 21 | **looks like garbage** |

- A full-bleed photo **overwrites the design**: a design with a photo washed behind it correlates only
  ~0.40 with its own no-photo self, and ~0.85 with the real photo design — i.e. it stops being its own
  thing and becomes "an athlete-photo ad."
- The small corner-card "accent" keeps the math happy (0.63) but it's a chip bolted onto an unrelated
  layout — it reads as amateur garbage to a human. **Gaming the metric ≠ a good creative.**
- Video behaves identically to a still (the embedding sees a representative frame).

So: **full-bleed collapses them; a bolted-on chip looks bad.** We need the middle path that actually
exists in professional work.

## The research questions (in priority order — keep it tight)

1. **Integration patterns.** What are the *proven, professional* ways to integrate real
   photography/video into **text/graphic-led** ad layouts WITHOUT a full-bleed background, that look
   high-end to consumers? For each pattern, give real examples (brands/agencies/links) + when it works,
   how much of the frame it occupies, and pitfalls. Candidates to evaluate (add others):
   framed inset / photo card · **knockout/cutout subject** on a color field · **duotone / treated photo
   as a graphic element** · split-panel (photo half) · photo-as-texture under a strong overlay system ·
   photo strip/band · masked/shaped photo · editorial collage.
2. **Ratio (this is open — do NOT assume our 9:6).** In image-heavy categories (youth sports / fitness /
   local service businesses with a facility + people), what's the realistic mix of photo-led vs
   graphic-only designs in *high-performing* accounts? Is "every ad has a photo" actually the norm, or
   do strong accounts run a mix? Give evidence.
3. **Non-athlete imagery.** How do top fitness/sports/facility brands use **facility interiors,
   equipment, the building, the environment** (not just athlete action) as the photo in a design?
   Examples. (Cody's instinct: some creatives should show the *place*, not a person.)
4. **Distinctness preservation.** For each integration pattern, does a *designed-in* (non-full-bleed)
   photo keep creatives perceptually distinct to CLIP/DINOv2 and to Meta's Entity-ID? What actually
   drives collapse (same subject/same environment/full-frame photo) vs. what preserves distinctness
   (varied subject/environment + photo as a contained design element + strong layout signal)? Tie to
   Meta's "vary ≥2 of {format, persona, environment, visual concept}" rule.
5. **Implementable rules.** Boil it down to a decision rubric we can code: given a layout, *where / how
   / how much* photo to add so it (a) reads professional AND (b) stays under 0.70 cross-design cosine.

## What to bring back (deliverable)

A short, skimmable report:
- **A ranked list of integration patterns** with example images/links + a one-line "use when / avoid when."
- **A recommended photo-led vs graphic-only ratio** for this category, with the reasoning, mapped onto
  our 15 design types (which should carry media, which shouldn't, and *how*).
- **A footage-diversity note** (since same-subject/same-gym footage is the real collapse driver).
- **The decision rubric** from Q5, concrete enough to implement.

## Hard constraints (do not violate)
- **Consumer/human quality is the hard constraint. AI distinctness (<0.70) is a guardrail, not the goal.**
  A great-looking creative at 0.68 ships; an ugly one at 0.60 never runs.
- Vertical 1080×1920; AA brand kit above; coach-to-parent voice; no emoji/exclamation.
- These 15 are the system's DNA — every campaign the engine builds inherits how these look. Getting the
  human quality right matters more than any single metric.

## Our measured data to ground your analysis (don't re-derive)
- Embedding stack: CLIP ViT-L/14 + DINOv2-L; gate: cross-design cosine < 0.70; purity ≥ 0.80.
- Full-bleed same photo → 0.92 (collapse). Full-bleed different → 0.77. Corner-accent → 0.63 (but ugly).
- kinetic-text ~ quote-card: 0.52 (no media) → 0.81 (same clip full-bleed) → 0.58 (corner accent).
- Photo washed behind a design: ~0.40 similarity to its own no-photo self; ~0.85 to the real photo design.

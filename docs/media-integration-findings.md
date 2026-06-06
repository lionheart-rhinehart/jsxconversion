# Media-integration findings — how to put photos/video into the example designs

**Date:** 2026-06-06 · **Track B** · Measured with CLIP ViT-L/14 + DINOv2-L, cross-checked by Gemini
(`gemini-2.5-flash`). Experiment harness: `scripts/example-sidecar/_experiment/` (renders gitignored,
regenerable via `tierA.mjs` / `tierB.mjs` + `measure.py`).

## Why this exists

The 15 example designs are shipped and mutually distinct (max cross-design cosine 0.695; commit cf0af50).
AA is an image-heavy category, so we asked: can we add real photography/video to the graphic-led designs
without (a) collapsing them into one perceptual cluster, or (b) looking like garbage to a human? A research
doc proposed patterns; this is the empirical test of every claim. **Decision rule:** a treatment only
"works" if it is BOTH distinct (cosine < 0.70 on combined AND DINOv2) AND professional (Gemini would run it).

## Measured results (5 graphic host designs through each treatment)

| Condition | CLIP max | DINOv2 max | Combined max | identity | distinct? |
|---|---|---|---|---|---|
| C0 baseline (no media) | 0.62 | 0.80 | 0.695 | — | ✓ (combined) |
| C1 full-bleed raw · same clip | 0.86 | 0.99 | 0.92 | 0.34 | ✗ |
| C2 full-bleed raw · diff clips | 0.79 | 0.79 | 0.74 | 0.33 | ✗ |
| C3 full-bleed DUOTONE · same | 0.83 | 0.99 | 0.89 | 0.36 | ✗ |
| C4 full-bleed DUOTONE · diff | 0.78 | 0.78 | 0.70 | 0.34 | ✗ |
| **C5 knockout CUTOUT on color** | 0.66 | 0.59 | **0.62** | 0.48 | **✓** |
| SW11 inset 11% area | 0.69 | 0.57 | 0.61 | 0.54 | ✓ |
| SW20 inset 20% | 0.72 | 0.66 | 0.67 | 0.43 | ✓ |
| SW30 inset 30% | 0.75 | 0.85 | 0.74 | 0.38 | ✗ |
| SW40 inset 40% | 0.78 | 0.88 | 0.75 | 0.35 | ✗ |
| SW50 inset 50% | 0.81 | 0.85 | 0.76 | 0.28 | ✗ |
| C7 strip (full-width, 20% height) | 0.79 | 0.86 | 0.80 | 0.38 | ✗ |
| C8 split-panel (45% width) | 0.75 | 0.67 | **0.64** | 0.35 | **✓** |
| C9 masked circle (25% area) | 0.74 | 0.80 | 0.75 | 0.42 | ✗ |

**Facility region check (T2):** mean within-athlete **0.725**, within-facility 0.542, cross athlete↔facility
**0.536** → facility imagery is a **distinct embedding region** (cross < within-athlete). Using facility/
equipment shots *diversifies* rather than collapses — and explains why athlete designs collapse so easily
(athletes are 0.725 similar to each other = the shared "athlete in a gym" content).

## Verdicts (theory → measured)

| Theory | Verdict | Evidence |
|---|---|---|
| Full-bleed **duotone** stays distinct | ❌ REFUTED | DINOv2 0.99/0.78 ≈ raw; treatment changes nothing structurally. The research doc's headline claim is wrong. |
| Contained media stays distinct at 20–35% | ❌ REFUTED above ~20–25% | breakpoint between SW20 (0.67 ✓) and SW30 (0.74 ✗); identity also degrades with size. |
| Footage diversity is the lever | ✅ partial | same→diff drops ~0.18 (C1→C2, C3→C4) but never enough to save full-bleed. |
| The gate is valid (esp. adding DINOv2) | ✅ CONFIRMED | DINOv2 is what exposes duotone; Gemini's read agrees with it. |
| Knockout cutout keeps designs distinct at large size | ✅ CONFIRMED | C5 combined 0.62, both models < 0.70, athlete at ~64% height (removing the background removes the shared "gym" signal). |
| Cutout = low-risk AND high-quality | ⚠️ SPLIT | distinct YES; quality NOT automatic — auto-rembg masks read "rough" to Gemini, and it needs purpose-built layouts so athlete + text don't collide. |
| Photo **strip** (full-width band) = very low risk | ❌ REFUTED | full-width band same position across designs = shared structure → collapses (0.80) even at 20% height. |
| **Split-panel** keeps designs distinct | ✅ CONFIRMED | 45% photo, 0.64 combined — the other half preserves each layout (matches coach-portrait, a working split). |
| **Facility** imagery is a distinct, diversifying region | ✅ CONFIRMED | cross athlete↔facility 0.536 < within-athlete 0.725. |

## Gemini cross-check (independent of cosine)

- **Distinctness:** on C0, C1, C5 Gemini reported "4 distinct families — list-steps & timeline-schedule read
  as the same." This **triangulates the embedding** (DINOv2 flagged that exact pair at 0.80). → a real
  near-twin in the shipped 15 to differentiate or merge.
- **Quality (creative-director, 1–5):** C0 baseline ≈ 5/3/5/4/3 (good; issues are content, not approach);
  C1 full-bleed ≈ 3/1/5/3/4 (legibility tanks); C5 cutout ≈ 3/2/3/1/2 (rough masks + injection overlap).

## The rubric we adopt (data-backed)

1. **No full-bleed media on graphic designs.** Raw and duotone both collapse the set AND hurt legibility. Dead.
2. **Two ways to give media LARGE presence and stay distinct:** (a) **knockout cutout** on a brand-color
   field (0.62), and (b) **split-panel** ~45% (0.64) where the other half keeps the design's layout. Both
   need purpose-built layouts (athlete/photo and text not colliding). Cutout also needs clean masking
   (auto-rembg reads "rough").
3. **Contained accent media has a hard ~20% ceiling** — and must be VARIED in position/shape, not a
   full-width same-position band (a full-width strip collapses at 0.80 even at 20% height).
4. **Footage diversity is mandatory** (different athletes / sessions / zones). Same clip is the single
   biggest collapse driver; athletes are 0.725-similar to each other, so reuse collapses fast.
5. **Facility/equipment imagery is a strong diversifier** (distinct region, 0.536 vs athletes) and is
   persona-free — good for environment/process designs and parent-trust.
6. **The 6 photo-led designs remain the primary athlete vehicle**; graphic-led designs stay photo-free
   unless they use cutout or split (per #2).
7. **Gate stays combined < 0.70 AND DINOv2 < 0.70** — DINOv2 alone catches structural collapse the combined
   metric can mask (it's what exposed duotone and the full-width strip).

## Open / next

- **Differentiate list-steps vs timeline-schedule** (embedding + Gemini agree they're one family).
- **Fair quality test for the winners** — build 1–2 purpose-built **cutout** and **split-panel** designs
  (hand-checked masks, no athlete/text collision) and re-score with Gemini to find their real quality ceiling.
  Distinctness is proven; clean human-quality is the remaining unknown.
- Tiers A–D complete (duotone refuted, ~20% ceiling, cutout + split = the large-media winners, full-width
  strip refuted, facility = distinct diversifier).

Viewer: `localhost:5300` → **Media Test** tab renders this matrix live (each treatment × the 5 designs + badges).

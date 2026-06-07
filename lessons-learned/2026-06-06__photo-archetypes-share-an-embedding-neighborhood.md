# Photo archetypes share an embedding neighborhood — layout can't break content similarity

**Date:** 2026-06-06 · Track B example-library spectrum build (45 examples = 15 archetypes × 3 sub-looks)

## What happened
Growing the example library to 3 sub-looks/archetype, the **graphic** archetypes stayed cleanly distinct
(cross-cluster < 0.70) but the **6 photo archetypes** (action-hero, before-after-split, training-scene,
ugc-selfie, + proof/coach nearby) clustered together: worst pair `action-hero ~ before-after-split = 0.76`,
k-means purity 0.71, silhouette 0.05. None of the strict gate's three breadth/clustering thresholds
(cross < 0.70, purity ≥ 0.80, silhouette ≥ 0.35) were met — all bounded by this one neighborhood.

## The lesson
**For photo-led designs, CLIP/DINOv2 distance is driven by photo CONTENT, not layout.** Two archetypes
that both fill the frame with "an athlete in our gym" read as ~0.75 similar no matter how you arrange the
text — because the shared signal is the athlete, not the composition (T2 already measured within-athlete
0.725). Restructuring layout fixed every *graphic* collision but moved the photo pairs almost not at all.

## What actually moves the needle (in order)
1. **Footage diversity** — the only layout-time lever. Same clip used full-frame in two designs is the #1
   collapse driver; giving each its own clip dropped the worst pair 0.79 → 0.76. Always check no clip is
   reused full-frame across archetypes.
2. **Less photo coverage / more solid graphic region** — coach-portrait stays clean (0.63) *because* half
   the frame is a solid panel. Cutout-on-color (0.62) and split-panel (0.64) also escape the athlete cluster.
   But applying these to an archetype changes its identity (a non-full-bleed "action-hero" isn't one).
3. **More examples per kind** — the honest path to silhouette ≥ 0.35 (README: rises at 10–20/kind), not
   more layout churn at 3/kind.

## Don't
- Don't keep restructuring layout to chase a photo↔photo cross-cosine under 0.70 — you'll erode the
  archetype's identity before you move the number. Stop and either diversify footage, de-photo (accepting
  identity change), or scale examples/kind.
- Don't read low silhouette at 3/kind as "the archetypes are wrong" — singletons inflate silhouette to ~1.0;
  the real (low) number only appears once each kind has ≥2 examples. It's a sample-size artifact as much as
  a separation signal.

Full data + decision: `docs/media-integration-findings.md` → "The spectrum measurement (45 examples)".

#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/embed_campaign.py — perceptual gates on campaign OUTPUTS
# ============================================================================
#  Embeds a campaign's render-QA-passed outputs (CLIP-L/14 + DINOv2-L via embed_core —
#  the IDENTICAL space as the example centroids) and computes the RAW metrics for:
#    • #15 cluster-adherence — each output's cosine to the centroid of the archetype it
#      was ASSIGNED, + its nearest centroid → landedInLane.
#    • #14 selection-distinctness — for each pair of outputs in the SAME running segment,
#      the combined + DINOv2 cosine (the JS merge layer applies the <0.70 threshold).
#  Writes RAW numbers only (no thresholds — those live in perceptual-merge.mjs, testable
#  without torch). Embedder-tagged: refuses to compare a fallback-embedded output against
#  the real-CLIP centroids (different space → garbage) → ranOk:false sentinel.
#
#  Reads  campaigns/<c>/.perceptual-input.json  { items:[{key,png,archetype,format,segment}] }
#  Writes campaigns/<c>/.perceptual-embed.json  { ranOk, embedder, assets:{...} } | { ranOk:false, reason }
#  Usage: python embed_campaign.py <campaign>
# ============================================================================

import json
import sys
from pathlib import Path

import numpy as np

from embed_core import l2, load_image_rgb, blank_check, embed_images

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
CENTROIDS_NPZ = ROOT / "templates" / "_archetype-centroids.npz"


def log(msg):
    sys.stderr.write(f"[embed-campaign] {msg}\n")
    sys.stderr.flush()


def fail(out_path, reason):
    out_path.write_text(json.dumps({"ranOk": False, "reason": reason, "assets": {}}, indent=2), encoding="utf-8")
    log(f"ranOk=false: {reason}")
    return 0  # the sentinel IS the (fail-closed) result — exit 0, the gate holds via the block


def main():
    if len(sys.argv) < 2:
        sys.stderr.write("usage: python embed_campaign.py <campaign>\n"); return 2
    campaign = sys.argv[1]
    camp_dir = ROOT / "campaigns" / campaign
    in_path = camp_dir / ".perceptual-input.json"
    out_path = camp_dir / ".perceptual-embed.json"
    if not in_path.exists():
        sys.stderr.write(f"no {in_path}\n"); return 2

    items = json.loads(in_path.read_text(encoding="utf-8")).get("items", [])
    if not CENTROIDS_NPZ.exists():
        return fail(out_path, "archetype centroids missing — run build_centroids.py")
    cz = np.load(CENTROIDS_NPZ, allow_pickle=True)
    cen_arch = [str(x) for x in cz["archetypes"]]
    cen_fmt = [str(x) for x in cz["formats"]]
    cen_vecs = l2(np.asarray(cz["centroids"], dtype=np.float32))
    cen_embedder = str(cz["embedder"])

    # load + blank-drop the output images
    kept, images = [], []
    for it in items:
        img = load_image_rgb(it["png"])
        if img is None:
            log(f"drop {it['key']}: open failed ({it['png']})"); continue
        ok, _std = blank_check(img)
        if not ok:
            log(f"drop {it['key']}: near-uniform frame"); continue
        kept.append(it); images.append(img)
    if not kept:
        return fail(out_path, "no embeddable outputs (all missing or blank)")

    clip_v, dino_v, combined, embedder = embed_images(images)
    if embedder != cen_embedder:
        return fail(out_path, f"embedder mismatch: outputs [{embedder}] vs centroids [{cen_embedder}] — different vector space")

    comb = l2(combined)
    dino = l2(dino_v)

    # index centroids by format for the adherence lookup
    fmt_idx = {}
    for i, f in enumerate(cen_fmt):
        fmt_idx.setdefault(f, []).append(i)

    assets = {}
    for n, it in enumerate(kept):
        key, arch, fmt, seg = it["key"], it.get("archetype"), it.get("format", "static"), it.get("segment", "")
        rows = fmt_idx.get(fmt, [])
        adherence = None
        if rows:
            sims = {cen_arch[i]: float(np.dot(comb[n], cen_vecs[i])) for i in rows}
            nearest_arch = max(sims, key=sims.get)
            assigned_cos = sims.get(arch)
            adherence = {
                "assignedArchetype": arch,
                "assignedCosine": None if assigned_cos is None else round(assigned_cos, 4),
                "nearestArchetype": nearest_arch,
                "nearestCosine": round(sims[nearest_arch], 4),
                # landedInLane is null when the assigned archetype has no centroid for this
                # format (can't judge) — the JS layer only blocks on an explicit False.
                "landedInLane": None if assigned_cos is None else (nearest_arch == arch),
            }
        assets[key] = {"assignedArchetype": arch, "format": fmt, "segment": seg, "adherence": adherence, "distinctness": []}

    # pairwise distinctness within each running segment
    by_seg = {}
    for n, it in enumerate(kept):
        by_seg.setdefault(it.get("segment", ""), []).append(n)
    for seg, idxs in by_seg.items():
        for a in range(len(idxs)):
            for b in range(a + 1, len(idxs)):
                na, nb = idxs[a], idxs[b]
                c = round(float(np.dot(comb[na], comb[nb])), 4)
                dn = round(float(np.dot(dino[na], dino[nb])), 4)
                assets[kept[na]["key"]]["distinctness"].append({"other": kept[nb]["key"], "combined": c, "dino": dn})
                assets[kept[nb]["key"]]["distinctness"].append({"other": kept[na]["key"], "combined": c, "dino": dn})

    out_path.write_text(json.dumps({"ranOk": True, "embedder": embedder, "assets": assets}, indent=2), encoding="utf-8")
    log(f"embedded {len(kept)} outputs [{embedder}] → {out_path.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

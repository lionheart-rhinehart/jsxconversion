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
    # [PL-3] cluster-adherence (#15) uses DINOv2-ONLY centroids (structure, brand-agnostic):
    # the archetype is a LAYOUT family, and CLIP carries brand color/text — so a blue franchisee
    # action-hero would read "off-lane" vs red AA centroids on COLOR, not structure. DINOv2 is the
    # color-blind structure embedder, so it judges the lane by layout, not brand. (Distinctness #14
    # stays combined — Meta collapses on semantics+color too.) Fallback to combined for old files.
    cen_dino = l2(np.asarray(cz["dino_centroids"], dtype=np.float32)) if "dino_centroids" in cz.files else cen_vecs
    cen_embedder = str(cz["embedder"])

    # load + blank-drop — supporting MULTI-FRAME video items (3-frame sampling for #15):
    # a video item embeds its frames; adherence uses the BEST-matching frame + flags variance.
    frame_rows, kept = [], []   # frame_rows: (item_idx, image); kept: items with >=1 good frame
    for it in items:
        paths = it.get("frames") or [it["png"]]
        any_ok = False
        for p in paths:
            img = load_image_rgb(p)
            if img is None:
                continue
            ok, _std = blank_check(img)
            if not ok:
                continue
            frame_rows.append((len(kept), img)); any_ok = True
        if any_ok:
            kept.append(it)
        else:
            log(f"drop {it['key']}: no embeddable frame")
    if not kept:
        return fail(out_path, "no embeddable outputs (all missing or blank)")

    clip_v, dino_v, combined, embedder = embed_images([img for (_i, img) in frame_rows])
    if embedder != cen_embedder:
        return fail(out_path, f"embedder mismatch: outputs [{embedder}] vs centroids [{cen_embedder}] — different vector space")

    comb = l2(combined)
    dino = l2(dino_v)

    frames_of = {}                      # item_idx -> [row indices into comb/dino]
    for ridx, (item_idx, _img) in enumerate(frame_rows):
        frames_of.setdefault(item_idx, []).append(ridx)

    fmt_idx = {}                        # centroids by format for the adherence lookup
    for i, f in enumerate(cen_fmt):
        fmt_idx.setdefault(f, []).append(i)

    assets = {}
    rep = {}                           # item_idx -> representative row (best frame) for distinctness
    for item_idx, it in enumerate(kept):
        key, arch, fmt, seg = it["key"], it.get("archetype"), it.get("format", "static"), it.get("segment", "")
        rows = fmt_idx.get(fmt, [])
        ridxs = frames_of[item_idx]
        rep[item_idx] = ridxs[0]
        adherence = None
        if rows:
            per = []
            for r in ridxs:
                # adherence on the DINOv2 (structure) axis — brand-agnostic [PL-3]
                sims = {cen_arch[i]: float(np.dot(dino[r], cen_dino[i])) for i in rows}
                nearest = max(sims, key=sims.get)
                per.append({"r": r, "sims": sims, "nearest": nearest, "assigned": sims.get(arch)})
            assigned_has_centroid = arch in (cen_arch[i] for i in rows)
            # best frame = the one that best matches the ASSIGNED lane (or, if no assigned
            # centroid, the most confident frame) — reduces false off-lane from an atypical still
            if assigned_has_centroid:
                best = max(per, key=lambda x: (x["assigned"] if x["assigned"] is not None else -1.0))
            else:
                best = max(per, key=lambda x: x["sims"][x["nearest"]])
            rep[item_idx] = best["r"]
            assigned_cos, nearest_arch = best["assigned"], best["nearest"]
            adherence = {
                "assignedArchetype": arch,
                "assignedCosine": None if assigned_cos is None else round(assigned_cos, 4),
                "nearestArchetype": nearest_arch,
                "nearestCosine": round(best["sims"][nearest_arch], 4),
                # null when the assigned archetype has no centroid for this format (can't judge) —
                # the JS layer only BLOCKS on an explicit False.
                "landedInLane": None if assigned_cos is None else (nearest_arch == arch),
                # frames disagree on the nearest archetype → the motion drifts between looks (WARN)
                "frameVariance": (len({p["nearest"] for p in per}) > 1) if len(per) > 1 else False,
                "frameCount": len(per),
            }
        assets[key] = {"assignedArchetype": arch, "format": fmt, "segment": seg, "adherence": adherence, "distinctness": []}

    # pairwise distinctness within each running segment, over each item's representative frame
    by_seg = {}
    for item_idx, it in enumerate(kept):
        by_seg.setdefault(it.get("segment", ""), []).append(item_idx)
    for seg, idxs in by_seg.items():
        for a in range(len(idxs)):
            for b in range(a + 1, len(idxs)):
                ra, rb = rep[idxs[a]], rep[idxs[b]]
                c = round(float(np.dot(comb[ra], comb[rb])), 4)
                dn = round(float(np.dot(dino[ra], dino[rb])), 4)
                assets[kept[idxs[a]]["key"]]["distinctness"].append({"other": kept[idxs[b]]["key"], "combined": c, "dino": dn})
                assets[kept[idxs[b]]["key"]]["distinctness"].append({"other": kept[idxs[a]]["key"], "combined": c, "dino": dn})

    out_path.write_text(json.dumps({"ranOk": True, "embedder": embedder, "assets": assets}, indent=2), encoding="utf-8")
    log(f"embedded {len(kept)} outputs [{embedder}] → {out_path.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

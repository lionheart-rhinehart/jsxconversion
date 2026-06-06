#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/embed.py  — Track B, step 2 of the sidecar
# ============================================================================
#  Read the render-report (render-QA-passed PNGs only), embed each with TWO
#  perceptual models — CLIP (semantic / theme / in-image text, the axis Meta's
#  Andromeda shares) and DINOv2 (spatial layout / structure) — then compute the
#  "measured spectrum" the plan calls for: intra-kind vs cross-kind cosine,
#  silhouette over the AUTHORED kinds, a Vendi diversity score, nearest-neighbor,
#  and a seeded clustering cross-check (does the unsupervised grouping agree with
#  the kinds we THINK we have?).
#
#  Two correctness rules the contract assumes are enforced HERE:
#    • SEED everything (numpy + scipy kmeans) so assignments are stable run-to-run.
#    • Embed ONLY non-blank, QA-passed frames — a near-uniform (black/blank) still
#      is dropped before it can poison the matrix (size-floor QA upstream can't see
#      a uniform frame; a pixel-variance gate here can).
#
#  Big vectors stay OUT of the index: raw embeddings → embeddings.vectors.npz
#  (gitignored, regenerable); only SMALL metrics → embeddings.artifact.json, which
#  build-index.mjs folds into templates/_example-index.json.clusterMetrics.
#
#  Primary embedder = transformers CLIP + DINOv2 (CPU ok). If the weights can't be
#  loaded (offline), it FALLS BACK to a deterministic structural descriptor so the
#  loop still completes — the artifact records which embedder ran, so a fallback run
#  is never silently trusted as a real CLIP/DINOv2 pass.
#
#  Usage:  python embed.py            (paths are resolved relative to this file)
#  New file (Track B). Reads only sidecar inputs; writes only sidecar outputs.
# ============================================================================

import json
import os
import sys
import warnings
from pathlib import Path

import numpy as np
from PIL import Image

warnings.filterwarnings("ignore")

SEED = 42
HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
RENDER_REPORT = HERE / "render-report.json"
MANIFEST = HERE / "examples.manifest.json"
VECTORS_NPZ = HERE / "embeddings.vectors.npz"
ARTIFACT = HERE / "embeddings.artifact.json"

# A frame whose grayscale std is below this reads as near-uniform (blank/black) and
# is dropped before embedding — the matrix-poisoning guard the plan demands.
BLANK_STD_THRESHOLD = 4.0
# Two examples of the SAME kind closer than this cosine are the "one look repeated"
# case → grouped into the same sub-look. (= the intra-kind pairwise target, 0.75.)
SUBLOOK_COSINE = 0.75


def log(msg):
    sys.stderr.write(f"[embed] {msg}\n")
    sys.stderr.flush()


# ---------------------------------------------------------------------------
# Inputs
# ---------------------------------------------------------------------------
def load_inputs():
    report = json.loads(RENDER_REPORT.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    kinds = {e["id"]: e["kind"] for e in manifest["examples"]}
    rows = []
    for r in report["results"]:
        if not r.get("ok") or not r.get("png"):
            continue
        rows.append({"id": r["id"], "png": str(ROOT / r["png"]), "kind": kinds.get(r["id"], "?")})
    return rows


def blank_check(img):
    """Return (ok, std). A near-uniform frame is rejected so it can't poison the matrix."""
    g = np.asarray(img.convert("L"), dtype=np.float32)
    return float(g.std()) >= BLANK_STD_THRESHOLD, float(g.std())


# ---------------------------------------------------------------------------
# Embedders
# ---------------------------------------------------------------------------
def l2(mat):
    n = np.linalg.norm(mat, axis=1, keepdims=True)
    n[n == 0] = 1.0
    return mat / n


def embed_transformers(images):
    """CLIP (512-d) + DINOv2 (768-d) via HuggingFace transformers, CPU. Raises on
    any load/inference failure so the caller can fall back."""
    import torch
    from transformers import CLIPModel, CLIPProcessor, AutoModel, AutoImageProcessor

    torch.manual_seed(SEED)
    device = "cpu"
    log("loading CLIP openai/clip-vit-base-patch32 …")
    clip = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device).eval()
    clip_proc = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    log("loading DINOv2 facebook/dinov2-base …")
    dino = AutoModel.from_pretrained("facebook/dinov2-base").to(device).eval()
    dino_proc = AutoImageProcessor.from_pretrained("facebook/dinov2-base")

    clip_vecs, dino_vecs = [], []
    with torch.no_grad():
        for img in images:
            ci = clip_proc(images=img, return_tensors="pt").to(device)
            clip_vecs.append(clip.get_image_features(**ci)[0].cpu().numpy())
            di = dino_proc(images=img, return_tensors="pt").to(device)
            out = dino(**di).last_hidden_state[:, 0, :]  # CLS token = global structure
            dino_vecs.append(out[0].cpu().numpy())
    return np.array(clip_vecs, dtype=np.float32), np.array(dino_vecs, dtype=np.float32), "clip-vit-base-patch32 + dinov2-base"


def embed_fallback(images):
    """Deterministic structural descriptor (offline fallback): a coarse grayscale
    layout grid (where mass sits — a structure proxy, DINOv2-ish) + an RGB color
    histogram (palette/theme proxy, CLIP-ish). NOT as good as the real models, but
    real, seedless-stable, and enough to prove the loop end-to-end without network."""
    layout, color = [], []
    for img in images:
        g = np.asarray(img.convert("L").resize((16, 28)), dtype=np.float32).flatten() / 255.0
        layout.append(g)
        rgb = np.asarray(img.convert("RGB").resize((64, 64)), dtype=np.float32)
        hist = np.concatenate([
            np.histogram(rgb[:, :, c], bins=16, range=(0, 255))[0] for c in range(3)
        ]).astype(np.float32)
        hist /= hist.sum() or 1.0
        color.append(hist)
    return np.array(color, dtype=np.float32), np.array(layout, dtype=np.float32), "FALLBACK:grayscale-layout+rgb-hist"


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------
def cosine_matrix(vecs):
    v = l2(vecs)
    m = v @ v.T
    return np.clip(m, -1.0, 1.0)


def vendi_score(cos):
    """Vendi = exp(Shannon entropy of the normalized similarity-matrix eigenvalues).
    Effective number of distinct items; higher = more diverse. Plan target ≥8 for a
    full 12-kind library."""
    n = cos.shape[0]
    if n == 0:
        return 0.0
    K = (cos + cos.T) / 2.0 / n  # symmetric, trace = 1
    w = np.linalg.eigvalsh(K)
    w = w[w > 1e-12]
    if w.size == 0:
        return 1.0
    ent = -np.sum(w * np.log(w))
    return float(np.exp(ent))


def silhouette_by_kind(cos, kinds):
    """Per-sample silhouette using AUTHORED kinds as the grouping, cosine-distance.
    Answers 'are our kinds actually separated in embedding space?'. Singleton kinds
    get a(i)=0 by convention. No sklearn dependency."""
    dist = 1.0 - cos
    n = len(kinds)
    uniq = sorted(set(kinds))
    idx = {k: [i for i in range(n) if kinds[i] == k] for k in uniq}
    sil = np.zeros(n, dtype=np.float64)
    for i in range(n):
        same = [j for j in idx[kinds[i]] if j != i]
        a = float(np.mean([dist[i, j] for j in same])) if same else 0.0
        b = np.inf
        for k in uniq:
            if k == kinds[i]:
                continue
            b = min(b, float(np.mean([dist[i, j] for j in idx[k]])))
        s = 0.0 if (a == 0 and b == np.inf) else (b - a) / max(a, b) if max(a, b) > 0 else 0.0
        sil[i] = s
    return sil


def sublooks(cos, ids, kinds):
    """Within each kind, single-linkage group examples whose cosine ≥ SUBLOOK_COSINE
    (near-twins share a sub-look). Returns {id: '<kind>-<a|b|c>'}; ≥3 distinct groups
    per kind is the depth target."""
    out = {}
    by_kind = {}
    for i, k in enumerate(kinds):
        by_kind.setdefault(k, []).append(i)
    for k, members in by_kind.items():
        # union-find over near-twin pairs
        parent = {i: i for i in members}

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for a_i in range(len(members)):
            for b_i in range(a_i + 1, len(members)):
                ia, ib = members[a_i], members[b_i]
                if cos[ia, ib] >= SUBLOOK_COSINE:
                    parent[find(ia)] = find(ib)
        # name groups in stable order
        roots = {}
        letters = "abcdefghijklmnop"
        for i in members:
            r = find(i)
            if r not in roots:
                roots[r] = letters[len(roots)]
            out[ids[i]] = f"{k}-{roots[r]}"
    return out


def per_example_metrics(cos, ids, kinds):
    n = len(ids)
    res = {}
    for i in range(n):
        same = [j for j in range(n) if j != i and kinds[j] == kinds[i]]
        other = [j for j in range(n) if kinds[j] != kinds[i]]
        intra_max = float(max(cos[i, j] for j in same)) if same else None
        cross_mean = float(np.mean([cos[i, j] for j in other])) if other else None
        # nearest neighbor = most-similar OTHER example (any kind)
        nn_idx = max((j for j in range(n) if j != i), key=lambda j: cos[i, j], default=None)
        nn = {"exampleId": ids[nn_idx], "cosine": round(float(cos[i, nn_idx]), 4)} if nn_idx is not None else None
        res[ids[i]] = {
            "intraKindMaxCosine": None if intra_max is None else round(intra_max, 4),
            "meanCrossKindCosine": None if cross_mean is None else round(cross_mean, 4),
            "nearestNeighbor": nn,
        }
    return res


def kmeans_crosscheck(vecs, kinds):
    """Seeded k-means (k = #kinds) cross-check: of the unsupervised clusters, how
    purely do they map to authored kinds? High agreement = the kinds are real visual
    groupings, not labels we imposed."""
    try:
        from scipy.cluster.vq import kmeans2, whiten
        k = len(set(kinds))
        data = l2(vecs)
        cents, labels = kmeans2(data, k, seed=SEED, minit="++", missing="warn")
        # cluster purity: for each cluster, the share of its most common kind
        purities = []
        for c in sorted(set(labels.tolist())):
            members = [kinds[i] for i in range(len(kinds)) if labels[i] == c]
            if members:
                top = max(set(members), key=members.count)
                purities.append(members.count(top) / len(members))
        return {"k": k, "labels": labels.tolist(), "meanClusterPurity": round(float(np.mean(purities)), 4) if purities else None}
    except Exception as e:  # noqa: BLE001
        return {"k": len(set(kinds)), "error": str(e)}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    rows = load_inputs()
    if not rows:
        log("no QA-passed examples to embed — nothing to do")
        ARTIFACT.write_text(json.dumps({"embedder": None, "examples": {}, "batch": {}, "dropped": []}, indent=2), encoding="utf-8")
        return 0

    images, kept, dropped = [], [], []
    for r in rows:
        try:
            img = Image.open(r["png"])
            img.load()
        except Exception as e:  # noqa: BLE001
            dropped.append({"id": r["id"], "reason": f"open failed: {e}"})
            continue
        ok, std = blank_check(img)
        if not ok:
            dropped.append({"id": r["id"], "reason": f"near-uniform frame (std={std:.2f}) — dropped to protect the matrix"})
            continue
        images.append(img.convert("RGB"))
        kept.append(r)
    if dropped:
        for d in dropped:
            log(f"DROPPED {d['id']}: {d['reason']}")
    if not kept:
        log("all candidates dropped by blank-check")
        ARTIFACT.write_text(json.dumps({"embedder": None, "examples": {}, "batch": {}, "dropped": dropped}, indent=2), encoding="utf-8")
        return 0

    ids = [r["id"] for r in kept]
    kinds = [r["kind"] for r in kept]

    try:
        clip_v, dino_v, embedder = embed_transformers(images)
    except Exception as e:  # noqa: BLE001
        log(f"transformers embedder unavailable ({e}); using offline fallback descriptor")
        clip_v, dino_v, embedder = embed_fallback(images)

    # Combined vector = concat(L2(clip), L2(dino)) then L2 — weights structure +
    # semantics equally so 'distinct in BOTH' is what scores as distinct.
    combined = l2(np.concatenate([l2(clip_v), l2(dino_v)], axis=1))
    cos = cosine_matrix(combined)
    cos_clip = cosine_matrix(clip_v)
    cos_dino = cosine_matrix(dino_v)

    per = per_example_metrics(cos, ids, kinds)
    sil = silhouette_by_kind(cos, kinds)
    looks = sublooks(cos, ids, kinds)
    for i, _id in enumerate(ids):
        per[_id]["silhouette"] = round(float(sil[i]), 4)
        per[_id]["subLook"] = looks[_id]

    # batch summary vs the plan's thresholds
    n = len(ids)
    cross_vals, intra_vals = [], []
    for i in range(n):
        for j in range(i + 1, n):
            (cross_vals if kinds[i] != kinds[j] else intra_vals).append(float(cos[i, j]))
    batch = {
        "embedder": embedder,
        "count": n,
        "kinds": sorted(set(kinds)),
        "maxCrossKindCosine": round(max(cross_vals), 4) if cross_vals else None,
        "meanCrossKindCosine": round(float(np.mean(cross_vals)), 4) if cross_vals else None,
        "maxIntraKindCosine": round(max(intra_vals), 4) if intra_vals else None,
        "meanSilhouette": round(float(np.mean(sil)), 4),
        "vendiScore": round(vendi_score(cos), 4),
        "kmeansCrossCheck": kmeans_crosscheck(combined, kinds),
        "thresholds": {
            "maxCrossKindCosine": "<0.70", "meanCrossKindCosine": "<0.55",
            "meanSilhouette": ">=0.35", "vendiScore": ">=8 (full 12-kind set)",
            "maxIntraKindCosine": "<0.75",
        },
        "seed": SEED,
    }
    # closest cross-kind pair (the merge-risk signal: two kinds reading as one)
    if cross_vals:
        worst = None
        for i in range(n):
            for j in range(i + 1, n):
                if kinds[i] != kinds[j] and (worst is None or cos[i, j] > worst["cosine"]):
                    worst = {"a": ids[i], "b": ids[j], "kindA": kinds[i], "kindB": kinds[j], "cosine": round(float(cos[i, j]), 4)}
        batch["closestCrossKindPair"] = worst

    np.savez_compressed(VECTORS_NPZ, ids=np.array(ids), clip=clip_v, dino=dino_v, combined=combined,
                        cos=cos, cos_clip=cos_clip, cos_dino=cos_dino)
    artifact = {
        "note": "Track-B perceptual metrics for the example library. Raw vectors live in embeddings.vectors.npz (regenerable, gitignored) — this file holds only the small per-example + batch metrics that build-index.mjs folds into clusterMetrics. Re-run via run.mjs.",
        "embedder": embedder,
        "labeledBy": f"sidecar:{embedder}",
        "seed": SEED,
        "vectorsArtifact": "embeddings.vectors.npz",
        "examples": per,
        "batch": batch,
        "dropped": dropped,
    }
    ARTIFACT.write_text(json.dumps(artifact, indent=2), encoding="utf-8")

    log(f"embedded {n} examples with [{embedder}]")
    log(f"  maxCrossKind={batch['maxCrossKindCosine']} (target <0.70)  meanCrossKind={batch['meanCrossKindCosine']} (<0.55)")
    log(f"  meanSilhouette={batch['meanSilhouette']} (>=0.35)  vendi={batch['vendiScore']} (>=8 full set)  maxIntraKind={batch['maxIntraKindCosine']} (<0.75)")
    if batch.get("closestCrossKindPair"):
        w = batch["closestCrossKindPair"]
        log(f"  closest cross-kind: {w['kindA']} ~ {w['kindB']} = {w['cosine']}")
    log(f"  wrote {ARTIFACT.name} + {VECTORS_NPZ.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

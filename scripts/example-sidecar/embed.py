#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/embed.py  — Track B, step 2 of the sidecar
# ============================================================================
#  Read the render-report (render-QA-passed PNGs only), embed each with the
#  research doc's validation stack — CLIP ViT-L/14 (semantic / theme / in-image
#  text, the axis Meta's Andromeda shares) + DINOv2 ViT-L/14 (spatial layout /
#  structure) — then compute the "measured spectrum": intra-archetype vs
#  cross-archetype cosine, silhouette over the authored ARCHETYPES, a Vendi
#  diversity score, nearest-neighbor, and a seeded clustering cross-check.
#
#  Vocabulary: ARCHETYPE = the category; CLUSTER = the embedding grouping its
#  examples form. The metrics here describe how well each archetype clusters.
#
#  Two correctness rules the contract assumes are enforced HERE:
#    • SEED everything (numpy + scipy kmeans) so assignments are stable run-to-run.
#    • Embed ONLY non-blank, QA-passed frames — a near-uniform (black/blank) still
#      is dropped before it can poison the matrix.
#
#  Doc thresholds applied (Part 6): max within-archetype < 0.85, mean within < 0.75,
#  mean cross < 0.55, max cross < 0.70, silhouette >= 0.35, Vendi >= 8 (12 archetypes).
#
#  Big vectors stay OUT of the index: raw embeddings + the full cosine matrix →
#  embeddings.vectors.npz (gitignored). The SMALL metrics + an archetype-ordered
#  cosine matrix (for the viewer heatmap) + a 2D projection (for the scatter) →
#  embeddings.artifact.json, which build-index.mjs folds into clusterMetrics and the
#  viewer reads for the cluster visuals.
#
#  Primary embedder = transformers CLIP-L/14 + DINOv2-large (CPU ok). If the weights
#  can't be loaded (offline), it FALLS BACK to a deterministic structural descriptor
#  so the loop still completes — the artifact records which embedder ran.
#
#  Usage:  python embed.py        (paths resolved relative to this file)
#  New file (Track B). Reads only sidecar inputs; writes only sidecar outputs.
# ============================================================================

import json
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

# CLI: `--format=static|video` embeds only that format's examples; `--out=<name>`
# names the artifact (video runs in a SEPARATE pass so a GIF poster — which ≈ its
# static sibling by design — doesn't inflate the static within-archetype cosine).
def _arg(flag, default=None):
    pre = f"--{flag}="
    for a in sys.argv[1:]:
        if a.startswith(pre):
            return a[len(pre):]
    return default

FORMAT_FILTER = _arg("format")  # None = all formats (back-compat)
_out = _arg("out") or ("embeddings.video.artifact.json" if FORMAT_FILTER == "video" else "embeddings.artifact.json")
VECTORS_NPZ = HERE / ("embeddings.video.vectors.npz" if FORMAT_FILTER == "video" else "embeddings.vectors.npz")
ARTIFACT = HERE / _out

CLIP_MODEL = "openai/clip-vit-large-patch14"
DINO_MODEL = "facebook/dinov2-large"

BLANK_STD_THRESHOLD = 4.0   # grayscale std below this = near-uniform (blank) → dropped
SUBLOOK_COSINE = 0.85       # examples of one archetype closer than this share a sub-look

# Doc Part-6 thresholds (for the artifact's pass/fail readout)
THRESHOLDS = {
    "maxWithinArchetypeCosine": "<0.85",
    "meanWithinArchetypeCosine": "<0.75",
    "meanCrossArchetypeCosine": "<0.55",
    "maxCrossArchetypeCosine": "<0.70",
    "meanSilhouette": ">=0.35",
    "vendiScore": ">=8 (full 12-archetype set)",
}


def log(msg):
    sys.stderr.write(f"[embed] {msg}\n")
    sys.stderr.flush()


# ---------------------------------------------------------------------------
# Inputs
# ---------------------------------------------------------------------------
def load_inputs():
    report = json.loads(RENDER_REPORT.read_text(encoding="utf-8"))
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    by_id = {e["id"]: e for e in manifest["examples"]}
    rows = []
    for r in report["results"]:
        if not r.get("ok") or not r.get("png"):
            continue
        ex = by_id.get(r["id"], {})
        if FORMAT_FILTER and ex.get("format") != FORMAT_FILTER:
            continue
        rows.append({"id": r["id"], "png": str(ROOT / r["png"]), "archetype": ex.get("archetype", "?")})
    return rows


def blank_check(img):
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
    """CLIP-L/14 + DINOv2-large via HuggingFace transformers, CPU. Raises on any
    load/inference failure so the caller can fall back."""
    import torch
    from transformers import CLIPModel, CLIPProcessor, AutoModel, AutoImageProcessor

    torch.manual_seed(SEED)
    device = "cpu"
    log(f"loading CLIP {CLIP_MODEL} …")
    clip = CLIPModel.from_pretrained(CLIP_MODEL).to(device).eval()
    clip_proc = CLIPProcessor.from_pretrained(CLIP_MODEL)
    log(f"loading DINOv2 {DINO_MODEL} …")
    dino = AutoModel.from_pretrained(DINO_MODEL).to(device).eval()
    dino_proc = AutoImageProcessor.from_pretrained(DINO_MODEL)

    clip_vecs, dino_vecs = [], []
    with torch.no_grad():
        for img in images:
            ci = clip_proc(images=img, return_tensors="pt").to(device)
            clip_vecs.append(clip.get_image_features(**ci)[0].cpu().numpy())
            di = dino_proc(images=img, return_tensors="pt").to(device)
            out = dino(**di).last_hidden_state[:, 0, :]  # CLS token = global structure
            dino_vecs.append(out[0].cpu().numpy())
    return np.array(clip_vecs, dtype=np.float32), np.array(dino_vecs, dtype=np.float32), f"{CLIP_MODEL} + {DINO_MODEL}"


def embed_fallback(images):
    """Deterministic structural descriptor (offline fallback): a coarse grayscale
    layout grid (structure proxy) + an RGB color histogram (palette proxy). Real but
    weaker than CLIP/DINOv2 — enough to prove the loop without network."""
    layout, color = [], []
    for img in images:
        g = np.asarray(img.convert("L").resize((16, 28)), dtype=np.float32).flatten() / 255.0
        layout.append(g)
        rgb = np.asarray(img.convert("RGB").resize((64, 64)), dtype=np.float32)
        hist = np.concatenate([np.histogram(rgb[:, :, c], bins=16, range=(0, 255))[0] for c in range(3)]).astype(np.float32)
        hist /= hist.sum() or 1.0
        color.append(hist)
    return np.array(color, dtype=np.float32), np.array(layout, dtype=np.float32), "FALLBACK:grayscale-layout+rgb-hist"


# ---------------------------------------------------------------------------
# Metrics
# ---------------------------------------------------------------------------
def cosine_matrix(vecs):
    v = l2(vecs)
    return np.clip(v @ v.T, -1.0, 1.0)


def vendi_score(cos):
    n = cos.shape[0]
    if n == 0:
        return 0.0
    K = (cos + cos.T) / 2.0 / n
    w = np.linalg.eigvalsh(K)
    w = w[w > 1e-12]
    if w.size == 0:
        return 1.0
    return float(np.exp(-np.sum(w * np.log(w))))


def silhouette_by_archetype(cos, archetypes):
    """Per-sample silhouette using AUTHORED archetypes as the grouping, cosine-distance.
    Answers 'are the archetypes actually separated in embedding space?'. Singleton
    archetypes get a(i)=0. No sklearn dependency."""
    dist = 1.0 - cos
    n = len(archetypes)
    uniq = sorted(set(archetypes))
    idx = {a: [i for i in range(n) if archetypes[i] == a] for a in uniq}
    sil = np.zeros(n, dtype=np.float64)
    for i in range(n):
        same = [j for j in idx[archetypes[i]] if j != i]
        a = float(np.mean([dist[i, j] for j in same])) if same else 0.0
        b = np.inf
        for k in uniq:
            if k == archetypes[i]:
                continue
            b = min(b, float(np.mean([dist[i, j] for j in idx[k]])))
        sil[i] = 0.0 if (a == 0 and b == np.inf) else ((b - a) / max(a, b) if max(a, b) > 0 else 0.0)
    return sil


def sublooks(cos, ids, archetypes):
    """Within each archetype, single-linkage group examples whose cosine >= SUBLOOK_COSINE
    (near-twins share a sub-look). Returns {id: '<archetype>-<a|b|c>'}; >=3 distinct
    groups per archetype is the depth target."""
    out = {}
    by = {}
    for i, a in enumerate(archetypes):
        by.setdefault(a, []).append(i)
    for a, members in by.items():
        parent = {i: i for i in members}

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for ai in range(len(members)):
            for bi in range(ai + 1, len(members)):
                ia, ib = members[ai], members[bi]
                if cos[ia, ib] >= SUBLOOK_COSINE:
                    parent[find(ia)] = find(ib)
        roots, letters = {}, "abcdefghijklmnop"
        for i in members:
            r = find(i)
            if r not in roots:
                roots[r] = letters[len(roots)]
            out[ids[i]] = f"{a}-{roots[r]}"
    return out


def per_example_metrics(cos, ids, archetypes):
    n = len(ids)
    res = {}
    for i in range(n):
        same = [j for j in range(n) if j != i and archetypes[j] == archetypes[i]]
        other = [j for j in range(n) if archetypes[j] != archetypes[i]]
        intra_max = float(max(cos[i, j] for j in same)) if same else None
        cross_mean = float(np.mean([cos[i, j] for j in other])) if other else None
        nn_idx = max((j for j in range(n) if j != i), key=lambda j: cos[i, j], default=None)
        nn = {"exampleId": ids[nn_idx], "cosine": round(float(cos[i, nn_idx]), 4)} if nn_idx is not None else None
        res[ids[i]] = {
            "intraArchetypeMaxCosine": None if intra_max is None else round(intra_max, 4),
            "meanCrossArchetypeCosine": None if cross_mean is None else round(cross_mean, 4),
            "nearestNeighbor": nn,
        }
    return res


def per_archetype_health(cos, ids, archetypes):
    """For the viewer health row: per archetype, max/mean within + worst cross neighbor."""
    n = len(ids)
    by = {}
    for i, a in enumerate(archetypes):
        by.setdefault(a, []).append(i)
    out = {}
    for a, members in by.items():
        within = [cos[i, j] for x, i in enumerate(members) for j in members[x + 1:]]
        # worst cross pair: highest similarity to any example of another archetype
        worst_cross, worst_with = None, None
        for i in members:
            for j in range(n):
                if archetypes[j] != a and (worst_cross is None or cos[i, j] > worst_cross):
                    worst_cross, worst_with = float(cos[i, j]), archetypes[j]
        out[a] = {
            "count": len(members),
            "maxWithin": round(float(max(within)), 4) if within else None,
            "meanWithin": round(float(np.mean(within)), 4) if within else None,
            "maxCrossNeighbor": None if worst_cross is None else {"cosine": round(worst_cross, 4), "archetype": worst_with},
        }
    return out


def kmeans_crosscheck(vecs, archetypes):
    try:
        from scipy.cluster.vq import kmeans2
        k = len(set(archetypes))
        data = l2(vecs)
        _, labels = kmeans2(data, k, seed=SEED, minit="++", missing="warn")
        purities = []
        for c in sorted(set(labels.tolist())):
            members = [archetypes[i] for i in range(len(archetypes)) if labels[i] == c]
            if members:
                top = max(set(members), key=members.count)
                purities.append(members.count(top) / len(members))
        return {"k": k, "meanClusterPurity": round(float(np.mean(purities)), 4) if purities else None}
    except Exception as e:  # noqa: BLE001
        return {"k": len(set(archetypes)), "error": str(e)}


def project_2d(vecs, ids, archetypes):
    """2D map for the scatter: UMAP if installed, else PCA-2D via numpy SVD (seeded,
    dependency-free)."""
    n = len(ids)
    # 0/1 points can't be projected to 2D (SVD yields <2 components). Place them at
    # center — the scatter is meaningless at this size anyway. (Keeps an incremental
    # 1-example video pass from crashing.)
    if n < 2:
        return "trivial", [{"id": ids[i], "archetype": archetypes[i], "x": 0.5, "y": 0.5} for i in range(n)]
    data = l2(vecs)
    method = "pca"
    try:
        import umap  # noqa: F401
        reducer = umap.UMAP(n_neighbors=min(15, max(2, len(ids) - 1)), min_dist=0.1, metric="cosine", random_state=SEED)
        xy = reducer.fit_transform(data)
        method = "umap"
    except Exception:  # noqa: BLE001
        c = data - data.mean(axis=0, keepdims=True)
        _, _, vt = np.linalg.svd(c, full_matrices=False)
        xy = c @ vt[:2].T
    xy = np.asarray(xy, dtype=float)
    if xy.ndim == 1:
        xy = xy.reshape(-1, 1)
    if xy.shape[1] < 2:  # only 1 principal component (e.g. 2 points) → pad a zero column
        xy = np.hstack([xy, np.zeros((xy.shape[0], 2 - xy.shape[1]))])
    # normalize to a friendly range for plotting
    if xy.shape[0] > 1:
        mn, mx = xy.min(axis=0), xy.max(axis=0)
        span = np.where((mx - mn) == 0, 1, mx - mn)
        xy = (xy - mn) / span
    return method, [{"id": ids[i], "archetype": archetypes[i], "x": round(float(xy[i, 0]), 4), "y": round(float(xy[i, 1]), 4)} for i in range(len(ids))]


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
            img = Image.open(r["png"]); img.load()
        except Exception as e:  # noqa: BLE001
            dropped.append({"id": r["id"], "reason": f"open failed: {e}"}); continue
        ok, std = blank_check(img)
        if not ok:
            dropped.append({"id": r["id"], "reason": f"near-uniform frame (std={std:.2f}) — dropped to protect the matrix"}); continue
        images.append(img.convert("RGB")); kept.append(r)
    for d in dropped:
        log(f"DROPPED {d['id']}: {d['reason']}")
    if not kept:
        log("all candidates dropped by blank-check")
        ARTIFACT.write_text(json.dumps({"embedder": None, "examples": {}, "batch": {}, "dropped": dropped}, indent=2), encoding="utf-8")
        return 0

    ids = [r["id"] for r in kept]
    archetypes = [r["archetype"] for r in kept]

    try:
        clip_v, dino_v, embedder = embed_transformers(images)
    except Exception as e:  # noqa: BLE001
        log(f"transformers embedder unavailable ({e}); using offline fallback descriptor")
        clip_v, dino_v, embedder = embed_fallback(images)

    combined = l2(np.concatenate([l2(clip_v), l2(dino_v)], axis=1))
    cos = cosine_matrix(combined)

    per = per_example_metrics(cos, ids, archetypes)
    sil = silhouette_by_archetype(cos, archetypes)
    looks = sublooks(cos, ids, archetypes)
    for i, _id in enumerate(ids):
        per[_id]["silhouette"] = round(float(sil[i]), 4)
        per[_id]["subLook"] = looks[_id]

    n = len(ids)
    cross_vals, within_vals = [], []
    for i in range(n):
        for j in range(i + 1, n):
            (within_vals if archetypes[i] == archetypes[j] else cross_vals).append(float(cos[i, j]))

    # closest cross-archetype pair = the merge-risk signal (two archetypes reading as one)
    worst = None
    for i in range(n):
        for j in range(i + 1, n):
            if archetypes[i] != archetypes[j] and (worst is None or cos[i, j] > worst["cosine"]):
                worst = {"a": ids[i], "b": ids[j], "archetypeA": archetypes[i], "archetypeB": archetypes[j], "cosine": round(float(cos[i, j]), 4)}

    batch = {
        "embedder": embedder,
        "count": n,
        "archetypes": sorted(set(archetypes)),
        "maxCrossArchetypeCosine": round(max(cross_vals), 4) if cross_vals else None,
        "meanCrossArchetypeCosine": round(float(np.mean(cross_vals)), 4) if cross_vals else None,
        "maxIntraArchetypeCosine": round(max(within_vals), 4) if within_vals else None,
        "meanWithinArchetypeCosine": round(float(np.mean(within_vals)), 4) if within_vals else None,
        "meanSilhouette": round(float(np.mean(sil)), 4),
        "vendiScore": round(vendi_score(cos), 4),
        "kmeansCrossCheck": kmeans_crosscheck(combined, archetypes),
        "perArchetype": per_archetype_health(cos, ids, archetypes),
        "closestCrossArchetypePair": worst,
        "thresholds": THRESHOLDS,
        "seed": SEED,
    }

    # Archetype-ordered cosine matrix for the viewer heatmap (green diagonal blocks).
    order = sorted(range(n), key=lambda i: (archetypes[i], ids[i]))
    o_ids = [ids[i] for i in order]
    o_arch = [archetypes[i] for i in order]
    o_cos = cos[np.ix_(order, order)]
    boundaries = [k for k in range(1, n) if o_arch[k] != o_arch[k - 1]]
    heatmap = {
        "order": o_ids,
        "archetypes": o_arch,
        "matrix": [[round(float(o_cos[r, c]), 4) for c in range(n)] for r in range(n)],
        "boundaries": boundaries,
    }
    proj_method, projection = project_2d(combined, ids, archetypes)

    np.savez_compressed(VECTORS_NPZ, ids=np.array(ids), clip=clip_v, dino=dino_v, combined=combined, cos=cos)
    artifact = {
        "note": "Track-B perceptual metrics. Raw vectors + full matrix live in embeddings.vectors.npz (gitignored). This file holds the per-example + batch metrics build-index.mjs folds into clusterMetrics, plus an archetype-ordered cosine matrix (heatmap) and a 2D projection the viewer reads. Re-run via run.mjs.",
        "embedder": embedder,
        "labeledBy": f"sidecar:{embedder}",
        "seed": SEED,
        "vectorsArtifact": "embeddings.vectors.npz",
        "examples": per,
        "batch": batch,
        "heatmap": heatmap,
        "projection2d": {"method": proj_method, "points": projection},
        "dropped": dropped,
    }
    ARTIFACT.write_text(json.dumps(artifact, indent=2), encoding="utf-8")

    log(f"embedded {n} examples with [{embedder}]")
    log(f"  maxCross={batch['maxCrossArchetypeCosine']} (<0.70)  meanCross={batch['meanCrossArchetypeCosine']} (<0.55)")
    log(f"  maxWithin={batch['maxIntraArchetypeCosine']} (<0.85)  meanWithin={batch['meanWithinArchetypeCosine']} (<0.75)")
    log(f"  silhouette={batch['meanSilhouette']} (>=0.35)  vendi={batch['vendiScore']} (>=8 full set)  proj={proj_method}")
    if worst:
        log(f"  closest cross-archetype: {worst['archetypeA']} ~ {worst['archetypeB']} = {worst['cosine']}")
    log(f"  wrote {ARTIFACT.name} + {VECTORS_NPZ.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

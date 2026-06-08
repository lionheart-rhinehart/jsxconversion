#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/build_centroids.py — per-archetype example centroids
# ============================================================================
#  The foundation for cluster-adherence (#15): a campaign output "lands in its lane"
#  iff its embedding is closest to the centroid of the archetype it was ASSIGNED.
#  Re-embedding 109 examples per campaign is the torch-on-Windows leak risk, so we
#  compute the centroids ONCE here from the already-embedded example vectors
#  (embeddings.vectors.npz + embeddings.video.vectors.npz) and persist them.
#
#  A centroid is keyed by (archetype, FORMAT) and is l2(mean(l2(combined[members]))).
#  Static and video are kept SEPARATE — a video poster ≈ its static sibling by design,
#  so mixing them would blur the lanes. The centroids are EMBEDDER-TAGGED: the campaign
#  sidecar must refuse to compare a fallback-embedded output against these (different
#  vector space → garbage cosine).
#
#  Usage:
#    python build_centroids.py            (writes templates/_archetype-centroids.{npz,json})
#    python build_centroids.py --selfcheck  (asserts every centroid is unit-norm)
#  Reads the committed example vectors; does NOT re-embed.
# ============================================================================

import json
import sys
from pathlib import Path

import numpy as np

from embed_core import l2

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
INDEX = ROOT / "templates" / "_example-index.json"
OUT_NPZ = ROOT / "templates" / "_archetype-centroids.npz"
OUT_JSON = ROOT / "templates" / "_archetype-centroids.json"

SOURCES = [
    ("static", HERE / "embeddings.vectors.npz", HERE / "embeddings.artifact.json"),
    ("video", HERE / "embeddings.video.vectors.npz", HERE / "embeddings.video.artifact.json"),
]


def log(msg):
    sys.stderr.write(f"[centroids] {msg}\n")
    sys.stderr.flush()


def main():
    selfcheck = "--selfcheck" in sys.argv[1:]
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    examples = index.get("examples", {})
    arch_of = {eid: e.get("archetype") for eid, e in examples.items()}

    archetypes, formats, centroids, rows = [], [], [], []
    embedder = None

    for fmt, npz_path, artifact_path in SOURCES:
        if not npz_path.exists():
            log(f"WARNING: {npz_path.name} missing — skipping {fmt} centroids")
            continue
        d = np.load(npz_path, allow_pickle=True)
        ids = [str(x) for x in d["ids"]]
        combined = np.asarray(d["combined"], dtype=np.float32)
        # embedder tag — every source must agree (same CLIP+DINO run)
        emb = json.loads(artifact_path.read_text(encoding="utf-8")).get("embedder") if artifact_path.exists() else None
        if embedder is None:
            embedder = emb
        elif emb and emb != embedder:
            log(f"FATAL: embedder mismatch across sources ({embedder!r} vs {emb!r}) — vectors live in different spaces")
            return 2
        if emb and "FALLBACK" in emb:
            log(f"FATAL: {fmt} vectors were FALLBACK-embedded ({emb}) — not a real CLIP/DINOv2 space; refuse to build centroids")
            return 2

        # group example rows by archetype (from the index, the authority — never the slug)
        groups = {}
        for i, eid in enumerate(ids):
            a = arch_of.get(eid)
            if not a:
                log(f"  skip {eid}: no archetype in index")
                continue
            groups.setdefault(a, []).append(i)

        for a in sorted(groups):
            members = groups[a]
            vecs = l2(combined[members])                 # re-normalize each member
            centroid = l2(np.mean(vecs, axis=0, keepdims=True))[0]  # mean then unit
            archetypes.append(a)
            formats.append(fmt)
            centroids.append(centroid.astype(np.float32))
            rows.append({
                "archetype": a, "format": fmt, "count": len(members),
                "norm": round(float(np.linalg.norm(centroid)), 6),
                "memberIds": [ids[i] for i in members],
            })

    if not centroids:
        log("no centroids built (no source vectors found)")
        return 2

    C = np.vstack(centroids).astype(np.float32)
    dim = int(C.shape[1])

    if selfcheck:
        norms = np.linalg.norm(C, axis=1)
        bad = int(np.sum(np.abs(norms - 1.0) > 1e-4))
        log(f"selfcheck: {len(rows)} centroids, dim={dim}, embedder={embedder}, non-unit={bad}")
        assert bad == 0, "every centroid must be unit-norm"
        log("selfcheck OK")
        return 0

    np.savez_compressed(
        OUT_NPZ,
        archetypes=np.array(archetypes), formats=np.array(formats),
        centroids=C, embedder=np.array(embedder or "unknown"), dim=np.array(dim), seed=np.array(42),
    )
    OUT_JSON.write_text(json.dumps({
        "note": "Per-(archetype, format) example centroids for cluster-adherence (#15). Vectors live in _archetype-centroids.npz; this is the human-readable manifest. Built by build_centroids.py from the example embeddings — NOT hand-edited.",
        "embedder": embedder, "dim": dim, "seed": 42, "count": len(rows),
        "centroids": rows,
    }, indent=2), encoding="utf-8")

    by_fmt = {}
    for r in rows:
        by_fmt[r["format"]] = by_fmt.get(r["format"], 0) + 1
    log(f"wrote {len(rows)} centroids ({by_fmt}) dim={dim} embedder=[{embedder}]")
    log(f"  → {OUT_NPZ.relative_to(ROOT)} + {OUT_JSON.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

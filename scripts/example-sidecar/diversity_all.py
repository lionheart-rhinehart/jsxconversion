#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/diversity_all.py — unified 109-example diversity + similarity map
# ============================================================================
#  The per-format embed passes (static 45 + video 64) are intentionally SEPARATE (a GIF
#  poster ≈ its static sibling would inflate within-archetype cosine), so the index's
#  `diversity` header reads count:45 — correct for the static pass, stale as a whole-set
#  number. This is the ADDITIVE unified view over all 109: the cross-archetype SIMILARITY
#  MAP (the selection-time distinctness selector's INPUT — e.g. giant-stat ~ metric-reveal)
#  + a whole-set diversity block. Does NOT overwrite the index's per-pass diversity.
#
#  Reads  embeddings.vectors.npz + embeddings.video.vectors.npz + _example-index.json
#  Writes templates/_similarity-map.json  { count, embedder, archetypePairs[], diversityAll{} }
#  Usage: python diversity_all.py [--selfcheck]
# ============================================================================

import json
import sys
from pathlib import Path

import numpy as np

from embed_core import l2, cosine_matrix

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
INDEX = ROOT / "templates" / "_example-index.json"
OUT = ROOT / "templates" / "_similarity-map.json"
SOURCES = [
    (HERE / "embeddings.vectors.npz", HERE / "embeddings.artifact.json"),
    (HERE / "embeddings.video.vectors.npz", HERE / "embeddings.video.artifact.json"),
]


def log(m):
    sys.stderr.write(f"[diversity-all] {m}\n"); sys.stderr.flush()


def vendi(cos):
    n = cos.shape[0]
    if n == 0:
        return 0.0
    K = (cos + cos.T) / 2.0 / n
    w = np.linalg.eigvalsh(K)
    w = w[w > 1e-12]
    return float(np.exp(-np.sum(w * np.log(w)))) if w.size else 1.0


def main():
    selfcheck = "--selfcheck" in sys.argv[1:]
    arch_of = {eid: e.get("archetype") for eid, e in json.loads(INDEX.read_text(encoding="utf-8")).get("examples", {}).items()}

    ids, combined, embedder = [], [], None
    for npz_path, art_path in SOURCES:
        if not npz_path.exists():
            log(f"WARNING: {npz_path.name} missing — skipping"); continue
        d = np.load(npz_path, allow_pickle=True)
        ids.extend(str(x) for x in d["ids"])
        combined.append(np.asarray(d["combined"], dtype=np.float32))
        emb = json.loads(art_path.read_text(encoding="utf-8")).get("embedder") if art_path.exists() else None
        embedder = embedder or emb
    if not combined:
        log("no source vectors"); return 2
    C = l2(np.vstack(combined))
    arch = [arch_of.get(i) for i in ids]
    cos = cosine_matrix(C)
    n = len(ids)

    # cross-archetype pair means — the selector's similarity map (high pair = "don't run both")
    by_arch = {}
    for i, a in enumerate(arch):
        if a:
            by_arch.setdefault(a, []).append(i)
    names = sorted(by_arch)
    pairs, cross_vals = [], []
    for ai in range(len(names)):
        for bi in range(ai + 1, len(names)):
            a, b = names[ai], names[bi]
            vals = [float(cos[i, j]) for i in by_arch[a] for j in by_arch[b]]
            m = round(float(np.mean(vals)), 4)
            pairs.append({"a": a, "b": b, "cosine": m})
            cross_vals.append(m)
    pairs.sort(key=lambda p: -p["cosine"])

    diversity_all = {
        "count": n,
        "vendi": round(vendi(cos), 4),
        "meanCrossArchetype": round(float(np.mean(cross_vals)), 4) if cross_vals else None,
        "maxCrossArchetype": pairs[0] if pairs else None,
    }
    if selfcheck:
        assert np.allclose(cos, cos.T, atol=1e-5), "cosine matrix must be symmetric"
        assert abs(float(np.mean(np.diag(cos))) - 1.0) < 1e-3, "diagonal ≈ 1"
        log(f"selfcheck OK: {n} examples, {len(pairs)} archetype pairs, vendi {diversity_all['vendi']}")
        return 0

    OUT.write_text(json.dumps({
        "note": "Additive unified view over ALL examples (the index's per-pass `diversity` stays as-is). archetypePairs = the cross-archetype SIMILARITY MAP, the selection-time distinctness selector's input (high pair = don't run both in one segment). Built by diversity_all.py.",
        "count": n, "embedder": embedder,
        "diversityAll": diversity_all,
        "archetypePairs": pairs,
    }, indent=2), encoding="utf-8")
    log(f"wrote {OUT.relative_to(ROOT)}: {n} examples, {len(pairs)} pairs, vendi {diversity_all['vendi']}, top pair {pairs[0] if pairs else None}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

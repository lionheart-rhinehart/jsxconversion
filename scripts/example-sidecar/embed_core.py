#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/embed_core.py — the shared perceptual-embed core
# ============================================================================
#  The PURE embedding primitives, extracted so BOTH sides of the perceptual
#  pipeline use the IDENTICAL vector space:
#    • embed.py            — embeds the EXAMPLE library (Track B).
#    • embed_campaign.py   — embeds a campaign's RENDERED OUTPUTS (Track A, #14/#15).
#    • build_centroids.py  — per-archetype centroids from the example vectors.
#  If the two sides used different `combine` orderings, a campaign output's cosine
#  to an archetype centroid would be garbage. Keeping `combine`/`l2` HERE makes that
#  impossible. CLIP-L/14 (semantic) + DINOv2-L (structure); seeded; CPU ok.
#
#  Module name uses an underscore (embed_core) so it is importable.
# ============================================================================

import sys
import numpy as np
from PIL import Image

SEED = 42
CLIP_MODEL = "openai/clip-vit-large-patch14"
DINO_MODEL = "facebook/dinov2-large"
BLANK_STD_THRESHOLD = 4.0   # grayscale std below this = near-uniform (blank) → drop


def log(msg, tag="embed-core"):
    sys.stderr.write(f"[{tag}] {msg}\n")
    sys.stderr.flush()


def l2(mat):
    """Row-wise L2 normalize (zero rows left as zero)."""
    n = np.linalg.norm(mat, axis=1, keepdims=True)
    n[n == 0] = 1.0
    return mat / n


def combine(clip_v, dino_v):
    """The CANONICAL combined vector — must be byte-for-byte the same operation on
    BOTH the example side and the campaign side: l2(concat(l2(clip), l2(dino)))."""
    return l2(np.concatenate([l2(clip_v), l2(dino_v)], axis=1))


def cosine_matrix(vecs):
    v = l2(vecs)
    return np.clip(v @ v.T, -1.0, 1.0)


def blank_check(img):
    """True if the image is NOT near-uniform (safe to embed). A black/blank frame
    poisons the matrix, so it is dropped before embedding."""
    g = np.asarray(img.convert("L"), dtype=np.float32)
    return float(g.std()) >= BLANK_STD_THRESHOLD, float(g.std())


def load_image_rgb(path):
    """Open + fully load an image as RGB. Returns the PIL image or None on failure."""
    try:
        img = Image.open(path)
        img.load()
        return img.convert("RGB")
    except Exception:  # noqa: BLE001
        return None


def embed_transformers(images):
    """CLIP-L/14 + DINOv2-large via HuggingFace transformers, CPU. Raises on any
    load/inference failure so the caller can fall back. (Verbatim from embed.py.)"""
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
    layout grid (structure proxy) + an RGB color histogram (palette proxy). A
    DIFFERENT vector space than CLIP/DINOv2 — callers must refuse to mix the two
    (centroids built from real embeddings vs a fallback campaign vector = garbage
    cosine). (Verbatim from embed.py.)"""
    layout, color = [], []
    for img in images:
        g = np.asarray(img.convert("L").resize((16, 28)), dtype=np.float32).flatten() / 255.0
        layout.append(g)
        rgb = np.asarray(img.convert("RGB").resize((64, 64)), dtype=np.float32)
        hist = np.concatenate([np.histogram(rgb[:, :, c], bins=16, range=(0, 255))[0] for c in range(3)]).astype(np.float32)
        hist /= hist.sum() or 1.0
        color.append(hist)
    return np.array(color, dtype=np.float32), np.array(layout, dtype=np.float32), "FALLBACK:grayscale-layout+rgb-hist"


def embed_images(images):
    """Try the real transformers embedder; on any failure fall back. Returns
    (clip_v, dino_v, combined, embedder_label)."""
    try:
        clip_v, dino_v, embedder = embed_transformers(images)
    except Exception as e:  # noqa: BLE001
        log(f"transformers embedder unavailable ({e}); using offline fallback descriptor")
        clip_v, dino_v, embedder = embed_fallback(images)
    return clip_v, dino_v, combine(clip_v, dino_v), embedder

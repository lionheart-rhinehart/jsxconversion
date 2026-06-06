#!/usr/bin/env python3
# EXPERIMENT: embed the 7 pure-graphic ORIGINALS, their MEDIA-ADDED variants, and a
# photo reference (action-hero), with the SAME CLIP-L/14 + DINOv2-L stack, then report:
#   1) variant-vs-variant cosines (did adding the same photo collapse them together?)
#   2) each variant vs its own original (how much did adding media move it?)
#   3) variants vs the photo reference (do they now read like the photo design?)
import sys, warnings
from pathlib import Path
import numpy as np
from PIL import Image
warnings.filterwarnings("ignore")

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent.parent
EX = ROOT / "templates" / "_examples"
OUT = ROOT / "out"
IDS = ["ex-001-giant-stat", "ex-002-metric-reveal", "ex-003-kinetic-text", "ex-004-quote-card", "ex-008-list-steps", "ex-014-timeline-schedule", "ex-015-benefit-iconrow"]

def l2(m):
    n = np.linalg.norm(m, axis=1, keepdims=True); n[n == 0] = 1; return m / n

def load_models():
    import torch
    from transformers import CLIPModel, CLIPProcessor, AutoModel, AutoImageProcessor
    torch.manual_seed(42)
    clip = CLIPModel.from_pretrained("openai/clip-vit-large-patch14").eval()
    cp = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")
    dino = AutoModel.from_pretrained("facebook/dinov2-large").eval()
    dp = AutoImageProcessor.from_pretrained("facebook/dinov2-large")
    def emb(path):
        img = Image.open(path).convert("RGB")
        with torch.no_grad():
            c = clip.get_image_features(**cp(images=img, return_tensors="pt"))[0].numpy()
            d = dino(**dp(images=img, return_tensors="pt")).last_hidden_state[:, 0, :][0].numpy()
        return np.concatenate([c / (np.linalg.norm(c) or 1), d / (np.linalg.norm(d) or 1)])
    return emb

def main():
    emb = load_models()
    names, vecs = [], []
    def add(label, path):
        if not Path(path).exists():
            print(f"MISSING {path}"); return
        names.append(label); vecs.append(emb(path))
    for i in IDS:
        add(i.replace("ex-0", "").split("-", 1)[1] + "·orig", EX / f"{i}.png")
        add(i.replace("ex-0", "").split("-", 1)[1] + "·+PHOTO", OUT / f"{i}-bg.png")
    add("action-hero(ref photo)", EX / "ex-010-action-hero.png")
    V = l2(np.array(vecs)); C = np.clip(V @ V.T, -1, 1); n = len(names)

    short = {nm: nm[:16] for nm in names}
    bg_idx = [k for k, nm in enumerate(names) if "+PHOTO" in nm]
    print("\n=== 1) MEDIA-ADDED variants vs each other (did the same photo collapse them?) ===")
    print("    (every pair should stay < 0.70 to keep 15 distinct designs)")
    pairs = [(C[a, b], names[a], names[b]) for ai, a in enumerate(bg_idx) for b in bg_idx[ai+1:]]
    pairs.sort(reverse=True)
    for v, a, b in pairs:
        flag = "  <-- >=0.70 COLLAPSE" if v >= 0.70 else ""
        print(f"  {v:.3f}  {short[a]:<16} ~ {short[b]:<16}{flag}")
    mx = max(p[0] for p in pairs)
    print(f"  MAX variant-vs-variant = {mx:.3f}  -> {'COLLAPSE: adding media DID merge designs' if mx>=0.70 else 'OK: still distinct (<0.70)'}")

    print("\n=== 2) each design: original vs +PHOTO (how far did adding media move it?) ===")
    for i in IDS:
        base = i.split("-", 2)[2]
        oi = next(k for k, nm in enumerate(names) if nm == base + "·orig")
        bi = next(k for k, nm in enumerate(names) if nm == base + "·+PHOTO")
        print(f"  {base:<18} orig↔+photo = {C[oi,bi]:.3f}")

    print("\n=== 3) +PHOTO variants vs the photo reference (action-hero) ===")
    ri = names.index("action-hero(ref photo)")
    for k in bg_idx:
        print(f"  {short[names[k]]:<16} ~ action-hero = {C[k,ri]:.3f}")

    # his exact example
    ki = names.index("kinetic-text·+PHOTO"); qi = names.index("quote-card·+PHOTO")
    ko = names.index("kinetic-text·orig"); qo = names.index("quote-card·orig")
    print("\n=== HIS EXAMPLE: kinetic-text vs quote-card ===")
    print(f"  no media (current):   {C[ko,qo]:.3f}")
    print(f"  same photo behind both: {C[ki,qi]:.3f}  -> {'SAME CREATIVE (>=0.70)' if C[ki,qi]>=0.70 else 'still distinct (<0.70)'}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# T2: does facility/equipment imagery sit in a DIFFERENT embedding region than athletes?
# Embed an athlete pool + a facility pool (combined CLIP-L/14 + DINOv2-L), compare
# mean within-athlete vs within-facility vs cross. If cross < within, facility is a
# distinct region -> using it diversifies the set rather than collapsing it.
import warnings
from pathlib import Path
import numpy as np
from PIL import Image
warnings.filterwarnings("ignore")

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent.parent
NAMED = ROOT / "brand" / "aa-design-system" / "project" / "assets"
FAC = HERE / "facility"
ATHLETE = ["photo-jump-male.jpg", "photo-agility-female.jpg", "photo-box-jump.jpg", "photo-lifting.jpg", "photo-medball-female.jpg"]
FACILITY = ["fac-gym.png", "fac-weights.png", "fac-agility.png"]

def l2(v): n = np.linalg.norm(v); return v / (n or 1.0)

def main():
    import torch
    from transformers import CLIPModel, CLIPProcessor, AutoModel, AutoImageProcessor
    torch.manual_seed(42)
    clip = CLIPModel.from_pretrained("openai/clip-vit-large-patch14").eval()
    cp = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")
    dino = AutoModel.from_pretrained("facebook/dinov2-large").eval()
    dp = AutoImageProcessor.from_pretrained("facebook/dinov2-large")
    def emb(p):
        img = Image.open(p).convert("RGB")
        with torch.no_grad():
            c = l2(clip.get_image_features(**cp(images=img, return_tensors="pt"))[0].numpy())
            d = l2(dino(**dp(images=img, return_tensors="pt")).last_hidden_state[:, 0, :][0].numpy())
        return l2(np.concatenate([c, d]))
    A = [emb(NAMED / n) for n in ATHLETE]
    F = [emb(FAC / n) for n in FACILITY]
    cos = lambda a, b: float(np.clip(np.dot(a, b), -1, 1))
    def mean_within(X): return float(np.mean([cos(X[i], X[j]) for i in range(len(X)) for j in range(i+1, len(X))]))
    def mean_cross(X, Y): return float(np.mean([cos(x, y) for x in X for y in Y]))
    wa, wf, cr = mean_within(A), mean_within(F), mean_cross(A, F)
    print(f"mean within-athlete  : {wa:.3f}")
    print(f"mean within-facility : {wf:.3f}")
    print(f"mean cross athlete<->facility : {cr:.3f}")
    print(f"VERDICT: facility {'IS a distinct region (cross < within-athlete)' if cr < wa else 'NOT clearly distinct'} "
          f"-> diversifying" if cr < wa else "-> watch")

if __name__ == "__main__":
    main()

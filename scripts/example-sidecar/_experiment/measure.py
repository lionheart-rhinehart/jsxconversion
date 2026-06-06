#!/usr/bin/env python3
# General measurer: reads render-manifest.json {condition: {hostId: pngPath}}, embeds every
# unique png with CLIP ViT-L/14 + DINOv2-L, and for each condition reports cross-design
# cosine (CLIP-only, DINOv2-only, combined) max+mean over the host set, plus identity-
# preservation (each treated host vs its C0 baseline). Writes results.json.
# Reporting CLIP and DINOv2 SEPARATELY is the point — it's how we catch the duotone claim.
import json, sys, warnings
from pathlib import Path
import numpy as np
from PIL import Image
warnings.filterwarnings("ignore")

HERE = Path(__file__).resolve().parent
MANIFEST = HERE / "render-manifest.json"
OUT = HERE / "results.json"

def l2(v):
    n = np.linalg.norm(v); return v / (n or 1.0)

def load_embedder():
    import torch
    from transformers import CLIPModel, CLIPProcessor, AutoModel, AutoImageProcessor
    torch.manual_seed(42)
    clip = CLIPModel.from_pretrained("openai/clip-vit-large-patch14").eval()
    cp = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")
    dino = AutoModel.from_pretrained("facebook/dinov2-large").eval()
    dp = AutoImageProcessor.from_pretrained("facebook/dinov2-large")
    cache = {}
    def emb(path):
        path = str(path)
        if path in cache: return cache[path]
        img = Image.open(path).convert("RGB")
        with torch.no_grad():
            c = l2(clip.get_image_features(**cp(images=img, return_tensors="pt"))[0].numpy())
            d = l2(dino(**dp(images=img, return_tensors="pt")).last_hidden_state[:, 0, :][0].numpy())
        cache[path] = (c, d, l2(np.concatenate([c, d]))); return cache[path]
    return emb

def cos(a, b): return float(np.clip(np.dot(a, b), -1, 1))

def main():
    man = json.loads(MANIFEST.read_text(encoding="utf-8"))
    emb = load_embedder()
    base = man.get("C0", {})  # hostId -> baseline png
    rows = []
    for cond, hosts in man.items():
        ids = sorted(hosts)
        E = {i: emb(hosts[i]) for i in ids}
        def pairs(idx):
            out = []
            for a in range(len(ids)):
                for b in range(a + 1, len(ids)):
                    out.append(cos(E[ids[a]][idx], E[ids[b]][idx]))
            return out
        clip_p, dino_p, comb_p = pairs(0), pairs(1), pairs(2)
        # identity preservation vs C0 (combined), skip for C0 itself
        self_sim = []
        if cond != "C0":
            for i in ids:
                if i in base:
                    self_sim.append(cos(E[i][2], emb(base[i])[2]))
        mx = lambda a: round(max(a), 4) if a else None
        mn = lambda a: round(float(np.mean(a)), 4) if a else None
        comb_max, dino_max = mx(comb_p), mx(dino_p)
        distinct = (comb_max is not None and comb_max < 0.70 and dino_max < 0.70)
        rows.append({
            "condition": cond, "n": len(ids),
            "clipMax": mx(clip_p), "clipMean": mn(clip_p),
            "dinoMax": dino_max, "dinoMean": mn(dino_p),
            "combMax": comb_max, "combMean": mn(comb_p),
            "identityMin": round(min(self_sim), 4) if self_sim else None,
            "identityMean": round(float(np.mean(self_sim)), 4) if self_sim else None,
            "distinct": distinct,
        })
    order = {"C0": 0, "C1": 1, "C2": 2, "C3": 3, "C4": 4}
    rows.sort(key=lambda r: (order.get(r["condition"], 50), r["condition"]))
    OUT.write_text(json.dumps({"note": "media-test measured results (CLIP-L/14 + DINOv2-L). distinct = combMax<0.70 AND dinoMax<0.70.", "rows": rows}, indent=2), encoding="utf-8")
    # print a table
    print(f"{'cond':<6} {'clipMax':>8} {'dinoMax':>8} {'combMax':>8} {'identMin':>9} {'distinct':>9}")
    for r in rows:
        print(f"{r['condition']:<6} {str(r['clipMax']):>8} {str(r['dinoMax']):>8} {str(r['combMax']):>8} {str(r['identityMin']):>9} {str(r['distinct']):>9}")

if __name__ == "__main__":
    main()

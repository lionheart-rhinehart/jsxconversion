#!/usr/bin/env python3
# Pre-bake brand duotone (gradient-map) versions of source photos for the media test.
# Maps luminance -> lerp(dark, light) so the image reads as a branded graphic element,
# not a raw photograph. Output: _experiment/duotone/<name>.png
import sys
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent.parent
NAMED = ROOT / "brand" / "aa-design-system" / "project" / "assets"
OUT = HERE / "duotone"; OUT.mkdir(exist_ok=True)

DARK = np.array([12, 7, 8], dtype=np.float32)      # shadows: near-black, red cast
LIGHT = np.array([244, 168, 171], dtype=np.float32)  # highlights: light red

def duotone(src, dst):
    g = np.asarray(Image.open(src).convert("L"), dtype=np.float32)[..., None] / 255.0
    rgb = (DARK * (1 - g) + LIGHT * g).astype(np.uint8)
    Image.fromarray(rgb, "RGB").save(dst)

def main():
    names = sys.argv[1:] or ["photo-jump-male.jpg", "photo-agility-female.jpg", "photo-box-jump.jpg", "photo-lifting.jpg", "photo-medball-female.jpg"]
    for n in names:
        src = NAMED / n
        if not src.exists():
            print(f"MISSING {src}"); continue
        dst = OUT / (Path(n).stem + ".png")
        duotone(src, dst); print(f"  {dst}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# Knockout: remove backgrounds from athlete photos -> transparent PNGs for the
# cutout-on-color-field test (C5). First run downloads the u2net model (~170MB).
import sys
from pathlib import Path
from rembg import remove
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent.parent
NAMED = ROOT / "brand" / "aa-design-system" / "project" / "assets"
OUT = HERE / "cutout"; OUT.mkdir(exist_ok=True)

def main():
    names = sys.argv[1:] or ["photo-jump-male.jpg", "photo-agility-female.jpg", "photo-box-jump.jpg", "photo-lifting.jpg", "photo-medball-female.jpg"]
    for n in names:
        src = NAMED / n
        if not src.exists():
            print(f"MISSING {src}"); continue
        out = OUT / (Path(n).stem + ".png")
        res = remove(Image.open(src).convert("RGBA"))
        res.save(out)
        print(f"  {out}")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# Build a side-by-side comparison sheet per tested design:
#   ORIGINAL (no media) | FULL-BLEED media | CONTAINED accent
# Reads originals from templates/_examples and the two variant sets from compare/.
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent.parent
EX = ROOT / "templates" / "_examples"
CMP = HERE / "compare"
IDS = ["ex-001-giant-stat", "ex-002-metric-reveal", "ex-003-kinetic-text", "ex-004-quote-card", "ex-008-list-steps", "ex-014-timeline-schedule", "ex-015-benefit-iconrow"]

W = 360                      # thumb width
Hh = int(W * 1920 / 1080)    # thumb height
GAP, MARGIN, LABEL_H, HEADER_H = 26, 28, 46, 64

def font(sz, bold=False):
    for p in [r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf"]:
        try:
            return ImageFont.truetype(p, sz)
        except Exception:
            pass
    return ImageFont.load_default()

def thumb(p):
    if not Path(p).exists():
        im = Image.new("RGB", (W, Hh), (40, 40, 46)); ImageDraw.Draw(im).text((20, 20), "missing", fill=(200, 80, 80)); return im
    return Image.open(p).convert("RGB").resize((W, Hh))

def main():
    cols = [("ORIGINAL (no media)", lambda i: EX / f"{i}.png"),
            ("FULL-BLEED media", lambda i: CMP / f"{i}-fb.png"),
            ("CONTAINED accent", lambda i: CMP / f"{i}-co.png")]
    for i in IDS:
        name = i.split("-", 2)[2]
        cw = MARGIN * 2 + 3 * W + 2 * GAP
        ch = HEADER_H + LABEL_H + Hh + MARGIN
        canvas = Image.new("RGB", (cw, ch), (13, 13, 16))
        d = ImageDraw.Draw(canvas)
        d.text((MARGIN, 18), name, fill=(255, 255, 255), font=font(38, True))
        for c, (label, pathfn) in enumerate(cols):
            x = MARGIN + c * (W + GAP)
            d.text((x, HEADER_H), label, fill=(200, 200, 205), font=font(24))
            canvas.paste(thumb(pathfn(i)), (x, HEADER_H + LABEL_H))
        out = CMP / f"_compare-{name}.png"
        canvas.save(out)
        print(out)

if __name__ == "__main__":
    main()

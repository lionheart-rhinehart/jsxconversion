#!/usr/bin/env python3
# Gemini independent verification of a condition's 5 host renders:
#   QUALITY    — creative-director: would a real brand run each? 1-5 + the main issue.
#   DISTINCTNESS — how many genuinely distinct design families (does Gemini agree with cosine?)
# Reads runs/<cond>/<id>.png (C0 from templates/_examples). Live key, STOP on failure.
# Usage: python gemini_eval.py C0 C1 C5
import os, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent.parent
EX = ROOT / "templates" / "_examples"
RUNS = HERE / "runs"
ENV = HERE.parent / ".env"
HOSTS = ["ex-001-giant-stat", "ex-002-metric-reveal", "ex-004-quote-card", "ex-008-list-steps", "ex-014-timeline-schedule"]

def load_env():
    if ENV.exists():
        for ln in ENV.read_text(encoding="utf-8").splitlines():
            ln = ln.strip()
            if ln and not ln.startswith("#") and "=" in ln:
                k, v = ln.split("=", 1); os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

def main():
    load_env()
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        print("STOP: no GEMINI_API_KEY"); return 2
    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    import google.generativeai as genai
    from PIL import Image
    genai.configure(api_key=key); client = genai.GenerativeModel(model)

    def imgs(cond):
        d = EX if cond == "C0" else RUNS / cond
        suffix = "" if cond == "C0" else ""
        return [Image.open(d / f"{h}.png") for h in HOSTS]

    for cond in sys.argv[1:]:
        try:
            ims = imgs(cond)
        except Exception as e:
            print(f"{cond}: cannot load images ({e})"); continue
        qprompt = ("You are a senior creative director reviewing 5 paid-social ads (vertical) for a youth "
                   "sports-performance brand. For EACH ad in order (1-5), rate 1-5 whether a real brand would "
                   "run it AS-IS (5=ship, 1=amateur/broken/cluttered). Reply exactly one line per ad: "
                   "'i: SCORE | one-line issue'.")
        dprompt = ("These are 5 ad designs. Grouping by VISUAL LAYOUT/type (NOT topic), how many genuinely "
                   "DISTINCT design families are here (1-5)? Then name any that read as the same family. "
                   "Reply: 'DISTINCT: N | notes'.")
        try:
            q = client.generate_content([qprompt, *ims]).text.strip()
            d = client.generate_content([dprompt, *ims]).text.strip()
        except Exception as e:
            print(f"STOP: Gemini call failed for {cond} ({e})"); return 2
        print(f"\n===== {cond} =====\n[QUALITY]\n{q}\n[DISTINCTNESS]\n{d}")
    return 0

if __name__ == "__main__":
    sys.exit(main())

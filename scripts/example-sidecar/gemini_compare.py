#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/gemini_compare.py  — Track B fix-loop helper
# ============================================================================
#  For a colliding pair (cosine >= 0.70), ask Gemini to name the SPECIFIC
#  structural feature the two designs SHARE that makes them read as the same
#  family. Drives the redesign (change layout family, not photo/copy). Required
#  by the acceptance-gate fix loop. STOPS loudly if the Gemini call fails — never
#  silently falls back.
#
#  Usage:  python gemini_compare.py <idA> <idB> [<idC> <idD> ...]   (pairs)
# ============================================================================
import os, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
ENV_FILE = HERE / ".env"

def load_env():
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

def main():
    load_env()
    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        print("STOP: GEMINI_API_KEY absent — cannot run the compare. Not falling back to eyeballing.", file=sys.stderr)
        return 2
    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    try:
        import google.generativeai as genai
        from PIL import Image
        genai.configure(api_key=key)
        client = genai.GenerativeModel(model)
    except Exception as e:  # noqa: BLE001
        print(f"STOP: Gemini SDK/config failed ({e}).", file=sys.stderr)
        return 2

    args = sys.argv[1:]
    pairs = [(args[i], args[i + 1]) for i in range(0, len(args) - 1, 2)]
    for a, b in pairs:
        pa = ROOT / "templates" / "_examples" / f"{a}.png"
        pb = ROOT / "templates" / "_examples" / f"{b}.png"
        prompt = (
            "These two advertising creatives were flagged by an embedding model as TOO visually similar "
            "(they should be different design families). In 1-2 short sentences, name the SPECIFIC structural / "
            "visual feature they SHARE that makes them read as the same kind of design (composition, dominant "
            "element, production style, photo treatment). Then suggest the single most effective STRUCTURAL change "
            "to ONE of them to separate them — not a copy or photo swap."
        )
        try:
            resp = client.generate_content([prompt, Image.open(pa), Image.open(pb)])
            print(f"\n### {a}  ~  {b}\n{(resp.text or '').strip()}")
        except Exception as e:  # noqa: BLE001
            print(f"STOP: Gemini call failed for {a}~{b} ({e}).", file=sys.stderr)
            return 2
    return 0

if __name__ == "__main__":
    sys.exit(main())

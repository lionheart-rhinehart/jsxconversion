#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/slop_flag.py — subjective anti-slop (#16, vision)
# ============================================================================
#  Asks an independent vision model whether each campaign output reads as off-brand /
#  low-quality / AI-sloppy (a rough-masked cutout, garbled overlay text, a cheap
#  gradient cliché) — the SUBJECTIVE half the deterministic T1.5 antiSlop can't see.
#
#  FAILS SOFT: with no GEMINI_API_KEY (or no SDK) it writes {ran:false} and the gate
#  proceeds on #14/#15 + the deterministic anti-slop alone — an LLM outage must NOT
#  block a whole batch (perceptual-merge.mjs only blocks on slop when ran:true).
#
#  Reads  campaigns/<c>/.perceptual-input.json
#  Writes campaigns/<c>/.perceptual-slop.json  { ran, model?, assets:{key:{flagged,reason}} }
#  Usage: python slop_flag.py <campaign>
# ============================================================================

import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
ENV_FILE = HERE / ".env"


def log(msg):
    sys.stderr.write(f"[slop-flag] {msg}\n")
    sys.stderr.flush()


def load_env():
    if not ENV_FILE.exists():
        return
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


PROMPT = (
    "You are a senior creative director reviewing one advertising creative for a youth "
    "sports-performance brand. Flag it ONLY if it looks clearly off-brand or low quality: "
    "garbled/overlapping text, a rough or halo'd cutout mask, a cheap rainbow/gradient "
    "cliche, obvious AI artifacts, or unreadable copy. A clean, on-brand design is NOT "
    "flagged. Reply with strict JSON: {\"flagged\": true|false, \"reason\": \"<=12 words\"}."
)


def main():
    if len(sys.argv) < 2:
        sys.stderr.write("usage: python slop_flag.py <campaign>\n"); return 2
    campaign = sys.argv[1]
    camp_dir = ROOT / "campaigns" / campaign
    in_path = camp_dir / ".perceptual-input.json"
    out_path = camp_dir / ".perceptual-slop.json"
    if not in_path.exists():
        sys.stderr.write(f"no {in_path}\n"); return 2
    items = json.loads(in_path.read_text(encoding="utf-8")).get("items", [])

    load_env()
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    client = None
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            client = genai.GenerativeModel(model_name)
        except Exception as e:  # noqa: BLE001
            log(f"Gemini SDK/config unavailable ({e}) — slop pass is a no-op")
            client = None
    if client is None:
        out_path.write_text(json.dumps({"ran": False, "assets": {}}, indent=2), encoding="utf-8")
        log("ran=false (no GEMINI_API_KEY / SDK) — deterministic anti-slop (T1.5) holds the floor")
        return 0

    from PIL import Image
    assets = {}
    for it in items:
        try:
            img = Image.open(it["png"]); img.load()
            resp = client.generate_content([PROMPT, img])
            text = (resp.text or "").strip()
            if text.startswith("```"):
                text = text.strip("`").split("\n", 1)[-1] if "\n" in text else text.strip("`")
            verdict = json.loads(text)
            if verdict.get("flagged"):
                assets[it["key"]] = {"flagged": True, "reason": str(verdict.get("reason", "off-brand / low quality"))[:120]}
        except Exception as e:  # noqa: BLE001
            log(f"  {it['key']}: skipped ({e})")  # a per-image failure never sentinels the batch
    out_path.write_text(json.dumps({"ran": True, "model": model_name, "assets": assets}, indent=2), encoding="utf-8")
    log(f"ran=true ({model_name}); flagged {len(assets)}/{len(items)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

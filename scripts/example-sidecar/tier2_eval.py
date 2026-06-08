#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/tier2_eval.py — Tier-2 advisory persona panel (#T2.3)
# ============================================================================
#  A "second pair of eyes" on each rendered creative: three personas
#  (performance-marketer / creative-director / consumer) each rate it 1–5 with a
#  one-liner. DISAGREEMENT between them is the signal a human should look. ADVISORY
#  ONLY — the merge folds this warn-only, never a block (the copy's voice + hook are
#  locked upstream, so re-scoring an approved hook is pointless).
#
#  FAILS SOFT: no GEMINI_API_KEY / SDK → {ranOk:false} and the gate is unaffected.
#
#  Reads  campaigns/<c>/.perceptual-input.json  (id→png, reused from the perceptual sidecar)
#  Writes campaigns/<c>/tier2.json  { ranOk, provider, assets:{key:{personas,mean,disagreement}} }
#  Usage: python tier2_eval.py <campaign>
# ============================================================================

import json
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
ENV_FILE = HERE / ".env"

PERSONAS = ["performance-marketer", "creative-director", "consumer"]
PROMPT = (
    "Rate this ONE advertising creative for a youth sports-performance brand from THREE "
    "independent viewpoints. Each gives an integer 1–5 (5 = excellent) and a <=10-word note:\n"
    "- performance-marketer: will it stop the scroll and drive a click?\n"
    "- creative-director: is it on-brand, clean, professionally composed?\n"
    "- consumer (a sports parent): is it clear, trustworthy, compelling?\n"
    "Reply with STRICT JSON only: "
    '{"performance-marketer":{"score":N,"note":"..."},'
    '"creative-director":{"score":N,"note":"..."},'
    '"consumer":{"score":N,"note":"..."}}'
)


def log(msg):
    sys.stderr.write(f"[tier2] {msg}\n")
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


def parse_json(text):
    text = (text or "").strip()
    if text.startswith("```"):
        text = text.strip("`")
        text = text.split("\n", 1)[-1] if "\n" in text else text
    return json.loads(text)


def main():
    if len(sys.argv) < 2:
        sys.stderr.write("usage: python tier2_eval.py <campaign>\n"); return 2
    campaign = sys.argv[1]
    camp_dir = ROOT / "campaigns" / campaign
    in_path = camp_dir / ".perceptual-input.json"
    out_path = camp_dir / "tier2.json"
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
            log(f"Gemini SDK/config unavailable ({e}) — Tier-2 is a no-op")
            client = None
    if client is None:
        out_path.write_text(json.dumps({"schemaVersion": 1, "ranOk": False, "assets": {}}, indent=2), encoding="utf-8")
        log("ranOk=false (no GEMINI_API_KEY / SDK) — advisory panel skipped")
        return 0

    from PIL import Image
    assets = {}
    for it in items:
        try:
            img = Image.open(it["png"]); img.load()
            verdict = parse_json(client.generate_content([PROMPT, img]).text)
            personas, scores = [], []
            for p in PERSONAS:
                v = verdict.get(p, {}) or {}
                s = int(v.get("score", 0))
                scores.append(s)
                personas.append({"persona": p, "score": s, "note": str(v.get("note", ""))[:80]})
            if not scores:
                continue
            mean = round(sum(scores) / len(scores), 2)
            disagreement = max(scores) - min(scores)
            assets[it["key"]] = {"personas": personas, "mean": mean, "disagreement": disagreement}
        except Exception as e:  # noqa: BLE001
            log(f"  {it['key']}: skipped ({e})")  # a per-image failure never sinks the batch
    out_path.write_text(json.dumps({"schemaVersion": 1, "ranOk": True, "provider": model_name, "assets": assets}, indent=2), encoding="utf-8")
    log(f"ranOk=true ({model_name}); scored {len(assets)}/{len(items)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

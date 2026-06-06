#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/label.py  — Track B, step 3 of the sidecar
# ============================================================================
#  The VISION-LLM kind cross-check. The embeddings (embed.py) measure distinctness;
#  this asks an independent vision model "what KIND is this, by looking at the
#  pixels?" and compares its answer to the AUTHORED kind in the manifest. Agreement =
#  confidence the label is real; disagreement = a flag for human review (the
#  "we-think-10-the-AI-reads-2" check, per-example).
#
#  Provider = Gemini (the plan's pick), behind a thin interface. It is PLUGGABLE and
#  FAILS SOFT: with no GEMINI_API_KEY (or no SDK) it writes a no-op labels.json that
#  records the authored kind as the source of truth and marks gemini as not-run — so
#  a key-less run still produces a valid, honest index (kind from the manifest,
#  eyeball-confirmed by the human curator) and never blocks the loop.
#
#  Output: scripts/example-sidecar/labels.json
#    { "provider": "...", "ranAt": <iso|null>,
#      "labels": { <id>: { authoredKind, geminiKind|null, agrees|null, note } } }
#
#  Usage:  python label.py
#    Set GEMINI_API_KEY and `pip install google-generativeai` to run the real pass.
#  New file (Track B). Reads sidecar inputs + render-report; writes labels.json only.
# ============================================================================

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
MANIFEST = HERE / "examples.manifest.json"
RENDER_REPORT = HERE / "render-report.json"
LABELS = HERE / "labels.json"

# The closed kind vocabulary, mirrored from scripts/lib/example-library.mjs (KINDS).
# Kept in sync by the contract test; the labeler must only ever return one of these.
KINDS = [
    "authentic-selfie", "coach-direct-address", "action-hero-text", "training-scene",
    "before-after-split", "proof-collage", "giant-stat", "metric-reveal",
    "kinetic-statement", "list-steps", "offer-guarantee", "versus",
]

MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


def log(msg):
    sys.stderr.write(f"[label] {msg}\n")
    sys.stderr.flush()


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def load_targets():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    report = json.loads(RENDER_REPORT.read_text(encoding="utf-8"))
    ok_ids = {r["id"]: r for r in report["results"] if r.get("ok") and r.get("png")}
    targets = []
    for e in manifest["examples"]:
        if e["id"] in ok_ids:
            targets.append({"id": e["id"], "authoredKind": e["kind"], "png": str(ROOT / ok_ids[e["id"]]["png"])})
    return targets


def gemini_label(client, png_path):
    """Ask Gemini for the single best-fit kind from the closed vocabulary."""
    from PIL import Image
    prompt = (
        "You are labeling an advertising creative by its VISUAL ARCHETYPE (structure: "
        "who is in frame, how it is composed, production style), NOT by its message or brand. "
        "Choose exactly ONE kind from this closed list and reply with only that token:\n"
        + "\n".join(f"- {k}" for k in KINDS)
        + "\n\nReply with just the kind token."
    )
    img = Image.open(png_path)
    resp = client.generate_content([prompt, img])
    text = (resp.text or "").strip().lower()
    for k in KINDS:
        if k in text:
            return k
    return None


def main():
    targets = load_targets()
    provider = "gemini"
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    client = None
    ran_at = None

    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            client = genai.GenerativeModel(MODEL)
            log(f"Gemini configured ({MODEL}); labeling {len(targets)} examples")
        except Exception as e:  # noqa: BLE001
            log(f"Gemini SDK/config unavailable ({e}); falling back to authored kinds")
            client = None
    else:
        log("GEMINI_API_KEY absent — no-op pass; kind = authored manifest (eyeball-confirmed by curator)")

    labels = {}
    if client is not None:
        ran_at = now_iso()
    for t in targets:
        gk = None
        note = "GEMINI_API_KEY absent — authored kind used as source of truth"
        agrees = None
        if client is not None:
            try:
                gk = gemini_label(client, t["png"])
                agrees = (gk == t["authoredKind"]) if gk else None
                if gk is None:
                    note = "gemini returned no recognizable kind; kept authored kind"
                elif agrees:
                    note = "gemini agrees with authored kind"
                else:
                    note = f"DISAGREEMENT: gemini read '{gk}' vs authored '{t['authoredKind']}' — review"
                    log(f"  {t['id']}: {note}")
            except Exception as e:  # noqa: BLE001
                note = f"gemini call failed ({e}); kept authored kind"
        labels[t["id"]] = {"authoredKind": t["authoredKind"], "geminiKind": gk, "agrees": agrees, "note": note}

    out = {
        "note": "Vision-LLM kind cross-check. With no GEMINI_API_KEY this is a no-op that defers to the authored (eyeball-confirmed) kind; with a key it records gemini's independent read + agreement so disagreements surface for review. build-index.mjs folds 'labeledBy' + any disagreement flag into clusterMetrics.",
        "provider": provider,
        "model": MODEL if client is not None else None,
        "ranAt": ran_at,
        "labeledBy": f"gemini:{MODEL}" if client is not None else "authored-manifest+curator-eyeball",
        "labels": labels,
    }
    LABELS.write_text(json.dumps(out, indent=2), encoding="utf-8")
    disagreements = sum(1 for v in labels.values() if v["agrees"] is False)
    log(f"wrote {LABELS.name} ({len(labels)} labels, {disagreements} disagreements, labeledBy={out['labeledBy']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())

#!/usr/bin/env python3
# ============================================================================
#  scripts/example-sidecar/label.py  — Track B, step 3 of the sidecar
# ============================================================================
#  The VISION-LLM archetype cross-check. The embeddings (embed.py) measure
#  distinctness; this asks an independent vision model "what ARCHETYPE is this, by
#  looking at the pixels?" and compares its answer to the AUTHORED archetype in the
#  manifest. Agreement = confidence the label is real; disagreement = a flag for
#  human review (the "we-think-12-the-AI-reads-fewer" check, per-example).
#
#  Provider = Gemini (the plan's pick), behind a thin interface. It is PLUGGABLE and
#  FAILS SOFT: with no GEMINI_API_KEY (or no SDK) it writes a no-op labels.json that
#  records the authored archetype as the source of truth and marks gemini not-run —
#  so a key-less run still produces a valid, honest index and never blocks the loop.
#  A local gitignored .env (GEMINI_API_KEY=...) is loaded if present.
#
#  Output: scripts/example-sidecar/labels.json
#    { "provider","model","ranAt","labeledBy",
#      "labels": { <id>: { authoredArchetype, geminiArchetype|null, agrees|null, note } } }
#
#  Usage:  python label.py
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
ENV_FILE = HERE / ".env"

# The closed archetype vocabulary, mirrored from scripts/lib/example-library.mjs
# (ARCHETYPES + MOTION_ARCHETYPES). Kept in sync by the contract; the labeler returns
# only one of these. Static archetypes first, then the round-2 motion archetypes (a
# poster of a motion example is still labeled by its dominant structure).
ARCHETYPES = [
    # static (15)
    "giant-stat", "metric-reveal", "kinetic-text", "quote-card",
    "before-after-split", "versus", "proof-collage", "list-steps",
    "offer-card", "action-hero", "training-scene", "ugc-selfie",
    "split-panel", "timeline-schedule", "benefit-iconrow",
    # motion (16) — was coach-portrait → split-panel above
    "count-up-stats", "radar-stats", "stopwatch-countdown", "bracket-tree",
    "comic-strip", "star-testimonial", "macro-ring", "scoreboard",
    "streak-counter", "slot-roll", "tier-list", "sprint-trace",
    "calendar-fill", "leaderboard-roll", "velocity-gauge", "anatomy-diagram",
]

MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")


def log(msg):
    sys.stderr.write(f"[label] {msg}\n")
    sys.stderr.flush()


def load_env():
    """Load GEMINI_API_KEY from a local gitignored .env if present (KEY=VALUE lines)."""
    if not ENV_FILE.exists():
        return
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def load_targets():
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    report = json.loads(RENDER_REPORT.read_text(encoding="utf-8"))
    ok_ids = {r["id"]: r for r in report["results"] if r.get("ok") and r.get("png")}
    targets = []
    for e in manifest["examples"]:
        if e["id"] in ok_ids:
            targets.append({"id": e["id"], "authoredArchetype": e["archetype"], "png": str(ROOT / ok_ids[e["id"]]["png"])})
    return targets


def gemini_label(client, png_path):
    from PIL import Image
    prompt = (
        "You are labeling an advertising creative by its VISUAL ARCHETYPE (structure: "
        "who is in frame, how it is composed, production style), NOT by its message or brand. "
        "Choose exactly ONE archetype from this closed list and reply with only that token:\n"
        + "\n".join(f"- {a}" for a in ARCHETYPES)
        + "\n\nReply with just the archetype token."
    )
    img = Image.open(png_path)
    resp = client.generate_content([prompt, img])
    text = (resp.text or "").strip().lower()
    for a in ARCHETYPES:
        if a in text:
            return a
    return None


def main():
    load_env()
    # MODEL (L46) binds at import, BEFORE load_env() runs — re-read here so a .env-set
    # GEMINI_MODEL actually takes effect (else the dead gemini-2.0-flash default is used).
    model = os.environ.get("GEMINI_MODEL", MODEL)
    targets = load_targets()
    provider = "gemini"
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    client = None
    ran_at = None

    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            client = genai.GenerativeModel(model)
            log(f"Gemini configured ({model}); labeling {len(targets)} examples")
        except Exception as e:  # noqa: BLE001
            log(f"Gemini SDK/config unavailable ({e}); falling back to authored archetypes")
            client = None
    else:
        log("GEMINI_API_KEY absent — no-op pass; archetype = authored manifest (eyeball-confirmed by curator)")

    labels = {}
    if client is not None:
        ran_at = now_iso()
    for t in targets:
        ga = None
        note = "GEMINI_API_KEY absent — authored archetype used as source of truth"
        agrees = None
        if client is not None:
            try:
                ga = gemini_label(client, t["png"])
                agrees = (ga == t["authoredArchetype"]) if ga else None
                if ga is None:
                    note = "gemini returned no recognizable archetype; kept authored"
                elif agrees:
                    note = "gemini agrees with authored archetype"
                else:
                    note = f"DISAGREEMENT: gemini read '{ga}' vs authored '{t['authoredArchetype']}' — review"
                    log(f"  {t['id']}: {note}")
            except Exception as e:  # noqa: BLE001
                note = f"gemini call failed ({e}); kept authored archetype"
        labels[t["id"]] = {"authoredArchetype": t["authoredArchetype"], "geminiArchetype": ga, "agrees": agrees, "note": note}

    # labeledBy counts as gemini ONLY if calls actually SUCCEEDED (>=1 real read) — not
    # merely because the client constructed. An all-failed run must not claim gemini.
    succeeded = sum(1 for v in labels.values() if v["geminiArchetype"] is not None)
    gemini_ran = client is not None and succeeded > 0
    out = {
        "note": "Vision-LLM archetype cross-check. With no GEMINI_API_KEY this is a no-op that defers to the authored (eyeball-confirmed) archetype; with a key it records gemini's independent read + agreement so disagreements surface. build-index.mjs folds 'labeledBy' + any disagreement into clusterMetrics.",
        "provider": provider,
        "model": model if gemini_ran else None,
        "ranAt": ran_at if gemini_ran else None,
        "geminiReads": succeeded,
        "labeledBy": f"gemini:{model}" if gemini_ran else "authored-manifest+curator-eyeball",
        "labels": labels,
    }
    LABELS.write_text(json.dumps(out, indent=2), encoding="utf-8")
    disagreements = sum(1 for v in labels.values() if v["agrees"] is False)
    if client is not None and succeeded == 0:
        log("WARNING: client constructed but 0 successful gemini reads — labeledBy falls back to authored")
    log(f"wrote {LABELS.name} ({len(labels)} labels, {succeeded} gemini reads, {disagreements} disagreements, labeledBy={out['labeledBy']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())

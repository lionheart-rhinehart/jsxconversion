// ============================================================================
//  scripts/example-sidecar/author-video-examples.mjs — Track B VIDEO generator
// ============================================================================
//  Authors the VIDEO half of the example library (ids ex-046+), two flavors:
//    • ANIMATED motion (graphic archetypes: metric-reveal / kinetic-text / list-steps)
//      — SELF-CONTAINED <Stage> components using only the fallback runtime primitives
//      (useTime / Easing / clamp / Stage). No TplText/TrimmedMedia, no co-located
//      runtime → renders via the jsx-to-mp4 "fallback" path, single file. (Plan A1.)
//    • ACTION-CLIP GIFs (media archetypes) — added in a later pass via ffmpeg overlay
//      (Plan A3); not in this proving slice.
//
//  It OWNS ids ex-046+ only. It never wipes the whole dir (that would delete the
//  static ex-001..045 — D-CRIT); it removes only its own ids and merges its rows into
//  the shared manifest. format:"video" is guarded to the 8 contract-allowed archetypes.
//
//  Run:  node scripts/example-sidecar/author-video-examples.mjs
//  Node-only. New file (Track B).
// ============================================================================

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { makeExampleId, ARCHETYPE_SPECS } from "../lib/example-library.mjs";
import { removeOwnedSources, mergeManifest } from "./manifest-util.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const EXAMPLES_DIR = join(ROOT, "templates", "_examples");
const ASSETS_DIR = join(EXAMPLES_DIR, "assets");
const MANIFEST = join(HERE, "examples.manifest.json");

const VIDEO_START_SEQ = 46;   // statics own 1..45; video owns 46+
const W = 1080, H = 1920;

// Self-contained <Stage> wrapper. Uses fallback-runtime globals (useTime/Easing/clamp/
// Stage are window globals injected by the jsx-to-mp4 fallback runtime). No imports,
// no TplText/TrimmedMedia. The component registers window.<Name> (the renderer reads it).
const stage = (name, duration, bg, body) => `// ${name} — generated VIDEO example (self-contained Stage; fallback runtime).
const VW = ${W}, VH = ${H};
function ${name}() {
  const t = useTime();
  const ce = (start, dur = 0.5) => Easing.easeOutCubic(clamp((t - start) / dur, 0, 1));
${body}
  return (
    <Stage width={VW} height={VH} duration={${duration}} background="${bg}">
      {scene}
    </Stage>
  );
}
window.${name} = ${name};
`;

// ---------------------------------------------------------------------------
// ANIMATED examples (self-contained). slotShape roles ⊆ scripts/lib/roles.mjs;
// motion maxChars = null (capacity unknown for motion, per contract §6).
// ---------------------------------------------------------------------------
const ANIMATED = [
  // ex-046 — METRIC REVEAL: a RING GAUGE sweeps to its value while the center number
  // counts up (an animated chart building to one point — the metric-reveal archetype,
  // visually distinct from a bare giant number).
  { slug: "metric-reveal", archetype: "metric-reveal", accepts: [],
    name: "MetricRingReveal", duration: 4, bg: "#0d0d12",
    slotShape: { slots: [{ id: "label", role: "kicker", maxChars: null, required: false }, { id: "stat", role: "stat", maxChars: null, required: true }, { id: "headline", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "stat", "claim"] },
    body: `  const R = 300, C = 2 * Math.PI * R, TARGET = 0.9;
  const eb = ce(0.1, 0.3);
  const sweep = TARGET * ce(0.5, 1.4);          // ring fills 0 -> 90%
  const dash = (C * sweep).toFixed(1) + " " + C.toFixed(1);
  const val = Math.round(100 * sweep);          // center counter 0 -> 90
  const head = ce(2.4, 0.5);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, right: 64, top: 120, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>ON-TIME TO GOAL</div>
      <svg viewBox="0 0 720 720" style={{ position: "absolute", left: "50%", top: 470, width: 720, transform: "translateX(-50%)" }}>
        <circle cx="360" cy="360" r={R} stroke="#22222a" strokeWidth="56" fill="none" />
        <circle cx="360" cy="360" r={R} stroke="#c4141d" strokeWidth="56" fill="none" strokeLinecap="round" strokeDasharray={dash} transform="rotate(-90 360 360)" />
        <text x="360" y="360" textAnchor="middle" dominantBaseline="central" fontFamily="Anton, sans-serif" fontSize="240" fill="#fff">{val}%</text>
      </svg>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 150, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 70, textTransform: "uppercase", lineHeight: 0.96, opacity: head, transform: "translateY(" + ((1 - head) * 16) + "px)" }}>Hit their target<br/>by day 90</div>
    </div>
  );` },
];

// ---------------------------------------------------------------------------
// ACTION-CLIP GIF examples (A3 ffmpeg overlay). Each emits a CHROME static component
// (the held design with the media region filled chroma-key #00ff00); render-examples
// composites the clip behind the keyed chrome. `clip` is repo-relative (use committed
// design-system clips so regeneration works without the gitignored kraken-cache).
// `rect` is the media region in the 1080×1920 frame. No new designs — the chrome mirrors
// the matching static layout with its <img> replaced by the key fill.
// ---------------------------------------------------------------------------
const GREEN = "#00ff00";
const chromeWrap = (inner, bg = GREEN) => `export default function Chrome() {
  return (
    <div style={{ width: ${W}, height: ${H}, position: "relative", overflow: "hidden", background: "${bg}" }}>
${inner}
    </div>
  );
}
`;

const GIFS = [
  // ex-047 — COACH PORTRAIT GIF: clip plays in the left photo-half; red info panel right.
  { slug: "coach-portrait", archetype: "coach-portrait", accepts: ["production:cinematic", "subject:coach-face"],
    clip: "brand/aa-design-system/project/assets/clip-agility.mp4",
    rect: { x: 0, y: 0, w: 562, h: H }, duration: 4,
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "name", role: "byline", maxChars: null, required: false }, { id: "title", role: "byline", maxChars: null, required: false }], roleSet: ["hook", "byline"] },
    chrome: chromeWrap(`      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "52%", background: "${GREEN}" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48%", background: "#c4141d", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 86, lineHeight: 0.95, textTransform: "uppercase" }}>Speed is coachable</div>
        <div style={{ width: 80, height: 6, background: "#fff", margin: "28px 0" }} />
        <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontSize: 38, fontWeight: 700 }}>Coach Graham Wilkerson</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#ffd2d4", fontSize: 26, letterSpacing: "0.04em", marginTop: 4 }}>DIRECTOR OF PERFORMANCE</div>
      </div>`) },
];

// ---------------------------------------------------------------------------
function assertVideoAllowed(archetype) {
  const spec = ARCHETYPE_SPECS[archetype];
  if (!spec || !spec.formats.includes("video")) {
    throw new Error(`author-video: archetype "${archetype}" is not video-capable in the contract (allowed video archetypes only). Refusing to emit a format:"video" row the validator would reject.`);
  }
}

function main() {
  mkdirSync(ASSETS_DIR, { recursive: true });

  let seq = VIDEO_START_SEQ - 1;
  const plan = [];
  const ownedIds = new Set();
  for (const e of ANIMATED) {
    const id = makeExampleId(++seq, e.slug);
    ownedIds.add(id); plan.push({ id, kind: "animated", e });
  }
  for (const g of GIFS) {
    const id = makeExampleId(++seq, g.slug);
    ownedIds.add(id); plan.push({ id, kind: "gif", e: g });
  }

  removeOwnedSources({ examplesDir: EXAMPLES_DIR, assetsDir: ASSETS_DIR, ownedIds });

  const rows = [];
  for (const { id, kind, e } of plan) {
    assertVideoAllowed(e.archetype);
    if (kind === "animated") {
      writeFileSync(join(EXAMPLES_DIR, `${id}.jsx`), stage(e.name, e.duration, e.bg, e.body));
      rows.push({ id, archetype: e.archetype, format: "video", mediaStyleAccepts: e.accepts || [], slotShape: e.slotShape });
    } else { // gif: the .jsx is the CHROME; render-examples composites the clip behind it
      writeFileSync(join(EXAMPLES_DIR, `${id}.jsx`), e.chrome);
      rows.push({
        id, archetype: e.archetype, format: "video", mediaStyleAccepts: e.accepts || [], slotShape: e.slotShape,
        render: "gif-composite", gif: { clip: e.clip, rect: e.rect, duration: e.duration },
      });
    }
  }

  mergeManifest({ manifestPath: MANIFEST, rows, ownedIds });
  process.stderr.write(`[author-video] wrote ${rows.length} video examples (${ANIMATED.length} animated + ${GIFS.length} gif); static ids preserved\n`);
}

main();

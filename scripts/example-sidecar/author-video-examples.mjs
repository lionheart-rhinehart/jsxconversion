// ============================================================================
//  scripts/example-sidecar/author-video-examples.mjs — Track B VIDEO generator
// ============================================================================
//  Authors the VIDEO half of the example library (ids ex-046+), two flavors:
//    • ANIMATED motion (graphic archetypes: metric-reveal / kinetic-text / list-steps)
//      — SELF-CONTAINED <Stage> components using only fallback-runtime primitives
//      (useTime / Easing / clamp / Stage). Renders via the jsx-to-mp4 "fallback" path.
//    • ACTION-CLIP GIFs (media archetypes) — a looping athlete clip composited behind a
//      held design via A3 ffmpeg overlay (chrome over chroma-key #00ff00; the clip(s)
//      fill the keyed media rect(s)). render-examples does the composite.
//
//  Each example carries an EXPLICIT `seq` so ids are STABLE regardless of list order
//  (adding an example never renumbers another). It OWNS ex-046+ only and never wipes the
//  whole dir (D-CRIT) — removes only its own ids, merges into the shared manifest.
//  format:"video" is guarded to the 8 contract-allowed archetypes.
//
//  Run:  node scripts/example-sidecar/author-video-examples.mjs
//  Node-only.
// ============================================================================

import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { makeExampleId, specFor, isAnyArchetype } from "../lib/example-library.mjs";
import { fieldRole } from "../lib/roles.mjs";
import { removeOwnedSources, mergeManifest } from "./manifest-util.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const EXAMPLES_DIR = join(ROOT, "templates", "_examples");
const ASSETS_DIR = join(EXAMPLES_DIR, "assets");
const MANIFEST = join(HERE, "examples.manifest.json");
const W = 1080, H = 1920, GREEN = "#00ff00";

// Footage (repo-relative). Stable design-system clips + readable kraken-cache clips.
// kraken-cache is per-machine (gitignored); the rendered mp4 is committed, so a fresh
// clone has the example — only RE-rendering needs the cache present.
const C = {
  agility: "brand/aa-design-system/project/assets/clip-agility.mp4",
  box: "brand/aa-design-system/project/assets/clip-box-jumps.mp4",
  band: "brand/kraken-cache/action-clip-band-work-high-school-female-jarosh-slide2of4-423c2eed.mp4",
  hurdle: "brand/kraken-cache/action-clip-hurdling-high-school-male-jarosh-performance-mp4-95470554.mp4",
  lateral: "brand/kraken-cache/action-clip-lateral-shuffle-high-school-female-jarosh-slide2-2f08659e.mp4",
  medball: "brand/kraken-cache/action-clip-med-ball-throw-high-school-female-jarosh-slide3o-02af193f.mp4",
  multi: "brand/kraken-cache/action-clip-multiple-exercises-high-school-female-jarosh-16490074.mp4",
  sled: "brand/kraken-cache/action-clip-sled-push-squat-jumping-strength-training-high-s-4b6c5551.mp4",
  // clean single-athlete clips (the named "...-training-session" clips have burned-in
  // slideshow titles that collide with UGC captions — avoided).
  lift: "brand/kraken-cache/aqnq8k-ml5qwanaiv6w0arcni8eug-sgjlcv0or6f7drokwglkcc554d-cik-3a19cc3d.mp4",
  lunge: "brand/kraken-cache/aqnrqoiqddtqmy7-r6mirkeprxllgu9gjucp7uoobk-n7o-q81-r8x2bd3cy-3a4a8875.mp4",
};

// Self-contained <Stage> wrapper for ANIMATED examples. Body defines `scene`.
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

// Static CHROME wrapper for GIF examples (media region(s) filled chroma-key).
const chromeWrap = (inner, bg = GREEN) => `export default function Chrome() {
  return (
    <div style={{ width: ${W}, height: ${H}, position: "relative", overflow: "hidden", background: "${bg}" }}>
${inner}
    </div>
  );
}
`;
// a chroma-key fill block for a media rect
const keyRect = (style) => `      <div style={{ position: "absolute", ${style}, background: "${GREEN}" }} />`;

// ============================================================================
//  ANIMATED examples (self-contained Stage). roles ⊆ roles.mjs; motion maxChars=null.
// ============================================================================
const ANIMATED = [
  // 46 — metric-reveal: RING GAUGE sweeps to 90% + center counter.
  { seq: 46, slug: "metric-reveal", archetype: "metric-reveal", accepts: [], name: "MetricRingReveal", duration: 4, bg: "#0d0d12",
    slotShape: { slots: [{ id: "label", role: "kicker", maxChars: null, required: false }, { id: "stat", role: "stat", maxChars: null, required: true }, { id: "headline", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "stat", "claim"] },
    body: `  const R = 300, Cc = 2 * Math.PI * R, TARGET = 0.9;
  const eb = ce(0.1, 0.3);
  const sweep = TARGET * ce(0.5, 1.4);
  const dash = (Cc * sweep).toFixed(1) + " " + Cc.toFixed(1);
  const val = Math.round(100 * sweep);
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

  // 48 — metric-reveal: BAR CHART builds week by week, last bar red. Light register.
  { seq: 48, slug: "metric-reveal", archetype: "metric-reveal", accepts: [], name: "MetricBarBuild", duration: 4, bg: "#f4f4f2",
    slotShape: { slots: [{ id: "title", role: "claim", maxChars: null, required: true }, { id: "caption", role: "reframe", maxChars: null, required: false }], roleSet: ["claim", "reframe"] },
    body: `  const heads = [320, 470, 610, 770, 980];
  const eb = ce(0.1, 0.3);
  const bars = heads.map((hh, i) => {
    const g = ce(0.5 + i * 0.18, 0.5);
    const bh = hh * g;
    return <rect key={i} x={110 + i * 170} y={1280 - bh} width="120" height={bh} rx="8" fill={i === heads.length - 1 ? "#c4141d" : "#2a2a32"} />;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 150, right: 64, opacity: eb }}>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#111", fontSize: 78, textTransform: "uppercase", lineHeight: 0.95 }}>Speed gains<br/>by week</div>
        <div style={{ fontFamily: "Geist, sans-serif", color: "#666", fontSize: 34, marginTop: 12 }}>Measured every 2 weeks</div>
      </div>
      <svg viewBox="0 0 1080 1320" style={{ position: "absolute", left: 0, bottom: 120, width: "100%" }}>
        <line x1="90" y1="1280" x2="990" y2="1280" stroke="#ccc" strokeWidth="4" />
        {bars}
      </svg>
      <div style={{ position: "absolute", left: 64, bottom: 60, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 30, letterSpacing: "0.08em" }}>WEEK 1 → WEEK 10</div>
    </div>
  );` },

  // 49 — metric-reveal: a STAT counts up with a progress bar filling beneath it. Dark.
  { seq: 49, slug: "metric-reveal", archetype: "metric-reveal", accepts: [], name: "MetricCounterBar", duration: 4, bg: "#0a0b0d",
    slotShape: { slots: [{ id: "label", role: "kicker", maxChars: null, required: false }, { id: "stat", role: "stat", maxChars: null, required: true }, { id: "sub", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "stat", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const p = ce(0.6, 1.2);
  const val = Math.round(92 * p);
  const sub = ce(2.0, 0.5);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, marginBottom: 6, opacity: eb }}>VERTICAL JUMP</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 400, lineHeight: 0.82 }}>{val}<span style={{ color: "#c4141d", fontSize: 170 }}>%</span></div>
      <div style={{ width: "100%", maxWidth: 760, height: 18, borderRadius: 9, background: "#22222a", marginTop: 24, overflow: "hidden" }}>
        <div style={{ width: (p * 100) + "%", height: "100%", background: "#c4141d" }} />
      </div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#bdbdbd", fontSize: 40, fontWeight: 600, marginTop: 22, opacity: sub }}>improved in 90 days</div>
    </div>
  );` },

  // 50 — kinetic-text: words REVEAL one by one (fade + rise). Dark, red knockout middle.
  { seq: 50, slug: "kinetic-text", archetype: "kinetic-text", accepts: [], name: "KineticWordReveal", duration: 4, bg: "#111",
    slotShape: { slots: [{ id: "l1", role: "kicker", maxChars: null, required: true }, { id: "l2", role: "hook", maxChars: null, required: true }, { id: "l3", role: "claim", maxChars: null, required: true }], roleSet: ["kicker", "hook", "claim"] },
    body: `  const a = ce(0.2, 0.35), b = ce(0.7, 0.35), c = ce(1.2, 0.35);
  const line = (op) => ({ fontFamily: "Anton, sans-serif", fontSize: 200, lineHeight: 0.9, textTransform: "uppercase", opacity: op, transform: "translateY(" + ((1 - op) * 26) + "px)" });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
      <div style={{ ...line(a), color: "#fff" }}>TRAIN</div>
      <div style={{ ...line(b), color: "#0a0a0a", background: "#c4141d", display: "inline-block", padding: "0 18px", width: "fit-content" }}>LIKE IT</div>
      <div style={{ ...line(c), color: "#fff" }}>MATTERS</div>
    </div>
  );` },

  // 51 — kinetic-text: words SLAM in (scale overshoot) on a red field.
  { seq: 51, slug: "kinetic-text", archetype: "kinetic-text", accepts: [], name: "KineticSlamStack", duration: 4, bg: "#c4141d",
    slotShape: { slots: [{ id: "l1", role: "kicker", maxChars: null, required: true }, { id: "l2", role: "hook", maxChars: null, required: true }, { id: "l3", role: "claim", maxChars: null, required: true }], roleSet: ["kicker", "hook", "claim"] },
    body: `  const slam = (s) => { const p = Easing.easeOutBack(clamp((t - s) / 0.4, 0, 1)); return { opacity: clamp((t - s) / 0.2, 0, 1), transform: "scale(" + (0.6 + 0.4 * p) + ")" }; };
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 38, letterSpacing: "0.1em", color: "#fff", marginBottom: 18, ...slam(0.2) }}>NO</div>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 360, lineHeight: 0.8, textTransform: "uppercase", color: "#fff", letterSpacing: "-0.02em", transformOrigin: "left center", ...slam(0.6) }}>OFF<br/>DAYS</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 36, letterSpacing: "0.1em", color: "#fff", marginTop: 26, ...slam(1.3) }}>SUMMER PERFORMANCE PROGRAM</div>
    </div>
  );` },

  // 52 — list-steps: numbered rows REVEAL sequentially. Dark.
  { seq: 52, slug: "list-steps", archetype: "list-steps", accepts: [], name: "ListStepsReveal", duration: 4, bg: "#101015",
    slotShape: { slots: [{ id: "heading", role: "hook", maxChars: null, required: true }, { id: "step1", role: "claim", maxChars: null, required: true }, { id: "step2", role: "claim", maxChars: null, required: true }, { id: "step3", role: "claim", maxChars: null, required: true }], roleSet: ["hook", "claim"] },
    body: `  const steps = ["Test the athlete first", "Build the right strength base", "Re-test and prove the gain"];
  const eb = ce(0.1, 0.3);
  const rows = steps.map((s, i) => {
    const g = ce(0.6 + i * 0.45, 0.4);
    return <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 40, borderBottom: "1px solid #23232b", paddingBottom: 28, opacity: g, transform: "translateX(" + ((1 - g) * -30) + "px)" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#c4141d", fontSize: 140, lineHeight: 0.9, width: 120 }}>{i + 1}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontSize: 46, fontWeight: 600 }}>{s}</div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, padding: "120px 72px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.95, marginBottom: 64, opacity: eb }}>3 steps to a<br/><span style={{ color: "#c4141d" }}>faster season</span></div>
      {rows}
    </div>
  );` },

  // 53 — list-steps: a CHECKLIST ticks on one item at a time. Red field.
  { seq: 53, slug: "list-steps", archetype: "list-steps", accepts: [], name: "ListChecklist", duration: 4, bg: "#c4141d",
    slotShape: { slots: [{ id: "heading", role: "hook", maxChars: null, required: true }, { id: "step1", role: "claim", maxChars: null, required: true }, { id: "step2", role: "claim", maxChars: null, required: true }, { id: "step3", role: "claim", maxChars: null, required: true }], roleSet: ["hook", "claim"] },
    body: `  const items = ["A real test on day one", "Coaches who know your sport", "A guarantee in writing"];
  const eb = ce(0.1, 0.3);
  const rows = items.map((s, i) => {
    const g = ce(0.6 + i * 0.5, 0.4);
    return <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 36, opacity: g }}>
      <svg width="78" height="78" viewBox="0 0 92 92"><rect width="92" height="92" rx="20" fill="rgba(255,255,255,0.16)" /><path d="M28 48 l12 12 l24 -28" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - g)} /></svg>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontSize: 46, fontWeight: 600 }}>{s}</div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, padding: "130px 70px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 100, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 70, opacity: eb }}>What you<br/>get</div>
      {rows}
    </div>
  );` },
];

// ============================================================================
//  ACTION-CLIP GIF examples (A3). chrome = held design with media rect(s) = chroma-key.
// ============================================================================
const GIFS = [
  // 47 — split-panel (was coach-portrait): clip left, red panel right. id keeps the
  // coach-portrait slug (a hint only) so the rendered artifact + embedding are preserved.
  { seq: 47, slug: "coach-portrait", archetype: "split-panel", accepts: ["production:cinematic", "subject:coach-face"], duration: 4,
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "name", role: "byline", maxChars: null, required: false }, { id: "title", role: "byline", maxChars: null, required: false }], roleSet: ["hook", "byline"] },
    clips: [{ clip: C.agility, rect: { x: 0, y: 0, w: 562, h: H } }],
    chrome: chromeWrap(`${keyRect('left: 0, top: 0, bottom: 0, width: "52%"')}
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48%", background: "#c4141d", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 86, lineHeight: 0.95, textTransform: "uppercase" }}>Speed is coachable</div>
        <div style={{ width: 80, height: 6, background: "#fff", margin: "28px 0" }} />
        <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontSize: 38, fontWeight: 700 }}>Coach Graham Wilkerson</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#ffd2d4", fontSize: 26, letterSpacing: "0.04em", marginTop: 4 }}>DIRECTOR OF PERFORMANCE</div>
      </div>`) },

  // 54 — split-panel v2 (was coach-portrait): clip RIGHT, ink panel LEFT. id keeps the
  // coach-portrait slug (a hint only) so the rendered artifact + embedding are preserved.
  { seq: 54, slug: "coach-portrait", archetype: "split-panel", accepts: ["production:cinematic", "subject:coach-face"], duration: 4,
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "name", role: "byline", maxChars: null, required: false }, { id: "title", role: "byline", maxChars: null, required: false }], roleSet: ["hook", "byline"] },
    clips: [{ clip: C.band, rect: { x: 497, y: 0, w: 583, h: H } }],
    chrome: chromeWrap(`${keyRect('right: 0, top: 0, bottom: 0, width: "54%"')}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "46%", background: "#16161b", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 26, letterSpacing: "0.08em", marginBottom: 20 }}>MEET YOUR COACH</div>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 84, lineHeight: 0.94, textTransform: "uppercase" }}>20 years on the floor</div>
        <div style={{ width: 80, height: 6, background: "#c4141d", margin: "28px 0" }} />
        <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontSize: 36, fontWeight: 700 }}>Coach Devon Hayes</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#9a9aa3", fontSize: 24, marginTop: 4 }}>HEAD OF STRENGTH</div>
      </div>`) },

  // 55 — action-hero: full-bleed clip + solid lower-third bar (opaque, no gradient so the
  // chroma-key stays clean). Different from the static gradient treatment.
  { seq: 55, slug: "action-hero", archetype: "action-hero", accepts: ["production:cinematic", "subject:athlete-action"], duration: 4,
    slotShape: { slots: [{ id: "eyebrow", role: "eyebrow", maxChars: null, required: true }, { id: "headline", role: "hook", maxChars: null, required: true }], roleSet: ["eyebrow", "hook"] },
    clips: [{ clip: C.box, rect: { x: 0, y: 0, w: W, h: H } }],
    chrome: chromeWrap(`      <div style={{ position: "absolute", left: 70, top: 120, background: "#fff", color: "#c4141d", padding: "10px 22px", borderRadius: 8, fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, fontSize: 32, letterSpacing: "0.04em" }}>CARMEL SPORT PARENTS</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 560, background: "#0d0d10", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 168, lineHeight: 0.88, textTransform: "uppercase" }}>Faster by<br/>the fall</div>
      </div>`) },

  // 56 — action-hero v2: full-bleed + lower-third, different footage + copy.
  { seq: 56, slug: "action-hero", archetype: "action-hero", accepts: ["production:cinematic", "subject:athlete-action"], duration: 4,
    slotShape: { slots: [{ id: "eyebrow", role: "eyebrow", maxChars: null, required: true }, { id: "headline", role: "hook", maxChars: null, required: true }], roleSet: ["eyebrow", "hook"] },
    clips: [{ clip: C.hurdle, rect: { x: 0, y: 0, w: W, h: H } }],
    chrome: chromeWrap(`      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 600, background: "#c4141d", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#ffd2d4", fontSize: 30, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 18 }}>AGES 8–18 · IN + OH</div>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 160, lineHeight: 0.88, textTransform: "uppercase" }}>Earn the<br/>starting spot</div>
      </div>`) },

  // 57 — training-scene: clip in a CONTAINED card on light, headline below.
  { seq: 57, slug: "training-scene", archetype: "training-scene", accepts: ["production:cinematic", "subject:athlete-action", "env:gym"], duration: 4,
    slotShape: { slots: [{ id: "headline", role: "claim", maxChars: null, required: true }, { id: "byline", role: "byline", maxChars: null, required: false }], roleSet: ["claim", "byline"] },
    clips: [{ clip: C.sled, rect: { x: 56, y: 80, w: 968, h: 1040 } }],
    chrome: chromeWrap(`${keyRect('left: 56, top: 80, width: 968, height: 1040, borderRadius: 28')}
      <div style={{ position: "absolute", left: 56, right: 56, top: 1200 }}>
        <div style={{ width: 96, height: 8, background: "#c4141d", marginBottom: 24 }} />
        <div style={{ fontFamily: "Anton, sans-serif", color: "#111", fontSize: 118, lineHeight: 0.92, textTransform: "uppercase" }}>Where Carmel<br/>trains all winter</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#666", fontSize: 30, marginTop: 22, letterSpacing: "0.04em" }}>ATHLETES ACCELERATION · CARMEL, IN</div>
      </div>`, "#f4f4f2") },

  // 58 — training-scene v2: headline top, clip card mid, caption below. Different footage.
  { seq: 58, slug: "training-scene", archetype: "training-scene", accepts: ["production:cinematic", "subject:athlete-action", "env:gym"], duration: 4,
    slotShape: { slots: [{ id: "headline", role: "claim", maxChars: null, required: true }, { id: "byline", role: "byline", maxChars: null, required: false }], roleSet: ["claim", "byline"] },
    clips: [{ clip: C.multi, rect: { x: 64, y: 660, w: 952, h: 560 } }],
    chrome: chromeWrap(`      <div style={{ position: "absolute", left: 64, right: 64, top: 150 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 30, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 18 }}>SMALL-GROUP COACHING</div>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 120, lineHeight: 0.9, textTransform: "uppercase" }}>Every athlete<br/>gets seen</div>
      </div>
      ${keyRect('left: 64, top: 660, width: 952, height: 560, borderRadius: 24')}
      <div style={{ position: "absolute", left: 64, right: 64, top: 1280 }}>
        <div style={{ width: 96, height: 8, background: "#c4141d", marginBottom: 22 }} />
        <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 40, fontWeight: 600, lineHeight: 1.3 }}>No more than eight athletes to a coach, every session.</div>
      </div>`, "#f1efec") },

  // 59 — before-after-split: TWO clips stacked — top grayscale (before), bottom color (after).
  { seq: 59, slug: "before-after-split", archetype: "before-after-split", accepts: ["subject:athlete-action"], duration: 4,
    slotShape: { slots: [{ id: "beforeLabel", role: "kicker", maxChars: null, required: true }, { id: "afterLabel", role: "kicker", maxChars: null, required: true }, { id: "stat", role: "stat", maxChars: null, required: false }], roleSet: ["kicker", "stat"] },
    clips: [{ clip: C.lateral, rect: { x: 0, y: 0, w: W, h: 957 }, grayscale: true }, { clip: C.medball, rect: { x: 0, y: 963, w: W, h: 957 } }],
    chrome: chromeWrap(`${keyRect('left: 0, top: 0, width: ' + W + ', height: 957')}
      ${keyRect('left: 0, top: 963, width: ' + W + ', height: 957')}
      <div style={{ position: "absolute", left: 0, right: 0, top: 957, height: 6, background: "#c4141d" }} />
      <div style={{ position: "absolute", left: 48, top: 40, fontFamily: '"JetBrains Mono", monospace', color: "#fff", fontSize: 36, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(0,0,0,0.55)", padding: "8px 18px" }}>WEEK 1</div>
      <div style={{ position: "absolute", left: 48, top: 1003, fontFamily: '"JetBrains Mono", monospace', color: "#fff", fontSize: 36, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(196,20,29,0.95)", padding: "8px 18px" }}>WEEK 12</div>
      <div style={{ position: "absolute", left: "50%", top: 957, transform: "translate(-50%,-50%)", background: "#0a0a0a", color: "#fff", fontFamily: "Anton, sans-serif", fontSize: 96, padding: "8px 34px" }}>+1 MPH</div>`) },

  // 60 — ugc-selfie: full-bleed clip + handwritten sticker + handle pill (opaque chrome).
  { seq: 60, slug: "ugc-selfie", archetype: "ugc-selfie", accepts: ["production:ugc-selfie", "subject:athlete-face"], duration: 4,
    slotShape: { slots: [{ id: "caption", role: "hook", maxChars: null, required: true }], roleSet: ["hook"] },
    clips: [{ clip: C.lift, rect: { x: 0, y: 0, w: W, h: H } }],
    chrome: chromeWrap(`      <div style={{ position: "absolute", left: 48, top: 120, background: "#fff", color: "#111", padding: "16px 24px", borderRadius: 18, fontFamily: "Caveat, cursive", fontSize: 60, fontWeight: 700, transform: "rotate(-4deg)" }}>day 1 vs day 90</div>
      <div style={{ position: "absolute", left: "50%", bottom: 70, transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.6)", padding: "10px 20px", borderRadius: 999 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#c4141d", color: "#fff", fontFamily: "Anton, sans-serif", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>AA</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#fff", fontSize: 26, letterSpacing: "0.06em" }}>@athletesacceleration</div>
      </div>`) },

  // 61 — ugc-selfie v2: full-bleed clip + bottom caption bar (opaque). Different footage.
  { seq: 61, slug: "ugc-selfie", archetype: "ugc-selfie", accepts: ["production:ugc-selfie", "subject:athlete-face"], duration: 4,
    slotShape: { slots: [{ id: "caption", role: "hook", maxChars: null, required: true }], roleSet: ["hook"] },
    clips: [{ clip: C.lunge, rect: { x: 0, y: 0, w: W, h: H } }],
    chrome: chromeWrap(`      <div style={{ position: "absolute", right: 44, top: 150, background: "#c4141d", color: "#fff", padding: "14px 22px", borderRadius: 16, fontFamily: "Caveat, cursive", fontSize: 58, fontWeight: 700, transform: "rotate(5deg)" }}>+4 inches!!</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 48px 70px", background: "#0d0d10", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Geist, sans-serif", fontWeight: 800, color: "#fff", fontSize: 56, lineHeight: 1.12 }}>she stopped getting passed on the field</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#9a9aa3", fontSize: 26, letterSpacing: "0.06em", marginTop: 16 }}>@ATHLETESACCELERATION</div>
      </div>`) },
];

// ============================================================================
//  STAGED brand-motion examples (round-2, ex-070+). Each wires in a fully-produced
//  brand motion video from brand/video-templates/templates/ AS an example, mapped to
//  a distinct MOTION_ARCHETYPE. render-examples.mjs renders these via stage-motion.mjs
//  (staging the full runtime). slotShape is DERIVED from the source's *_SPEC fields
//  (faithful, not hand-guessed). All clip-free (per the plan: dodge the bgframes path).
//  `dur` = the source SPEC's default length. Distinctness is arbitrated by the embed +
//  Gemini cluster pass; collisions get re-cut or dropped (and their archetype removed).
// ============================================================================
const TPL = "brand/video-templates/templates";
const STAGED = [
  { seq: 70, archetype: "count-up-stats",      src: "stat-reveal-reel",     dur: 6 },
  { seq: 72, archetype: "radar-stats",         src: "athlete-profile",      dur: 7 },
  { seq: 73, archetype: "stopwatch-countdown", src: "beat-the-clock",       dur: 7 },
  { seq: 74, archetype: "bracket-tree",        src: "bracket-reel",         dur: 7 },
  { seq: 75, archetype: "comic-strip",         src: "comic-lesson",         dur: 7 },
  { seq: 76, archetype: "star-testimonial",    src: "five-star-review",     dur: 8 },
  { seq: 77, archetype: "macro-ring",          src: "fuel-up",              dur: 7 },
  { seq: 78, archetype: "scoreboard",          src: "gameday-recap",        dur: 7 },
  { seq: 80, archetype: "streak-counter",      src: "member-milestone",     dur: 7 },
  { seq: 81, archetype: "slot-roll",           src: "pick-workout",         dur: 7 },
  { seq: 82, archetype: "tier-list",           src: "position-rankings",    dur: 8 },
  { seq: 83, archetype: "sprint-trace",        src: "sprint-breakdown",     dur: 8 },
  { seq: 84, archetype: "calendar-fill",       src: "thirty-day-challenge", dur: 8 },
  { seq: 85, archetype: "leaderboard-roll",    src: "top10-leaderboard",    dur: 7 },
  { seq: 87, archetype: "velocity-gauge",      src: "vbt-bar-speed",        dur: 7 },
  { seq: 89, archetype: "anatomy-diagram",     src: "anatomy-lesson",       dur: 8 },
];
// Candidates TRIED in round-2 then CUT for embedding-space collision (≥0.70 cross-
// archetype cosine — measured, not guessed). Kept here so a re-run clears their stale
// manifest rows + rendered artifacts (they remain in ownedIds). Why each was cut:
//   strike-list (three-mistakes)   ~ tier-list 0.749   — numbered text-row stack twins
//   versus-slider (us-vs-them)     ~ strike-list 0.724 — same row-stack region
//   poll-bars (hot-take)           ~ bracket-tree 0.733 — horizontal-bar twins
//   waveform-quote (voiceover)     ~ list-steps 0.712  — collides with a ROUND-1 example
const RETIRED_IDS = [
  "ex-071-strike-list", "ex-086-versus-slider", "ex-079-poll-bars", "ex-088-waveform-quote",
];

// Derive a slotShape from a source motion template's *_SPEC fields. Each copy field
// (text/textarea/number, excluding the duration slider) becomes a slot; its role is
// the field's explicit `role` or, failing that, fieldRole(key) (roles.mjs's field-name
// inference). Roles outside the closed ROLES list are dropped (build-index would block
// them — better to omit than emit an invalid slot). Returns a {slots,roleSet} or null.
function deriveSlotShape(sourceSrc) {
  const m = sourceSrc.match(/fields:\s*\[([\s\S]*?)\]\s*,?\s*\}?;?\s*window\./) || sourceSrc.match(/fields:\s*\[([\s\S]*)\]/);
  if (!m) return null;
  const objs = m[1].match(/\{[^{}]*\}/g) || [];
  const slots = [];
  const seen = new Set();
  for (const o of objs) {
    const key = (o.match(/["']?key["']?\s*:\s*["']([^"']+)["']/) || [])[1];
    const type = (o.match(/["']?type["']?\s*:\s*["']([^"']+)["']/) || [])[1] || "text";
    const explicitRole = (o.match(/["']?role["']?\s*:\s*["']([^"']+)["']/) || [])[1];
    if (!key || key === "duration") continue;
    if (!["text", "textarea", "number"].includes(type)) continue;
    const role = explicitRole || fieldRole(key);
    if (!role || seen.has(key)) continue;
    seen.add(key);
    slots.push({ id: key, role, maxChars: null, required: false });
  }
  if (!slots.length) return null;
  return { slots, roleSet: [...new Set(slots.map((s) => s.role))] };
}

// ---------------------------------------------------------------------------
function assertVideoAllowed(archetype) {
  const spec = specFor(archetype);
  if (!isAnyArchetype(archetype) || !spec || !spec.formats.includes("video")) {
    throw new Error(`author-video: archetype "${archetype}" is not video-capable in the contract. Refusing to emit a format:"video" row the validator would reject.`);
  }
}

function main() {
  mkdirSync(ASSETS_DIR, { recursive: true });

  const plan = [];
  const ownedIds = new Set();
  for (const e of ANIMATED) { const id = makeExampleId(e.seq, e.slug); ownedIds.add(id); plan.push({ id, kind: "animated", e }); }
  for (const g of GIFS) { const id = makeExampleId(g.seq, g.slug); ownedIds.add(id); plan.push({ id, kind: "gif", e: g }); }
  for (const s of STAGED) { const id = makeExampleId(s.seq, s.archetype); ownedIds.add(id); plan.push({ id, kind: "staged", e: s }); }
  // Retired round-2 candidates: own their ids (so mergeManifest drops the stale rows)
  // and delete their rendered artifacts, but emit NO row.
  for (const id of RETIRED_IDS) {
    ownedIds.add(id);
    for (const ext of [".mp4", ".png", ".jsx"]) rmSync(join(EXAMPLES_DIR, `${id}${ext}`), { force: true });
  }

  removeOwnedSources({ examplesDir: EXAMPLES_DIR, assetsDir: ASSETS_DIR, ownedIds });

  const rows = [];
  for (const { id, kind, e } of plan) {
    assertVideoAllowed(e.archetype);
    if (kind === "animated") {
      writeFileSync(join(EXAMPLES_DIR, `${id}.jsx`), stage(e.name, e.duration, e.bg, e.body));
      rows.push({ id, archetype: e.archetype, format: "video", mediaStyleAccepts: e.accepts || [], slotShape: e.slotShape });
    } else if (kind === "gif") {
      writeFileSync(join(EXAMPLES_DIR, `${id}.jsx`), e.chrome);
      rows.push({ id, archetype: e.archetype, format: "video", mediaStyleAccepts: e.accepts || [], slotShape: e.slotShape, render: "gif-composite", gif: { clips: e.clips, duration: e.duration } });
    } else { // staged brand-motion (round-2): slotShape derived from the source SPEC.
      const sourcePath = `${TPL}/${e.src}.jsx`;
      const abs = join(ROOT, sourcePath);
      if (!existsSync(abs)) throw new Error(`author-video: staged source missing: ${sourcePath}`);
      const slotShape = deriveSlotShape(readFileSync(abs, "utf8"));
      if (!slotShape) throw new Error(`author-video: could not derive slotShape for ${e.src} (no *_SPEC fields?)`);
      rows.push({
        id, archetype: e.archetype, format: "video", mediaStyleAccepts: [], slotShape,
        render: "stage-motion", source: sourcePath, stage: { duration: e.dur, width: W, height: H, fps: 30 },
      });
    }
  }

  mergeManifest({ manifestPath: MANIFEST, rows, ownedIds });
  process.stderr.write(`[author-video] wrote ${rows.length} video examples (${ANIMATED.length} animated + ${GIFS.length} gif + ${STAGED.length} staged); static ids preserved\n`);
}

main();

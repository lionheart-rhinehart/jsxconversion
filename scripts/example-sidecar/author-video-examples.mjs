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

  // ── FROM-SCRATCH spectrum sub-looks (round 3, ex-090+). Two per MOTION_ARCHETYPE,
  //    self-contained <Stage> (fallback runtime, raw SVG/div). Bodies use JSX {expr}
  //    + string concat (NO ${} — that would interpolate at generation time), camelCase
  //    SVG, window globals only. Each holds its archetype's gadget silhouette + verb
  //    while varying register/composition/choreography (the SPECTRUM). ──

  // 118 — velocity-gauge (FROM SCRATCH): LIGHT horizontal segmented bar-speed meter + m/s readout. Stays LINEAR.
  { seq: 118, slug: "velocity-gauge", archetype: "velocity-gauge", accepts: [], name: "VeloMeterLight", duration: 5, bg: "#f1efec",
    slotShape: { slots: [{ id: "label", role: "kicker", maxChars: null, required: false }, { id: "stat", role: "stat", maxChars: null, required: true }, { id: "headline", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "stat", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const N = 16, target = 0.78;
  const fill = ce(0.5, 1.5);
  const lit = Math.round(N * target * fill);
  const val = (0.93 * ce(0.6, 1.5)).toFixed(2);
  const head = ce(2.0, 0.45);
  const segs = Array.from({ length: N }, (_, i) => {
    const on = i < lit;
    const zone = i < N * 0.45 ? "#2f7d3a" : i < N * 0.72 ? "#caa12a" : "#c4141d";
    return <div key={i} style={{ flex: 1, borderRadius: 4, background: on ? zone : "#dcd9d3" }} />;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 84px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, opacity: eb, marginBottom: 16 }}>BAR SPEED · BACK SQUAT</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 300, lineHeight: 0.82, opacity: eb }}>{val}<span style={{ fontSize: 96, color: "#c4141d" }}> M/S</span></div>
      <div style={{ display: "flex", gap: 8, height: 92, marginTop: 44 }}>{segs}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 42, fontWeight: 600, marginTop: 36, opacity: head }}>Fast bar speed means explosive power</div>
    </div>
  );` },

  // 119 — velocity-gauge (FROM SCRATCH): DARK vertical bar-speed column + zone bands + big m/s value. LINEAR, vertical.
  { seq: 119, slug: "velocity-gauge", archetype: "velocity-gauge", accepts: [], name: "VeloBarsDark", duration: 5, bg: "#0a0b0d",
    slotShape: { slots: [{ id: "label", role: "kicker", maxChars: null, required: false }, { id: "stat", role: "stat", maxChars: null, required: true }, { id: "headline", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "stat", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const target = 0.82;
  const h = target * ce(0.5, 1.6);
  const val = (1.18 * ce(0.6, 1.6)).toFixed(2);
  const head = ce(2.0, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 76, padding: "120px 70px", boxSizing: "border-box" }}>
      <div style={{ position: "relative", width: 220, height: 1180, borderRadius: 24, background: "#16161d", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "rgba(47,125,58,0.16)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "45%", height: "27%", background: "rgba(202,161,42,0.16)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "72%", height: "28%", background: "rgba(196,20,29,0.16)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: (h * 100) + "%", background: "linear-gradient(to top, #2f7d3a, #caa12a, #c4141d)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: "82%", height: 6, background: "#fff", opacity: 0.8 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 540 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb, marginBottom: 14 }}>PEAK BAR SPEED</div>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 260, lineHeight: 0.8 }}>{val}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#9a9aa3", fontSize: 44, letterSpacing: "0.08em", marginTop: 6, opacity: eb }}>METERS / SEC</div>
        <div style={{ fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 40, fontWeight: 600, marginTop: 30, opacity: head, lineHeight: 1.2 }}>Hit the red zone and the rep is explosive</div>
      </div>
    </div>
  );` },

  // 96 — bracket-tree (FROM SCRATCH): LIGHT 4->2->1 single-elim lattice, connectors stroke in, winners fill red per round.
  { seq: 96, slug: "bracket-tree", archetype: "bracket-tree", accepts: [], name: "BracketLatticeLight", duration: 5, bg: "#f1efec",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "headline", role: "hook", maxChars: null, required: true }, { id: "winner", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const r1 = ce(0.5, 0.4), r2 = ce(1.2, 0.45), r3 = ce(2.0, 0.45);
  const cell = (x, y, w, lit, label, win) => <div style={{ position: "absolute", left: x, top: y, width: w, height: 92, borderRadius: 10, background: win ? "#c4141d" : "#fff", border: "3px solid " + (win ? "#c4141d" : "#dad7d1"), display: "flex", alignItems: "center", paddingLeft: 22, boxSizing: "border-box", fontFamily: "Anton, sans-serif", fontSize: 38, color: win ? "#fff" : "#16161b", opacity: lit, transform: "translateX(" + ((1 - lit) * -18) + "px)" }}>{label}</div>;
  const ln = (x1, y1, x2, y2, op) => <path d={"M" + x1 + " " + y1 + " L" + x2 + " " + y1 + " L" + x2 + " " + y2 + " L" + x1 + " " + y2} stroke="#c9c6c0" strokeWidth="4" fill="none" opacity={op} />;
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 132, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>SUMMER SHOWDOWN</div>
      <div style={{ position: "absolute", left: 64, top: 178, fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 96, textTransform: "uppercase", lineHeight: 0.9, opacity: eb }}>Bracket<br/>night</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {ln(364, 606, 404, 706, r1)}{ln(364, 806, 404, 706, r1)}
        {ln(364, 1066, 404, 1166, r1)}{ln(364, 1266, 404, 1166, r1)}
        {ln(704, 706, 744, 936, r2)}{ln(704, 1166, 744, 936, r2)}
      </svg>
      {cell(64, 560, 300, r1, "Falcons", false)}
      {cell(64, 760, 300, r1, "Hawks", true)}
      {cell(64, 1020, 300, r1, "Wolves", true)}
      {cell(64, 1220, 300, r1, "Bears", false)}
      {cell(404, 660, 300, r2, "Hawks", true)}
      {cell(404, 1120, 300, r2, "Wolves", false)}
      {cell(744, 890, 300, r3, "Hawks", true)}
      <div style={{ position: "absolute", left: 744, top: 1000, width: 300, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 30, fontWeight: 700, letterSpacing: "0.06em", opacity: r3 }}>CHAMPION</div>
    </div>
  );` },

  // 97 — bracket-tree (FROM SCRATCH): DARK VERTICAL bracket, seeds top -> champ bottom, fills per round.
  { seq: 97, slug: "bracket-tree", archetype: "bracket-tree", accepts: [], name: "BracketVerticalDark", duration: 5, bg: "#0c0c11",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "headline", role: "hook", maxChars: null, required: true }, { id: "winner", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const r1 = ce(0.5, 0.4), r2 = ce(1.2, 0.45), r3 = ce(2.0, 0.45);
  const cell = (x, y, lit, label, win) => <div style={{ position: "absolute", left: x, top: y, width: 232, height: 84, borderRadius: 10, background: win ? "#c4141d" : "#17171f", border: "2px solid " + (win ? "#c4141d" : "#2b2b35"), display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", fontFamily: "Anton, sans-serif", fontSize: 34, color: win ? "#fff" : "#cfcfcf", opacity: lit, transform: "translateY(" + ((1 - lit) * -14) + "px)" }}>{label}</div>;
  const ln = (x1, y1, x2, y2, op) => <path d={"M" + x1 + " " + y1 + " L" + x1 + " " + y2 + " L" + x2 + " " + y2} stroke="#33333d" strokeWidth="4" fill="none" opacity={op} />;
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>PLAYOFFS</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 168, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", opacity: eb }}>Road to #1</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {ln(176, 444, 424, 444, r1)}{ln(424, 444, 424, 700, r2)}
        {ln(656, 444, 904, 444, r1)}{ln(656, 444, 656, 700, r2)}
        {ln(540, 700, 540, 1020, r3)}
      </svg>
      {cell(60, 360, r1, "Falcons", false)}
      {cell(316, 360, r1, "Hawks", true)}
      {cell(548, 360, r1, "Wolves", true)}
      {cell(788, 360, r1, "Bears", false)}
      {cell(308, 660, r2, "Hawks", true)}
      {cell(540, 660, r2, "Wolves", false)}
      {cell(424, 980, r3, "Hawks", true)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, fontWeight: 700, letterSpacing: "0.08em", opacity: r3 }}>STATE CHAMPS</div>
    </div>
  );` },

  // 120 — anatomy-diagram (FROM SCRATCH): LIGHT body silhouette + leader-line callouts drawing out sequentially.
  { seq: 120, slug: "anatomy-diagram", archetype: "anatomy-diagram", accepts: [], name: "AnatomyCalloutsLight", duration: 5, bg: "#eef0f2",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "headline", role: "hook", maxChars: null, required: true }, { id: "muscle", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const fig = ce(0.4, 0.5);
  const c1 = ce(1.1, 0.4), c2 = ce(1.6, 0.4), c3 = ce(2.1, 0.4);
  const tag = (x, y, lit, label) => <div style={{ position: "absolute", left: x, top: y, fontFamily: '"JetBrains Mono", monospace', fontSize: 30, fontWeight: 700, letterSpacing: "0.06em", color: "#16161b", opacity: lit, transform: "translateX(" + ((1 - lit) * 14) + "px)" }}>{label}</div>;
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 130, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>WHAT MAKES YOU FAST</div>
      <div style={{ position: "absolute", left: 64, top: 176, fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 96, textTransform: "uppercase", lineHeight: 0.9, opacity: eb }}>The sprint<br/>engine</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: fig }}>
        <circle cx="540" cy="560" r="62" fill="#16161b" />
        <rect x="470" y="640" width="140" height="300" rx="40" fill="#16161b" />
        <rect x="406" y="660" width="56" height="250" rx="28" fill="#16161b" transform="rotate(8 434 660)" />
        <rect x="618" y="660" width="56" height="250" rx="28" fill="#16161b" transform="rotate(-8 646 660)" />
        <rect x="486" y="930" width="50" height="320" rx="25" fill="#16161b" />
        <rect x="544" y="930" width="50" height="320" rx="25" fill="#16161b" />
        <circle cx="540" cy="780" r="11" fill="#c4141d" opacity={c1} />
        <circle cx="512" cy="1010" r="11" fill="#c4141d" opacity={c2} />
        <circle cx="568" cy="1170" r="11" fill="#c4141d" opacity={c3} />
        <path d="M540 780 L760 780" stroke="#c4141d" strokeWidth="4" strokeDasharray="220" strokeDashoffset={220 * (1 - c1)} />
        <path d="M512 1010 L300 1010" stroke="#c4141d" strokeWidth="4" strokeDasharray="212" strokeDashoffset={212 * (1 - c2)} />
        <path d="M568 1170 L788 1170" stroke="#c4141d" strokeWidth="4" strokeDasharray="220" strokeDashoffset={220 * (1 - c3)} />
      </svg>
      {tag(772, 764, c1, "CORE")}
      {tag(150, 994, c2, "GLUTES")}
      {tag(800, 1154, c3, "HAMSTRINGS")}
    </div>
  );` },

  // 121 — anatomy-diagram (FROM SCRATCH): DARK single highlighted muscle region pulsing + one big callout.
  { seq: 121, slug: "anatomy-diagram", archetype: "anatomy-diagram", accepts: [], name: "AnatomyMuscleDark", duration: 5, bg: "#0a0b0d",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "headline", role: "hook", maxChars: null, required: true }, { id: "muscle", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const fig = ce(0.4, 0.5);
  const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 4));
  const lead = ce(1.2, 0.5);
  const head = ce(2.0, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>POWER STARTS HERE</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: fig }}>
        <rect x="476" y="520" width="128" height="300" rx="40" fill="#1b1c22" />
        <rect x="492" y="800" width="44" height="360" rx="22" fill="#1b1c22" />
        <rect x="544" y="800" width="44" height="360" rx="22" fill="#1b1c22" />
        <ellipse cx="540" cy="840" rx="92" ry="120" fill="#c4141d" opacity={pulse * fig} />
        <path d="M620 840 L820 760" stroke="#c4141d" strokeWidth="4" strokeDasharray="216" strokeDashoffset={216 * (1 - lead)} />
        <circle cx="620" cy="840" r="11" fill="#c4141d" opacity={lead} />
      </svg>
      <div style={{ position: "absolute", left: 740, top: 700, fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 88, textTransform: "uppercase", lineHeight: 0.86, opacity: lead }}>Glutes</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 44, fontWeight: 600, opacity: head, padding: "0 80px", boxSizing: "border-box" }}>The biggest sprint muscle most kids never train</div>
    </div>
  );` },

  // 90 — count-up-stats (FROM SCRATCH): LIGHT one giant numeral counting up + underline wipe. Giant numeral (not list).
  { seq: 90, slug: "count-up-stats", archetype: "count-up-stats", accepts: [], name: "CountUpHeroLight", duration: 5, bg: "#f3f1ee",
    slotShape: { slots: [{ id: "label", role: "kicker", maxChars: null, required: false }, { id: "stat", role: "stat", maxChars: null, required: true }, { id: "sub", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "stat", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const p = ce(0.5, 1.6);
  const val = Math.round(430 * p);
  const uw = ce(0.6, 1.3);
  const head = ce(2.0, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 70px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 36, letterSpacing: "0.16em", fontWeight: 700, opacity: eb, marginBottom: 8 }}>ATHLETES TRAINED</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 460, lineHeight: 0.8 }}><span style={{ color: "#c4141d" }}>+</span>{val}</div>
      <div style={{ width: 540, height: 12, background: "#dcd9d3", marginTop: 22, overflow: "hidden" }}><div style={{ width: (uw * 100) + "%", height: "100%", background: "#c4141d" }} /></div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 46, fontWeight: 600, marginTop: 30, opacity: head }}>and counting, since 2014</div>
    </div>
  );` },

  // 91 — count-up-stats (FROM SCRATCH): DARK 3-up giant numerals counting up staggered + red bars. Numerals huge (not list).
  { seq: 91, slug: "count-up-stats", archetype: "count-up-stats", accepts: [], name: "CountUpTriadLight", duration: 5, bg: "#eef0f2",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "stat", role: "stat", maxChars: null, required: true }], roleSet: ["hook", "stat"] },
    body: `  const eb = ce(0.1, 0.3);
  const stats = [[12, "MPH TOP SPEED", 0.5], [38, "IN VERTICAL", 0.8], [9, "LBS LEANER", 1.1]];
  const cols = stats.map((s, i) => {
    const g = ce(s[2], 1.2);
    const v = Math.round(s[0] * g);
    return <div key={i} style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: i === 1 ? "#c4141d" : "#16161b", fontSize: 256, lineHeight: 0.8 }}>{v}</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#777", fontSize: 26, letterSpacing: "0.06em", marginTop: 22 }}>{s[1]}</div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 100, textTransform: "uppercase", lineHeight: 0.9, marginBottom: 86, opacity: eb }}>One summer.<br/><span style={{ color: "#c4141d" }}>Three wins.</span></div>
      <div style={{ display: "flex", gap: 30 }}>{cols}</div>
    </div>
  );` },

  // 98 — comic-strip (FROM SCRATCH): LIGHT 3-panel vertical strip, bold gutters, panels pop in (easeOutBack).
  { seq: 98, slug: "comic-strip", archetype: "comic-strip", accepts: [], name: "ComicStripLight", duration: 5, bg: "#1c1c22",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "caption", role: "claim", maxChars: null, required: false }], roleSet: ["hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const panels = [["#f2c14e", "DAY 1", "Can't touch the rim"], ["#e07a5f", "WEEK 6", "Fingertips on net"], ["#c4141d", "DAY 90", "First dunk"]];
  const rows = panels.map((p, i) => {
    const g = Easing.easeOutBack(clamp((t - (0.5 + i * 0.45)) / 0.5, 0, 1));
    return <div key={i} style={{ flex: 1, margin: "0 0 18px", borderRadius: 14, background: p[0], border: "6px solid #0a0b0d", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 30, boxSizing: "border-box", opacity: clamp(g, 0, 1), transform: "scale(" + (0.86 + 0.14 * g) + ")" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#0a0b0d", fontSize: 28, fontWeight: 700, letterSpacing: "0.08em" }}>{p[1]}</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#0a0b0d", fontSize: 64, textTransform: "uppercase", lineHeight: 0.94 }}>{p[2]}</div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "84px 60px 64px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 84, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 26, opacity: eb }}>The 90-day<br/><span style={{ color: "#f2c14e" }}>glow-up</span></div>
      {rows}
    </div>
  );` },

  // 99 — comic-strip (FROM SCRATCH): DARK 2x2 grid with speech-bubble callouts drawing in.
  { seq: 99, slug: "comic-strip", archetype: "comic-strip", accepts: [], name: "ComicGridDark", duration: 5, bg: "#0c0c11",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }], roleSet: ["hook"] },
    body: `  const eb = ce(0.1, 0.3);
  const cells = [["#c4141d", "POW!"], ["#f2c14e", "ZOOM"], ["#3a86a8", "BAM!"], ["#16161b", "WIN"]];
  const grid = cells.map((c, i) => {
    const g = Easing.easeOutBack(clamp((t - (0.5 + i * 0.3)) / 0.5, 0, 1));
    return <div key={i} style={{ background: c[0], border: "6px solid #fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp(g, 0, 1), transform: "scale(" + (0.8 + 0.2 * g) + ")" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 96, textTransform: "uppercase", transform: "rotate(-6deg)" }}>{c[1]}</div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "96px 64px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.9, marginBottom: 40, opacity: eb }}>Every rep<br/>is a panel</div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 22 }}>{grid}</div>
    </div>
  );` },

  // 100 — star-testimonial (FROM SCRATCH): LIGHT card, 5 stars fill L->R + pulled quote + attribution rule.
  { seq: 100, slug: "star-testimonial", archetype: "star-testimonial", accepts: [], name: "StarCardLight", duration: 5, bg: "#f3f1ee",
    slotShape: { slots: [{ id: "quote", role: "testimonial", maxChars: null, required: true }, { id: "byline", role: "byline", maxChars: null, required: false }], roleSet: ["testimonial", "byline"] },
    body: `  const eb = ce(0.1, 0.3);
  const star = '<path d="M46 12 l10 22 24 3 -18 17 5 24 -21 -12 -21 12 5 -24 -18 -17 24 -3 z"/>';
  const stars = Array.from({ length: 5 }, (_, i) => {
    const g = clamp((t - (0.5 + i * 0.18)) / 0.3, 0, 1);
    return <svg key={i} width="120" height="120" viewBox="0 0 92 92" style={{ opacity: g, transform: "scale(" + (0.6 + 0.4 * g) + ")" }}><path d="M46 12 l10 22 24 3 -18 17 5 24 -21 -12 -21 12 5 -24 -18 -17 24 -3 z" fill="#e0a526" /></svg>;
  });
  const q = ce(1.6, 0.5);
  const by = ce(2.4, 0.4);
  void star;
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 84px" }}>
      <div style={{ display: "flex", gap: 6, opacity: eb, marginBottom: 36 }}>{stars}</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 92, lineHeight: 1.02, textTransform: "uppercase", opacity: q, transform: "translateY(" + ((1 - q) * 16) + "px)" }}>"My son finally believes he belongs on the field."</div>
      <div style={{ width: 96, height: 8, background: "#c4141d", margin: "40px 0 22px", opacity: by }} />
      <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 42, fontWeight: 700, opacity: by }}>Jenna M. · soccer mom, Carmel</div>
    </div>
  );` },

  // 101 — star-testimonial (FROM SCRATCH): FULL-RED one oversized star + rating counting up inside + quote.
  { seq: 101, slug: "star-testimonial", archetype: "star-testimonial", accepts: [], name: "StarBigRed", duration: 5, bg: "#c4141d",
    slotShape: { slots: [{ id: "quote", role: "testimonial", maxChars: null, required: true }, { id: "stat", role: "stat", maxChars: null, required: false }], roleSet: ["testimonial", "stat"] },
    body: `  const eb = ce(0.1, 0.3);
  const draw = ce(0.5, 1.1);
  const rating = (5 * ce(0.7, 1.2)).toFixed(1);
  const q = ce(2.0, 0.5);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg viewBox="0 0 92 92" style={{ position: "absolute", left: "50%", top: 360, width: 620, transform: "translateX(-50%)" }}>
        <path d="M46 10 l11 24 26 3 -19.5 18 5.5 26 -23 -13 -23 13 5.5 -26 -19.5 -18 26 -3 z" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="320" strokeDashoffset={320 * (1 - draw)} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 200, opacity: eb }}>{rating}</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 980, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 76, lineHeight: 1.04, textTransform: "uppercase", opacity: q }}>"Best decision we've made for her training."</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1320, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#ffd2d4", fontSize: 30, letterSpacing: "0.1em", opacity: q }}>200+ FIVE-STAR REVIEWS</div>
    </div>
  );` },

  // 106 — streak-counter (FROM SCRATCH): LIGHT row of day-cells igniting one-by-one + big session counter.
  { seq: 106, slug: "streak-counter", archetype: "streak-counter", accepts: [], name: "StreakCellsLight", duration: 5, bg: "#f3f1ee",
    slotShape: { slots: [{ id: "label", role: "kicker", maxChars: null, required: false }, { id: "stat", role: "stat", maxChars: null, required: true }, { id: "sub", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "stat", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const N = 24;
  const lit = Math.round(N * ce(0.5, 1.7));
  const val = Math.round(24 * ce(0.6, 1.6));
  const head = ce(2.2, 0.45);
  const cells = Array.from({ length: N }, (_, i) => <div key={i} style={{ width: 64, height: 64, borderRadius: 12, background: i < lit ? "#c4141d" : "#dcd9d3" }} />);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, opacity: eb, marginBottom: 6 }}>SESSION STREAK</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 340, lineHeight: 0.82 }}>{val}<span style={{ fontSize: 100, color: "#c4141d" }}> DAYS</span></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 36, maxWidth: 920 }}>{cells}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 44, fontWeight: 600, marginTop: 40, opacity: head }}>Show up. Stack the days. Get faster.</div>
    </div>
  );` },

  // 107 — streak-counter (FROM SCRATCH): DARK single large flame flickering + number ticking inside.
  { seq: 107, slug: "streak-counter", archetype: "streak-counter", accepts: [], name: "StreakFlameDark", duration: 5, bg: "#0a0b0d",
    slotShape: { slots: [{ id: "stat", role: "stat", maxChars: null, required: true }, { id: "sub", role: "claim", maxChars: null, required: false }], roleSet: ["stat", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const grow = ce(0.5, 0.7);
  const flick = 0.92 + 0.08 * Math.sin(t * 9);
  const val = Math.round(31 * ce(0.6, 1.4));
  const head = ce(2.2, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg viewBox="0 0 200 280" style={{ position: "absolute", left: "50%", top: 380, width: 560, transform: "translateX(-50%) scaleY(" + (grow * flick) + ")", transformOrigin: "bottom" }}>
        <path d="M100 20 C150 90 170 130 150 190 C140 240 60 240 50 190 C40 150 70 150 70 120 C70 150 95 150 100 110 C105 150 130 150 130 175 C140 130 110 80 100 20 Z" fill="#c4141d" />
        <path d="M100 120 C125 160 130 185 115 215 C108 238 72 238 75 205 C77 180 95 180 95 160 C95 180 105 175 100 120 Z" fill="#f2a23e" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 200, opacity: eb }}>{val}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#f2a23e", fontSize: 36, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>WEEK STREAK</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1280, textAlign: "center", fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 44, fontWeight: 600, opacity: head }}>Consistency is the real cheat code</div>
    </div>
  );` },

  // 108 — slot-roll (FROM SCRATCH): LIGHT 3 reels decaying speed, settle one-by-one into a red selection window.
  { seq: 108, slug: "slot-roll", archetype: "slot-roll", accepts: [], name: "SlotReelsLight", duration: 5, bg: "#f3f1ee",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "result", role: "claim", maxChars: null, required: false }], roleSet: ["hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const FACE = ["SPEED", "JUMP", "AGILITY", "POWER", "CORE", "SPRINT"];
  const reel = (x, stopT, finalIdx) => {
    const settled = clamp((t - stopT) / 0.4, 0, 1);
    const spin = clamp((stopT + 0.4 - t) / stopT, 0, 1);
    const idx = settled >= 1 ? finalIdx : Math.floor((t * 22) % FACE.length);
    return <div key={x} style={{ flex: 1, height: 220, borderRadius: 16, background: "#fff", border: "4px solid " + (settled >= 1 ? "#c4141d" : "#dad7d1"), display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ fontFamily: "Anton, sans-serif", fontSize: 64, textTransform: "uppercase", color: settled >= 1 ? "#c4141d" : "#16161b", transform: "translateY(" + (spin * -18) + "px)", opacity: 0.5 + 0.5 * (1 - spin) }}>{FACE[idx]}</div>
    </div>;
  };
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 96, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 50, opacity: eb }}>Spin your<br/><span style={{ color: "#c4141d" }}>focus block</span></div>
      <div style={{ display: "flex", gap: 22 }}>{reel(0, 1.2, 0)}{reel(1, 1.8, 5)}{reel(2, 2.4, 3)}</div>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#777", fontSize: 32, letterSpacing: "0.08em", marginTop: 40, opacity: ce(2.8, 0.4) }}>TODAY: SPEED · SPRINT · POWER</div>
    </div>
  );` },

  // 109 — slot-roll (FROM SCRATCH): DARK single tall reel decelerating (easeOutExpo) and locking.
  { seq: 109, slug: "slot-roll", archetype: "slot-roll", accepts: [], name: "SlotSingleDark", duration: 5, bg: "#0c0c11",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "result", role: "claim", maxChars: null, required: false }], roleSet: ["hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const FACE = ["BROAD JUMP", "SLED PUSH", "MED BALL", "HURDLE HOPS", "SPRINT 20", "LATERAL"];
  const prog = Easing.easeOutExpo(ce(0.5, 2.0));
  const offset = (1 - prog) * 1800;
  const lock = ce(2.4, 0.4);
  const items = FACE.map((f, i) => <div key={i} style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize: 80, textTransform: "uppercase", color: (i === 4 && lock > 0.5) ? "#c4141d" : "#fff" }}>{f}</div>);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, opacity: eb, marginBottom: 26 }}>TODAY'S DRILL</div>
      <div style={{ position: "relative", width: 760, height: 220, overflow: "hidden", borderTop: "4px solid #c4141d", borderBottom: "4px solid #c4141d" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 35, transform: "translateY(" + (-offset % 900) + "px)" }}>{items}{items}</div>
      </div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 42, fontWeight: 600, marginTop: 44, opacity: lock }}>The board picks. You just go.</div>
    </div>
  );` },

  // 92 — radar-stats (FROM SCRATCH): LIGHT 5-axis polygon, no grid, lower-offset + headline rail. CLOSED polygon (not a line).
  { seq: 92, slug: "radar-stats", archetype: "radar-stats", accepts: [], name: "RadarPentaLight", duration: 5, bg: "#eef0f2",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "headline", role: "hook", maxChars: null, required: true }], roleSet: ["kicker", "hook"] },
    body: `  const eb = ce(0.1, 0.3);
  const draw = ce(0.5, 1.6);
  const head = ce(2.2, 0.45);
  const N = 5, cx = 540, cy = 1180, R = 360;
  const vals = [0.92, 0.68, 0.85, 0.6, 0.8];
  const labels = ["SPEED", "POWER", "AGILITY", "STRENGTH", "STAMINA"];
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const poly = vals.map((v, i) => { const p = pt(i, R * v * draw); return p[0] + "," + p[1]; }).join(" ");
  const ring = vals.map((v, i) => { const p = pt(i, R); return p[0] + "," + p[1]; }).join(" ");
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 150, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>ATHLETE PROFILE</div>
      <div style={{ position: "absolute", left: 64, top: 196, fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 96, textTransform: "uppercase", lineHeight: 0.9, opacity: eb }}>The full<br/>picture</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <polygon points={ring} fill="none" stroke="#cdd2d6" strokeWidth="2" />
        <polygon points={poly} fill="rgba(196,20,29,0.16)" stroke="#c4141d" strokeWidth="6" strokeLinejoin="round" />
        {labels.map((l, i) => { const p = pt(i, R + 54); return <text key={i} x={p[0]} y={p[1]} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="26" fontWeight="700" fill="#16161b" opacity={head}>{l}</text>; })}
      </svg>
    </div>
  );` },

  // 93 — radar-stats (FROM SCRATCH): DARK 6-axis polygon drawing vertex-by-vertex, labels sequential. CLOSED polygon.
  { seq: 93, slug: "radar-stats", archetype: "radar-stats", accepts: [], name: "RadarHexDark", duration: 5, bg: "#0a0b0d",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "headline", role: "hook", maxChars: null, required: true }], roleSet: ["kicker", "hook"] },
    body: `  const eb = ce(0.1, 0.3);
  const N = 6, cx = 540, cy = 1000, R = 380;
  const vals = [0.9, 0.75, 0.82, 0.6, 0.7, 0.88];
  const labels = ["SPEED", "POWER", "AGILITY", "MOBILITY", "STRENGTH", "STAMINA"];
  const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const prog = ce(0.5, 1.8) * N;
  const poly = vals.map((v, i) => { const seg = clamp(prog - i, 0, 1); const p = pt(i, R * v * seg); return p[0] + "," + p[1]; }).join(" ");
  const ring1 = vals.map((v, i) => { const p = pt(i, R); return p[0] + "," + p[1]; }).join(" ");
  const ring2 = vals.map((v, i) => { const p = pt(i, R * 0.5); return p[0] + "," + p[1]; }).join(" ");
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>SCOUTING REPORT</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <polygon points={ring1} fill="none" stroke="#23232b" strokeWidth="2" />
        <polygon points={ring2} fill="none" stroke="#23232b" strokeWidth="2" />
        <polygon points={poly} fill="rgba(196,20,29,0.22)" stroke="#c4141d" strokeWidth="6" strokeLinejoin="round" />
        {labels.map((l, i) => { const p = pt(i, R + 56); return <text key={i} x={p[0]} y={p[1]} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="24" fontWeight="700" fill="#cfcfcf" opacity={clamp(prog - i, 0, 1)}>{l}</text>; })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontFamily: "Geist, sans-serif", color: "#9a9aa3", fontSize: 40, fontWeight: 600, opacity: ce(2.6, 0.45) }}>Every athlete gets a full workup</div>
    </div>
  );` },

  // 94 — stopwatch-countdown (FROM SCRATCH): LIGHT thin circular progress arc + center mono digit counting DOWN. The ONE circular gauge.
  { seq: 94, slug: "stopwatch-countdown", archetype: "stopwatch-countdown", accepts: [], name: "StopwatchArcLight", duration: 5, bg: "#f1efec",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "stat", role: "stat", maxChars: null, required: true }, { id: "sub", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "stat", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const R = 320, C = 2 * Math.PI * R;
  const sweep = ce(0.5, 2.2);
  const remain = (10 - Math.round(10 * sweep)).toString().padStart(2, "0");
  const head = ce(2.4, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 36, letterSpacing: "0.16em", fontWeight: 700, opacity: eb }}>REST CLOCK</div>
      <svg viewBox="0 0 800 800" style={{ position: "absolute", left: "50%", top: 480, width: 760, transform: "translateX(-50%)" }}>
        <circle cx="400" cy="400" r={R} stroke="#dcd9d3" strokeWidth="36" fill="none" />
        <circle cx="400" cy="400" r={R} stroke="#c4141d" strokeWidth="36" fill="none" strokeLinecap="round" strokeDasharray={(C * sweep).toFixed(1) + " " + C.toFixed(1)} transform="rotate(-90 400 400)" />
        <text x="400" y="400" textAnchor="middle" dominantBaseline="central" fontFamily="JetBrains Mono, monospace" fontWeight="800" fontSize="280" fill="#16161b">:{remain}</text>
      </svg>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1330, textAlign: "center", fontFamily: "Geist, sans-serif", color: "#444", fontSize: 44, fontWeight: 600, opacity: head }}>Full rest is part of the program</div>
    </div>
  );` },

  // 95 — stopwatch-countdown (FROM SCRATCH): DARK seven-seg digital readout + horizontal tick bar draining. Non-circular.
  { seq: 95, slug: "stopwatch-countdown", archetype: "stopwatch-countdown", accepts: [], name: "StopwatchDigitalDark", duration: 5, bg: "#0a0b0d",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "stat", role: "stat", maxChars: null, required: true }, { id: "sub", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "stat", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const p = ce(0.5, 2.2);
  const total = 45 - Math.round(45 * p);
  const mm = Math.floor(total / 60).toString().padStart(2, "0");
  const ss = (total % 60).toString().padStart(2, "0");
  const ticks = Array.from({ length: 30 }, (_, i) => <div key={i} style={{ flex: 1, height: i % 5 === 0 ? 56 : 36, background: (i / 30) < (1 - p) ? "#c4141d" : "#23232b" }} />);
  const head = ce(2.4, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 36, letterSpacing: "0.16em", fontWeight: 700, opacity: eb, marginBottom: 20, textAlign: "center" }}>WORK INTERVAL</div>
      <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#fff", fontWeight: 800, fontSize: 340, lineHeight: 0.9, textAlign: "center", letterSpacing: "0.02em" }}>{mm}:{ss}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 64, marginTop: 50 }}>{ticks}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 42, fontWeight: 600, marginTop: 44, textAlign: "center", opacity: head }}>Beat the clock, earn the rest</div>
    </div>
  );` },

  // 102 — macro-ring (FROM SCRATCH): LIGHT three concentric rings sweeping to different %s + center totals. MULTIPLE rings (not a clock hand).
  { seq: 102, slug: "macro-ring", archetype: "macro-ring", accepts: [], name: "MacroTripleLight", duration: 5, bg: "#f3f1ee",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "headline", role: "hook", maxChars: null, required: true }], roleSet: ["kicker", "hook"] },
    body: `  const eb = ce(0.1, 0.3);
  const sweep = ce(0.5, 1.7);
  const rings = [[300, "#c4141d", 0.82], [232, "#e0a526", 0.66], [164, "#3a7d44", 0.9]];
  const head = ce(2.2, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>FUEL THE WORK</div>
      <svg viewBox="0 0 800 800" style={{ position: "absolute", left: "50%", top: 470, width: 740, transform: "translateX(-50%)" }}>
        {rings.map((r, i) => { const C = 2 * Math.PI * r[0]; return <g key={i}><circle cx="400" cy="400" r={r[0]} stroke="#e4e1db" strokeWidth="34" fill="none" /><circle cx="400" cy="400" r={r[0]} stroke={r[1]} strokeWidth="34" fill="none" strokeLinecap="round" strokeDasharray={(C * r[2] * sweep).toFixed(1) + " " + C.toFixed(1)} transform="rotate(-90 400 400)" /></g>; })}
        <text x="400" y="380" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="120" fill="#16161b">{Math.round(2100 * sweep)}</text>
        <text x="400" y="460" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="34" fontWeight="700" fill="#777">KCAL / DAY</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 76, textTransform: "uppercase", opacity: head }}>Eat to perform</div>
    </div>
  );` },

  // 103 — macro-ring (FROM SCRATCH): DARK single thick ring + macro legend animating in. Ring + legend (not clock).
  { seq: 103, slug: "macro-ring", archetype: "macro-ring", accepts: [], name: "MacroLegendDark", duration: 5, bg: "#0c0c11",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "headline", role: "hook", maxChars: null, required: true }], roleSet: ["kicker", "hook"] },
    body: `  const eb = ce(0.1, 0.3);
  const sweep = ce(0.5, 1.8);
  const R = 300, C = 2 * Math.PI * R;
  const segs = [[0.45, "#c4141d", "PROTEIN"], [0.33, "#e0a526", "CARBS"], [0.22, "#3a7d44", "FATS"]];
  let acc = 0;
  const head = ce(2.2, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>DAILY MACROS</div>
      <svg viewBox="0 0 800 800" style={{ position: "absolute", left: "50%", top: 380, width: 700, transform: "translateX(-50%)" }}>
        <circle cx="400" cy="400" r={R} stroke="#1a1a22" strokeWidth="60" fill="none" />
        {segs.map((s, i) => { const start = acc; acc += s[0]; return <circle key={i} cx="400" cy="400" r={R} stroke={s[1]} strokeWidth="60" fill="none" strokeDasharray={(C * s[0] * sweep).toFixed(1) + " " + C.toFixed(1)} strokeDashoffset={(-C * start * sweep).toFixed(1)} transform="rotate(-90 400 400)" />; })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center", gap: 40, opacity: head }}>
        {segs.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 26, height: 26, borderRadius: 6, background: s[1] }} /><div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#cfcfcf", fontSize: 30, fontWeight: 700 }}>{s[2]}</div></div>)}
      </div>
    </div>
  );` },

  // 104 — scoreboard (FROM SCRATCH): LIGHT arena HOME|AWAY panel, digit tallies + clock strip. Boxy panels (not a path).
  { seq: 104, slug: "scoreboard", archetype: "scoreboard", accepts: [], name: "ScoreboardArenaLight", duration: 5, bg: "#e9eaec",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "stat", role: "stat", maxChars: null, required: false }], roleSet: ["hook", "stat"] },
    body: `  const eb = ce(0.1, 0.3);
  const hs = Math.round(4 * ce(0.6, 1.4));
  const as = Math.round(2 * ce(0.9, 1.3));
  const head = ce(2.2, 0.45);
  const panel = (label, score, bg) => <div style={{ flex: 1, background: bg, borderRadius: 16, padding: "40px 0", textAlign: "center" }}>
    <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#fff", fontSize: 36, letterSpacing: "0.1em", fontWeight: 700, opacity: 0.8 }}>{label}</div>
    <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 280, lineHeight: 0.9 }}>{score}</div>
  </div>;
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 92, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 40, opacity: eb }}>Friday night<br/>lights</div>
      <div style={{ display: "flex", gap: 22 }}>{panel("HOME", hs, "#16161b")}{panel("AWAY", as, "#c4141d")}</div>
      <div style={{ marginTop: 26, background: "#16161b", borderRadius: 12, padding: "22px", textAlign: "center", fontFamily: "JetBrains Mono, monospace", color: "#fff", fontSize: 40, letterSpacing: "0.1em", opacity: head }}>4TH · 02:14</div>
    </div>
  );` },

  // 105 — scoreboard (FROM SCRATCH): DARK LED dot-matrix big mono digits counting up + red divider. Boxy.
  { seq: 105, slug: "scoreboard", archetype: "scoreboard", accepts: [], name: "ScoreboardLedDark", duration: 5, bg: "#08080b",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "stat", role: "stat", maxChars: null, required: false }], roleSet: ["hook", "stat"] },
    body: `  const eb = ce(0.1, 0.3);
  const v = Math.round(112 * ce(0.6, 1.6));
  const head = ce(2.2, 0.45);
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 34, letterSpacing: "0.16em", fontWeight: 700, opacity: eb, marginBottom: 20 }}>SEASON POINTS</div>
      <div style={{ background: "#101015", border: "3px solid #1d1d26", borderRadius: 20, padding: "60px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#ff3b3b", fontWeight: 800, fontSize: 360, lineHeight: 0.86, textShadow: "0 0 40px rgba(255,59,59,0.5)" }}>{v}</div>
        <div style={{ height: 5, background: "#c4141d", margin: "30px auto", width: "60%" }} />
        <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#7a7a85", fontSize: 38, letterSpacing: "0.14em" }}>TEAM RECORD</div>
      </div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 42, fontWeight: 600, marginTop: 40, textAlign: "center", opacity: head }}>Numbers that put us on the map</div>
    </div>
  );` },

  // 110 — tier-list (FROM SCRATCH): LIGHT S/A/B colored BANDS + letter rail, item chips slide in. Bands+letters (not rows/grid).
  { seq: 110, slug: "tier-list", archetype: "tier-list", accepts: [], name: "TierBandsLight", duration: 5, bg: "#f3f1ee",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "items", role: "claim", maxChars: null, required: false }], roleSet: ["hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const tiers = [["S", "#c4141d", ["Game speed", "Vertical jump"]], ["A", "#e0822e", ["Lateral agility", "Core strength"]], ["B", "#3a7d44", ["Mobility", "Conditioning"]]];
  const rows = tiers.map((tr, i) => {
    const g = ce(0.5 + i * 0.35, 0.4);
    return <div key={i} style={{ display: "flex", alignItems: "stretch", height: 200, marginBottom: 22, opacity: g, transform: "translateX(" + ((1 - g) * 40) + "px)" }}>
      <div style={{ width: 150, background: tr[1], borderRadius: "16px 0 0 16px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 110 }}>{tr[0]}</div>
      <div style={{ flex: 1, background: "#fff", borderRadius: "0 16px 16px 0", display: "flex", alignItems: "center", gap: 18, padding: "0 32px", flexWrap: "wrap" }}>
        {tr[2].map((c, j) => <div key={j} style={{ background: "#f0ece6", borderRadius: 999, padding: "16px 28px", fontFamily: "Geist, sans-serif", fontWeight: 700, fontSize: 40, color: "#16161b" }}>{c}</div>)}
      </div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 60px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 92, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 50, opacity: eb }}>What we<br/><span style={{ color: "#c4141d" }}>build first</span></div>
      {rows}
    </div>
  );` },

  // 111 — tier-list (FROM SCRATCH): DARK vertical tier COLUMNS, S/A/B headers grow in. Bands+letters, vertical.
  { seq: 111, slug: "tier-list", archetype: "tier-list", accepts: [], name: "TierColumnsDark", duration: 5, bg: "#0c0c11",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "items", role: "claim", maxChars: null, required: false }], roleSet: ["hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const cols = [["S", "#c4141d", ["Speed", "Power"]], ["A", "#e0822e", ["Agility", "Strength"]], ["B", "#3a7d44", ["Mobility", "Engine"]]];
  const els = cols.map((c, i) => {
    const g = ce(0.5 + i * 0.3, 0.45);
    return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", opacity: g, transform: "translateY(" + ((1 - g) * 32) + "px)" }}>
      <div style={{ background: c[1], borderRadius: "16px 16px 0 0", textAlign: "center", padding: "20px 0", fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 100 }}>{c[0]}</div>
      <div style={{ flex: 1, background: "#15151c", borderRadius: "0 0 16px 16px", padding: "30px 18px", display: "flex", flexDirection: "column", gap: 18 }}>
        {c[2].map((x, j) => <div key={j} style={{ fontFamily: "Geist, sans-serif", fontWeight: 700, fontSize: 38, color: "#e8e8ec", textAlign: "center" }}>{x}</div>)}
      </div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "130px 56px", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 50, opacity: eb }}>Priority<br/>tiers</div>
      <div style={{ flex: 1, display: "flex", gap: 22 }}>{els}</div>
    </div>
  );` },

  // 112 — sprint-trace (FROM SCRATCH): LIGHT velocity CURVE drawing L->R + split dots + readout. OPEN line (not closed).
  { seq: 112, slug: "sprint-trace", archetype: "sprint-trace", accepts: [], name: "SprintCurveLight", duration: 5, bg: "#eef0f2",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "headline", role: "hook", maxChars: null, required: true }], roleSet: ["kicker", "hook"] },
    body: `  const eb = ce(0.1, 0.3);
  const draw = ce(0.5, 1.8);
  const L = 1500;
  const head = ce(2.4, 0.4);
  const splits = [[320, 1160], [600, 720], [880, 560]];
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 150, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb }}>40-YARD BREAKDOWN</div>
      <div style={{ position: "absolute", left: 64, top: 196, fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 92, textTransform: "uppercase", lineHeight: 0.9, opacity: eb }}>Where you<br/>accelerate</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <line x1="120" y1="1360" x2="980" y2="1360" stroke="#cdd2d6" strokeWidth="3" />
        <path d="M120 1300 C340 1300 380 800 600 720 C800 648 840 580 980 560" fill="none" stroke="#c4141d" strokeWidth="9" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
        {splits.map((s, i) => <circle key={i} cx={s[0]} cy={s[1]} r="15" fill="#16161b" opacity={clamp(draw * 1.6 - i * 0.35, 0, 1)} />)}
      </svg>
      <div style={{ position: "absolute", left: 64, right: 64, top: 1430, fontFamily: '"JetBrains Mono", monospace', color: "#777", fontSize: 30, letterSpacing: "0.05em", opacity: head }}>0–10 YD EXPLOSIVE · 10–40 TOP SPEED</div>
    </div>
  );` },

  // 113 — sprint-trace (FROM SCRATCH): DARK top-down lane trace + distance ticks + time readout. OPEN trace.
  { seq: 113, slug: "sprint-trace", archetype: "sprint-trace", accepts: [], name: "SprintLaneDark", duration: 5, bg: "#0a0b0d",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "stat", role: "stat", maxChars: null, required: true }], roleSet: ["kicker", "stat"] },
    body: `  const eb = ce(0.1, 0.3);
  const prog = ce(0.5, 1.9);
  const x = 90 + prog * 900;
  const head = ce(2.4, 0.4);
  const lanes = [720, 940, 1160];
  const ticks = Array.from({ length: 9 }, (_, i) => 90 + i * 112.5);
  const scene = (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 64, top: 150, fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700, opacity: eb }}>40-YARD DASH</div>
      <div style={{ position: "absolute", left: 64, top: 196, fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 88, textTransform: "uppercase", lineHeight: 0.9, opacity: eb }}>Trace the<br/>top end</div>
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {lanes.map((ly, li) => <rect key={"l" + li} x="60" y={ly} width="960" height="170" rx="14" fill="#13131a" />)}
        {lanes.map((ly, li) => ticks.map((tx, i) => <line key={"t" + li + "-" + i} x1={tx} y1={ly + 22} x2={tx} y2={ly + 148} stroke="#26262f" strokeWidth="3" />))}
        <line x1="90" y1="1025" x2={x} y2="1025" stroke="#c4141d" strokeWidth="14" strokeLinecap="round" />
        <circle cx={x} cy="1025" r="30" fill="#c4141d" />
      </svg>
      <div style={{ position: "absolute", left: 64, right: 64, top: 1430, fontFamily: '"JetBrains Mono", monospace', color: "#cfcfcf", fontSize: 40, letterSpacing: "0.03em", opacity: head }}>SPLIT {(4.9 - prog * 0.6).toFixed(2)}s · 22.4 MPH PEAK</div>
    </div>
  );` },

  // 114 — calendar-fill (FROM SCRATCH): LIGHT 5x7 month grid, session days fill red staggered. Explicit DATE GRID (not bands).
  { seq: 114, slug: "calendar-fill", archetype: "calendar-fill", accepts: [], name: "CalendarMonthLight", duration: 5, bg: "#f3f1ee",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: null, required: false }, { id: "headline", role: "hook", maxChars: null, required: true }, { id: "sub", role: "claim", maxChars: null, required: false }], roleSet: ["kicker", "hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const sessionDays = [2, 4, 5, 9, 11, 12, 16, 18, 19, 23, 25, 26, 30];
  const fillN = Math.round(sessionDays.length * ce(0.5, 1.7));
  const head = ce(2.2, 0.45);
  const cells = Array.from({ length: 35 }, (_, i) => {
    const day = i + 1;
    const si = sessionDays.indexOf(day);
    const isS = si >= 0 && si < fillN;
    return <div key={i} style={{ height: 118, borderRadius: 12, background: isS ? "#c4141d" : "#eae7e1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: '"JetBrains Mono", monospace', fontSize: 30, fontWeight: 700, color: isS ? "#fff" : "#bdb8af" }}>{day <= 31 ? day : ""}</div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 54px" }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, opacity: eb, marginBottom: 8 }}>SUMMER PROGRAM</div>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 88, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 34, opacity: eb }}>13 sessions,<br/>one month</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14 }}>{cells}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#444", fontSize: 40, fontWeight: 600, marginTop: 34, opacity: head }}>Three days a week. We handle the plan.</div>
    </div>
  );` },

  // 115 — calendar-fill (FROM SCRATCH): DARK horizontal WEEK strip, active days fill across. Week grid (not bands).
  { seq: 115, slug: "calendar-fill", archetype: "calendar-fill", accepts: [], name: "CalendarWeekDark", duration: 5, bg: "#0c0c11",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "sub", role: "claim", maxChars: null, required: false }], roleSet: ["hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const active = [0, 2, 4];
  const head = ce(2.2, 0.45);
  const cols = days.map((d, i) => {
    const isA = active.indexOf(i) >= 0;
    const g = ce(0.5 + i * 0.12, 0.4);
    return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', color: "#7a7a85", fontSize: 26, fontWeight: 700, opacity: g }}>{d}</div>
      <div style={{ width: "100%", height: 340, borderRadius: 16, background: isA ? "#c4141d" : "#17171f", opacity: isA ? g : 0.5 }} />
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 50px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 50, opacity: eb }}>Your training<br/>week</div>
      <div style={{ display: "flex", gap: 16 }}>{cols}</div>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#cfcfcf", fontSize: 42, fontWeight: 600, marginTop: 44, opacity: head }}>Three focused days beats seven random ones</div>
    </div>
  );` },

  // 116 — leaderboard-roll (FROM SCRATCH): LIGHT top-5 rows roll in + RANK NUMERALS + value bars. Numerals+bars (not letters).
  { seq: 116, slug: "leaderboard-roll", archetype: "leaderboard-roll", accepts: [], name: "LeaderRowsLight", duration: 5, bg: "#f3f1ee",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "names", role: "claim", maxChars: null, required: false }], roleSet: ["hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const board = [["1", "Maya R.", 0.95], ["2", "Jordan P.", 0.82], ["3", "Eli T.", 0.74], ["4", "Sam K.", 0.66], ["5", "Avery L.", 0.58]];
  const rows = board.map((b, i) => {
    const g = ce(0.5 + i * 0.22, 0.4);
    return <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 24, opacity: g, transform: "translateX(" + ((1 - g) * -40) + "px)" }}>
      <div style={{ width: 96, fontFamily: "Anton, sans-serif", color: i === 0 ? "#c4141d" : "#16161b", fontSize: 92 }}>{b[0]}</div>
      <div style={{ width: 300, fontFamily: "Geist, sans-serif", fontWeight: 700, fontSize: 46, color: "#16161b" }}>{b[1]}</div>
      <div style={{ flex: 1, height: 44, background: "#e7e3dd", borderRadius: 8, overflow: "hidden" }}><div style={{ width: (b[2] * g * 100) + "%", height: "100%", background: i === 0 ? "#c4141d" : "#16161b" }} /></div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#16161b", fontSize: 90, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 56, opacity: eb }}>This week's<br/><span style={{ color: "#c4141d" }}>top movers</span></div>
      {rows}
    </div>
  );` },

  // 117 — leaderboard-roll (FROM SCRATCH): DARK podium top-3 bars grow (1st tallest) + rank numerals. Numerals+bars.
  { seq: 117, slug: "leaderboard-roll", archetype: "leaderboard-roll", accepts: [], name: "LeaderPodiumDark", duration: 5, bg: "#0a0b0d",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: null, required: true }, { id: "names", role: "claim", maxChars: null, required: false }], roleSet: ["hook", "claim"] },
    body: `  const eb = ce(0.1, 0.3);
  const podium = [["2", "Jordan", 0.72, "#9aa0a6"], ["1", "Maya", 1.0, "#c4141d"], ["3", "Eli", 0.56, "#b07a3a"]];
  const bars = podium.map((p, i) => {
    const g = ce(0.5 + i * 0.2, 0.5);
    const h = 200 + p[2] * 640 * g;
    return <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
      <div style={{ fontFamily: "Geist, sans-serif", color: "#fff", fontWeight: 700, fontSize: 42, marginBottom: 16, opacity: g }}>{p[1]}</div>
      <div style={{ width: "82%", height: h, background: p[3], borderRadius: "14px 14px 0 0", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 26 }}>
        <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 130 }}>{p[0]}</div>
      </div>
    </div>;
  });
  const scene = (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "130px 60px 0", boxSizing: "border-box" }}>
      <div style={{ fontFamily: "Anton, sans-serif", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 30, opacity: eb }}>Leaderboard<br/><span style={{ color: "#c4141d" }}>finals</span></div>
      <div style={{ flex: 1, display: "flex", gap: 24, alignItems: "flex-end" }}>{bars}</div>
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

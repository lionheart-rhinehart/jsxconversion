// ============================================================================
//  scripts/example-sidecar/author-examples.mjs  — Track B example GENERATOR
// ============================================================================
//  15 DISTINCT ARCHETYPES, each with a SPECTRUM of 3 sub-looks (45 examples total).
//  A sub-look is a genuinely DIFFERENT EXECUTION of the same archetype — varied by
//  composition, tonal register, media treatment, or type treatment — NOT a cosmetic
//  (number/color) swap. The point is to teach the engine a *range* per archetype so
//  generation varies, while every sub-look still reads unmistakably as its archetype.
//
//  The acceptance gate is numeric (measured by embed.py):
//    • cross-cluster max cosine < 0.70           (clusters stay mutually distinct)
//    • k-means(k=15) purity >= 0.80, silhouette >= 0.35  (the 3 group as one cluster)
//    • within a cluster no pair > ~0.90          (sub-looks are varied, not clones)
//
//  Media follows the proven rubric (docs/media-integration-findings.md): NO full-bleed
//  on graphic designs; large media only via knockout CUTOUT on a color field or a
//  ~45% SPLIT-panel; contained accent <=20% varied in position; facility imagery as a
//  distinct diversifier; footage diversity is mandatory (a clip is never reused).
//
//  Distinctness comes from STRUCTURE. To re-cut a colliding sub-look, change its LAYOUT
//  here (composition / register / media), not the photo or the copy.
//
//  Run:  node scripts/example-sidecar/author-examples.mjs
//  Node-only. New file (Track B). Imports nothing from Track A's working set.
// ============================================================================

import { existsSync, mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { makeExampleId } from "../lib/example-library.mjs";
import { removeOwnedSources, mergeManifest } from "./manifest-util.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const EXAMPLES_DIR = join(ROOT, "templates", "_examples");
const ASSETS_DIR = join(EXAMPLES_DIR, "assets");
const MANIFEST = join(HERE, "examples.manifest.json");

// Media source roots, searched in order by exact basename. Photos live in the brand
// asset library; knockout CUTOUTS (transparent PNG of an athlete) and FACILITY shots
// are the experiment-harness derivatives the media rubric proved out.
const NAMED = join(ROOT, "brand", "aa-design-system", "project", "assets");
const CUTOUT = join(HERE, "_experiment", "cutout");
const FACILITY = join(HERE, "_experiment", "facility");
const SRC_ROOTS = [NAMED, CUTOUT, FACILITY];
function resolveSrc(name) {
  for (const r of SRC_ROOTS) { const p = join(r, name); if (existsSync(p)) return p; }
  throw new Error(`author-examples: media asset not found in any root: ${name}`);
}

const W = 1080, H = 1920;
const wrap = (a, inner, bg = "#000") => `// ${a} — generated example. Distinct layout family (squint test).
export default function Example() {
  return (
    <div style={{ width: ${W}, height: ${H}, position: "relative", overflow: "hidden", background: "${bg}" }}>
${inner}
    </div>
  );
}
`;
const img = (src, style) => `      <img src="${src}" style={{ ${style} }} />`;

// SVG icon (no emoji): a rounded square with a simple flat glyph.
const icon = (glyph, color, size = 92) => `<svg width="${size}" height="${size}" viewBox="0 0 92 92"><rect width="92" height="92" rx="20" fill="${color}"/>${glyph}</svg>`;
const G = {
  check: '<path d="M28 48 l12 12 l24 -28" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  star: '<path d="M46 22 l8 18 l20 2 -15 14 4 20 -17 -10 -17 10 4 -20 -15 -14 20 -2 z" fill="#fff"/>',
  clock: '<circle cx="46" cy="46" r="20" stroke="#fff" stroke-width="8" fill="none"/><path d="M46 34 v14 l10 6" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>',
  bolt: '<path d="M30 60 l16 -28 l16 28 z" fill="#fff"/>',
  shield: '<path d="M46 22 l20 8 v16 c0 16 -12 24 -20 28 -8 -4 -20 -12 -20 -28 v-16 z" fill="#fff"/>',
  target: '<circle cx="46" cy="46" r="22" stroke="#fff" stroke-width="7" fill="none"/><circle cx="46" cy="46" r="7" fill="#fff"/>',
  bars: '<rect x="24" y="48" width="11" height="20" fill="#fff"/><rect x="40" y="38" width="11" height="30" fill="#fff"/><rect x="56" y="28" width="11" height="40" fill="#fff"/>',
  people: '<circle cx="34" cy="38" r="9" fill="#fff"/><circle cx="58" cy="38" r="9" fill="#fff"/><path d="M20 66 c0 -10 8 -16 14 -16 s14 6 14 16 z" fill="#fff"/><path d="M44 66 c0 -10 8 -16 14 -16 s14 6 14 16 z" fill="#fff"/>',
};

// ============================================================================
//  15 archetypes × 3 sub-looks. Each variant: { media, accepts, jsx }.
//  media = source basenames (resolved across SRC_ROOTS), copied into assets/ per id.
// ============================================================================
const ARCHETYPES = [
  // ==========================================================================
  // 1 — GIANT STAT: one huge NUMBER owns the frame.
  //   a) centered numeral, dark, no media
  //   b) numeral LEFT + knockout CUTOUT athlete on a red field (large media, distinct)
  //   c) numeral in an editorial split, LIGHT register, facility accent
  // ==========================================================================
  { slug: "giant-stat", archetype: "giant-stat",
    slotShape: { slots: [{ id: "label", role: "kicker", maxChars: 20, required: false }, { id: "stat", role: "stat", maxChars: 8, required: true }, { id: "sub", role: "claim", maxChars: 28, required: false }], roleSet: ["kicker", "stat", "claim"] },
    variants: [
      { media: [], accepts: [], jsx: () => wrap("giant-stat", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 36, letterSpacing: "0.14em", fontWeight: 700, marginBottom: 8 }}>VERTICAL JUMP</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 500, lineHeight: 0.8 }}>92<span style={{ color: "#c4141d", fontSize: 200 }}>%</span></div>
        <div style={{ fontFamily: "Geist", color: "#bdbdbd", fontSize: 42, fontWeight: 600, marginTop: 16 }}>improved in 90 days</div>
      </div>`, "#0a0a0a") },

      { media: ["photo-medball-female.png"], accepts: ["subject:athlete-action"], jsx: (m) => wrap("giant-stat", `      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "62%", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>${img(m[0], 'maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transform: "scale(1.5)", transformOrigin: "center bottom"')}</div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 150, textAlign: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#fff", fontSize: 34, letterSpacing: "0.14em", fontWeight: 700, opacity: 0.92 }}>SPRINT SPEED</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 340, lineHeight: 0.82, marginTop: 6 }}>+1<span style={{ fontSize: 120 }}>mph</span></div>
        <div style={{ width: 130, height: 8, background: "#fff", margin: "14px auto" }} />
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 44, fontWeight: 600 }}>measured, not promised</div>
      </div>`, "#c4141d") },

      { media: ["fac-weights.png"], accepts: ["subject:no-human", "env:gym"], jsx: (m) => wrap("giant-stat", `      <div style={{ position: "absolute", left: 72, right: 72, top: 170 }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 32, letterSpacing: "0.14em", fontWeight: 700 }}>ATHLETES COACHED</div>
        <div style={{ fontFamily: "Anton", color: "#111", fontSize: 380, lineHeight: 0.82, marginTop: 6 }}>1,200<span style={{ color: "#c4141d", fontSize: 170 }}>+</span></div>
        <div style={{ fontFamily: "Geist", color: "#444", fontSize: 42, fontWeight: 600, marginTop: 30, maxWidth: 620 }}>across Indiana and Ohio since 2014</div>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 90, height: 360, borderRadius: 20, overflow: "hidden" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>`, "#f4f4f2") },
    ] },

  // ==========================================================================
  // 2 — METRIC REVEAL: a CHART dominates. Vary the chart FORM (bars / ring / line).
  // ==========================================================================
  { slug: "metric-reveal", archetype: "metric-reveal",
    slotShape: { slots: [{ id: "title", role: "claim", maxChars: 40, required: true }, { id: "caption", role: "reframe", maxChars: 40, required: false }], roleSet: ["claim", "reframe"] },
    variants: [
      { media: [], accepts: [], jsx: () => {
        const bars = [320, 470, 610, 770, 980];
        const bx = bars.map((h, i) => `<rect x="${110 + i * 170}" y="${1280 - h}" width="120" height="${h}" rx="8" fill="${i === bars.length - 1 ? "#c4141d" : "#2a2a32"}"/>`).join("");
        return wrap("metric-reveal", `      <div style={{ position: "absolute", left: 64, top: 150, right: 64 }}>
        <div style={{ fontFamily: "Anton", color: "#111", fontSize: 78, textTransform: "uppercase", lineHeight: 0.95 }}>Speed gains<br/>by week</div>
        <div style={{ fontFamily: "Geist", color: "#666", fontSize: 34, marginTop: 12 }}>Measured every 2 weeks</div>
      </div>
      <svg viewBox="0 0 1080 1320" style={{ position: "absolute", left: 0, bottom: 120, width: "100%" }}><line x1="90" y1="1280" x2="990" y2="1280" stroke="#ccc" stroke-width="4"/>${bx}</svg>
      <div style={{ position: "absolute", left: 64, bottom: 60, fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 30, letterSpacing: "0.08em" }}>WEEK 1 → WEEK 10</div>`, "#f4f4f2");
      } },

      // ring / radial gauge, dark register
      { media: [], accepts: [], jsx: () => {
        const R = 300, C = 2 * Math.PI * R, pct = 0.9;
        return wrap("metric-reveal", `      <div style={{ position: "absolute", left: 64, top: 120, right: 64, textAlign: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700 }}>ON-TIME TO GOAL</div>
      </div>
      <svg viewBox="0 0 720 720" style={{ position: "absolute", left: "50%", top: 470, width: 720, transform: "translateX(-50%)" }}>
        <circle cx="360" cy="360" r="${R}" stroke="#22222a" stroke-width="56" fill="none"/>
        <circle cx="360" cy="360" r="${R}" stroke="#c4141d" stroke-width="56" fill="none" stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(0)} ${C.toFixed(0)}" transform="rotate(-90 360 360)"/>
        <text x="360" y="360" text-anchor="middle" dominant-baseline="central" font-family="Anton" font-size="240" fill="#fff">90%</text>
      </svg>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 150, textAlign: "center" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 70, textTransform: "uppercase", lineHeight: 0.96 }}>Hit their target<br/>by day 90</div>
      </div>`, "#0d0d12");
      } },

      // ascending line / area graph, light tinted register
      { media: [], accepts: [], jsx: () => {
        const pts = [[120, 1180], [320, 1040], [520, 940], [720, 700], [920, 460]];
        const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");
        const area = `${path} L920 1180 L120 1180 Z`;
        const dots = pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="14" fill="#c4141d"/>`).join("");
        return wrap("metric-reveal", `      <div style={{ position: "absolute", left: 64, top: 140, right: 64 }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 30, letterSpacing: "0.1em", fontWeight: 700 }}>VERTICAL JUMP — INCHES</div>
        <div style={{ fontFamily: "Anton", color: "#16161b", fontSize: 84, textTransform: "uppercase", lineHeight: 0.95, marginTop: 10 }}>Up and to<br/>the right</div>
      </div>
      <svg viewBox="0 0 1080 1320" style={{ position: "absolute", left: 0, bottom: 60, width: "100%" }}>
        <path d="${area}" fill="rgba(196,20,29,0.12)"/>
        <path d="${path}" stroke="#c4141d" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        ${dots}
      </svg>`, "#eef0f2");
      } },
    ] },

  // ==========================================================================
  // 3 — KINETIC TEXT: bold edge-to-edge TYPE, no photo. Vary composition + register.
  // ==========================================================================
  { slug: "kinetic-text", archetype: "kinetic-text",
    slotShape: { slots: [{ id: "l1", role: "kicker", maxChars: 16, required: true }, { id: "l2", role: "hook", maxChars: 16, required: true }, { id: "l3", role: "claim", maxChars: 16, required: true }], roleSet: ["kicker", "hook", "claim"] },
    variants: [
      { media: [], accepts: [], jsx: () => wrap("kinetic-text", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
        <div style={{ fontFamily: "Anton", fontSize: 200, lineHeight: 0.9, textTransform: "uppercase", color: "#fff" }}>TRAIN</div>
        <div style={{ fontFamily: "Anton", fontSize: 200, lineHeight: 0.9, textTransform: "uppercase", color: "#0a0a0a", background: "#c4141d", display: "inline-block", padding: "0 18px", width: "fit-content" }}>LIKE IT</div>
        <div style={{ fontFamily: "Anton", fontSize: 200, lineHeight: 0.9, textTransform: "uppercase", color: "#fff" }}>MATTERS</div>
      </div>`, "#111") },

      // one massive word filling a red field, rotated baseline energy
      { media: [], accepts: [], jsx: () => wrap("kinetic-text", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px" }}>
        <div style={{ fontFamily: "Anton", fontSize: 150, lineHeight: 0.86, textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>NO</div>
        <div style={{ fontFamily: "Anton", fontSize: 360, lineHeight: 0.8, textTransform: "uppercase", color: "#fff", letterSpacing: "-0.02em" }}>OFF<br/>DAYS</div>
        <div style={{ fontFamily: "JetBrains Mono", fontSize: 38, letterSpacing: "0.1em", color: "#fff", marginTop: 26 }}>SUMMER PERFORMANCE PROGRAM</div>
      </div>`, "#c4141d") },

      // light register, left rail, mixed-weight stack with a knockout word
      { media: [], accepts: [], jsx: () => wrap("kinetic-text", `      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: "#c4141d" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px" }}>
        <div style={{ fontFamily: "Geist", fontWeight: 800, fontSize: 96, lineHeight: 0.98, color: "#16161b" }}>Strength is</div>
        <div style={{ fontFamily: "Anton", fontSize: 230, lineHeight: 0.84, textTransform: "uppercase", color: "#16161b" }}>BUILT</div>
        <div style={{ fontFamily: "Anton", fontSize: 230, lineHeight: 0.84, textTransform: "uppercase", color: "#fff", background: "#16161b", width: "fit-content", padding: "0 20px" }}>NOT BORN</div>
      </div>`, "#f1f1ee") },
    ] },

  // ==========================================================================
  // 4 — QUOTE CARD: a large pull-QUOTE + attribution. Text-led; vary composition + tone.
  // ==========================================================================
  { slug: "quote-card", archetype: "quote-card",
    slotShape: { slots: [{ id: "quote", role: "testimonial", maxChars: 120, required: true }, { id: "attribution", role: "byline", maxChars: 36, required: false }], roleSet: ["testimonial", "byline"] },
    variants: [
      { media: [], accepts: [], jsx: () => wrap("quote-card", `      <div style={{ position: "absolute", left: 80, top: 220, fontFamily: "Anton", color: "#c4141d", fontSize: 320, lineHeight: 0.7 }}>&ldquo;</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 540, fontFamily: "Geist", color: "#f4f4f2", fontSize: 72, fontWeight: 700, lineHeight: 1.18 }}>My son went from the bench to starting in one season.</div>
      <div style={{ position: "absolute", left: 80, bottom: 200, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 14, height: 64, background: "#c4141d" }} />
        <div><div style={{ fontFamily: "Geist", color: "#fff", fontSize: 36, fontWeight: 700 }}>Sarah M.</div><div style={{ fontFamily: "JetBrains Mono", color: "#9a9aa3", fontSize: 26 }}>CARMEL PARENT</div></div>
      </div>`, "#16161b") },

      // centered quote on a brand-red field, white type
      { media: [], accepts: [], jsx: () => wrap("quote-card", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 76px", textAlign: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.85)", fontSize: 56, letterSpacing: "0.2em", marginBottom: 30 }}>★★★★★</div>
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 78, fontWeight: 700, lineHeight: 1.16 }}>They tested him, coached him, and re-tested. The number moved.</div>
        <div style={{ width: 90, height: 6, background: "#fff", margin: "44px 0 22px" }} />
        <div style={{ fontFamily: "JetBrains Mono", color: "#fff", fontSize: 30, letterSpacing: "0.06em" }}>MARCUS T. — FISHERS DAD</div>
      </div>`, "#c4141d") },

      // light editorial: oversize hanging quote mark, left rule, dark type
      { media: [], accepts: [], jsx: () => wrap("quote-card", `      <div style={{ position: "absolute", left: 70, top: 150, fontFamily: "Anton", color: "#e2c9c9", fontSize: 420, lineHeight: 0.6 }}>&rdquo;</div>
      <div style={{ position: "absolute", left: 86, right: 90, top: 560, borderLeft: "10px solid #c4141d", paddingLeft: 34, fontFamily: "Geist", color: "#16161b", fontSize: 70, fontWeight: 700, lineHeight: 1.2 }}>Best decision we have made for our daughter's confidence.</div>
      <div style={{ position: "absolute", left: 120, bottom: 210, fontFamily: "JetBrains Mono", color: "#8a8a90", fontSize: 30, letterSpacing: "0.06em" }}>JEN R. — WESTFIELD PARENT</div>`, "#f4f3f0") },
    ] },

  // ==========================================================================
  // 5 — BEFORE/AFTER SPLIT: HORIZONTAL dual-frame, two stacked photos. Photo-led.
  //   Footage diversity mandatory — a different pair per sub-look.
  // ==========================================================================
  { slug: "before-after-split", archetype: "before-after-split",
    slotShape: { slots: [{ id: "beforeLabel", role: "kicker", maxChars: 12, required: true }, { id: "afterLabel", role: "kicker", maxChars: 12, required: true }, { id: "stat", role: "stat", maxChars: 10, required: false }], roleSet: ["kicker", "stat"] },
    variants: [
      { media: ["photo-conditioning.jpg", "hero-sprint-female.jpg"], accepts: ["subject:athlete-action"], jsx: (m) => wrap("before-after-split", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.05)"')}
          <div style={{ position: "absolute", inset: 0, background: "rgba(20,20,30,0.45)" }} />
          <div style={{ position: "absolute", left: 48, top: 40, fontFamily: "JetBrains Mono", color: "#fff", fontSize: 36, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(0,0,0,0.55)", padding: "8px 18px" }}>WEEK 1</div>
        </div>
        <div style={{ height: 6, background: "#c4141d" }} />
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>${img(m[1], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}
          <div style={{ position: "absolute", left: 48, top: 40, fontFamily: "JetBrains Mono", color: "#fff", fontSize: 36, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(196,20,29,0.85)", padding: "8px 18px" }}>WEEK 12</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center", fontFamily: "Anton", color: "#fff", fontSize: 120, textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>+1 MPH</div>`) },

      // diagonal-cornered labels, center metric chip, different pair (unique clips)
      { media: ["photo-squat.jpg", "photo-box-jump.jpg"], accepts: ["subject:athlete-action"], jsx: (m) => wrap("before-after-split", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.05)"')}
          <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,14,0.4)" }} />
          <div style={{ position: "absolute", right: 44, bottom: 36, fontFamily: "Anton", color: "rgba(255,255,255,0.9)", fontSize: 64, textTransform: "uppercase" }}>BEFORE</div>
        </div>
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>${img(m[1], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}
          <div style={{ position: "absolute", left: 44, top: 36, fontFamily: "Anton", color: "#fff", fontSize: 64, textTransform: "uppercase" }}>AFTER</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "#c4141d", color: "#fff", fontFamily: "Anton", fontSize: 88, padding: "10px 40px", borderRadius: 14, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>+3" VERT</div>`) },

      // labels as small corner tags, thin white divider, different pair
      { media: ["photo-band-work.jpg", "photo-medball.jpg"], accepts: ["subject:athlete-action"], jsx: (m) => wrap("before-after-split", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.05)"')}
          <div style={{ position: "absolute", left: 0, top: 60, background: "#16161b", color: "#fff", fontFamily: "JetBrains Mono", fontSize: 30, letterSpacing: "0.1em", padding: "10px 22px" }}>DAY 1</div>
        </div>
        <div style={{ height: 10, background: "#fff" }} />
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>${img(m[1], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}
          <div style={{ position: "absolute", left: 0, bottom: 60, background: "#c4141d", color: "#fff", fontFamily: "JetBrains Mono", fontSize: 30, letterSpacing: "0.1em", padding: "10px 22px" }}>DAY 90</div>
        </div>
      </div>`) },
    ] },

  // ==========================================================================
  // 6 — VERSUS: VERTICAL two-column contrast. Pure color columns. Vary tone + divider.
  // ==========================================================================
  { slug: "versus", archetype: "versus",
    slotShape: { slots: [{ id: "leftKicker", role: "kicker", maxChars: 16, required: true }, { id: "leftLine", role: "claim", maxChars: 24, required: true }, { id: "rightKicker", role: "kicker", maxChars: 24, required: true }, { id: "rightLine", role: "claim", maxChars: 24, required: true }], roleSet: ["kicker", "claim"] },
    variants: [
      { media: [], accepts: [], jsx: () => wrap("versus", `      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        <div style={{ width: "50%", height: "100%", background: "#1a1a1a", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "#8a8a8a", fontSize: 30, letterSpacing: "0.08em", marginBottom: 18 }}>OPEN GYM</div>
          <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 78, lineHeight: 0.95, textTransform: "uppercase" }}>Left to<br/>figure it out</div>
        </div>
        <div style={{ width: "50%", height: "100%", background: "#c4141d", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "#ffd2d4", fontSize: 30, letterSpacing: "0.08em", marginBottom: 18 }}>ATHLETES ACCELERATION</div>
          <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 78, lineHeight: 0.95, textTransform: "uppercase" }}>Coached<br/>every rep</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 4, background: "#fff", transform: "translateX(-50%)" }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 110, height: 110, borderRadius: "50%", background: "#0a0a0a", color: "#fff", fontFamily: "Anton", fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>VS</div>`) },

      // vertical two-column contrast (versus's identity), WHITE vs INK tone — distinct
      // from a's gray/red. Kept as columns (not a horizontal split) so it does not
      // collide with the offer ticket / iconrow grid.
      { media: [], accepts: [], jsx: () => wrap("versus", `      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        <div style={{ width: "50%", height: "100%", background: "#f1f1ee", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "#999", fontSize: 30, letterSpacing: "0.08em", marginBottom: 18 }}>GENERIC WORKOUT</div>
          <div style={{ fontFamily: "Anton", color: "#16161b", fontSize: 80, lineHeight: 0.94, textTransform: "uppercase" }}>Same plan<br/>for everyone</div>
        </div>
        <div style={{ width: "50%", height: "100%", background: "#16161b", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 30, letterSpacing: "0.08em", marginBottom: 18 }}>OUR PROGRAM</div>
          <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 80, lineHeight: 0.94, textTransform: "uppercase" }}>Built from<br/>your test</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 110, height: 110, borderRadius: "50%", background: "#c4141d", color: "#fff", fontFamily: "Anton", fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>VS</div>`) },

      // diagonal split, WHITE vs INK (red only as the VS accent) — kept off a full
      // red field so it does not collide with the full-red offer card.
      { media: [], accepts: [], jsx: () => wrap("versus", `      <div style={{ position: "absolute", inset: 0, background: "#f1f1ee" }} />
      <div style={{ position: "absolute", inset: 0, background: "#16161b", clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
      <div style={{ position: "absolute", left: 70, top: 200, fontFamily: "Anton", color: "#f1f1ee", fontSize: 150, textTransform: "uppercase", lineHeight: 0.9 }}>HOPE</div>
      <div style={{ position: "absolute", right: 70, bottom: 230, textAlign: "right", fontFamily: "Anton", color: "#16161b", fontSize: 150, textTransform: "uppercase", lineHeight: 0.9 }}>PROOF</div>
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%) rotate(-12deg)", width: 120, height: 120, borderRadius: "50%", background: "#c4141d", color: "#fff", fontFamily: "Anton", fontSize: 46, display: "flex", alignItems: "center", justifyContent: "center" }}>VS</div>`) },
    ] },

  // ==========================================================================
  // 7 — PROOF COLLAGE: a GRID of testimonial/face cards + stars. Photo-led.
  //   Vary bg tone + grid arrangement + photos.
  // ==========================================================================
  { slug: "proof-collage", archetype: "proof-collage",
    slotShape: { slots: [{ id: "heading", role: "claim", maxChars: 24, required: true }, { id: "rating", role: "proof", maxChars: 8, required: false }, { id: "quote", role: "testimonial", maxChars: 48, required: false }], roleSet: ["claim", "proof", "testimonial"] },
    variants: [
      { media: ["photo-jump-female.jpg", "photo-agility-female.jpg", "photo-agility-mixed.jpg", "photo-medball-female.jpg"], accepts: ["subject:athlete-face"], jsx: (m) => wrap("proof-collage", `      <div style={{ position: "absolute", inset: 0, padding: 48, boxSizing: "border-box" }}>
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "#d29922", fontSize: 56, letterSpacing: "0.2em" }}>★★★★★</div>
          <div style={{ fontFamily: "Anton", color: "#111", fontSize: 92, textTransform: "uppercase", marginTop: 8, lineHeight: 0.95 }}>Parents are talking</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridGap: 22 }}>
          ${[0, 1, 2, 3].map((i) => `<div style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,0.12)" }}>
            <div style={{ position: "relative", height: 330, overflow: "hidden" }}>${img(m[i], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>
            <div style={{ padding: "18px 16px", fontFamily: "Geist", color: "#222", fontSize: 26, fontWeight: 600 }}>"Best decision we made."<div style={{ color: "#888", fontSize: 22, marginTop: 6 }}>— Carmel parent</div></div>
          </div>`).join("\n          ")}
        </div>
      </div>`, "#ececed") },

      // DARK register, a horizontal STAR-RATING band + a tight 3-across face strip with
      // big dark negative space (the chrome/type dominates, not the photos — which keeps
      // it out of the full-bleed-athlete cluster). Unique clips (not used by action/before-after).
      { media: ["photo-agility-male.jpg", "hero-sprint-male.jpg", "photo-lifting.jpg"], accepts: ["subject:athlete-face"], jsx: (m) => wrap("proof-collage", `      <div style={{ position: "absolute", inset: 0, padding: "120px 48px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 110, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 12 }}>4.9 out<br/>of 5</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#d29922", fontSize: 54, letterSpacing: "0.2em", marginBottom: 16 }}>★★★★★</div>
        <div style={{ fontFamily: "Geist", color: "#9a9aa3", fontSize: 34, fontWeight: 600, marginBottom: 44 }}>from 200+ Indiana &amp; Ohio families</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridGap: 18 }}>
          ${[0, 1, 2].map((i) => `<div style={{ borderRadius: 16, overflow: "hidden", position: "relative", height: 300, border: "3px solid #1f1f27" }}>${img(m[i], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>`).join("\n          ")}
        </div>
      </div>`, "#101015") },

      // 3-up polaroid row on a light brand-tinted bg, different photos (unique clips)
      { media: ["photo-coach-action.jpg", "photo-group-coaching.jpg", "photo-gym-wide.jpg"], accepts: ["subject:athlete-face"], jsx: (m) => wrap("proof-collage", `      <div style={{ position: "absolute", inset: 0, padding: "60px 40px", boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "Anton", color: "#16161b", fontSize: 92, textTransform: "uppercase", lineHeight: 0.95 }}>Proof, not<br/>promises</div>
          <div style={{ fontFamily: "JetBrains Mono", color: "#d29922", fontSize: 44, letterSpacing: "0.2em", marginTop: 12 }}>★★★★★</div>
        </div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
          ${[0, 1, 2].map((i) => `<div style={{ background: "#fff", padding: "14px 14px 30px", borderRadius: 8, boxShadow: "0 14px 34px rgba(0,0,0,0.18)", transform: "rotate(${i === 1 ? 0 : i === 0 ? -4 : 4}deg)" }}>
            <div style={{ width: 280, height: 360, overflow: "hidden", position: "relative" }}>${img(m[i], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>
            <div style={{ fontFamily: "Caveat", color: "#333", fontSize: 36, textAlign: "center", marginTop: 10 }}>+3" in 90 days</div>
          </div>`).join("\n          ")}
        </div>
      </div>`, "#f6eeee") },
    ] },

  // ==========================================================================
  // 8 — LIST / STEPS: numbered ROW stack. Vary register + numbering + composition.
  //   Must stay clear of timeline-schedule (now a horizontal week grid).
  // ==========================================================================
  { slug: "list-steps", archetype: "list-steps",
    slotShape: { slots: [{ id: "heading", role: "hook", maxChars: 40, required: true }, { id: "step1", role: "claim", maxChars: 36, required: true }, { id: "step2", role: "claim", maxChars: 36, required: true }, { id: "step3", role: "claim", maxChars: 36, required: true }], roleSet: ["hook", "claim"] },
    variants: [
      { media: [], accepts: [], jsx: () => {
        const steps = ["Test the athlete first", "Build the right strength base", "Re-test and prove the gain"];
        const rows = steps.map((s, i) => `<div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 40, borderBottom: "1px solid #23232b", paddingBottom: 28 }}>
          <div style={{ fontFamily: "Anton", color: "#c4141d", fontSize: 140, lineHeight: 0.9, width: 120 }}>${i + 1}</div>
          <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 46, fontWeight: 600 }}>${s}</div>
        </div>`).join("\n        ");
        return wrap("list-steps", `      <div style={{ position: "absolute", inset: 0, padding: "120px 72px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 92, textTransform: "uppercase", lineHeight: 0.95, marginBottom: 64 }}>3 steps to a<br/><span style={{ color: "#c4141d" }}>faster season</span></div>
        ${rows}
      </div>`, "#101015");
      } },

      // LIGHT register, circled numbers, 4 rows, no rules
      { media: [], accepts: [], jsx: () => {
        const steps = ["Free assessment and goal-set", "Small-group strength + speed", "Weekly coaching and feedback", "Re-test, see the number move"];
        const rows = steps.map((s, i) => `<div style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 34 }}>
          <div style={{ flex: "0 0 84px", width: 84, height: 84, borderRadius: "50%", background: "#c4141d", color: "#fff", fontFamily: "Anton", fontSize: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>${i + 1}</div>
          <div style={{ fontFamily: "Geist", color: "#16161b", fontSize: 44, fontWeight: 600 }}>${s}</div>
        </div>`).join("\n        ");
        return wrap("list-steps", `      <div style={{ position: "absolute", inset: 0, padding: "120px 64px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 18 }}>HOW IT WORKS</div>
        <div style={{ fontFamily: "Anton", color: "#16161b", fontSize: 90, textTransform: "uppercase", lineHeight: 0.95, marginBottom: 60 }}>Four steps,<br/>one plan</div>
        ${rows}
      </div>`, "#f4f4f2");
      } },

      // checklist on a red field, check-glyph bullets
      { media: [], accepts: [], jsx: () => {
        const items = ["A real test on day one", "Coaches who know your sport", "A guarantee in writing"];
        const checkTile = '<svg width="78" height="78" viewBox="0 0 92 92"><rect width="92" height="92" rx="20" fill="rgba(255,255,255,0.16)"/><path d="M28 48 l12 12 l24 -28" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        const rows = items.map((s) => `<div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 36 }}>
          ${checkTile}
          <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 46, fontWeight: 600 }}>${s}</div>
        </div>`).join("\n        ");
        return wrap("list-steps", `      <div style={{ position: "absolute", inset: 0, padding: "130px 70px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 100, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 70 }}>What you<br/>get</div>
        ${rows}
      </div>`, "#c4141d");
      } },
    ] },

  // ==========================================================================
  // 9 — OFFER CARD: structured deal box + guarantee + CTA. Guarantee VERBATIM.
  // ==========================================================================
  { slug: "offer-card", archetype: "offer-card",
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: 28, required: false }, { id: "offer", role: "offer", maxChars: 36, required: true }, { id: "guarantee", role: "guarantee", maxChars: 64, required: true }, { id: "cta", role: "cta", maxChars: 20, required: true }], roleSet: ["kicker", "offer", "guarantee", "cta"] },
    variants: [
      { media: [], accepts: [], jsx: () => wrap("offer-card", `      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 64 }}>
        <div style={{ width: "100%", background: "#fff", borderRadius: 28, padding: "56px 48px", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 30, letterSpacing: "0.1em" }}>SUMMER PERFORMANCE CAMP</div>
          <div style={{ fontFamily: "Anton", color: "#111", fontSize: 112, lineHeight: 0.92, textTransform: "uppercase", marginTop: 16 }}>8 weeks.<br/>3 days a week.</div>
          <div style={{ marginTop: 36, padding: "26px 28px", background: "#faf3f3", border: "2px solid #c4141d", borderRadius: 16, fontFamily: "Geist", color: "#111", fontSize: 38, fontWeight: 700, lineHeight: 1.2 }}>+1 mph speed. +3" vertical. 90 days. Or your training is free.</div>
          <div style={{ marginTop: 40, textAlign: "center", background: "#c4141d", color: "#fff", fontFamily: "Anton", fontSize: 52, textTransform: "uppercase", padding: "24px", borderRadius: 12 }}>Claim your spot</div>
        </div>
      </div>`, "#0d0d0d") },

      // full red card on dark, white CTA, price-style offer
      { media: [], accepts: [], jsx: () => wrap("offer-card", `      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 56 }}>
        <div style={{ width: "100%", background: "#c4141d", borderRadius: 26, padding: "54px 46px", boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "rgba(255,255,255,0.85)", fontSize: 28, letterSpacing: "0.12em" }}>NEW ATHLETE OFFER</div>
          <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 150, lineHeight: 0.86, marginTop: 12 }}>FIRST<br/>MONTH</div>
          <div style={{ fontFamily: "Anton", color: "#16161b", fontSize: 120, lineHeight: 0.9, background: "#fff", display: "inline-block", padding: "0 22px", marginTop: 10 }}>$99</div>
          <div style={{ marginTop: 30, fontFamily: "Geist", color: "#fff", fontSize: 34, fontWeight: 600, lineHeight: 1.25 }}>+1 mph speed. +3" vertical. 90 days. Or your training is free.</div>
          <div style={{ marginTop: 36, textAlign: "center", background: "#fff", color: "#c4141d", fontFamily: "Anton", fontSize: 50, textTransform: "uppercase", padding: "22px", borderRadius: 12 }}>Start this week</div>
        </div>
      </div>`, "#0d0d0d") },

      // ticket / coupon style — perforated divider, light register
      { media: [], accepts: [], jsx: () => wrap("offer-card", `      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
        <div style={{ width: "100%", background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 28px 70px rgba(0,0,0,0.3)" }}>
          <div style={{ background: "#16161b", padding: "40px 46px" }}>
            <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 28, letterSpacing: "0.12em" }}>FALL SPEED CLINIC</div>
            <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 104, lineHeight: 0.9, textTransform: "uppercase", marginTop: 10 }}>Two free<br/>sessions</div>
          </div>
          <div style={{ height: 0, borderTop: "4px dashed #cfcfcf" }} />
          <div style={{ padding: "40px 46px" }}>
            <div style={{ fontFamily: "Geist", color: "#16161b", fontSize: 36, fontWeight: 700, lineHeight: 1.22 }}>+1 mph speed. +3" vertical. 90 days. Or your training is free.</div>
            <div style={{ marginTop: 32, display: "inline-block", border: "3px solid #c4141d", color: "#c4141d", fontFamily: "Anton", fontSize: 46, textTransform: "uppercase", padding: "16px 40px", borderRadius: 10 }}>Book a session</div>
          </div>
        </div>
      </div>`, "#ececed") },
    ] },

  // ==========================================================================
  // 10 — ACTION HERO: full-bleed action photo + HUGE overlay headline. Photo-led.
  //   Footage diversity + vary headline position + gradient.
  // ==========================================================================
  { slug: "action-hero", archetype: "action-hero",
    slotShape: { slots: [{ id: "eyebrow", role: "eyebrow", maxChars: 28, required: true }, { id: "headline", role: "hook", maxChars: 40, required: true }], roleSet: ["eyebrow", "hook"] },
    variants: [
      { media: ["photo-jump-male.jpg"], accepts: ["production:cinematic", "subject:athlete-action"], jsx: (m) => wrap("action-hero", `${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0.6) 64%, rgba(0,0,0,0.95) 100%)" }} />
      <div style={{ position: "absolute", left: 70, top: 150, background: "#fff", color: "#c4141d", padding: "10px 22px", borderRadius: 8, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 32, letterSpacing: "0.04em" }}>CARMEL SPORT PARENTS</div>
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 130 }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 230, lineHeight: 0.86, textTransform: "uppercase", textShadow: "0 2px 30px rgba(0,0,0,0.8)" }}>Faster by the fall</div>
      </div>`) },

      // headline TOP, top-down gradient, different footage
      { media: ["photo-sprint-mixed.jpg"], accepts: ["production:cinematic", "subject:athlete-action"], jsx: (m) => wrap("action-hero", `${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 34%, rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", left: 56, right: 56, top: 120 }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#ff7a80", fontSize: 32, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 18 }}>AGES 8–18 · IN + OH</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 200, lineHeight: 0.86, textTransform: "uppercase", textShadow: "0 2px 26px rgba(0,0,0,0.7)" }}>Earn the<br/>starting spot</div>
      </div>`) },

      // left-rail vertical headline, side scrim, different footage
      { media: ["photo-running.jpg"], accepts: ["production:cinematic", "subject:athlete-action"], jsx: (m) => wrap("action-hero", `${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0) 75%)" }} />
      <div style={{ position: "absolute", left: 56, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ width: 110, height: 8, background: "#c4141d", marginBottom: 28 }} />
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 184, lineHeight: 0.84, textTransform: "uppercase", textShadow: "0 2px 24px rgba(0,0,0,0.7)" }}>Train<br/>like the<br/>season<br/>depends<br/>on it</div>
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 90, fontFamily: "JetBrains Mono", color: "#fff", fontSize: 28, letterSpacing: "0.08em" }}>ATHLETES ACCELERATION</div>`) },
    ] },

  // ==========================================================================
  // 11 — TRAINING SCENE: WIDE environment, graphic-led on LIGHT. Contained media.
  // ==========================================================================
  { slug: "training-scene", archetype: "training-scene",
    slotShape: { slots: [{ id: "headline", role: "claim", maxChars: 40, required: true }, { id: "byline", role: "byline", maxChars: 40, required: false }], roleSet: ["claim", "byline"] },
    variants: [
      { media: ["photo-gym-wide.jpg"], accepts: ["production:cinematic", "subject:athlete-action", "env:gym"], jsx: (m) => wrap("training-scene", `      <div style={{ position: "absolute", left: 56, right: 56, top: 80, height: 1040, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 1200 }}>
        <div style={{ width: 96, height: 8, background: "#c4141d", marginBottom: 24 }} />
        <div style={{ fontFamily: "Anton", color: "#111", fontSize: 118, lineHeight: 0.92, textTransform: "uppercase" }}>Where Carmel<br/>trains all winter</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#666", fontSize: 30, marginTop: 22, letterSpacing: "0.04em" }}>ATHLETES ACCELERATION · CARMEL, IN</div>
      </div>`, "#f4f4f2") },

      // headline TOP, a SMALL contained landscape photo card mid-frame, lots of light
      // whitespace + a caption below — graphic-led on light (low photo coverage keeps it
      // out of the full-bleed athlete cluster). Different wide footage.
      { media: ["photo-group-coaching.jpg"], accepts: ["production:cinematic", "subject:athlete-action", "env:gym"], jsx: (m) => wrap("training-scene", `      <div style={{ position: "absolute", left: 64, right: 64, top: 150 }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 30, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 18 }}>SMALL-GROUP COACHING</div>
        <div style={{ fontFamily: "Anton", color: "#16161b", fontSize: 120, lineHeight: 0.9, textTransform: "uppercase" }}>Every athlete<br/>gets seen</div>
      </div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 660, height: 560, borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>
      <div style={{ position: "absolute", left: 64, right: 64, top: 1280 }}>
        <div style={{ width: 96, height: 8, background: "#c4141d", marginBottom: 22 }} />
        <div style={{ fontFamily: "Geist", color: "#444", fontSize: 40, fontWeight: 600, lineHeight: 1.3 }}>No more than eight athletes to a coach, every session.</div>
      </div>`, "#f1efec") },

      // split-panel: facility LEFT 45%, ink panel right (persona-free diversifier)
      { media: ["fac-gym.png"], accepts: ["env:gym"], jsx: (m) => wrap("training-scene", `      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "45%", overflow: "hidden" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "55%", background: "#16161b", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 54px" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 28, letterSpacing: "0.1em", marginBottom: 20 }}>THE FACILITY</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 100, lineHeight: 0.92, textTransform: "uppercase" }}>Built for<br/>real work</div>
        <div style={{ width: 110, height: 7, background: "#c4141d", margin: "28px 0" }} />
        <div style={{ fontFamily: "Geist", color: "#cfcfcf", fontSize: 34, fontWeight: 600 }}>Indoor turf · strength · speed</div>
      </div>`, "#16161b") },
    ] },

  // ==========================================================================
  // 12 — UGC SELFIE: a FACE fills the frame, native caption sticker. Photo-led.
  // ==========================================================================
  { slug: "ugc-selfie", archetype: "ugc-selfie",
    slotShape: { slots: [{ id: "caption", role: "hook", maxChars: 90, required: true }], roleSet: ["hook"] },
    variants: [
      { media: ["hero-sprint-male.jpg"], accepts: ["production:ugc-selfie", "subject:athlete-face"], jsx: (m) => wrap("ugc-selfie", `${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.7)", transformOrigin: "55% 22%"')}
      <div style={{ position: "absolute", left: 48, top: 120, background: "rgba(255,255,255,0.92)", color: "#111", padding: "16px 24px", borderRadius: 18, fontFamily: "Caveat", fontSize: 60, fontWeight: 700, transform: "rotate(-4deg)" }}>day 1 vs day 90</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center", fontFamily: "JetBrains Mono", color: "#fff", fontSize: 28, letterSpacing: "0.08em", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>@ATHLETESACCELERATION</div>`) },

      // different face, bottom caption bar (TikTok-style), different framing
      { media: ["hero-sprint-female.jpg"], accepts: ["production:ugc-selfie", "subject:athlete-face"], jsx: (m) => wrap("ugc-selfie", `${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(2.1)", transformOrigin: "78% 30%"')}
      <div style={{ position: "absolute", left: 40, right: 40, bottom: 150, fontFamily: "Geist", fontWeight: 700, color: "#fff", fontSize: 52, lineHeight: 1.12, textShadow: "0 2px 10px rgba(0,0,0,0.85)" }}>she stopped getting passed on the field</div>
      <div style={{ position: "absolute", left: 40, bottom: 80, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#c4141d", color: "#fff", fontFamily: "Anton", fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>AA</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#fff", fontSize: 26, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>@athletesacceleration</div>
      </div>`) },

      // different face, hand-drawn arrow + sticker note, top-left native UI
      { media: ["photo-agility-male.jpg"], accepts: ["production:ugc-selfie", "subject:athlete-face"], jsx: (m) => wrap("ugc-selfie", `${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.55)", transformOrigin: "48% 30%"')}
      <div style={{ position: "absolute", right: 44, top: 160, background: "#c4141d", color: "#fff", padding: "14px 22px", borderRadius: 16, fontFamily: "Caveat", fontSize: 58, fontWeight: 700, transform: "rotate(5deg)" }}>+4 inches!!</div>
      <svg viewBox="0 0 200 200" style={{ position: "absolute", right: 150, top: 300, width: 200, height: 200 }}><path d="M30 20 C120 40 150 120 120 170" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M120 170 l-26 -8 m26 8 l-6 -28" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/></svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: "JetBrains Mono", color: "#fff", fontSize: 26, letterSpacing: "0.08em", textShadow: "0 2px 8px rgba(0,0,0,0.85)" }}>real athlete · real result</div>`) },
    ] },

  // ==========================================================================
  // 13 — COACH PORTRAIT: photo on HALF + solid info PANEL on the other half. Photo-led.
  //   Vary side, panel color, tone.
  // ==========================================================================
  { slug: "coach-portrait", archetype: "coach-portrait",
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: 28, required: true }, { id: "name", role: "byline", maxChars: 28, required: false }, { id: "title", role: "byline", maxChars: 28, required: false }], roleSet: ["hook", "byline"] },
    variants: [
      { media: ["photo-coach-action.jpg"], accepts: ["production:cinematic", "subject:coach-face"], jsx: (m) => wrap("coach-portrait", `      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "52%", overflow: "hidden" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48%", background: "#c4141d", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 86, lineHeight: 0.95, textTransform: "uppercase" }}>Speed is coachable</div>
        <div style={{ width: 80, height: 6, background: "#fff", margin: "28px 0" }} />
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 38, fontWeight: 700 }}>Coach Graham Wilkerson</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#ffd2d4", fontSize: 26, letterSpacing: "0.04em", marginTop: 4 }}>DIRECTOR OF PERFORMANCE</div>
      </div>`) },

      // photo RIGHT, ink panel LEFT, different coach photo
      { media: ["photo-lifting.jpg"], accepts: ["production:cinematic", "subject:coach-face"], jsx: (m) => wrap("coach-portrait", `      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "54%", overflow: "hidden" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "46%", background: "#16161b", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 26, letterSpacing: "0.08em", marginBottom: 20 }}>MEET YOUR COACH</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 84, lineHeight: 0.94, textTransform: "uppercase" }}>20 years on the floor</div>
        <div style={{ width: 80, height: 6, background: "#c4141d", margin: "28px 0" }} />
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 36, fontWeight: 700 }}>Coach Devon Hayes</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#9a9aa3", fontSize: 24, marginTop: 4 }}>HEAD OF STRENGTH</div>
      </div>`) },

      // photo LEFT, WHITE panel right, light register, different photo
      { media: ["photo-medball-female.jpg"], accepts: ["production:cinematic", "subject:coach-face"], jsx: (m) => wrap("coach-portrait", `      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "50%", overflow: "hidden" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", background: "#f4f4f2", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 46px" }}>
        <div style={{ fontFamily: "Anton", color: "#16161b", fontSize: 82, lineHeight: 0.95, textTransform: "uppercase" }}>Coaching, not<br/>babysitting</div>
        <div style={{ width: 80, height: 6, background: "#c4141d", margin: "26px 0" }} />
        <div style={{ fontFamily: "Geist", color: "#16161b", fontSize: 36, fontWeight: 700 }}>Coach Casey Lin</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#777", fontSize: 24, marginTop: 4 }}>YOUTH DEVELOPMENT LEAD</div>
      </div>`) },
    ] },

  // ==========================================================================
  // 14 — TIMELINE / SCHEDULE: a CALENDAR / week grid / program timeline.
  //   Keep 2D or horizontal forms — away from list-steps' vertical numbered rows.
  // ==========================================================================
  { slug: "timeline-schedule", archetype: "timeline-schedule",
    slotShape: { slots: [{ id: "heading", role: "hook", maxChars: 40, required: true }, { id: "caption", role: "claim", maxChars: 40, required: false }], roleSet: ["hook", "claim"] },
    variants: [
      { media: [], accepts: [], jsx: () => {
        const days = [["MON", "SPEED", 1], ["TUE", "REST", 0], ["WED", "STRENGTH", 1], ["THU", "REST", 0], ["FRI", "POWER", 1], ["SAT", "GAME", 1], ["SUN", "REST", 0]];
        const cols = days.map(([d, w, on]) => `<div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "#9a9aa3", fontSize: 24, letterSpacing: "0.04em", marginBottom: 14 }}>${d}</div>
          <div style={{ width: "84%", height: 700, borderRadius: 14, background: "${on ? "#c4141d" : "#15151a"}", border: "${on ? "none" : "2px solid #2a2a32"}", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 20 }}>
            <div style={{ fontFamily: "Anton", color: "${on ? "#fff" : "#3a3a42"}", fontSize: 26, textTransform: "uppercase", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>${w}</div>
          </div>
        </div>`).join("\n          ");
        return wrap("timeline-schedule", `      <div style={{ position: "absolute", inset: 0, padding: "120px 48px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 84, textTransform: "uppercase", lineHeight: 0.95 }}>A week at<br/>the facility</div>
        <div style={{ fontFamily: "Geist", color: "#9a9aa3", fontSize: 30, margin: "16px 0 56px" }}>Every athlete on a real plan</div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          ${cols}
        </div>
      </div>`, "#0d0d12");
      } },

      // MONTH calendar grid (5×7) with marked session days — clearly 2D, light register
      { media: [], accepts: [], jsx: () => {
        const dow = ["S", "M", "T", "W", "T", "F", "S"];
        const sessions = new Set([2, 4, 6, 9, 11, 13, 16, 18, 20, 23, 25, 27, 30]);
        let day = 1; const cells = [];
        for (let i = 0; i < 35; i++) {
          const inMonth = i >= 2 && day <= 31;
          const n = inMonth ? day++ : "";
          const on = inMonth && sessions.has(typeof n === "number" ? n : -1);
          cells.push(`<div style={{ aspectRatio: "1", borderRadius: 10, background: "${on ? "#c4141d" : inMonth ? "#fff" : "transparent"}", border: "${inMonth ? "1px solid #e2e2e0" : "none"}", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "JetBrains Mono", fontSize: 26, color: "${on ? "#fff" : "#16161b"}", fontWeight: ${on ? 700 : 400} }}>${n}</div>`);
        }
        return wrap("timeline-schedule", `      <div style={{ position: "absolute", inset: 0, padding: "120px 60px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 30, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 14 }}>YOUR TRAINING MONTH</div>
        <div style={{ fontFamily: "Anton", color: "#16161b", fontSize: 92, textTransform: "uppercase", lineHeight: 0.95, marginBottom: 44 }}>13 sessions,<br/>one plan</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 12, marginBottom: 10 }}>${dow.map((d) => `<div style={{ textAlign: "center", fontFamily: "JetBrains Mono", color: "#9a9aa3", fontSize: 24 }}>${d}</div>`).join("")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 12 }}>${cells.join("")}</div>
      </div>`, "#f4f4f2");
      } },

      // horizontal ROADMAP: 4 phases along a track with milestone nodes
      { media: [], accepts: [], jsx: () => {
        const phases = [["WK 1", "Test"], ["WK 4", "Base"], ["WK 8", "Power"], ["WK 12", "Re-test"]];
        const nodes = phases.map((p, i) => `<div style={{ position: "relative", flex: 1, textAlign: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "${i === 3 ? "#c4141d" : "#fff"}", border: "5px solid #c4141d", margin: "0 auto" }} />
          <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 28, marginTop: 18, fontWeight: 700 }}>${p[0]}</div>
          <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 44, textTransform: "uppercase", marginTop: 6 }}>${p[1]}</div>
        </div>`).join("\n          ");
        return wrap("timeline-schedule", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 96, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 80 }}>The 12-week<br/>roadmap</div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: "12%", right: "12%", top: 20, height: 6, background: "#c4141d" }} />
          <div style={{ display: "flex", position: "relative" }}>
            ${nodes}
          </div>
        </div>
      </div>`, "#0d0d12");
      } },
    ] },

  // ==========================================================================
  // 15 — BENEFIT ICON ROW: a grid/row of ICONS + short labels, negative space.
  // ==========================================================================
  { slug: "benefit-iconrow", archetype: "benefit-iconrow",
    slotShape: { slots: [{ id: "heading", role: "hook", maxChars: 36, required: true }, { id: "b1", role: "claim", maxChars: 24, required: true }, { id: "b2", role: "claim", maxChars: 24, required: true }, { id: "b3", role: "claim", maxChars: 24, required: true }, { id: "b4", role: "claim", maxChars: 24, required: false }], roleSet: ["hook", "claim"] },
    variants: [
      { media: [], accepts: [], jsx: () => {
        const items = [[icon(G.check, "#c4141d"), "Measured results"], [icon(G.star, "#1f6feb"), "Small group coaching"], [icon(G.clock, "#2ea043"), "Flexible scheduling"], [icon(G.bolt, "#d29922"), "Built for ages 8–18"]];
        const cells = items.map(([ic, label]) => `<div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 }}>
          ${ic}
          <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 36, fontWeight: 600 }}>${label}</div>
        </div>`).join("\n          ");
        return wrap("benefit-iconrow", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 88, textTransform: "uppercase", lineHeight: 0.95, marginBottom: 80, textAlign: "center" }}>Why parents<br/>choose us</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridRowGap: 80, gridColumnGap: 40 }}>
          ${cells}
        </div>
      </div>`, "#111318");
      } },

      // LIGHT register, single horizontal row of 3 icons
      { media: [], accepts: [], jsx: () => {
        const items = [[icon(G.target, "#c4141d"), "Test-based plan"], [icon(G.people, "#16161b"), "Coached in groups"], [icon(G.shield, "#c4141d"), "Results guaranteed"]];
        const cells = items.map(([ic, label]) => `<div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22 }}>
          ${ic}
          <div style={{ fontFamily: "Geist", color: "#16161b", fontSize: 34, fontWeight: 600, maxWidth: 240 }}>${label}</div>
        </div>`).join("\n          ");
        return wrap("benefit-iconrow", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 32, letterSpacing: "0.12em", fontWeight: 700, textAlign: "center", marginBottom: 18 }}>WHAT YOU GET</div>
        <div style={{ fontFamily: "Anton", color: "#16161b", fontSize: 96, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 90, textAlign: "center" }}>Three reasons<br/>it works</div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 30 }}>
          ${cells}
        </div>
      </div>`, "#f4f4f2");
      } },

      // 2×2 grid of icon TILES on a red field (icon-left + label), distinct from a's
      // dark centered-icon 2x2 and b's light 3-across — and NOT a vertical list (which
      // collides with list-steps). Reads as a feature grid.
      { media: [], accepts: [], jsx: () => {
        const circle = (glyph) => `<svg width="120" height="120" viewBox="0 0 92 92"><circle cx="46" cy="46" r="46" fill="#fff"/>${glyph.replace(/#fff/g, "#c4141d")}</svg>`;
        const items = [[circle(G.bars), "Track every test"], [circle(G.clock), "Fits the school day"], [circle(G.shield), "90-day guarantee"], [circle(G.people), "Coaches, not machines"]];
        const cells = items.map(([ic, label]) => `<div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 }}>
          ${ic}
          <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 32, fontWeight: 700, lineHeight: 1.1, maxWidth: 220 }}>${label}</div>
        </div>`).join("\n          ");
        return wrap("benefit-iconrow", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 70px" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 96, textTransform: "uppercase", lineHeight: 0.92, marginBottom: 80, textAlign: "center" }}>Built different</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridRowGap: 70, gridColumnGap: 40 }}>
          ${cells}
        </div>
      </div>`, "#c4141d");
      } },
    ] },
];

// ---------------------------------------------------------------------------
// This generator OWNS the static id range only. It never wipes the whole
// _examples dir (that would delete the video generator's ex-046+ work — D-CRIT);
// it removes only its OWN ids' authored sources, then merges its rows into the
// shared manifest, preserving any video rows.
function main() {
  mkdirSync(ASSETS_DIR, { recursive: true });

  // 1) precompute the ids this run owns (deterministic seq → makeExampleId)
  const plan = [];
  const ownedIds = new Set();
  let seq = 0;
  for (const a of ARCHETYPES) {
    for (const v of a.variants) {
      const id = makeExampleId(++seq, a.slug);
      ownedIds.add(id);
      plan.push({ id, a, v });
    }
  }

  // 2) clear only our own authored sources (jsx + assets), never another generator's
  removeOwnedSources({ examplesDir: EXAMPLES_DIR, assetsDir: ASSETS_DIR, ownedIds });

  // 3) write each example's jsx + copy its media
  const rows = [];
  for (const { id, a, v } of plan) {
    const refs = (v.media || []).map((src, i) => {
      const dest = `${id}-${i}.${src.split(".").pop()}`;
      copyFileSync(resolveSrc(src), join(ASSETS_DIR, dest));
      return `./assets/${dest}`;
    });
    writeFileSync(join(EXAMPLES_DIR, `${id}.jsx`), v.jsx(refs));
    rows.push({ id, archetype: a.archetype, format: "static", mediaStyleAccepts: v.accepts || [], slotShape: v.slotShape || a.slotShape });
  }

  // 4) merge into the shared manifest (replace our ids; keep video rows)
  mergeManifest({ manifestPath: MANIFEST, rows, ownedIds });
  process.stderr.write(`[author] wrote ${rows.length} static examples (${ARCHETYPES.length} archetypes × 3 sub-looks); other ids preserved\n`);
}

main();

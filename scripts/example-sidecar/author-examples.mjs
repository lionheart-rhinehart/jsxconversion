// ============================================================================
//  scripts/example-sidecar/author-examples.mjs  — Track B example GENERATOR
// ============================================================================
//  15 DISTINCT DESIGNS, one each (1 design = 1 cluster). Each is a different layout
//  FAMILY — a different dominant element + frame division (the squint test). The
//  acceptance gate is numeric: every cross-design cosine < 0.70 AND k-means purity
//  >= 0.80 (measured by embed.py). 6 designs are photo-based (each framed differently);
//  9 are pure-graphic (number / chart / type / quote / columns / rows / card / calendar
//  / icons) so they sit far from the photo set in embedding space.
//
//  Distinctness comes from STRUCTURE, not font size or which photo. To re-cut a
//  colliding design, change its LAYOUT FAMILY here (not the photo/copy).
//
//  Run:  node scripts/example-sidecar/author-examples.mjs
//  Node-only. New file (Track B). Imports nothing from Track A's working set.
// ============================================================================

import { existsSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { makeExampleId } from "../lib/example-library.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const EXAMPLES_DIR = join(ROOT, "templates", "_examples");
const ASSETS_DIR = join(EXAMPLES_DIR, "assets");
const MANIFEST = join(HERE, "examples.manifest.json");
const NAMED = join(ROOT, "brand", "aa-design-system", "project", "assets");

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

// SVG icon (no emoji): a rounded square with a simple glyph. Distinct, flat.
const icon = (glyph, color) => `<svg width="92" height="92" viewBox="0 0 92 92"><rect width="92" height="92" rx="20" fill="${color}"/>${glyph}</svg>`;
const ICONS = [
  icon('<path d="M28 48 l12 12 l24 -28" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>', "#c4141d"),
  icon('<path d="M46 22 l8 18 l20 2 -15 14 4 20 -17 -10 -17 10 4 -20 -15 -14 20 -2 z" fill="#fff"/>', "#1f6feb"),
  icon('<circle cx="46" cy="46" r="20" stroke="#fff" stroke-width="8" fill="none"/><path d="M46 34 v14 l10 6" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>', "#2ea043"),
  icon('<path d="M30 60 l16 -28 l16 28 z" fill="#fff"/>', "#d29922"),
];

// ---------------------------------------------------------------------------
// 15 designs. media = source basenames under NAMED (copied to assets per example).
// ---------------------------------------------------------------------------
const DESIGNS = [
  // 1 — GIANT STAT: one huge number owns a dark frame. No photo.
  { slug: "giant-stat", archetype: "giant-stat", media: [], accepts: [],
    slotShape: { slots: [{ id: "label", role: "kicker", maxChars: 20, required: false }, { id: "stat", role: "stat", maxChars: 8, required: true }, { id: "sub", role: "claim", maxChars: 28, required: false }], roleSet: ["kicker", "stat", "claim"] },
    jsx: () => wrap("giant-stat", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 36, letterSpacing: "0.14em", fontWeight: 700, marginBottom: 8 }}>VERTICAL JUMP</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 500, lineHeight: 0.8 }}>92<span style={{ color: "#c4141d", fontSize: 200 }}>%</span></div>
        <div style={{ fontFamily: "Geist", color: "#bdbdbd", fontSize: 42, fontWeight: 600, marginTop: 16 }}>improved in 90 days</div>
      </div>`, "#0a0a0a") },

  // 2 — METRIC REVEAL: a bar chart dominates a light frame. Data-viz. No photo.
  { slug: "metric-reveal", archetype: "metric-reveal", media: [], accepts: [],
    slotShape: { slots: [{ id: "title", role: "claim", maxChars: 40, required: true }, { id: "caption", role: "reframe", maxChars: 40, required: false }], roleSet: ["claim", "reframe"] },
    jsx: () => {
      const bars = [320, 470, 610, 770, 980];
      const bx = bars.map((h, i) => `<rect x="${110 + i * 170}" y="${1280 - h}" width="120" height="${h}" rx="8" fill="${i === bars.length - 1 ? "#c4141d" : "#2a2a32"}"/>`).join("");
      return wrap("metric-reveal", `      <div style={{ position: "absolute", left: 64, top: 150, right: 64 }}>
        <div style={{ fontFamily: "Anton", color: "#111", fontSize: 78, textTransform: "uppercase", lineHeight: 0.95 }}>Speed gains<br/>by week</div>
        <div style={{ fontFamily: "Geist", color: "#666", fontSize: 34, marginTop: 12 }}>Measured every 2 weeks</div>
      </div>
      <svg viewBox="0 0 1080 1320" style={{ position: "absolute", left: 0, bottom: 120, width: "100%" }}><line x1="90" y1="1280" x2="990" y2="1280" stroke="#ccc" stroke-width="4"/>${bx}</svg>
      <div style={{ position: "absolute", left: 64, bottom: 60, fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 30, letterSpacing: "0.08em" }}>WEEK 1 → WEEK 10</div>`, "#f4f4f2");
    } },

  // 3 — KINETIC TEXT: bold edge-to-edge type, no photo, color blocks.
  { slug: "kinetic-text", archetype: "kinetic-text", media: [], accepts: [],
    slotShape: { slots: [{ id: "l1", role: "kicker", maxChars: 16, required: true }, { id: "l2", role: "hook", maxChars: 16, required: true }, { id: "l3", role: "claim", maxChars: 16, required: true }], roleSet: ["kicker", "hook", "claim"] },
    jsx: () => wrap("kinetic-text", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
        <div style={{ fontFamily: "Anton", fontSize: 200, lineHeight: 0.9, textTransform: "uppercase", color: "#fff" }}>TRAIN</div>
        <div style={{ fontFamily: "Anton", fontSize: 200, lineHeight: 0.9, textTransform: "uppercase", color: "#0a0a0a", background: "#c4141d", display: "inline-block", padding: "0 18px", width: "fit-content" }}>LIKE IT</div>
        <div style={{ fontFamily: "Anton", fontSize: 200, lineHeight: 0.9, textTransform: "uppercase", color: "#fff" }}>MATTERS</div>
      </div>`, "#111") },

  // 4 — QUOTE CARD: a pull-quote + attribution on a subtle bg. No photo hero.
  { slug: "quote-card", archetype: "quote-card", media: [], accepts: [],
    slotShape: { slots: [{ id: "quote", role: "testimonial", maxChars: 120, required: true }, { id: "attribution", role: "byline", maxChars: 36, required: false }], roleSet: ["testimonial", "byline"] },
    jsx: () => wrap("quote-card", `      <div style={{ position: "absolute", left: 80, top: 220, fontFamily: "Anton", color: "#c4141d", fontSize: 320, lineHeight: 0.7 }}>&ldquo;</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 540, fontFamily: "Geist", color: "#f4f4f2", fontSize: 72, fontWeight: 700, lineHeight: 1.18 }}>My son went from the bench to starting in one season.</div>
      <div style={{ position: "absolute", left: 80, bottom: 200, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 14, height: 64, background: "#c4141d" }} />
        <div><div style={{ fontFamily: "Geist", color: "#fff", fontSize: 36, fontWeight: 700 }}>Sarah M.</div><div style={{ fontFamily: "JetBrains Mono", color: "#9a9aa3", fontSize: 26 }}>CARMEL PARENT</div></div>
      </div>`, "#16161b") },

  // 5 — BEFORE/AFTER SPLIT: horizontal dual-frame, two photos.
  { slug: "before-after-split", archetype: "before-after-split", media: ["photo-conditioning.jpg", "hero-sprint-female.jpg"], accepts: ["subject:athlete-action"],
    slotShape: { slots: [{ id: "beforeLabel", role: "kicker", maxChars: 12, required: true }, { id: "afterLabel", role: "kicker", maxChars: 12, required: true }, { id: "stat", role: "stat", maxChars: 10, required: false }], roleSet: ["kicker", "stat"] },
    jsx: (m) => wrap("before-after-split", `      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}
          <div style={{ position: "absolute", inset: 0, background: "rgba(20,20,30,0.45)" }} />
          <div style={{ position: "absolute", left: 48, top: 40, fontFamily: "JetBrains Mono", color: "#fff", fontSize: 36, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(0,0,0,0.55)", padding: "8px 18px" }}>WEEK 1</div>
        </div>
        <div style={{ height: 6, background: "#c4141d" }} />
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>${img(m[1], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}
          <div style={{ position: "absolute", left: 48, top: 40, fontFamily: "JetBrains Mono", color: "#fff", fontSize: 36, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(196,20,29,0.85)", padding: "8px 18px" }}>WEEK 12</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center", fontFamily: "Anton", color: "#fff", fontSize: 120, textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>+1 MPH</div>`) },

  // 6 — VERSUS: vertical two-column contrast. Pure color columns, no photo.
  { slug: "versus", archetype: "versus", media: [], accepts: [],
    slotShape: { slots: [{ id: "leftKicker", role: "kicker", maxChars: 16, required: true }, { id: "leftLine", role: "claim", maxChars: 24, required: true }, { id: "rightKicker", role: "kicker", maxChars: 24, required: true }, { id: "rightLine", role: "claim", maxChars: 24, required: true }], roleSet: ["kicker", "claim"] },
    jsx: () => wrap("versus", `      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
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

  // 7 — PROOF COLLAGE: testimonial-card WALL on a LIGHT bg — white review cards
  // (photo + quote) in a grid, dark text. Separates from the dark gym-photo set
  // (Gemini fix: black bg → bright, make it read as reviews not raw photos).
  { slug: "proof-collage", archetype: "proof-collage", media: ["photo-jump-female.jpg", "photo-agility-female.jpg", "photo-box-jump.jpg", "photo-medball-female.jpg"], accepts: ["subject:athlete-face"],
    slotShape: { slots: [{ id: "heading", role: "claim", maxChars: 24, required: true }, { id: "rating", role: "proof", maxChars: 8, required: false }, { id: "quote", role: "testimonial", maxChars: 48, required: false }], roleSet: ["claim", "proof", "testimonial"] },
    jsx: (m) => wrap("proof-collage", `      <div style={{ position: "absolute", inset: 0, padding: 48, boxSizing: "border-box" }}>
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

  // 8 — LIST / STEPS: numbered row stack, no photo.
  { slug: "list-steps", archetype: "list-steps", media: [], accepts: [],
    slotShape: { slots: [{ id: "heading", role: "hook", maxChars: 40, required: true }, { id: "step1", role: "claim", maxChars: 36, required: true }, { id: "step2", role: "claim", maxChars: 36, required: true }, { id: "step3", role: "claim", maxChars: 36, required: true }], roleSet: ["hook", "claim"] },
    jsx: () => {
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

  // 9 — OFFER CARD: a framed deal card with guarantee + CTA. No photo.
  { slug: "offer-card", archetype: "offer-card", media: [], accepts: [],
    slotShape: { slots: [{ id: "kicker", role: "kicker", maxChars: 28, required: false }, { id: "offer", role: "offer", maxChars: 36, required: true }, { id: "guarantee", role: "guarantee", maxChars: 64, required: true }, { id: "cta", role: "cta", maxChars: 20, required: true }], roleSet: ["kicker", "offer", "guarantee", "cta"] },
    jsx: () => wrap("offer-card", `      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 64 }}>
        <div style={{ width: "100%", background: "#fff", borderRadius: 28, padding: "56px 48px", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 30, letterSpacing: "0.1em" }}>SUMMER PERFORMANCE CAMP</div>
          <div style={{ fontFamily: "Anton", color: "#111", fontSize: 112, lineHeight: 0.92, textTransform: "uppercase", marginTop: 16 }}>8 weeks.<br/>3 days a week.</div>
          <div style={{ marginTop: 36, padding: "26px 28px", background: "#faf3f3", border: "2px solid #c4141d", borderRadius: 16, fontFamily: "Geist", color: "#111", fontSize: 38, fontWeight: 700, lineHeight: 1.2 }}>+1 mph speed. +3" vertical. 90 days. Or your training is on us.</div>
          <div style={{ marginTop: 40, textAlign: "center", background: "#c4141d", color: "#fff", fontFamily: "Anton", fontSize: 52, textTransform: "uppercase", padding: "24px", borderRadius: 12 }}>Claim your spot</div>
        </div>
      </div>`, "#0d0d0d") },

  // 10 — ACTION HERO: full-bleed action + HUGE overlay headline.
  { slug: "action-hero", archetype: "action-hero", media: ["photo-jump-male.jpg"], accepts: ["production:cinematic", "subject:athlete-action"],
    slotShape: { slots: [{ id: "eyebrow", role: "eyebrow", maxChars: 28, required: true }, { id: "headline", role: "hook", maxChars: 40, required: true }], roleSet: ["eyebrow", "hook"] },
    jsx: (m) => wrap("action-hero", `${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0.6) 64%, rgba(0,0,0,0.95) 100%)" }} />
      <div style={{ position: "absolute", left: 70, top: 150, background: "#fff", color: "#c4141d", padding: "10px 22px", borderRadius: 8, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 32, letterSpacing: "0.04em" }}>CARMEL SPORT PARENTS</div>
      <div style={{ position: "absolute", left: 56, right: 56, bottom: 130 }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 230, lineHeight: 0.86, textTransform: "uppercase", textShadow: "0 2px 30px rgba(0,0,0,0.8)" }}>Faster by the fall</div>
      </div>`) },

  // 11 — TRAINING SCENE: graphically-driven on LIGHT bg — a contained photo CARD
  // (not full-bleed) + a dominant ink headline. Separates from the dark full-bleed
  // action-hero (Gemini fix: photo-driven+dark → graphic-driven+bright).
  { slug: "training-scene", archetype: "training-scene", media: ["photo-gym-wide.jpg"], accepts: ["production:cinematic", "subject:athlete-action", "env:gym"],
    slotShape: { slots: [{ id: "headline", role: "claim", maxChars: 40, required: true }, { id: "byline", role: "byline", maxChars: 40, required: false }], roleSet: ["claim", "byline"] },
    jsx: (m) => wrap("training-scene", `      <div style={{ position: "absolute", left: 56, right: 56, top: 80, height: 1040, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 1200 }}>
        <div style={{ width: 96, height: 8, background: "#c4141d", marginBottom: 24 }} />
        <div style={{ fontFamily: "Anton", color: "#111", fontSize: 118, lineHeight: 0.92, textTransform: "uppercase" }}>Where Carmel<br/>trains all winter</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#666", fontSize: 30, marginTop: 22, letterSpacing: "0.04em" }}>ATHLETES ACCELERATION · CARMEL, IN</div>
      </div>`, "#f4f4f2") },

  // 12 — UGC SELFIE: a face fills the frame, native caption sticker, minimal design.
  { slug: "ugc-selfie", archetype: "ugc-selfie", media: ["hero-sprint-male.jpg"], accepts: ["production:ugc-selfie", "subject:athlete-face"],
    slotShape: { slots: [{ id: "caption", role: "hook", maxChars: 90, required: true }], roleSet: ["hook"] },
    jsx: (m) => wrap("ugc-selfie", `${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.7)", transformOrigin: "55% 22%"')}
      <div style={{ position: "absolute", left: 48, top: 120, background: "rgba(255,255,255,0.92)", color: "#111", padding: "16px 24px", borderRadius: 18, fontFamily: "Caveat", fontSize: 60, fontWeight: 700, transform: "rotate(-4deg)" }}>day 1 vs day 90</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center", fontFamily: "JetBrains Mono", color: "#fff", fontSize: 28, letterSpacing: "0.08em", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>@ATHLETESACCELERATION</div>`) },

  // 13 — COACH PORTRAIT: photo on the LEFT half + solid info PANEL on the right.
  { slug: "coach-portrait", archetype: "coach-portrait", media: ["photo-coach-action.jpg"], accepts: ["production:cinematic", "subject:coach-face"],
    slotShape: { slots: [{ id: "headline", role: "hook", maxChars: 28, required: true }, { id: "name", role: "byline", maxChars: 28, required: false }, { id: "title", role: "byline", maxChars: 28, required: false }], roleSet: ["hook", "byline"] },
    jsx: (m) => wrap("coach-portrait", `      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "52%", overflow: "hidden" }}>${img(m[0], 'position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"')}</div>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "48%", background: "#c4141d", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 44px" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 86, lineHeight: 0.95, textTransform: "uppercase" }}>Speed is coachable</div>
        <div style={{ width: 80, height: 6, background: "#fff", margin: "28px 0" }} />
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 38, fontWeight: 700 }}>Coach Graham Wilkerson</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#ffd2d4", fontSize: 26, letterSpacing: "0.04em", marginTop: 4 }}>DIRECTOR OF PERFORMANCE</div>
      </div>`) },

  // 14 — TIMELINE / SCHEDULE: a week grid. No photo.
  { slug: "timeline-schedule", archetype: "timeline-schedule", media: [], accepts: [],
    slotShape: { slots: [{ id: "heading", role: "hook", maxChars: 40, required: true }, { id: "caption", role: "claim", maxChars: 40, required: false }], roleSet: ["hook", "claim"] },
    jsx: () => {
      // HORIZONTAL 7-column week grid (calendar strip) — distinct layout family from
      // list-steps' vertical numbered rows (fixes the list~timeline near-twin).
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

  // 15 — BENEFIT ICON ROW: a grid of icons + labels, lots of negative space. No photo.
  { slug: "benefit-iconrow", archetype: "benefit-iconrow", media: [], accepts: [],
    slotShape: { slots: [{ id: "heading", role: "hook", maxChars: 36, required: true }, { id: "b1", role: "claim", maxChars: 24, required: true }, { id: "b2", role: "claim", maxChars: 24, required: true }, { id: "b3", role: "claim", maxChars: 24, required: true }, { id: "b4", role: "claim", maxChars: 24, required: true }], roleSet: ["hook", "claim"] },
    jsx: () => {
      const items = [[ICONS[0], "Measured results"], [ICONS[1], "Small group coaching"], [ICONS[2], "Flexible scheduling"], [ICONS[3], "Built for ages 8–18"]];
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
];

// ---------------------------------------------------------------------------
function main() {
  rmSync(EXAMPLES_DIR, { recursive: true, force: true });
  mkdirSync(ASSETS_DIR, { recursive: true });
  const manifest = { note: "Track-B authoring manifest — generated by author-examples.mjs. 15 distinct designs, 1 each. Edit the generator's DESIGNS, not this file.", examples: [] };
  let seq = 0;

  for (const d of DESIGNS) {
    const id = makeExampleId(++seq, d.slug);
    const refs = d.media.map((src, i) => {
      const dest = `${id}-${i}.jpg`;
      copyFileSync(join(NAMED, src), join(ASSETS_DIR, dest));
      return `./assets/${dest}`;
    });
    writeFileSync(join(EXAMPLES_DIR, `${id}.jsx`), d.jsx(refs));
    manifest.examples.push({ id, archetype: d.archetype, format: "static", mediaStyleAccepts: d.accepts, slotShape: d.slotShape });
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  process.stderr.write(`[author] wrote ${manifest.examples.length} distinct designs (1 each)\n`);
}

main();

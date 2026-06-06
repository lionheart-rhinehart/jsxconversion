// ============================================================================
//  scripts/example-sidecar/author-examples.mjs  — Track B example GENERATOR
// ============================================================================
//  Emits the example library from a compact spec instead of hand-writing dozens of
//  JSX files. For each archetype it holds ONE layout template + N copy/media specs;
//  it assigns every example a UNIQUE source photo (never shared across archetypes —
//  the pixel-identity-inflation lesson) copied from the brand library into
//  templates/_examples/assets/ with a clean per-example name, writes the
//  <id>.jsx files, and rewrites scripts/example-sidecar/examples.manifest.json.
//
//  Scaling 3→10→20 examples per archetype = bump PER_ARCHETYPE (media pools permitting).
//  Within an archetype the layout is constant and the MEDIA + COPY vary = the doc's
//  "≥3 sub-looks" requirement. Across archetypes the layout differs = distinct cells.
//
//  Covers the 10 STATIC archetypes. The 2 video-only archetypes (metric-reveal,
//  kinetic-statement) are authored separately once the poster-frame path lands.
//
//  Run:  node scripts/example-sidecar/author-examples.mjs
//  Node-only. New file (Track B). Imports nothing from Track A's working set.
// ============================================================================

import { existsSync, mkdirSync, readdirSync, copyFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { makeExampleId } from "../lib/example-library.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const EXAMPLES_DIR = join(ROOT, "templates", "_examples");
const ASSETS_DIR = join(EXAMPLES_DIR, "assets");
const MANIFEST = join(HERE, "examples.manifest.json");

const NAMED = join(ROOT, "brand", "aa-design-system", "project", "assets");
const UPLOADS = join(ROOT, "brand", "aa-design-system", "project", "uploads");

// ---------------------------------------------------------------------------
// Source photo pools (content-appropriate), built from the real brand library.
// FACES = people/coach close-ish · ACTION = athletes mid-drill · ENV = wide places ·
// GENERIC = raw unlabeled shots (DSC*) usable anywhere a photo is incidental.
// ---------------------------------------------------------------------------
const isJpg = (f) => /\.(jpe?g)$/i.test(f);
function pool(dir, re) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => isJpg(f) && re.test(f)).map((f) => join(dir, f));
}
const POOLS = {
  faces: [
    ...pool(NAMED, /coach|group|hero-sprint/i),
    ...pool(UPLOADS, /Speaking|Group/i),
  ],
  action: [
    ...pool(NAMED, /agility|jump|lift|squat|medball|box|band|run|conditioning|sprint-mixed/i),
    ...pool(UPLOADS, /Agility|Squat|Med Ball|Sprint|Jumping/i),
  ],
  env: [...pool(NAMED, /gym-wide|conditioning|group/i), ...pool(UPLOADS, /Group Shot/i)],
  generic: [...pool(UPLOADS, /DSC/i)],
};
// de-dupe within each pool
for (const k of Object.keys(POOLS)) POOLS[k] = [...new Set(POOLS[k])];

const used = new Set();
function take(poolNames) {
  for (const name of poolNames) {
    for (const src of POOLS[name]) {
      if (!used.has(src)) { used.add(src); return src; }
    }
  }
  throw new Error(`media pool exhausted for ${poolNames.join("/")} — add more photos or lower PER_ARCHETYPE`);
}

// ---------------------------------------------------------------------------
// JSX layout templates — one per archetype. Each returns a self-contained static
// React component string. (No <Stage>/<Composition>/animation tokens, even in
// comments — the renderer's classifier is a naive regex.)
// ---------------------------------------------------------------------------
const W = 1080, H = 1920;
const head = (a) => `// ${a} — generated example. Plain static React; carries real media.\n`;
const wrap = (inner) => `export default function Example() {
  return (
    <div style={{ width: ${W}, height: ${H}, position: "relative", overflow: "hidden", background: "#000" }}>
${inner}
    </div>
  );
}
`;
const cover = (src, extra = "") => `      <img src="${src}" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover"${extra} }} />`;

const TEMPLATES = {
  "ugc-selfie": (m, t) => head("ugc-selfie") + wrap(
`${cover(m[0], `, transform: "scale(1.5)", transformOrigin: "55% 26%"`)}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 320, background: "linear-gradient(0deg, rgba(0,0,0,0.86) 0%, rgba(0,0,0,0) 100%)" }} />
      <div style={{ position: "absolute", left: 48, right: 48, bottom: 84, fontFamily: "Geist", color: "#fff", fontSize: 50, fontWeight: 700, lineHeight: 1.08 }}>${t.caption}</div>`),

  "coach-authority": (m, t) => head("coach-authority") + wrap(
`${cover(m[0])}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.9) 100%)" }} />
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 150, fontFamily: "Anton", color: "#fff", fontSize: 96, lineHeight: 0.92, textTransform: "uppercase" }}>${t.headline}</div>
      <div style={{ position: "absolute", left: 64, bottom: 80, borderLeft: "6px solid #c4141d", paddingLeft: 20 }}>
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 38, fontWeight: 700 }}>${t.name}</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c9c9c9", fontSize: 26, letterSpacing: "0.04em" }}>${t.title}</div>
      </div>`),

  "action-hero": (m, t) => head("action-hero") + wrap(
`${cover(m[0])}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.55) 72%, rgba(0,0,0,0.92) 100%)" }} />
      <div style={{ position: "absolute", left: 70, top: 150, background: "#fff", color: "#c4141d", padding: "10px 22px", borderRadius: 8, fontFamily: "JetBrains Mono", fontWeight: 700, fontSize: 32, letterSpacing: "0.04em" }}>${t.eyebrow}</div>
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 210 }}>
        <div style={{ width: 240, height: 7, background: "#c4141d", marginBottom: 28 }} />
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 140, lineHeight: 0.92, textTransform: "uppercase", textShadow: "0 2px 24px rgba(0,0,0,0.75)" }}>${t.headline}</div>
      </div>`),

  "training-scene": (m, t) => head("training-scene") + wrap(
`${cover(m[0])}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 42%)" }} />
      <div style={{ position: "absolute", left: 64, bottom: 96 }}>
        <div style={{ width: 64, height: 6, background: "#c4141d", marginBottom: 18 }} />
        <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 46, fontWeight: 700, lineHeight: 1.1, maxWidth: 780 }}>${t.headline}</div>
        <div style={{ fontFamily: "JetBrains Mono", color: "#cfcfcf", fontSize: 26, marginTop: 16, letterSpacing: "0.04em" }}>${t.byline}</div>
      </div>`),

  "transformation-split": (m, t) => head("transformation-split") + wrap(
`      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>
          <img src="${m[0]}" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(20,20,30,0.45)" }} />
          <div style={{ position: "absolute", left: 48, top: 40, fontFamily: "JetBrains Mono", color: "#fff", fontSize: 34, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(0,0,0,0.55)", padding: "8px 18px" }}>${t.beforeLabel}</div>
        </div>
        <div style={{ height: 6, background: "#c4141d" }} />
        <div style={{ position: "relative", height: "50%", overflow: "hidden" }}>
          <img src="${m[1]}" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", left: 48, top: 40, fontFamily: "JetBrains Mono", color: "#fff", fontSize: 34, fontWeight: 700, letterSpacing: "0.08em", background: "rgba(196,20,29,0.85)", padding: "8px 18px" }}>${t.afterLabel}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center", fontFamily: "Anton", color: "#fff", fontSize: 120, textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>${t.stat}</div>`),

  "proof-collage": (m, t) => head("proof-collage") + wrap(
`      <div style={{ position: "absolute", inset: 0, background: "#0c0c0c", padding: 40, boxSizing: "border-box" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "#ffb300", fontSize: 52, letterSpacing: "0.2em" }}>${t.rating}</div>
          <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 64, textTransform: "uppercase", marginTop: 8 }}>${t.heading}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridGap: 16 }}>
          ${[0,1,2,3].map((i)=>`<div style={{ position: "relative", height: 440, borderRadius: 14, overflow: "hidden" }}>
            <img src="${m[i]}" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "16px 14px", background: "linear-gradient(0deg, rgba(0,0,0,0.85), rgba(0,0,0,0))", fontFamily: "Geist", color: "#fff", fontSize: 24, fontWeight: 600 }}>${t.quote}</div>
          </div>`).join("\n          ")}
        </div>
      </div>`),

  "giant-stat": (m, t) => head("giant-stat") + wrap(
`      <div style={{ position: "absolute", inset: 0, background: "#0a0a0a" }} />
${cover(m[0], `, opacity: 0.18`)}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 34, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 10 }}>${t.label}</div>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 460, lineHeight: 0.8 }}>${t.stat}</div>
        <div style={{ fontFamily: "Geist", color: "#bdbdbd", fontSize: 40, fontWeight: 600, marginTop: 18 }}>${t.sub}</div>
      </div>`),

  "versus": (m, t) => head("versus") + wrap(
`      <div style={{ position: "absolute", inset: 0, display: "flex" }}>
        <div style={{ position: "relative", width: "50%", height: "100%", background: "#1a1a1a", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "relative", height: 760, overflow: "hidden" }}><img src="${m[0]}" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} /></div>
          <div style={{ padding: "40px 36px" }}>
            <div style={{ fontFamily: "JetBrains Mono", color: "#8a8a8a", fontSize: 28, letterSpacing: "0.08em", marginBottom: 14 }}>${t.leftKicker}</div>
            <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 58, lineHeight: 0.95, textTransform: "uppercase", whiteSpace: "pre-line" }}>${t.leftLine}</div>
          </div>
        </div>
        <div style={{ width: 6, background: "#c4141d" }} />
        <div style={{ position: "relative", width: "50%", height: "100%", background: "#111", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "relative", height: 760, overflow: "hidden" }}><img src="${m[1]}" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} /></div>
          <div style={{ padding: "40px 36px" }}>
            <div style={{ fontFamily: "JetBrains Mono", color: "#ff3b42", fontSize: 28, letterSpacing: "0.08em", marginBottom: 14 }}>${t.rightKicker}</div>
            <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 58, lineHeight: 0.95, textTransform: "uppercase", whiteSpace: "pre-line" }}>${t.rightLine}</div>
          </div>
        </div>
      </div>`),

  "list-steps": (m, t) => head("list-steps") + wrap(
`      <div style={{ position: "absolute", inset: 0, background: "#101015", padding: "120px 72px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 90, textTransform: "uppercase", lineHeight: 0.95, marginBottom: 56 }}>${t.heading}</div>
        ${[0,1,2].map((i)=>`<div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 44 }}>
          <div style={{ fontFamily: "Anton", color: "#c4141d", fontSize: 130, lineHeight: 1, width: 110 }}>${i+1}</div>
          <div style={{ width: 150, height: 150, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}><img src="${m[i]}" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
          <div style={{ fontFamily: "Geist", color: "#fff", fontSize: 42, fontWeight: 600 }}>${t.steps[i]}</div>
        </div>`).join("\n        ")}
      </div>`),

  "offer-guarantee": (m, t) => head("offer-guarantee") + wrap(
`      <div style={{ position: "absolute", inset: 0, background: "#0d0d0d", display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", height: 560, overflow: "hidden" }}>
          <img src="${m[0]}" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,13,13,0) 50%, rgba(13,13,13,1) 100%)" }} />
        </div>
        <div style={{ padding: "0 72px", marginTop: -40 }}>
          <div style={{ fontFamily: "JetBrains Mono", color: "#c4141d", fontSize: 30, letterSpacing: "0.1em" }}>${t.kicker}</div>
          <div style={{ fontFamily: "Anton", color: "#fff", fontSize: 104, lineHeight: 0.92, textTransform: "uppercase", marginTop: 14 }}>${t.offer}</div>
          <div style={{ marginTop: 32, padding: "26px 30px", border: "2px solid #c4141d", borderRadius: 16, fontFamily: "Geist", color: "#fff", fontSize: 38, fontWeight: 700, lineHeight: 1.2 }}>${t.guarantee}</div>
          <div style={{ marginTop: 36, display: "inline-block", background: "#c4141d", color: "#fff", fontFamily: "Anton", fontSize: 46, textTransform: "uppercase", padding: "20px 46px", borderRadius: 10 }}>${t.cta}</div>
        </div>
      </div>`),
};

// ---------------------------------------------------------------------------
// Per-archetype spec: media pools to draw from, mediaStyleAccepts, slotShape, and
// N copy variants (the sub-looks). Copy is on-brand: coach-to-parent, metric-driven,
// no emoji / no exclamation.
// ---------------------------------------------------------------------------
const PER_ARCHETYPE = 3;

const SPECS = {
  "ugc-selfie": {
    pools: [["faces", "action", "generic"]], imgs: 1,
    mediaStyleAccepts: ["production:ugc-selfie", "subject:athlete-face"],
    slotShape: { slots: [{ id: "caption", role: "hook", maxChars: 90, required: true }], roleSet: ["hook"] },
    copy: [
      { caption: '"Six weeks in and I finally hit my jump number. This stuff works."' },
      { caption: '"My coach films every rep. I always know what to fix next."' },
      { caption: '"First time I have ever felt fast on the field. Not luck. Training."' },
    ],
  },
  "coach-authority": {
    pools: [["faces", "action", "generic"]], imgs: 1,
    mediaStyleAccepts: ["production:cinematic", "subject:coach-face"],
    slotShape: { slots: [
      { id: "headline", role: "hook", maxChars: 36, required: true },
      { id: "name", role: "byline", maxChars: 28, required: false },
      { id: "title", role: "byline", maxChars: 28, required: false },
    ], roleSet: ["hook", "byline"] },
    copy: [
      { headline: "Speed is coachable", name: "Coach Graham Wilkerson", title: "DIRECTOR OF PERFORMANCE" },
      { headline: "We test, then we train", name: "Coach Devon Carter", title: "SPEED & STRENGTH LEAD" },
      { headline: "Every athlete gets a plan", name: "Coach Casey Reed", title: "YOUTH DEVELOPMENT" },
    ],
  },
  "action-hero": {
    pools: [["action"]], imgs: 1,
    mediaStyleAccepts: ["production:cinematic", "subject:athlete-action"],
    slotShape: { slots: [
      { id: "eyebrow", role: "eyebrow", maxChars: 28, required: true },
      { id: "headline", role: "hook", maxChars: 40, required: true },
    ], roleSet: ["eyebrow", "hook"] },
    copy: [
      { eyebrow: "CARMEL SPORT PARENTS", headline: "Faster by<br/>the fall" },
      { eyebrow: "WESTFIELD SPORT PARENTS", headline: "Built for<br/>game speed" },
      { eyebrow: "FISHERS SPORT PARENTS", headline: "Stronger<br/>every week" },
    ],
  },
  "training-scene": {
    pools: [["env", "action", "generic"]], imgs: 1,
    mediaStyleAccepts: ["production:cinematic", "subject:athlete-action", "env:gym"],
    slotShape: { slots: [
      { id: "headline", role: "claim", maxChars: 60, required: true },
      { id: "byline", role: "byline", maxChars: 48, required: false },
    ], roleSet: ["claim", "byline"] },
    copy: [
      { headline: "Where Carmel athletes train all winter", byline: "ATHLETES ACCELERATION · CARMEL, IN" },
      { headline: "Small groups. Real coaching. Every rep seen.", byline: "ATHLETES ACCELERATION · WESTFIELD, IN" },
      { headline: "The room your athlete grows up in", byline: "ATHLETES ACCELERATION · FISHERS, IN" },
    ],
  },
  "transformation-split": {
    pools: [["action", "generic"], ["action", "generic"]], imgs: 2,
    mediaStyleAccepts: ["subject:athlete-action"],
    slotShape: { slots: [
      { id: "beforeLabel", role: "kicker", maxChars: 12, required: true },
      { id: "afterLabel", role: "kicker", maxChars: 12, required: true },
      { id: "stat", role: "stat", maxChars: 10, required: false },
    ], roleSet: ["kicker", "stat"] },
    copy: [
      { beforeLabel: "WEEK 1", afterLabel: "WEEK 12", stat: "+1 MPH" },
      { beforeLabel: "DAY 1", afterLabel: "DAY 90", stat: '+3"' },
      { beforeLabel: "SPRING", afterLabel: "FALL", stat: "+2 REPS" },
    ],
  },
  "proof-collage": {
    pools: [["faces", "action", "generic"]], imgs: 4,
    mediaStyleAccepts: ["subject:athlete-face"],
    slotShape: { slots: [
      { id: "heading", role: "claim", maxChars: 24, required: true },
      { id: "rating", role: "proof", maxChars: 8, required: false },
      { id: "quote", role: "testimonial", maxChars: 48, required: false },
    ], roleSet: ["claim", "proof", "testimonial"] },
    copy: [
      { heading: "Parents are talking", rating: "★★★★★", quote: '"Best decision we made this year."' },
      { heading: "Real results", rating: "★★★★★", quote: '"He looks forward to every session."' },
      { heading: "Families trust us", rating: "★★★★★", quote: '"Worth every minute of the drive."' },
    ],
  },
  "giant-stat": {
    pools: [["generic", "action"]], imgs: 1,
    mediaStyleAccepts: [],
    slotShape: { slots: [
      { id: "label", role: "kicker", maxChars: 20, required: false },
      { id: "stat", role: "stat", maxChars: 8, required: true },
      { id: "sub", role: "claim", maxChars: 28, required: false },
    ], roleSet: ["kicker", "stat", "claim"] },
    copy: [
      { label: "VERTICAL JUMP", stat: "92%", sub: "improved in 90 days" },
      { label: "SPRINT SPEED", stat: "+1", sub: "mph in one season" },
      { label: "ATHLETES COACHED", stat: "500", sub: "across Indiana" },
    ],
  },
  "versus": {
    pools: [["generic", "action"], ["generic", "action"]], imgs: 2,
    mediaStyleAccepts: [],
    slotShape: { slots: [
      { id: "leftKicker", role: "kicker", maxChars: 16, required: true },
      { id: "leftLine", role: "claim", maxChars: 24, required: true },
      { id: "rightKicker", role: "kicker", maxChars: 24, required: true },
      { id: "rightLine", role: "claim", maxChars: 24, required: true },
    ], roleSet: ["kicker", "claim"] },
    copy: [
      { leftKicker: "OPEN GYM", leftLine: "Left to<br/>figure it out", rightKicker: "ATHLETES ACCELERATION", rightLine: "Coached<br/>every rep" },
      { leftKicker: "RANDOM DRILLS", leftLine: "Busy, not<br/>better", rightKicker: "ATHLETES ACCELERATION", rightLine: "A real<br/>plan" },
      { leftKicker: "ONE SIZE FITS ALL", leftLine: "Same as<br/>everyone", rightKicker: "ATHLETES ACCELERATION", rightLine: "Built for<br/>your kid" },
    ],
  },
  "list-steps": {
    pools: [["generic", "action"]], imgs: 3,
    mediaStyleAccepts: [],
    slotShape: { slots: [
      { id: "heading", role: "hook", maxChars: 40, required: true },
      { id: "step1", role: "claim", maxChars: 36, required: true },
      { id: "step2", role: "claim", maxChars: 36, required: true },
      { id: "step3", role: "claim", maxChars: 36, required: true },
    ], roleSet: ["hook", "claim"] },
    copy: [
      { heading: "3 steps to a<br/>faster fall season", steps: ["Test the athlete first", "Build the right strength base", "Re-test and prove the gain"] },
      { heading: "How we<br/>build speed", steps: ["Assess movement", "Coach the mechanics", "Load it under fatigue"] },
      { heading: "Your first<br/>90 days", steps: ["Baseline every metric", "Train 3 days a week", "Show the parents the numbers"] },
    ],
  },
  "offer-guarantee": {
    pools: [["action", "generic"]], imgs: 1,
    mediaStyleAccepts: [],
    slotShape: { slots: [
      { id: "kicker", role: "kicker", maxChars: 28, required: false },
      { id: "offer", role: "offer", maxChars: 36, required: true },
      { id: "guarantee", role: "guarantee", maxChars: 64, required: true },
      { id: "cta", role: "cta", maxChars: 20, required: true },
    ], roleSet: ["kicker", "offer", "guarantee", "cta"] },
    copy: [
      { kicker: "SUMMER PERFORMANCE CAMP", offer: "8 weeks. 3 days a week.", guarantee: '+1 mph speed. +3" vertical. 90 days. Or your training is on us.', cta: "Claim your spot" },
      { kicker: "FALL SPEED PROGRAM", offer: "12 sessions. Real plan.", guarantee: '+1 mph speed. +3" vertical. 90 days. Or your training is on us.', cta: "Reserve a spot" },
      { kicker: "NEW ATHLETE INTAKE", offer: "Start with an assessment.", guarantee: '+1 mph speed. +3" vertical. 90 days. Or your training is on us.', cta: "Book the eval" },
    ],
  },
};

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------
function main() {
  // clean slate for generated examples (keep nothing stale)
  rmSync(EXAMPLES_DIR, { recursive: true, force: true });
  mkdirSync(ASSETS_DIR, { recursive: true });

  const manifest = { note: "Track-B authoring manifest — generated by author-examples.mjs. Edit the generator's SPECS, not this file by hand.", examples: [] };
  let seq = 0;

  for (const [archetype, spec] of Object.entries(SPECS)) {
    for (let v = 0; v < PER_ARCHETYPE; v++) {
      const copy = spec.copy[v % spec.copy.length];
      const id = makeExampleId(++seq, `${archetype}-${["a", "b", "c", "d", "e"][v]}`);
      // assign + copy unique media (clean per-example names)
      const refs = [];
      for (let i = 0; i < spec.imgs; i++) {
        const poolNames = spec.pools[i % spec.pools.length];
        const src = take(poolNames);
        const dest = `${id}-${i}.jpg`;
        copyFileSync(src, join(ASSETS_DIR, dest));
        refs.push(`./assets/${dest}`);
      }
      const jsx = TEMPLATES[archetype](refs, copy);
      writeFileSync(join(EXAMPLES_DIR, `${id}.jsx`), jsx);
      manifest.examples.push({
        id, archetype, format: "static",
        mediaStyleAccepts: spec.mediaStyleAccepts,
        slotShape: spec.slotShape,
      });
    }
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  const pools = Object.fromEntries(Object.entries(POOLS).map(([k, v]) => [k, v.length]));
  process.stderr.write(`[author] wrote ${manifest.examples.length} examples across ${Object.keys(SPECS).length} archetypes (${PER_ARCHETYPE} each)\n`);
  process.stderr.write(`[author] media pools available: ${JSON.stringify(pools)}; used ${used.size} unique photos\n`);
}

main();

// ============================================================================
//  _gen-plan.mjs — deterministic ISP Baseball Performance plan generator.
//  Brain (creative decisions) encoded as tables; hands (assembly + distinctness
//  enforcement) in code. Run: node campaigns/isp-baseball-performance/_gen-plan.mjs
//  Emits campaigns/isp-baseball-performance/creative-plan.json (20 assets/angle).
// ============================================================================
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const CACHE_REL = "brand/kraken-cache/isp-baseball-performance";
const lib = JSON.parse(readFileSync(join(HERE, "copy-library.json"), "utf8"));
const has = (id) => !!lib.byId[id];

// ── media inventory, categorized by scene ──────────────────────────────────
const files = readdirSync(join(ROOT, CACHE_REL)).filter((f) => /\.(mp4|jpg|jpeg|png)$/i.test(f));
const vids = files.filter((f) => /\.mp4$/i.test(f));
const stills = files.filter((f) => /\.(jpg|jpeg|png)$/i.test(f));
const scene = (f) => {
  const s = f.toLowerCase();
  if (/pitch|throw|baseball|drop-step|med-ball|rotational/.test(s)) return "baseball";
  if (/lift|deadlift|squat|press|row|pull|push|lunge|barbell|dumbbell|strength|fly|pulldown|core/.test(s)) return "strength";
  return "athletic"; // sprint / plyo / agility / jump / misc
};
const pools = { baseball: [], strength: [], athletic: [] };
for (const v of vids) pools[scene(v)].push(v);
const used = new Set();
function takeVid(priority) {
  for (const p of priority) {
    const list = pools[p];
    for (const f of list) if (!used.has(f)) { used.add(f); return `${CACHE_REL}/${f}`; }
  }
  // fallback: any unused vid
  for (const f of vids) if (!used.has(f)) { used.add(f); return `${CACHE_REL}/${f}`; }
  throw new Error("out of distinct video media");
}
// Statics use a still-FRAME extracted from a clean action CLIP (the runner ffmpeg-
// thumbnails it). The folder's pre-made graphic STILLS are skipped — several are
// finished social posts with competitor logos / baked text, which contaminate a bg.
function takeStill(priority) { return takeVid(priority); }
void stills;

// ── per-angle verbatim copy pools (IDs into copy-library) ───────────────────
const CTA = (ad) => {
  const u = lib.units.filter((x) => x.kind === "bodyLine" && x.id.startsWith(ad) && /Tap the form to book a free first session/.test(x.text))
    .sort((a, b) => a.chars - b.chars)[0];
  if (!u) throw new Error(`no CTA line for ${ad}`); return u.id;
};
const ANGLES = {
  "ad-1": {
    id: "velocity-plateau",
    name: "The Velocity Plateau",
    mechanism: "Velocity is downstream of movement quality; unassessed throwing reinforces the same ceiling. The plateau is a measurement problem, not an effort problem.",
    emotionalJob: "Lift blame off the kid and the parent — the number is stuck because nobody measured the limiter, not because effort failed.",
    voice: "Head-coach-to-parent, declarative, metric-driven.",
    scene: ["baseball", "strength", "athletic"],
    hooks: ["ad-1-short.imageHeadline", "ad-1-short.altHook.1", "ad-1-short.altHook.2", "ad-1-short.altHook.3", "ad-1-short.headline"],
    reframes: ["ad-1-short.imageSubhead", "ad-1-medium.bodyLine.2.5", "ad-1-long.bodyLine.3.5", "ad-1-long.bodyLine.6.2", "ad-1-long.bodyLine.8.3", "ad-1-short.bodyLine.4.1"],
    claims: ["ad-1-short.bodyLine.2.2", "ad-1-medium.bodyLine.2.3", "ad-1-short.bodyLine.4.2", "ad-1-short.bodyLine.4.3", "ad-1-medium.bodyLine.4.1"],
    mech: ["ad-1-short.bodyLine.3.1", "ad-1-short.bodyLine.3.2", "ad-1-medium.bodyLine.4.2"],
    proof: ["ad-1-short.bodyLine.5.2", "ad-1-short.bodyLine.5.1"],
    offer: ["ad-1-short.description"], cta: [CTA("ad-1")],
    statics: { hook: "fresh-isp-hook", hookReframe: "cluster-34", mid: "cluster-39", midRole: "mechanism", midPool: "mech", stat: "cluster-30", offer: "cluster-32" },
  },
  "ad-2": {
    id: "velo-or-healthy-arm",
    name: "Velo Or A Healthy Arm",
    mechanism: "Velocity and arm injury share one root cause — movement efficiency. Cleaning up movement raises the number and lowers the risk at once.",
    emotionalJob: "Dissolve the velo-vs-safety binary a pitching parent carries — you don't have to choose.",
    voice: "Head-coach-to-parent, declarative, metric-driven.",
    scene: ["baseball", "strength", "athletic"],
    hooks: ["ad-2-short.imageHeadline", "ad-2-short.altHook.1", "ad-2-short.altHook.2", "ad-2-short.altHook.3", "ad-2-short.headline"],
    reframes: ["ad-2-short.imageSubhead", "ad-2-short.bodyLine.1.2", "ad-2-short.bodyLine.2.1", "ad-2-short.bodyLine.2.6", "ad-2-medium.bodyLine.2.6", "ad-2-long.bodyLine.4.5"],
    claims: ["ad-2-short.bodyLine.2.2", "ad-2-short.bodyLine.2.5", "ad-2-short.bodyLine.4.3", "ad-2-medium.bodyLine.2.4", "ad-2-short.bodyLine.4.1"],
    mech: ["ad-2-medium.bodyLine.4.1", "ad-2-medium.bodyLine.4.4", "ad-2-long.bodyLine.3.2"],
    proof: ["ad-2-short.bodyLine.5.2", "ad-2-short.bodyLine.5.1"],
    offer: ["ad-2-short.description"], cta: [CTA("ad-2")],
    statics: { hook: "cluster-35", hookReframe: "cluster-43", mid: "cluster-37", midRole: "claim", midPool: "claims", stat: "cluster-38", offer: "cluster-32" },
  },
  "ad-3": {
    id: "proof-flip",
    name: "The Proof Flip",
    mechanism: "Results at that volume come from a repeatable process — whole-athlete development sustained by monthly reassessment — not a talent collection.",
    emotionalJob: "Turn an intimidating draft-pick wall into evidence of a process any kid can access.",
    voice: "Head-coach-to-parent, declarative, metric-driven.",
    scene: ["athletic", "strength", "baseball"],
    hooks: ["ad-3-short.imageHeadline", "ad-3-short.altHook.1", "ad-3-short.altHook.2", "ad-3-short.altHook.3", "ad-3-short.headline"],
    reframes: ["ad-3-short.imageSubhead", "ad-3-short.bodyLine.1.2", "ad-3-short.bodyLine.1.3", "ad-3-medium.bodyLine.2.3", "ad-3-medium.bodyLine.4.3", "ad-3-medium.bodyLine.5.3"],
    claims: ["ad-3-medium.bodyLine.3.3", "ad-3-medium.bodyLine.4.2", "ad-3-short.bodyLine.4.3", "ad-3-long.bodyLine.5.5", "ad-3-medium.bodyLine.6.5"],
    mech: ["ad-3-medium.bodyLine.3.2", "ad-3-long.bodyLine.6.5", "ad-3-long.bodyLine.5.1"],
    proof: ["ad-3-short.bodyLine.5.2", "ad-3-short.bodyLine.5.1", "ad-3-short.bodyLine.5.3"],
    offer: ["ad-3-short.description"], cta: [CTA("ad-3")],
    statics: { hook: "cluster-41", hookReframe: "cluster-42", mid: "cluster-40", midRole: "reframe", midPool: "reframes", stat: "cluster-30", offer: "cluster-32" },
  },
};

// ── the 20-slot program (per angle); copy pulled round-robin from the pools ──
// fmt: video|gif|static ; m=motion media scene-pull, s=still-pull, exempt=mediaExempt template
function buildAngle(adKey) {
  const A = ANGLES[adKey];
  const idx = { hooks: 0, reframes: 0, claims: 0, mech: 0, proof: 0, offer: 0, cta: 0 };
  const next = (pool) => { const arr = A[pool]; const v = arr[idx[pool] % arr.length]; idx[pool]++; return v; };
  const refs = (map) => { const o = {}; for (const [role, pool] of Object.entries(map)) o[role] = next(pool); return o; };
  const BYLINE = { byline: "ISP FORT WORTH" };

  const S = A.statics;
  const program = [
    // id, beat, temp, fmt, tpl, exempt, copyRefs(map of role->pool), extra templateData
    ["A1", "A — Cold hook", "cold", "video", "fresh-isp-motion-hook", false, { hook: "hooks" }, {}],
    ["A2", "A — Cold hook", "cold", "static", S.hook, false, { hook: "hooks" }, {}],
    ["B1", "B — Reframe", "warm", "video", "fresh-smoke-motion", false, { hook: "hooks", reframe: "reframes", cta: "cta" }, {}],
    ["B2", "B — Reframe", "warm", "static", S.hookReframe, false, { hook: "hooks", reframe: "reframes" }, {}],
    ["C1", "C — Mechanism", "warm", "video", "velocity-drop", false, { mechanism: "mech", proof: "proof" }, BYLINE],
    ["C2", "C — Mechanism", "warm", "static", S.mid, false, { [S.midRole]: S.midPool }, {}],
    ["C3", "C — Mechanism", "warm", "video", "fresh-smoke-motion", false, { hook: "hooks", reframe: "reframes", cta: "cta" }, {}],
    ["C4", "C — Mechanism", "warm", "video", "coach-lower-thirds", false, { claim: "claims", proof: "proof" }, BYLINE],
    ["D1", "D — Proof reframe", "warm", "video", "coach-lower-thirds", false, { claim: "claims", proof: "proof" }, BYLINE],
    ["D2", "D — Proof reframe", "warm", "video", "stat-reveal", true, { claim: "claims", stat: "proof", cta: "cta" }, {}],
    ["D3", "D — Proof reframe", "warm", "video", "velocity-drop", false, { mechanism: "mech", proof: "proof" }, BYLINE],
    ["E1", "E — Proof", "warm", "video", "stat-reveal", true, { claim: "claims", stat: "proof", cta: "cta" }, {}],
    ["E2", "E — Proof", "warm", "static", S.stat, false, { stat: "proof", proof: "proof", claim: "claims" }, {}],
    ["E3", "E — Proof", "warm", "video", "coach-lower-thirds", false, { claim: "claims", proof: "proof" }, BYLINE],
    ["E4", "E — Proof", "warm", "gif", "fresh-smoke-motion", false, { hook: "hooks", reframe: "reframes" }, {}],
    ["F1", "F — Offer", "hot", "video", "season-clock", false, { hook: "hooks", offer: "offer", cta: "cta" }, {}],
    ["F2", "F — Offer", "hot", "static", S.offer, false, { offer: "offer", cta: "cta" }, {}],
    ["F3", "F — Offer", "hot", "video", "fresh-multisport-foundations-grind-trap-FA1", false, { hook: "hooks", mechanism: "mech", reframe: "reframes", stat: "proof", proof: "proof", offer: "offer", cta: "cta" }, {}],
    ["F4", "F — Offer", "hot", "gif", "season-clock", false, { hook: "hooks", offer: "offer", cta: "cta" }, {}],
    ["X1", null, "warm", "gif", "logo-sting", true, { claim: "reframes" }, BYLINE],
  ];

  const assets = program.map(([id, beat, temp, fmt, tpl, exempt, roleMap, td]) => {
    const copyRefs = refs(roleMap);
    const asset = {
      id, beat, temperature: temp, format: fmt, source: "template", template: tpl,
      copyRefs,
    };
    if (Object.keys(td).length) asset.templateData = { ...td };
    // Use asset.clip for BOTH static + motion: the runner applies clip/photo (not
    // asset.media) on the existing-edits re-render path, so clip survives re-renders.
    // For statics the runner ffmpeg-thumbnails the clip into a clean still bg.
    asset.clip = fmt === "static" ? takeStill(A.scene) : takeVid(A.scene);
    asset.flags = [];
    asset.status = "planned";
    return asset;
  });

  return {
    id: A.id, name: A.name, location: "fort-worth",
    mechanism: A.mechanism, emotionalJob: A.emotionalJob, voice: A.voice,
    assets,
  };
}

// ── verify every referenced copy id exists ──────────────────────────────────
const missing = [];
const plan = {
  schemaVersion: 1,
  campaign: "isp-baseball-performance",
  brand: "ideal-sports-performance",
  knobs: { assetsPerAngle: 20, motionRatio: { video: 0.6, gif: 0.15, static: 0.25 }, freshnessFloor: 0.45, repetitionCap: 3 },
  _planNotes: "ISP Baseball Performance — 3 angles (velocity plateau / velo-vs-arm-safety / proof flip), 20 assets each. Copy bound verbatim by reference to copy-library.json (Cody's ad copy). Eyebrow auto-anchors FORT WORTH BASEBALL PARENTS from the fort-worth location tier. Media: distinct ISP Kraken clips/stills per asset (baseball-forward for angles 1-2, whole-athlete for angle 3). ISP has no guarantee, so guarantee slots render empty; offer of record is the free first session.",
  angles: Object.keys(ANGLES).map(buildAngle),
};
for (const ang of plan.angles) for (const a of ang.assets) for (const id of Object.values(a.copyRefs)) if (!has(id)) missing.push(`${ang.id}/${a.id}: ${id}`);
if (missing.length) { console.error("MISSING COPY IDS:\n" + missing.join("\n")); process.exit(1); }

// distinctness assertions
for (const ang of plan.angles) {
  const med = ang.assets.map((a) => a.media || a.clip);
  const dup = med.filter((m, i) => med.indexOf(m) !== i);
  if (dup.length) { console.error(`DUP MEDIA in ${ang.id}: ${dup.join(", ")}`); process.exit(1); }
}
const allMedia = plan.angles.flatMap((a) => a.assets.map((x) => x.media || x.clip));
const globalDup = allMedia.filter((m, i) => allMedia.indexOf(m) !== i);

writeFileSync(join(HERE, "creative-plan.json"), JSON.stringify(plan, null, 2) + "\n");
const fmtCount = (f) => plan.angles.flatMap((a) => a.assets).filter((x) => x.format === f).length;
console.log(`wrote creative-plan.json — ${plan.angles.length} angles, ${plan.angles.flatMap((a) => a.assets).length} assets`);
console.log(`formats: video=${fmtCount("video")} gif=${fmtCount("gif")} static=${fmtCount("static")}`);
console.log(`media: ${allMedia.length} assigned, ${new Set(allMedia).size} distinct, cross-angle dup=${globalDup.length}`);

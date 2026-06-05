// ============================================================================
//  _gen-plan.mjs — deterministic ISP Baseball Performance plan generator.
//  Brain (creative decisions) encoded as tables; hands (assembly + distinctness
//  enforcement) in code. Run: node campaigns/isp-baseball-performance/_gen-plan.mjs
//  Emits campaigns/isp-baseball-performance/creative-plan.json (20 assets/angle).
// ============================================================================
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
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

  // ALL ISP-native fresh templates (statics: templates/multi-sport-foundations/fresh-isp-*;
  // motion: brand/video-templates/templates/fresh-isp-motion-*). 9 distinct layouts rotated
  // across 20 assets/angle, each skeleton <= repetitionCap. No AA bank templates.
  const program = [
    // id, beat, temp, fmt, tpl, exempt, copyRefs(map of role->pool), extra templateData
    ["A1", "A — Cold hook", "cold", "video", "fresh-isp-motion-hook", false, { hook: "hooks" }, {}],
    ["A2", "A — Cold hook", "cold", "static", "fresh-isp-hook", false, { hook: "hooks", reframe: "reframes" }, {}],
    ["B1", "B — Reframe", "warm", "video", "fresh-isp-motion-statement", false, { hook: "hooks", reframe: "reframes" }, {}],
    ["B2", "B — Reframe", "warm", "static", "fresh-isp-hook", false, { hook: "hooks", reframe: "reframes" }, {}],
    ["C1", "C — Mechanism", "warm", "video", "fresh-isp-motion-claim", false, { mechanism: "mech", reframe: "reframes" }, {}],
    ["C2", "C — Mechanism", "warm", "static", "fresh-isp-mechanism", false, { mechanism: "mech", reframe: "reframes" }, {}],
    ["C3", "C — Mechanism", "warm", "video", "fresh-isp-motion-claim", false, { mechanism: "mech", reframe: "reframes" }, {}],
    ["C4", "C — Mechanism", "warm", "video", "fresh-isp-motion-claim", false, { mechanism: "mech", reframe: "reframes" }, {}],
    ["D1", "D — Proof reframe", "warm", "video", "fresh-isp-motion-statement", false, { hook: "hooks", reframe: "reframes" }, {}],
    ["D2", "D — Proof reframe", "warm", "video", "fresh-isp-motion-proof", false, { claim: "claims" }, {}],
    ["D3", "D — Proof reframe", "warm", "video", "fresh-isp-motion-hook", false, { hook: "hooks" }, {}],
    ["E1", "E — Proof", "warm", "video", "fresh-isp-motion-proof", false, { claim: "claims" }, {}],
    ["E2", "E — Proof", "warm", "static", "fresh-isp-proof", false, { claim: "claims" }, {}],
    ["E3", "E — Proof", "warm", "video", "fresh-isp-motion-proof", false, { claim: "claims" }, {}],
    ["E4", "E — Proof", "warm", "gif", "fresh-isp-motion-hook", false, { hook: "hooks" }, {}],
    ["F1", "F — Offer", "hot", "video", "fresh-isp-motion-offer", false, { reframe: "reframes" }, {}],
    ["F2", "F — Offer", "hot", "static", "fresh-isp-offer", false, { offer: "offer", reframe: "reframes" }, {}],
    ["F3", "F — Offer", "hot", "video", "fresh-isp-motion-offer", false, { reframe: "reframes" }, {}],
    ["F4", "F — Offer", "hot", "gif", "fresh-isp-motion-offer", false, { reframe: "reframes" }, {}],
    ["X1", null, "warm", "gif", "fresh-isp-motion-statement", false, { hook: "hooks", reframe: "reframes" }, {}],
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

// ── emit ONE campaign per angle (each = its own review page, like the AA bank) ──
const CAMPAIGN_SLUG = { "ad-1": "isp-velocity-plateau", "ad-2": "isp-arm-safety", "ad-3": "isp-proof-flip" };
const SHARED = ["copy-library.json", "copy-library.report.json", "kraken.json", "ad-copy.md", "ad-copy.source.md"];
const CAMPAIGNS_DIR = join(ROOT, "campaigns");
const KNOBS = { assetsPerAngle: 20, motionRatio: { video: 0.6, gif: 0.15, static: 0.25 }, freshnessFloor: 0.45, repetitionCap: 3 };
const missing = [];
const allMedia = [];
const summary = [];

for (const adKey of Object.keys(ANGLES)) {
  const slug = CAMPAIGN_SLUG[adKey];
  const angle = buildAngle(adKey);
  for (const a of angle.assets) {
    for (const id of Object.values(a.copyRefs)) if (!has(id)) missing.push(`${slug}/${a.id}: ${id}`);
    allMedia.push(a.media || a.clip);
  }
  const med = angle.assets.map((a) => a.media || a.clip);
  const dup = med.filter((m, i) => med.indexOf(m) !== i);
  if (dup.length) { console.error(`DUP MEDIA in ${slug}: ${dup.join(", ")}`); process.exit(1); }

  const plan = {
    schemaVersion: 1,
    campaign: slug,
    brand: "ideal-sports-performance",
    knobs: KNOBS,
    _planNotes: `ISP — ${angle.name} (single-angle campaign; one review page per angle, mirroring the AA bank). 20 ISP-native creatives (fresh-isp-* templates). Copy bound verbatim by reference to copy-library.json. Eyebrow auto-anchors FORT WORTH SPORT PARENTS from the fort-worth tier. ISP has no guarantee; offer of record is the free first session.`,
    angles: [angle],
  };
  const dir = join(CAMPAIGNS_DIR, slug);
  mkdirSync(join(dir, "edits"), { recursive: true });
  writeFileSync(join(dir, "creative-plan.json"), JSON.stringify(plan, null, 2) + "\n");
  for (const f of SHARED) { const src = join(HERE, f); if (existsSync(src)) copyFileSync(src, join(dir, f)); }

  const fmt = (x) => angle.assets.filter((a) => a.format === x).length;
  summary.push(`${slug}: 20 assets (video=${fmt("video")} gif=${fmt("gif")} static=${fmt("static")})`);
}

if (missing.length) { console.error("MISSING COPY IDS:\n" + missing.join("\n")); process.exit(1); }
const globalDup = allMedia.filter((m, i) => allMedia.indexOf(m) !== i);
if (globalDup.length) { console.error(`CROSS-CAMPAIGN DUP MEDIA: ${globalDup.join(", ")}`); process.exit(1); }
console.log("wrote per-angle campaigns:\n  " + summary.join("\n  "));
console.log(`media: ${allMedia.length} assigned, ${new Set(allMedia).size} distinct across all 3 campaigns`);

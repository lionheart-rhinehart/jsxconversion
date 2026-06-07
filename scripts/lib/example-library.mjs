// ============================================================================
//  scripts/lib/example-library.mjs — the Track-A ∥ Track-B CONTRACT (single source)
// ============================================================================
//  Why this file exists: the engine (Track A) and the example library (Track B)
//  are built in PARALLEL chats, joined by ONE artifact — `templates/_example-index.json`.
//  If the two sides disagree on the schema, the id convention, the archetype vocabulary,
//  the media-style vocabulary, or where rendered images live, they DRIFT and the
//  seam breaks at integration. So — per the plan's enforcement thesis ("a rule only
//  counts if it lives in CODE that runs, not in instructions the engine reads") —
//  the contract is this module. BOTH tracks `import` it; neither can drift because
//  there is only one definition. The human-readable spec is docs/example-index-contract.md;
//  THIS file is the authority it describes.
//
//  VOCABULARY (locked with Cody 2026-06-06, grounded in the research doc
//  ad-creative-kinds-library.md):
//    • ARCHETYPE = the CATEGORY a creative belongs to (its visual structure:
//      subject × composition × production × motion). The doc calls this a "kind" /
//      "archetype"; we use ARCHETYPE. Closed enum, derived from the doc's axes.
//    • CLUSTER   = the GROUPING that an archetype's examples form in EMBEDDING space
//      (what CLIP/DINOv2 see). A healthy library = one tight cluster per archetype,
//      distinct from the others. The perceptual metrics live in `clusterMetrics`.
//    These are two different things; do not conflate the words.
//
//  What an "example" is: examples GUIDE generation ("here's how to build this
//  ARCHETYPE of thing"); they are never filled in like the old templates. Each
//  example is one rendered creative, labeled by its ARCHETYPE + the media styles it
//  accepts + the copy SHAPE its slots expose. The engine references examples BY ID;
//  Track B produces the rendered images + perceptual metrics.
//
//  Exports:
//    • ARCHETYPES / isArchetype        — the closed visual-archetype enum
//    • MEDIA_STYLE_TAGS / isMediaStyleTag — the closed media-style vocabulary
//    • ARCHETYPE_SPECS                 — per-archetype allowed media tags + formats
//                                        (the map the media-fit gate + Track B share)
//    • EXAMPLES_DIR / INDEX_PATH       — the fixed storage locations
//    • makeExampleId / isExampleId / slugify
//    • exampleImagePath / exampleMotionPath / exampleSourcePaths
//    • emptyIndex / loadExampleIndex
//    • validateExampleEntry / validateExampleIndex  — the executable schema check
//
//  House style: pure, never-throw validators that RETURN { errors, warnings } arrays
//  (mirrors verbatimGuard / scanBrandIntegrity), so callers decide block-vs-warn.
//  NODE-ONLY (fs). Never import from a .jsx/browser file.
// ============================================================================

import { readFileSync, existsSync } from "node:fs";
import { ROLES } from "./roles.mjs";

// ---------------------------------------------------------------------------
// Storage locations (FIXED — both tracks write/read exactly these)
// ---------------------------------------------------------------------------
// All paths in the index are REPO-ROOT-RELATIVE with FORWARD SLASHES (this is a
// Windows shop rendering to a cross-platform contract — never store backslashes).

export const INDEX_PATH = "templates/_example-index.json";
export const EXAMPLES_DIR = "templates/_examples";

// Rendered still the CLIP/DINOv2 + vision-LLM labeling reads. For a VIDEO example
// this is the representative/poster frame (the one labeled & embedded). One per id.
export function exampleImagePath(id) {
  return `${EXAMPLES_DIR}/${id}.png`;
}
// The motion clip itself (video examples only; optional).
export function exampleMotionPath(id) {
  return `${EXAMPLES_DIR}/${id}.mp4`;
}
// The example's source files, co-located so an example is self-contained. Static =
// thin JSX + config (the bank shape); video = a Claude-Design/Remotion JSX. Optional
// (an example can be image-only if its source lives elsewhere), but recommended.
export function exampleSourcePaths(id) {
  return {
    jsx: `${EXAMPLES_DIR}/${id}.jsx`,
    config: `${EXAMPLES_DIR}/${id}.config.json`,
  };
}

// ---------------------------------------------------------------------------
// The closed ARCHETYPE vocabulary (visual categories)
// ---------------------------------------------------------------------------
// Derived from the research doc's structural axes — each archetype occupies a
// UNIQUE (dominant-subject × compositional-template) cell, the doc's rule for
// DINOv2 spatial distinctness ("no two archetypes share the same subject ×
// composition"). Production-mode + temporal are secondary differentiators. This is
// a first-pass HYPOTHESIS: the CLIP/DINOv2 validation + real performance are the
// arbiters and may merge two archetypes that collapse in embedding space (the
// flagged collision zones: ugc-selfie↔coach-authority, transformation-split↔versus,
// giant-stat↔kinetic-statement↔metric-reveal). Extending/merging = edit THIS array
// (one place; both tracks + the validator see it at once). Stable kebab ids — an
// archetype id MUST NOT change once examples reference it (re-label by re-running the
// labeler, which only rewrites the `archetype` FIELD, never an example id).
// 15 DISTINCT DESIGNS — one each (1 design = 1 cluster). Each is a different layout
// FAMILY: a different dominant element + frame division (the squint test). They must
// be MUTUALLY distinct in embedding space (every cross-design cosine < 0.70). This is
// not "archetype families with variations" — it's 15 standalone designs that each look
// like a different kind of thing.
export const ARCHETYPES = [
  "giant-stat",          // one huge NUMBER owns the frame
  "metric-reveal",       // a CHART / gauge / bars dominate (data-viz)
  "kinetic-text",        // bold edge-to-edge TYPE, no photo
  "quote-card",          // a large pull-QUOTE + attribution, text on subtle bg
  "before-after-split",  // HORIZONTAL dual-frame (two stacked photos)
  "versus",              // VERTICAL two-column contrast
  "proof-collage",       // 2x2 GRID of face photos + stars
  "list-steps",          // numbered ROW stack
  "offer-card",          // structured deal box + guarantee + CTA button
  "action-hero",         // full-bleed action photo + a HUGE overlay headline
  "training-scene",      // WIDE environment, people small, tiny corner text
  "ugc-selfie",          // a FACE fills the frame, native caption, almost no design
  "split-panel",         // photo on HALF + solid info PANEL on the other half (was coach-portrait)
  "timeline-schedule",   // a CALENDAR / week grid / program timeline
  "benefit-iconrow",     // a row/grid of ICONS + short labels, lots of negative space
];

export function isArchetype(a) {
  return typeof a === "string" && ARCHETYPES.includes(a);
}

// ---------------------------------------------------------------------------
// The closed MEDIA-STYLE vocabulary (mirrors element role/`accepts`)
// ---------------------------------------------------------------------------
// Namespaced `facet:value` flat tags. A Kraken media file (Track B tags it) and an
// ARCHETYPE both speak this vocabulary; the engine may pull a clip ONLY where the
// media's tags satisfy the archetype's accepts (so it can't fake UGC from cinematic
// footage, or vice-versa). Closed on purpose — extend HERE, both tracks update together.
export const MEDIA_SUBJECT = [
  "subject:athlete-face", "subject:athlete-action",
  "subject:coach-face", "subject:parent-face", "subject:no-human",
];
export const MEDIA_PRODUCTION = [
  "production:ugc-selfie", "production:cinematic",
  "production:studio", "production:lifestyle", "production:mid-fi",
];
export const MEDIA_ENV = [
  "env:gym", "env:field", "env:outdoor", "env:home", "env:studio", "env:none",
];
export const MEDIA_STYLE_TAGS = [...MEDIA_SUBJECT, ...MEDIA_PRODUCTION, ...MEDIA_ENV];

export function isMediaStyleTag(t) {
  return typeof t === "string" && MEDIA_STYLE_TAGS.includes(t);
}

// ---------------------------------------------------------------------------
// ARCHETYPE_SPECS — per-archetype allowed media tags + valid formats (shared map)
// ---------------------------------------------------------------------------
// Both the engine's media-fit gate (Tier-1 #12) and Track B's labeler read this:
//   • formats          — which render formats this archetype can be authored as.
//   • mediaOptional     — true for the text/graphic-dominant archetypes where a real
//                         clip is allowed but not style-constrained (rule #2 "every
//                         creative carries real media" still applies — enforced
//                         elsewhere; this is about STYLE matching only).
//   • mediaStyleAllowed — the SUPERSET an example of this archetype may draw from. An
//                         example's own `mediaStyleAccepts` must be a SUBSET of this
//                         (validateExampleEntry enforces it). [] = unconstrained.
// `summary` is the one-line human gloss.
export const ARCHETYPE_SPECS = {
  "giant-stat": {
    formats: ["static"], mediaOptional: true, mediaStyleAllowed: [],
    summary: "One huge NUMBER owns the frame.",
  },
  "metric-reveal": {
    formats: ["static", "video"], mediaOptional: true, mediaStyleAllowed: [],
    summary: "A chart / gauge / bars dominate; data-viz.",
  },
  "kinetic-text": {
    formats: ["static", "video"], mediaOptional: true, mediaStyleAllowed: [],
    summary: "Bold edge-to-edge type; no photo.",
  },
  "quote-card": {
    formats: ["static"], mediaOptional: true, mediaStyleAllowed: [],
    summary: "Large pull-quote + attribution on a subtle background.",
  },
  "before-after-split": {
    formats: ["static", "video"], mediaOptional: false,
    mediaStyleAllowed: ["subject:athlete-action", "subject:athlete-face"],
    summary: "Horizontal dual-frame, two states.",
  },
  "versus": {
    formats: ["static"], mediaOptional: true, mediaStyleAllowed: [],
    summary: "Vertical two-column head-to-head contrast.",
  },
  "proof-collage": {
    formats: ["static"], mediaOptional: false,
    mediaStyleAllowed: ["subject:athlete-face", "subject:parent-face"],
    summary: "2x2 grid/mosaic of faces + star ratings.",
  },
  "list-steps": {
    formats: ["static", "video"], mediaOptional: true, mediaStyleAllowed: [],
    summary: "Numbered row stack.",
  },
  "offer-card": {
    formats: ["static"], mediaOptional: true, mediaStyleAllowed: [],
    summary: "Structured deal box + guarantee + CTA button.",
  },
  "action-hero": {
    formats: ["static", "video"], mediaOptional: false,
    mediaStyleAllowed: ["production:cinematic", "subject:athlete-action"],
    summary: "Full-bleed action photo + a huge overlay headline.",
  },
  "training-scene": {
    formats: ["static", "video"], mediaOptional: false,
    mediaStyleAllowed: [
      "production:cinematic", "production:lifestyle", "subject:athlete-action",
      "env:gym", "env:field", "env:outdoor",
    ],
    summary: "Wide environment, people small, tiny corner text.",
  },
  "ugc-selfie": {
    formats: ["static", "video"], mediaOptional: false,
    mediaStyleAllowed: ["production:ugc-selfie", "subject:athlete-face", "subject:coach-face"],
    summary: "A face fills the frame, native caption, almost no design.",
  },
  "split-panel": {
    formats: ["static", "video"], mediaOptional: false,
    mediaStyleAllowed: ["production:mid-fi", "production:cinematic", "subject:coach-face"],
    summary: "Photo on half + a solid info panel on the other half (formerly coach-portrait).",
  },
  "timeline-schedule": {
    formats: ["static"], mediaOptional: true, mediaStyleAllowed: [],
    summary: "A calendar / week grid / program timeline.",
  },
  "benefit-iconrow": {
    formats: ["static"], mediaOptional: true, mediaStyleAllowed: [],
    summary: "A row/grid of icons + short labels, lots of negative space.",
  },
};

// ---------------------------------------------------------------------------
// MOTION ARCHETYPES — a SEPARATE vocabulary for fully-produced motion-graphics
// video examples (round-2). Decided with Cody 2026-06-07 ("Option 2").
// ---------------------------------------------------------------------------
// Why a SEPARATE list (not folded into ARCHETYPES): the 15 static ARCHETYPES are
// defined by VISUAL STRUCTURE (dominant-subject × composition). Motion-graphics
// examples are distinguished by their CHOREOGRAPHY + dominant animated element
// (a count-up vs a bracket build vs a waveform vs a stopwatch) — a different
// measuring stick. Keeping them apart means (a) the engine's STATIC paths, which
// import `isArchetype` / `ARCHETYPE_SPECS`, keep seeing ONLY the 15 static tabs and
// can never accidentally treat a motion archetype as a static design, and (b) the
// embed pipeline's existing `--format=video` split is mirrored at the vocabulary
// level. Track B's validator uses the UNION (`isAnyArchetype` / `specFor`); engine
// code stays static-only. Same distinctness contract as the statics: 1 design = 1
// cluster, mutually distinct (every cross-design cosine < 0.70 — the squint test).
// Each entry is a distinct motion-design FAMILY, curated from the brand motion bank
// (brand/video-templates/templates/*) and proven distinct by the cluster analyzer.
// Stable kebab ids — never rename one once an example references it (re-label only
// rewrites the `archetype` FIELD).
// The 16 that PASSED the distinctness gate (every cross-archetype cosine < 0.70,
// measured 2026-06-07 via the CLIP-L/14 + DINOv2 video embed pass). Four further
// candidates were tried and CUT as near-twins (strike-list/versus-slider/poll-bars/
// waveform-quote — see author-video-examples.mjs RETIRED_IDS for the cosines).
export const MOTION_ARCHETYPES = [
  "count-up-stats",        // numbers COUNT UP / stats reveal sequentially
  "radar-stats",           // a RADAR / spider chart draws its polygon
  "stopwatch-countdown",   // a big STOPWATCH / timer sweeps
  "bracket-tree",          // a tournament BRACKET fills round by round
  "comic-strip",           // sequential COMIC panels reveal
  "star-testimonial",      // STAR rating fills + a pulled testimonial
  "macro-ring",            // macro / nutrition RINGS sweep to target
  "scoreboard",            // a sports SCOREBOARD flips/tallies
  "streak-counter",        // a STREAK / flame counter ticks up
  "slot-roll",             // a SLOT-machine reel rolls to a pick
  "tier-list",             // a TIER-LIST stacks ranked rows
  "sprint-trace",          // a SPRINT trace / path draws across the frame
  "calendar-fill",         // a CALENDAR / month grid fills day by day
  "leaderboard-roll",      // a ranked LEADERBOARD rolls into place
  "velocity-gauge",        // a VELOCITY bar / meter gauge fills
  "anatomy-diagram",       // an ANATOMY diagram with callouts builds
];

export function isMotionArchetype(a) {
  return typeof a === "string" && MOTION_ARCHETYPES.includes(a);
}

// Per-motion-archetype spec, same shape as ARCHETYPE_SPECS. All are video-only and
// media-optional (graphic/data-viz dominant; rule #2 "every creative carries real
// media" is enforced elsewhere). mediaStyleAllowed [] = unconstrained.
export const MOTION_ARCHETYPE_SPECS = Object.fromEntries(
  MOTION_ARCHETYPES.map((a) => [a, {
    formats: ["video"], mediaOptional: true, mediaStyleAllowed: [],
    summary: `Motion-graphics: ${a.replace(/-/g, " ")}.`,
  }]),
);

// Union helpers — Track B's validator (NOT the engine) checks both vocabularies.
export function isAnyArchetype(a) {
  return isArchetype(a) || isMotionArchetype(a);
}
// Resolve the spec for either vocabulary. Returns undefined for an unknown name.
export function specFor(a) {
  return ARCHETYPE_SPECS[a] ?? MOTION_ARCHETYPE_SPECS[a];
}

export const FORMATS = ["static", "video"];

// ---------------------------------------------------------------------------
// The example-id convention (FIXED)
// ---------------------------------------------------------------------------
//   ex-<NNN>-<slug>
//     • `ex-` prefix      — namespaces examples APART from the legacy template bank
//                           (`cluster-*`, `fresh-*`), so the two coexist key-safe.
//     • <NNN>             — a zero-padded ≥3-digit sequence: STABLE + unique. The id
//                           never changes, so example refs survive a re-label.
//     • <slug>            — a kebab human hint (a-z 0-9, hyph-separated). A HINT only —
//                           the authoritative archetype is the `archetype` FIELD, not
//                           the slug, so a re-label never forces a rename.
//   e.g. ex-001-coach-to-camera-gym, ex-014-giant-pr-number
export const EXAMPLE_ID_RE = /^ex-\d{3,}-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isExampleId(id) {
  return typeof id === "string" && EXAMPLE_ID_RE.test(id);
}

// "Coach → Camera (gym)" → "coach-camera-gym". Lossy by design (hint only).
export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

// Build a conformant id from a sequence number + a human label. `seq` is padded to
// at least 3 digits. Throws on an empty slug (a caller error, not data — fail loud).
export function makeExampleId(seq, label) {
  const n = Number(seq);
  if (!Number.isInteger(n) || n < 0) throw new Error(`makeExampleId: bad seq ${seq}`);
  const slug = slugify(label);
  if (!slug) throw new Error(`makeExampleId: empty slug from label ${JSON.stringify(label)}`);
  return `ex-${String(n).padStart(3, "0")}-${slug}`;
}

// ---------------------------------------------------------------------------
// slotShape — the copy SHAPE an example's slots expose
// ---------------------------------------------------------------------------
// The engine "designs around the copy": compute the copy's shape (segments/lengths)
// first, then match/generate to an example whose slotShape can hold it. slotShape is:
//   { slots: [ { id, role, maxChars|null, required } ], roleSet: [role,...] }
//     • role     — a closed ROLE (scripts/lib/roles.mjs); how the copy reads, not how
//                  it looks. Mirrors static `elements[].role` / motion `*_SPEC` roles.
//     • maxChars — capacity (static configs carry it; null when unknown, e.g. motion).
//     • required — must a segment land here, or is the slot optional.
//     • roleSet  — DERIVED convenience: the distinct roles across slots (must equal
//                  the slots' roles; the validator checks the two agree).

// ---------------------------------------------------------------------------
// Validation — the executable schema (never throws; returns { errors, warnings })
// ---------------------------------------------------------------------------

const ROLE_SET = new Set(ROLES);

// Validate ONE entry. `errors` = contract violations (Track B must fix before the
// engine trusts the entry); `warnings` = soft (e.g. clusterMetrics not labeled yet —
// expected before Track B's sidecar runs).
export function validateExampleEntry(id, entry) {
  const errors = [];
  const warnings = [];
  const E = (m) => errors.push(`${id}: ${m}`);
  const W = (m) => warnings.push(`${id}: ${m}`);

  if (!isExampleId(id)) E(`id does not match the ex-<NNN>-<slug> convention`);
  if (!entry || typeof entry !== "object") { E(`entry is not an object`); return { errors, warnings }; }

  // archetype — accepts EITHER a static ARCHETYPE or a MOTION_ARCHETYPE (the union;
  // engine code still uses the static-only isArchetype, preserving the isolation).
  if (!isAnyArchetype(entry.archetype)) E(`archetype ${JSON.stringify(entry.archetype)} is not a known ARCHETYPE or MOTION_ARCHETYPE`);

  // format (+ must be a format the archetype allows)
  if (!FORMATS.includes(entry.format)) {
    E(`format ${JSON.stringify(entry.format)} must be one of ${FORMATS.join("/")}`);
  } else if (isAnyArchetype(entry.archetype) && !specFor(entry.archetype).formats.includes(entry.format)) {
    E(`format "${entry.format}" not allowed for archetype "${entry.archetype}" (allowed: ${specFor(entry.archetype).formats.join("/")})`);
  }

  // mediaStyleAccepts — every tag known; subset of the archetype's allowed superset.
  if (!Array.isArray(entry.mediaStyleAccepts)) {
    E(`mediaStyleAccepts must be an array (use [] for media-optional archetypes)`);
  } else {
    for (const t of entry.mediaStyleAccepts) {
      if (!isMediaStyleTag(t)) E(`mediaStyleAccepts: ${JSON.stringify(t)} is not a known media-style tag`);
    }
    if (isAnyArchetype(entry.archetype)) {
      const spec = specFor(entry.archetype);
      // [] allowed = unconstrained (media-optional archetypes): any known tag (or none) ok.
      if (spec.mediaStyleAllowed.length) {
        const allowed = new Set(spec.mediaStyleAllowed);
        for (const t of entry.mediaStyleAccepts) {
          if (isMediaStyleTag(t) && !allowed.has(t)) {
            E(`mediaStyleAccepts: "${t}" not allowed for archetype "${entry.archetype}" (allowed: ${spec.mediaStyleAllowed.join(", ")})`);
          }
        }
      }
      if (!spec.mediaOptional && entry.mediaStyleAccepts.length === 0) {
        W(`archetype "${entry.archetype}" is not media-optional but mediaStyleAccepts is empty`);
      }
    }
  }

  // slotShape
  validateSlotShape(id, entry.slotShape, E);

  // renderedImagePath — MUST be the canonical path for this id (key ↔ path can't drift)
  if (entry.renderedImagePath !== exampleImagePath(id)) {
    E(`renderedImagePath must be "${exampleImagePath(id)}" (got ${JSON.stringify(entry.renderedImagePath)})`);
  }

  // optional motion clip path, if present
  if (entry.motionPath != null && entry.motionPath !== exampleMotionPath(id)) {
    E(`motionPath, when present, must be "${exampleMotionPath(id)}" (got ${JSON.stringify(entry.motionPath)})`);
  }
  if (entry.format === "video" && isAnyArchetype(entry.archetype) && specFor(entry.archetype).formats.includes("video")) {
    // not an error to omit motionPath (the labeled poster .png is the contract);
    // just a nudge so a video example without its clip is noticed.
    if (entry.motionPath == null) W(`video example has no motionPath (poster .png is still the labeled artifact)`);
  }

  // clusterMetrics — Track B's sidecar fills it; before that it may be {} (warn).
  validateClusterMetrics(id, entry.clusterMetrics, E, W);

  return { errors, warnings };
}

function validateSlotShape(id, slotShape, E) {
  if (!slotShape || typeof slotShape !== "object") { E(`${id}: slotShape missing/not an object`); return; }
  if (!Array.isArray(slotShape.slots) || slotShape.slots.length === 0) {
    E(`${id}: slotShape.slots must be a non-empty array`); return;
  }
  const seen = new Set();
  const roles = new Set();
  for (const s of slotShape.slots) {
    if (!s || typeof s !== "object") { E(`${id}: a slot is not an object`); continue; }
    if (typeof s.id !== "string" || !s.id) E(`${id}: a slot is missing a string id`);
    else if (seen.has(s.id)) E(`${id}: duplicate slot id "${s.id}"`);
    else seen.add(s.id);
    if (!ROLE_SET.has(s.role)) E(`${id}: slot "${s.id}" role ${JSON.stringify(s.role)} is not a known ROLE`);
    else roles.add(s.role);
    if (s.maxChars != null && (!Number.isInteger(s.maxChars) || s.maxChars <= 0)) {
      E(`${id}: slot "${s.id}" maxChars must be a positive integer or null`);
    }
    if (s.required != null && typeof s.required !== "boolean") {
      E(`${id}: slot "${s.id}" required must be a boolean`);
    }
  }
  // roleSet, if given, must equal the derived set (no drift between the two views).
  if (slotShape.roleSet != null) {
    if (!Array.isArray(slotShape.roleSet)) E(`${id}: slotShape.roleSet must be an array`);
    else {
      const declared = new Set(slotShape.roleSet);
      for (const r of declared) if (!roles.has(r)) E(`${id}: roleSet has "${r}" with no matching slot`);
      for (const r of roles) if (!declared.has(r)) E(`${id}: roleSet missing "${r}" (a slot uses it)`);
    }
  }
}

function validateClusterMetrics(id, cm, E, W) {
  if (cm == null) { W(`${id}: clusterMetrics absent (Track B labeler not run yet)`); return; }
  if (typeof cm !== "object" || Array.isArray(cm)) { E(`${id}: clusterMetrics must be an object`); return; }
  // All fields optional + nullable (Track B fills incrementally). Validate KNOWN
  // numeric fields softly when present; unknown fields are allowed (forward-compat
  // so the sidecar can extend without a contract bump).
  const isUnit = (v) => typeof v === "number" && v >= 0 && v <= 1;
  for (const k of ["intraArchetypeMaxCosine", "silhouette", "meanCrossArchetypeCosine"]) {
    if (cm[k] != null && typeof cm[k] !== "number") E(`${id}: clusterMetrics.${k} must be a number or null`);
  }
  if (cm.nearestNeighbor != null) {
    const nn = cm.nearestNeighbor;
    if (typeof nn !== "object") E(`${id}: clusterMetrics.nearestNeighbor must be an object or null`);
    else {
      if (nn.exampleId != null && !isExampleId(nn.exampleId)) E(`${id}: nearestNeighbor.exampleId is not a valid example id`);
      if (nn.cosine != null && !isUnit(nn.cosine)) W(`${id}: nearestNeighbor.cosine outside [0,1]`);
    }
  }
  if (cm.subLook != null && typeof cm.subLook !== "string") E(`${id}: clusterMetrics.subLook must be a string or null`);
  if (cm.labeledAt == null && cm.labeledBy == null && cm.subLook == null) {
    W(`${id}: clusterMetrics present but unlabeled (no labeledBy/labeledAt/subLook)`);
  }
}

// Validate the WHOLE index object ({ examples: { id: entry } }, plus generatedAt/note).
// Returns { errors, warnings, count }. Pure.
export function validateExampleIndex(index) {
  const errors = [];
  const warnings = [];
  if (!index || typeof index !== "object") return { errors: ["index is not an object"], warnings, count: 0 };
  const examples = index.examples;
  if (!examples || typeof examples !== "object" || Array.isArray(examples)) {
    return { errors: ["index.examples must be an object map { id: entry }"], warnings, count: 0 };
  }
  const ids = Object.keys(examples);
  for (const id of ids) {
    const r = validateExampleEntry(id, examples[id]);
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }
  return { errors, warnings, count: ids.length };
}

// ---------------------------------------------------------------------------
// IO
// ---------------------------------------------------------------------------

// A valid, EMPTY index — the stub Track A develops against until Track B lands.
export function emptyIndex() {
  return {
    note: "Example-library index — the Track-A∥B contract. Schema: scripts/lib/example-library.mjs (validateExampleIndex). Spec: docs/example-index-contract.md. Track B's labeling sidecar writes the real entries.",
    schema: "example-library/v2",
    generatedAt: null,
    examples: {},
  };
}

// Read + parse the index from disk (repo-root-relative). Returns emptyIndex() when
// the file is absent (the stub-not-yet-written case), so Track A never crashes on a
// missing library. A corrupt file THROWS (a real error worth surfacing).
export function loadExampleIndex(root = ".") {
  const path = `${root}/${INDEX_PATH}`;
  if (!existsSync(path)) return emptyIndex();
  return JSON.parse(readFileSync(path, "utf8"));
}

// ============================================================================
//  scripts/lib/roles.mjs — the closed copy-role vocabulary (single source)
// ============================================================================
//  Every text slot carries a marketing ROLE (what the copy DOES) separate from
//  its TREATMENT (how it looks). Roles are a CLOSED enum so they can't drift and
//  the editor/planner can filter by them. See docs/creative-playbook.md.
// ============================================================================

// The 13 funnel-function roles. Closed — don't fragment (one `hook`, not three).
export const ROLES = [
  "eyebrow", "hook", "claim", "mechanism", "reframe", "proof",
  "stat", "testimonial", "byline", "offer", "guarantee", "cta", "brand",
];

// Roles the AUTO-fill robot must never overwrite (the editor stays 100% open).
export const LOCKED_ROLES = ["guarantee"];

// Brand-canonical, verbatim. Confirmed against brand/aa-design-system. Never paraphrase.
export const GUARANTEE_TEXT =
  '+1 mph speed. +3" vertical. 90 days. Or your training is on us.';

export function isRole(r) {
  return typeof r === "string" && ROLES.includes(r);
}

// "hook:V2.2" → "hook" (the knowledgeRef prefix IS the role). Null if not a role.
export function roleFromKnowledgeRef(ref) {
  if (typeof ref !== "string") return null;
  const p = ref.split(":")[0].trim().toLowerCase();
  return ROLES.includes(p) ? p : null;
}

// A plan asset's `beat` ("A — Stop the scroll") decides what its primary
// `headline` copy DOES, so the legacy headline field routes to the right role.
export const BEAT_HEADLINE_ROLE = {
  A: "hook", B: "hook", C: "mechanism", D: "reframe", E: "claim", F: "offer",
};

export function beatLetter(beat) {
  const m = typeof beat === "string" && beat.trim().match(/^([A-F])/i);
  return m ? m[1].toUpperCase() : null;
}

// Infer a slot's role from a motion-template FIELD NAME (the video bank already
// uses role-ish names: eyebrow, quoteText, ctaText, …). Used to make the motion
// fill role-aware without hand-annotating every *_SPEC. First match wins.
const FIELD_ROLE_PATTERNS = [
  [/guarantee|^free|freeline/i, "guarantee"],
  [/eyebrow|kicker|overline/i, "eyebrow"],
  [/\bhook\b/i, "hook"],
  [/quote|testimonial/i, "testimonial"],
  [/credential|proof/i, "proof"],
  [/stat|metric|\bfacts?\b|number|value|unit/i, "stat"],
  [/mechanism/i, "mechanism"],
  [/reframe|micro|subhead/i, "reframe"],
  [/cta|button/i, "cta"],
  [/byline|coach|author|handle|url|^name$/i, "byline"],
  [/offer/i, "offer"],
  [/brand|wordmark|tagline|logo/i, "brand"],
  [/headline|title|claim|primary/i, "claim"],
];

export function fieldRole(name) {
  if (typeof name !== "string") return null;
  for (const [re, role] of FIELD_ROLE_PATTERNS) if (re.test(name)) return role;
  return null;
}

// Build the standalone eyebrow anchor from the merged tier tags. The eyebrow
// orients the viewer — WHO it's for + WHERE — as a chip at the top of the
// creative. Pattern: "{CITY} SPORT PARENT" with the state suffix stripped
// ("CARMEL, IN" → "CARMEL"). `city` is the per-campaign placeholder, set via the
// location/campaign data tier. Null-guarded: no city → a generic fallback so the
// slot never renders "undefined". Single source for BOTH the static
// (fill-core resolveStaticConfig) and motion (run-campaign buildMotionData) paths
// so they can never drift.
export function buildEyebrowAnchor(tierTags = {}) {
  const cityLabel = String(tierTags.city || "")
    .replace(/,\s*[A-Za-z]{2}\.?$/, "")
    .trim();
  return cityLabel ? `${cityLabel} SPORT PARENT` : "{city name} SPORT PARENT";
}

// ============================================================================
//  scripts/lib/roles.mjs — the closed copy-role vocabulary (single source)
// ============================================================================
//  Every text slot carries a marketing ROLE (what the copy DOES) separate from
//  its TREATMENT (how it looks). Roles are a CLOSED enum so they can't drift and
//  the editor/planner can filter by them. See docs/creative-playbook.md.
// ============================================================================

// The funnel-function roles. Closed — don't fragment (one `hook`, not three).
// `kicker` is the small lead-in line ABOVE the headline (the slot the eyebrow used
// to occupy before the eyebrow became the {CITY} SPORT PARENTS audience anchor); it
// carries the top segment of a hook. See splitHook + docs/creative-playbook.md.
export const ROLES = [
  "eyebrow", "kicker", "hook", "claim", "mechanism", "reframe", "proof",
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
  [/kicker|overline/i, "kicker"],
  [/eyebrow/i, "eyebrow"],
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
  return cityLabel ? `${cityLabel} SPORT PARENTS` : "{city name} SPORT PARENTS";
}

// Lay a single VERBATIM hook across the three hook slots (top→bottom):
//   kicker (small lead-in) · headline (the main thought) · subhead (the rest).
// Splitting only chooses BREAK POINTS — it never alters words. The concatenation
// of the returned segments reproduces the hook's words in order. Deterministic
// (no guessing): break on sentence boundaries, then distribute sentences into 3
// ordered buckets; fall back to clause punctuation, then to headline-only.
// Returns a partial map ({ headline } at minimum); falsy input → {}.
export function splitHook(text) {
  const t = typeof text === "string" ? text.trim() : "";
  if (!t) return {};

  // sentence-ish segments (keep terminal punctuation with the segment)
  let segs = t.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  // single sentence → try clause punctuation so a long line can still spread
  if (segs.length === 1) {
    segs = t.split(/\s*[—–:;]\s+|,\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
  }
  if (segs.length <= 1) return { headline: t };
  if (segs.length === 2) return { headline: segs[0], subhead: segs[1] };

  // 3+ → three ordered buckets, near-equal by segment count.
  const per = Math.ceil(segs.length / 3);
  const join = (a) => a.join(" ");
  return {
    kicker: join(segs.slice(0, per)),
    headline: join(segs.slice(per, per * 2)),
    subhead: join(segs.slice(per * 2)),
  };
}

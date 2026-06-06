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
  // `body` is the longest persuasive slot — the bottom bucket of the copychief
  // ladder (kicker → headline → subhead → body). A verbatim hook/paragraph too
  // long for the upper three slots spills into `body` rather than being trimmed.
  "body",
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
  [/^body|\bbody\b|paragraph|\bpara\b/i, "body"],
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

// The default audience-anchor pattern (AA). `{CITY}` is the placeholder. A brand
// can override this via data/rules.<brand>.json `eyebrowPattern` (consumed by
// validate-plan's city parser); the render path uses this default unless a caller
// passes one. KEEP brand-specific wording OUT of code paths — pass the pattern in.
export const DEFAULT_EYEBROW_PATTERN = "{CITY} SPORT PARENTS";

// "CARMEL, IN" → "CARMEL" (strip a trailing 2-letter state suffix, trim). Shared
// by the anchor builder AND the leak parser so they normalize cities identically.
export function cityLabel(city) {
  return String(city || "").replace(/,\s*[A-Za-z]{2}\.?$/, "").trim();
}

// Build the standalone eyebrow anchor from the merged tier tags. The eyebrow
// orients the viewer — WHO it's for + WHERE — as a chip at the top of the
// creative. `city` is the per-campaign placeholder, set via the location/campaign
// data tier. Null-guarded: no city → a generic fallback so the slot never renders
// "undefined". Single source for BOTH the static (fill-core resolveStaticConfig)
// and motion (run-campaign buildMotionData) paths so they can never drift.
// `pattern` defaults to the AA anchor; brand-agnostic callers pass rules.eyebrowPattern.
export function buildEyebrowAnchor(tierTags = {}, pattern = DEFAULT_EYEBROW_PATTERN) {
  const label = cityLabel(tierTags.city);
  if (!label) return pattern.replace("{CITY}", "{city name}");
  return pattern.replace("{CITY}", label);
}

// Inverse of buildEyebrowAnchor: pull the CITY out of a rendered eyebrow string,
// given the brand's pattern. Returns the normalized-uppercase city or null. Used
// by validate-plan's city-leak check (e.g. a "-milford" clone whose static edits
// config froze "CARMEL SPORT PARENTS" must be caught). Builds a regex from the
// pattern: escape literals, turn {CITY} into a capture group.
export function parseCityFromEyebrow(text, pattern = DEFAULT_EYEBROW_PATTERN) {
  const t = String(text || "").trim();
  if (!t) return null;
  // Build a TOLERANT regex from the pattern: flexible whitespace, and the final
  // word of the suffix may be singular OR plural (real data drifts between
  // "SPORT PARENT" and "SPORT PARENTS"). Escape literals, then relax.
  const [preRaw, postRaw = ""] = pattern.split("{CITY}");
  const escFlex = (s) => s.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const pre = escFlex(preRaw);
  let post = escFlex(postRaw);
  if (/s$/i.test(postRaw.trim())) post = post.replace(/s$/i, "") + "s?"; // tolerate singular/plural
  const rx = new RegExp("^\\s*" + pre + "\\s*(.+?)\\s*" + post + "\\s*$", "i");
  const m = t.match(rx);
  return m ? m[1].trim().toUpperCase() : null;
}

// Lay a single VERBATIM hook across up to FOUR slots (top→bottom):
//   kicker (small lead-in) · headline (the main thought) · subhead · body (overflow).
// Splitting only chooses BREAK POINTS — it never alters words. The concatenation
// of the returned segments reproduces the hook's words in order. Deterministic
// (no guessing): break on sentence boundaries, then distribute sentences into the
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
  const join = (a) => a.join(" ");
  if (segs.length <= 1) return { headline: t };
  if (segs.length === 2) return { headline: segs[0], subhead: segs[1] };
  if (segs.length === 3) return { kicker: segs[0], headline: segs[1], subhead: segs[2] };

  // 4+ → four ordered buckets (kicker · headline · subhead · body), near-equal by
  // segment count. The remainder is weighted to the FRONT buckets so `body` always
  // carries the tail and is never left empty when there are 4+ segments.
  const sizes = [0, 0, 0, 0];
  const base = Math.floor(segs.length / 4);
  const rem = segs.length % 4;
  for (let i = 0; i < 4; i++) sizes[i] = base + (i < rem ? 1 : 0);
  let pos = 0;
  const take = (n) => { const s = segs.slice(pos, pos + n); pos += n; return join(s); };
  return {
    kicker: take(sizes[0]),
    headline: take(sizes[1]),
    subhead: take(sizes[2]),
    body: take(sizes[3]),
  };
}

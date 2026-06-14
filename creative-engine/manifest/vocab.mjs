// ============================================================================
//  creative-engine/manifest/vocab.mjs — controlled vocabulary for deterministic
//  tagging. CLEAN ROOM: zero imports from creative-engine-v1/.
// ----------------------------------------------------------------------------
//  The tagger derives tags ONLY from hard signal (title words, folder name,
//  filename tokens, mime). This file is the dictionary that maps raw words →
//  canonical facet values. Anything not matched here is left UNTAGGED for that
//  facet and the asset is FLAGGED (never silently guessed) — same discipline as
//  Phase 1's "never silently skip".
//
//  Each facet maps a CANONICAL value → the list of raw tokens that imply it.
//  Matching is whole-token, case-insensitive, against the tokenized signal.
// ============================================================================

// sport facet
export const SPORT = {
  soccer: ["soccer", "futbol", "football-soccer"],
  football: ["football", "qb", "quarterback", "gridiron"],
  baseball: ["baseball", "pitch", "pitcher", "batting", "infield"],
  softball: ["softball"],
  basketball: ["basketball", "hoops"],
  volleyball: ["volleyball"],
  track: ["track", "sprint", "sprinter", "sprinting", "dash", "running"],
  multisport: ["multisport", "multi-sport", "athlete", "athletes", "general"],
};

// drill / movement facet
export const DRILL = {
  agility: ["agility", "agile"],
  ladder: ["ladder", "ladders"],
  "quick-feet": ["quickfeet", "quick-feet", "footwork", "feet"],
  cone: ["cone", "cones"],
  sprint: ["sprint", "sprinting", "dash", "shredmill", "treadmill"],
  jump: ["jump", "jumping", "vertical", "box-jump", "plyo", "plyometric"],
  squat: ["squat", "squats"],
  strength: ["strength", "lift", "lifting", "weight", "weights", "deadlift"],
  coaching: ["coach", "coaching", "explain", "clap", "group", "huddle"],
  hero: ["hero", "action", "highlight"],
};

// age-group facet — matched by regex on tokens (u8..u18, plus named bands)
export const AGE_PATTERNS = [
  { canonical: "u8", re: /^u-?8$/ },
  { canonical: "u10", re: /^u-?10$/ },
  { canonical: "u12", re: /^u-?12$/ },
  { canonical: "u14", re: /^u-?14$/ },
  { canonical: "u16", re: /^u-?16$/ },
  { canonical: "u18", re: /^u-?18$/ },
  { canonical: "youth", re: /^(youth|kid|kids|junior)$/ },
  { canonical: "teen", re: /^(teen|teens|hs|highschool|high-school)$/ },
  { canonical: "adult", re: /^(adult|college|collegiate|pro)$/ },
];

// brand facet — AA + known franchisees (extend freely; future-proof)
export const BRAND = {
  aa: ["aa", "athletes", "acceleration", "athletes-acceleration"],
  smaa: ["smaa"],
  jarosh: ["jarosh"],
  batti: ["batti", "batti-performance"],
  isp: ["isp", "ideal", "ideal-sports"],
};

// gender hint (kept loose; optional facet)
export const GENDER = {
  male: ["male", "boy", "boys", "men", "mens"],
  female: ["female", "girl", "girls", "women", "womens"],
  mixed: ["mixed", "coed", "co-ed"],
};

// Facets that use the simple {canonical: [tokens]} shape (AGE handled separately).
export const TOKEN_FACETS = { sport: SPORT, drill: DRILL, brand: BRAND, gender: GENDER };

// mime → motion/static. Video ⇒ motion; image ⇒ static.
export const VIDEO_EXT = new Set(["mp4", "mov", "webm", "m4v", "avi", "mkv"]);
export const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "avif"]);

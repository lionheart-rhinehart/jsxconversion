#!/usr/bin/env node
// ============================================================================
//  scripts/validate-plan.mjs — the creative-engine compliance gate
// ============================================================================
//  Turns docs/creative-playbook.md from prose-the-model-is-trusted-to-follow into
//  a HARD, brand-agnostic gate over a campaign's creative-plan.json. Checks the
//  bytes that ACTUALLY render (the hand-edited static edits config when present,
//  the motion templateData otherwise — see resolveAssetCopy). Wired three ways:
//    1. the runner calls validatePlan() and refuses to render on any block,
//    2. editor-server serves the report to the review page,
//    3. the creative-engine skill runs the CLI before opening the review page.
//
//  Design: FAIL-CLOSED (anything it can't read is a block, never a pass) and
//  TOTAL-COVERAGE (every asset is evaluated; assetsEvaluated must equal the plan
//  count). Rules + severities come from data/rules.<brand>.json (DEFAULT_RULES
//  below covers an absent file), so brand #2 is drop-in.
//
//    node scripts/validate-plan.mjs <campaign>            (report + exit 0/2)
//    node scripts/validate-plan.mjs <campaign> --json     (machine report)
//
//  NODE-ONLY.
// ============================================================================

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  fieldRole, beatLetter, GUARANTEE_TEXT, parseCityFromEyebrow, DEFAULT_EYEBROW_PATTERN,
} from "./lib/roles.mjs";
import { CONTENT_ROLES, classifyVerbatim, isApprovedTrim } from "./lib/copy-resolve.mjs";
import { loadCopyLibraryStrict } from "./lib/copy-library.mjs";
import { loadGrandfatherList, isGrandfathered, overrideHonored, applyCampaignOverride, OVERRIDE_ENV } from "./lib/human-override.mjs";
import { resolveStaticConfig } from "./lib/fill-core.mjs";
import { findTemplate } from "./lib/template-roots.mjs";
import { cloneCity, locationCity } from "./lib/location.mjs";
import { scanBrandIntegrity } from "./lib/brand-integrity.mjs";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");
const DATA_DIR = join(PROJECT_ROOT, "data");
const ROLE_INDEX_PATH = join(PROJECT_ROOT, "templates/_role-index.json");

// ── rules config ─────────────────────────────────────────────────────────────
// Universal defaults — enforced even with no data/rules.<brand>.json present.
// The CANONICAL target format mix (mirrors .claude/skills/creative-engine/config.json
// defaultKnobs.motionRatio). The target is NOT read from the plan's own
// knobs.motionRatio — a planner can (and did: SMAA) water that knob down to match a
// static-heavy output and defeat the check. The canonical target is the bar.
export const CANONICAL_MOTION_RATIO = { video: 0.6, gif: 0.15, static: 0.25 };

export const DEFAULT_RULES = {
  aspect: { width: 1080, height: 1920 },
  mediaExempt: [],
  // Format-mix gate (R3): block | warn | off. Block by default. A relax via
  // campaigns/<c>/validation.config.json is honored ONLY for a grandfathered campaign
  // or with the out-of-band AA_HUMAN_OVERRIDE marker (see human-override.mjs); a new
  // campaign's relax-file is ignored.
  formatMix: "block",
  // Verbatim is HARD by default, brand-agnostically (Phase 1): off | warn |
  // substring(block). Every brand rules file already opts into "substring"; this
  // default makes a brand-less or new-brand campaign get the hard gate too, instead
  // of silently degrading to a warning. A grandfathered campaign relaxes it via its
  // (honored) validation.config.json; a new campaign cannot.
  verbatim: "substring",
  // Scope the verbatim check to PERSUASIVE copy — the lines that must be Cody's
  // verbatim words. Factual proof/stat/credentials/citations come from research,
  // not ad-copy.md, so they're excluded (decision: persuasive incl. claim).
  verbatimRoles: ["hook", "claim", "mechanism", "reframe", "kicker", "testimonial", "body"],
  cityModel: "clone",
  locationRotation: { enabled: false },
  voice: { noEmoji: true, noExclamation: true },
  // Typographic rating glyphs used by the bank's StarRating element — these are UI,
  // NOT emoji, so they're stripped before the no-emoji check. A brand can override
  // the set in rules.<brand>.json. (locked invariant: rating-stars are rules-driven.)
  ratingGlyphs: ["★", "☆", "✦", "✧"],
  // Verbatim guarantee for this brand. null → fall back to GUARANTEE_TEXT (the AA
  // line in roles.mjs); a franchisee sets its OWN line here so the drift check
  // compares against the right guarantee (locked invariant: guarantee is rules-driven).
  guaranteeText: null,
  bannedWords: [],
  eyebrowPattern: DEFAULT_EYEBROW_PATTERN,
  beatRoles: {
    A: { anyOf: ["hook"] },
    B: { anyOf: ["hook", "claim", "reframe"] },
    C: { anyOf: ["mechanism", "reframe", "stat"] },
    D: { anyOf: ["reframe", "testimonial", "claim"] },
    E: { anyOf: ["proof", "stat", "testimonial"] },
    F: { anyOf: ["offer", "cta"] },
  },
};

export function loadRules(brand, dataDir = DATA_DIR) {
  const file = brand ? join(dataDir, `rules.${brand}.json`) : null;
  if (!file || !existsSync(file)) return { ...DEFAULT_RULES, _source: "DEFAULT_RULES" };
  let raw;
  try { raw = JSON.parse(readFileSync(file, "utf8")); }
  catch (e) { throw new Error(`rules file corrupt at ${file}: ${e.message}`); }
  return {
    ...DEFAULT_RULES, ...raw,
    voice: { ...DEFAULT_RULES.voice, ...(raw.voice || {}) },
    beatRoles: { ...DEFAULT_RULES.beatRoles, ...(raw.beatRoles || {}) },
    _source: file,
  };
}

// ── small utils ────────────────────────────────────────────────────────────
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const norm = (s) => String(s).replace(/\s+/g, " ").trim().toLowerCase();
const EMOJI_RE = /\p{Extended_Pictographic}/u;
// Motion templateData keys that are NOT message copy (identity/structural/media/numeric).
const NON_CONTENT_KEY = /^(eyebrow|brand|cta|guarantee|duration|audio)$/i;
const MEDIA_KEY = /(clip|photo|media|bg|src|poster|url|logo|color|font|frames)/i;

function loadRoleIndex() {
  try {
    const j = JSON.parse(readFileSync(ROLE_INDEX_PATH, "utf8"));
    return j.templates || j || {};
  } catch { return {}; }
}

// ── resolveAssetCopy — the ONE normalized view of what renders ───────────────
// Returns { format, fields:[{key,role,text}], mediaPresent, cityResolved,
//           aspect:{width,height}|null, source:"edits"|"fill"|"motion"|"none" }.
// Static: prefer the hand-edited edits config (what actually renders post-edit),
// else the resolved fill. Motion: the inline templateData + tier-derived city.
export function resolveAssetCopy(asset, angle, ctx) {
  const { campaign, brand, dataDir } = ctx;
  const fmt = asset.format === "video" || asset.format === "gif" ? "motion" : "static";

  if (fmt === "static") {
    const editsPath = join(CAMPAIGNS_DIR, campaign, "edits", `${angle.id}__${asset.id}.config.json`);
    let cfg = null, source = "none";
    if (existsSync(editsPath)) {
      cfg = JSON.parse(readFileSync(editsPath, "utf8")); source = "edits";
    } else if (asset.template) {
      const location = asset.location || angle.location || ctx.planLocation || null;
      // Resolve the template's root via the multi-root resolver (was hard-coded to
      // templates/multi-sport-foundations). Null → cfg stays null → existing
      // fail-closed "none" path. Gate logic below is UNCHANGED.
      const _tdir = findTemplate(asset.template, campaign)?.dir; // 4b: brand bank first
      cfg = _tdir ? resolveStaticConfig({ clusterId: asset.template, asset, brand, location, campaign, templateDir: _tdir, dataDir }) : null;
      source = cfg ? "fill" : "none";
    }
    if (!cfg) return { format: fmt, fields: [], mediaPresent: false, cityResolved: null, aspect: null, source, approvedTrims: {} };
    const fields = (cfg.elements || [])
      .filter((el) => typeof el.text === "string")
      .map((el) => ({ key: el.id, role: el.role || null, text: el.text, tag: el.tag }));
    const mediaPresent = !!(cfg.media && cfg.media.path) || !!(cfg.foregroundMedia && cfg.foregroundMedia.path)
      || !!(asset.media || asset.clip || asset.photo);
    // City: the eyebrow element text (parsed against the brand pattern), else a
    // tag:"city" element. Either revealing a city ≠ the clone's is a leak.
    let cityResolved = null;
    const eye = fields.find((f) => f.role === "eyebrow") || fields.find((f) => f.tag === "eyebrow");
    if (eye) cityResolved = parseCityFromEyebrow(eye.text, ctx.eyebrowPattern);
    if (!cityResolved) {
      const cityEl = fields.find((f) => f.tag === "city");
      if (cityEl && isStr(cityEl.text)) cityResolved = cityEl.text.trim().toUpperCase();
    }
    const aspect = (typeof cfg.width === "number" && typeof cfg.height === "number")
      ? { width: cfg.width, height: cfg.height } : null;
    const approvedTrims = (cfg._approvedTrims && typeof cfg._approvedTrims === "object") ? cfg._approvedTrims : {};
    return { format: fmt, fields, mediaPresent, cityResolved, aspect, source, approvedTrims };
  }

  // motion
  const td = (asset.templateData && typeof asset.templateData === "object") ? asset.templateData : {};
  const fields = [];
  for (const [k, v] of Object.entries(td)) {
    if (!isStr(v)) continue;
    if (k.startsWith("_")) continue;
    fields.push({ key: k, role: fieldRole(k), text: v });
  }
  let mediaPresent = !!(asset.clip || asset.photo || asset.media);
  if (!mediaPresent) {
    for (const [k, v] of Object.entries(td)) {
      if (MEDIA_KEY.test(k) && isStr(v)) { mediaPresent = true; break; }
    }
  }
  // Motion eyebrow is force-set from the location tier at render, so the city the
  // creative WILL show is the asset's resolved location city.
  const slug = asset.location || angle.location || ctx.planLocation || null;
  const cityResolved = slug ? locationCity(slug, dataDir).city : null;
  const approvedTrims = (td._approvedTrims && typeof td._approvedTrims === "object") ? td._approvedTrims : {};
  return { format: fmt, fields, mediaPresent, cityResolved, aspect: null, source: "motion", approvedTrims };
}

// Is a resolved field "message copy" (subject to verbatim/voice)? Statics use the
// role; motion uses the key denylist (line1/line2 are content; bgClip/duration not).
function isContentField(f, format) {
  if (format === "static") return f.role && CONTENT_ROLES.has(f.role);
  if (!isStr(f.key)) return false;
  if (NON_CONTENT_KEY.test(f.key) || MEDIA_KEY.test(f.key)) return false;
  return true;
}

// ── R3: format-mix gate ────────────────────────────────────────────────────────
// The failure to catch is MOTION COLLAPSE: a plan that ships mostly static when the
// target is video-heavy (SMAA: 22% video vs 60% target; the planner even watered its
// own knob down to hide it). So the hard signal is the VIDEO share falling below the
// canonical target — NOT a gif↔static trade (a healthy 55%-video, no-gif plan must
// still pass). Slack = max(1 asset, 15 percentage points) so small batches and a few
// points of drift don't trip; a gross miss does. Pure + exported for unit tests.
// Returns { ok, total, target, actual, videoShare, deviations, skipped? }.
export function checkFormatMix(plan, { target = CANONICAL_MOTION_RATIO, minAssets = 4 } = {}) {
  const assets = (plan.angles || []).flatMap((a) => a.assets || []);
  const total = assets.length;
  const actual = { video: 0, gif: 0, static: 0 };
  for (const a of assets) {
    const f = a.format === "video" || a.format === "gif" ? a.format : "static";
    actual[f]++;
  }
  // Too few assets → rounding dominates; skip (not enough signal to fail on).
  if (total < minAssets) return { ok: true, total, target, actual, videoShare: null, deviations: [], skipped: true };
  const slackShare = Math.max(1 / total, 0.15);
  const targetVideo = typeof target.video === "number" ? target.video : 0;
  const videoShare = actual.video / total;
  const deviations = [];
  // Only UNDER-target video is a failure (more motion than target is never a problem).
  if (videoShare < targetVideo - slackShare) {
    deviations.push({
      bucket: "video",
      actual: actual.video,
      expected: Math.round(targetVideo * total),
      target: targetVideo,
      actualShare: +videoShare.toFixed(2),
    });
  }
  return { ok: deviations.length === 0, total, target, actual, videoShare: +videoShare.toFixed(2), deviations, slackShare };
}

// ── the validator ────────────────────────────────────────────────────────────
export function validatePlan(plan, opts = {}) {
  const campaign = opts.campaign || plan.campaign;
  const dataDir = opts.dataDir || DATA_DIR;
  const brand = plan.brand || null;
  let rules = opts.rules || loadRules(brand, dataDir);
  // Per-campaign override — now UN-DOWNGRADABLE by the engine (Phase 0). A
  // campaigns/<c>/validation.config.json that relaxes a gate (e.g. {"verbatim":
  // "warn"} or the Batti {"formatMix":"warn"}) is HONORED only when the campaign is
  // grandfathered OR Cody set the out-of-band marker AA_HUMAN_OVERRIDE=<campaign> in
  // his own shell. Otherwise the file is IGNORED ENTIRELY and the hard rules stand —
  // so the engine can't quietly drop a relax-file mid-run to defeat its own gate.
  // (The honor decision + whole-file ignore live in human-override.mjs, unit-tested.)
  const env = opts.env || process.env;
  const grandfatherSet = opts.grandfatherSet || loadGrandfatherList(dataDir);
  let overrideIgnored = null;          // {keys} → surfaced as a campaign warn below
  if (!opts.rules) {
    const ovPath = join(CAMPAIGNS_DIR, campaign, "validation.config.json");
    if (existsSync(ovPath)) {
      let override = null;
      try { override = JSON.parse(readFileSync(ovPath, "utf8")); }
      catch { override = null; /* malformed → ignore, keep hard rules (fail toward stricter) */ }
      if (override) {
        const honored = overrideHonored({ campaign, grandfatherSet, env });
        const applied = applyCampaignOverride({ baseRules: rules, override, honored });
        rules = applied.rules;
        if (!honored && applied.ignoredKeys.length) overrideIgnored = { keys: applied.ignoredKeys };
      }
    }
  }
  const eyebrowPattern = rules.eyebrowPattern || DEFAULT_EYEBROW_PATTERN;
  const roleIndex = loadRoleIndex();

  // Copy library (strict — corrupt throws, caught below → campaign block).
  let library = null, libConcat = null, libError = null;
  try { library = loadCopyLibraryStrict(join(CAMPAIGNS_DIR, campaign)); }
  catch (e) { libError = e.message; }
  if (library && Array.isArray(library.units)) {
    libConcat = library.units.map((u) => norm(u.text)).filter(Boolean);
  }

  const clone = cloneCity(plan, dataDir);
  const verbatimMode = rules.verbatim || "warn";          // off | warn | substring
  const verbatimRoles = rules.verbatimRoles ? new Set(rules.verbatimRoles) : null;

  const assets = {};
  const campaignViolations = [];
  let blocking = 0, warnings = 0, assetsEvaluated = 0, planCount = 0;

  const bump = (v) => { if (v.severity === "block") blocking++; else warnings++; };

  // Fail-closed: a corrupt copy library blocks the whole campaign.
  if (libError) {
    const v = { rule: "copyLibrary", severity: "block", message: libError, fixHint: "re-run: node scripts/intake-copy.mjs " + campaign };
    campaignViolations.push(v); bump(v);
  }

  // Phase 0 — an attempted-but-ignored relax-file is surfaced (warn, auditable on
  // the review page) so a refused downgrade is visible, not silent. It does not
  // block on its own: the hard gate it tried to relax does the blocking.
  if (overrideIgnored) {
    const v = { rule: "overrideIgnored", severity: "warn",
      message: `validation.config.json present but IGNORED (campaign not grandfathered and no ${OVERRIDE_ENV} marker): keys [${overrideIgnored.keys.join(", ")}] had no effect — the hard gate stands`,
      fixHint: `fix the underlying violation; or, to deliberately relax, set ${OVERRIDE_ENV}=${campaign} in your own terminal` };
    campaignViolations.push(v); bump(v);
  }

  // Phase 1 / precondition-1 — a GENERATE-WORLD campaign (any source:"fresh" asset)
  // MUST carry a verbatim copy-library; copy enforcement is never optional there. An
  // ABSENT library returns null (not libError), which would otherwise SKIP the
  // verbatim gate (L362 `&& libConcat`) — exactly the hole that lets reworded copy
  // ship. Block it. Scoped to generate-world + not-grandfathered so legacy
  // no-ad-copy template campaigns (which render authored copy by design) aren't
  // retroactively broken.
  const isGenerateWorld = (plan.angles || []).some((a) => (a.assets || []).some((as) => as && as.source === "fresh"));
  if (isGenerateWorld && !library && !libError && !isGrandfathered(campaign, grandfatherSet)) {
    const v = { rule: "copyLibrary", severity: "block",
      message: `generate-world campaign (has source:"fresh" assets) has no copy-library.json — verbatim copy enforcement would be OFF`,
      fixHint: `author ad-copy.md then run: node scripts/intake-copy.mjs ${campaign}` };
    campaignViolations.push(v); bump(v);
  }

  // Phase 2 — brand purity. A franchisee creative must carry ZERO Athletes
  // Acceleration leak (AA red #c4141d, the "ATHLETES ACCELERATION" wordmark baked
  // into a field, a known AA source asset; AA people/proof are confirm-or-swap
  // warnings). scanBrandIntegrity is pure + already unit-tested; previously it ran
  // only at export — wiring it here catches the leak at the RENDER gate, before the
  // batch churns. AA campaigns short-circuit to clean (0-diff). We scan the bytes
  // that actually render: the IN-MEMORY plan (templateData + media paths) + every
  // frozen edits config. Grandfather-aware: a pre-existing campaign's leak DOWNGRADES
  // to a warning (don't retroactively break already-shipped franchisee work, per the
  // Phase 0 grandfather); a NEW campaign's leak is a hard BLOCK.
  // (Known scope, generalize later: AA→franchisee + one-directional; and when the
  // generator writes fresh .jsx, that code-scan must carry the validate-templates
  // brand-red exception for the legit `window.__BRAND__.brand_red || '#c4141d'` idiom.)
  {
    const integrityTexts = [{ source: "creative-plan.json", text: JSON.stringify(plan) }];
    const editsDir = join(CAMPAIGNS_DIR, campaign, "edits");
    if (existsSync(editsDir)) {
      try {
        for (const f of readdirSync(editsDir)) {
          if (f.endsWith(".config.json")) integrityTexts.push({ source: `edits/${f}`, text: readFileSync(join(editsDir, f), "utf8") });
        }
      } catch { /* unreadable edits dir → scan what we have (the plan) */ }
    }
    const integrity = scanBrandIntegrity({ brand, texts: integrityTexts });
    const grandfathered = isGrandfathered(campaign, grandfatherSet);
    for (const f of integrity.findings) {
      // AA people/proof stay warn always; AA color/wordmark/asset block on new work,
      // downgrade to warn on grandfathered work.
      const severity = f.severity === "block" ? (grandfathered ? "warn" : "block") : "warn";
      const v = { rule: "brandPurity", severity,
        message: `${f.kind}: "${f.detail}" leaked onto brand "${brand}" (in ${f.source})${f.severity === "block" && grandfathered ? " — grandfathered to warn" : ""}`,
        fixHint: f.kind === "aa-people-proof"
          ? "confirm this AA person/credential belongs on this brand, or swap it for the franchisee's own"
          : "remove the AA color/wordmark/asset — recolor from the brand kit, re-fill, or swap the media" };
      campaignViolations.push(v); bump(v);
    }
  }
  if (clone.ambiguous) {
    const v = { rule: "cityModel", severity: "warn",
      message: `campaign carries ${clone.count} locations but cityModel is "clone" — city-leak check skipped. Enable locationRotation or split into per-city clones.` };
    campaignViolations.push(v); bump(v);
  }

  // mediaExempt: token/substring match on the template name (S6).
  const isMediaExempt = (tpl) => isStr(tpl) && (rules.mediaExempt || []).some((tok) => isStr(tok) && tpl.toLowerCase().includes(tok.toLowerCase()));

  // coherence accumulators
  const beatLetters = new Set();
  const copySeen = new Map();   // angleId → Map(normText → [assetId])

  for (const angle of plan.angles || []) {
    for (const asset of angle.assets || []) {
      planCount++;
      const key = `${angle.id}/${asset.id}`;
      const vios = [];
      const add = (rule, severity, message, extra = {}) => { const v = { rule, severity, message, ...extra }; vios.push(v); bump(v); };

      let R;
      try {
        R = resolveAssetCopy(asset, angle, { campaign, brand, dataDir, eyebrowPattern, planLocation: plan.location });
      } catch (e) {
        // Fail-closed per asset — never skip silently.
        add("validatorError", "block", `could not resolve asset (${e.message})`, { fixHint: "check the asset's template/edits config" });
        assets[key] = { angle: angle.id, asset: asset.id, beat: asset.beat ?? null, template: asset.template || null, ok: false, blocking: 1, warnings: 0, violations: vios };
        assetsEvaluated++;
        continue;
      }

      // Generation engine — a fresh creative MUST be bound to an example (proof the
      // engine actually selected from the library, not skipped it). Scoped to fresh +
      // non-grandfathered so grandfathered fresh campaigns that predate the example
      // library (e.g. velocity-code-youth) aren't retroactively blocked. Mirrors the
      // copyLibrary scope above.
      if (asset.source === "fresh" && !isStr(asset.exampleId) && !isGrandfathered(campaign, grandfatherSet)) {
        add("exampleBinding", "block",
          `fresh creative not bound to an example (no exampleId) — example-selection was skipped`,
          { fixHint: "run the engine's select step (scripts/lib/example-select.mjs) so the asset carries exampleId + archetype" });
      }

      const letter = beatLetter(asset.beat);
      if (letter) beatLetters.add(letter);
      const idx = isStr(asset.template) ? roleIndex[asset.template] : null;
      const templateRoles = idx ? new Set([...(idx.roles || []), ...(idx.accepts || [])]) : null;

      // ── Rule 1: media on every creative ──
      if (!R.mediaPresent && !isMediaExempt(asset.template)) {
        add("media", "block", `no image/video — every creative must carry real media (template "${asset.template}")`,
          { fixHint: "place a clip/photo in the editor, or add this template to rules.mediaExempt if it is a bare brand card" });
      }

      // ── Rule 5: aspect (static only; motion is wrapper-forced 1080×1920) ──
      if (R.format === "static" && R.aspect && rules.aspect) {
        if (R.aspect.width !== rules.aspect.width || R.aspect.height !== rules.aspect.height) {
          add("aspect", "block", `is ${R.aspect.width}×${R.aspect.height}, expected ${rules.aspect.width}×${rules.aspect.height}`);
        }
      }

      // ── Rule 4: beat → role. Playbook model: "a static carries ONE dominant
      // beat (1-3 roles), 1 dominant + ~2 supporting" — so we require AT LEAST ONE
      // beat-appropriate role (anyOf the beat's valid set), which catches gross
      // mismatches (a beat-E card with none of proof/stat/testimonial) without
      // forcing every role onto one card. ──
      if (letter && rules.beatRoles[letter]) {
        const spec = rules.beatRoles[letter];
        const validRoles = [...new Set([...(spec.required || []), ...(spec.anyOf || [])])];
        const label = validRoles.join(" | ");
        const boundRoles = new Set(R.fields.filter((f) => isStr(f.text) && f.role).map((f) => f.role));
        // Beat-role FIT is semantic aptness (the playbook allows roles to play out
        // of position or be carried by media), and role detection is imperfect
        // (null-role fields). So these are WARNINGS surfaced for human review on the
        // card, not hard blocks — consistent with "structural = blocked, aptness =
        // human residual." A genuinely wrong template still shows loudly.
        if (templateRoles) {
          if (!validRoles.some((r) => templateRoles.has(r))) {
            add("templateSlot", "warn", `beat ${letter} usually needs one of [${label}]; template "${asset.template}" exposes none`,
              { fixHint: "consider a template whose roles/accepts include a beat-appropriate role (templates/_role-index.json)" });
          }
        } else {
          add("templateSlot", "warn", `template "${asset.template}" not in _role-index.json — cannot verify beat ${letter} roles [${label}]`,
            { fixHint: "run: node scripts/build-template-index.mjs" });
        }
        if (!validRoles.some((r) => boundRoles.has(r))) {
          add("beatRoles", "warn", `beat ${letter} carries none of [${label}]${R.format === "motion" ? " (motion fields are role-less; cannot verify)" : " — check copy is applied to a beat-appropriate role"}`, {});
        }
      }

      // ── per-field: verbatim, voice, guarantee, city ──
      for (const f of R.fields) {
        const t = f.text;
        if (!isStr(t)) continue;

        // voice (applies to ALL text — emoji/!/banned never belong anywhere). Strip
        // configured rating glyphs (★ etc.) first: they're typographic UI, not emoji.
        if (rules.voice && rules.voice.noEmoji) {
          const allowed = rules.ratingGlyphs || [];
          const tForEmoji = allowed.length ? [...t].filter((ch) => !allowed.includes(ch)).join("") : t;
          if (EMOJI_RE.test(tForEmoji)) {
            add("voiceEmoji", "block", `emoji in "${f.key}": ${t.slice(0, 40)}`, { fixHint: "brand prohibits emoji" });
          }
        }
        if (rules.voice && rules.voice.noExclamation && t.includes("!")) {
          add("voiceExclamation", "block", `exclamation point in "${f.key}": ${t.slice(0, 40)}`, { fixHint: "brand voice is declarative — no exclamation points" });
        }
        for (const w of rules.bannedWords || []) {
          if (!isStr(w)) continue;
          if (new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(t)) {
            add("bannedWord", "block", `banned word "${w}" in "${f.key}": ${t.slice(0, 40)}`, { fixHint: "remove or replace per brand integrity laws" });
          }
        }

        // verbatim trace-to-library (Phase 1: exact / trim / rewrite, no longer a
        // silent pass for trims). EXACT → clean. TRIM (verbatim subset, long enough
        // to be deliberate) → copychief / needs-approval (warn, surfaced for Cody;
        // suppressed for an already-approved exact text via _approvedTrims). ABSENT
        // (reworded/invented) → hard block in substring mode, warn otherwise.
        if (verbatimMode !== "off" && libConcat && isContentField(f, R.format)) {
          if (!verbatimRoles || (f.role && verbatimRoles.has(f.role))) {
            const fn = norm(t);
            const cls = classifyVerbatim(fn, libConcat);
            if (cls === "absent") {
              const sev = verbatimMode === "substring" ? "block" : "warn";
              add("verbatim", sev, `copy in "${f.key}" doesn't trace to copy-library (reworded/invented): "${t.slice(0, 50)}"`,
                { fixHint: "bind a copy-library unit (copyRefs/hookRef) or lift the verbatim text — don't reword/compose" });
            } else if (cls === "trim" && !isApprovedTrim(R.approvedTrims, f.key, fn)) {
              // Carry `field` (slot id) + `text` (the exact trimmed string) so the
              // review page's "Approve trim" button can POST them to /approve-trim,
              // which stamps _approvedTrims[field]=text — the same record this gate
              // consults via isApprovedTrim, so an approved trim stops re-flagging.
              add("copychiefTrim", "warn", `copy in "${f.key}" is a verbatim TRIM of approved copy — needs Cody's approval: "${t.slice(0, 50)}"`,
                { needsApproval: true, field: f.key, text: t, fixHint: "approve the trim on the review page, or restore the full verbatim line (never reword)" });
            }
          }
        }

        // coherence: copy reuse within an angle (warn) — persuasive roles only.
        // Stats/proof/citations/credentials legitimately repeat across a stat card
        // and its alt, so don't flag those as reuse (noise).
        const MESSAGE_ROLES = new Set(["kicker", "hook", "claim", "mechanism", "reframe", "testimonial", "offer"]);
        const reuseEligible = R.format === "static" ? MESSAGE_ROLES.has(f.role) : isContentField(f, R.format);
        if (reuseEligible) {
          const m = copySeen.get(angle.id) || new Map();
          const fn = norm(t);
          if (fn.length > 3) {
            const prev = m.get(fn) || [];
            prev.push(asset.id);
            m.set(fn, prev);
            copySeen.set(angle.id, m);
          }
        }
      }

      // ── guarantee-verbatim (asset-level; never exempted — load-bearing). Some
      // templates split the guarantee across fields, so concatenate guarantee-role
      // fields IN ORDER before comparing. Only flag when the joined text actually
      // LOOKS like the guarantee (carries its distinctive "mph"+"vertical" tokens)
      // — so a non-guarantee fragment that happens to sit in a guarantee-roled slot
      // (e.g. a "90"/"DAYS" countdown in freeLine1/2) can't false-trigger. ──
      const gFields = R.fields.filter((f) => f.role === "guarantee" || /guarantee/i.test(f.key));
      if (gFields.length) {
        const joined = gFields.map((f) => f.text).join(" ");
        const looksLikeGuarantee = /\bmph\b/i.test(joined) && /vertical/i.test(joined);
        const guaranteeText = rules.guaranteeText || GUARANTEE_TEXT;
        if (looksLikeGuarantee && norm(joined) !== norm(guaranteeText)) {
          add("guaranteeDrift", "block", `guarantee is paraphrased (fields: ${gFields.map((f) => f.key).join("+")})`,
            { fixHint: `must read exactly: ${guaranteeText}` });
        }
      }

      // ── Rule 3: city (non-null-beat must resolve a city; no wrong-city leak) ──
      if (letter) {
        if (!R.cityResolved) {
          add("eyebrow", "block", `no city resolved for the eyebrow anchor`,
            { fixHint: "set angle.location to a slug with a data/location.<slug>.json tier" });
        } else if (rules.cityModel === "clone" && clone.city && !clone.ambiguous && R.cityResolved !== clone.city) {
          add("cityLeak", "block", `shows "${R.cityResolved}" but this clone is "${clone.city}" — wrong-city leak`,
            { fixHint: "this creative (or its frozen edits config) carries another location's city; re-fill or fix the eyebrow" });
        }
      }
      // tier existence for the resolved location
      const slug = asset.location || angle.location || plan.location || null;
      if (slug && !locationCity(slug, dataDir).tierFound) {
        add("locationTierMissing", "block", `location "${slug}" has no data/location.${slug}.json tier`,
          { fixHint: `create data/location.${slug}.json with a tags.city` });
      }

      const aBlock = vios.filter((v) => v.severity === "block").length;
      const aWarn = vios.filter((v) => v.severity === "warn").length;
      assets[key] = { angle: angle.id, asset: asset.id, beat: asset.beat ?? null, template: asset.template || null, source: R.source, ok: aBlock === 0, blocking: aBlock, warnings: aWarn, violations: vios };
      assetsEvaluated++;
    }
  }

  // ── coherence (campaign-level warns) ──
  if (planCount > 1 && beatLetters.size <= 1) {
    const v = { rule: "beatCoverage", severity: "warn", message: `campaign covers only beat(s) ${[...beatLetters].join(",") || "none"} — spread A–F across the asset mix` };
    campaignViolations.push(v); bump(v);
  }
  if (planCount > 1 && beatLetters.size && !beatLetters.has("F")) {
    const v = { rule: "beatCoverage", severity: "warn", message: `no F (offer) beat in the campaign — add a bottom-of-funnel offer asset` };
    campaignViolations.push(v); bump(v);
  }
  for (const [angleId, m] of copySeen) {
    for (const [text, ids] of m) {
      const uniq = [...new Set(ids)];
      if (uniq.length > 1) {
        const v = { rule: "copyReuse", severity: "warn", message: `[${angleId}] same copy on ${uniq.join(", ")}: "${text.slice(0, 40)}"` };
        campaignViolations.push(v); bump(v);
      }
    }
  }

  // ── R3: format-mix (campaign-level). Block by default; relaxable per-campaign. ──
  const formatMixMode = rules.formatMix || "block";
  if (formatMixMode !== "off") {
    const mix = checkFormatMix(plan);
    if (!mix.ok) {
      const detail = mix.deviations
        .map((d) => `${d.bucket} ${d.actual}/${mix.total} (${Math.round(d.actualShare * 100)}%, target ${Math.round(d.target * 100)}% ≈ ${d.expected})`)
        .join(", ");
      const v = { rule: "formatMix", severity: formatMixMode === "warn" ? "warn" : "block",
        message: `format mix off target: ${detail}`,
        fixHint: "rebalance formats toward the canonical 60% video / 15% gif / 25% static (media-pull is mandatory, so 'no footage' is not a reason to skip motion)" };
      campaignViolations.push(v); bump(v);
    }
  }

  // total-coverage assertion (fail-closed)
  if (assetsEvaluated !== planCount) {
    const v = { rule: "coverage", severity: "block", message: `evaluated ${assetsEvaluated} of ${planCount} assets — coverage gap` };
    campaignViolations.push(v); bump(v);
  }

  return {
    schemaVersion: 1, campaign, brand,
    rulesSource: rules._source,
    blocking, warnings, ok: blocking === 0,
    assetsEvaluated, planCount,
    summaryText: `${blocking} blocking, ${warnings} warning${warnings === 1 ? "" : "s"} across ${planCount} asset${planCount === 1 ? "" : "s"}`,
    campaignViolations, assets,
  };
}

export function writeValidationReport(campaignsDir, campaign, report, stampedAt) {
  const out = { ...report, generatedAt: stampedAt || null };
  const p = join(campaignsDir, campaign, "validation.json");
  writeFileSync(p, JSON.stringify(out, null, 2) + "\n");
  return p;
}

// ── CLI ──
function main() {
  const args = process.argv.slice(2);
  const campaign = args.find((a) => !a.startsWith("--"));
  const asJson = args.includes("--json");
  if (!campaign) { console.error("usage: node scripts/validate-plan.mjs <campaign> [--json]"); process.exit(2); }
  const planPath = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
  if (!existsSync(planPath)) { console.error(`no creative-plan.json for "${campaign}"`); process.exit(2); }
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  let report;
  try {
    report = validatePlan(plan, { campaign });
  } catch (e) {
    // Truly unexpected — surface as a hard failure (fail-closed).
    console.error(`[validate-plan] FATAL: ${e.message}`);
    process.exit(2);
  }
  writeValidationReport(CAMPAIGNS_DIR, campaign, report);
  if (asJson) { console.log(JSON.stringify(report, null, 2)); }
  else {
    console.log(`\n${report.ok ? "✓" : "✗"} ${campaign}: ${report.summaryText} (rules: ${report.rulesSource})`);
    for (const v of report.campaignViolations) console.log(`  ${v.severity === "block" ? "✗" : "⚠"} [campaign] ${v.rule}: ${v.message}`);
    for (const [k, a] of Object.entries(report.assets)) {
      if (a.ok && !a.warnings) continue;
      console.log(`  ${a.ok ? "⚠" : "✗"} ${k} (${a.beat ?? "—"})`);
      for (const v of a.violations) console.log(`      ${v.severity === "block" ? "✗" : "⚠"} ${v.rule}: ${v.message}`);
    }
    console.log("");
  }
  process.exit(report.blocking > 0 ? 2 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

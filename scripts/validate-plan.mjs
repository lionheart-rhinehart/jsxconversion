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
import { loadExampleIndex, isAnyArchetype, archetypeForExample, exampleHasMedia, mediaOptionalForArchetype } from "./lib/example-library.mjs";
import { bindPlanExamples } from "./lib/bind-examples.mjs";
import { mediaReuseProblems } from "./lib/uniqueness.mjs";
import { readPerceptual } from "./lib/perceptual-merge.mjs";
import { readTier2, tier2Violations } from "./lib/tier2-merge.mjs";

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
  // Format-mix INTENT (the target), distinct from formatMix (the severity). "mixed"
  // (default) holds the canonical 60% video floor; "static-only"/"video-only" declare
  // a deliberately single-format batch. CRITICAL: intent is a RULES key (set in the
  // human-honored validation.config.json), NOT a plan.knobs value — a free plan knob
  // would re-open the SMAA dodge (the engine declaring static-only to skip the floor).
  // A fresh campaign's static-only declaration is honored ONLY when grandfathered or
  // AA_HUMAN_OVERRIDE-marked (same gate as a severity relax).
  formatMixIntent: "mixed",
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
// Objective anti-slop (#16): literal placeholder strings that must never ship.
const PLACEHOLDER_RE = /\b(lorem ipsum|your (?:text|headline|copy) here|(?:headline|subhead|text|image|photo) goes here|placeholder|tktk|tk tk|xxxx+)\b/i;

// Is a static edits-config ELEMENT a media element (vs a text/shape element)? Used
// by the media-fit gate (#12) to measure media geometry. Matches an explicit media
// type, a media-ish tag/id, or a media-style `accepts` list. NEVER scans fixedDesign
// (the run-campaign scrim lives there and must not count as media).
function isMediaEl(el) {
  if (!el || typeof el !== "object") return false;
  if (el.type === "image" || el.type === "video") return true;
  if (MEDIA_KEY.test(`${el.tag || ""} ${el.id || ""}`) || /\bcutout\b/i.test(`${el.tag || ""} ${el.id || ""}`)) return true;
  if (Array.isArray(el.accepts) && el.accepts.some((a) => /^(subject|production|env):/.test(a))) return true;
  return false;
}

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
    if (!cfg) return { format: fmt, fields: [], mediaPresent: false, cityResolved: null, aspect: null, source, approvedTrims: {}, mediaGeom: null };
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
    // media geometry for the media-fit gate (#12): the background-plane media + the
    // media elements + the frame size. Scans elements + top-level media ONLY (never
    // fixedDesign — the scrim is there). Additive return field; existing callers ignore it.
    const mediaGeom = {
      topMedia: (cfg.media && typeof cfg.media === "object") ? cfg.media : null,
      mediaEls: (cfg.elements || []).filter(isMediaEl),
      width: typeof cfg.width === "number" ? cfg.width : null,
      height: typeof cfg.height === "number" ? cfg.height : null,
    };
    return { format: fmt, fields, mediaPresent, cityResolved, aspect, source, approvedTrims, mediaGeom };
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
  // motion templateData carries no element geometry → media-fit geometry is unknowable
  // here; routes to the vision layer (#15). mediaGeom null.
  return { format: fmt, fields, mediaPresent, cityResolved, aspect: null, source: "motion", approvedTrims, mediaGeom: null };
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
export function checkFormatMix(plan, { target = CANONICAL_MOTION_RATIO, minAssets = 4, intent = "mixed" } = {}) {
  const assets = (plan.angles || []).flatMap((a) => a.assets || []);
  const total = assets.length;
  const actual = { video: 0, gif: 0, static: 0 };
  for (const a of assets) {
    const f = a.format === "video" || a.format === "gif" ? a.format : "static";
    actual[f]++;
  }
  // Too few assets → rounding dominates; skip (not enough signal to fail on).
  if (total < minAssets) return { ok: true, total, target, actual, videoShare: null, deviations: [], skipped: true, intent };
  const videoShare = actual.video / total;
  // A DECLARED static-only batch waives the video floor entirely (honored only via the
  // human-override path — see formatMixIntent). More motion than declared is never a
  // problem, so static-only with some motion still passes.
  if (intent === "static-only") {
    return { ok: true, total, target, actual, videoShare: +videoShare.toFixed(2), deviations: [], intent };
  }
  const slackShare = Math.max(1 / total, 0.15);
  // video-only declares an all-video batch → the floor is ~100% video.
  const targetVideo = intent === "video-only" ? 1 : (typeof target.video === "number" ? target.video : 0);
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
  return { ok: deviations.length === 0, total, target, actual, videoShare: +videoShare.toFixed(2), deviations, slackShare, intent };
}

// ── the validator ────────────────────────────────────────────────────────────
export function validatePlan(plan, opts = {}) {
  const campaign = opts.campaign || plan.campaign;
  const dataDir = opts.dataDir || DATA_DIR;
  const brand = plan.brand || null;

  // ── Content-class exemption (NOT a rule downgrade) ─────────────────────────
  // The generation-quality gate exists to vet creatives the ENGINE generated, so
  // the engine can't game its own gate (see the un-downgradable override logic
  // below). A Claude Design handoff is a DIFFERENT content class: pre-made,
  // human-approved designs the engine did not generate — the gate's purpose
  // doesn't apply (no city is set, Route-C is intentionally media-free, client
  // copy may use otherwise-restricted words). Human-authorized 2026-06-11 to skip
  // it during the EDITING process. Requires BOTH the explicit source AND flag so
  // it can ONLY exempt this class, never a generated campaign. (A future opt-in
  // "analyze against brand rules" button is the right place for this check.)
  if (plan.source === "claude-design" && plan.skipValidation === true) {
    const planCount = (plan.angles || []).reduce((n, a) => n + (a.assets || []).length, 0);
    return {
      schemaVersion: 1, campaign, brand,
      rulesSource: "claude-design (validation skipped — pre-approved handoff, not engine-generated)",
      blocking: 0, warnings: 0, ok: true,
      assetsEvaluated: 0, planCount,
      summaryText: `validation skipped — Claude Design handoff (${planCount} pre-approved designs)`,
      campaignViolations: [], assets: {},
    };
  }
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

  // Generation-engine binding — re-derive the deterministic example selection so the
  // gate can verify each fresh asset's stamped exampleId is AUTHENTIC (exactly what
  // code selection produces), not hand-faked or stale. scripts/bind-examples.mjs is
  // the PRODUCER; this is the un-forgeable ENFORCEMENT (the gate runs regardless of
  // who wrote the plan). Pure; never throws. opts.index lets tests inject a fake.
  const exampleIndex = opts.index || loadExampleIndex(PROJECT_ROOT);
  const exampleIndexEmpty = !exampleIndex || !exampleIndex.examples || Object.keys(exampleIndex.examples).length === 0;
  const rebind = library ? bindPlanExamples(plan, { library, index: exampleIndex }) : null;
  const expectedExampleId = new Map();   // "angleId/assetId" → exampleId | null
  if (rebind) {
    for (const b of rebind.report.bound) expectedExampleId.set(`${b.angleId}/${b.assetId}`, b.exampleId);
    for (const n of rebind.report.nulls) expectedExampleId.set(`${n.angleId}/${n.assetId}`, null);
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
          { fixHint: "run the engine's select step: node scripts/bind-examples.mjs " + campaign });
      }

      // Authenticity — the stamped exampleId must EQUAL what deterministic selection
      // produces (re-derived above). A hand-faked / stale id, an unbindable archetype,
      // or a reordered batch is caught here. Fail-OPEN on infra-absence (no library /
      // empty index): the legacy exampleBinding + media blocks hold the floor; we only
      // fail-CLOSED on forgery. (The "no id at all" case is the legacy block above.)
      if (asset.source === "fresh" && !isGrandfathered(campaign, grandfatherSet) && rebind && !exampleIndexEmpty) {
        if (!isAnyArchetype(asset.archetype)) {
          add("exampleBindingAuthentic", "block",
            `archetype "${asset.archetype}" is not a known ARCHETYPE/MOTION_ARCHETYPE`,
            { fixHint: "assign a valid archetype (see scripts/lib/example-library.mjs ARCHETYPES / MOTION_ARCHETYPES)" });
        } else {
          const expected = expectedExampleId.get(key);
          if (expected === null) {
            add("exampleBindingAuthentic", "block",
              `no fitting example for archetype "${asset.archetype}" — deterministic selection yields nothing`,
              { fixHint: "choose another archetype for this asset, or add a library example of this archetype" });
          } else if (isStr(asset.exampleId) && asset.exampleId !== expected) {
            add("exampleBindingAuthentic", "block",
              `stamped exampleId "${asset.exampleId}" ≠ deterministically-selected "${expected}" — id was hand-faked, stale, or assets were reordered`,
              { fixHint: `re-run: node scripts/bind-examples.mjs ${campaign}` });
          }
        }
      }

      const letter = beatLetter(asset.beat);
      if (letter) beatLetters.add(letter);
      const idx = isStr(asset.template) ? roleIndex[asset.template] : null;
      const templateRoles = idx ? new Set([...(idx.roles || []), ...(idx.accepts || [])]) : null;

      // ── Rule 1: media presence MIRRORS the bound example. The engine builds a
      // NEW design modeled on an example; if that example carries media the new
      // design must too, if the example is media-free it needn't (the 2026-06-06
      // findings: graphic/data-viz designs stay photo-free — full-bleed collapses
      // distinctness). Keyed on the bound EXAMPLE (mediaStyleAccepts), NOT the
      // archetype and NOT static-vs-video — within one media-optional archetype some
      // examples carry media and some don't. Unknown id → fail-closed (require media).
      // Legacy/template assets keep the blanket rule. ──
      const exampleIsMediaFree = asset.source === "fresh" && isStr(asset.exampleId) && !exampleHasMedia(asset.exampleId, exampleIndex);
      if (!R.mediaPresent && !isMediaExempt(asset.template) && !exampleIsMediaFree) {
        const who = (asset.source === "fresh" && isStr(asset.exampleId))
          ? `the example it is built from ("${asset.exampleId}", ${archetypeForExample(asset.exampleId, exampleIndex) || "?"}) carries media — mirror it`
          : `every creative must carry real media (template "${asset.template}")`;
        add("media", "block", `no image/video — ${who}`,
          { fixHint: "place a clip/photo in the editor; a design modeled on a media-free example may omit media, or add the template to rules.mediaExempt if it is a bare brand card" });
      }

      // ── #12 media-fit (TREATMENT). When a graphic/data-viz design DOES carry media,
      // the measured rubric (docs/media-integration-findings.md) limits HOW: no
      // full-bleed (collapses distinctness), contained accent ≤ ~20% of the frame.
      // Static only (motion geometry routes to vision #15); scoped to media-optional
      // archetypes — full-bleed IS the point of the photo-led ones. ──
      const boundArch = (asset.source === "fresh" && isStr(asset.exampleId)) ? archetypeForExample(asset.exampleId, exampleIndex) : null;
      if (R.format === "static" && R.mediaGeom && boundArch && mediaOptionalForArchetype(boundArch)) {
        const FA = (R.mediaGeom.width || 1080) * (R.mediaGeom.height || 1920);
        const isBg = (el) => el && (el.z == null || el.z <= 1);
        const areaOf = (el) => (typeof el.width === "number" && typeof el.height === "number") ? el.width * el.height : null;
        const tm = R.mediaGeom.topMedia;
        const topFull = tm && isBg(tm) && (areaOf(tm) == null || areaOf(tm) >= 0.9 * FA);
        const elFull = R.mediaGeom.mediaEls.some((el) => isBg(el) && areaOf(el) != null && areaOf(el) >= 0.9 * FA);
        if (topFull || elFull) {
          add("mediaFit", "block", `full-bleed media on a graphic/data-viz design (archetype "${boundArch}") — the rubric: graphic designs stay photo-free`,
            { fixHint: "remove the full-bleed background; use a knockout cutout, a split-panel, or a ≤20% accent — or switch to a photo-led archetype" });
        } else {
          for (const el of R.mediaGeom.mediaEls) {
            const a = areaOf(el);
            if (a != null && a > 0.20 * FA) {
              add("mediaFit", "block", `accent media is ${Math.round((a / FA) * 100)}% of the frame on a graphic/data-viz design (archetype "${boundArch}") — rubric ceiling is ~20%`,
                { fixHint: "shrink the accent to ≤20% of the frame, or use a split-panel / cutout layout" });
            } else if (a == null) {
              add("mediaFit", "warn", `media element "${el.id || el.tag || "?"}" has no width/height — cannot verify the ~20% accent ceiling`,
                { fixHint: "give the media element explicit width/height in the edits config" });
            }
          }
        }
      }

      // ── #16 anti-slop (objective / byte-detectable). The subjective "looks cheap /
      // off-brand / rough cutout" judgment is the vision layer (#15/#16); here we catch
      // what a script can prove: placeholder text, and a media slot faked with a CSS
      // shape/gradient instead of real footage (Law #0's "no bare type cards" cousin). ──
      for (const f of R.fields) {
        if (isStr(f.text) && PLACEHOLDER_RE.test(f.text)) {
          add("antiSlop", "block", `placeholder text in "${f.key}": "${f.text.slice(0, 40)}"`,
            { fixHint: "replace the placeholder with the real verbatim copy" });
        }
      }
      if (R.mediaGeom && Array.isArray(R.mediaGeom.mediaEls)) {
        const hasSrc = (el) => isStr(el.path) || isStr(el.src) || isStr(el.url) || isStr(el.media);
        const looksLikeShape = (el) => el.type === "rect" || el.type === "shape" || isStr(el.fill) || isStr(el.background) || isStr(el.gradient);
        const mediaRoled = (el) => (Array.isArray(el.accepts) && el.accepts.some((a) => /^(subject|production|env):/.test(a)))
          || /\b(bg[_-]?media|photo|clip|cutout)\b/i.test(`${el.tag || ""} ${el.id || ""}`);
        for (const el of R.mediaGeom.mediaEls) {
          if (mediaRoled(el) && !hasSrc(el) && looksLikeShape(el)) {
            add("antiSlop", "block", `media slot "${el.id || el.tag || "?"}" is a CSS shape/gradient, not a real image`,
              { fixHint: "place real footage in this slot — a gradient/solid block is not media" });
          }
        }
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

  // ── #12 media diversity (campaign-level). Exact clip/photo reuse across the batch
  // is a hard block in generate-world — same media is the #1 perceptual-collapse
  // driver (docs/media-integration-findings.md #4). Legacy/grandfathered campaigns
  // keep run-campaign's existing warn-or-throw (uniquenessProblems); this only adds
  // teeth for NEW generate-world work. ──
  if (isGenerateWorld && !isGrandfathered(campaign, grandfatherSet)) {
    for (const { angleId, media, ids } of mediaReuseProblems(plan)) {
      const v = { rule: "mediaDiversity", severity: "block",
        message: `[${angleId}] media "${media}" reused by ${ids.join(", ")} — footage diversity is mandatory (same clip is the #1 collapse driver)`,
        fixHint: "give each creative a distinct clip/photo" };
      campaignViolations.push(v); bump(v);
    }
  }

  // ── R3: format-mix (campaign-level). Block by default; relaxable per-campaign. ──
  const formatMixMode = rules.formatMix || "block";
  const formatMixIntent = rules.formatMixIntent || "mixed";
  // Surface a non-default intent so a (human-honored) static-only/video-only batch is
  // AUDITED on the review page, never a silent floor-waiver.
  if (formatMixIntent !== "mixed") {
    const v = { rule: "formatMix", severity: "warn",
      message: `format-mix intent: ${formatMixIntent} — the canonical 60% video floor is waived by this human-honored declaration` };
    campaignViolations.push(v); bump(v);
  }
  if (formatMixMode !== "off") {
    const mix = checkFormatMix(plan, { intent: formatMixIntent });
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

  // ── Perceptual gates (#14 distinctness / #15 cluster-adherence / #16 vision-slop),
  // merged from campaigns/<c>/perceptual.json (written ONCE after render by
  // scripts/perceptual-sidecar.mjs — the heavy CLIP/DINOv2 NEVER runs in this process).
  // editor-server's /validation returns validatePlan() verbatim, so this reaches the
  // review page with ZERO editor-server edits. These JUDGMENT gates FAIL-CLOSED to
  // HUMAN and are DOWNGRADABLE via the human-override path (a torch-less machine or a
  // deliberate human review isn't wedged). Wrapped so a perceptual bug can never crash
  // validatePlan (a crash → /validation {ok:false} → review fails OPEN). ──
  try {
    const honored = overrideHonored({ campaign, grandfatherSet, env });
    // sentinel + absent-after-render: campaign-wide downgradable (the infra / torch-less escape).
    const sev = (s) => (honored && s === "block" ? "warn" : s);
    // [PL-1] a REAL perceptual block downgrades ONLY when the honored override relaxes THAT
    // SPECIFIC rule (e.g. validation.config.json {"clusterAdherence":"warn"}) — never as a
    // side-effect of an unrelated override (a formatMix relax must NOT silently waive the
    // vision gate, which it used to). rules[rule] is "warn" only when applyCampaignOverride
    // honored an explicit per-rule relax.
    const ruleSev = (rule, s) => (honored && s === "block" && rules[rule] === "warn") ? "warn" : s;
    const campDir = join(CAMPAIGNS_DIR, campaign);
    const perceptual = readPerceptual(campDir);
    let renderedAny = false;
    const manifestPath = join(PROJECT_ROOT, "out", "campaigns", campaign, "manifest.json");
    if (existsSync(manifestPath)) {
      try { renderedAny = (JSON.parse(readFileSync(manifestPath, "utf8")).cells || []).some((c) => c && c.status === "rendered"); } catch { /* unreadable → treat as not-rendered */ }
    }
    if (!perceptual) {
      // Absent is NOT a no-op: after render, a missing perceptual.json means the gate
      // was SKIPPED → block (the un-skippable closer). Pre-render (no rendered cells)
      // there is nothing to perceive → silent.
      if (isGenerateWorld && renderedAny && !isGrandfathered(campaign, grandfatherSet)) {
        const v = { rule: "perceptualGate", severity: sev("block"),
          message: `perceptual gate not yet run on the rendered outputs — #14/#15/#16 unchecked`,
          fixHint: `run: node scripts/perceptual-sidecar.mjs ${campaign}` };
        campaignViolations.push(v); bump(v);
      }
    } else if (perceptual.ranOk === false && perceptual.sentinel) {
      // The sidecar couldn't run → hold for human (block, downgradable). Surface campaign-
      // level AND on every card (so the per-card approve-disabled holds the whole batch).
      const sv = { ...perceptual.sentinel, severity: sev(perceptual.sentinel.severity) };
      campaignViolations.push(sv); bump(sv);
      for (const a of Object.values(assets)) a.violations.push(sv); // display copy (recount below; not re-bumped)
    } else if (perceptual.ranOk === true) {
      for (const [key, entry] of Object.entries(perceptual.assets || {})) {
        const target = assets[key];
        if (!target) {
          const v = { rule: "perceptualStale", severity: "warn", message: `perceptual.json has an entry for ${key} not in the plan` };
          campaignViolations.push(v); bump(v); continue;
        }
        for (const vio of entry.violations || []) {
          const dv = { ...vio, severity: ruleSev(vio.rule, vio.severity) };
          target.violations.push(dv); bump(dv);
        }
      }
    }
  } catch (e) {
    const v = { rule: "perceptualMergeError", severity: "block", message: `perceptual merge failed: ${e.message} — held for human`, fixHint: "inspect campaigns/<c>/perceptual.json" };
    campaignViolations.push(v); bump(v);
  }
  // ── Tier-2 advisory panel (warn-only — NEVER blocks). Folds campaigns/<c>/tier2.json
  // via the same file-read path so the persona panel reaches the review page. Wrapped
  // so a tier2 bug can never break the gate; severity is "warn" by construction. ──
  try {
    const { byKey } = tier2Violations(readTier2(join(CAMPAIGNS_DIR, campaign)));
    for (const [key, entry] of Object.entries(byKey)) {
      const target = assets[key];
      if (!target) continue;
      target.tier2 = entry.tier2;
      if (entry.warn) { target.violations.push(entry.warn); bump(entry.warn); }
    }
  } catch { /* Tier-2 is advisory — never break the gate on it */ }

  // Recompute PER-ASSET counts after the folds (review.html reads ve.blocking per card).
  // Top-level blocking/warnings stay maintained by bump() — one count per logical
  // violation — so the sentinel's per-card display copies are not double-counted there.
  for (const a of Object.values(assets)) {
    a.blocking = a.violations.filter((v) => v.severity === "block").length;
    a.warnings = a.violations.filter((v) => v.severity === "warn").length;
    a.ok = a.blocking === 0;
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

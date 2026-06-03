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

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  fieldRole, beatLetter, GUARANTEE_TEXT, parseCityFromEyebrow, DEFAULT_EYEBROW_PATTERN,
} from "./lib/roles.mjs";
import { CONTENT_ROLES } from "./lib/copy-resolve.mjs";
import { loadCopyLibraryStrict } from "./lib/copy-library.mjs";
import { resolveStaticConfig } from "./lib/fill-core.mjs";
import { cloneCity, locationCity } from "./lib/location.mjs";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");
const DATA_DIR = join(PROJECT_ROOT, "data");
const TEMPLATE_DIR = join(PROJECT_ROOT, "templates/multi-sport-foundations");
const ROLE_INDEX_PATH = join(PROJECT_ROOT, "templates/_role-index.json");

// ── rules config ─────────────────────────────────────────────────────────────
// Universal defaults — enforced even with no data/rules.<brand>.json present.
export const DEFAULT_RULES = {
  aspect: { width: 1080, height: 1920 },
  mediaExempt: [],
  verbatim: "warn",                 // off | warn | substring(block). Brand file opts into hard.
  // Scope the verbatim check to PERSUASIVE copy — the lines that must be Cody's
  // verbatim words. Factual proof/stat/credentials/citations come from research,
  // not ad-copy.md, so they're excluded (decision: persuasive incl. claim).
  verbatimRoles: ["hook", "claim", "mechanism", "reframe", "kicker", "testimonial"],
  cityModel: "clone",
  locationRotation: { enabled: false },
  voice: { noEmoji: true, noExclamation: true },
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
      cfg = resolveStaticConfig({ clusterId: asset.template, asset, brand, location, campaign, templateDir: TEMPLATE_DIR, dataDir });
      source = cfg ? "fill" : "none";
    }
    if (!cfg) return { format: fmt, fields: [], mediaPresent: false, cityResolved: null, aspect: null, source };
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
    return { format: fmt, fields, mediaPresent, cityResolved, aspect, source };
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
  return { format: fmt, fields, mediaPresent, cityResolved, aspect: null, source: "motion" };
}

// Is a resolved field "message copy" (subject to verbatim/voice)? Statics use the
// role; motion uses the key denylist (line1/line2 are content; bgClip/duration not).
function isContentField(f, format) {
  if (format === "static") return f.role && CONTENT_ROLES.has(f.role);
  if (!isStr(f.key)) return false;
  if (NON_CONTENT_KEY.test(f.key) || MEDIA_KEY.test(f.key)) return false;
  return true;
}

// ── the validator ────────────────────────────────────────────────────────────
export function validatePlan(plan, opts = {}) {
  const campaign = opts.campaign || plan.campaign;
  const dataDir = opts.dataDir || DATA_DIR;
  const brand = plan.brand || null;
  let rules = opts.rules || loadRules(brand, dataDir);
  // Per-campaign override (rollout: warn existing / block new). A grandfathered
  // campaign carries campaigns/<c>/validation.config.json (e.g. {"verbatim":"warn"})
  // that relaxes the brand rule FOR THAT CAMPAIGN only; brand #2 and any campaign
  // without the file gets the brand default (hard block).
  if (!opts.rules) {
    const ovPath = join(CAMPAIGNS_DIR, campaign, "validation.config.json");
    if (existsSync(ovPath)) {
      try { rules = { ...rules, ...JSON.parse(readFileSync(ovPath, "utf8")), _source: `${rules._source} + campaign override` }; }
      catch { /* malformed override → ignore, keep brand rules (fail toward stricter) */ }
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

        // voice (applies to ALL text — emoji/!/banned never belong anywhere)
        if (rules.voice && rules.voice.noEmoji && EMOJI_RE.test(t)) {
          add("voiceEmoji", "block", `emoji in "${f.key}": ${t.slice(0, 40)}`, { fixHint: "brand prohibits emoji" });
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

        // verbatim substring-in-library
        if (verbatimMode !== "off" && libConcat && isContentField(f, R.format)) {
          if (!verbatimRoles || (f.role && verbatimRoles.has(f.role))) {
            const fn = norm(t);
            const traced = fn.length > 0 && libConcat.some((u) => u.includes(fn));
            if (!traced) {
              const sev = verbatimMode === "substring" ? "block" : "warn";
              add("verbatim", sev, `copy in "${f.key}" doesn't trace to copy-library: "${t.slice(0, 50)}"`,
                { fixHint: "bind a copy-library unit (copyRefs/hookRef) or lift the verbatim text — don't reword/compose" });
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
        if (looksLikeGuarantee && norm(joined) !== norm(GUARANTEE_TEXT)) {
          add("guaranteeDrift", "block", `guarantee is paraphrased (fields: ${gFields.map((f) => f.key).join("+")})`,
            { fixHint: `must read exactly: ${GUARANTEE_TEXT}` });
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

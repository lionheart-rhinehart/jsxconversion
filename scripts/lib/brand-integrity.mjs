// ============================================================================
//  scripts/lib/brand-integrity.mjs — no AA leaks on a franchisee brand (B-brand)
// ============================================================================
//  Three franchisee runs shipped Athletes Acceleration content under another
//  brand: AA red that the palette remap missed, the "ATHLETES ACCELERATION"
//  wordmark baked into a field, a known AA source asset, and AA-specific
//  people/proof ("COACH GRAHAM WILKERSON", "TRAINED NFL ATHLETES", NFL names).
//  This is a PRE-EXPORT scan over the bytes that actually produced the render
//  (the edits configs + plan templateData + media paths): on a NON-AA brand,
//  AA colors/wordmark/assets are BLOCKING; AA people/proof are WARNINGS the user
//  confirms-or-swaps (the engine flags, the user decides).
//
//  scanBrandIntegrity() is pure (takes a list of {source,text}); gatherCampaign
//  Texts() does the I/O. AA campaigns short-circuit to "clean" (0-diff).
// ============================================================================

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const AA_BRAND_SLUG = "athletes-acceleration";

// AA color literals (hex + the rgb triple inside rgba()/gradients).
const AA_RED_HEX = /#c4141d\b/i;
const AA_RED_DEEP_HEX = /#a30f17\b/i;
const AA_RED_RGB = /\b196\s*,\s*20\s*,\s*29\b/;
// The wordmark, baked into a copy/label field.
const AA_WORDMARK = /ATHLETES\s+ACCELERATION/i;
// Known AA source-asset filenames that must not ride along to a franchisee.
const AA_ASSET = /(hook-sprint-carmel|athletes-acceleration[-_]?logo|aa[-_]logo)\b/i;

// AA-specific people / proof / credentials — FLAGGED for confirm-or-swap, not blocked.
const AA_PEOPLE_PROOF = [
  { re: /COACH\s+GRAHAM\s+WILKERSON/i, label: "COACH GRAHAM WILKERSON" },
  { re: /\bGRAHAM\s+WILKERSON\b/i, label: "GRAHAM WILKERSON" },
  { re: /TRAINED\s+NFL\s+ATHLETES/i, label: "TRAINED NFL ATHLETES" },
  { re: /\bNFL\b/i, label: "NFL reference" },
];

const BLOCKERS = [
  { re: AA_RED_HEX, kind: "aa-red", detail: "#c4141d" },
  { re: AA_RED_DEEP_HEX, kind: "aa-red-deep", detail: "#a30f17" },
  { re: AA_RED_RGB, kind: "aa-red-rgb", detail: "196,20,29" },
  { re: AA_WORDMARK, kind: "aa-wordmark", detail: "ATHLETES ACCELERATION" },
  { re: AA_ASSET, kind: "aa-asset", detail: "known AA source asset" },
];

// Pure scan. brand = the campaign's brand slug; texts = [{source, text}].
// Returns { brand, isAA, findings:[{source,kind,severity,detail}], blocking:[...] }.
export function scanBrandIntegrity({ brand, texts = [] } = {}) {
  const isAA = !brand || String(brand).toLowerCase() === AA_BRAND_SLUG;
  if (isAA) return { brand, isAA: true, findings: [], blocking: [] };

  const findings = [];
  for (const { source, text } of texts) {
    if (typeof text !== "string" || !text) continue;
    for (const b of BLOCKERS) {
      if (b.re.test(text)) findings.push({ source, kind: b.kind, severity: "block", detail: b.detail });
    }
    for (const p of AA_PEOPLE_PROOF) {
      if (p.re.test(text)) findings.push({ source, kind: "aa-people-proof", severity: "warn", detail: p.label });
    }
  }
  return { brand, isAA: false, findings, blocking: findings.filter((f) => f.severity === "block") };
}

// Gather the scannable text of a campaign: the plan (templateData + media paths)
// and every edits config (the frozen bytes the static renderer uses verbatim).
// Each item is { source, text } where text is the stringified JSON of one file.
export function gatherCampaignTexts(campaignDir) {
  const out = [];
  const planPath = join(campaignDir, "creative-plan.json");
  if (existsSync(planPath)) out.push({ source: "creative-plan.json", text: readFileSync(planPath, "utf8") });
  const editsDir = join(campaignDir, "edits");
  if (existsSync(editsDir)) {
    for (const f of readdirSync(editsDir)) {
      if (!f.endsWith(".config.json")) continue;
      out.push({ source: `edits/${f}`, text: readFileSync(join(editsDir, f), "utf8") });
    }
  }
  return out;
}

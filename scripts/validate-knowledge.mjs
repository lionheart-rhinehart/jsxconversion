#!/usr/bin/env node
// ============================================================================
//  scripts/validate-knowledge.mjs — deep-read completeness gate (G3c)
// ============================================================================
//  Turns the SKILL.md prose rule ("assert every expected section produced output
//  before planning") into ENFORCED code. The creative-engine skill calls this
//  after the deep-read fan-out and BEFORE planning, so the planner never works
//  from a half-empty knowledge base (which silently degrades every creative).
//
//    node scripts/validate-knowledge.mjs <campaign>
//
//  Checks campaigns/<campaign>/campaign-knowledge.json:
//    • file exists + parses (else block),
//    • every section in `assertions` reads "OK (n>0)" (else block), AND/OR
//    • every `fragments[section].items` is non-empty (else block).
//  Exit 0 = complete; exit 2 = gaps (so the skill can loop-fix).
//
//  NODE-ONLY.
// ============================================================================

import { readFileSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");

export function validateKnowledge(campaign) {
  const path = join(CAMPAIGNS_DIR, campaign, "campaign-knowledge.json");
  const problems = [];
  if (!existsSync(path)) {
    return { ok: false, problems: [`no campaign-knowledge.json — run the deep-read fan-out first`], sections: 0 };
  }
  let k;
  try { k = JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { return { ok: false, problems: [`campaign-knowledge.json is corrupt: ${e.message}`], sections: 0 }; }

  const assertions = k.assertions && typeof k.assertions === "object" ? k.assertions : null;
  const fragments = k.fragments && typeof k.fragments === "object" ? k.fragments : null;
  if (!assertions && !fragments) {
    return { ok: false, problems: [`campaign-knowledge.json has neither assertions nor fragments — nothing was extracted`], sections: 0 };
  }

  // Union of declared section keys from both maps.
  const keys = new Set([...(assertions ? Object.keys(assertions) : []), ...(fragments ? Object.keys(fragments) : [])]);
  for (const key of keys) {
    const a = assertions ? assertions[key] : null;
    const frag = fragments ? fragments[key] : null;
    const items = frag && Array.isArray(frag.items) ? frag.items.length : null;
    // "OK (25)" → 25. Anything not OK-with-a-positive-count is suspect.
    const m = typeof a === "string" ? a.match(/ok\s*\((\d+)\)/i) : null;
    const assertCount = m ? Number(m[1]) : null;
    const empty = (assertCount === 0) || (assertCount === null && items === 0)
      || (assertCount === null && items === null && (a === undefined || a === null || a === ""));
    if (empty) problems.push(`section "${key}" produced no output (assertion=${JSON.stringify(a)}, items=${items})`);
  }

  return { ok: problems.length === 0, problems, sections: keys.size };
}

function main() {
  const campaign = process.argv.slice(2).find((a) => !a.startsWith("--"));
  if (!campaign) { console.error("usage: node scripts/validate-knowledge.mjs <campaign>"); process.exit(2); }
  const r = validateKnowledge(campaign);
  if (r.ok) {
    console.log(`✓ ${campaign}: campaign-knowledge complete — ${r.sections} sections, all produced output`);
    process.exit(0);
  }
  console.error(`✗ ${campaign}: campaign-knowledge has gaps (${r.problems.length}):`);
  for (const p of r.problems) console.error(`  - ${p}`);
  console.error(`Re-run the missing deep-read section(s) before planning.`);
  process.exit(2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

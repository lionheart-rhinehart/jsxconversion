#!/usr/bin/env node
// ============================================================================
//  scripts/intake-copy.mjs — parse a campaign's hand-written copy into a
//  verbatim copy-library.json the planner references by id.
//
//    node scripts/intake-copy.mjs <campaign> [--quiet]
//
//  Reads campaigns/<campaign>/ad-copy.md (+ microscripts.md if present), writes
//  campaigns/<campaign>/copy-library.json, and prints a coverage report. Fails
//  loud (exit 1) if no source docs exist or an AD block produced 0 units — a
//  silently half-empty library is worse than none.
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { buildCopyLibrary, COPY_LIBRARY_FILE } from "./lib/copy-library.mjs";

const CAMPAIGNS_DIR = "campaigns";

function main() {
  const args = process.argv.slice(2);
  const campaign = args.find((a) => !a.startsWith("--"));
  const quiet = args.includes("--quiet");
  if (!campaign) {
    console.error("usage: node scripts/intake-copy.mjs <campaign> [--quiet]");
    process.exit(2);
  }

  const dir = join(CAMPAIGNS_DIR, campaign);
  if (!existsSync(dir)) {
    console.error(`[intake-copy] no campaign folder at ${dir}`);
    process.exit(1);
  }

  const adPath = join(dir, "ad-copy.md");
  const msPath = join(dir, "microscripts.md");
  const adCopyMd = existsSync(adPath) ? readFileSync(adPath, "utf8") : undefined;
  const microscriptsMd = existsSync(msPath) ? readFileSync(msPath, "utf8") : undefined;

  if (adCopyMd === undefined && microscriptsMd === undefined) {
    console.error(`[intake-copy] no ad-copy.md or microscripts.md in ${dir} — nothing to parse`);
    process.exit(1);
  }

  const warnings = [];
  const lib = buildCopyLibrary({
    campaign,
    adCopyMd,
    microscriptsMd,
    warn: (m) => warnings.push(m),
  });

  if (lib.count === 0) {
    console.error(`[intake-copy] parsed 0 units from ${campaign} — check doc formatting`);
    process.exit(1);
  }

  const outPath = join(dir, COPY_LIBRARY_FILE);
  writeFileSync(outPath, JSON.stringify(lib, null, 2) + "\n");

  // Coverage report
  const byKind = {};
  for (const u of lib.units) byKind[u.kind] = (byKind[u.kind] || 0) + 1;
  if (!quiet) {
    console.log(`[intake-copy] ${campaign}: ${lib.count} verbatim units → ${outPath}`);
    console.log(`  sources: ${lib.generatedFrom.join(", ")}`);
    for (const [k, n] of Object.entries(byKind).sort()) console.log(`  ${k.padEnd(14)} ${n}`);
  }
  for (const w of warnings) console.error(`[intake-copy] WARN: ${w}`);

  // Parse report (G3c): make what was parsed (and what dropped) VISIBLE so a
  // formatting variance can't quietly swallow copy. Tracked alongside the library.
  const reportPath = join(dir, "copy-library.report.json");
  writeFileSync(reportPath, JSON.stringify({
    campaign, generatedFrom: lib.generatedFrom, count: lib.count,
    byKind, warnings,
  }, null, 2) + "\n");

  // Fail loud on a structurally broken parse: a block that produced NO units, OR
  // a section header that was present but dropped (G3c) — both mean copy is missing.
  const fatal = warnings.filter((w) => /0 units|dropped section/.test(w));
  if (fatal.length) {
    console.error(`[intake-copy] copy was dropped during parse — failing:`);
    for (const w of fatal) console.error(`  - ${w}`);
    process.exit(1);
  }
}

main();

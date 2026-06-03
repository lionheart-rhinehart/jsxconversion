#!/usr/bin/env node
// ============================================================================
//  scripts/annotate-roles.mjs — one-time full pass: add copy-role schema fields
//  (role / accepts / maxChars) to every static cluster config, by tag.
// ============================================================================
//  Deterministic tag→role mapping from the config inventory (docs/creative-
//  playbook.md). Idempotent: skips elements that already carry a `role`, skips
//  decorative tags, skips generated *.fill / *.camp variants. The `accepts`
//  list keeps display slots role-FILLABLE (Cody's "every display slot" choice),
//  so a campaign can route a hook into a lockup slot — assemble() does the rest.
// ============================================================================

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "templates/multi-sport-foundations";

// tag → { role, accepts, maxChars } | null (decorative, not fillable)
const MAP = {
  headline:            { role: "claim",   accepts: ["hook", "claim", "brand", "offer"], maxChars: 48 },
  title:               { role: "claim",   accepts: ["hook", "claim", "brand", "offer"], maxChars: 48 },
  title_2:             { role: "claim",   accepts: ["claim", "brand"],                  maxChars: 48 },
  title_top:           { role: "brand",   accepts: ["hook", "claim", "brand"],          maxChars: 24 },
  title_mid:           { role: "brand",   accepts: ["brand"],                            maxChars: 12 },
  title_bot:           { role: "brand",   accepts: ["brand", "claim"],                   maxChars: 24 },
  title_youth:         { role: "brand",   accepts: ["brand"],                            maxChars: 12 },
  title_program:       { role: "brand",   accepts: ["brand", "claim"],                   maxChars: 16 },
  title_foundational:  { role: "brand",   accepts: ["brand", "claim"],                   maxChars: 20 },
  headline_accent:     { role: "brand",   accepts: ["brand"],                            maxChars: 12 },
  banner_text:         { role: "claim",   accepts: ["claim", "proof"],                   maxChars: 60 },
  subtitle:            { role: "claim",   accepts: ["claim", "hook"],                    maxChars: 48 },
  attention:           { role: "hook",    accepts: ["hook"],                             maxChars: 24 },
  kicker:              { role: "kicker",  accepts: ["kicker", "hook"],                   maxChars: 30 },
  microscript:         { role: "reframe", accepts: ["reframe", "eyebrow", "proof"],      maxChars: 40 },
  microscript_2:       { role: "reframe", accepts: ["reframe", "proof"],                 maxChars: 40 },
  subhead:             { role: "reframe", accepts: ["reframe", "eyebrow"],               maxChars: 48 },
  eyebrow:             { role: "eyebrow", accepts: ["eyebrow"],                          maxChars: 24 },
  city:                { role: "eyebrow", accepts: ["eyebrow", "brand"],                 maxChars: 20 },
  cta:                 { role: "cta",     accepts: ["cta", "offer"],                     maxChars: 32 },
  brand_name:          { role: "brand",   accepts: ["brand"],                            maxChars: 28 },
  brand_callout:       { role: "brand",   accepts: ["brand"],                            maxChars: 28 },
  handle:              { role: "byline",  accepts: ["byline"],                           maxChars: 30 },
  quote_mark:          null,
};

const files = readdirSync(DIR).filter(
  (f) => /^cluster-[\w]+\.config\.json$/.test(f) && !f.includes(".fill.") && !f.includes(".camp-"),
);

let touchedFiles = 0, touchedEls = 0;
const unmapped = new Set();

for (const f of files) {
  const path = join(DIR, f);
  const cfg = JSON.parse(readFileSync(path, "utf8"));
  let changed = false;
  for (const el of cfg.elements || []) {
    if (typeof el.text !== "string") continue;       // only copy slots
    if (el.role) continue;                            // idempotent
    const m = MAP[el.tag];
    if (m === null) continue;                         // decorative
    if (!m) { if (el.tag) unmapped.add(el.tag); continue; }
    el.role = m.role;
    el.accepts = m.accepts;
    el.maxChars = m.maxChars;
    changed = true;
    touchedEls++;
  }
  if (changed) { writeFileSync(path, JSON.stringify(cfg, null, 2) + "\n"); touchedFiles++; }
}

console.log(`Annotated ${touchedEls} elements across ${touchedFiles} files (of ${files.length} configs).`);
if (unmapped.size) console.log(`Unmapped tags (left alone): ${[...unmapped].join(", ")}`);

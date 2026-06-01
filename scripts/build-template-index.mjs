#!/usr/bin/env node
// ============================================================================
//  scripts/build-template-index.mjs — role-index for playbook-driven planning
// ============================================================================
//  Scans both template banks and emits ONE lookup the /creative-engine planner
//  reads to pick a template by ROLE-FIT (which roles a beat needs → a template
//  whose slots expose them). Output: templates/_role-index.json
//    { <templateId>: { format, dir, roles:[...], slotCount } }
//
//  Hardened (per the 2am review): per-file try/catch (one bad/half-written config
//  can't abort the build), build-in-memory + write ONCE (no partial index),
//  skip empty-roles templates, skip generated variants (.fill / .camp-). Run
//  from the repo root. Idempotent — re-run whenever templates change.
// ============================================================================

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROLES } from "./lib/roles.mjs";

const STATIC_DIR = "templates/multi-sport-foundations";
const MOTION_DIR = "brand/video-templates/templates";
const OUT = "templates/_role-index.json";
const ROLE_SET = new Set(ROLES);

const index = {};
let staticCount = 0, motionCount = 0, skipped = 0, errored = 0;

// ── Static bank: cluster-* AND fresh-e2e-* real configs; drop generated variants
function scanStatic() {
  if (!existsSync(STATIC_DIR)) return;
  for (const f of readdirSync(STATIC_DIR)) {
    if (!f.endsWith(".config.json")) continue;
    if (f.includes(".fill.") || f.includes(".camp-")) continue; // generated scratch
    const id = f.replace(/\.config\.json$/, "");
    try {
      const cfg = JSON.parse(readFileSync(join(STATIC_DIR, f), "utf8"));
      const els = (cfg.elements || []).filter((el) => el && ROLE_SET.has(el.role));
      const roles = [...new Set(els.map((el) => el.role))];
      if (!roles.length) { skipped++; continue; } // not role-ready yet
      // `accepts` = every role any slot can ALSO hold (so the planner can find a
      // template to hijack — e.g. a brand-lockup slot that accepts a hook/offer —
      // instead of over-rejecting to fresh). Native `roles` are still preferred.
      const accepts = [
        ...new Set(els.flatMap((el) => el.accepts || []).filter((r) => ROLE_SET.has(r))),
      ];
      index[id] = { format: "static", dir: STATIC_DIR, roles, accepts, slotCount: els.length };
      staticCount++;
    } catch (e) {
      errored++;
      console.error(`[index] skip (parse error): ${f} — ${e.message}`);
    }
  }
}

// ── Motion bank: roles live in each *_SPEC.fields[].role (quoted). Files with no
//    *_SPEC / no roles (most of the ~82) just yield [] → skipped, never crash.
function scanMotion() {
  if (!existsSync(MOTION_DIR)) return;
  for (const f of readdirSync(MOTION_DIR)) {
    if (!f.endsWith(".jsx")) continue;
    const id = f.replace(/\.jsx$/, "");
    try {
      const src = readFileSync(join(MOTION_DIR, f), "utf8");
      const roles = [
        ...new Set(
          [...src.matchAll(/"role"\s*:\s*"([A-Za-z]+)"/g)].map((m) => m[1]).filter((r) => ROLE_SET.has(r)),
        ),
      ];
      if (!roles.length) { skipped++; continue; } // not role-ready (no SPEC roles)
      index[id] = { format: "video", dir: MOTION_DIR, roles, slotCount: roles.length };
      motionCount++;
    } catch (e) {
      errored++;
      console.error(`[index] skip (read error): ${f} — ${e.message}`);
    }
  }
}

scanStatic();
scanMotion();

const payload = {
  generatedAt: new Date().toISOString(),
  note: "Role-index for playbook-driven template selection. Regenerate with: node scripts/build-template-index.mjs",
  templates: Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b))),
};
writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");

console.log(`[index] wrote ${OUT}: ${staticCount} static + ${motionCount} motion role-ready templates (${skipped} skipped roleless, ${errored} errored).`);

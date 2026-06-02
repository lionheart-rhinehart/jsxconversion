#!/usr/bin/env node
// Template contract validator — ENFORCED, not advisory.
//
// Run standalone:           node scripts/validate-templates.mjs
// Run for one template:     node scripts/validate-templates.mjs <name|path>
//
// Wired into the render pipeline (run-campaign validates each template before
// rendering and FAILS the asset on violation) and a git pre-commit hook, so a
// non-compliant template can neither be rendered nor committed.
//
// Rules:
//   1. NO raw <video> — background clips MUST use <SyncedVideo> or <TrimmedMedia>,
//      which the headless renderer captures deterministically (a raw <video> plays
//      on the wall clock during frame-by-frame capture → "hyperloop"/freeze).
//   2. EVERY template has an eyebrow — a `{ key:"eyebrow" }` (or role:"eyebrow")
//      SPEC field that is actually rendered (references data.eyebrow).

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const TEMPLATES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "brand", "video-templates", "templates");

export function validateTemplateSource(src, name) {
  const errs = [];

  // 1. Raw <video> — but <SyncedVideo>/<TrimmedMedia> are fine (those start with a capital after <).
  if (/<video[\s/>]/.test(src)) {
    errs.push("uses a raw <video> — use <SyncedVideo> or <TrimmedMedia> so the render stays deterministic (no hyperloop/freeze)");
  }

  // 2. Eyebrow: SPEC field present AND rendered.
  const at = src.indexOf("fields:");
  let hasField = false;
  if (at >= 0) {
    const open = src.indexOf("[", at);
    let depth = 0, end = -1;
    for (let i = open; i < src.length; i++) {
      if (src[i] === "[") depth++;
      else if (src[i] === "]") { if (--depth === 0) { end = i; break; } }
    }
    try {
      const fields = JSON.parse(src.slice(open, end + 1));
      hasField = Array.isArray(fields) && fields.some((f) => f && (f.key === "eyebrow" || f.role === "eyebrow"));
    } catch { /* unparseable spec → treated as missing below */ }
  }
  if (!hasField) {
    errs.push('has no eyebrow field — add { "key":"eyebrow", "role":"eyebrow", "label":"Eyebrow", "type":"text", "default":"…" } to the SPEC');
  }
  const rendersEyebrow = /<Eyebrow[\s>]/.test(src) || /<TplText[^>]*field=["']eyebrow["']/.test(src);
  if (!rendersEyebrow) {
    errs.push("does not render its eyebrow through the white-pill components — use <Eyebrow top={…}>{data.eyebrow ?? '{city name} SPORT PARENT'}</Eyebrow> (or <TplText field=\"eyebrow\">). Both render red text on a white background.");
  }

  return errs;
}

export function validateTemplateFile(path) {
  return validateTemplateSource(readFileSync(path, "utf8"), basename(path));
}

function main() {
  const arg = process.argv[2];
  let files;
  if (arg) {
    const p = existsSync(arg) ? arg : join(TEMPLATES_DIR, arg.endsWith(".jsx") ? arg : arg + ".jsx");
    if (!existsSync(p)) { console.error(`template not found: ${arg}`); process.exit(2); }
    files = [p];
  } else {
    files = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".jsx")).map((f) => join(TEMPLATES_DIR, f));
  }
  const failures = [];
  for (const f of files) {
    const errs = validateTemplateFile(f);
    if (errs.length) failures.push({ name: basename(f), errs });
  }
  if (failures.length) {
    console.error(`\n✗ template validation FAILED — ${failures.length}/${files.length} template(s):\n`);
    for (const { name, errs } of failures) {
      for (const e of errs) console.error(`  ✗ ${name}: ${e}`);
    }
    console.error("");
    process.exit(1);
  }
  console.log(`✓ all ${files.length} templates valid (no raw <video>, eyebrow present + rendered)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}

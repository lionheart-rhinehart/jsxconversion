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

  // 3. Brand red must FOLLOW THE ACTIVE KIT — a bare literal would ignore a
  //    franchisee's color. Allowed only as the fallback in the tokenized read
  //    `(window.__BRAND__ && window.__BRAND__.brand_red || '#c4141d')`.
  errs.push(...hardcodedRedErrors(src));

  return errs;
}

// Brand-red literals that are NOT the fallback of a window.__BRAND__ read. A new
// bank file with a bare `#c4141d` would silently render AA red under any brand —
// this rule makes tokenization non-optional. Shared by templates AND elements.
export function hardcodedRedErrors(src) {
  const errs = [];
  for (const [hex, token] of [["#c4141d", "brand_red"], ["#a30f17", "brand_red_deep"]]) {
    const re = new RegExp(`['"]${hex}['"]`, "gi");
    let m;
    while ((m = re.exec(src)) !== null) {
      const before = src.slice(Math.max(0, m.index - 48), m.index);
      if (!new RegExp(`${token}\\s*\\|\\|\\s*$`).test(before)) {
        errs.push(`hardcoded brand red ${hex} — read the active kit: (window.__BRAND__ && window.__BRAND__.${token} || '${hex}')`);
        break; // one report per color is enough
      }
    }
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
  // Also enforce the brand-red kit rule on ELEMENTS (full-suite run only) — they
  // aren't full templates (no eyebrow/SPEC) but must still follow the active kit.
  if (!arg) {
    const ELEMENTS_DIR = join(dirname(TEMPLATES_DIR), "elements");
    if (existsSync(ELEMENTS_DIR)) {
      for (const f of readdirSync(ELEMENTS_DIR).filter((n) => n.endsWith(".jsx"))) {
        const errs = hardcodedRedErrors(readFileSync(join(ELEMENTS_DIR, f), "utf8"));
        if (errs.length) failures.push({ name: `elements/${f}`, errs });
      }
    }
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

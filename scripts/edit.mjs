#!/usr/bin/env node
// ============================================================================
//  scripts/edit.mjs — open ANY template/creative in the detached editor.
// ============================================================================
//  "Plug literally anything into it": point this at a .jsx/.config.json (or a
//  bare template id) and it prints a ready-to-click editor URL — no campaign
//  required. If the file lives OUTSIDE the scanned template roots, it's added to
//  .editor-config.json's staticTemplateDirs; because the resolver reads that file
//  per-request, the already-running editor-server picks it up with NO restart.
//
//    npm run edit -- path/to/my-template.jsx
//    npm run edit -- my-template          (a bare id already in a root)
//
//  Requires the dev servers to be up (npm run dev). NODE-ONLY.
// ============================================================================
import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { resolve, join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { STATIC_ROOTS, findTemplate } from "./lib/template-roots.mjs";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const arg = process.argv[2];
if (!arg) {
  console.error("usage: npm run edit -- <path-to-.jsx/.config.json | template-id>");
  process.exit(1);
}

// Derive the template id + its folder from either a file path or a bare id.
let id, dir;
if (existsSync(arg) && /\.(jsx|json)$/i.test(arg)) {
  const abs = resolve(arg);
  id = basename(abs).replace(/\.config\.json$/i, "").replace(/\.jsx$/i, "");
  dir = dirname(abs);
} else {
  id = arg;
  const f = findTemplate(id);
  if (f) dir = f.dir;
}
if (!id || !dir) {
  console.error(`could not resolve a template from: ${arg}`);
  console.error("pass a path to a .jsx/.config.json, or an id that already lives in a template root.");
  process.exit(1);
}

// Collision (M1): if this id already resolves to a DIFFERENT dir, the new file
// must win — prepend its dir so findTemplate (first-root-wins) picks it.
const existing = findTemplate(id);
const collision = existing && resolve(existing.dir) !== resolve(dir);
const already = STATIC_ROOTS().some((r) => resolve(r) === resolve(dir));

if (!already) {
  // Atomic merge into .editor-config.json (H2): read-modify-write to a temp file
  // then rename, preserving any other keys (e.g. campaignTemplateDirs).
  const cfgPath = join(PROJECT_ROOT, ".editor-config.json");
  let cfg = {};
  try { if (existsSync(cfgPath)) cfg = JSON.parse(readFileSync(cfgPath, "utf8")) || {}; } catch (_) {}
  const roots = Array.isArray(cfg.staticTemplateDirs) ? cfg.staticTemplateDirs : [];
  const rel = dir.startsWith(PROJECT_ROOT) ? dir.slice(PROJECT_ROOT.length + 1) : dir;
  if (!roots.some((r) => resolve(join(PROJECT_ROOT, r)) === resolve(dir))) {
    if (collision) {
      roots.unshift(rel);
      console.warn(`! "${id}" also exists in another root — prepended ${rel} so this file wins.`);
    } else {
      roots.push(rel);
    }
    cfg.staticTemplateDirs = roots;
    const tmp = cfgPath + ".tmp";
    writeFileSync(tmp, JSON.stringify(cfg, null, 2) + "\n");
    renameSync(tmp, cfgPath);
    console.log(`+ added template root: ${rel}`);
  }
}

// Editor port: reuse run-campaign's reader pattern (this workspace's .dev-ports.json).
let port = 5173;
try {
  const f = join(PROJECT_ROOT, ".dev-ports.json");
  if (existsSync(f)) port = JSON.parse(readFileSync(f, "utf8")).editor || 5173;
  else console.warn("! .dev-ports.json missing — is `npm run dev` running?");
} catch (_) {}

console.log(`\nopen:  http://localhost:${port}/editor#${id}\n`);
console.log("(if the link 404s, the dev server isn't running or restarted on a new port — run `npm run dev`)");

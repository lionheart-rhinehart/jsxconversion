// ============================================================================
//  scripts/lib/template-roots.mjs — single source of "where templates live".
// ============================================================================
//  The editor used to hard-code ONE static-template folder
//  (templates/multi-sport-foundations) in ~18 places, so any template built
//  OUTSIDE it was invisible to the editor. This module replaces that constant:
//  it resolves a template id to whichever ROOT actually holds it, so a fresh
//  `<id>.config.json` + `<id>.jsx` dropped into ANY `templates/<folder>/` just
//  works — nothing pinned to one campaign.
//
//  Imported by editor-server (preview), run-campaign (render), AND validate-plan
//  (the compliance gate). Because a module-load throw would take down the server
//  on boot, EVERY filesystem op here is LAZY (per-call, never at import) and
//  wrapped in try/catch — a missing templates/ or a half-written .editor-config
//  yields []/empty, never an exception. (H2/H3.)
//
//  Resolution order for a root list (STATIC_ROOTS):
//    1. EDITOR_TEMPLATE_DIRS env (comma/semicolon list)         — power-user override
//    2. .editor-config.json `campaignTemplateDirs[<campaign>]`  — per-brand banks (4b)
//    3. .editor-config.json `staticTemplateDirs`                — global extra roots
//    4. subdirs of templates/ that hold a *.config.json         — the default scan
//    5. templates/ itself if it holds top-level configs
//    6. templates/multi-sport-foundations                       — back-compat shim (C1):
//       still referenced by live location campaigns, so it stays in the scan.
//
//  Config is read FRESH each call so scripts/edit.mjs can add a root to an
//  already-running editor-server with no restart.
//  NODE-ONLY.
// ============================================================================
import { readdirSync, existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the checkout root from THIS file's location (scripts/lib/) so resolution
// is correct regardless of the caller's cwd — matches validate-plan.mjs's pattern.
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TEMPLATES_PARENT = join(PROJECT_ROOT, "templates");
const CONFIG_FILE = join(PROJECT_ROOT, ".editor-config.json");
const LEGACY = join(TEMPLATES_PARENT, "multi-sport-foundations");

// Read the machine-local config. Absent/corrupt/half-written → {} (never throws).
function readConfig() {
  try {
    return existsSync(CONFIG_FILE)
      ? (JSON.parse(readFileSync(CONFIG_FILE, "utf8")) || {})
      : {};
  } catch {
    return {};
  }
}

function dirHasConfig(dir) {
  try {
    return readdirSync(dir).some((f) => f.endsWith(".config.json"));
  } catch {
    return false;
  }
}

// Ordered, de-duped absolute roots. `campaign` is OPTIONAL (M4): when given, that
// brand's banks are checked FIRST so it can override a shared template by name.
export function STATIC_ROOTS(campaign) {
  const out = [];
  const push = (d) => {
    if (!d) return;
    const a = resolve(d);
    if (a && !out.includes(a)) out.push(a);
  };
  const cfg = readConfig();

  // 1. env override
  const env = process.env.EDITOR_TEMPLATE_DIRS;
  if (env) for (const d of env.split(/[;,]/).map((s) => s.trim()).filter(Boolean)) push(d);

  // 2. per-campaign banks (4b) — first so a brand override wins on a name collision
  if (campaign && cfg.campaignTemplateDirs && Array.isArray(cfg.campaignTemplateDirs[campaign]))
    for (const d of cfg.campaignTemplateDirs[campaign]) push(join(PROJECT_ROOT, d));

  // 3. global extra roots
  if (Array.isArray(cfg.staticTemplateDirs))
    for (const d of cfg.staticTemplateDirs) push(join(PROJECT_ROOT, d));

  // 4. default scan: subdirs of templates/ holding a *.config.json
  try {
    for (const name of readdirSync(TEMPLATES_PARENT)) {
      if (name.startsWith("_") || name === "audio-picker") continue; // skip index/example/picker dirs
      const d = join(TEMPLATES_PARENT, name);
      try {
        if (statSync(d).isDirectory() && dirHasConfig(d)) push(d);
      } catch {
        /* unreadable entry — skip */
      }
    }
  } catch {
    /* templates/ missing — fall through */
  }

  // 5. templates/ itself (flat configs)
  if (dirHasConfig(TEMPLATES_PARENT)) push(TEMPLATES_PARENT);

  // 6. back-compat shim (C1): the multisport bank is still referenced by live
  //    location campaigns (grind-trap-*, more-games-*), so keep it in the scan.
  if (existsSync(LEGACY)) push(LEGACY);

  return out;
}

// Resolve an id → { dir, configPath, jsxPath } from the first root that holds
// `<id>.config.json`, or NULL if none (C4 — callers MUST null-guard). Never throws.
// Rejects ids with path separators or `..` so a crafted id can't traverse out.
export function findTemplate(id, campaign) {
  if (!id || typeof id !== "string" || /[\\/]|\.\./.test(id)) return null;
  for (const dir of STATIC_ROOTS(campaign)) {
    const configPath = join(dir, `${id}.config.json`);
    if (existsSync(configPath)) {
      return { dir, configPath, jsxPath: join(dir, `${id}.jsx`) };
    }
  }
  return null;
}

// The assets/ dir SIBLING to a template's config (where the static renderer copies
// media from). NULL when the id is unresolved.
export function assetsDirFor(id, campaign) {
  const f = findTemplate(id, campaign);
  return f ? join(f.dir, "assets") : null;
}

// De-duped union of template ids across all roots. Sort: cluster-N numerically
// FIRST (so cluster-2 < cluster-10), then every other id alphabetically (H4 —
// parseInt on a non-cluster id is NaN and corrupts a naive numeric comparator).
export function listTemplates(campaign) {
  const ids = new Set();
  for (const dir of STATIC_ROOTS(campaign)) {
    let files = [];
    try {
      files = readdirSync(dir);
    } catch {
      continue;
    }
    for (const f of files) {
      const m = f.match(/^(.+)\.config\.json$/);
      if (m) ids.add(m[1]);
    }
  }
  const num = (s) => {
    const m = s.match(/^cluster-(\d+)$/);
    return m ? parseInt(m[1], 10) : null;
  };
  return [...ids].sort((a, b) => {
    const na = num(a), nb = num(b);
    if (na !== null && nb !== null) return na - nb;
    if (na !== null) return -1;
    if (nb !== null) return 1;
    return a.localeCompare(b);
  });
}

// ============================================================================
//  creative-editor/template-roots.mjs — generic template resolver FACTORY.
// ============================================================================
//  Host-agnostic version of the AA scripts/lib/template-roots.mjs. A host calls
//  createTemplateRoots({ dirs }) and passes the result to createEditorServer as
//  `config.templateRoots`. Every id resolves to whichever configured root holds
//  `<id>.config.json` — so dropping a template into any of those dirs makes it
//  appear. NEVER throws (missing dir → skipped). NODE-ONLY.
//
//  A host may instead supply its OWN object with the same four methods
//  (STATIC_ROOTS, findTemplate, listTemplates, assetsDirFor) — e.g. AA passes its
//  campaign-aware resolver directly.
// ============================================================================
import { readdirSync, existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

// dirs: array of absolute (or cwd-relative) directories to scan for *.config.json.
// scanSubdirs: when true, also include immediate subdirs of each dir that hold a
//   *.config.json (so `templates/<folder>/` layouts work without listing each).
export function createTemplateRoots({ dirs = [], scanSubdirs = true } = {}) {
  const base = dirs.map((d) => resolve(d));

  const dirHasConfig = (dir) => {
    try { return readdirSync(dir).some((f) => f.endsWith(".config.json")); }
    catch { return false; }
  };

  const STATIC_ROOTS = () => {
    const out = [];
    const push = (d) => { const a = resolve(d); if (a && !out.includes(a)) out.push(a); };
    for (const d of base) {
      if (dirHasConfig(d)) push(d);
      if (scanSubdirs) {
        try {
          for (const name of readdirSync(d)) {
            if (name.startsWith("_")) continue;
            const sub = join(d, name);
            try { if (statSync(sub).isDirectory() && dirHasConfig(sub)) push(sub); } catch {}
          }
        } catch {}
      }
    }
    return out;
  };

  const findTemplate = (id) => {
    if (!id || typeof id !== "string" || /[\\/]|\.\./.test(id)) return null;
    for (const dir of STATIC_ROOTS()) {
      const configPath = join(dir, `${id}.config.json`);
      if (existsSync(configPath)) return { dir, configPath, jsxPath: join(dir, `${id}.jsx`) };
    }
    return null;
  };

  const assetsDirFor = (id) => {
    const f = findTemplate(id);
    return f ? join(f.dir, "assets") : null;
  };

  const listTemplates = () => {
    const ids = new Set();
    for (const dir of STATIC_ROOTS()) {
      let files = [];
      try { files = readdirSync(dir); } catch { continue; }
      for (const f of files) { const m = f.match(/^(.+)\.config\.json$/); if (m) ids.add(m[1]); }
    }
    const num = (s) => { const m = s.match(/^cluster-(\d+)$/); return m ? parseInt(m[1], 10) : null; };
    return [...ids].sort((a, b) => {
      const na = num(a), nb = num(b);
      if (na !== null && nb !== null) return na - nb;
      if (na !== null) return -1;
      if (nb !== null) return 1;
      return a.localeCompare(b);
    });
  };

  return { STATIC_ROOTS, findTemplate, listTemplates, assetsDirFor };
}

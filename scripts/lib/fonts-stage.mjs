// ============================================================================
//  scripts/lib/fonts-stage.mjs — make FONTS follow the active brand kit
// ============================================================================
//  The strict font preflight (jsx-to-mp4/scripts/fonts.mjs) resolves a family
//  from `<projectDir>/fonts/<Family>/` BEFORE the repo-level `fonts/`. So to make
//  a creative render in a franchisee's typeface WITHOUT editing any template,
//  element, config, or the renderer, we stage the kit's font FILES under the
//  bank family names ("Anton"/"Geist"/"JetBrains_Mono") in the render projectDir
//  for the duration of the run, then remove them. Every `fontFamily:'Anton'`
//  reference (templates AND all elements AND configs) then renders the kit's
//  display face; same for body/mono. AA (and any brand that keeps the bank
//  fonts) declares no font_files → this is a no-op → 0-diff.
// ============================================================================

import { existsSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { join, basename } from "node:path";

// Kit font ROLE → the bank family-dir name the templates/configs reference.
// (slug form: the preflight maps "JetBrains Mono" → "JetBrains_Mono".)
const ROLE_TO_BANK_FAMILY = { display: "Anton", body: "Geist", mono: "JetBrains_Mono" };

// Stage a kit's custom font files under the bank family names in each render
// projectDir. Returns cleanup() removing exactly what was staged. Throws (after
// cleaning up partial staging) if a declared font file is missing.
export function stageKitFonts({ brandFile, projectRoot, projectDirs }) {
  const ff = (brandFile && brandFile.font_files) || {};
  const staged = [];
  const cleanup = () => { for (const d of staged) rmSync(d, { recursive: true, force: true }); };
  try {
    for (const [role, family] of Object.entries(ROLE_TO_BANK_FAMILY)) {
      const rel = ff[role];
      if (!rel) continue; // role keeps the bank font
      const srcFile = join(projectRoot, rel);
      if (!existsSync(srcFile)) throw new Error(`kit font_files.${role} not found: ${srcFile}`);
      for (const pd of projectDirs) {
        const destDir = join(pd, "fonts", family);
        if (existsSync(destDir)) continue; // never clobber a real shipped font dir
        mkdirSync(destDir, { recursive: true });
        copyFileSync(srcFile, join(destDir, basename(srcFile)));
        staged.push(destDir);
      }
    }
  } catch (e) {
    cleanup();
    throw e;
  }
  return cleanup;
}

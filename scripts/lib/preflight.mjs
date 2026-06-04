// ============================================================================
//  scripts/lib/preflight.mjs — render-env preflight (the "20 min of nothing" gate)
// ============================================================================
//  A campaign render touches four external things: React's UMD builds (loaded by
//  the static + motion renderers from node_modules), a puppeteer browser, ffmpeg
//  (video/gif/poster frames + bg-frame extraction), and brand fonts. A git
//  worktree gets its OWN gitignored node_modules (NOT auto-installed) and the
//  cloud session installs ffmpeg/chromium in a session hook — so any of the four
//  can be silently absent, and without this gate the FIRST and EVERY asset fails
//  with an opaque "exit 1" after a whole batch has churned.
//
//  checkRenderEnv() is PURE (takes already-probed facts) so it is unit-testable
//  without a real environment; run-campaign.mjs does the actual probing and hands
//  the results in. Hard problems → caller exits nonzero with ONE actionable line;
//  fonts not shipped locally are a WARNING only (the per-render strict font
//  preflight in jsx-to-mp4 is the real gate, and it can still fetch from Google).
// ============================================================================

import { existsSync } from "node:fs";
import { join } from "node:path";

// The bank's primary families (must be shipped under <root>/fonts/<Family>/ for an
// offline/cloud render not to depend on a Google Fonts round-trip).
export const REQUIRED_FONT_FAMILIES = ["Anton", "Geist", "JetBrains_Mono"];

// React UMD builds the renderers load directly from node_modules.
const REACT_UMD = [
  "node_modules/react/umd/react.production.min.js",
  "node_modules/react-dom/umd/react-dom.production.min.js",
];

// Pure check. Inputs are facts the caller probes:
//   projectRoot   — the checkout being rendered from
//   ffmpegOk      — boolean | undefined (undefined = "not probed, skip")
//   browserPath   — string | null | undefined (the resolved puppeteer browser exe;
//                   null/missing = not installed; undefined = "not probed, skip")
//   fontFamilies  — families to verify are shipped under fonts/<Family>/
// Returns { ok, problems:[...], warnings:[...] }.
export function checkRenderEnv({ projectRoot, ffmpegOk, browserPath, fontFamilies = REQUIRED_FONT_FAMILIES } = {}) {
  const problems = [];
  const warnings = [];
  const root = projectRoot || ".";

  for (const rel of REACT_UMD) {
    if (!existsSync(join(root, rel))) problems.push(`render dependency missing: ${rel}`);
  }

  if (!existsSync(join(root, "node_modules/puppeteer"))) {
    problems.push("render dependency missing: node_modules/puppeteer");
  } else if (browserPath !== undefined) {
    // Only assert the browser binary when the caller actually probed for it.
    if (!browserPath || !existsSync(browserPath)) {
      problems.push("puppeteer browser not installed (run: npx puppeteer browsers install chrome)");
    }
  }

  if (ffmpegOk === false) {
    problems.push("ffmpeg not on PATH (video/gif/poster frames + bg-frame extraction need it)");
  }

  for (const fam of fontFamilies || []) {
    if (!existsSync(join(root, "fonts", fam))) {
      warnings.push(`brand font not shipped locally: fonts/${fam}/ (renderer will try Google Fonts)`);
    }
  }

  return { ok: problems.length === 0, problems, warnings };
}

// One actionable line (+ bullet detail) for a failed check.
export function formatRenderEnvError(result) {
  const first = result.problems[0] || "render environment not ready";
  const head = `render env not ready — ${result.problems.length} problem(s): ${first}`;
  const fix = "Fix: run `npm install` (and, if the browser is missing, `npx puppeteer browsers install chrome`) in THIS checkout; ensure ffmpeg is on PATH. Git worktrees have their own node_modules (gitignored, not auto-created).";
  const bullets = result.problems.map((p) => `             • ${p}`).join("\n");
  return { head, fix, bullets };
}

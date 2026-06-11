#!/usr/bin/env node
// ============================================================================
//  scripts/westfield-flatten-gallery.mjs — (re)build the runnable Campaign C
//  gallery from the kept Claude Design source, with edit-in-editor wiring.
// ----------------------------------------------------------------------------
//  Turns "Westfield Campaign C.dc.html" (the Claude Design handoff) into a
//  standalone, browser-openable index.html: hoists <helmet> into <head>, the
//  <x-dc> body into <body>, and converts the dc-script (componentDidMount) to a
//  plain DOMContentLoaded script (no support.js / DCLogic). THEN appends the
//  "edit-in-editor" wiring: clicking any creative opens its layered template in
//  the AA position editor (#wf-<label>); a small caption button keeps the old
//  full-size lightbox preview.
//  NODE-ONLY.  Run:  node scripts/westfield-flatten-gallery.mjs
// ============================================================================
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Reusable for ANY handoff:
//   --campaign <slug>   campaign folder under campaigns/ (default: westfield-100-off)
//   --src "<.dc.html>"  the chosen Claude Design file inside that folder (default:
//                       "Westfield Campaign C.dc.html"). `--src` may be a bare
//                       filename (resolved inside the campaign dir) or a full path.
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const CAMPAIGN = arg("--campaign", "westfield-100-off");
const DIR = join(ROOT, "campaigns", CAMPAIGN);
const srcArg = arg("--src", "Westfield Campaign C.dc.html");
const SRC = srcArg.includes("/") || srcArg.includes("\\") ? resolve(srcArg) : join(DIR, srcArg);
const OUT = join(DIR, "index.html");
const s = readFileSync(SRC, "utf8");

const between = (str, a, b) => {
  const i = str.indexOf(a); if (i < 0) throw new Error("missing " + a);
  const j = str.indexOf(b, i + a.length); if (j < 0) throw new Error("missing " + b);
  return str.slice(i + a.length, j);
};

const helmet = between(s, "<helmet>", "</helmet>").trim();
const afterHelmet = s.indexOf("</helmet>") + "</helmet>".length;
const thumbIdx = s.indexOf('<template id="__bundler_thumbnail"');
const body = s.slice(afterHelmet, thumbIdx).trim();
// strip componentDidMount's own trailing close brace so it doesn't unbalance the wrapper
let cdm = between(s, "componentDidMount() {", "\n  renderVals()").replace(/\s*\}\s*$/, "\n");

// ── edit-in-editor wiring, appended INSIDE the cdm scope so it can reuse the
//    lightbox `open(i)` + `cards` defined above. Click a creative → open its
//    layered template in the editor; "⤢ preview" button → the old lightbox.
cdm += `
    // ===== Edit-in-editor wiring (AA) =====================================
    // Each creative maps to a layered template wf-<label> in
    // templates/westfield-100-off/. Clicking the card opens it in the position
    // editor (start it with: npm run dev). Change EDITOR_BASE if your editor
    // runs on a different port (see .dev-ports.json).
    const EDITOR_BASE = 'http://localhost:5173';
    cards.forEach((card, i) => {
      const m = (card.getAttribute('data-label') || '').match(/^([0-9]+[A-C])/);
      const tid = m ? 'wf-' + m[1] : null;
      if (!tid) return;
      card.title = 'Click to edit ' + tid + ' in the editor';
      // capture-phase: open the editor and suppress the lightbox click — but let
      // clicks on the preview button (or any button) fall through to themselves.
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        e.stopImmediatePropagation();
        e.preventDefault();
        window.open(EDITOR_BASE + '/#' + tid, 'aa-editor');
      }, true);
      const cap = card.querySelector('figcaption');
      if (cap) {
        cap.style.flexWrap = 'wrap';
        const b = document.createElement('button');
        b.textContent = '⤢ preview';
        b.style.cssText = 'margin-left:auto;font-family:\\'JetBrains Mono\\',monospace;font-size:12px;color:#c2c6cd;background:#15171a;border:1px solid #2c3038;border-radius:999px;padding:5px 12px;cursor:pointer;';
        b.addEventListener('click', (e) => { e.stopImmediatePropagation(); e.preventDefault(); open(i); }, true);
        cap.appendChild(b);
      }
    });
`;

const out = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Westfield Founding Member — Campaign C</title>
<!-- Athletes Acceleration · Westfield $100-off · the fully motion-designed cut (36 creatives).
     Standalone build of "Westfield Campaign C.dc.html": Claude Design's support.js runtime
     replaced with the plain DOM/rAF logic below so it opens in any browser. Clicking a
     creative opens its layered template in the AA editor (see the wiring at the end). -->
${helmet}
</head>
<body>
${body}
<script>
document.addEventListener('DOMContentLoaded', function () {
${cdm}
});
</script>
</body>
</html>
`;
writeFileSync(OUT, out);
console.log("wrote", OUT, "(" + out.length + " bytes)");
console.log("cr-card figures:", (out.match(/class="cr-card"/g) || []).length);
console.log("editor wiring present:", out.includes("EDITOR_BASE"));

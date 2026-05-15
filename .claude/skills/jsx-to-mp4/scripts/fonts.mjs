// Font policy: never silently fall back to a system font.
// 1. Scan the JSX for `fontFamily: '<list>'` declarations.
// 2. For each primary (non-generic) font, ensure fonts/<slug>/font.css +
//    .ttf files exist on disk. If missing, fetch from Google Fonts and
//    cache locally.
// 3. Emit a combined @font-face stylesheet the renderer can <link> into
//    the page so Chromium loads the exact glyphs the design was authored
//    against.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = resolve(__dirname, "..");
const PROJECT_ROOT = resolve(SKILL_ROOT, "../../..");
const FONTS_DIR = join(PROJECT_ROOT, "fonts");

const CSS_GENERIC = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "ui-rounded",
  "math",
  "emoji",
  "fangsong",
  "inherit",
  "initial",
  "unset",
  "revert",
]);

// User-Agent that triggers Google Fonts to serve TTF (broader Chromium
// compatibility than woff2 served to modern UAs, and unambiguous to parse).
const LEGACY_UA =
  "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.0.0 Safari/537.36";

export function detectFonts(src) {
  const fonts = new Set();
  // Match the outer string; allow nested quote characters of the other style
  // (`'Anton, "Archivo Black", sans-serif'` is a common pattern).
  const re = /fontFamily\s*:\s*(['"`])((?:(?!\1).)*)\1/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const list = m[2];
    for (const raw of list.split(",")) {
      const name = raw.trim().replace(/^["']|["']$/g, "");
      if (!name) continue;
      if (CSS_GENERIC.has(name.toLowerCase())) continue;
      // Vendor-prefixed system fonts (-apple-system, -webkit-pictograph, etc.)
      // are OS-supplied and never live on Google Fonts.
      if (name.startsWith("-")) continue;
      // BlinkMacSystemFont is a Chromium system-font keyword, not a Google Font.
      if (name.toLowerCase() === "blinkmacsystemfont") continue;
      fonts.add(name);
    }
  }
  return [...fonts];
}

function slug(name) {
  return name.replace(/\s+/g, "_");
}

async function fetchGoogleFontsCss(familyParam) {
  // family=Anton:wght@400;700 — caller passes the exact param value
  const url = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`;
  const res = await fetch(url, { headers: { "User-Agent": LEGACY_UA } });
  if (!res.ok) {
    throw new Error(
      `Google Fonts CSS fetch failed for "${familyParam}": ${res.status} ${res.statusText}`,
    );
  }
  return await res.text();
}

async function downloadBinary(url, destPath) {
  const res = await fetch(url, { headers: { "User-Agent": LEGACY_UA } });
  if (!res.ok) {
    throw new Error(`font binary fetch failed: ${url} -> ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(destPath, buf);
}

// For each font, download all CSS-referenced files and rewrite the
// @font-face src URLs to point at the local copies.
export async function ensureFont(name) {
  const fontDir = join(FONTS_DIR, slug(name));
  const cssPath = join(fontDir, "font.css");
  if (existsSync(cssPath)) {
    return { name, dir: fontDir, css: readFileSync(cssPath, "utf8") };
  }

  console.error(`[fonts] downloading "${name}"`);
  mkdirSync(fontDir, { recursive: true });

  const familyParam = name.replace(/\s+/g, "+");
  // Request a few common weights so the design has options.
  const variantParam = `${familyParam}:wght@400;700`;
  let css;
  try {
    css = await fetchGoogleFontsCss(variantParam);
  } catch {
    // Some fonts have no weight axis — retry plain.
    css = await fetchGoogleFontsCss(familyParam);
  }

  const urlRe = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
  let rewritten = css;
  const seen = new Set();
  let m;
  while ((m = urlRe.exec(css)) !== null) {
    const remote = m[1];
    if (seen.has(remote)) continue;
    seen.add(remote);
    const ext = (remote.match(/\.(ttf|woff2|woff|otf)(\?|$)/) || [])[1] || "ttf";
    const fname = `${slug(name)}_${seen.size}.${ext}`;
    const dest = join(fontDir, fname);
    await downloadBinary(remote, dest);
    rewritten = rewritten.split(remote).join(`./${fname}`);
  }

  writeFileSync(cssPath, rewritten);
  return { name, dir: fontDir, css: rewritten };
}

// Ensure every detected font is on disk; return a combined stylesheet
// string (with @font-face src URLs rewritten to absolute file paths) so
// the caller can write it wherever it needs.
export async function ensureFontsForFile(jsxPath) {
  const src = readFileSync(jsxPath, "utf8");
  const fonts = detectFonts(src);
  if (fonts.length === 0) return { fonts: [], css: "" };

  if (!existsSync(FONTS_DIR)) mkdirSync(FONTS_DIR, { recursive: true });

  const blocks = [];
  for (const name of fonts) {
    const { dir, css } = await ensureFont(name);
    const rewritten = css.replace(/url\(\.\/([^)]+)\)/g, (_, f) =>
      `url(${join(dir, f)})`,
    );
    blocks.push(`/* ${name} */\n${rewritten}`);
  }

  return { fonts, css: blocks.join("\n\n") };
}

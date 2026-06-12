import { readFileSync } from "node:fs";

const REMOTION_HINTS = [
  /from\s+["']remotion["']/,
  /<Composition\b/,
  /useCurrentFrame\s*\(/,
  /useVideoConfig\s*\(/,
];

const CLAUDE_DESIGN_HINTS = [
  /<Stage\b/,
  /<Sprite\b/,
  /useSprite\s*\(/,
  /\buseTime\s*\(/,
];

const ANIMATION_HINTS = [
  /from\s+["']framer-motion["']/,
  /from\s+["']@react-spring/,
  /from\s+["']gsap["']/,
  /requestAnimationFrame\s*\(/,
  /setInterval\s*\(/,
  /setTimeout\s*\(/,
  /@keyframes\b/,
  /\banimation\s*:/,
  /animate=\{/,
  /transition=\{/,
  /<motion\./,
];

export function classify(filePath) {
  const src = readFileSync(filePath, "utf8");

  if (CLAUDE_DESIGN_HINTS.some((re) => re.test(src))) return "claude-design";
  if (REMOTION_HINTS.some((re) => re.test(src))) return "remotion";
  if (ANIMATION_HINTS.some((re) => re.test(src))) return "animated";
  return "static";
}

export function extractConstants(filePath) {
  const src = readFileSync(filePath, "utf8");
  const grab = (name) => {
    const reExport = new RegExp(
      `export\\s+const\\s+${name}\\s*(?::\\s*[^=]+)?=\\s*([0-9.]+)`,
    );
    const reConst = new RegExp(`\\bconst\\s+${name}\\s*=\\s*([0-9.]+)`);
    const m = src.match(reExport) || src.match(reConst);
    return m ? Number(m[1]) : undefined;
  };
  const out = {};
  for (const k of ["DURATION_SECONDS", "FPS", "WIDTH", "HEIGHT"]) {
    const v = grab(k);
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export function extractCompositionProps(filePath) {
  const src = readFileSync(filePath, "utf8");
  const block = src.match(/<Composition\b[^>]*>/);
  if (!block) return {};
  const grab = (name) => {
    const re = new RegExp(`${name}=\\{?\\s*([0-9.]+)\\s*\\}?`);
    const m = block[0].match(re);
    return m ? Number(m[1]) : undefined;
  };
  const durationInFrames = grab("durationInFrames");
  const fps = grab("fps");
  const width = grab("width");
  const height = grab("height");
  const out = {};
  if (fps !== undefined) out.FPS = fps;
  if (width !== undefined) out.WIDTH = width;
  if (height !== undefined) out.HEIGHT = height;
  if (durationInFrames !== undefined && fps !== undefined) {
    out.DURATION_SECONDS = durationInFrames / fps;
  }
  return out;
}

// Build a map of top-level `const NAME = <number>` (and chained
// `const A = 1, B = 2`) declarations so JSX props that reference identifiers
// (e.g. `width={VA_W}`) can be resolved to numbers.
function topLevelNumericConsts(src) {
  const map = {};
  const re = /\bconst\s+([^;]+);/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const body = m[1];
    // Split on commas that aren't inside braces/brackets/parens.
    const parts = [];
    let depth = 0,
      start = 0;
    for (let i = 0; i < body.length; i++) {
      const c = body[i];
      if (c === "{" || c === "[" || c === "(") depth++;
      else if (c === "}" || c === "]" || c === ")") depth--;
      else if (c === "," && depth === 0) {
        parts.push(body.slice(start, i));
        start = i + 1;
      }
    }
    parts.push(body.slice(start));
    for (const part of parts) {
      const am = part.match(/^\s*([A-Za-z_$][\w$]*)\s*=\s*(-?[0-9.]+)\s*$/);
      if (am) map[am[1]] = Number(am[2]);
    }
  }
  return map;
}

// For Claude Design files: read width/height/duration off the <Stage> tag,
// and find the component name registered to window.
export function extractStageProps(filePath) {
  const src = readFileSync(filePath, "utf8");
  const block = src.match(/<Stage\b[^>]*>/);
  const out = {};
  if (!block) return out;

  const consts = topLevelNumericConsts(src);

  const grab = (name) => {
    // Literal: width={1080} or width=1080
    const litRe = new RegExp(`${name}=\\{?\\s*(-?[0-9.]+)\\s*\\}?`);
    const lm = block[0].match(litRe);
    if (lm) return Number(lm[1]);
    // Identifier: width={VA_W}
    const idRe = new RegExp(`${name}=\\{\\s*([A-Za-z_$][\\w$]*)\\s*\\}`);
    const im = block[0].match(idRe);
    if (im && consts[im[1]] !== undefined) return consts[im[1]];
    return undefined;
  };

  const w = grab("width"),
    h = grab("height"),
    d = grab("duration");
  if (w !== undefined) out.WIDTH = w;
  if (h !== undefined) out.HEIGHT = h;
  if (d !== undefined) out.DURATION_SECONDS = d;
  return out;
}

export function extractWindowComponentName(filePath) {
  const src = readFileSync(filePath, "utf8");
  const m = src.match(/window\.([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)/);
  if (m && m[1] === m[2]) return m[1];
  return m ? m[1] : null;
}

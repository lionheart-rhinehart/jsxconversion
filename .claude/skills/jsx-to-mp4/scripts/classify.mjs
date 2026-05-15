import { readFileSync } from "node:fs";

const REMOTION_HINTS = [
  /from\s+["']remotion["']/,
  /<Composition\b/,
  /useCurrentFrame\s*\(/,
  /useVideoConfig\s*\(/,
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

  if (REMOTION_HINTS.some((re) => re.test(src))) return "remotion";
  if (ANIMATION_HINTS.some((re) => re.test(src))) return "animated";
  return "static";
}

export function extractConstants(filePath) {
  const src = readFileSync(filePath, "utf8");
  const grab = (name) => {
    const re = new RegExp(
      `export\\s+const\\s+${name}\\s*(?::\\s*[^=]+)?=\\s*([0-9.]+)`,
    );
    const m = src.match(re);
    return m ? Number(m[1]) : undefined;
  };
  return {
    DURATION_SECONDS: grab("DURATION_SECONDS"),
    FPS: grab("FPS"),
    WIDTH: grab("WIDTH"),
    HEIGHT: grab("HEIGHT"),
  };
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

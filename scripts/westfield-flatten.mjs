#!/usr/bin/env node
// ============================================================================
//  scripts/westfield-flatten.mjs — turn the baked Westfield Campaign C gallery
//  into editor-native layered templates.
// ----------------------------------------------------------------------------
//  Each of the 36 creatives in campaigns/westfield-100-off/index.html is one
//  <div class="cr-frame"> authored at native 1080x1920 (scaled down only for the
//  gallery grid). This loads the gallery in headless Chrome, FREEZES every CSS
//  animation to its 0%/base state (the designs are "first-frame-safe", so 0% IS
//  the finished ad), then walks each frame's DOM reading the REAL position +
//  computed style of every visible leaf — and emits a LayerStack config:
//
//    { width, height, background, media, fixedDesign[], elements[] }
//
//  z is the DOM/paint order (explicit on every item) so shapes and text
//  interleave exactly as authored. Output:
//    templates/westfield-100-off/wf-<label>.config.json  (+ a thin .jsx shell)
//
//  Usage:
//    node scripts/westfield-flatten.mjs 1A        # one cell (proof)
//    node scripts/westfield-flatten.mjs --all     # all 36
//  NODE-ONLY.
// ============================================================================
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const argv = process.argv.slice(2);
const ALL = argv.includes("--all");
// --campaign <slug> makes this reusable for ANY handoff (default: westfield-100-off).
const campIdx = argv.indexOf("--campaign");
const CAMPAIGN = campIdx >= 0 ? argv[campIdx + 1] : "westfield-100-off";
const GALLERY = join(ROOT, "campaigns", CAMPAIGN, "index.html");
const OUT_DIR = join(ROOT, "templates", CAMPAIGN);
// positional arg (not a flag, not the --campaign value) = a single cell filter, e.g. "1A"
const ONLY = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--campaign");

// ── the in-page extractor (runs in the browser) ────────────────────────────
// Returns an array of { id, config } — one per cr-card.
function extractAll() {
  const FRAME_W = 1080, FRAME_H = 1920;
  const cards = Array.from(document.querySelectorAll(".cr-card"));

  // path after "/assets/" → "./assets/..." so it resolves against the template dir
  const relAsset = (url) => {
    if (!url) return null;
    const m = /\/assets\/(.+?)(\?|$)/.exec(url);
    return m ? "./assets/" + m[1] : null;
  };
  const transparent = (c) =>
    !c || c === "transparent" || c === "rgba(0, 0, 0, 0)" || /,\s*0\)$/.test(c.replace(/\s/g, ""));
  const round = (n) => Math.round(n * 100) / 100;

  // ── Motion capture (so designs stay ANIMATED + editable) ───────────────────
  // The gallery applies ALL motion INLINE (animation shorthand + @keyframes in
  // <head>), so reading child.style.* is unaffected by the geometry freeze.
  // Harvest the whole @keyframes library once (shared across cells).
  let keyframesCss = "";
  for (const sheet of Array.from(document.styleSheets)) {
    let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    if (!rules) continue;
    for (const rule of Array.from(rules)) {
      if (rule.type === 7 /* CSSRule.KEYFRAMES_RULE */) keyframesCss += rule.cssText + "\n";
    }
  }
  // Per-element inline animation + keyframe custom-props (--low/--end/--rest/…).
  // `style.animation` serializes to the FULL longhand form (e.g. "7s ease-in-out
  // -0.18s infinite normal none running cWave") — note it legitimately contains
  // "none" (fill-mode) and already bakes in the stagger delay, so store it whole.
  const motionOf = (child) => {
    const m = {}, st = child.style;
    const anim = (st.animation || st.webkitAnimation || "").trim();
    if (anim && anim !== "none") {
      m.animation = anim;
      // transform-origin matters for the gauges/reels (cGrowX grows from left, etc.)
      const to = (st.transformOrigin || "").trim();
      if (to && to !== "50% 50%" && to !== "center" && to !== "center center") m.animTransformOrigin = to;
      const vars = {};
      for (let i = 0; i < st.length; i++) { const p = st[i]; if (p.charAt(0) === "-" && p.charAt(1) === "-") vars[p] = st.getPropertyValue(p).trim(); }
      if (Object.keys(vars).length) m.animVars = vars;
    }
    return m;
  };

  const out = [];
  for (const card of cards) {
    const label = (card.getAttribute("data-label") || "").split("·")[0].split(" ")[0].trim(); // "1A"
    const frame = card.querySelector(".cr-frame");
    if (!frame || !label) continue;
    const prevT = frame.style.transform;
    frame.style.transform = "none";
    const fb = frame.getBoundingClientRect();
    const fcs = getComputedStyle(frame);

    const config = {
      width: FRAME_W,
      height: FRAME_H,
      background: transparent(fcs.backgroundColor) ? "#0a0b0d" : fcs.backgroundColor,
      masterLoop: 7,
      keyframes: keyframesCss,
      media: null,
      fixedDesign: [],
      elements: [],
    };

    let z = 0;
    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return { x: round(r.left - fb.left), y: round(r.top - fb.top), w: round(r.width), h: round(r.height) };
    };
    const visible = (el, cs, r) => {
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      if (parseFloat(cs.opacity) === 0) return false;
      if (r.w < 1 || r.h < 1) return false;
      if (r.x > FRAME_W || r.y > FRAME_H || r.x + r.w < 0 || r.y + r.h < 0) return false;
      return true;
    };
    // direct (non-whitespace) text owned by THIS element, not its child elements
    const directText = (el) => {
      let t = "";
      for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
      return t.replace(/\s+/g, " ").trim();
    };

    const walk = (el) => {
      for (const child of el.children) {
        const cs = getComputedStyle(child);
        const r = rel(child);
        const tag = child.tagName;

        if (!visible(child, cs, r)) { walk(child); continue; }

        if (tag === "VIDEO") {
          const src = relAsset(child.currentSrc || child.src);
          // full-bleed video → editable bg media
          if (src && r.w >= FRAME_W * 0.9 && r.h >= FRAME_H * 0.9) {
            config.media = { path: src, tag: "bg_media", z: 0, offsetX: 0, offsetY: 0, ...motionOf(child) };
          }
          continue;
        }
        if (tag === "IMG") {
          const src = relAsset(child.currentSrc || child.src);
          if (src) {
            const im = {
              id: "img_" + (++z), type: "image", src,
              x: r.x, y: r.y, width: r.w, height: r.h,
              objectFit: cs.objectFit || "cover", z,
            };
            if (cs.objectPosition && cs.objectPosition !== "50% 50%") im.objectPosition = cs.objectPosition;
            Object.assign(im, motionOf(child));
            config.fixedDesign.push(im);
          }
          continue;
        }
        // SVG device (EKG draw, guarantee ring…) — passthrough at its frozen
        // 0%/rest state (first-frame-safe → the complete shape). Don't recurse.
        if (tag === "svg") {
          config.fixedDesign.push({
            id: "svg_" + (++z), type: "svg",
            x: r.x, y: r.y, width: r.w, height: r.h, z,
            svg: child.outerHTML,
          });
          continue;
        }

        const txt = directText(child);
        if (txt) {
          const el2 = {
            id: "t_" + (++z), type: "text", tag: "text", text: txt,
            x: r.x, y: r.y, z,
            fontSize: round(parseFloat(cs.fontSize)),
            fontFamily: (cs.fontFamily.split(",")[0] || "").replace(/['"]/g, "").trim(),
            color: cs.color,
            fontWeight: cs.fontWeight,
            lineHeight: cs.lineHeight === "normal" ? undefined : round(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) * 100) / 100,
            letterSpacing: cs.letterSpacing === "normal" ? undefined : cs.letterSpacing,
            textTransform: cs.textTransform === "none" ? undefined : cs.textTransform,
          };
          // chip pill: own (non-transparent) background hugging the text
          if (!transparent(cs.backgroundColor)) {
            el2.chipBg = cs.backgroundColor;
            el2.chipPad = `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`;
            el2.chipRadius = parseFloat(cs.borderTopLeftRadius) || 0;
            // a chip is positioned by its box; keep the box width so alignment holds
          }
          if (cs.webkitTextStrokeWidth && parseFloat(cs.webkitTextStrokeWidth) > 0) {
            el2.strokeWidth = round(parseFloat(cs.webkitTextStrokeWidth));
            el2.strokeColor = cs.webkitTextStrokeColor;
            el2.color = "transparent";
          }
          // rotation (first-frame; identity for most first-frame-safe cells)
          const tr = cs.transform;
          if (tr && tr !== "none" && !tr.startsWith("matrix(1, 0, 0, 1")) el2.transform = tr;
          Object.assign(el2, motionOf(child));
          // count-up: keep the frozen finished text ("39%") as the t=0 display,
          // carry the driver metadata so it counts on the loop.
          if (child.dataset && child.dataset.countup != null) {
            el2.countup = {
              target: parseFloat(child.dataset.countup),
              decimals: +(child.dataset.decimals || 0),
              prefix: child.dataset.prefix || "",
              suffix: child.dataset.suffix || "",
            };
          }
          config.elements.push(el2);
          // a text node can still have styled element children (rare) — recurse
          walk(child);
          continue;
        }

        // non-text box: capture if it actually paints (bg color, gradient, or border)
        const hasBg = !transparent(cs.backgroundColor);
        const hasGrad = cs.backgroundImage && cs.backgroundImage !== "none";
        const hasBorder = parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0;
        if (hasBg || hasGrad || hasBorder) {
          const shape = {
            id: "s_" + (++z), type: "rect",
            x: r.x, y: r.y, width: r.w, height: r.h, z,
            fill: hasGrad ? cs.backgroundImage : (hasBg ? cs.backgroundColor : "transparent"),
            borderRadius: parseFloat(cs.borderTopLeftRadius) || 0,
          };
          if (hasBorder) shape.border = `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`;
          if (cs.clipPath && cs.clipPath !== "none") shape.clipPath = cs.clipPath;
          const tr = cs.transform;
          if (tr && tr !== "none" && !tr.startsWith("matrix(1, 0, 0, 1")) shape.transform = tr;
          Object.assign(shape, motionOf(child));
          config.fixedDesign.push(shape);
        }
        walk(child);
      }
    };
    walk(frame);

    // Route B/partial-media: promote the bounded hero photo to config.media so
    // the editor's swap / clip-trim / multi-clip-reel tooling (which all target
    // config.media) engages on it. Largest non-logo image wins; it carries a
    // `frame` box so it renders bounded instead of full-bleed. Route A already
    // set config.media (full-bleed video); Route C has only the logo → stays null.
    if (!config.media) {
      const imgs = config.fixedDesign.filter((s) => s.type === "image" && !/logo/i.test(s.src || ""));
      if (imgs.length) {
        let hero = imgs[0];
        for (const im of imgs) if (im.width * im.height > hero.width * hero.height) hero = im;
        config.fixedDesign = config.fixedDesign.filter((s) => s !== hero);
        config.media = {
          path: hero.src, tag: "bg_media", z: hero.z, offsetX: 0, offsetY: 0,
          frame: { x: hero.x, y: hero.y, width: hero.width, height: hero.height },
        };
        if (hero.objectPosition) config.media.objectPosition = hero.objectPosition;
      }
    }

    frame.style.transform = prevT;
    out.push({ id: "wf-" + label, config });
  }
  return out;
}

// ── thin per-template JSX shell (config-driven LayerStack) ─────────────────
const jsxShell = (id) => `// Auto-generated from campaigns/westfield-100-off/index.html (${id}).
// Editable layered version of Westfield Campaign C — open in the editor at
// localhost:5173/#${id}. Regenerate with: node scripts/westfield-flatten.mjs.
import config from "./${id}.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers (the renderer scans this entry file for literal
// fontFamily strings — fonts used only via config are invisible to it).
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  body: { fontFamily: "'Geist', 'Inter', system-ui, sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function ${id.replace(/[^a-zA-Z0-9]/g, "_")}() {
  return <LayerStack config={config} />;
}

export default ${id.replace(/[^a-zA-Z0-9]/g, "_")};
`;

(async () => {
  if (!existsSync(GALLERY)) { console.error("gallery not found:", GALLERY); process.exit(1); }
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(GALLERY).href, { waitUntil: "networkidle0", timeout: 60000 });
  // freeze every animation to its base/0% (first-frame-safe) state before measuring
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;}" });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

  let results = await page.evaluate(extractAll);
  await browser.close();

  if (ONLY && !ALL) results = results.filter((r) => r.id === "wf-" + ONLY);
  if (!results.length) { console.error("no cells matched", ONLY || "(all)"); process.exit(1); }

  for (const { id, config } of results) {
    writeFileSync(join(OUT_DIR, `${id}.config.json`), JSON.stringify(config, null, 2) + "\n");
    writeFileSync(join(OUT_DIR, `${id}.jsx`), jsxShell(id));
    console.log(`wrote ${id}: ${config.fixedDesign.length} shapes, ${config.elements.length} text, media=${config.media ? "yes" : "no"}`);
  }
  console.log(`\n${results.length} template(s) written to templates/westfield-100-off/`);
})();

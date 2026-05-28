// ============================================================================
//  scripts/lib/svg-parser.mjs — shared Canva SVG parsing + cutout compositing
// ============================================================================
//  Used by:
//    - scripts/inspect-svg-images.mjs (image dimension reporting)
//    - scripts/extract-cutout.mjs (mask+photo → RGBA PNG)
//    - scripts/scaffold-cluster.mjs (template auto-generation)
//
//  Assumes Canva SVG conventions:
//    - Single </defs> separates definitions from body
//    - All body images are wrapped in <g transform="matrix(...)"> for positioning
//    - Mask definitions: <mask id="X"><g filter="..."><image .../></g></mask>
//    - Image elements referenced as: <image mask="url(#X)" .../>
//    - Default viewBox "0 0 810 1439.999935" with display size 1080×1920
// ============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// SVG viewBox → display pixel scale (810 SVG units → 1080 px)
export const VIEWBOX_TO_PX = 1080 / 810;

// ---------------------------------------------------------------------------
// decodeImageDims — read width/height from raw PNG or JPEG bytes
// ---------------------------------------------------------------------------
// Canva's SVG embeds images with only `width=` attribute (no height).
// To get true source dimensions, decode from the image header itself.
//
// PNG: IHDR chunk at bytes 8-25 contains width (BE u32 at offset 16) and
//      height (BE u32 at offset 20).
// JPEG: scan for SOF0 (0xFFC0) or SOF2 (0xFFC2) markers; after marker +
//       length + precision byte, height is BE u16, then width is BE u16.
/**
 * @param {Buffer} buf — image bytes (PNG or JPEG)
 * @returns {{ width: number, height: number } | null}
 */
export function decodeImageDims(buf) {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length >= 24 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  ) {
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
    };
  }
  // JPEG signature: FF D8
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 8) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      // SOF0=0xC0, SOF1=0xC1, SOF2=0xC2, SOF3=0xC3 (and others) carry dims
      if (
        marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3
      ) {
        return {
          width: buf.readUInt16BE(i + 7),
          height: buf.readUInt16BE(i + 5),
        };
      }
      // Skip this marker: length is BE u16 at i+2
      const segLen = buf.readUInt16BE(i + 2);
      i += 2 + segLen;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// parseSvg
// ---------------------------------------------------------------------------
/**
 * Read an SVG file and split into defs / body.
 * @param {string} svgPath
 * @returns {{ svg: string, defs: string, body: string, defsEnd: number }}
 */
export function parseSvg(svgPath) {
  const svg = readFileSync(resolve(svgPath), "utf8");
  const defsEnd = svg.indexOf("</defs>");
  if (defsEnd === -1) {
    throw new Error(`No </defs> found in ${svgPath}`);
  }
  return {
    svg,
    defs: svg.slice(0, defsEnd),
    body: svg.slice(defsEnd),
    defsEnd,
  };
}

// ---------------------------------------------------------------------------
// extractBodyImages
// ---------------------------------------------------------------------------
/**
 * Walk every <image> element in the body, compute rendered pixel dimensions
 * from the nearest preceding <g transform="matrix(...)"> wrapper, and identify
 * any mask reference.
 *
 * @param {string} body — SVG content from </defs> to </svg>
 * @returns {Array<{
 *   index: number,
 *   ext: string,            // file extension ('png' | 'jpg' etc., 'jpeg' normalized to 'jpg')
 *   base64: string,         // base64 image data (without data: prefix)
 *   srcWidth: number,       // source image width attribute (may be 0 if missing)
 *   srcHeight: number,      // source image height attribute (may be 0 if missing)
 *   transform: number[]|null, // [a, b, c, d, e, f] matrix or null
 *   maskId: string|null,    // referenced mask id, if any
 *   renderedX: number,      // pixel x (transformed)
 *   renderedY: number,      // pixel y (transformed)
 *   renderedW: number,      // pixel width (transformed)
 *   renderedH: number,      // pixel height (transformed)
 * }>}
 */
export function extractBodyImages(body) {
  const imageRe = /<image\b([^>]*)xlink:href="data:image\/(\w+);base64,([^"]+)"/g;
  const matrixRe = /matrix\(([-0-9.,\s]+)\)/g;
  const out = [];
  let m;
  let idx = 0;
  while ((m = imageRe.exec(body)) !== null) {
    const attrs = m[1];
    const ext = m[2] === "jpeg" ? "jpg" : m[2];
    const base64 = m[3];

    let srcWidth = parseFloat((attrs.match(/\bwidth="([0-9.]+)"/) || [])[1] || "0");
    let srcHeight = parseFloat((attrs.match(/\bheight="([0-9.]+)"/) || [])[1] || "0");

    // Canva often omits height in SVG attrs — decode from image header
    if (!srcHeight && base64) {
      const dims = decodeImageDims(Buffer.from(base64, "base64"));
      if (dims) {
        // Use decoded dims if SVG attrs missing; otherwise keep SVG attrs
        if (!srcWidth) srcWidth = dims.width;
        srcHeight = dims.height;
      }
    }

    // Find the LAST matrix transform before this image
    const before = body.slice(0, m.index);
    const allMatrices = [...before.matchAll(matrixRe)];
    let transform = null;
    if (allMatrices.length > 0) {
      const lastMatrix = allMatrices[allMatrices.length - 1];
      const parts = lastMatrix[1]
        .split(/[,\s]+/)
        .map(parseFloat)
        .filter((n) => !isNaN(n));
      if (parts.length >= 6) transform = parts;
    }

    // Find the nearest preceding mask="url(#X)" in the surrounding tag context.
    // Canva renders these on the parent <g> or directly on <image>.
    const ctxWindow = body.slice(Math.max(0, m.index - 800), m.index);
    const maskMatch =
      ctxWindow.match(/mask="url\(#([^)]+)\)"[^<]*$/) ||
      ctxWindow.match(/.*mask="url\(#([^)]+)\)"/);
    const maskId = maskMatch ? maskMatch[1] : null;

    // Compute rendered pixel dimensions
    let renderedX = 0, renderedY = 0, renderedW = srcWidth, renderedH = srcHeight;
    if (transform) {
      const [a, , , d, e, f] = transform;
      renderedW = srcWidth * a * VIEWBOX_TO_PX;
      renderedH = srcHeight * d * VIEWBOX_TO_PX;
      renderedX = e * VIEWBOX_TO_PX;
      renderedY = f * VIEWBOX_TO_PX;
    } else {
      renderedW = srcWidth * VIEWBOX_TO_PX;
      renderedH = srcHeight * VIEWBOX_TO_PX;
    }

    out.push({
      index: idx,
      ext,
      base64,
      srcWidth,
      srcHeight,
      transform,
      maskId,
      renderedX: Math.round(renderedX),
      renderedY: Math.round(renderedY),
      renderedW: Math.round(renderedW),
      renderedH: Math.round(renderedH),
    });
    idx++;
  }
  return out;
}

// ---------------------------------------------------------------------------
// extractBodyRects
// ---------------------------------------------------------------------------
/**
 * Extract <rect fill="#..."> elements from the body. Skips bleed rects
 * (Canva's full-coverage white/black background rects with negative position).
 *
 * @param {string} body
 * @returns {Array<{
 *   x: number, y: number, width: number, height: number,
 *   fill: string, opacity: number, isBleed: boolean
 * }>}
 */
export function extractBodyRects(body) {
  const rectRe = /<rect\b([^>]*?)\/?>/g;
  const out = [];
  let m;
  while ((m = rectRe.exec(body)) !== null) {
    const attrs = m[1];
    const x = parseFloat((attrs.match(/\bx="(-?[0-9.]+)"/) || [])[1] || "0");
    const y = parseFloat((attrs.match(/\by="(-?[0-9.]+)"/) || [])[1] || "0");
    const w = parseFloat((attrs.match(/\bwidth="([0-9.]+)"/) || [])[1] || "0");
    const h = parseFloat((attrs.match(/\bheight="([0-9.]+)"/) || [])[1] || "0");
    const fill = (attrs.match(/\bfill="([^"]+)"/) || [])[1] || null;
    const opacity = parseFloat((attrs.match(/\bfill-opacity="([0-9.]+)"/) || [])[1] || "1");
    if (!fill) continue;

    // Bleed-rect detection: Canva's full-coverage rects sit at negative x/y
    // and extend past the viewBox. They cover EVERYTHING — we don't want them
    // in the design layer because they'd wipe out the photo.
    const isBleed = x < 0 && y < 0 && w > 810 && h > 1400;

    out.push({
      x: Math.round(x * VIEWBOX_TO_PX),
      y: Math.round(y * VIEWBOX_TO_PX),
      width: Math.round(w * VIEWBOX_TO_PX),
      height: Math.round(h * VIEWBOX_TO_PX),
      fill,
      opacity,
      isBleed,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// extractMaskById
// ---------------------------------------------------------------------------
/**
 * Find a <mask id="X"> definition in the defs and return its embedded image.
 *
 * @param {string} defs
 * @param {string} id
 * @returns {{ ext: string, base64: string } | null}
 */
export function extractMaskById(defs, id) {
  // mask block: <mask id="X" ...>...</mask>
  const maskBlockRe = new RegExp(`<mask\\s+id="${id}"[\\s\\S]*?</mask>`);
  const maskBlock = defs.match(maskBlockRe);
  if (!maskBlock) return null;
  const imgMatch = maskBlock[0].match(
    /xlink:href="data:image\/(\w+);base64,([^"]+)"/,
  );
  if (!imgMatch) return null;
  return { ext: imgMatch[1], base64: imgMatch[2] };
}

// ---------------------------------------------------------------------------
// compositeImageWithMask
// ---------------------------------------------------------------------------
/**
 * Combine a photo image with its luminance mask into a real RGBA PNG.
 * Runs in a headless puppeteer for canvas-based pixel manipulation
 * (no native deps).
 *
 * @param {{ ext: string, base64: string }} photoData
 * @param {{ ext: string, base64: string }} maskData
 * @returns {Promise<Buffer>} PNG bytes with true alpha channel
 */
export async function compositeImageWithMask(photoData, maskData) {
  const puppeteer = (await import("puppeteer")).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(`
<!doctype html>
<html><body>
<canvas id="c"></canvas>
<script>
const photo = new Image();
const mask = new Image();
const c = document.getElementById('c');
const ctx = c.getContext('2d');
window.compositeReady = false;
window.compositeResult = null;
window.compositeError = null;
let loaded = 0;
function tryComposite() {
  if (loaded < 2) return;
  try {
    c.width = photo.naturalWidth;
    c.height = photo.naturalHeight;
    ctx.drawImage(photo, 0, 0);
    const imgData = ctx.getImageData(0, 0, c.width, c.height);
    const mc = document.createElement('canvas');
    mc.width = c.width;
    mc.height = c.height;
    const mctx = mc.getContext('2d');
    mctx.drawImage(mask, 0, 0, c.width, c.height);
    const maskBuf = mctx.getImageData(0, 0, c.width, c.height);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const lum = 0.299 * maskBuf.data[i] + 0.587 * maskBuf.data[i+1] + 0.114 * maskBuf.data[i+2];
      imgData.data[i + 3] = Math.round(lum);
    }
    ctx.putImageData(imgData, 0, 0);
    window.compositeResult = c.toDataURL('image/png');
    window.compositeReady = true;
  } catch (e) {
    window.compositeError = e.message;
    window.compositeReady = true;
  }
}
photo.onerror = () => { window.compositeError = 'photo load error'; window.compositeReady = true; };
mask.onerror = () => { window.compositeError = 'mask load error'; window.compositeReady = true; };
photo.onload = () => { loaded++; tryComposite(); };
mask.onload = () => { loaded++; tryComposite(); };
photo.src = 'data:image/${photoData.ext};base64,${photoData.base64}';
mask.src = 'data:image/${maskData.ext};base64,${maskData.base64}';
</script>
</body></html>
`);
    await page.waitForFunction("window.compositeReady === true", { timeout: 60000 });
    const error = await page.evaluate(() => window.compositeError);
    if (error) throw new Error(`Composite error: ${error}`);
    const dataUrl = await page.evaluate(() => window.compositeResult);
    const base64 = dataUrl.split(",")[1];
    return Buffer.from(base64, "base64");
  } finally {
    await browser.close();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Save base64 image data to a file.
 */
export function writeImageData(targetPath, ext, base64) {
  writeFileSync(resolve(targetPath), Buffer.from(base64, "base64"));
}

/**
 * Resolve a "cluster-N" id to its canva-overlays SVG path.
 * Handles Canva's "cluster - N.svg" filename convention (spaces around the dash).
 */
export function resolveClusterSvgPath(projectRoot, clusterId) {
  // Strip "cluster-" prefix if present, then map back to "cluster - N.svg"
  const num = clusterId.replace(/^cluster-?/i, "");
  const candidates = [
    `templates/multi-sport-foundations/canva-overlays/cluster - ${num}.svg`,
    `templates/multi-sport-foundations/canva-overlays/${num}.svg`,
    `templates/multi-sport-foundations/canva-overlays/${clusterId}.svg`,
  ];
  for (const c of candidates) {
    const full = resolve(projectRoot, c);
    try {
      readFileSync(full);
      return full;
    } catch (_) {}
  }
  throw new Error(`No SVG found for ${clusterId}. Tried:\n  ${candidates.join("\n  ")}`);
}

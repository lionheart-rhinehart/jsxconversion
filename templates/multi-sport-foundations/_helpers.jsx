// ============================================================================
//  Multi-Sport Foundations — Shared rebuild helpers
// ============================================================================
//  Reusable components for the 22 cluster-N.jsx Option A rebuilds. Each
//  template imports from here and composes a layout using brand-token colors,
//  Anton/JetBrains Mono fonts, and the patterns the Canva originals use.
//
//  All components accept React props directly — no Stage/Sprite runtime.
//  Render through the static-react path. Output is PNG.
// ============================================================================

// ── Brand tokens (from brand/aa-design-system/colors_and_type.css) ─────────
export const AA_RED = "#c4141d";
export const AA_RED_DEEP = "#a30f17";
export const INK_950 = "#0a0b0d";
export const INK_900 = "#15171a";
export const WHITE = "#ffffff";
export const FONT_DISPLAY = "'Anton', 'Oswald', 'Arial Narrow', sans-serif";
export const FONT_BODY = "'Geist', 'Inter', system-ui, sans-serif";
export const FONT_MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";

// ── MediaSlot: unified image OR video slot (extension-detected) ────────────
// Supports media config:
//   offsetX/Y      — pixels to shift focal point (within cover-fit photo)
//   scale          — zoom multiplier (1.0 = cover-fit exactly)
//   videoStartTime — seek frame for video snapshot
//   crop           — { x, y, width, height } in source-photo pixels; if set,
//                    only this region is shown, cover-fit to the frame.
// crop takes priority over offsetX/Y/scale.
export function MediaSlot({
  path,
  objectFit = "cover",
  objectPosition,
  offsetX = 0,
  offsetY = 0,
  scale = 1,
  videoStartTime = 0,
  crop,
  width = 1080,
  height = 1920,
  style = {},
}) {
  if (!path) return null;
  const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(path);

  // ── CROP path ────────────────────────────────────────────────────────────
  // Wrap in overflow:hidden, size the inner image so the crop region cover-fits
  // the frame, then position it so the cropped region lands at the right spot.
  if (crop && crop.width > 0 && crop.height > 0) {
    const applyCrop = (el) => {
      if (!el) return;
      const ready = isVideo ? el.videoWidth : el.naturalWidth;
      if (!ready) return;
      const nW = isVideo ? el.videoWidth : el.naturalWidth;
      const nH = isVideo ? el.videoHeight : el.naturalHeight;
      const cropAspect = crop.width / crop.height;
      const frameAspect = width / height;
      // cover-fit: scale so the crop region fully covers the frame.
      // Multiply by media.scale so offsetX/Y/scale also apply on top of crop.
      const s = (cropAspect > frameAspect ? height / crop.height : width / crop.width) * scale;
      const scaledCropW = crop.width * s;
      const scaledCropH = crop.height * s;
      el.style.position = "absolute";
      el.style.width = nW * s + "px";
      el.style.height = nH * s + "px";
      el.style.left = -crop.x * s - (scaledCropW - width) / 2 + offsetX + "px";
      el.style.top = -crop.y * s - (scaledCropH - height) / 2 + offsetY + "px";
    };
    const wrapperStyle = {
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      ...style,
    };
    if (isVideo) {
      return (
        <div style={wrapperStyle}>
          <video
            src={path}
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            ref={(el) => {
              if (!el) return;
              if (videoStartTime) el.currentTime = videoStartTime;
              const handler = () => applyCrop(el);
              el.addEventListener("loadeddata", handler, { once: true });
              if (el.videoWidth) applyCrop(el);
            }}
          />
        </div>
      );
    }
    return (
      <div style={wrapperStyle}>
        <img
          src={path}
          alt=""
          onLoad={(e) => applyCrop(e.target)}
          ref={(el) => el && el.complete && applyCrop(el)}
        />
      </div>
    );
  }

  // ── NO-CROP path (default — cover-fit with offsetX/Y/scale) ──────────────
  const objPos =
    objectPosition || `${50 - offsetX / 10.8}% ${50 - offsetY / 19.2}%`;
  const baseStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit,
    objectPosition: objPos,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: "center center",
    display: "block",
    ...style,
  };
  if (isVideo) {
    return (
      <video
        src={path}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        ref={(el) => {
          if (el && videoStartTime) {
            el.currentTime = videoStartTime;
          }
        }}
        style={baseStyle}
      />
    );
  }
  return <img src={path} alt="" style={baseStyle} />;
}

// ── ArchedHeadline: SVG textPath for curved display text ───────────────────
// arch: 'high' = strong curve (peak in center), 'med', 'low' = subtle, 'flat' = no curve
// glow: red drop-shadow behind white letters
export function ArchedHeadline({
  text,
  width,
  color = WHITE,
  fontSize = 160,
  arch = "med",
  glow = false,
  shadow = true,
  stroke = 0,
  strokeColor,
  fontWeight = 400,
  letterSpacing = "-0.01em",
}) {
  const padX = Math.max(20, fontSize * 0.15);
  // arch can be a preset name OR a numeric depth (0 = flat, 1 = strong, can go higher)
  const archDepth =
    typeof arch === "number"
      ? arch
      : ({ flat: 0, low: 0.25, med: 0.45, high: 0.7, extreme: 1.0 }[arch] ?? 0.45);
  // Multi-line: split on typed newlines and stack one arch per line. Curved text
  // rides a single SVG path, so a `\n` can't break within a path — instead each
  // line gets its own path + textPath, offset vertically. lineStep grows with the
  // arch (deeper curve lifts the center higher, needing more room). Spacing is
  // derived from fontSize+archDepth only (NO lineHeight) so the editor preview
  // (archSvg in editor.html) can mirror it exactly without threading extra props.
  const lines = String(text == null ? "" : text).split("\n");
  const lineStep = fontSize * (1.0 + archDepth * 0.7);
  const baseY0 = fontSize * 1.18;
  const svgHeight = baseY0 + (lines.length - 1) * lineStep + fontSize * 0.4;
  const idBase = `arc-${String(text == null ? "" : text).replace(/[^a-z0-9]/gi, "")}-${arch}`;
  // `glow` wins; else honor `shadow`. `shadow` may be:
  //   • a string  → used verbatim as the CSS filter (e.g. a custom
  //                  "drop-shadow(5px 9px 7px rgba(0,0,0,0.45))" to match a
  //                  design's pronounced offset shadow), letting one text layer
  //                  carry the shadow "layer" baked into Canva exports;
  //   • true (default) → the subtle built-in drop-shadow;
  //   • false → no shadow (outline-only headlines want a clean line on color).
  const filter = glow
    ? `drop-shadow(0 0 14px ${AA_RED}) drop-shadow(0 4px 14px rgba(0,0,0,0.55))`
    : typeof shadow === "string"
    ? shadow
    : shadow
    ? "drop-shadow(0 3px 10px rgba(0,0,0,0.45))"
    : "none";
  return (
    <svg
      width={width}
      height={svgHeight}
      viewBox={`0 0 ${width} ${svgHeight}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        {lines.map((ln, i) => {
          const baselineY = baseY0 + i * lineStep;
          const peakY = baselineY - fontSize * archDepth;
          return (
            <path
              key={i}
              id={`${idBase}-${i}`}
              d={`M ${padX} ${baselineY} Q ${width / 2} ${peakY} ${width - padX} ${baselineY}`}
              fill="none"
            />
          );
        })}
      </defs>
      {lines.map((ln, i) => (
        <text
          key={i}
          fill={color}
          stroke={stroke ? strokeColor || color : undefined}
          strokeWidth={stroke || undefined}
          fontFamily={FONT_DISPLAY}
          fontSize={fontSize}
          fontWeight={fontWeight}
          letterSpacing={letterSpacing}
          style={{ filter, textTransform: "uppercase", paintOrder: "stroke" }}
        >
          <textPath href={`#${idBase}-${i}`} startOffset="50%" textAnchor="middle">
            {ln}
          </textPath>
        </text>
      ))}
    </svg>
  );
}

// ── CornerAccent: stacked horizontal rectangles in alternating red/black ───
// Matches the Canva original — horizontal bars stacked vertically, no
// rotation, flush to the edge. Wider and taller per visual reference.
// Canva-export note: the actual corner accent is rasterized inside a full-
// width image layer in the SVG, so per-rectangle dimensions are estimated
// from the original PNG, not vector-extracted.
export function CornerAccent({ side = "left", top = 30, edgeOffset = -8 }) {
  const isLeft = side === "left";
  const sideProp = isLeft ? "left" : "right";
  return (
    <div
      style={{
        position: "absolute",
        top,
        [sideProp]: edgeOffset,
        pointerEvents: "none",
      }}
    >
      <div style={{ width: 360, height: 72, background: AA_RED, marginBottom: 10 }} />
      <div style={{ width: 310, height: 68, background: "#0a0b0d", marginBottom: 10 }} />
      <div style={{ width: 240, height: 54, background: AA_RED, marginBottom: 10 }} />
      <div style={{ width: 180, height: 42, background: AA_RED }} />
    </div>
  );
}

// ── HairlineRule: thin red horizontal line across the frame ────────────────
export function HairlineRule({ y, width = "100%", opacity = 0.85, thickness = 2, color = AA_RED }) {
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 0,
        right: 0,
        width,
        height: thickness,
        background: color,
        opacity,
      }}
    />
  );
}

// ── TextOverlay: positioned absolute text, optional drop-shadow ────────────
export function TextOverlay({
  text,
  x,
  y,
  width,
  height,
  font = FONT_MONO,
  fontSize = 32,
  fontWeight = 600,
  color = WHITE,
  letterSpacing = "0.04em",
  textTransform = "uppercase",
  textAlign = "center",
  shadow = "0 2px 8px rgba(0,0,0,0.75)",
  skew = 0,
}) {
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent:
          textAlign === "left" ? "flex-start" : textAlign === "right" ? "flex-end" : "center",
        transform: skew ? `skewX(${skew}deg)` : "none",
      }}
    >
      <span
        style={{
          color,
          fontFamily: font,
          fontSize,
          fontWeight,
          letterSpacing,
          textTransform,
          textAlign,
          textShadow: shadow,
          whiteSpace: "pre-wrap",
          lineHeight: 1.05,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ── CityHeadline: huge stacked city name (for cluster-8, 8a, 12) ───────────
// rows: number of repeats (typically 3). solidRow: which row is filled vs outlined.
export function CityHeadline({
  city,
  width,
  startY = 60,
  fontSize = 220,
  rows = 3,
  solidRow = 0,
  color = WHITE,
  outlineWidth = 4,
  rowGap = 180,
  letterSpacing = "-0.02em",
}) {
  const items = [];
  for (let i = 0; i < rows; i++) {
    const isSolid = i === solidRow;
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          top: startY + i * rowGap,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_DISPLAY,
          fontSize,
          fontWeight: 400,
          letterSpacing,
          textTransform: "uppercase",
          lineHeight: 0.85,
          color: isSolid ? color : "transparent",
          WebkitTextStroke: isSolid ? "0" : `${outlineWidth}px ${color}`,
        }}
      >
        {city}
      </div>,
    );
  }
  return <>{items}</>;
}

// ── ForegroundMedia: transparent-cutout subject layered on top ────────────
// Use for compositions where a subject (athlete cutout) sits IN FRONT of
// other design elements (city text, etc.). Same positioning model as MediaSlot.
// Optional — only renders if path is provided.
//
// blendMode option lets you composite a non-alpha image with a black
// background as if it were transparent. "screen" makes pure black invisible.
// Useful for Canva-extracted PNGs that lack alpha (color-type 2 RGB).
// tint option overlays a flat color clipped to the cutout's own alpha (a
// mask-image of the same source), composited with `tintBlend` (default
// "multiply") against the subject beneath it. This reproduces the Canva
// "photo over solid red" wash on the subject itself, while leaving transparent
// areas untouched. Inert when `tint` is absent → single <img>/<video>, so
// templates that don't set it render byte-identically.
export function ForegroundMedia({
  path,
  offsetX = 0,
  offsetY = 0,
  scale = 1,
  width = 1080,
  height = 1920,
  blendMode = "normal",
  tint = null,
  tintBlend = "multiply",
}) {
  if (!path) return null;
  const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(path);
  const onLoad = (el) => {
    if (!el) return;
    const nW = isVideo ? el.videoWidth : el.naturalWidth;
    const nH = isVideo ? el.videoHeight : el.naturalHeight;
    if (!nW) return;
    const baseScale = (height / nH) * scale;
    const w = nW * baseScale;
    const h = nH * baseScale;
    const left = (width - w) / 2 + offsetX;
    const top = (height - h) / 2 + offsetY;
    el.style.position = "absolute";
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.style.left = left + "px";
    el.style.top = top + "px";
    if (blendMode && blendMode !== "normal") {
      el.style.mixBlendMode = blendMode;
    }
    // Size + place the tint overlay to exactly cover the media box, masked by
    // the source's alpha so only the subject is tinted.
    if (tint) {
      const ov = el.parentElement && el.parentElement.querySelector("[data-fg-tint]");
      if (ov) {
        ov.style.position = "absolute";
        ov.style.width = w + "px";
        ov.style.height = h + "px";
        ov.style.left = left + "px";
        ov.style.top = top + "px";
        ov.style.background = tint;
        ov.style.mixBlendMode = tintBlend;
        ov.style.pointerEvents = "none";
        const maskUrl = `url("${path}")`;
        ov.style.webkitMaskImage = maskUrl;
        ov.style.maskImage = maskUrl;
        ov.style.webkitMaskSize = "100% 100%";
        ov.style.maskSize = "100% 100%";
        ov.style.webkitMaskRepeat = "no-repeat";
        ov.style.maskRepeat = "no-repeat";
      }
    }
  };
  const media = isVideo ? (
    <video
      src={path}
      autoPlay muted playsInline loop preload="auto"
      ref={(el) => el && el.addEventListener("loadeddata", () => onLoad(el), { once: true })}
    />
  ) : (
    <img src={path} alt="" onLoad={(e) => onLoad(e.target)} ref={(el) => el && el.complete && onLoad(el)} />
  );
  if (!tint) return media;
  return (
    <div style={{ display: "contents" }}>
      {media}
      <div data-fg-tint aria-hidden="true" style={{ position: "absolute" }} />
    </div>
  );
}

// ── Frame: outer 1080×1920 container, optional bg color ────────────────────
export function Frame({ width, height, background = INK_950, children }) {
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        overflow: "hidden",
        background,
        fontFamily: FONT_BODY,
      }}
    >
      {children}
    </div>
  );
}

// ── renderDesignItem: render ONE design primitive (rect/image/circle) ──────
// Extracted from FixedDesign so a single shape can be rendered standalone by
// LayerStack (which interleaves shapes with text/media/foreground by z-order).
export function renderDesignItem(it, key) {
  if (it.type === "rect") {
    const rectStyle = {
      position: "absolute",
      left: it.x,
      top: it.y,
      width: it.width,
      height: it.height,
      background: it.fill,
      borderRadius: it.borderRadius || 0,
      boxShadow: it.shadow,
      opacity: it.opacity ?? 1,
    };
    // Optional compositing: a tint/overlay rect can blend with the layers
    // beneath it (e.g. "multiply" deepens a photo to a rich, detail-preserving
    // wash instead of an alpha haze). Inert when absent → no effect on rects
    // that don't set it.
    if (it.blendMode && it.blendMode !== "normal") rectStyle.mixBlendMode = it.blendMode;
    // Optional outline-only shapes: a `border` (e.g. "2px solid #ffffff") with a
    // transparent fill makes the rect a hollow frame — the "album-art" outline of
    // a player-card UI. Inert when absent → filled rects unaffected.
    if (it.border) rectStyle.border = it.border;
    // Optional angled/clipped shapes: a clip-path polygon carves the rect into a
    // wedge/parallelogram, and transform rotates/skews it. Inert when absent →
    // existing rectangular shapes are unaffected.
    if (it.clipPath) rectStyle.clipPath = it.clipPath;
    if (it.transform) rectStyle.transform = it.transform;
    // Optional tiled/patterned fill (e.g. a radial-gradient dot grid). When the
    // fill is a repeating gradient, backgroundSize controls the tile and
    // backgroundRepeat the tiling. Set AFTER `background` so the longhand wins
    // over the shorthand's implicit size reset. Inert when absent.
    if (it.backgroundSize) rectStyle.backgroundSize = it.backgroundSize;
    if (it.backgroundRepeat) rectStyle.backgroundRepeat = it.backgroundRepeat;
    return <div key={key} style={rectStyle} />;
  }
  if (it.type === "image") {
    const imgStyle = {
      position: "absolute",
      left: it.x,
      top: it.y,
      width: it.width,
      height: it.height,
      objectFit: it.objectFit || "contain",
      objectPosition: it.objectPosition || undefined,
      display: "block",
      opacity: it.opacity ?? 1,
    };
    // Optional photo treatment: CSS filter (grayscale/brightness/contrast/blur)
    // and blend mode. Inert when absent → existing image layers unaffected.
    if (it.filter != null) imgStyle.filter = it.filter;
    if (it.blendMode && it.blendMode !== "normal") imgStyle.mixBlendMode = it.blendMode;
    // Optional affine transform: a rotated/skewed/scaled cutout (e.g. a Canva
    // image baked through a transform matrix). transformOrigin defaults to the
    // top-left so a `matrix(a,b,c,d,e,f)` maps the element's local box exactly
    // as the source SVG did. Inert when absent → upright images unaffected.
    //
    // Optional centered zoom: `scale` (a single number) enlarges/shrinks the
    // image about its CENTER so a cutout can be fit to the background photo it
    // sits over (the editor's scroll-wheel zoom writes this). It composes after
    // an explicit `transform` matrix when both are present. Inert when absent
    // or 1 → existing image layers unaffected.
    const transforms = [];
    if (it.transform) transforms.push(it.transform);
    if (it.scale != null && it.scale !== 1) transforms.push(`scale(${it.scale})`);
    if (transforms.length) {
      imgStyle.transform = transforms.join(" ");
      // An explicit matrix keeps the top-left origin (so it maps the SVG box);
      // a pure `scale` zooms about the center so the cutout grows in place.
      imgStyle.transformOrigin =
        it.transformOrigin || (it.transform ? "0 0" : "center center");
    }
    return <img key={key} src={it.src} alt="" style={imgStyle} />;
  }
  if (it.type === "circle") {
    const sz = it.size || it.width || 24;
    return (
      <div
        key={key}
        style={{
          position: "absolute",
          left: it.x,
          top: it.y,
          width: sz,
          height: sz,
          background: it.fill,
          borderRadius: sz / 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: it.color || WHITE,
          fontSize: sz * 0.65,
          fontWeight: 700,
          lineHeight: 1,
          opacity: it.opacity ?? 1,
        }}
      >
        {it.label || ""}
      </div>
    );
  }
  return null;
}

// ── FixedDesign: render array of design primitives from config ─────────────
// Used so the editor + JSX renderer share one source of truth for the
// non-editable design layer (callout boxes, logos, separators, decorative
// shapes). Each entry has a `type` and shape-specific props.
export function FixedDesign({ items = [] }) {
  return (
    <>
      {items.map((it, i) => renderDesignItem(it, it.id || `fixed-${i}`))}
    </>
  );
}

// ── renderTextLayer: render ONE editable text element from config ──────────
// Replicates the per-template elStyle() helpers (cluster-8/cluster-10) so the
// renderer + editor share one source of truth for text styling. All style
// extras (lineHeight/letterSpacing/textTransform/fontWeight/whiteSpace) live on
// the element so different templates need no hand-written elStyle variants.
export function renderTextLayer(el, key) {
  // ── Arched display text ──────────────────────────────────────────────────
  // When `arch` is present (numeric depth or preset name) the element renders
  // through ArchedHeadline (curved baseline via SVG textPath) inside an
  // absolutely-positioned, full-width wrapper. `glow` adds the red drop-shadow.
  // Inert for every existing config (none set `arch`) → no render change.
  if (el.arch != null) {
    const archWidth = el.width || 1080;
    return (
      <div
        key={key}
        style={{
          position: "absolute",
          left: el.x,
          top: el.y,
          width: archWidth,
          overflow: "visible",
          transform: el.transform || undefined,
        }}
      >
        <ArchedHeadline
          text={el.text}
          width={archWidth}
          color={el.color || WHITE}
          fontSize={el.fontSize || 160}
          arch={el.arch}
          glow={!!el.glow}
          shadow={el.shadow != null ? el.shadow : true}
          stroke={el.strokeWidth != null ? el.strokeWidth : (el.stroke || 0)}
          strokeColor={el.strokeColor}
          fontWeight={el.fontWeight != null ? el.fontWeight : 400}
          letterSpacing={el.letterSpacing != null ? el.letterSpacing : "-0.01em"}
        />
      </div>
    );
  }
  const style = {
    position: "absolute",
    left: el.x,
    top: el.y,
    fontSize: el.fontSize,
    fontFamily: el.fontFamily ? `'${el.fontFamily}', sans-serif` : undefined,
    color: el.color,
  };
  // Optional box + alignment so a single text layer can span the frame and
  // center/right-align (matches the old full-width `left:0;right:0;textAlign`
  // headlines). Absent → element keeps its left-anchored auto width.
  if (el.width != null) style.width = el.width;
  if (el.textAlign != null) style.textAlign = el.textAlign;
  if (el.strokeWidth) {
    style.WebkitTextStroke = `${el.strokeWidth}px ${el.strokeColor || WHITE}`;
  }
  if (el.lineHeight != null) style.lineHeight = el.lineHeight;
  if (el.letterSpacing != null) style.letterSpacing = el.letterSpacing;
  if (el.textTransform != null) style.textTransform = el.textTransform;
  if (el.fontWeight != null) style.fontWeight = el.fontWeight;
  if (el.fontStyle != null) style.fontStyle = el.fontStyle;
  if (el.whiteSpace != null) style.whiteSpace = el.whiteSpace;
  // Optional visual extras: drop-shadow/glow (`filter`), text shadow, and a
  // skew/scale `transform`. All inert when absent → existing configs unchanged.
  if (el.textShadow != null) style.textShadow = el.textShadow;
  if (el.filter != null) style.filter = el.filter;
  if (el.transform != null) {
    style.transform = el.transform;
    if (el.transformOrigin != null) style.transformOrigin = el.transformOrigin;
  }
  // Optional photo-filled glyphs: the text becomes a window onto an image via
  // background-clip:text (the recurring Canva "letters filled with a photo"
  // look — e.g. a vertical YOUTH showing a gym scene). The fill image is
  // painted into the glyph shapes and the text color is forced transparent.
  // `backgroundSize`/`backgroundPosition` tune the crop; both optional. Inert
  // when absent → solid `color` text unchanged.
  if (el.imageFill != null) {
    style.backgroundImage = `url(${el.imageFill})`;
    style.backgroundSize = el.backgroundSize || "cover";
    style.backgroundPosition = el.backgroundPosition || "center";
    style.backgroundRepeat = el.backgroundRepeat || "no-repeat";
    style.WebkitBackgroundClip = "text";
    style.backgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
    style.color = "transparent";
  }
  // Optional tiled/repeated watermark: render the text on `repeat` stacked
  // lines (joined by newlines) so one data-driven field (e.g. a tagged
  // microscript) fills the background "all the way down". The fill step still
  // rewrites `text` to a single value; the repetition happens here at render
  // time, so the tiled watermark stays a live, fillable field. lineHeight sets
  // the row pitch. Inert when absent → single-line text unchanged.
  let content = el.text;
  if (el.repeat && el.repeat > 1) {
    content = Array.from({ length: el.repeat }, () => el.text).join("\n");
    if (el.whiteSpace == null) style.whiteSpace = "pre";
  }
  return (
    <div key={key} style={style}>
      {content}
    </div>
  );
}

// ── LayerStack: unified, z-ordered renderer for an entire template config ──
// Collects every drawable (media, fixedDesign shapes, text elements,
// foreground cutout) into one list, assigns a default z by category when an
// item has no explicit `z`, stable-sorts by effective z (insertion index as
// tiebreaker), and paints in that order (DOM order = paint order — no CSS
// z-index needed, mirroring how the renderer composites today).
//
// Default z bands (used ONLY when an item omits `z`, so legacy configs render
// pixel-identically): media 0, fixedDesign 10+index, elements 20+index,
// foreground 100. Templates that interleave layers (e.g. cluster-8 splits its
// city text behind the cutout and its bottom-band text in front) set explicit
// `z` per item to express that order.
export function LayerStack({ config }) {
  const W = config.width || 1080;
  const H = config.height || 1920;
  const layers = [];

  const media = config.media || {};
  if (media.path) {
    layers.push({ kind: "media", z: media.z != null ? media.z : 0, i: layers.length, data: media });
  }
  (config.fixedDesign || []).forEach((it, idx) => {
    layers.push({ kind: "shape", z: it.z != null ? it.z : 10 + idx, i: layers.length, data: it });
  });
  (config.elements || []).forEach((el, idx) => {
    layers.push({ kind: "text", z: el.z != null ? el.z : 20 + idx, i: layers.length, data: el });
  });
  const fg = config.foregroundMedia || {};
  if (fg.path) {
    layers.push({ kind: "foreground", z: fg.z != null ? fg.z : 100, i: layers.length, data: fg });
  }

  layers.sort((a, b) => (a.z - b.z) || (a.i - b.i));

  return (
    <Frame width={W} height={H} background={INK_950}>
      {layers.map((layer, idx) => {
        const d = layer.data;
        const key = d.id || `${layer.kind}-${idx}`;
        if (layer.kind === "media") {
          return (
            <MediaSlot
              key={key}
              path={d.path}
              offsetX={d.offsetX || 0}
              offsetY={d.offsetY || 0}
              scale={d.scale || 1}
              videoStartTime={d.videoStartTime || 0}
              crop={d.crop}
              objectFit={d.objectFit}
              width={W}
              height={H}
            />
          );
        }
        if (layer.kind === "shape") return renderDesignItem(d, key);
        if (layer.kind === "text") return renderTextLayer(d, key);
        if (layer.kind === "foreground") {
          return (
            <ForegroundMedia
              key={key}
              path={d.path}
              offsetX={d.offsetX || 0}
              offsetY={d.offsetY || 0}
              scale={d.scale || 1}
              blendMode={d.blendMode || "normal"}
              tint={d.tint || null}
              tintBlend={d.tintBlend || "multiply"}
              width={W}
              height={H}
            />
          );
        }
        return null;
      })}
    </Frame>
  );
}

// ── DarkProtectionGradient: subtle dark wash for text legibility on photos ─
export function DarkProtectionGradient({
  topAlpha = 0.25,
  midAlpha = 0,
  bottomAlpha = 0.35,
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(180deg, rgba(10,11,13,${topAlpha}) 0%, rgba(10,11,13,${midAlpha}) 18%, rgba(10,11,13,${midAlpha}) 82%, rgba(10,11,13,${bottomAlpha}) 100%)`,
        pointerEvents: "none",
      }}
    />
  );
}

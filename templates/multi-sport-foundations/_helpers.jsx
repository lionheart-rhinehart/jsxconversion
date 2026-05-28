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
  letterSpacing = "-0.01em",
}) {
  const padX = Math.max(20, fontSize * 0.15);
  // arch can be a preset name OR a numeric depth (0 = flat, 1 = strong, can go higher)
  const archDepth =
    typeof arch === "number"
      ? arch
      : ({ flat: 0, low: 0.25, med: 0.45, high: 0.7, extreme: 1.0 }[arch] ?? 0.45);
  const baselineY = fontSize * 1.18;
  const peakY = baselineY - fontSize * archDepth;
  const pathD = `M ${padX} ${baselineY} Q ${width / 2} ${peakY} ${width - padX} ${baselineY}`;
  const svgHeight = baselineY + fontSize * 0.4;
  const id = `arc-${text.replace(/[^a-z0-9]/gi, "")}-${arch}`;
  const filter = glow
    ? `drop-shadow(0 0 14px ${AA_RED}) drop-shadow(0 4px 14px rgba(0,0,0,0.55))`
    : "drop-shadow(0 3px 10px rgba(0,0,0,0.45))";
  return (
    <svg
      width={width}
      height={svgHeight}
      viewBox={`0 0 ${width} ${svgHeight}`}
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <path id={id} d={pathD} fill="none" />
      </defs>
      <text
        fill={color}
        fontFamily={FONT_DISPLAY}
        fontSize={fontSize}
        fontWeight={400}
        letterSpacing={letterSpacing}
        style={{ filter, textTransform: "uppercase" }}
      >
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
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

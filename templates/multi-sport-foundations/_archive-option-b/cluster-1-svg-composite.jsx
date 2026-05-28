// ============================================================================
//  CLUSTER 1 — FOUNDATIONAL YOUTH PROGRAM (Option B: SVG composite)
// ============================================================================
//  Renders 3 layers, bottom to top:
//    1. Media (swap-in image or video) — fills the canvas
//    2. SVG design overlay — Canva export with main photo stripped (so layer 1
//       shows through where the photo used to be). Everything else (text outlines,
//       brand graphics, red accents, hairlines) renders pixel-perfect from vector.
//    3. Text overlay — HTML text with a color-matched mask covering the SVG's
//       baked-in placeholder text. Editable per render.
//
//  Editable inputs are constants at the top. Change MEDIA_PATH, MICROSCRIPT_1,
//  etc. to produce a new variant. Design layer is fixed.
// ============================================================================

// ── Render params (read by the skill, do not rename) ───────────────────────
export const WIDTH = 1080;
export const HEIGHT = 1920;

// ── Per-ad editable inputs ─────────────────────────────────────────────────
const MEDIA_PATH = "./assets/hero-sprint-male.jpg"; // .jpg/.png/.webp or .mp4/.webm
const MICROSCRIPT_1 = "Built for athletes 8-12";

// ── Fixed assets ───────────────────────────────────────────────────────────
const SVG_OVERLAY = "./assets/cluster-1-stripped.svg";

// ── Text zone config (positioning of editable text on top of SVG) ──────────
// Coordinates are in the 1080×1920 canvas space. Calibrated against the
// original PNG to land on top of the placeholder text the SVG bakes in.
const MICROSCRIPT_ZONE_1 = {
  // Positioned to cover the SVG's baked-in {{MICRO - SCRIPTS}} placeholder.
  // For cluster-1 the placeholder sits around y=1500-1560, centered.
  x: 60,
  y: 1530,
  w: 960,
  h: 140,
  font: "'JetBrains Mono', ui-monospace, monospace",
  fontSize: 36,
  fontWeight: 600,
  color: "#ffffff",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  // Mask hides the placeholder. Solid black with slight transparency reads
  // as an intentional design element rather than a patch.
  mask: {
    color: "#0a0b0d",
    padX: 28,
    padY: 12,
    borderRadius: 4,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function MediaSlot({ path, width, height }) {
  if (!path) return null;
  const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(path);
  const baseStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };
  if (isVideo) {
    return (
      <video
        src={path}
        autoPlay
        muted
        playsInline
        loop
        style={baseStyle}
      />
    );
  }
  return <img src={path} alt="" style={baseStyle} />;
}

function TextZone({ zone, value }) {
  if (!value) return null;
  const { x, y, w, h, font, fontSize, fontWeight, color, letterSpacing, textTransform, mask } = zone;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: mask ? `${mask.padY}px ${mask.padX}px` : 0,
        background: mask?.color || "transparent",
        borderRadius: mask?.borderRadius || 0,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          color,
          fontFamily: font,
          fontSize,
          fontWeight: fontWeight || 400,
          letterSpacing: letterSpacing || "normal",
          textTransform: textTransform || "none",
          textAlign: "center",
          whiteSpace: "pre-wrap",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Main template ──────────────────────────────────────────────────────────
function Cluster1() {
  return (
    <div
      style={{
        position: "relative",
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        background: "#000",
      }}
    >
      {/* Layer 1: swap-in media (behind everything) */}
      <MediaSlot path={MEDIA_PATH} width={WIDTH} height={HEIGHT} />

      {/* Layer 2: SVG design overlay (main photo stripped) */}
      <img
        src={SVG_OVERLAY}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
        }}
      />

      {/* Layer 3: editable text overlays */}
      <TextZone zone={MICROSCRIPT_ZONE_1} value={MICROSCRIPT_1} />
    </div>
  );
}

export default Cluster1;

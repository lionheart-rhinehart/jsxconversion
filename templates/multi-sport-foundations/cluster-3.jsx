// ============================================================================
//  CLUSTER 3 — FOUNDATIONAL YOUTH PROGRAM (brick wall, top headline)
// ============================================================================
//  Headline lockup at TOP (not bottom like cluster-2). FOUNDATIONAL flat
//  white, YOUTH red italic overlapping PROGRAM, PROGRAM white italic.
//  Microscript in upper-mid area. AA logo small bottom-right.
// ============================================================================

import {
  AA_RED,
  WHITE,
  INK_950,
  FONT_MONO,
  MediaSlot,
  TextOverlay,
  Frame,
  DarkProtectionGradient,
} from "./_helpers.jsx";

export const WIDTH = 1080;
export const HEIGHT = 1920;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

// ── Per-ad editable variables ──────────────────────────────────────────────
const MEDIA_PATH = "./assets/photo-jump-male.jpg";
const LOGO_PATH = "./assets/aa-logo.png";
const HEADLINE_TOP = "FOUNDATIONAL";
const HEADLINE_MID = "YOUTH";
const HEADLINE_BOT = "PROGRAM";
const MICROSCRIPT_1 = "{{MICRO - SCRIPTS}}";

// ── Layout (positions calibrated to original cluster-3 PNG) ────────────────
// AA logo bottom-right position from SVG inspector: image #6 at (832, 1673) 140x140
const LOGO_X = 880;
const LOGO_Y = 1720;
const LOGO_SIZE = 140;

function Cluster3() {
  return (
    <Frame width={WIDTH} height={HEIGHT} background={INK_950}>
      {/* Photo background */}
      <MediaSlot path={MEDIA_PATH} objectPosition="center 40%" />

      {/* Top + bottom protection wash for legibility */}
      <DarkProtectionGradient topAlpha={0.45} bottomAlpha={0.25} />

      {/* FOUNDATIONAL — top, flat white Anton with red glow */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          color: WHITE,
          fontFamily: "'Anton', 'Oswald', sans-serif",
          fontSize: 140,
          lineHeight: 0.9,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          filter: `drop-shadow(0 0 14px ${AA_RED}) drop-shadow(0 4px 12px rgba(0,0,0,0.6))`,
        }}
      >
        {HEADLINE_TOP}
      </div>

      {/* YOUTH — red Anton italic, smaller, overlapping top of PROGRAM */}
      <div
        style={{
          position: "absolute",
          top: 175,
          left: 0,
          right: 0,
          textAlign: "center",
          color: AA_RED,
          fontFamily: "'Anton', 'Oswald', sans-serif",
          fontSize: 100,
          lineHeight: 0.9,
          letterSpacing: "0",
          textTransform: "uppercase",
          fontStyle: "italic",
          transform: "skewX(-10deg)",
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.7))",
          zIndex: 3,
        }}
      >
        {HEADLINE_MID}
      </div>

      {/* PROGRAM — white Anton italic, large */}
      <div
        style={{
          position: "absolute",
          top: 215,
          left: 0,
          right: 0,
          textAlign: "center",
          color: WHITE,
          fontFamily: "'Anton', 'Oswald', sans-serif",
          fontSize: 175,
          lineHeight: 0.9,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          fontStyle: "italic",
          transform: "skewX(-8deg)",
          filter: `drop-shadow(0 0 12px ${AA_RED}) drop-shadow(0 4px 12px rgba(0,0,0,0.6))`,
          zIndex: 2,
        }}
      >
        {HEADLINE_BOT}
      </div>

      {/* Microscript — mono white text, no background, mid-upper area */}
      <TextOverlay
        text={MICROSCRIPT_1}
        x={60}
        y={500}
        width={WIDTH - 120}
        height={50}
        font={FONT_MONO}
        fontSize={32}
        fontWeight={600}
        color={WHITE}
        letterSpacing="0.04em"
        shadow="0 2px 10px rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.5)"
      />

      {/* AA logo bottom-right */}
      <img
        src={LOGO_PATH}
        alt=""
        style={{
          position: "absolute",
          left: LOGO_X,
          top: LOGO_Y,
          width: LOGO_SIZE,
          height: LOGO_SIZE,
          objectFit: "contain",
        }}
      />
    </Frame>
  );
}

export default Cluster3;

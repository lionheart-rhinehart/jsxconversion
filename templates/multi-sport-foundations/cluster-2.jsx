// ============================================================================
//  CLUSTER 2 — FOUNDATIONAL YOUTH PROGRAM (baseball pitcher variant)
// ============================================================================
//  Differs from cluster-1: FOUNDATIONAL is flat (no arch), YOUTH is in a
//  script font (not Anton), microscript has a white outline border instead
//  of just floating on the photo. AA logo top-left.
// ============================================================================

import {
  AA_RED,
  WHITE,
  INK_950,
  FONT_MONO,
  FONT_DISPLAY,
  MediaSlot,
  TextOverlay,
  Frame,
  DarkProtectionGradient,
} from "./_helpers.jsx";

export const WIDTH = 1080;
export const HEIGHT = 1920;

// Font preflight markers
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
  script: { fontFamily: "'Caveat', cursive" },
};

// ── Per-ad editable variables ──────────────────────────────────────────────
const MEDIA_PATH = "./assets/hero-sprint-male.jpg";
const LOGO_PATH = "./assets/aa-logo.png";
const HEADLINE_TOP = "FOUNDATIONAL";
const HEADLINE_MID = "Youth";        // script font, title case (matches original)
const HEADLINE_BOT = "PROGRAM";
const MICROSCRIPT_1 = "{{MICRO - SCRIPTS}}";

// ── Layout (positions from cluster-2 SVG inspection + visual reference) ────
const LOGO_X = 78;
const LOGO_Y = 77;
const LOGO_SIZE = 140;
const HEADLINE_TOP_Y = 1300;
const HEADLINE_MID_Y = 1430;
const HEADLINE_BOT_Y = 1530;
const MICROSCRIPT_Y = 1750;

function Cluster2() {
  return (
    <Frame width={WIDTH} height={HEIGHT} background={INK_950}>
      {/* Photo background */}
      <MediaSlot path={MEDIA_PATH} objectPosition="center 30%" />

      {/* Subtle gradient at bottom for headline legibility */}
      <DarkProtectionGradient topAlpha={0} bottomAlpha={0.55} />

      {/* AA logo top-left — exact position from SVG: (78, 77) 140x140 */}
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

      {/* FOUNDATIONAL — flat white Anton with red glow */}
      <div
        style={{
          position: "absolute",
          top: HEADLINE_TOP_Y,
          left: 0,
          right: 0,
          textAlign: "center",
          color: WHITE,
          fontFamily: "'Anton', 'Oswald', sans-serif",
          fontSize: 145,
          lineHeight: 0.9,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          filter: `drop-shadow(0 0 14px ${AA_RED}) drop-shadow(0 4px 12px rgba(0,0,0,0.6))`,
        }}
      >
        {HEADLINE_TOP}
      </div>

      {/* YOUTH — script font (Caveat), red, italic, smaller */}
      <div
        style={{
          position: "absolute",
          top: HEADLINE_MID_Y,
          left: 0,
          right: 0,
          textAlign: "center",
          color: AA_RED,
          fontFamily: "'Caveat', cursive",
          fontSize: 140,
          fontWeight: 700,
          fontStyle: "italic",
          lineHeight: 0.9,
          letterSpacing: "0.01em",
          filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.7))",
          zIndex: 3,
        }}
      >
        {HEADLINE_MID}
      </div>

      {/* PROGRAM — white Anton */}
      <div
        style={{
          position: "absolute",
          top: HEADLINE_BOT_Y,
          left: 0,
          right: 0,
          textAlign: "center",
          color: WHITE,
          fontFamily: "'Anton', 'Oswald', sans-serif",
          fontSize: 165,
          lineHeight: 0.9,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          filter: `drop-shadow(0 0 12px ${AA_RED}) drop-shadow(0 4px 12px rgba(0,0,0,0.6))`,
        }}
      >
        {HEADLINE_BOT}
      </div>

      {/* Microscript — plain white mono text on photo, no border */}
      <TextOverlay
        text={MICROSCRIPT_1}
        x={60}
        y={MICROSCRIPT_Y}
        width={WIDTH - 120}
        height={50}
        font={FONT_MONO}
        fontSize={30}
        fontWeight={600}
        color={WHITE}
        letterSpacing="0.04em"
        shadow="0 2px 10px rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.5)"
      />
    </Frame>
  );
}

export default Cluster2;

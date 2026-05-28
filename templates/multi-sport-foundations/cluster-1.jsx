// ============================================================================
//  CLUSTER 1 — FOUNDATIONAL YOUTH PROGRAM (Option A: full JSX rebuild)
// ============================================================================
//  Canonical pattern template. Recreates the Canva cluster-1 design in pure
//  JSX so every element is programmable. Fidelity bar: "best we can in
//  reasonable time" — not pixel-perfect to Canva, but consistent with the
//  brand language and structurally accurate.
//
//  All variables are constants at the top of the file. Edit, re-render.
// ============================================================================

import {
  AA_RED,
  WHITE,
  INK_950,
  FONT_MONO,
  FONT_DISPLAY,
  MediaSlot,
  ArchedHeadline,
  TextOverlay,
  Frame,
  DarkProtectionGradient,
} from "./_helpers.jsx";

// ── Render params (skill reads these) ──────────────────────────────────────
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Font preflight markers — renderer scans the entry file for literal
// fontFamily references. Without these, fonts referenced via imports from
// _helpers.jsx are missed and the browser falls back to Arial/sans-serif.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

// ── Per-ad editable variables ──────────────────────────────────────────────
const MEDIA_PATH = "./assets/hero-sprint-male.jpg"; // image or video
const HEADLINE_TOP = "FOUNDATIONAL";
const HEADLINE_MID = "YOUTH";       // red accent word
const HEADLINE_BOT = "PROGRAM";
const MICROSCRIPT_1 = "{{MICRO - SCRIPTS}}";

// ── Layout config ──────────────────────────────────────────────────────────
const HEADLINE_TOP_Y = 110;
const HAIRLINE_TOP_Y = 96;
const HAIRLINE_BOT_Y = 310;
const HEADLINE_MID_Y = 1180;
const HEADLINE_BOT_Y = 1240;
const MICROSCRIPT_Y = 1620;
const BOTTOM_STRIP_HEIGHT = 30;

function Cluster1() {
  return (
    <Frame width={WIDTH} height={HEIGHT} background={INK_950}>
      {/* ── Photo background ── */}
      <MediaSlot path={MEDIA_PATH} objectPosition="center 25%" />

      {/* ── Subtle protection gradient for text legibility ── */}
      <DarkProtectionGradient topAlpha={0.3} bottomAlpha={0.4} />

      {/* Corner accent removed — not needed for this design per user review */}

      {/* ── FOUNDATIONAL — arched stronger, white, red glow ── */}
      <div style={{ position: "absolute", top: HEADLINE_TOP_Y, left: 0, width: WIDTH, overflow: "visible" }}>
        <ArchedHeadline
          text={HEADLINE_TOP}
          width={WIDTH}
          fontSize={158}
          arch={1.5}
          glow
        />
      </div>

      {/* ── YOUTH — red, smaller, skewed (sits over top of PROGRAM letterforms) ── */}
      <div
        style={{
          position: "absolute",
          top: HEADLINE_MID_Y,
          left: 0,
          right: 0,
          textAlign: "center",
          color: AA_RED,
          fontFamily: FONT_DISPLAY,
          fontSize: 140,
          lineHeight: 0.88,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          transform: "skewX(-8deg)",
          filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.7))",
          zIndex: 3,
        }}
      >
        {HEADLINE_MID}
      </div>

      {/* ── PROGRAM — arched (subtle), white, red glow ── */}
      <div style={{ position: "absolute", top: HEADLINE_BOT_Y, left: 0, width: WIDTH, zIndex: 2 }}>
        <ArchedHeadline
          text={HEADLINE_BOT}
          width={WIDTH}
          fontSize={210}
          arch="low"
          glow
        />
      </div>

      {/* ── Microscript — white mono, no background, just text on photo ── */}
      <TextOverlay
        text={MICROSCRIPT_1}
        x={60}
        y={MICROSCRIPT_Y}
        width={WIDTH - 120}
        height={50}
        font={FONT_MONO}
        fontSize={32}
        fontWeight={600}
        color={WHITE}
        letterSpacing="0.04em"
        shadow="0 2px 10px rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.5)"
      />

      {/* ── Bottom red strip ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: BOTTOM_STRIP_HEIGHT,
          background: AA_RED,
        }}
      />
    </Frame>
  );
}

export default Cluster1;

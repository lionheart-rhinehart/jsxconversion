// ============================================================================
//  CLUSTER 4 — FOUNDATIONAL YOUTH PROGRAM (quadrant photo grid)
// ============================================================================
//  2×2 grid: top-left is a dark text cell (headline + microscript + brand mark),
//  the other three cells are photos. Originally Canva-branded for BATTI; all
//  brand elements are editable variables — defaults to AA, swap per campaign.
// ============================================================================

import {
  AA_RED,
  WHITE,
  INK_950,
  FONT_MONO,
  MediaSlot,
  Frame,
} from "./_helpers.jsx";

export const WIDTH = 1080;
export const HEIGHT = 1920;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

// ── Per-ad editable variables ──────────────────────────────────────────────
// 3 photo cells — top-right, bottom-left, bottom-right
const PHOTO_1 = "./assets/photo-lifting.jpg";
const PHOTO_2 = "./assets/photo-medball.jpg";
const PHOTO_3 = "./assets/photo-jump-male.jpg";

const HEADLINE_TOP = "FOUNDATIONAL";
const HEADLINE_MID = "YOUTH";
const HEADLINE_BOT = "PROGRAM";
const MICROSCRIPT_1 = "{{MICRO - SCRIPTS}}";

// Brand — editable per campaign (default AA)
const BRAND_LOGO_PATH = "./assets/aa-logo.png";
const BRAND_NAME = "ATHLETES-ACCELERATION";

// ── Layout: 2×2 grid, each cell ~50% of canvas ─────────────────────────────
const CELL_W = WIDTH / 2;
const CELL_H = HEIGHT / 2;

function Cluster4() {
  return (
    <Frame width={WIDTH} height={HEIGHT} background={INK_950}>
      {/* ── Cell TR — photo 1 (top right) ── */}
      <div style={{ position: "absolute", left: CELL_W, top: 0, width: CELL_W, height: CELL_H, overflow: "hidden" }}>
        <MediaSlot path={PHOTO_1} />
      </div>

      {/* ── Cell BL — photo 2 (bottom left) ── */}
      <div style={{ position: "absolute", left: 0, top: CELL_H, width: CELL_W, height: CELL_H, overflow: "hidden" }}>
        <MediaSlot path={PHOTO_2} />
      </div>

      {/* ── Cell BR — photo 3 (bottom right) ── */}
      <div style={{ position: "absolute", left: CELL_W, top: CELL_H, width: CELL_W, height: CELL_H, overflow: "hidden" }}>
        <MediaSlot path={PHOTO_3} />
      </div>

      {/* ── Cell TL — dark text cell with headline, microscript, brand ── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: CELL_W,
          height: CELL_H,
          background: INK_950,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          color: WHITE,
        }}
      >
        {/* Dot grid pattern top-left */}
        <div
          style={{
            width: 90,
            height: 36,
            backgroundImage: `radial-gradient(circle, ${WHITE} 2px, transparent 2.5px)`,
            backgroundSize: "12px 12px",
            opacity: 0.65,
            marginBottom: 36,
          }}
        />

        {/* Headline stack — FOUNDATIONAL / YOUTH / PROGRAM */}
        <div
          style={{
            fontFamily: "'Anton', 'Oswald', sans-serif",
            fontSize: 96,
            lineHeight: 1.08,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            marginBottom: 32,
          }}
        >
          <div>{HEADLINE_TOP}</div>
          <div>{HEADLINE_MID}</div>
          <div>{HEADLINE_BOT}</div>
        </div>

        {/* Microscript */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: "auto",
          }}
        >
          {MICROSCRIPT_1}
        </div>

        {/* Brand mark — logo + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 24,
          }}
        >
          <img
            src={BRAND_LOGO_PATH}
            alt=""
            style={{ width: 42, height: 42, objectFit: "contain" }}
          />
          <span
            style={{
              fontFamily: "'Anton', 'Oswald', sans-serif",
              fontSize: 26,
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
            }}
          >
            {BRAND_NAME}
          </span>
        </div>
      </div>
    </Frame>
  );
}

export default Cluster4;

// ============================================================================
//  CLUSTER 5 — FOUNDATIONAL YOUTH PROGRAM (editor-driven config)
// ============================================================================
//  All editable properties (position, font size, text, color) live in
//  cluster-5.config.json. Edit via the drag-drop editor or by hand.
//  JSX = layout + design (shadows, line-height, transforms); config = data.
// ============================================================================

import config from "./cluster-5.config.json";
import {
  AA_RED,
  WHITE,
  INK_950,
  MediaSlot,
  Frame,
  DarkProtectionGradient,
} from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
  body: { fontFamily: "'Geist', sans-serif" },
};

// Resolve an element's config by id
function cfg(id) {
  return config.elements.find((e) => e.id === id) || {};
}

// Common style derived from config — position + font + size + color
function elStyle(id, extra) {
  const c = cfg(id);
  return {
    position: "absolute",
    left: c.x,
    top: c.y,
    fontSize: c.fontSize,
    fontFamily: c.fontFamily ? `'${c.fontFamily}', sans-serif` : undefined,
    color: c.color,
    ...extra,
  };
}

// ── Per-ad editable variables ──────────────────────────────────────────────
const BRAND_LOGO_PATH = "./assets/aa-logo.png";

// Media comes from config (path, offsetX/Y, scale, videoStartTime)
const media = config.media || {};

function Cluster5() {
  return (
    <Frame width={WIDTH} height={HEIGHT} background={INK_950}>
      <MediaSlot
        path={media.path}
        offsetX={media.offsetX || 0}
        offsetY={media.offsetY || 0}
        scale={media.scale || 1}
        videoStartTime={media.videoStartTime || 0}
        crop={media.crop}
        width={WIDTH}
        height={HEIGHT}
      />
      <DarkProtectionGradient topAlpha={0.2} bottomAlpha={0.55} />

      {/* Brand callout — logo + brand name */}
      <div style={elStyle("brand_callout", { display: "flex", alignItems: "center", gap: 18 })}>
        <img
          src={BRAND_LOGO_PATH}
          alt=""
          style={{ width: cfg("brand_callout").fontSize, height: cfg("brand_callout").fontSize, objectFit: "contain" }}
        />
        <span style={{
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
        }}>
          {cfg("brand_callout").text}
        </span>
      </div>

      {/* FOUNDATIONAL */}
      <div style={elStyle("headline_top", {
        lineHeight: 0.9,
        letterSpacing: "-0.01em",
        textTransform: "uppercase",
        filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.7))",
      })}>
        {cfg("headline_top").text}
      </div>

      {/* YOUTH / PROGRAM */}
      <div style={elStyle("headline_sub", {
        lineHeight: 1.0,
        letterSpacing: "-0.01em",
        textTransform: "uppercase",
        whiteSpace: "pre",
        textAlign: "right",
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.7))",
      })}>
        {cfg("headline_sub").text}
      </div>

      {/* Microscript */}
      <div style={elStyle("microscript", {
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        textShadow: "0 2px 10px rgba(0,0,0,0.85)",
      })}>
        {cfg("microscript").text}
      </div>

      {/* CTA */}
      <div style={elStyle("cta", {
        fontWeight: 500,
        textShadow: "0 2px 8px rgba(0,0,0,0.85)",
      })}>
        {cfg("cta").text}
      </div>

      {/* Brand handle */}
      <div style={elStyle("handle", { display: "flex", alignItems: "center", gap: 14 })}>
        <img
          src={BRAND_LOGO_PATH}
          alt=""
          style={{ width: cfg("handle").fontSize * 1.3, height: cfg("handle").fontSize * 1.3, objectFit: "contain" }}
        />
        <span style={{
          fontWeight: 500,
          textShadow: "0 2px 8px rgba(0,0,0,0.85)",
        }}>
          {cfg("handle").text}
        </span>
      </div>
    </Frame>
  );
}

export default Cluster5;

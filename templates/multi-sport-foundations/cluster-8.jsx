// ============================================================================
//  CLUSTER 8 — City headline (PORTLAND ×3) with red-tint photo
// ============================================================================
//  City name is the visual hook — repeated 3 times stacked vertically (one
//  solid + two outlined). Photo gets a red color overlay. "ATTENTION /
//  PARENTS OF YOUTH ATHLETES / {{MICRO - SCRIPTS}}" in the bottom band.
//  Each city row is its own editable element so user can sync or diverge.
// ============================================================================

import config from "./cluster-8.config.json";
import {
  AA_RED,
  WHITE,
  INK_950,
  MediaSlot,
  Frame,
  FixedDesign,
  ForegroundMedia,
} from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function cfg(id) {
  return config.elements.find((e) => e.id === id) || {};
}
function elStyle(id, extra) {
  const c = cfg(id);
  const style = {
    position: "absolute",
    left: c.x,
    top: c.y,
    fontSize: c.fontSize,
    fontFamily: c.fontFamily ? `'${c.fontFamily}', sans-serif` : undefined,
    color: c.color,
    ...extra,
  };
  if (c.strokeWidth) {
    style.WebkitTextStroke = `${c.strokeWidth}px ${c.strokeColor || WHITE}`;
  }
  return style;
}

const media = config.media || {};
const foreground = config.foregroundMedia || {};

function Cluster8() {
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

      <FixedDesign items={config.fixedDesign || []} />

      {/* City headlines — 3 rows, top solid, bottom two outlined */}
      <div style={elStyle("city_1", { lineHeight: 0.9, letterSpacing: "-0.02em", textTransform: "uppercase" })}>
        {cfg("city_1").text}
      </div>
      <div style={elStyle("city_2", { lineHeight: 0.9, letterSpacing: "-0.02em", textTransform: "uppercase" })}>
        {cfg("city_2").text}
      </div>
      <div style={elStyle("city_3", { lineHeight: 0.9, letterSpacing: "-0.02em", textTransform: "uppercase" })}>
        {cfg("city_3").text}
      </div>

      {/* Foreground subject cutout (transparent PNG) — IN FRONT of city text.
          blendMode='screen' makes pure-black backgrounds invisible (used when
          extracting Canva cutouts that come without alpha channels). */}
      <ForegroundMedia
        path={foreground.path}
        offsetX={foreground.offsetX || 0}
        offsetY={foreground.offsetY || 0}
        scale={foreground.scale || 1}
        blendMode={foreground.blendMode || "screen"}
        width={WIDTH}
        height={HEIGHT}
      />

      {/* Bottom band: attention + subhead + microscript */}
      <div style={elStyle("attention", { lineHeight: 1.0, letterSpacing: "-0.01em", textTransform: "uppercase" })}>
        {cfg("attention").text}
      </div>
      <div style={elStyle("subhead", { lineHeight: 1.0, letterSpacing: "-0.01em", textTransform: "uppercase" })}>
        {cfg("subhead").text}
      </div>
      <div style={elStyle("microscript", { fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" })}>
        {cfg("microscript").text}
      </div>
    </Frame>
  );
}

export default Cluster8;

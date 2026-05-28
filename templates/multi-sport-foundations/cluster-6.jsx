// ============================================================================
//  CLUSTER 6 — Brand callout box style (originally BATTI-branded)
// ============================================================================
//  Dark rounded callout box centered over a photo, containing brand mark
//  (logo + name + handle + verified check), separator, TITLE, MICROSCRIPT.
//  Originally Canva-branded for BATTI; all brand elements are editable.
//  Editor-ready: positions in cluster-6.config.json.
// ============================================================================

import config from "./cluster-6.config.json";
import {
  AA_RED,
  WHITE,
  INK_950,
  MediaSlot,
  Frame,
  FixedDesign,
} from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
  body: { fontFamily: "'Geist', sans-serif" },
};

function cfg(id) {
  return config.elements.find((e) => e.id === id) || {};
}
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

const media = config.media || {};

function Cluster6() {
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

      {/* Fixed design layer (non-editable shapes/images) from config */}
      <FixedDesign items={config.fixedDesign || []} />

      {/* Brand name + handle (two lines) */}
      <div style={elStyle("brand_row", {
        whiteSpace: "pre",
        lineHeight: 1.3,
        fontWeight: 500,
      })}>
        {cfg("brand_row").text}
      </div>

      {/* Title */}
      <div style={elStyle("title", {
        lineHeight: 1.0,
        letterSpacing: "-0.01em",
        textTransform: "uppercase",
      })}>
        {cfg("title").text}
      </div>

      {/* Microscript */}
      <div style={elStyle("microscript", {
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      })}>
        {cfg("microscript").text}
      </div>
    </Frame>
  );
}

export default Cluster6;

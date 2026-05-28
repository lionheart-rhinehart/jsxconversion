// ============================================================================
//  CLUSTER 7 — Campaign hook with big multi-line text + bottom red banner
// ============================================================================
//  Original Canva: comic-burst background with stacked "NEW 9 AM SATURDAY
//  CLASS!" headline + red bottom banner with FYP + microscript.
//  Each line of the hook is its own editable element so the user can drag
//  them into the comic-stacked arrangement (or stack vertically for a
//  different campaign).
// ============================================================================

import config from "./cluster-7.config.json";
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

function Cluster7() {
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

      {/* Hook lines (1-4) — each its own draggable element so user can stack/skew */}
      <div style={elStyle("hook_line_1", { lineHeight: 1.0, letterSpacing: "-0.01em", textTransform: "uppercase", filter: "drop-shadow(0 6px 12px rgba(255,255,255,0.55))" })}>
        {cfg("hook_line_1").text}
      </div>
      <div style={elStyle("hook_line_2", { lineHeight: 1.0, letterSpacing: "-0.01em", textTransform: "uppercase", filter: "drop-shadow(0 6px 12px rgba(255,255,255,0.55))" })}>
        {cfg("hook_line_2").text}
      </div>
      <div style={elStyle("hook_line_3", { lineHeight: 1.0, letterSpacing: "-0.01em", textTransform: "uppercase", filter: "drop-shadow(0 6px 12px rgba(255,255,255,0.55))" })}>
        {cfg("hook_line_3").text}
      </div>
      <div style={elStyle("hook_line_4", { lineHeight: 1.0, letterSpacing: "-0.01em", textTransform: "uppercase", filter: "drop-shadow(0 6px 12px rgba(255,255,255,0.55))" })}>
        {cfg("hook_line_4").text}
      </div>

      {/* Bottom banner: program name */}
      <div style={elStyle("program_name", { letterSpacing: "-0.01em", textTransform: "uppercase" })}>
        {cfg("program_name").text}
      </div>

      {/* Bottom banner: microscript */}
      <div style={elStyle("microscript", { fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" })}>
        {cfg("microscript").text}
      </div>
    </Frame>
  );
}

export default Cluster7;

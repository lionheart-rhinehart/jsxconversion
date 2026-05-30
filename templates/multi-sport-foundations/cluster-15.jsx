// ============================================================================
//  CLUSTER 15 — FOUNDATIONAL YOUTH PROGRAM (two-photo split)
// ============================================================================
//  Thin, data-driven shell. Two stacked photos split the frame — soccer girls
//  on a field up top, indoor turf training down below — meeting at a hard seam
//  near center. Big white Anton display copy straddles the seam: FOUNDATIONAL
//  rides the lower edge of the top photo, YOUTH PROGRAM crowns the bottom photo.
//  A mono microscript line anchors the very bottom. All layers live in
//  cluster-15.config.json and render through the z-ordered LayerStack. Edit at
//  localhost:5173/#cluster-15.
// ============================================================================

import config from "./cluster-15.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans THIS entry file for literal
// fontFamily strings. Fonts referenced only via config inside _helpers.jsx are
// invisible to it, so every font used must appear here verbatim.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster15() {
  return <LayerStack config={config} />;
}

export default Cluster15;

// ============================================================================
//  CLUSTER 3 — FOUNDATIONAL YOUTH PROGRAM (top lockup, italic skew)
// ============================================================================
//  Thin, data-driven shell. Headline lockup at TOP: flat white FOUNDATIONAL,
//  red italic-skewed YOUTH overlapping a large white italic-skewed PROGRAM,
//  mono microscript mid-frame, small AA logo bottom-right. All layers live in
//  cluster-3.config.json and render through the z-ordered LayerStack. Edit in
//  the position editor at localhost:5173/#cluster-3.
// ============================================================================

import config from "./cluster-3.config.json";
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

function Cluster3() {
  return <LayerStack config={config} />;
}

export default Cluster3;

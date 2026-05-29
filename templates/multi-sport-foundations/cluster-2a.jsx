// ============================================================================
//  CLUSTER 2a — Foundational Youth Program (BATTI-Performance brand variant)
// ============================================================================
//  Variation of cluster-2 for the BATTI-Performance brand. Bench-press photo
//  fills the top; a red gradient block anchors the bottom third carrying the
//  BATTI logo lockup and the FOUNDATIONAL / YOUTH / PROGRAM headline. All
//  layers live in cluster-2a.config.json and render through the generic
//  z-ordered LayerStack. Edit in the position editor at
//  localhost:5173/#cluster-2a.
// ============================================================================

import config from "./cluster-2a.config.json";
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

function Cluster2a() {
  return <LayerStack config={config} />;
}

export default Cluster2a;

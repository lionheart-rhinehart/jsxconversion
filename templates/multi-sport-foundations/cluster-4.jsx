// ============================================================================
//  CLUSTER 4 — FOUNDATIONAL YOUTH PROGRAM (2x2 photo grid)
// ============================================================================
//  Thin, data-driven shell. 2x2 grid: a dark text cell (top-left) holds the
//  dot grid, the FOUNDATIONAL/YOUTH/PROGRAM headline stack, the microscript,
//  and the brand mark (logo + name); the other three cells are cover-fit
//  photos. All layers live in cluster-4.config.json and render through the
//  z-ordered LayerStack. There is no full-frame background photo — the dark
//  cell + Frame background fill the top-left quadrant. Edit in the position
//  editor at localhost:5173/#cluster-4.
// ============================================================================

import config from "./cluster-4.config.json";
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

function Cluster4() {
  return <LayerStack config={config} />;
}

export default Cluster4;

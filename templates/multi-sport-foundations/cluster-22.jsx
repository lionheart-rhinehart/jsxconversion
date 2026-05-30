// ============================================================================
//  CLUSTER 22 — FOUNDATIONAL YOUTH PROGRAM (two-panel / field hockey)
// ============================================================================
//  Thin, data-driven shell. A white top band stacks FOUNDATIONAL (black) /
//  PROGRAM (red, overlapping) / YOUTH (black) in condensed Anton. Below, a red
//  panel (left) carries [TITLE] + [MICRO - SCRIPTS] placeholders in JetBrains
//  Mono and the AA logo; a field-hockey photo fills the right panel. All layers
//  live in cluster-22.config.json and render through the z-ordered LayerStack.
//  Edit at localhost:5173/#cluster-22.
// ============================================================================

import config from "./cluster-22.config.json";
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

function Cluster22() {
  return <LayerStack config={config} />;
}

export default Cluster22;

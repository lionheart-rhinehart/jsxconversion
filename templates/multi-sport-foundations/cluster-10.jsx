// ============================================================================
//  CLUSTER-10 — auto-scaffolded from cluster - 10.svg
// ============================================================================
//  Thin, data-driven shell. All layers live in cluster-10.config.json and
//  render through the generic z-ordered LayerStack. Refine via the position
//  editor at http://localhost:5173/#cluster-10 (add text, drag positions, tune
//  media/foreground offset/scale/crop, reorder layers).
// ============================================================================

import config from "./cluster-10.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans THIS entry file for literal
// fontFamily strings. Fonts referenced only via config inside _helpers.jsx are
// invisible to it, so every font used must appear here verbatim.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
  body: { fontFamily: "'Geist', sans-serif" },
};

function Cluster10() {
  return <LayerStack config={config} />;
}

export default Cluster10;

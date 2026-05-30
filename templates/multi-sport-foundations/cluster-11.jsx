// ============================================================================
//  CLUSTER 11 — ATTENTION / PARENTS OF YOUTH ATHLETES (cutout + red field)
// ============================================================================
//  Thin, data-driven shell. Red full-frame field with a black→white gradient
//  at the top (large quote mark) and a gray→black gradient at the bottom. A
//  black ATTENTION pill + black PARENTS OF / YOUTH / ATHLETES subhead sit at
//  left; the coach cutout sits at right; two white rounded blocks at the
//  bottom carry the FOUNDATIONAL YOUTH PROGRAM headline and the microscript.
//  All layers live in cluster-11.config.json and render through the z-ordered
//  LayerStack. Edit in the position editor at localhost:5173/#cluster-11.
// ============================================================================

import config from "./cluster-11.config.json";
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

function Cluster11() {
  return <LayerStack config={config} />;
}

export default Cluster11;

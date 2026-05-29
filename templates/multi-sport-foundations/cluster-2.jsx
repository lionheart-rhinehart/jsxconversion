// ============================================================================
//  CLUSTER 2 — FOUNDATIONAL YOUTH PROGRAM (script-Youth, bottom lockup)
// ============================================================================
//  Thin, data-driven shell. Differs from cluster-1: the FOUNDATIONAL / Youth /
//  PROGRAM lockup sits at the BOTTOM, Youth is a script font (Caveat, red,
//  italic), and the AA logo is top-left. All layers live in
//  cluster-2.config.json and render through the z-ordered LayerStack. Edit in
//  the position editor at localhost:5173/#cluster-2.
// ============================================================================

import config from "./cluster-2.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans THIS entry file for literal
// fontFamily strings. Caveat (the script "Youth") must appear here verbatim or
// the browser falls back to a generic cursive/sans.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
  script: { fontFamily: "'Caveat', cursive" },
};

function Cluster2() {
  return <LayerStack config={config} />;
}

export default Cluster2;

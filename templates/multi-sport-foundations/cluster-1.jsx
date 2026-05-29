// ============================================================================
//  CLUSTER 1 — FOUNDATIONAL YOUTH PROGRAM (arched lockup, red glow)
// ============================================================================
//  Thin, data-driven shell. Every layer (bg photo, dark wash, the arched
//  FOUNDATIONAL / skewed red YOUTH / arched PROGRAM headlines, microscript,
//  bottom red strip) lives in cluster-1.config.json and renders through the
//  generic z-ordered LayerStack. Arched headlines use the text-layer `arch`
//  field; the red glow uses `glow`. Edit in the position editor at
//  localhost:5173/#cluster-1.
// ============================================================================

import config from "./cluster-1.config.json";
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

function Cluster1() {
  return <LayerStack config={config} />;
}

export default Cluster1;

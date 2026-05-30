// ============================================================================
//  CLUSTER 14 — FOUNDATIONAL YOUTH PROGRAM (arched knockout over squat photo)
// ============================================================================
//  Thin, data-driven shell. A gym back-squat photo fills the frame; the big
//  display copy wraps a large invisible circle — FOUNDATIONAL arcs across the
//  top (dome), YOUTH + PROGRAM curve along the bottom (bowl). The arched words
//  are live SVG-textPath text (ArchedHeadline), so the title stays editable and
//  fillable rather than baked into the photo. All layers live in
//  cluster-14.config.json and render through the z-ordered LayerStack. Edit at
//  localhost:5173/#cluster-14.
// ============================================================================

import config from "./cluster-14.config.json";
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

function Cluster14() {
  return <LayerStack config={config} />;
}

export default Cluster14;

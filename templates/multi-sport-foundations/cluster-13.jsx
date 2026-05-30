// ============================================================================
//  CLUSTER 13 — FOUNDATIONAL YOUTH PROGRAM (sprinter + green wedge)
// ============================================================================
//  Thin, data-driven shell. A field-at-sunset photo sits at the back; an angled
//  green wedge (clip-path parallelogram) crosses the lower-center behind the
//  big FOUNDATIONAL / YOUTH / PROGRAM headline. The sprinter cutout sits on top
//  of the headline (bursting through it), a [TITLE] eyebrow rides the top, and
//  two microscript lines anchor the bottom. All layers live in
//  cluster-13.config.json and render through the z-ordered LayerStack. Edit at
//  localhost:5173/#cluster-13.
// ============================================================================

import config from "./cluster-13.config.json";
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

function Cluster13() {
  return <LayerStack config={config} />;
}

export default Cluster13;

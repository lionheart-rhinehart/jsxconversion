// ============================================================================
//  CLUSTER 18 — FOUNDATIONAL YOUTH PROGRAM (red panel / football)
// ============================================================================
//  Thin, data-driven shell. A white frame holds an inset red rounded panel.
//  An arched, black-outlined YOUTH crowns the panel; a giant black
//  FOUNDATIONAL runs vertically up the right seam; a solid-red PROGRAM sits on
//  the white below. A kneeling LIONS #45 football player (cutout, helmet at his
//  feet) bursts out of the panel, two mono microscript lines and a faded AA
//  logo anchor the bottom. All layers live in cluster-18.config.json and render
//  through the z-ordered LayerStack. Edit at localhost:5173/#cluster-18.
// ============================================================================

import config from "./cluster-18.config.json";
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

function Cluster18() {
  return <LayerStack config={config} />;
}

export default Cluster18;

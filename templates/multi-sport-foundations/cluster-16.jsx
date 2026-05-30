// ============================================================================
//  CLUSTER 16 — FOUNDATIONAL YOUTH PROGRAM (vertical photo-filled YOUTH)
// ============================================================================
//  Thin, data-driven shell. A white frame holds three display words: a solid
//  red FOUNDATIONAL across the top, a giant vertical YOUTH down the left whose
//  letters are a window onto a gym-training photo (background-clip:text), and a
//  solid red PROGRAM across the bottom. The jumping-athlete cutout sits on top,
//  bursting out of the YOUTH column; the AA logo crowns the top and two mono
//  microscript lines anchor the bottom. All layers live in
//  cluster-16.config.json and render through the z-ordered LayerStack. Edit at
//  localhost:5173/#cluster-16.
// ============================================================================

import config from "./cluster-16.config.json";
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

function Cluster16() {
  return <LayerStack config={config} />;
}

export default Cluster16;

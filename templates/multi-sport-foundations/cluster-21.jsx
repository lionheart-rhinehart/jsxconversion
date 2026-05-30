// ============================================================================
//  CLUSTER 21 — FOUNDATIONAL YOUTH PROGRAM (red headline box / baseball)
// ============================================================================
//  Thin, data-driven shell. A white artboard holds a full-bleed baseball
//  batter photo inset behind a thin red rectangle frame. A solid red box in
//  the top-right stacks FOUNDATIONAL / YOUTH / PROGRAM in white Anton. A mono
//  microscript tag and a faded AA logo anchor the bottom over the photo. All
//  layers live in cluster-21.config.json and render through the z-ordered
//  LayerStack. Edit at localhost:5173/#cluster-21.
// ============================================================================

import config from "./cluster-21.config.json";
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

function Cluster21() {
  return <LayerStack config={config} />;
}

export default Cluster21;

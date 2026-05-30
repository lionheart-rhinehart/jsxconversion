// ============================================================================
//  CLUSTER 12 — PARENTS IN PORTLAND (speech bubble over watermarked photo)
// ============================================================================
//  Thin, data-driven shell. A darkened, desaturated track photo sits at the
//  back, overlaid with a live microscript field tiled down the whole frame as
//  a watermark (the `repeat` text layer — one tagged field, so a fill rewrites
//  every row at once). A green speech bubble (black border + down-left tail)
//  floats center frame with a soft white glow behind the PARENTS IN PORTLAND
//  headline and a small microscript line beneath it. All layers live in
//  cluster-12.config.json and render through the z-ordered LayerStack. Edit at
//  localhost:5173/#cluster-12.
// ============================================================================

import config from "./cluster-12.config.json";
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

function Cluster12() {
  return <LayerStack config={config} />;
}

export default Cluster12;

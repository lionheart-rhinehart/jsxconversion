// ============================================================================
//  CLUSTER 8a — City headline (PORTLAND ×3), natural photo + red banner
// ============================================================================
//  Variation of cluster-8. Differences: NO red tint (natural gym photo), no
//  "ATTENTION:" line, singular subhead, plus a red banner strip with italic
//  "DATA-DRIVEN ATHLETIC DEVELOPMENT AGES 8-18". All layers live in
//  cluster-8a.config.json and render through the generic z-ordered LayerStack.
//  Edit everything in the position editor at localhost:5173/#cluster-8a.
// ============================================================================

import config from "./cluster-8a.config.json";
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

function Cluster8a() {
  return <LayerStack config={config} />;
}

export default Cluster8a;

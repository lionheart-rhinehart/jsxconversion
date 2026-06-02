// ============================================================================
//  CLUSTER 36 — Centered epiphany on solid (AR4, beat-D signature)
// ============================================================================
//  Everything centered in the safe zone: a small mono anchor, a centered Anton
//  reframe, a short red rule, the brand lockup. Quiet, lots of negative space —
//  the "relief" beat (blame removal). No photo needed.
// ============================================================================

import config from "./cluster-36.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster36() {
  return <LayerStack config={config} />;
}

export default Cluster36;

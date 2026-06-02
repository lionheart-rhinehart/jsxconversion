// ============================================================================
//  CLUSTER 39 — Mechanism: left red bar + claim + support (AA-native)
// ============================================================================
//  A thick red vertical bar anchors a giant Anton mechanism claim with a Geist
//  support line. Distinct from cluster-34 (centered phrase-kill).
// ============================================================================

import config from "./cluster-39.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  body: { fontFamily: "'Geist', 'Inter', system-ui, sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster39() {
  return <LayerStack config={config} />;
}

export default Cluster39;

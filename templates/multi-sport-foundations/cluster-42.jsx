// ============================================================================
//  CLUSTER 42 — Reframe: framed centered epiphany (AA-native)
// ============================================================================
//  A centered two-line reframe framed by red rules top and bottom. Distinct
//  from cluster-36 (single center rule) and cluster-40 (quote glyph, left-set).
// ============================================================================

import config from "./cluster-42.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster42() {
  return <LayerStack config={config} />;
}

export default Cluster42;

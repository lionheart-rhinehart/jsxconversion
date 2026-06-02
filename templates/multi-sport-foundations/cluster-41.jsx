// ============================================================================
//  CLUSTER 41 — Name-the-moment: claim pair + red underline (AA-native)
// ============================================================================
//  A recognition line over a red underline accent, then the twist line in red.
//  Distinct from cluster-35 (split red/black band).
// ============================================================================

import config from "./cluster-41.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster41() {
  return <LayerStack config={config} />;
}

export default Cluster41;

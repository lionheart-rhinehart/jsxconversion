// ============================================================================
//  CLUSTER 38 — Proof: hero single stat (AA-native)
// ============================================================================
//  One enormous stat numeral, a red mono label, a supporting Anton claim, and a
//  study citation. Distinct from cluster-30 (dual-stat) — single dominant number.
// ============================================================================

import config from "./cluster-38.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster38() {
  return <LayerStack config={config} />;
}

export default Cluster38;

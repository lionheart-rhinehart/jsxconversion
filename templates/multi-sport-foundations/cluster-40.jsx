// ============================================================================
//  CLUSTER 40 — Reframe: quote block with red glyph (AA-native)
// ============================================================================
//  A giant red quotation glyph opens a blame-removal reframe in Anton, with a
//  Geist support line. Distinct from cluster-36 (centered reframe, no glyph).
// ============================================================================

import config from "./cluster-40.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  body: { fontFamily: "'Geist', 'Inter', system-ui, sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster40() {
  return <LayerStack config={config} />;
}

export default Cluster40;

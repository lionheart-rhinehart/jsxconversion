// ============================================================================
//  CLUSTER 32 — OFFER card (offer + guarantee band + CTA bar, AR7)
// ============================================================================
//  Dark card: mono eyebrow, big Anton offer headline, Geist support line, the
//  verbatim guarantee in a red band, a red CTA band, brand wordmark. Guarantee
//  is the LOCKED role. Promoted from fresh F2; cluster-named so it's editable.
// ============================================================================

import config from "./cluster-32.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  body: { fontFamily: "'Geist', 'Inter', system-ui, sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster32() {
  return <LayerStack config={config} />;
}

export default Cluster32;

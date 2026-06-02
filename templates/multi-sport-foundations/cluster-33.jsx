// ============================================================================
//  CLUSTER 33 — Lower-third hook over footage (AR2)
// ============================================================================
//  Full-frame AA footage still + bottom protection scrim; a mono anchor and a
//  lone Anton hook anchored in the lower third (classic Reels look), brand
//  wordmark beneath. The `bg_photo` slot takes a real frame-grabbed still.
// ============================================================================

import config from "./cluster-33.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster33() {
  return <LayerStack config={config} />;
}

export default Cluster33;

// ============================================================================
//  CLUSTER 35 — Split red/black band (AR3)
// ============================================================================
//  Hard color split: near-black top half carries the hook, a full-bleed red
//  band bottom carries the claim + brand. The 50/40 contrast is the signature —
//  the only archetype with a full red field. Loud, high-contrast, no photo.
// ============================================================================

import config from "./cluster-35.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster35() {
  return <LayerStack config={config} />;
}

export default Cluster35;

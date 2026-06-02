// ============================================================================
//  CLUSTER 31 — PROOF credentials / verdict card (AR5)
// ============================================================================
//  Dark card: mono eyebrow, coach name in big Anton, cert/title in mono, the
//  NFL-trained proof headline + athlete names, a supporting claim, brand. No
//  photo. Promoted from fresh E3; cluster-named so it's editable.
// ============================================================================

import config from "./cluster-31.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster31() {
  return <LayerStack config={config} />;
}

export default Cluster31;

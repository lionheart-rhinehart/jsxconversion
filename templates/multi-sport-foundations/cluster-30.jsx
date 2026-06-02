// ============================================================================
//  CLUSTER 30 — PROOF stat card (giant-number / phrase-kill, AR1)
// ============================================================================
//  Dark, data-forward proof card: mono code-comment eyebrow, big Anton numerals
//  with labels, a mono citation, a supporting claim, brand wordmark. No photo —
//  the numbers ARE the creative. Promoted from the fresh E2 (the one Cody liked).
//  Role-ready + cluster-named so it's editable in the review page.
// ============================================================================

import config from "./cluster-30.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster30() {
  return <LayerStack config={config} />;
}

export default Cluster30;

// ============================================================================
//  CLUSTER 34 — Phrase-kill (giant hook/reframe/claim on solid, AR1b)
// ============================================================================
//  Near-black canvas, mono anchor eyebrow, one giant Anton phrase, a red Anton
//  support line, brand wordmark. The text IS the creative (no photo). Serves
//  cold hooks, mechanism claims, and blame-removal reframes via its open role.
// ============================================================================

import config from "./cluster-34.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster34() {
  return <LayerStack config={config} />;
}

export default Cluster34;

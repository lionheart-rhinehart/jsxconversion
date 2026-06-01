// ============================================================================
//  FRESH — multisport-foundations / grind-trap / E3  (PROOF credentials card)
// ============================================================================
//  Beat E (Prove it) via authority. Dark card: mono eyebrow, the coach name in
//  big Anton, cert/title in mono, the NFL-trained proof headline + athlete names
//  (red mono), a supporting claim, and the brand wordmark. No photo — the
//  credential IS the proof. Promotable to a cluster-* with native proof/byline.
// ============================================================================

import config from "./fresh-multisport-foundations-grind-trap-E3.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — renderer scans THIS file for literal fontFamily strings.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshE3() {
  return <LayerStack config={config} />;
}

export default FreshE3;

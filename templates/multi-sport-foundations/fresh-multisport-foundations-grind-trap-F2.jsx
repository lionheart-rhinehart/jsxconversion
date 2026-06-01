// ============================================================================
//  FRESH — multisport-foundations / grind-trap / F2  (OFFER card)
// ============================================================================
//  Beat F (Offer). Dark card: mono eyebrow, the free Athlete Analysis offer in
//  big Anton, a Geist support line, the verbatim guarantee in a red band, and a
//  red CTA band. Guarantee is the LOCKED role — verbatim brand string only.
//  Promotable to a cluster-* with native offer/guarantee/cta (the bank has none).
// ============================================================================

import config from "./fresh-multisport-foundations-grind-trap-F2.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — renderer scans THIS file for literal fontFamily strings.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  body: { fontFamily: "'Geist', 'Inter', system-ui, sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshF2() {
  return <LayerStack config={config} />;
}

export default FreshF2;

// ============================================================================
//  FRESH — multisport-foundations / grind-trap / E2  (PROOF stat card)
// ============================================================================
//  Beat E (Prove it). Dark, data-forward proof card on near-black: a mono
//  code-comment eyebrow, two big Anton stat numerals (224% greater vertical /
//  28% less fatigue) with labels, the study citation in mono, a supporting
//  claim line, and the brand wordmark. No photo — the numbers ARE the creative.
//  Thin data-driven shell; all layers live in the sibling .config.json and
//  render through the z-ordered LayerStack. Promotable to a cluster-* with a
//  native `stat` role (the bank currently has none).
// ============================================================================

import config from "./fresh-multisport-foundations-grind-trap-E2.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans THIS entry file for literal
// fontFamily strings. Every font used in the config must appear here verbatim.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshE2() {
  return <LayerStack config={config} />;
}

export default FreshE2;

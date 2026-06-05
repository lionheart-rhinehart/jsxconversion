// ============================================================================
//  FRESH-ISP-PROOF — ISP-native proof / stat card
// ============================================================================
//  ISP's strongest asset: the numbers. A huge ISP-blue Barlow Condensed stat
//  (100+) with a white label, a secondary proof row, and a claim line, over a
//  heavily ink-washed training photo. Stat values are factual ISP proof-of-record
//  (exempt from the verbatim gate). Built from scratch on the ISP design system.
// ============================================================================

import config from "./fresh-isp-proof.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" },
  body: { fontFamily: "'Barlow', 'Inter', system-ui, sans-serif" },
};

function FreshIspProof() {
  return <LayerStack config={config} />;
}

export default FreshIspProof;

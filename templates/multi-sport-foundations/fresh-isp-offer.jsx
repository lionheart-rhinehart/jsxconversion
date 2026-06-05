// ============================================================================
//  FRESH-ISP-OFFER — ISP-native offer card (free first session)
// ============================================================================
//  Bottom-anchored offer headline over a scrimmed training photo, with a rounded
//  ISP-blue pill CTA. ISP has NO guarantee, so there is no guarantee slot — the
//  standing offer is the free first session. Built from scratch on the ISP design
//  system.
// ============================================================================

import config from "./fresh-isp-offer.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" },
  body: { fontFamily: "'Barlow', 'Inter', system-ui, sans-serif" },
};

function FreshIspOffer() {
  return <LayerStack config={config} />;
}

export default FreshIspOffer;

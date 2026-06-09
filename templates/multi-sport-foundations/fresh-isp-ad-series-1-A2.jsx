// ============================================================================
//  FRESH-ISP-AD-SERIES-1-A2 — ISP "quote-card" statement (beat C, Ad 1)
// ============================================================================
//  A clean ISP statement card: a raised ink panel, an oversized blue quotation
//  glyph, a large Barlow Condensed pull-quote, a blue accent rule and the ISP
//  wordmark. Graphic / media-free (mirrors its media-free example ex-012).
//  Built from scratch on the ISP design system. No AA defaults, no red.
// ============================================================================

import config from "./fresh-isp-ad-series-1-A2.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" },
  body: { fontFamily: "'Barlow', 'Inter', system-ui, sans-serif" },
};

function FreshIspAdSeries1A2() {
  return <LayerStack config={config} />;
}

export default FreshIspAdSeries1A2;

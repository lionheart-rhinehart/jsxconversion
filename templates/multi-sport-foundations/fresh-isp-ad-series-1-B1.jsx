// ============================================================================
//  FRESH-ISP-AD-SERIES-1-B1 — ISP "ugc-selfie" reframe (beat B, Ad 2)
// ============================================================================
//  Native, almost-no-design: a full-bleed coach/athlete talking-head still, a
//  small blue eyebrow chip, and a single Barlow Condensed caption hook over a
//  bottom scrim. Carries real ISP media (mirrors its media example ex-035).
//  Built from scratch on the ISP design system. No AA defaults, no red.
// ============================================================================

import config from "./fresh-isp-ad-series-1-B1.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" },
  body: { fontFamily: "'Barlow', 'Inter', system-ui, sans-serif" },
};

function FreshIspAdSeries1B1() {
  return <LayerStack config={config} />;
}

export default FreshIspAdSeries1B1;

// ============================================================================
//  FRESH-ISP-HOOK — ISP-native hook card (Ideal Sports Performance)
// ============================================================================
//  ISP design language: full-bleed training photo + diagonal ink scrim, a white
//  pill eyebrow in ISP blue, a tight Barlow Condensed hook anchored in the lower
//  third over the gradient, a blue accent bar, and the ISP wordmark. Authored in
//  ISP tokens directly (blue #2573b7, Barlow Condensed/Barlow) — NOT a recolored
//  AA layout. Built from scratch on the ISP design system.
// ============================================================================

import config from "./fresh-isp-hook.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" },
  body: { fontFamily: "'Barlow', 'Inter', system-ui, sans-serif" },
};

function FreshIspHook() {
  return <LayerStack config={config} />;
}

export default FreshIspHook;

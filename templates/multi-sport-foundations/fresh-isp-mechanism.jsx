// ============================================================================
//  FRESH-ISP-MECHANISM — ISP-native mechanism card (photo top / ink panel)
// ============================================================================
//  Full-bleed training photo up top, an ink panel below carrying a Barlow
//  Condensed mechanism claim + Barlow support line and a blue accent bar. ISP
//  design system; built from scratch (no AA layout, no red).
// ============================================================================

import config from "./fresh-isp-mechanism.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Barlow Condensed', 'Oswald', sans-serif" },
  body: { fontFamily: "'Barlow', 'Inter', system-ui, sans-serif" },
};

function FreshIspMechanism() {
  return <LayerStack config={config} />;
}

export default FreshIspMechanism;

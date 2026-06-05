// FRESH-BATTI-GRIND-TRAP-N1 — static — Batti-native hook card.
// Batti design system (NOT AA): photo fills the top, a HARD BLACK TYPE BAND holds
// the copy below (the brand's alternating black/white-band device), a single red
// rule marks the band edge, the eyebrow is plain letterspaced MONO RED (not a
// chip), the hook is stacked condensed ALL-CAPS Saira Condensed, and the circular
// BP badge + wordmark anchor the bottom. Role-annotated + promotable.

import config from "./fresh-batti-grind-trap-N1.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans THIS entry file for literal
// fontFamily strings; fonts referenced only via config are invisible to it.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshBattiGrindTrapN1() {
  return <LayerStack config={config} />;
}

export default FreshBattiGrindTrapN1;

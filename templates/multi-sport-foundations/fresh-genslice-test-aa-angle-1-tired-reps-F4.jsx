// FRESH-GENSLICE-TEST-AA-ANGLE-1-TIRED-REPS-F4 — static — offer-card.
// Generation engine (thin slice), guided by example ex-027-offer-card: a structured
// white deal card over a darkened action photo — offer, the VERBATIM guarantee, and a
// red CTA button. Brand from the AA kit; offer/cta verbatim (copy-library
// ad-1.bodyLine.4.1 / 4.2); guarantee is the locked verbatim risk-reversal.

import config from "./fresh-genslice-test-aa-angle-1-tired-reps-F4.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "Anton" },
  body: { fontFamily: "'Geist', system-ui, sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshGensliceF4() {
  return <LayerStack config={config} />;
}

export default FreshGensliceF4;

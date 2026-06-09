// FRESH-GENSLICE-TEST-AA-ANGLE-1-TIRED-REPS-F3 — static — quote-card.
// Generation engine (thin slice), guided by example ex-012-quote-card: a large
// pull-quote + attribution over a SUBTLE (heavily scrimmed) background. Brand from
// the AA kit; testimonial verbatim (copy-library ad-1.bodyLine.1.1).

import config from "./fresh-genslice-test-aa-angle-1-tired-reps-F3.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "Anton" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshGensliceF3() {
  return <LayerStack config={config} />;
}

export default FreshGensliceF3;

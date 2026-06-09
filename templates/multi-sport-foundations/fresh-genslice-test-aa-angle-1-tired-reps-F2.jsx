// FRESH-GENSLICE-TEST-AA-ANGLE-1-TIRED-REPS-F2 — static — training-scene.
// Generation engine (thin slice), guided by example ex-031-training-scene: a wide
// facility photo where the PLACE dominates, with small bottom-anchored claim + byline.
// Brand from the AA kit; claim verbatim (copy-library ad-1.bodyLine.1.3).

import config from "./fresh-genslice-test-aa-angle-1-tired-reps-F2.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "Anton" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshGensliceF2() {
  return <LayerStack config={config} />;
}

export default FreshGensliceF2;

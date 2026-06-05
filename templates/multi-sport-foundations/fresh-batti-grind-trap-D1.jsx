// FRESH-BATTI-GRIND-TRAP-D1 — static — Batti-native statement card (WHITE band).
// Batti alternating-band device: photo top, a hard WHITE band below carrying a
// bold BLACK Saira Condensed statement (the inverse of N1's black band), mono red
// eyebrow, chrome BP badge. No AA velocity graph. Role-annotated + promotable.

import config from "./fresh-batti-grind-trap-D1.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshBattiGrindTrapD1() {
  return <LayerStack config={config} />;
}

export default FreshBattiGrindTrapD1;

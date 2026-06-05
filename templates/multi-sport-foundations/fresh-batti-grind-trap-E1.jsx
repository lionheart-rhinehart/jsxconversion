// FRESH-BATTI-GRIND-TRAP-E1 — static — Batti-native BIG-STAT proof card.
// Batti number device (NOT the AA study card): a huge solid tabular stat with a
// RED unit, a secondary OUTLINE stadium numeral (-webkit-text-stroke), mono labels,
// a claim + proof line, all over darkened footage. Role-annotated + promotable.

import config from "./fresh-batti-grind-trap-E1.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshBattiGrindTrapE1() {
  return <LayerStack config={config} />;
}

export default FreshBattiGrindTrapE1;

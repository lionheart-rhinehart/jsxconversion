// FRESH-BATTI-QUOTE — static — Batti-native red-left-border quote / reframe card.
// Full darkened photo with an editorial reframe line set off by Batti's red left
// border (the brand's quote device), mono red eyebrow, BP badge. Role-annotated.

import config from "./fresh-batti-quote.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshBattiQuote() {
  return <LayerStack config={config} />;
}

export default FreshBattiQuote;

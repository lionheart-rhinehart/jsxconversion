// FRESH-BATTI-OFFER — static — Batti-native offer / guarantee card.
// Photo top, black offer band below: offer headline, the LOCKED 30-session
// guarantee in a red-left-border block (Batti's quote device), a red CTA button,
// BP badge. Role-annotated; guarantee role is auto-fill-locked. Promotable.

import config from "./fresh-batti-offer.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshBattiOffer() {
  return <LayerStack config={config} />;
}

export default FreshBattiOffer;

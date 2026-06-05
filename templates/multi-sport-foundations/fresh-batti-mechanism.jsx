// FRESH-BATTI-MECHANISM — static — Batti-native full-bleed statement card.
// No band: a single big Saira Condensed statement anchored in the lower third over
// a bottom-weighted scrim, marked by a short red rule (Batti's 3px statement
// device), mono red eyebrow, BP badge. Role-annotated + promotable.

import config from "./fresh-batti-mechanism.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshBattiMechanism() {
  return <LayerStack config={config} />;
}

export default FreshBattiMechanism;

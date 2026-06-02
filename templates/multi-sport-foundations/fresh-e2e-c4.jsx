// FRESH-E2E-C4 — static — "Tired rep → Slow code → Slow athlete" chain card.
// Thin data-driven shell; all layers live in fresh-e2e-c4.config.json and render
// through the generic z-ordered LayerStack.

import config from "./fresh-e2e-c4.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans THIS entry file for literal
// fontFamily strings; fonts referenced only via config are invisible to it.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshE2eC4() {
  return <LayerStack config={config} />;
}

export default FreshE2eC4;

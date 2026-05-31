// ============================================================================
//  FRESH-SMOKE-STATIC — "The Ceiling" proof card (compose-creative output)
// ============================================================================
//  Media-free, type-only proof card on brand rails (head-coach-to-parent voice,
//  two-tone display headline, code-comment eyebrows, guarantee verbatim). Thin,
//  data-driven shell — every layer lives in fresh-smoke-static.config.json and
//  renders through the z-ordered LayerStack. Authored fresh (not from the bank)
//  to smoke-test the fresh-creation path; promotable to a numbered cluster-*.
// ============================================================================

import config from "./fresh-smoke-static.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans THIS entry file for literal
// fontFamily strings. Anton (display), JetBrains Mono (eyebrows/metrics), and
// Geist (body) must each appear here verbatim or the browser falls back to a
// generic sans.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
  body: { fontFamily: "'Geist', 'Inter', system-ui, sans-serif" },
};

function FreshSmokeStatic() {
  return <LayerStack config={config} />;
}

export default FreshSmokeStatic;

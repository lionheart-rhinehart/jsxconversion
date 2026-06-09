// ============================================================================
//  FRESH-ENGINE-TRANSFER-NOBLESVILLE-D4 — AA "split-panel" reframe (STATIC)
// ============================================================================
//  A media-backed split: the top ~45% is a real AA action clip (squat) and the
//  bottom ~55% is a deep-ink panel carrying the reframe headline — the engine,
//  not the paint. A red seam rule divides the two panels (one accent only).
//  Mirrors the split-panel example ex-037-coach-portrait. Built on AA rails.
//  Graphic shell only — copy + clip fill at render via the role join.
//
// _FONT_PREFLIGHT: Anton, Geist, JetBrains Mono
// ============================================================================

import config from "./fresh-engine-transfer-noblesville-D4.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  body: { fontFamily: "'Geist', 'Inter', system-ui, sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshEngineTransferNoblesvilleD4() {
  return <LayerStack config={config} />;
}

export default FreshEngineTransferNoblesvilleD4;

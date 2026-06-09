// ============================================================================
//  FRESH-ENGINE-TRANSFER-NOBLESVILLE-F1 — AA "offer-card" (graphic, media-free)
// ============================================================================
//  The offer + verbatim guarantee for the "engine under every sport" angle.
//  Photo-free GRAPHIC (mirrors its media-free example ex-027-offer-card): an
//  INK #0a0b0d frame, a raised ink panel, a giant Anton offer headline as the
//  dominant element, the locked guarantee on a red #c4141d band, and a red CTA
//  pill in the bottom band. One accent (#c4141d), Anton / Geist / JetBrains
//  Mono only. No media, no Stage, no animation — static-react path → PNG.
// ============================================================================
// _FONT_PREFLIGHT: Anton, Geist, JetBrains Mono

import config from "./fresh-engine-transfer-noblesville-F1.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

function FreshEngineTransferNoblesvilleF1() {
  return <LayerStack config={config} />;
}

export default FreshEngineTransferNoblesvilleF1;

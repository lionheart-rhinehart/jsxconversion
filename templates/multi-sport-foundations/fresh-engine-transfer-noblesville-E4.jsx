// ============================================================================
//  FRESH-ENGINE-TRANSFER-NOBLESVILLE-E4 — AA "ugc-selfie" proof (STATIC)
// ============================================================================
//  A media-backed UGC/selfie-feel proof: a full-bleed athlete still (kettlebell
//  swings) under a legibility scrim. A small mono "REAL NUMBERS" tag top-left
//  reads as a creator stamp; a bottom caption bar carries the eyebrow, an Anton
//  uppercase hook, the red accent rule, and the AA wordmark — the lower-third
//  caption look that separates this from a plain hero card.
//  Built on the Athletes Acceleration rails (accent #c4141d, ink #0a0b0d,
//  Anton / Geist / JetBrains Mono). Mirrors example ex-036-ugc-selfie.
// ============================================================================

// _FONT_PREFLIGHT: Anton, Geist, JetBrains Mono

import config from "./fresh-engine-transfer-noblesville-E4.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

function FreshEngineTransferNoblesvilleE4() {
  return <LayerStack config={config} />;
}

export default FreshEngineTransferNoblesvilleE4;

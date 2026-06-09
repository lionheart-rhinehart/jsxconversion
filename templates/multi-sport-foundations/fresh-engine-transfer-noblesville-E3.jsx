// ============================================================================
//  FRESH-ENGINE-TRANSFER-NOBLESVILLE-E3 — AA "quote-card" testimonial (static)
// ============================================================================
//  A clean AA statement card: a raised ink panel, an oversized red quotation
//  glyph, a large Geist testimonial in sentence case, a red accent rule, a
//  mono byline and the AA wordmark. Graphic / media-free (mirrors its media-
//  free example ex-012-quote-card). On AA rails — ink ground, one red accent.
// ============================================================================
// _FONT_PREFLIGHT: Anton, Geist, JetBrains Mono

import config from "./fresh-engine-transfer-noblesville-E3.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

function FreshEngineTransferNoblesvilleE3() {
  return <LayerStack config={config} />;
}

export default FreshEngineTransferNoblesvilleE3;

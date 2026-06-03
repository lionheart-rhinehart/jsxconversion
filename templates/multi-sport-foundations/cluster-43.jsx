// ============================================================================
//  CLUSTER 43 — Stacked hook (kicker → headline → subhead)
// ============================================================================
//  The hook-layout template: one verbatim multi-segment hook laid top→bottom as
//  KICKER (small lead-in) → HEADLINE (the main thought) → SUBHEAD (the rest),
//  split by `splitHook` (roles.mjs). Slots are sized for a LONG hook (headline
//  maxChars 72) so buildRefPools doesn't drop to a shorter 2-segment alternative
//  and lose the kicker. Designed for media-backed (asset.media) cards.
// ============================================================================

import config from "./cluster-43.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster43() {
  return <LayerStack config={config} />;
}

export default Cluster43;

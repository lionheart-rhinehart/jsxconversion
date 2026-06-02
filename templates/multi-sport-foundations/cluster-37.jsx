// ============================================================================
//  CLUSTER 37 — Mechanism velocity-chart (data-as-art, AR6, beat-C)
// ============================================================================
//  The Velocity Drop, drawn from rect primitives: bars fall rep by rep
//  (white → muted → red), a red 10% cutoff line fires, "SET ENDS HERE". The
//  chart SHOWS the mechanism instead of asserting it. Mono anchor + Anton claim
//  + brand. No photo. Editable: bars/labels carry tags.
// ============================================================================

import config from "./cluster-37.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster37() {
  return <LayerStack config={config} />;
}

export default Cluster37;

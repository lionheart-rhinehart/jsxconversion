// FRESH-E2E-A2-HOOK — static — lone hook over dark protection gradient.
// The playbook's beat-A "lone-hook" pattern (docs/creative-playbook.md): one
// dominant hook anchored lower-third over a bottom-weighted gradient, athlete
// photo filling the frame, eyebrow chip. Role-annotated. Promotable to a cluster.

import config from "./fresh-e2e-a2-hook.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans THIS entry file for literal
// fontFamily strings; fonts referenced only via config are invisible to it.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function FreshE2eA2Hook() {
  return <LayerStack config={config} />;
}

export default FreshE2eA2Hook;

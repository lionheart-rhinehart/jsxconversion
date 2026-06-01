// FRESH-E2E-E5-TESTIMONIAL — static — verified Google-review card.
// Role-annotated per docs/creative-playbook.md: eyebrow + testimonial + byline.
// Thin shell; all layers live in fresh-e2e-e5-testimonial.config.json and render
// through the generic z-ordered LayerStack. Promotable to a numbered cluster.

import config from "./fresh-e2e-e5-testimonial.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans THIS entry file for literal
// fontFamily strings; fonts referenced only via config are invisible to it.
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
  body: { fontFamily: "'Geist', sans-serif" },
};

function FreshE2eE5Testimonial() {
  return <LayerStack config={config} />;
}

export default FreshE2eE5Testimonial;

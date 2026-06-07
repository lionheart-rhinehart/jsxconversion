// Phase C demo — text-on-video layer config. The editor + run-campaign route a
// video-background layer config to the MP4 path (scripts/lib/layer-config-video.mjs);
// this thin LayerStack shell is the static-PNG fallback / preview parity, so the
// template still resolves through the normal static pipeline when needed.
import config from "./phase-c-video-demo.config.json";
import { LayerStack } from "../multi-sport-foundations/_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans this entry file for literal
// fontFamily strings (fonts referenced only via config are invisible to it).
const _FONT_PREFLIGHT = {
  display: { fontFamily: "'Anton', 'Oswald', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function PhaseCVideoDemo() {
  return <LayerStack config={config} />;
}

export default PhaseCVideoDemo;

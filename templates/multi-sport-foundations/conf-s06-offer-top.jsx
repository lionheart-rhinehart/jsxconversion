// CONF S06 — top-band offer + guarantee + CTA. Batti-native static.
import config from "./conf-s06-offer-top.config.json";
import { LayerStack } from "./_helpers.jsx";
export const WIDTH = config.width;
export const HEIGHT = config.height;
const _FONT_PREFLIGHT = { display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" }, mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" } };
function ConfS06() { return <LayerStack config={config} />; }
export default ConfS06;

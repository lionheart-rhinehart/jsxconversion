// CONF S01 — white-band hook (black text). Batti-native static.
import config from "./conf-s01-whiteband.config.json";
import { LayerStack } from "./_helpers.jsx";
export const WIDTH = config.width;
export const HEIGHT = config.height;
const _FONT_PREFLIGHT = { display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" }, mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" } };
function ConfS01() { return <LayerStack config={config} />; }
export default ConfS01;

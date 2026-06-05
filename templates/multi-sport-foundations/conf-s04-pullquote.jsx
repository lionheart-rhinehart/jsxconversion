// CONF S04 — centered pull-quote with red quote mark. Batti-native static.
import config from "./conf-s04-pullquote.config.json";
import { LayerStack } from "./_helpers.jsx";
export const WIDTH = config.width;
export const HEIGHT = config.height;
const _FONT_PREFLIGHT = { display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" }, mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" } };
function ConfS04() { return <LayerStack config={config} />; }
export default ConfS04;

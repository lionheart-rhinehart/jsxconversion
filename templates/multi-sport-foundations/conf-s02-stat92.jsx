// CONF S02 — centered 92% stat. Batti-native static.
import config from "./conf-s02-stat92.config.json";
import { LayerStack } from "./_helpers.jsx";
export const WIDTH = config.width;
export const HEIGHT = config.height;
const _FONT_PREFLIGHT = { display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" }, mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" } };
function ConfS02() { return <LayerStack config={config} />; }
export default ConfS02;

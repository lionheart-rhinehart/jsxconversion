// CONF S03 — diagonal black/white split. Batti-native static.
import config from "./conf-s03-diagonal.config.json";
import { LayerStack } from "./_helpers.jsx";
export const WIDTH = config.width;
export const HEIGHT = config.height;
const _FONT_PREFLIGHT = { display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" }, mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" } };
function ConfS03() { return <LayerStack config={config} />; }
export default ConfS03;

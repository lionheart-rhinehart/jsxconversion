// CONF S05 — two-kinds comparison rows. Batti-native static.
import config from "./conf-s05-twocol.config.json";
import { LayerStack } from "./_helpers.jsx";
export const WIDTH = config.width;
export const HEIGHT = config.height;
const _FONT_PREFLIGHT = { display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" }, mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" } };
function ConfS05() { return <LayerStack config={config} />; }
export default ConfS05;

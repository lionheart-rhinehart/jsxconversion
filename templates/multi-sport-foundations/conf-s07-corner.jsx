// CONF S07 — corner red/black accent bars + statement. Batti-native static.
import config from "./conf-s07-corner.config.json";
import { LayerStack } from "./_helpers.jsx";
export const WIDTH = config.width;
export const HEIGHT = config.height;
const _FONT_PREFLIGHT = { display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" }, mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" } };
function ConfS07() { return <LayerStack config={config} />; }
export default ConfS07;

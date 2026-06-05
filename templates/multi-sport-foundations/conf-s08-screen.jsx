// CONF S08 — on-screen rising-data mock + mechanism statement. Batti-native static.
import config from "./conf-s08-screen.config.json";
import { LayerStack } from "./_helpers.jsx";
export const WIDTH = config.width;
export const HEIGHT = config.height;
const _FONT_PREFLIGHT = { display: { fontFamily: "'Saira Condensed', 'Oswald', sans-serif" }, mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" } };
function ConfS08() { return <LayerStack config={config} />; }
export default ConfS08;

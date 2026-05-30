// ============================================================================
//  CLUSTER 17 — FOUNDATIONAL YOUTH PROGRAM (music-player UI)
// ============================================================================
//  Thin, data-driven shell. A full-frame baseball-pitcher photo sits under a
//  music-player interface: a white rounded "album-art" frame crops the athlete,
//  a now-playing block (FOUNDATIONAL YOUTH PROGRAM / HOW LONG CAN YOU LAST?)
//  rides above a progress bar and transport controls (one pre-extracted chrome
//  PNG), and a lower HOW LONG CAN YOU LAST? heading + mono microscript anchor
//  the bottom over a faded AA logo. All layers live in cluster-17.config.json
//  and render through the z-ordered LayerStack. Edit at
//  localhost:5173/#cluster-17.
// ============================================================================

import config from "./cluster-17.config.json";
import { LayerStack } from "./_helpers.jsx";

export const WIDTH = config.width;
export const HEIGHT = config.height;

// Font preflight markers — the renderer scans THIS entry file for literal
// fontFamily strings. Fonts referenced only via config inside _helpers.jsx are
// invisible to it, so every font used must appear here verbatim.
const _FONT_PREFLIGHT = {
  body: { fontFamily: "'Geist', sans-serif" },
  mono: { fontFamily: "'JetBrains Mono', ui-monospace, monospace" },
};

function Cluster17() {
  return <LayerStack config={config} />;
}

export default Cluster17;

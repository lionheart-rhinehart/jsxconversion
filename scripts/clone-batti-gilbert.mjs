// Clone the 3 Batti Manteno campaigns → Gilbert. ONLY change: the location name
// (MANTENO → GILBERT). Same brand, same templates, same copy, same media (reuse),
// same logo. location:"gilbert" drives the eyebrow anchor (GILBERT, AZ → "GILBERT
// SPORT PARENTS"); the MANTENO→GILBERT textSwap catches any baked-in eyebrow string.
//   node scripts/clone-batti-gilbert.mjs
import { cloneTarget } from "./lib/clone-core.mjs";

const ROOT = process.cwd();
const WS = { workspace: "batti-performance", workspaceId: "4b3290f2-6cd8-4fb7-b208-e1c30aeaccad", destFolder: null, destFolderId: null };
const PAIRS = [
  ["grind-trap-manteno", "grind-trap-gilbert"],
  ["confidence-manteno", "confidence-gilbert"],
  ["more-games-manteno", "more-games-gilbert"],
];

for (const [src, dest] of PAIRS) {
  const r = cloneTarget({
    projectRoot: ROOT,
    srcCampaign: src,
    destCampaign: dest,
    textSwaps: [{ from: /MANTENO/g, to: "GILBERT" }],
    location: "gilbert",
    mediaPolicy: "reuse",
    workspace: WS,
  });
  console.log(`${r.destCampaign}: ${r.counts.editConfigs} edit configs, ${r.counts.templateDataSwaps} templateData swaps, ${r.counts.configChanges} config changes`);
}
console.log("done");

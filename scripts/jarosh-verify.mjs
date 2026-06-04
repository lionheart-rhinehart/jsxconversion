// TEMP verify: download 2 test media, clone grind-trap → grind-trap-ankeny,
// report static/motion media bindings (proves the clone-core static-media fix).
import { listFolderMedia, downloadToCache } from "./lib/kraken.mjs";
import { cloneTarget } from "./lib/clone-core.mjs";
import { buildPaletteMap } from "./lib/palette.mjs";
import { loadBrandFile } from "./lib/brand-kit.mjs";
import { readFileSync } from "node:fs";

const WS = "620313c9-f0ea-43f1-a0f0-102f888e4985";
const IG = "9a5d4f27-1f91-424d-8bc4-2a4f9a452106";
const tests = [
  { rowId: "101007f9-d1ff-4a32-a1df-bd56d44ccdab", destDir: "templates/multi-sport-foundations/assets/jarosh" },
  { rowId: "4b6c5551-e0d8-4af1-a020-b49ad46f6a03", destDir: "brand/kraken-cache" },
];

// 1. download the 2 test rows
const rows = await listFolderMedia(WS, IG);
for (const t of tests) {
  const row = rows.find((r) => r.id === t.rowId);
  if (!row) { console.error("ROW NOT FOUND", t.rowId); continue; }
  const { path, skipped } = await downloadToCache(row, t.destDir);
  console.error(`${skipped ? "cached" : "downloaded"}: ${path}`);
}

// 2. build clone args (mirror the orchestrator)
const kit = loadBrandFile("jarosh-performance", "data").json;
const tags = kit.tags;
const paletteMap = buildPaletteMap(tags);
const identity = { logo: tags.logo, logoSrc: kit.logo_src, brand_name: tags.brand_name, url: tags.url };
const spec = JSON.parse(readFileSync("jarosh-repurpose.json", "utf8"));
const gt = spec.targets.find((t) => t.dest === "grind-trap-ankeny");
// mirror the orchestrator: spec swaps + the auto brand-name swap
const textSwaps = [...gt.textSwaps, { from: "ATHLETES ACCELERATION", to: "JAROSH PERFORMANCE" }];

const rep = cloneTarget({
  projectRoot: ".",
  srcCampaign: "grind-trap-carmel",
  destCampaign: "grind-trap-ankeny",
  textSwaps, paletteMap, identity,
  brand: "jarosh-performance", location: "ankeny",
  mediaPolicy: "replace", mediaMap: gt.media.map, workspace: null,
});
console.error("clone counts:", JSON.stringify(rep.counts));

// 3. report the A1/A2 bindings in the cloned plan
const plan = JSON.parse(readFileSync("campaigns/grind-trap-ankeny/creative-plan.json", "utf8"));
const assets = plan.angles ? plan.angles.flatMap((a) => a.assets || []) : (plan.assets || []);
for (const id of ["A2", "A1"]) {
  const a = assets.find((x) => x.id === id);
  console.error(`${id} (${a.format}): media=${a.media || "-"} clip=${a.clip || "-"} photo=${a.photo || "-"}`);
}

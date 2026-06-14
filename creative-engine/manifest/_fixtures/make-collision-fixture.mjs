#!/usr/bin/env node
// Builds a name-collision fixture: 5 assets whose cached filenames ALL collapse
// to "agility-drill*" (the real Kraken collision — naive filename selection is
// impossible), but whose full Kraken titles differ, so TAGS disambiguate them.
// CLEAN ROOM. Run: node creative-engine/manifest/_fixtures/make-collision-fixture.mjs
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "collision");
rmSync(dir, { recursive: true, force: true });
mkdirSync(dir, { recursive: true });

// Every FILE is named "agility-drill" + index (collision on the human handle).
// The sidecar carries the rich Kraken title + a stable krakenId.
const assets = [
  { file: "agility-drill.mp4",   krakenId: "kr-001", title: "Agility Drill - Ladder Quick Feet U12 Soccer" },
  { file: "agility-drill-1.mp4", krakenId: "kr-002", title: "Agility Drill - Cone Cuts U16 Football" },
  { file: "agility-drill-2.mp4", krakenId: "kr-003", title: "Agility Drill - Ladder Footwork U16 Soccer" },
  { file: "agility-drill-3.jpg", krakenId: "kr-004", title: "Agility Drill - Ladder Hold Static U12 Soccer" },
  { file: "agility-drill-4.mp4", krakenId: "kr-005", title: "Agility Drill - Generic Athlete (no age)" },
];

for (const a of assets) {
  writeFileSync(join(dir, a.file), ""); // empty placeholder — tagging reads name/sidecar/ext only
  writeFileSync(
    join(dir, a.file + ".meta.json"),
    JSON.stringify({ krakenId: a.krakenId, title: a.title, folder: "raw-footage/agility" }, null, 2),
  );
}

console.log(`fixture written: ${dir} (${assets.length} colliding assets + sidecars)`);

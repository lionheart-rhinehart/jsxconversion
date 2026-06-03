// One-off: the 7 grind-trap videos have NO location text, so they're identical
// across locations. Render them once (in carmel), then copy into milford +
// noblesville and patch each plan/manifest so export treats them as rendered.
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = process.cwd();
const VIDEO_IDS = ["A1", "C1", "E1", "F1", "F3", "FA1", "BR1"];
const SRC_CAMP = "grind-trap-carmel";
const DEST_CAMPS = ["grind-trap-milford", "grind-trap-noblesville"];
const ANGLE = "grind-trap";
const stamp = new Date().toISOString();

for (const camp of DEST_CAMPS) {
  const planPath = join(ROOT, "campaigns", camp, "creative-plan.json");
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  const angle = plan.angles.find((a) => a.id === ANGLE);

  const manPath = join(ROOT, "out", "campaigns", camp, "manifest.json");
  const man = existsSync(manPath) ? JSON.parse(readFileSync(manPath, "utf8")) : { campaign: camp, cells: [] };
  man.cells = man.cells || [];

  let n = 0;
  for (const id of VIDEO_IDS) {
    const srcFile = join(ROOT, "out", "campaigns", SRC_CAMP, ANGLE, `${id}.mp4`);
    if (!existsSync(srcFile)) { console.error(`MISSING source ${srcFile}`); continue; }
    const relOut = `out/campaigns/${camp}/${ANGLE}/${id}.mp4`;
    const destFile = join(ROOT, relOut);
    mkdirSync(dirname(destFile), { recursive: true });
    copyFileSync(srcFile, destFile);

    const asset = angle.assets.find((s) => s.id === id);
    if (asset) {
      asset.status = "rendered";
      asset.output = relOut;
      asset.thumb = relOut;
      asset.renderedAt = stamp;
    }
    const cell = man.cells.find((c) => c.asset === id && c.angle === ANGLE);
    const cellData = { angle: ANGLE, asset: id, source: asset?.source === "fresh" ? "fresh" : "template", format: "video", status: "rendered", output: relOut };
    if (cell) Object.assign(cell, cellData); else man.cells.push(cellData);
    n++;
  }
  writeFileSync(planPath, JSON.stringify(plan, null, 2));
  writeFileSync(manPath, JSON.stringify(man, null, 2));
  console.log(`${camp}: copied ${n} videos, plan + manifest patched`);
}
console.log("done");

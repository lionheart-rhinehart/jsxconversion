// One-off: confidence neutral videos (E1, F1, BR1) have no location text →
// identical across locations. E2 (quote-card) DOES carry location text and is
// rendered per location, so it's NOT copied. Render the 3 neutral videos once
// (carmel) and copy into milford + noblesville; patch plan + manifest.
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = process.cwd();
const VIDEO_IDS = ["E1", "F1", "BR1"];
const SRC_CAMP = "confidence-carmel";
const DEST_CAMPS = ["confidence-milford", "confidence-noblesville"];
const ANGLE = "proof-confidence";
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
    if (asset) { asset.status = "rendered"; asset.output = relOut; asset.thumb = relOut; asset.renderedAt = stamp; }
    const cell = man.cells.find((c) => c.asset === id && c.angle === ANGLE);
    const cd = { angle: ANGLE, asset: id, source: asset?.source === "fresh" ? "fresh" : "template", format: "video", status: "rendered", output: relOut };
    if (cell) Object.assign(cell, cd); else man.cells.push(cd);
    n++;
  }
  writeFileSync(planPath, JSON.stringify(plan, null, 2));
  writeFileSync(manPath, JSON.stringify(man, null, 2));
  console.log(`${camp}: copied ${n} neutral videos, plan + manifest patched`);
}
console.log("done");

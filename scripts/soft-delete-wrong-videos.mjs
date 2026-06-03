// One-off recovery: the angle-1 (grind-trap) videos A1,C1,E1,F1,F3,FA1 were
// exported to the Milford + Noblesville Kraken folders carrying CARMEL's eyebrow
// (eyebrow is force-set from the location tier; they were copied from Carmel).
// Soft-delete those rows (set deleted_at) so the corrected re-renders re-ingest
// (findExistingByMeta filters deleted_at=is.null). Statics + BR1 are correct and
// left untouched.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadCreds } from "./lib/kraken.mjs";

const ROOT = process.cwd();
const VIDEO_IDS = ["A1", "C1", "E1", "F1", "F3", "FA1"];
const CAMPS = ["grind-trap-milford", "grind-trap-noblesville"];
const stamp = new Date().toISOString();
const { host, serviceKey } = loadCreds();
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation" };

async function softDelete(id) {
  const r = await fetch(`https://${host}/rest/v1/content_outputs?id=eq.${id}`, {
    method: "PATCH", headers, body: JSON.stringify({ deleted_at: stamp }),
  });
  const body = await r.text();
  if (!r.ok) throw new Error(`PATCH ${r.status}: ${body.slice(0, 200)}`);
  const rows = body ? JSON.parse(body) : [];
  return rows.length;
}

for (const camp of CAMPS) {
  const planPath = join(ROOT, "campaigns", camp, "creative-plan.json");
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  const angle = plan.angles.find((a) => a.id === "grind-trap");
  let deleted = 0;
  for (const id of VIDEO_IDS) {
    const asset = angle.assets.find((s) => s.id === id);
    const kid = asset && asset.kraken && asset.kraken.id;
    if (!kid) { console.error(`${camp}/${id}: no kraken id — skipping`); continue; }
    const n = await softDelete(kid);
    console.log(`${camp}/${id}: soft-deleted ${kid} (rows=${n})`);
    delete asset.kraken; // clear so re-export re-ingests
    deleted++;
  }
  writeFileSync(planPath, JSON.stringify(plan, null, 2));
  console.log(`${camp}: ${deleted} rows soft-deleted, plan kraken refs cleared`);
}
console.log("done");

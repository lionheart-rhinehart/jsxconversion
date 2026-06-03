// Generic soft-delete: node scripts/soft-delete-assets.mjs <campaign> <id1,id2,...>
// Soft-deletes each asset's existing Kraken row (set deleted_at) using the stored
// plan asset.kraken.id, then clears the ref so a re-export re-ingests the corrected
// file (findExistingByMeta filters deleted_at=is.null).
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadCreds } from "./lib/kraken.mjs";

const [campaign, idsArg] = process.argv.slice(2);
if (!campaign || !idsArg) { console.error("usage: soft-delete-assets.mjs <campaign> <id1,id2,...>"); process.exit(1); }
const ids = idsArg.split(",").map((s) => s.trim());
const ROOT = process.cwd();
const planPath = join(ROOT, "campaigns", campaign, "creative-plan.json");
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const stamp = new Date().toISOString();
const { host, serviceKey } = loadCreds();
const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", Prefer: "return=representation" };

for (const id of ids) {
  let found = false;
  for (const angle of plan.angles || []) {
    const asset = angle.assets.find((s) => s.id === id);
    if (!asset) continue;
    found = true;
    const kid = asset.kraken && asset.kraken.id;
    if (!kid) { console.error(`${campaign}/${id}: no kraken ref — skipping`); continue; }
    const r = await fetch(`https://${host}/rest/v1/content_outputs?id=eq.${kid}`, {
      method: "PATCH", headers, body: JSON.stringify({ deleted_at: stamp }),
    });
    const body = await r.text();
    if (!r.ok) { console.error(`${campaign}/${id}: PATCH ${r.status}: ${body.slice(0, 150)}`); continue; }
    const rows = body ? JSON.parse(body) : [];
    console.log(`${campaign}/${id}: soft-deleted ${kid} (rows=${rows.length})`);
    delete asset.kraken;
  }
  if (!found) console.error(`${campaign}/${id}: asset not in plan`);
}
writeFileSync(planPath, JSON.stringify(plan, null, 2));
console.log(`${campaign}: done`);

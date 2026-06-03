// Generic per-location cloner. Usage:
//   node scripts/clone-locations.mjs <srcCampaign> <destPrefix>
// Clones srcCampaign into <destPrefix>{carmel,milford,noblesville}, swapping ONLY
// the location token INDIANAPOLIS → city everywhere it appears: edit-config text/
// label fields (eyebrows, bylines) AND plan templateData string values. Resets
// statuses to "approved" so a full render produces every asset per-location.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const [src, prefix] = process.argv.slice(2);
if (!src || !prefix) { console.error("usage: clone-locations.mjs <srcCampaign> <destPrefix>"); process.exit(1); }
const ROOT = process.cwd();
const SRC = join(ROOT, "campaigns", src);
const LOCS = [
  { slug: "carmel",      city: "CARMEL",      wsId: "449c2295-38f3-4ee0-8ffb-9282614abea5" },
  { slug: "milford",     city: "MILFORD",     wsId: "f491d421-8dda-4a33-b112-86fe29b707c0" },
  { slug: "noblesville", city: "NOBLESVILLE", wsId: "d99a09e2-2810-4d39-ad24-d546b896b603" },
];
const COPY_FILES = ["copy-library.json", "ad-copy.md", "microscripts.md", "brief.md"];
const TOKEN = /INDIANAPOLIS/g;

function swapConfig(cfg, city) {
  let n = 0;
  for (const arr of [cfg.elements, cfg.fixedDesign, cfg.foregroundMedia]) {
    if (!Array.isArray(arr)) continue;
    for (const el of arr) for (const k of ["text", "label"])
      if (typeof el?.[k] === "string" && el[k].includes("INDIANAPOLIS")) { el[k] = el[k].replace(TOKEN, city); n++; }
  }
  return n;
}

for (const loc of LOCS) {
  const name = `${prefix}${loc.slug}`;
  const dest = join(ROOT, "campaigns", name);
  mkdirSync(join(dest, "edits"), { recursive: true });

  const plan = JSON.parse(readFileSync(join(SRC, "creative-plan.json"), "utf8"));
  plan.campaign = name;
  let tdSwaps = 0;
  for (const angle of plan.angles || []) {
    angle.location = loc.slug;
    for (const a of angle.assets || []) {
      a.status = "approved";
      delete a.output; delete a.thumb; delete a.renderedAt; delete a.editedAt; delete a.kraken;
      const td = a.templateData || {};
      for (const [k, v] of Object.entries(td))
        if (typeof v === "string" && v.includes("INDIANAPOLIS")) { td[k] = v.replace(TOKEN, loc.city); tdSwaps++; }
    }
  }
  writeFileSync(join(dest, "creative-plan.json"), JSON.stringify(plan, null, 2));
  for (const f of COPY_FILES) if (existsSync(join(SRC, f))) copyFileSync(join(SRC, f), join(dest, f));

  let cfgSwaps = 0, copied = 0;
  for (const f of readdirSync(join(SRC, "edits"))) {
    if (!f.endsWith(".config.json")) continue;
    const cfg = JSON.parse(readFileSync(join(SRC, "edits", f), "utf8"));
    cfgSwaps += swapConfig(cfg, loc.city);
    writeFileSync(join(dest, "edits", f), JSON.stringify(cfg, null, 2));
    copied++;
  }
  writeFileSync(join(dest, "kraken.json"), JSON.stringify({ workspace: loc.slug, workspaceId: loc.wsId, destFolderId: null }, null, 2));
  console.log(`${name}: ${copied} edit configs (${cfgSwaps} text swaps), ${tdSwaps} templateData swaps`);
}
console.log("done");

// Per-location cloner — now a thin wrapper over scripts/lib/clone-core.mjs so it
// can't drift from the repurpose pipeline. Usage:
//   node scripts/clone-locations.mjs <srcCampaign> <destPrefix>
// Clones srcCampaign into <destPrefix>{carmel,milford,noblesville}, swapping the
// location token INDIANAPOLIS → city everywhere (edit-config text/label AND plan
// templateData), resetting statuses to "approved" so a full render produces every
// asset per-location. (Colors/identity unchanged — location-only preset.)
import { cloneTarget } from "./lib/clone-core.mjs";

const [src, prefix] = process.argv.slice(2);
if (!src || !prefix) { console.error("usage: clone-locations.mjs <srcCampaign> <destPrefix>"); process.exit(1); }
const ROOT = process.cwd();
const LOCS = [
  { slug: "carmel",      city: "CARMEL",      wsId: "449c2295-38f3-4ee0-8ffb-9282614abea5" },
  { slug: "milford",     city: "MILFORD",     wsId: "f491d421-8dda-4a33-b112-86fe29b707c0" },
  { slug: "noblesville", city: "NOBLESVILLE", wsId: "d99a09e2-2810-4d39-ad24-d546b896b603" },
];

for (const loc of LOCS) {
  const r = cloneTarget({
    projectRoot: ROOT,
    srcCampaign: src,
    destCampaign: `${prefix}${loc.slug}`,
    textSwaps: [{ from: /INDIANAPOLIS/g, to: loc.city }],
    location: loc.slug,
    workspace: { workspace: loc.slug, workspaceId: loc.wsId, destFolder: null, destFolderId: null },
  });
  console.log(`${r.destCampaign}: ${r.counts.editConfigs} edit configs (${r.counts.configChanges} changes), ${r.counts.templateDataSwaps} templateData swaps`);
}
console.log("done");

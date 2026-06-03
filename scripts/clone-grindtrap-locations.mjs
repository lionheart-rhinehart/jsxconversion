// One-off: clone the test-run-2 grind-trap set into 3 AA-location campaigns,
// swapping ONLY the eyebrow city (INDIANAPOLIS → CARMEL / MILFORD / NOBLESVILLE).
// Nothing else changes. Statics carry the eyebrow in their edit config; the 7
// motion assets have no location text (identical across locations).
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "campaigns", "multisport-foundations-test-run-2");
const LOCS = [
  { slug: "carmel",      city: "CARMEL",      wsId: "449c2295-38f3-4ee0-8ffb-9282614abea5" },
  { slug: "milford",     city: "MILFORD",     wsId: "f491d421-8dda-4a33-b112-86fe29b707c0" },
  { slug: "noblesville", city: "NOBLESVILLE", wsId: "d99a09e2-2810-4d39-ad24-d546b896b603" },
];
const COPY_FILES = ["copy-library.json", "ad-copy.md", "microscripts.md", "brief.md"];

function swapEyebrow(cfg, city) {
  let n = 0;
  for (const arr of [cfg.elements, cfg.fixedDesign, cfg.foregroundMedia]) {
    if (!Array.isArray(arr)) continue;
    for (const el of arr) {
      if (el && el.tag === "eyebrow" && typeof el.text === "string" && el.text.includes("INDIANAPOLIS")) {
        el.text = el.text.replace(/INDIANAPOLIS/g, city);
        n++;
      }
    }
  }
  return n;
}

for (const loc of LOCS) {
  const name = `grind-trap-${loc.slug}`;
  const dest = join(ROOT, "campaigns", name);
  mkdirSync(join(dest, "edits"), { recursive: true });

  // 1. plan: rename campaign, set location, reset statuses to approved (render fresh)
  const plan = JSON.parse(readFileSync(join(SRC, "creative-plan.json"), "utf8"));
  plan.campaign = name;
  for (const angle of plan.angles || []) {
    angle.location = loc.slug;
    for (const a of angle.assets || []) {
      a.status = "approved";
      delete a.output; delete a.thumb; delete a.renderedAt; delete a.editedAt;
    }
  }
  writeFileSync(join(dest, "creative-plan.json"), JSON.stringify(plan, null, 2));

  // 2. supporting docs
  for (const f of COPY_FILES) {
    if (existsSync(join(SRC, f))) copyFileSync(join(SRC, f), join(dest, f));
  }

  // 3. edit configs — copy all, swap eyebrow city only
  let swapped = 0, copied = 0;
  for (const f of readdirSync(join(SRC, "edits"))) {
    if (!f.endsWith(".config.json")) continue;
    const cfg = JSON.parse(readFileSync(join(SRC, "edits", f), "utf8"));
    swapped += swapEyebrow(cfg, loc.city);
    writeFileSync(join(dest, "edits", f), JSON.stringify(cfg, null, 2));
    copied++;
  }

  // 4. kraken sidecar — AA-location workspace; dest folder filled in later
  writeFileSync(join(dest, "kraken.json"), JSON.stringify({
    workspace: loc.slug, workspaceId: loc.wsId,
    destFolder: null, destFolderId: null,
    _note: "destination folder pending — supplied at export",
  }, null, 2));

  console.log(`${name}: ${copied} edit configs (${swapped} eyebrows → "${loc.city} SPORT PARENT(S)"), plan + ${COPY_FILES.filter(f=>existsSync(join(dest,f))).length} docs, kraken ws=${loc.slug}`);
}
console.log("done");

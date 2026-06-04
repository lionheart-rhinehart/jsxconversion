// TEMP: clone every target in jarosh-repurpose.json (clone ONLY — no render, no
// export). Mirrors the orchestrator's clone phase so the review page can show the
// Jarosh creatives locally before any Kraken push.
import { cloneTarget } from "./lib/clone-core.mjs";
import { buildPaletteMap } from "./lib/palette.mjs";
import { loadBrandFile } from "./lib/brand-kit.mjs";
import { loadTier } from "./lib/fill-core.mjs";
import { readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from "node:fs";

// CRITICAL for media replace: clone-core copies the source's hand-edited static
// edits configs (edits/<angle>__<asset>.config.json), which bake the SOURCE brand's
// hand-placed photo (config.media.path = ./assets/swap-*.jpg). The static renderer
// uses the edits config verbatim if it exists (run-campaign.mjs:270) and IGNORES the
// plan's new a.media → every hand-edited static renders the OLD brand's photo. For a
// repurpose with replaced media those crops/photos are wrong anyway, so drop them and
// let render regenerate each static fresh from a.media.
function dropStaleEdits(dest) {
  const dir = `campaigns/${dest}/edits`;
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const f of readdirSync(dir)) {
    if (f.endsWith(".config.json")) { rmSync(`${dir}/${f}`); n++; }
  }
  return n;
}

// The brand-name swap only matches the full "ATHLETES ACCELERATION" string, so the
// BR1 logo-sting's SPLIT wordmark fields + baked url leak AA. Patch them per plan
// (identity completion — not a copy change). Safe: only touches these exact values.
function patchIdentityLeaks(dest) {
  const path = `campaigns/${dest}/creative-plan.json`;
  const plan = JSON.parse(readFileSync(path, "utf8"));
  const assets = plan.angles ? plan.angles.flatMap((a) => a.assets || []) : (plan.assets || []);
  let n = 0;
  for (const a of assets) {
    const td = a.templateData; if (!td) continue;
    if (td.wordmark1 === "ATHLETES") { td.wordmark1 = "JAROSH"; n++; }
    if (td.wordmark2 === "ACCELERATION") { td.wordmark2 = "PERFORMANCE"; n++; }
    if (typeof td.url === "string" && /ATHLETESACCEL\.COM/i.test(td.url)) { td.url = "JAROSHPERFORMANCE.FITNESS"; n++; }
  }
  if (n) writeFileSync(path, JSON.stringify(plan, null, 2));
  return n;
}

const spec = JSON.parse(readFileSync("jarosh-repurpose.json", "utf8"));
const kit = loadBrandFile(spec.brand, "data").json;
const tags = kit.tags;
const paletteMap = buildPaletteMap(tags);
const identity = { logo: tags.logo, logoSrc: kit.logo_src, brand_name: tags.brand_name, url: tags.url };
const srcBrandName = loadTier("brand", "athletes-acceleration", "data").tags?.brand_name;

const only = process.argv.slice(2); // optional: dest names to clone (default all)
for (const t of spec.targets) {
  if (only.length && !only.includes(t.dest)) continue;
  const textSwaps = [...(t.textSwaps || [])];
  if (srcBrandName && tags.brand_name && srcBrandName !== tags.brand_name) {
    textSwaps.push({ from: srcBrandName, to: tags.brand_name });
  }
  const rep = cloneTarget({
    projectRoot: ".",
    srcCampaign: t.source,
    destCampaign: t.dest,
    textSwaps, paletteMap, identity,
    brand: spec.brand, location: t.location,
    mediaPolicy: t.media?.policy || "reuse", mediaMap: t.media?.map || {},
    workspace: null,
  });
  const idn = patchIdentityLeaks(t.dest);
  const drp = (t.media?.policy && t.media.policy !== "reuse") ? dropStaleEdits(t.dest) : 0;
  console.error(`cloned ${t.source} → ${t.dest}: ${JSON.stringify(rep.counts)} (+${idn} identity-leak fixes, dropped ${drp} stale edits configs)`);
}

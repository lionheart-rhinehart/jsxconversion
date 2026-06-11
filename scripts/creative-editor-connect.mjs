#!/usr/bin/env node
// ============================================================================
//  scripts/creative-editor-connect.mjs — connect flattened Claude Design
//  templates to the editor as a CAMPAIGN (campaign-bound edits + Kraken-pinned).
// ----------------------------------------------------------------------------
//  Given a campaign slug whose flattened templates live in templates/<slug>/
//  (wf-<N><A|B|C>.{config.json,jsx}, produced by westfield-flatten.mjs), this
//  scaffolds the MINIMUM that makes the editor open them campaign-connected:
//    campaigns/<slug>/creative-plan.json   — angles(N) × assets(A/B/C) → template
//    campaigns/<slug>/edits/<angle>__<asset>.config.json — PRE-SEEDED from the
//        flattened config (the editor returns these verbatim — aa-campaign-plugin:207)
//    campaigns/<slug>/kraken.json          — {workspace,workspaceId} → editor auto-pins
//    .editor-config.json campaignTemplateDirs[<slug>] = ["templates/<slug>"]
//  Then prints the #camp:<slug>:<angle>:<asset> editor URLs.
//
//  Usage:
//    node scripts/creative-editor-connect.mjs <slug> [--workspace <name>] \
//         [--workspace-id <uuid>] [--brand <brand>] [--port <editorPort>]
//  NODE-ONLY.
// ============================================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const slug = argv.find((a) => !a.startsWith("--"));
const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const workspace = arg("--workspace");
const workspaceId = arg("--workspace-id");
const brand = arg("--brand") || "athletes-acceleration";
let port = arg("--port") || "5173";
if (!slug) { console.error("usage: creative-editor-connect <slug> [--workspace <name> --workspace-id <uuid>] [--brand <b>] [--port <p>]"); process.exit(1); }

const templateDir = join(ROOT, "templates", slug);
if (!existsSync(templateDir)) { console.error("no template dir:", templateDir, "— flatten the handoff first (westfield-flatten.mjs)"); process.exit(1); }
const campDir = join(ROOT, "campaigns", slug);
const editsDir = join(campDir, "edits");
mkdirSync(editsDir, { recursive: true });

// flattened wf-<N><A|B|C> → angles by N, assets by route letter
const ids = readdirSync(templateDir).filter((f) => /^wf-\d+[A-C]\.config\.json$/.test(f)).map((f) => f.replace(/\.config\.json$/, ""));
if (!ids.length) { console.error("no wf-<N><A|B|C>.config.json templates in", templateDir); process.exit(1); }
const byAngle = {};
for (const id of ids) { const m = id.match(/^wf-(\d+)([A-C])$/); (byAngle[+m[1]] = byAngle[+m[1]] || []).push({ route: m[2], id }); }
const angleNums = Object.keys(byAngle).map(Number).sort((a, b) => a - b);
const angles = angleNums.map((n) => ({
  id: `a${n}`,
  name: `Angle ${n}`,
  // All flattened designs are LayerStack configs → they edit in the POSITION editor
  // (format:"static" routes review.html there, NOT the motion-bank video modal).
  // `animated` marks that the EXPORT must use the motion render (run-campaign keys
  // off the config's `keyframes`, so the still-image format never drops the motion).
  assets: byAngle[n].sort((a, b) => a.route.localeCompare(b.route)).map(({ route, id }) => ({
    id: route, beat: route, format: "static", animated: true, source: "template", template: id,
  })),
}));

// creative-plan.json (the contract). `source:"claude-design"` + `skipValidation`
// mark this as pre-made/pre-approved content → the engine's generation-quality gate
// (validate-plan) is skipped so EXPORT + Approve work in the editing process. (A
// future opt-in "analyze against brand rules" button is the right place for that check.)
const plan = { schemaVersion: 1, campaign: slug, brand, source: "claude-design", skipValidation: true, angles };
writeFileSync(join(campDir, "creative-plan.json"), JSON.stringify(plan, null, 2) + "\n");

// pre-seed edits/ verbatim from each flattened config (so the editor opens THESE, no fill)
let seeded = 0;
for (const a of angles) for (const asset of a.assets) {
  writeFileSync(join(editsDir, `${a.id}__${asset.id}.config.json`), readFileSync(join(templateDir, `${asset.template}.config.json`), "utf8"));
  seeded++;
}

// kraken.json → /kraken/state → editor auto-pins the workspace
if (workspace || workspaceId) {
  writeFileSync(join(campDir, "kraken.json"), JSON.stringify({ workspace: workspace || null, workspaceId: workspaceId || null }, null, 2) + "\n");
}

// register the template root so findTemplate(id, campaign) resolves it (atomic merge)
const cfgPath = join(ROOT, ".editor-config.json");
let cfg = {};
try { if (existsSync(cfgPath)) cfg = JSON.parse(readFileSync(cfgPath, "utf8")) || {}; } catch (_) {}
cfg.campaignTemplateDirs = cfg.campaignTemplateDirs || {};
cfg.campaignTemplateDirs[slug] = [`templates/${slug}`];
const tmp = cfgPath + ".tmp"; writeFileSync(tmp, JSON.stringify(cfg, null, 2) + "\n"); renameSync(tmp, cfgPath);

console.log(`\nconnected campaign "${slug}": ${angles.length} angles · ${seeded} assets seeded into edits/`);
console.log(`brand: ${brand} · kraken: ${workspace || "(none)"} ${workspaceId || ""}`);
console.log(`\nOpen in the editor (with the dev servers up):`);
const sample = [];
for (const a of angles) for (const asset of a.assets) sample.push(`http://localhost:${port}/editor#camp:${slug}:${a.id}:${asset.id}`);
sample.slice(0, 6).forEach((u) => console.log("  " + u));
if (sample.length > 6) console.log(`  … ${sample.length} total (one per design)`);

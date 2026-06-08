#!/usr/bin/env node
// ============================================================================
//  scripts/cockpit.mjs — read-only status dashboard for every campaign
// ============================================================================
//  A standalone local cockpit (NO editor-server) showing, per campaign: planned /
//  rendered / approved / published counts, the compliance blocking count, perceptual
//  flags, and Tier-2 disagreement. Reads the same per-campaign artifacts the gate +
//  sidecars write. Read-only; its own free port so it never collides with the dev
//  servers.  node scripts/cockpit.mjs   (or COCKPIT_PORT=5800 node scripts/cockpit.mjs)
// ============================================================================

import { createServer } from "node:http";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CAMPAIGNS = join(PROJECT_ROOT, "campaigns");
const PORT = Number(process.env.COCKPIT_PORT) || 5800;

const readJson = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };

function campaignRow(slug) {
  const dir = join(CAMPAIGNS, slug);
  const plan = readJson(join(dir, "creative-plan.json"));
  if (!plan) return null;
  const assets = (plan.angles || []).flatMap((a) => a.assets || []);
  const manifest = readJson(join(PROJECT_ROOT, "out", "campaigns", slug, "manifest.json")) || { cells: [] };
  const validation = readJson(join(dir, "validation.json"));
  const perceptual = readJson(join(dir, "perceptual.json"));
  const tier2 = readJson(join(dir, "tier2.json"));
  const publish = readJson(join(dir, "publish-plan.json"));
  const rendered = (manifest.cells || []).filter((c) => c.status === "rendered").length;
  const approved = assets.filter((a) => a.status === "approved").length;
  const percBlocks = perceptual && perceptual.assets
    ? Object.values(perceptual.assets).reduce((n, a) => n + (a.violations || []).filter((v) => v.severity === "block").length, 0) : 0;
  const maxDisagree = tier2 && tier2.assets
    ? Math.max(0, ...Object.values(tier2.assets).map((a) => a.disagreement || 0)) : 0;
  return {
    campaign: slug, brand: plan.brand || "—",
    planned: assets.length, rendered, approved,
    blocking: validation ? validation.blocking : null,
    perceptual: perceptual ? (perceptual.ranOk === false ? "sentinel" : `${percBlocks} block`) : "—",
    tier2Disagree: tier2 ? maxDisagree : "—",
    publishable: publish ? publish.publishable.length : "—",
  };
}

function allRows() {
  const rows = [];
  for (const slug of readdirSync(CAMPAIGNS)) {
    try { if (!statSync(join(CAMPAIGNS, slug)).isDirectory()) continue; } catch { continue; }
    const r = campaignRow(slug);
    if (r) rows.push(r);
  }
  return rows.sort((a, b) => a.campaign.localeCompare(b.campaign));
}

const HTML = `<!doctype html><html><head><meta charset="utf-8"><title>Creative-engine cockpit</title>
<style>body{font:13px ui-monospace,monospace;background:#0b0c0e;color:#e8e8e8;margin:24px}
h1{font-size:15px;letter-spacing:.1em;color:#c4141d}table{border-collapse:collapse;width:100%}
th,td{padding:6px 10px;border-bottom:1px solid #222;text-align:left}th{color:#888;font-weight:400}
.bad{color:#ff5b5b}.ok{color:#4caf50}.warn{color:#e0a93a}td.n{text-align:right}</style></head>
<body><h1>// CREATIVE-ENGINE COCKPIT</h1><div id="t">loading…</div>
<script>
fetch('/state').then(r=>r.json()).then(rows=>{
  const cell=(v,cls)=>'<td class="'+(cls||'')+'">'+v+'</td>';
  const head='<tr><th>campaign</th><th>brand</th><th>planned</th><th>rendered</th><th>approved</th><th>blocking</th><th>perceptual</th><th>tier2 spread</th><th>publishable</th></tr>';
  const body=rows.map(r=>'<tr>'+cell(r.campaign)+cell(r.brand)
    +cell(r.planned,'n')+cell(r.rendered,'n')+cell(r.approved,'n')
    +cell(r.blocking,(r.blocking>0?'bad':r.blocking===0?'ok':''))
    +cell(r.perceptual,(/block|sentinel/.test(''+r.perceptual)&&r.perceptual!=='0 block'?'bad':'ok'))
    +cell(r.tier2Disagree,(r.tier2Disagree>=3?'warn':''))
    +cell(r.publishable,'n')+'</tr>').join('');
  document.getElementById('t').innerHTML='<table>'+head+body+'</table><p style="color:#666">'+rows.length+' campaigns · read-only</p>';
});
</script></body></html>`;

const server = createServer((req, res) => {
  if (req.url === "/state") { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(allRows())); return; }
  res.writeHead(200, { "content-type": "text/html" }); res.end(HTML);
});
server.listen(PORT, () => process.stderr.write(`[cockpit] http://localhost:${PORT}\n`));

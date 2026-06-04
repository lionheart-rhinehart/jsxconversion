#!/usr/bin/env node
// ============================================================================
//  scripts/kraken-export.mjs — push approved/rendered creatives INTO a chosen
//  Content-Library DESTINATION folder in The Kraken.
// ============================================================================
//  Usage:
//    node scripts/kraken-export.mjs <campaign> --workspace <loc> [--folder "<name>"]
//    node scripts/kraken-export.mjs <campaign> --dry-run        (report only)
//    node scripts/kraken-export.mjs <campaign> --only A2,F3
//
//  Per rendered asset (status:"rendered" + an existing output file):
//    1. dedup: findExistingByMeta on the (campaign,angle,asset) TRIPLE — skip
//       re-ingest if already in the library (storage upsert alone won't stop a
//       duplicate ROW).
//    2. video → ffmpeg poster frame uploaded as thumbnail (else the library card
//       shows a broken image).
//    3. upload bytes to Storage (service role, x-upsert) → public URL.
//    4. register via ingest-content (anon key) → content id.
//    5. PATCH folder_id to the destination folder (ingest carries no folder_id).
//    6. write {id,url,folder} back onto the asset + the campaign manifest.
//
//  Outward, hard-to-reverse (writes to live Supabase). Separate from rendering
//  so a connector problem never blocks a render. Run --dry-run first.
//  NOTE: exported MP4s are silent — audio mux is still deferred in run-campaign.
// ============================================================================

import {
  existsSync, mkdirSync, readFileSync, writeFileSync, rmSync,
} from "node:fs";
import { resolve, join, extname, basename } from "node:path";
import { spawnSync } from "node:child_process";
import {
  resolveWorkspaceId, loadWorkspaces, listFolders, resolveFolder,
  mimeForExt, bucketForMime, uploadToStorage, ingestContent, setFolder,
  findExistingByMeta, softDeleteContent,
} from "./lib/kraken.mjs";
import { exportExitCode, summarizeExport, isPublishable, staleRenderReason } from "./lib/export-accounting.mjs";
import { scanBrandIntegrity, gatherCampaignTexts } from "./lib/brand-integrity.mjs";

const PROJECT_ROOT = resolve(".");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");
const OUT_DIR = join(PROJECT_ROOT, "out");
const TMP_DIR = join(PROJECT_ROOT, ".tmp");
// Talk to THIS checkout's editor-server. Env wins; else read the port dev.mjs wrote
// for this workspace (.dev-ports.json); else the historical default.
function devEditorPort() {
  try {
    const f = join(PROJECT_ROOT, ".dev-ports.json");
    if (existsSync(f)) return JSON.parse(readFileSync(f, "utf8")).editor || null;
  } catch { /* ignore — fall through to default */ }
  return null;
}
const SERVER = process.env.EDITOR_SERVER
  || `http://localhost:${process.env.EDITOR_PORT || devEditorPort() || 5173}`;

// ── CLI ───────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const campaign = args.find((a) => !a.startsWith("--"));
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
if (!campaign) {
  console.error('Usage: node scripts/kraken-export.mjs <campaign> --workspace <loc> [--folder "<name>"] [--replace] [--dry-run] [--only ids] [--allow-aa]');
  process.exit(1);
}
const dryRun = flag("dry-run");
const onlyIds = opt("only") ? new Set(opt("only").split(",").map((s) => s.trim())) : null;
// --replace makes re-export REPLACE: soft-delete the existing library row, then
// re-ingest the fresh file (instead of dedup-skipping). Makes SKILL.md's "re-export
// REPLACES, never leaves a stale creative" promise actually true for a direct re-run.
const replace = flag("replace");
// --allow-aa is the deliberately-awkward escape hatch for the brand-integrity gate.
const allowAA = flag("allow-aa");
// --approved-only is the PUBLISH gate (R2): under render-proofs-first, only push the
// assets the user approved on the review page. Default pushes any rendered output.
const approvedOnly = flag("approved-only");

const planPath = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
const sidecarPath = join(CAMPAIGNS_DIR, campaign, "kraken.json");
if (!existsSync(planPath)) {
  console.error(`[export] no creative-plan.json for "${campaign}" at ${planPath}`);
  process.exit(1);
}
const plan = JSON.parse(readFileSync(planPath, "utf8"));
const sidecar = existsSync(sidecarPath) ? JSON.parse(readFileSync(sidecarPath, "utf8")) : {};
const brand = plan.brand || "brand";

function saveSidecar(patch) {
  const next = { ...sidecar, ...patch };
  writeFileSync(sidecarPath, JSON.stringify(next, null, 2));
}

const slug = (s) => String(s).replace(/[^\w.-]+/g, "-");

// ── plan writeback (single-writer aware, mirrors run-campaign.mjs) ────────────
let useServer = false;
async function serverUp() {
  try { const r = await fetch(`${SERVER}/plan?campaign=${encodeURIComponent(campaign)}`); return r.ok; }
  catch { return false; }
}
async function patchAsset(angleId, assetId, fields) {
  if (useServer) {
    try {
      const r = await fetch(`${SERVER}/plan/${campaign}/${angleId}/${assetId}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields),
      });
      if (r.ok) return;
    } catch { /* fall through */ }
  }
  const p = JSON.parse(readFileSync(planPath, "utf8"));
  const ang = p.angles.find((a) => a.id === angleId);
  const as = ang && ang.assets.find((a) => a.id === assetId);
  if (as) { Object.assign(as, fields); writeFileSync(planPath, JSON.stringify(p, null, 2)); }
}

// ffmpeg poster frame for a video → temp PNG path (or null on failure).
function posterFrame(videoPath, assetTag) {
  mkdirSync(TMP_DIR, { recursive: true });
  const poster = join(TMP_DIR, `poster-${slug(assetTag)}.png`);
  // `thumbnail` picks a representative (non-black) frame rather than a fixed 0.5s
  // seek that can land on a black/transition frame.
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", videoPath, "-vf", "thumbnail=n=100", "-frames:v", "1", "-q:v", "3", poster], { encoding: "utf8" });
  if (r.status === 0 && existsSync(poster)) return poster;
  const tail = String(r.stderr || r.error?.message || "").trim().split(/\r?\n/).filter(Boolean).slice(-3);
  for (const line of tail) console.error(`           │ ${line}`);
  return null;
}

async function main() {
  useServer = await serverUp();

  // Workspace (AA location) — required.
  const wsName = opt("workspace") || sidecar.workspace || null;
  if (!wsName) {
    console.error("[export] No workspace. AA is multi-location — pass --workspace <location>.");
    console.error("        Known: " + Object.keys(loadWorkspaces()).join(", "));
    process.exit(2);
  }
  const wsId = resolveWorkspaceId(wsName);
  if (!wsId) {
    console.error(`[export] Could not resolve workspace "${wsName}". Known: ` + Object.keys(loadWorkspaces()).join(", "));
    process.exit(2);
  }
  console.error(`[export] workspace "${wsName}" → ${wsId}${dryRun ? "  (DRY RUN)" : ""}`);

  // Destination folder — flag or sidecar; else list and exit asking.
  const folderName = opt("folder") || sidecar.destFolder || null;
  if (!folderName) {
    const folders = await listFolders(wsId);
    console.error(`[export] No destination folder chosen. Folders in "${wsName}":`);
    for (const f of folders) console.error(`  - ${f.name}`);
    console.error('\nRe-run with --folder "<name>" to choose the DESTINATION folder.');
    process.exit(2);
  }
  const folder = await resolveFolder(wsId, folderName);
  if (!folder) {
    const folders = await listFolders(wsId);
    console.error(`[export] Folder "${folderName}" not found in "${wsName}". Folders:`);
    for (const f of folders) console.error(`  - ${f.name}`);
    process.exit(2);
  }
  console.error(`[export] destination folder "${folder.name}" → ${folder.id}`);

  if (!dryRun) saveSidecar({ workspace: wsName, workspaceId: wsId, destFolder: folder.name, destFolderId: folder.id });

  // ── Brand-integrity gate: never publish AA content under a franchisee brand.
  // Scans the bytes that produced the renders (plan + edits configs). On a non-AA
  // brand, AA red / "ATHLETES ACCELERATION" / a known AA asset is BLOCKING; AA
  // people/proof are flagged for the user to confirm-or-swap. --allow-aa overrides.
  {
    const texts = gatherCampaignTexts(join(CAMPAIGNS_DIR, campaign));
    const scan = scanBrandIntegrity({ brand: plan.brand || null, texts });
    if (!scan.isAA && scan.findings.length) {
      const warnLabels = [...new Set(scan.findings.filter((f) => f.severity === "warn").map((f) => f.detail))];
      for (const w of warnLabels) console.error(`[export] AA people/proof to confirm-or-swap: ${w}`);
      for (const b of scan.blocking) console.error(`[export] AA LEAK on brand "${scan.brand}" — ${b.kind} (${b.detail}) in ${b.source}`);
      if (scan.blocking.length && !allowAA) {
        console.error(`[export] BLOCKED — ${scan.blocking.length} Athletes Acceleration leak(s) on a non-AA brand. Fix the source (re-run the palette/identity swap) or re-export with --allow-aa to override.`);
        process.exit(2);
      }
      if (scan.blocking.length) console.error(`[export] --allow-aa set: proceeding despite ${scan.blocking.length} AA leak(s).`);
    }
  }

  const manifestPath = join(OUT_DIR, "campaigns", campaign, "manifest.json");
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { campaign, cells: [] };

  let pushed = 0, skipped = 0, deduped = 0, failed = 0;

  for (const angle of plan.angles || []) {
    for (const asset of angle.assets || []) {
      if (onlyIds && !onlyIds.has(asset.id)) continue;
      const tag = `${angle.id}/${asset.id}`;
      if (!isPublishable(asset, { approvedOnly })) { skipped++; continue; }
      const outAbs = join(PROJECT_ROOT, asset.output);
      if (!existsSync(outAbs)) {
        console.error(`[export] ${tag} ✗ output missing: ${asset.output}`); failed++; continue;
      }

      // Staleness guard (F): the output file must be at least as new as the last
      // hand-edit, or we'd publish the pre-edit creative. Fail-loud, never ship.
      const stale = staleRenderReason(asset);
      if (stale) {
        console.error(`[export] ${tag} ✗ STALE: ${stale} — re-render before export`);
        failed++; continue;
      }

      const ext = extname(outAbs).toLowerCase();
      const mime = mimeForExt(ext);
      const bucket = bucketForMime(mime);
      const type = mime.startsWith("video/") ? "video" : "image";

      // 1. Dedup on the (campaign,angle,asset) triple. With --replace, soft-delete
      //    the existing row instead of skipping, so the fresh file re-ingests below
      //    (the "re-export REPLACES" promise). Without --replace, skip (idempotent).
      let existing = null;
      try { existing = await findExistingByMeta(wsId, campaign, angle.id, asset.id); }
      catch (e) { console.error(`[export] ${tag} dedup check failed: ${e.message}`); }
      if (existing && !replace) {
        console.error(`[export] ${tag} • already in library (${existing.id}) — skipping ingest`);
        if (!dryRun) {
          try { await setFolder(existing.id, folder.id); } catch { /* best effort */ }
          await patchAsset(angle.id, asset.id, { kraken: { id: existing.id, url: existing.content, folder: folder.name } });
        }
        deduped++; continue;
      }
      if (existing && replace && !dryRun) {
        try {
          await softDeleteContent(existing.id);
          console.error(`[export] ${tag} • replace: soft-deleted stale row ${existing.id}`);
        } catch (e) {
          console.error(`[export] ${tag} ✗ replace soft-delete failed: ${e.message}`); failed++; continue;
        }
      }

      if (dryRun) {
        console.error(`[export] ${tag} → WOULD push ${type} to ${bucket} / folder "${folder.name}"`);
        pushed++; continue;
      }

      try {
        // 2. Video thumbnail (poster frame).
        let thumbnailUrl = null;
        if (type === "video") {
          const poster = posterFrame(outAbs, tag);
          if (poster) {
            const tpath = `creative-engine/${wsId}/${slug(campaign)}-${slug(angle.id)}-${slug(asset.id)}-thumb-${Date.now()}.png`;
            const up = await uploadToStorage(poster, "content-images", tpath, "image/png");
            thumbnailUrl = up.url;
            rmSync(poster, { force: true });
          } else {
            console.error(`[export] ${tag} note: poster frame failed; card may show no thumbnail.`);
          }
        }

        // 3. Upload the creative bytes.
        const storagePath = `creative-engine/${wsId}/${slug(campaign)}-${slug(angle.id)}-${slug(asset.id)}-${Date.now()}${ext}`;
        const { url } = await uploadToStorage(outAbs, bucket, storagePath, mime);
        if (type === "image") thumbnailUrl = url;

        // 4. Register in the Content Library.
        const title = `${brand} — ${campaign} — ${angle.id}/${asset.id}`;
        const result = await ingestContent({
          workspace_id: wsId,
          type,
          title,
          content: url,
          thumbnail_url: thumbnailUrl,
          metadata: {
            storage_url: url,
            storage_bucket: bucket,
            storage_path: storagePath,
            mime_type: mime,
            original_filename: basename(outAbs),
            source: "creative-engine",
            campaign,
            angleId: angle.id,
            assetId: asset.id,
            beat: asset.beat || null,
            format: asset.format || null,
            uploaded_at: new Date().toISOString(),
          },
        });
        if (!result || !result.id) throw new Error(`ingest returned no id: ${JSON.stringify(result).slice(0, 200)}`);

        // 5. Assign to the destination folder.
        await setFolder(result.id, folder.id);

        // 6. Writeback.
        await patchAsset(angle.id, asset.id, { kraken: { id: result.id, url, folder: folder.name } });
        const cell = manifest.cells.find((c) => c.angle === angle.id && c.asset === asset.id);
        if (cell) cell.kraken = { id: result.id, url, folder: folder.name };

        console.error(`[export] ${tag} ✓ → ${result.id} (${type}, folder "${folder.name}")`);
        pushed++;
      } catch (e) {
        console.error(`[export] ${tag} ✗ ${e.message}`);
        failed++;
      }
    }
  }

  if (!dryRun) {
    mkdirSync(join(OUT_DIR, "campaigns", campaign), { recursive: true });
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }
  const total = (plan.angles || []).reduce((n, a) => n + (a.assets || []).length, 0);
  console.error(`[export] done — ${summarizeExport({ pushed, deduped, skipped, failed, total, replace, dryRun, scoped: !!onlyIds })}`);
  process.exit(dryRun ? 0 : exportExitCode({ pushed, failed, replace }));
}

main().catch((e) => { console.error("[export] fatal:", e.message); process.exit(1); });

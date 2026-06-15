// creative-engine/intake/package-export.mjs
//
// #2 — THE INTAKE PACKAGER. The front door of the /creative-engine v2 zero-loss pipeline.
//
// Hand it any finished Claude Design export — a .zip, a folder, or a single .dc.html — and it:
//   A. detects the export shape + entry HTML (lib/detect.mjs)
//   B. normalize-copies the whole tree into _packages/<slug>/ (lib/normalize.mjs)
//   C. headlessly loads it via render-live.mjs openLive + the SHARED runtime re-tag and builds
//      a frame map that matches EXACTLY what the editor/renderer see (lib/frame-map.mjs)
//   D. emits intake.json — the one packing slip every downstream stage reads (lib/manifest.mjs)
//   E. captures one poster PNG per frame (fresh openLive per frame — isolateFrame is destructive)
//   F. NEVER silent: 0 frames → exit 2; broken assets → flag + exit 3 but STILL write the package.
//
// Usage:
//   node creative-engine/intake/package-export.mjs <path> [--no-posters] [--poster-at <ms>]
//
// Clean room: zero imports from creative-engine-v1.

import fs from 'node:fs';
import path from 'node:path';
import { detect } from './lib/detect.mjs';
import { normalize, PROJECT_ROOT } from './lib/normalize.mjs';
import { buildFrameMap } from './lib/frame-map.mjs';
import { capturePosters, assembleManifest, writeManifest } from './lib/manifest.mjs';

export async function packageExport(inputPath, { posters = true, posterAtMs = 0, at = null, log = console.log } = {}) {
  const sourceAbs = path.resolve(inputPath);

  // A — detect
  const det = detect(inputPath);
  log(`[A] kind=${det.kind} — ${det.detectedReason}`);
  log(`    entry: ${det.entryRel}  (srcRoot: ${det.srcRoot})`);

  // B — normalize-copy
  const norm = normalize({
    srcRoot: det.srcRoot,
    entryRel: det.entryRel,
    sourceName: det.isZip ? sourceAbs : path.basename(sourceAbs),
    sourceAbs,
  });
  log(`[B] copied → _packages/${norm.slug}/   asset_base=${norm.asset_base}`);

  // clean up the zip's temp extraction now that the copy is on the shelf
  if (det.tmpExtract) { try { fs.rmSync(det.tmpExtract, { recursive: true, force: true }); } catch {} }

  // C — frame map (same eyes as editor + renderer; throws on 0 frames → exit 2)
  const pkgRelToRepo = path.relative(PROJECT_ROOT, norm.pkgDir).split(path.sep).join('/');
  const pkgRelUrl = `/${pkgRelToRepo}/${norm.entryRel}`.replace(/\/+/g, '/');
  let frameMap;
  try {
    frameMap = await buildFrameMap({ pkgRelUrl });
  } catch (e) {
    if (/ZERO frames|framesEmpty|zero frames/i.test(String(e.message))) {
      log(`\n[FAIL] ${e.message}`);
      log(`       Package written to _packages/${norm.slug}/ for inspection, but it has NO creatives.`);
      const code = { exit: 2, slug: norm.slug, pkgDir: norm.pkgDir, error: e.message };
      if (process.env.CE_INTAKE_THROW) throw Object.assign(e, code);
      return code;
    }
    throw e;
  }
  log(`[C] frames=${frameMap.counts.frames}  tagged=${frameMap.counts.tagged} (text ${frameMap.counts.text} / media ${frameMap.counts.media})`);

  // E — posters (default on)
  let posterById = {};
  if (posters) {
    const written = await capturePosters({ pkgRelUrl, frames: frameMap.frames, postersDir: path.join(norm.pkgDir, 'posters'), posterAtMs });
    written.forEach((w) => { posterById[w.id] = w.poster; });
    log(`[E] posters: ${written.length} written → _packages/${norm.slug}/posters/`);
  } else {
    log(`[E] posters skipped (--no-posters)`);
  }

  // D — manifest
  const manifest = assembleManifest({
    slug: norm.slug, kind: det.kind, entryRel: norm.entryRel, asset_base: norm.asset_base,
    frameMap, source: sourceAbs, isZip: det.isZip, detectedReason: det.detectedReason,
    at: at || new Date().toISOString(), posterById,
  });
  const manifestPath = writeManifest(norm.pkgDir, manifest);

  // F — coverage block + verdict (never silent)
  const silentSkips = 0; // by construction: every detected frame yields a row; unknown tags FLAGGED not dropped
  log(`\n── coverage ──────────────────────────────────────────`);
  log(`  frames ${manifest.counts.frames}, tagged ${manifest.counts.tagged} (text ${manifest.counts.text} / media ${manifest.counts.media})`);
  log(`  flagged ${manifest.flagged.length}, broken assets ${manifest.brokenAssets.length}, SILENT SKIPS: ${silentSkips}`);
  log(`  manifest → ${path.relative(PROJECT_ROOT, manifestPath)}`);
  log(`  ok: ${manifest.ok}`);

  if (manifest.brokenAssets.length) {
    log(`\n[WARN] ${manifest.brokenAssets.length} BROKEN ASSET(S) — package written, but flagged (ok:false):`);
    manifest.brokenAssets.forEach((b) => log(`   ✗ ${b.status}  ${b.url}`));
    return { exit: 3, slug: norm.slug, pkgDir: norm.pkgDir, manifest, manifestPath };
  }

  return { exit: 0, slug: norm.slug, pkgDir: norm.pkgDir, manifest, manifestPath };
}

const isMain = process.argv[1] && process.argv[1].endsWith('package-export.mjs');
if (isMain) {
  const args = process.argv.slice(2);
  const inputPath = args.find((a) => !a.startsWith('--'));
  if (!inputPath) {
    console.error('usage: node creative-engine/intake/package-export.mjs <path> [--no-posters] [--poster-at <ms>]');
    process.exit(64);
  }
  const posters = !args.includes('--no-posters');
  const posterAtMs = args.includes('--poster-at') ? Number(args[args.indexOf('--poster-at') + 1]) : 0;
  packageExport(inputPath, { posters, posterAtMs })
    .then((r) => process.exit(r.exit || 0))
    .catch((e) => { console.error('\n[ERROR]', e.message || e); process.exit(1); });
}

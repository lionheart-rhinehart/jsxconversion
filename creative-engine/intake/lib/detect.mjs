// creative-engine/intake/lib/detect.mjs
//
// PHASE A — "open the box, read the label."
//
// Takes the raw thing a user drops on the intake counter (a .zip, a folder, or a single
// .dc.html file) and answers two questions deterministically:
//   1. WHERE is the design? — the entry HTML + the dependency root whose whole tree must
//      travel with it (so assets/ _ds/ fonts/ peer css+js all resolve later).
//   2. WHAT shape is it? — dc-html / campaign-b / cr-frame / unknown (metadata only; the
//      actual frame set is detected live by the SHARED frame-detect.js in Phase C, never here).
//
// Never guesses: a folder with two equally-plausible entry HTMLs THROWS with the candidate
// list rather than silently picking one (Phase-1 discipline — a deterministic wrong pick is
// still wrong).
//
// Clean room: zero imports from creative-engine-v1.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

// ── zip extraction ──────────────────────────────────────────────────────────
// Extract to a fresh temp dir. Windows ships PowerShell Expand-Archive; *nix has unzip
// (or bsdtar). We never depend on a node unzip lib (clean room, no new deps).
function extractZip(zipPath) {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-intake-'));
  let r;
  if (process.platform === 'win32') {
    r = spawnSync('powershell', ['-NoProfile', '-Command',
      `Expand-Archive -LiteralPath "${zipPath}" -DestinationPath "${dest}" -Force`], { encoding: 'utf8' });
  } else {
    r = spawnSync('unzip', ['-o', zipPath, '-d', dest], { encoding: 'utf8' });
    if (r.status !== 0) r = spawnSync('tar', ['-xf', zipPath, '-C', dest], { encoding: 'utf8' });
  }
  if (r.status !== 0) {
    throw new Error(`[detect] could not extract zip "${zipPath}": ${(r.stderr || r.error || '').toString().slice(0, 300)}`);
  }
  return dest;
}

// If a folder contains exactly one sub-directory and nothing else meaningful (the classic
// "zip wraps everything in one folder" case), descend into it so srcRoot is the real root.
function descendSingleWrapper(dir) {
  let cur = dir;
  for (let i = 0; i < 8; i++) { // bounded — never loop forever on a pathological tree
    let entries;
    try { entries = fs.readdirSync(cur, { withFileTypes: true }); } catch { break; }
    const visible = entries.filter((e) => !e.name.startsWith('__MACOSX') && !e.name.startsWith('.'));
    const dirs = visible.filter((e) => e.isDirectory());
    const files = visible.filter((e) => e.isFile());
    if (dirs.length === 1 && files.length === 0) { cur = path.join(cur, dirs[0].name); continue; }
    break;
  }
  return cur;
}

// ── entry-HTML discovery within a folder ─────────────────────────────────────
const HTML_RE = /\.html?$/i;
const DC_RE = /\.dc\.html$/i;

function listHtml(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
  return entries
    .filter((e) => e.isFile() && HTML_RE.test(e.name) && !/\.tagged\.html$/i.test(e.name))
    .map((e) => e.name);
}

// Does this HTML <link>/<script src> reference a peer sibling that exists on disk? Used to
// prefer the real "entry" over a stray fragment that happens to be .html.
function linksPeerSibling(dir, htmlName) {
  let html;
  try { html = fs.readFileSync(path.join(dir, htmlName), 'utf8'); } catch { return false; }
  const refs = [...html.matchAll(/(?:href|src)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
  return refs.some((ref) => {
    if (/^(https?:)?\/\//i.test(ref) || ref.startsWith('data:') || ref.startsWith('#')) return false;
    const rel = ref.split('?')[0].split('#')[0].replace(/^\.?\//, '');
    try { return fs.existsSync(path.join(dir, rel)); } catch { return false; }
  });
}

// Pick the entry HTML in a folder. Priority: a single .dc.html → the shallowest .html that
// links peer siblings → a flat index.html. Ambiguity (e.g. several .dc.html) THROWS.
function findEntryInFolder(srcRoot) {
  // Search srcRoot first, then one level into immediate sub-dirs (exports sometimes nest the
  // entry one folder deep alongside its assets).
  const dirsToScan = [srcRoot, ...fs.readdirSync(srcRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('__MACOSX'))
    .map((e) => path.join(srcRoot, e.name))];

  for (const dir of dirsToScan) {
    const htmls = listHtml(dir);
    const dcs = htmls.filter((h) => DC_RE.test(h));
    if (dcs.length === 1) return { dir, entry: dcs[0] };
    if (dcs.length > 1) {
      throw new Error(`[detect] ambiguous: ${dcs.length} .dc.html files in "${dir}" — point the packager at ONE of them:\n` +
        dcs.map((d) => '   ' + path.join(dir, d)).join('\n'));
    }
  }
  // no .dc.html anywhere → look for a peer-linking .html, then index.html
  for (const dir of dirsToScan) {
    const htmls = listHtml(dir);
    const linkers = htmls.filter((h) => linksPeerSibling(dir, h));
    if (linkers.length === 1) return { dir, entry: linkers[0] };
    if (linkers.length > 1) {
      const idx = linkers.find((h) => /^index\.html?$/i.test(h));
      if (idx) return { dir, entry: idx };
      throw new Error(`[detect] ambiguous: ${linkers.length} candidate entry HTMLs in "${dir}" — point the packager at ONE:\n` +
        linkers.map((h) => '   ' + path.join(dir, h)).join('\n'));
    }
  }
  for (const dir of dirsToScan) {
    const idx = listHtml(dir).find((h) => /^index\.html?$/i.test(h));
    if (idx) return { dir, entry: idx };
  }
  // last resort: a lone .html anywhere we scanned
  for (const dir of dirsToScan) {
    const htmls = listHtml(dir);
    if (htmls.length === 1) return { dir, entry: htmls[0] };
  }
  throw new Error(`[detect] no entry HTML found under "${srcRoot}" (looked for .dc.html, peer-linking .html, index.html). NOT silently skipped.`);
}

// ── classification (metadata only) ───────────────────────────────────────────
function classify(entryDir, entryName) {
  let html = '';
  try { html = fs.readFileSync(path.join(entryDir, entryName), 'utf8'); } catch {}
  const siblings = (() => { try { return fs.readdirSync(entryDir); } catch { return []; } })();
  const has = (re) => siblings.some((s) => re.test(s));

  // dc-html ONLY on a real signature — an <x-dc> ELEMENT or an actual <script src=…support.js>.
  // (A bare "support.js" string can appear in a COMMENT — Westfield's standalone index.html says
  // "support.js runtime replaced…" — which must NOT classify it as dc-html. Match the tag, not text.)
  const scriptsSupport = /<script\b[^>]*\bsrc\s*=\s*["'][^"']*support\.js/i.test(html);
  if (/<x-dc[\s>]/i.test(html) || scriptsSupport || has(/^support\.js$/i)) {
    return { kind: 'dc-html', reason: '<x-dc>/support.js present (Claude Design .dc.html handoff)' };
  }
  if (has(/^campaign-b.*\.(css|js)$/i) || /campaign-b/i.test(html)) {
    return { kind: 'campaign-b', reason: 'peer campaign-b*.css/.js (JS-driven Campaign B export)' };
  }
  if (/class\s*=\s*["'][^"']*\bcr-frame\b/i.test(html) && !has(/\.(js|mjs)$/i)) {
    return { kind: 'cr-frame', reason: 'flat .cr-frame markup, no peer JS (legacy standalone)' };
  }
  if (/\bcr-frame\b/i.test(html)) {
    return { kind: 'cr-frame', reason: '.cr-frame markup present' };
  }
  return { kind: 'unknown', reason: 'no dc-html/campaign-b/cr-frame signature — processed + FLAGGED' };
}

// detect(inputPath) → { kind, srcRoot, entryHtml, entryRel, isZip, tmpExtract, detectedReason }
//   srcRoot   = the directory whose whole tree gets copied (dependency root).
//   entryHtml = absolute path to the entry HTML.
//   entryRel  = entryHtml relative to srcRoot (posix), e.g. "Carmel.html" or "a/b.dc.html".
//   tmpExtract= temp dir to clean up after copy (zip only), else null.
export function detect(inputPath) {
  const abs = path.resolve(inputPath);
  let st;
  try { st = fs.statSync(abs); } catch { throw new Error(`[detect] not found: ${inputPath}`); }

  let srcRoot, entryDir, entryName, isZip = false, tmpExtract = null;

  if (st.isFile() && /\.zip$/i.test(abs)) {
    isZip = true;
    tmpExtract = extractZip(abs);
    srcRoot = descendSingleWrapper(tmpExtract);
    const found = findEntryInFolder(srcRoot);
    entryDir = found.dir; entryName = found.entry;
  } else if (st.isFile() && HTML_RE.test(abs)) {
    // a single .dc.html / .html → its siblings travel; srcRoot = parent folder
    srcRoot = path.dirname(abs);
    entryDir = srcRoot; entryName = path.basename(abs);
  } else if (st.isDirectory()) {
    srcRoot = descendSingleWrapper(abs);
    const found = findEntryInFolder(srcRoot);
    entryDir = found.dir; entryName = found.entry;
  } else {
    throw new Error(`[detect] unsupported input (need .zip, folder, or .html): ${inputPath}`);
  }

  // If the entry sits in a sub-dir of srcRoot, keep srcRoot as the COPY root so the whole
  // tree (and the entry's relative path within it) is preserved.
  const entryHtml = path.join(entryDir, entryName);
  const entryRel = path.relative(srcRoot, entryHtml).split(path.sep).join('/');
  const { kind, reason } = classify(entryDir, entryName);

  return { kind, srcRoot, entryHtml, entryRel, isZip, tmpExtract, detectedReason: reason };
}

// creative-engine/intake/lib/normalize.mjs
//
// PHASE B — "re-file the box onto the standard shelf."
//
// Copies the detected export's WHOLE dependency tree byte-faithful into a canonical,
// self-contained home: creative-engine/intake/_packages/<slug>/. Everything the design
// needs (assets/ _ds/ fonts/ peer css+js) travels together so relative refs resolve when
// the editor/renderer load it later from repo root.
//
// We DELIBERATELY do NOT inject <base href> into the copied HTML. The base is supplied at
// LOAD time, per consumer: the editor sets the iframe <base> to asset_base, and the
// poller injects it via render/approvals.mjs injectBase. Keeping the copy byte-faithful is
// what lets the runtime re-tagger produce identical ids everywhere (zero-loss contract).
//
// slug = kebab(source name) + short hash(absolute source path) → stable across runs
// (idempotent: same input overwrites the same folder) and collision-safe (two exports
// named "Carmel" from different paths get different hashes).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const INTAKE_ROOT = path.resolve(__dirname, '..');                 // creative-engine/intake
export const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');    // repo root
export const PACKAGES_DIR = path.join(INTAKE_ROOT, '_packages');

function kebab(s) {
  return String(s)
    .replace(/\.(zip|html|dc\.html)$/i, '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60) || 'export';
}

export function slugFor(sourcePathForName, absSourcePath) {
  const base = path.basename(sourcePathForName);
  const hash = crypto.createHash('sha1').update(path.resolve(absSourcePath)).digest('hex').slice(0, 8);
  return `${kebab(base)}-${hash}`;
}

// Is this a filesystem LOCK error (someone holds the package folder open)? On Windows the
// editor previewing a package keeps its files locked, so the wipe-and-copy below EPERMs.
// Exported so it's unit-testable without simulating a real OS lock cross-platform.
const LOCK_CODES = new Set(['EPERM', 'EBUSY', 'EACCES', 'ENOTEMPTY', 'EISDIR']);
export function isLockError(err) {
  return !!err && LOCK_CODES.has(err.code);
}

// normalize({ srcRoot, entryRel, sourceName, sourceAbs }) →
//   { slug, pkgDir, entryHtmlAbs, entryRel, asset_base }
//   pkgDir       = _packages/<slug>/  (the copied tree root)
//   entryHtmlAbs = absolute path to the entry inside pkgDir
//   asset_base   = origin-absolute, repo-rooted URL to the entry's DIRECTORY, with trailing
//                  slash — matches serve.mjs resolveUnderRoot + the renderer leading-slash
//                  rewrite. Relative asset refs in the HTML resolve against this.
export function normalize({ srcRoot, entryRel, sourceName, sourceAbs }) {
  const slug = slugFor(sourceName, sourceAbs);
  const pkgDir = path.join(PACKAGES_DIR, slug);

  // idempotent: wipe any prior copy so a re-run is a clean, byte-faithful mirror.
  // A lock error here almost always means the package is open in the editor (Windows
  // holds its files locked) — turn the raw EPERM into a plain-language fix instruction.
  try {
    fs.rmSync(pkgDir, { recursive: true, force: true });
    fs.mkdirSync(PACKAGES_DIR, { recursive: true });
    fs.cpSync(srcRoot, pkgDir, { recursive: true });
  } catch (err) {
    if (isLockError(err)) {
      throw new Error(
        `Cannot replace package "${slug}" — it looks like it's open in the editor ` +
        `(or another process has a file locked). Close that package in the editor, then re-run. ` +
        `(file lock: ${err.code})`,
      );
    }
    throw err;
  }

  const entryHtmlAbs = path.join(pkgDir, entryRel);
  if (!fs.existsSync(entryHtmlAbs)) {
    throw new Error(`[normalize] entry HTML missing after copy: ${entryHtmlAbs}`);
  }

  // repo-rooted URL path to the entry's folder (where its relative assets live)
  const pkgRelToRepo = path.relative(PROJECT_ROOT, pkgDir).split(path.sep).join('/');
  const entryDirRel = path.posix.dirname(entryRel);
  const baseDir = entryDirRel === '.' ? pkgRelToRepo : `${pkgRelToRepo}/${entryDirRel}`;
  const asset_base = `/${baseDir}/`.replace(/\/+/g, '/');

  return { slug, pkgDir, entryHtmlAbs, entryRel, asset_base };
}

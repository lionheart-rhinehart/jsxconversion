// ============================================================================
//  creative-editor/providers/local-media.mjs — reference media provider.
// ============================================================================
//  The editor core never reaches the filesystem for media directly; it goes
//  through a `mediaProvider` adapter so a host can back media with Kraken, S3,
//  a CMS, etc. This is the simplest impl: a set of local folders ("roots").
//
//  Contract (what createEditorServer expects):
//    list(kind)            -> [{ id, path, source }]   // kind: photo|clip|audio
//    filePath(ref)         -> absolute path | null      // guarded resolve of a ref
//    upload(buf, name, kind) -> ref                      // optional
//    remoteBrowse?()       -> truthy if the host has a remote picker (Kraken)
// ============================================================================
import { readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, extname, basename } from "node:path";

const EXT = {
  photo: new Set([".jpg", ".jpeg", ".png", ".webp"]),
  clip: new Set([".mp4", ".mov", ".webm"]),
  audio: new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg"]),
};

// roots: array of { dir, source } — source is a label shown in the picker.
// uploadDir: where uploads land (must be inside one of the roots to be served).
export function createLocalMediaProvider({ roots = [], uploadDir = null } = {}) {
  const norm = roots.map((r) => ({ dir: resolve(r.dir), source: r.source || "local" }));
  const underRoot = (abs) => norm.some((r) => abs.startsWith(r.dir));

  return {
    list(kind) {
      const exts = EXT[kind] || EXT.photo;
      const items = [];
      for (const r of norm) {
        let files = [];
        try { files = readdirSync(r.dir); } catch { continue; }
        for (const f of files) {
          if (!exts.has(extname(f).toLowerCase())) continue;
          items.push({ id: `${r.source}/${f}`, path: join(r.dir, f), source: r.source });
        }
      }
      return items;
    },
    filePath(ref) {
      if (!ref) return null;
      const abs = resolve(ref);
      return underRoot(abs) && existsSync(abs) ? abs : null;
    },
    upload(buf, name, _kind) {
      if (!uploadDir) throw new Error("no uploadDir configured");
      mkdirSync(uploadDir, { recursive: true });
      const safe = basename(name).replace(/[^a-z0-9._-]+/gi, "-");
      const dest = join(uploadDir, safe);
      writeFileSync(dest, buf);
      return dest;
    },
    remoteBrowse: undefined, // no remote picker in the local provider
  };
}

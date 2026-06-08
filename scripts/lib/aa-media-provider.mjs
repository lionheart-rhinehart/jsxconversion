// ============================================================================
//  scripts/lib/aa-media-provider.mjs — AA's media provider for createEditorServer.
// ----------------------------------------------------------------------------
//  Supplies the SHARED media surface the engine routes need:
//    filePath(ref)             -> abs path, guarded to AA's media roots (/media-file)
//    upload(buf,name,kind,opts)-> writes to brand/kraken-cache[/<campaign>] (/media-upload)
//    remoteBrowse              -> the Kraken browse provider (Phase B)
//    list(kind)                -> [] : AA's brand-SCOPED /media listing is intricate
//                                 (campaign/brand gating) and stays in the campaign
//                                 plugin; the engine's generic /media is for standalone
//                                 hosts. A non-AA host swaps in createLocalMediaProvider.
//  Mirrors the live editor-server media-root guard + upload destination exactly.
//  NODE-ONLY.
// ============================================================================
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve, extname, basename } from "node:path";
import { createKrakenMediaProvider } from "../../creative-editor/providers/kraken-media.mjs";

const EXT_FOR_KIND = {
  photo: new Set([".jpg", ".jpeg", ".png", ".webp"]),
  clip: new Set([".mp4", ".mov", ".webm"]),
  audio: new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg"]),
};

export function createAaMediaProvider({ cwd = process.cwd() } = {}) {
  const root = resolve(cwd);
  const KRAKEN_CACHE_ROOT = join(root, "brand/kraken-cache");
  // The servable/placeable roots — mirrors editor-server underAnyMediaRoot (MEDIA_ROOTS
  // + drive cache). Kit dirs are added per-brand by the campaign plugin when attached.
  const mediaRoots = [
    join(root, "brand/aa-design-system/project/uploads"),
    join(root, "brand/aa-design-system/project/assets"),
    join(root, "brand/video-templates/assets"),
    join(root, "music-library"),
    KRAKEN_CACHE_ROOT,
    join(root, "brand/drive-cache"),
  ].map((r) => resolve(r));
  const underRoot = (abs) => mediaRoots.some((r) => abs.startsWith(r));
  const kraken = createKrakenMediaProvider({ cwd: root, scriptsDir: join(root, "scripts") });

  return {
    list: () => [], // AA /media is brand-scoped → owned by the campaign plugin (see header)
    filePath: (ref) => {
      const abs = resolve(join(root, String(ref)));
      return underRoot(abs) && existsSync(abs) ? abs : null; // guard: never serve outside a media root
    },
    upload: (buf, name, kind, opts = {}) => {
      const exts = EXT_FOR_KIND[kind];
      const ext = extname(name || "").toLowerCase();
      if (!exts || !exts.has(ext)) throw new Error(`extension "${ext}" not allowed for ${kind}`);
      const slug = basename(name, extname(name)).replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "file";
      const destDir = opts.campaign ? join(KRAKEN_CACHE_ROOT, opts.campaign) : KRAKEN_CACHE_ROOT;
      mkdirSync(destDir, { recursive: true });
      const fname = "upload-" + slug + ext;
      const dest = join(destDir, fname);
      writeFileSync(dest, buf);
      const rel = dest.slice(root.length + 1).replace(/\\/g, "/");
      return { name: fname, path: rel, url: "/media-file/" + rel, source: "uploaded" };
    },
    remoteBrowse: kraken.remoteBrowse,
  };
}

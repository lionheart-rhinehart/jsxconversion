#!/usr/bin/env node
// ============================================================================
//  scripts/drive-list.mjs — read-only Google Drive lister + downloader CLI.
// ============================================================================
//  Spawned by editor-server (credential isolation, mirroring kraken-list.mjs).
//  Commands → JSON on stdout:
//    status                         → { available, reason }
//    folders [--parent <id>]        → { available, folders:[{id,name,parent_id}] }
//    files --folder <id>            → { available, files:[{id,type,title,mime,thumbnailLink}] }
//    download --file <id> --out <p> → { available, path, mime }
//  Not configured (no service-account) → { available:false, error } and exit 0
//  (so the editor degrades gracefully — hides the Drive tab — never a 500).
// ============================================================================
import { driveConfigured, listFolders, listFiles, downloadFile, NotConfigured } from "./lib/drive.mjs";

const args = process.argv.slice(2);
const cmd = args.find((a) => !a.startsWith("--"));
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const out = (o) => { process.stdout.write(JSON.stringify(o)); };

(async () => {
  if (!driveConfigured()) {
    out({ available: false, error: "Google Drive not configured — add a service-account JSON (env GOOGLE_DRIVE_SA or data/google-drive-sa.json)." });
    return;
  }
  try {
    if (cmd === "status") return out({ available: true });
    if (cmd === "folders") return out({ available: true, folders: await listFolders(opt("parent")) });
    if (cmd === "files") {
      const folder = opt("folder");
      if (!folder) return out({ available: true, error: "files requires --folder <id>", files: [] });
      return out({ available: true, files: await listFiles(folder) });
    }
    if (cmd === "download") {
      const file = opt("file"), dest = opt("out");
      if (!file || !dest) return out({ available: true, error: "download requires --file and --out" });
      return out({ available: true, ...(await downloadFile(file, dest)) });
    }
    out({ available: true, error: `unknown command: ${cmd || "(none)"}` });
  } catch (e) {
    out({ available: !(e instanceof NotConfigured), error: String((e && e.message) || e) });
  }
})();

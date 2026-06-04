// TEMP: download every file in jarosh-download-manifest.json to its dest dir.
import { listFolderMedia, downloadToCache } from "./lib/kraken.mjs";
import { readFileSync, mkdirSync } from "node:fs";

const WS = "620313c9-f0ea-43f1-a0f0-102f888e4985";
const SRC_FOLDERS = [
  "7a432f97-9dae-42f2-969c-2ac2e8f92f45",
  "eb1693ee-bf0e-4e39-ba38-df8d4e095faf",
  "9a5d4f27-1f91-424d-8bc4-2a4f9a452106",
];
const manifest = JSON.parse(readFileSync("jarosh-download-manifest.json", "utf8"));

// index all rows by id
const byId = new Map();
for (const fid of SRC_FOLDERS) {
  for (const r of await listFolderMedia(WS, fid)) byId.set(r.id, r);
}

let done = 0, skip = 0, fail = 0;
for (const m of manifest) {
  const row = byId.get(m.rowId);
  if (!row) { console.error(`MISSING ROW ${m.rowId} (${m.title})`); fail++; continue; }
  mkdirSync(m.destDir, { recursive: true });
  try {
    const { skipped } = await downloadToCache(row, m.destDir);
    if (skipped) skip++; else done++;
    if ((done + skip) % 10 === 0) console.error(`  …${done + skip}/${manifest.length}`);
  } catch (e) {
    console.error(`FAIL ${m.cache}: ${e.message}`); fail++;
  }
}
console.error(`\ndownload complete: ${done} new, ${skip} cached, ${fail} failed (of ${manifest.length})`);
if (fail > 0) process.exit(1);

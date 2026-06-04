#!/usr/bin/env node
// ============================================================================
//  scripts/lib/kraken.mjs — connector to The Kraken's Content Library (Supabase)
// ============================================================================
//  Two directions for the creative engine:
//    PULL  — list a Content-Library folder's raw images/clips and cache them
//            locally so they can be PLACED into creatives (kraken-pull.mjs).
//    PUSH  — upload a finished creative to Storage + register it in the library,
//            in a chosen destination folder (kraken-export.mjs).
//
//  Talks DIRECTLY to Supabase (PostgREST + Storage + the ingest edge function)
//  with The Kraken's keys, server-to-server. Mirrors the proven patterns in
//  The Kraken's scripts/lib/workspace-credentials.js (apikey+Bearer reads) and
//  scripts/upload-image-to-content-library.js (storage upload + ingest-content).
//
//  SECRET SAFETY (non-negotiable): this module is imported ONLY by the standalone
//  CLI scripts (kraken-pull.mjs, kraken-export.mjs, kraken-list.mjs). It is NEVER
//  imported by fill-core/assemble/roles, a template, OR the editor-server (those
//  feed — or could feed — the headless render bundle; run-campaign.mjs inlines
//  template source). The editor-server reaches the Kraken only by SPAWNING these
//  CLIs. Credentials are read LAZILY at call time from the Kraken .env.local
//  (never copied into this repo, never a module-level literal), and the
//  service-role key is masked in all output.
// ============================================================================

import { existsSync, readFileSync, createWriteStream, renameSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const PROJECT_ROOT = resolve(".");
const CONFIG_PATH = join(
  PROJECT_ROOT,
  ".claude/skills/creative-engine/config.json",
);

// ── config + credentials (lazy, cached at call time — NOT at import) ──────────
let _cfg = null;
let _creds = null;

// Connection-level config from the creative-engine config.json `kraken` block.
// supabaseHost is stored WITHOUT scheme (the proven scripts concat https://${host});
// a scheme-prefixed value would yield https://https://… .
export function loadKrakenConfig() {
  if (_cfg) return _cfg;
  if (!existsSync(CONFIG_PATH)) {
    throw new Error(`creative-engine config not found at ${CONFIG_PATH}`);
  }
  const raw = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  const k = raw.kraken || {};
  const host = String(k.supabaseHost || "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
  if (!host) {
    throw new Error(
      `config.json kraken.supabaseHost is missing. Expected the Supabase host, e.g. "xdszlcvmfjdjvqxhyxly.supabase.co".`,
    );
  }
  _cfg = {
    host,
    credentialsEnvPath: k.credentialsEnvPath || null,
    workspacesFile: k.workspacesFile
      ? k.workspacesFile.replace(/^~(?=[/\\])/, homedir())
      : join(homedir(), ".claude", "client-workspaces.json"),
  };
  return _cfg;
}

// Parse the Kraken .env.local for the two keys we need. CRLF-safe: split on
// /\r?\n/ AND trim each value (trim also strips a stray \r) so the Bearer header
// is never malformed (a trailing \r → 401 on every call).
function parseEnvFile(path) {
  const out = {};
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

// Read service-role + anon keys + url from the configured env file. Never logs
// the values. serviceKey is used for Storage + PostgREST (bypasses RLS); anonKey
// for the ingest-content edge function (matches The Kraken's own scripts).
export function loadCreds() {
  if (_creds) return _creds;
  const cfg = loadKrakenConfig();
  if (!cfg.credentialsEnvPath) {
    throw new Error(
      `config.json kraken.credentialsEnvPath is not set. Point it at The Kraken's .env.local (e.g. "D:/Claude CODE/The Kraken/.env.local").`,
    );
  }
  const envPath = cfg.credentialsEnvPath.replace(/^~(?=[/\\])/, homedir());
  if (!existsSync(envPath)) {
    throw new Error(`Kraken credentials file not found at ${envPath}`);
  }
  const env = parseEnvFile(envPath);
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!serviceKey) {
    throw new Error(`SUPABASE_SERVICE_ROLE_KEY missing in ${envPath}`);
  }
  if (!anonKey) {
    throw new Error(`NEXT_PUBLIC_SUPABASE_ANON_KEY missing in ${envPath}`);
  }
  _creds = { host: cfg.host, serviceKey, anonKey };
  return _creds;
}

// Mask a JWT for safe logging: keep the first 8 chars, hide the rest.
export function mask(secret) {
  if (!secret || typeof secret !== "string") return "(none)";
  return secret.slice(0, 8) + "…(" + secret.length + " chars)";
}

// ── workspace resolution (canonical: ~/.claude/client-workspaces.json) ────────
// Mirrors The Kraken's resolveWorkspaceId: UUID passthrough, then exact /
// normalized / partial name match. CRITICAL: AA is multi-location — bare
// "athletes-acceleration" → Milford, "aa-indy"/"genesis" → 79872791, etc.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function loadWorkspaces() {
  const cfg = loadKrakenConfig();
  try {
    if (existsSync(cfg.workspacesFile)) {
      return JSON.parse(readFileSync(cfg.workspacesFile, "utf8"));
    }
  } catch (e) {
    process.stderr.write(`[kraken] warning: could not read ${cfg.workspacesFile}: ${e.message}\n`);
  }
  return {};
}

export function resolveWorkspaceId(input) {
  if (!input) return null;
  if (UUID_RE.test(input)) return input;
  const workspaces = loadWorkspaces();
  const normalized = String(input).toLowerCase().replace(/[^a-z0-9]/g, "-");
  if (workspaces[input]) return workspaces[input];
  if (workspaces[normalized]) return workspaces[normalized];
  for (const [key, id] of Object.entries(workspaces)) {
    if (key.includes(normalized) || normalized.includes(key)) return id;
  }
  return null;
}

// ── mime / bucket helpers ─────────────────────────────────────────────────────
const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};
const EXT_FOR_MIME = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
};

export function mimeForExt(ext) {
  return MIME[String(ext).toLowerCase()] || "application/octet-stream";
}
export function extForMime(mime) {
  return EXT_FOR_MIME[String(mime || "").toLowerCase()] || "";
}
// content-videos for video/*, else content-images (gif/png/jpg/webp).
export function bucketForMime(mime) {
  return String(mime || "").startsWith("video/") ? "content-videos" : "content-images";
}

// ── low-level Supabase REST (PostgREST) — service role, bypasses RLS ──────────
function restHeaders() {
  const { serviceKey } = loadCreds();
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
  };
}

async function restGet(restPath) {
  const { host } = loadCreds();
  const r = await fetch(`https://${host}/rest/v1/${restPath}`, { headers: restHeaders() });
  const body = await r.text();
  if (!r.ok) throw new Error(`PostgREST GET ${r.status}: ${body.slice(0, 300)}`);
  return body ? JSON.parse(body) : [];
}

async function restPatch(restPath, payload) {
  const { host } = loadCreds();
  const r = await fetch(`https://${host}/rest/v1/${restPath}`, {
    method: "PATCH",
    headers: { ...restHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  const body = await r.text();
  if (!r.ok) throw new Error(`PostgREST PATCH ${r.status}: ${body.slice(0, 300)}`);
  return body ? JSON.parse(body) : [];
}

// ── folders ───────────────────────────────────────────────────────────────────
// List the named folders in a workspace's Content Library.
export async function listFolders(workspaceId) {
  return restGet(
    `content_folders?workspace_id=eq.${workspaceId}&select=id,name,parent_id&order=name.asc`,
  );
}

// Resolve a folder NAME (case-insensitive) to its row within a workspace.
export async function resolveFolder(workspaceId, name) {
  if (!name) return null;
  if (UUID_RE.test(name)) {
    const rows = await restGet(
      `content_folders?id=eq.${name}&workspace_id=eq.${workspaceId}&select=id,name,parent_id`,
    );
    return rows[0] || null;
  }
  const folders = await listFolders(workspaceId);
  const norm = (s) => String(s).toLowerCase().trim();
  return folders.find((f) => norm(f.name) === norm(name)) || null;
}

// ── media: list + download (PULL) ─────────────────────────────────────────────
// Rows in a folder that are real media: image/video type AND a non-null content
// URL (a folder can also hold text/ad-copy rows whose content is null).
export async function listFolderMedia(workspaceId, folderId, { types = ["image", "video"] } = {}) {
  const typeFilter = `type=in.(${types.join(",")})`;
  const folderFilter =
    folderId == null ? "folder_id=is.null" : `folder_id=eq.${folderId}`;
  const rows = await restGet(
    `content_outputs?workspace_id=eq.${workspaceId}&${folderFilter}&${typeFilter}` +
      `&deleted_at=is.null&content=not.is.null&select=id,type,title,content,metadata` +
      `&order=created_at.desc`,
  );
  return rows.filter((r) => typeof r.content === "string" && r.content.trim());
}

// Deterministic cache filename for a media row: <prefix><slug-title>-<id8><ext>.
// The extension comes from metadata.mime_type (falling back to the URL) so the
// editor's extension filter recognizes the cached file.
export function cacheFileName(row, prefix = "") {
  const mime = row?.metadata?.mime_type || "";
  let ext = extForMime(mime);
  if (!ext) {
    const m = String(row.content || "").split("?")[0].match(/\.([a-z0-9]{2,4})$/i);
    ext = m ? "." + m[1].toLowerCase() : "";
  }
  const safe =
    String(row.title || row.id || "media")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 60) || "media";
  return `${prefix}${safe}-${String(row.id).slice(0, 8)}${ext}`;
}

// Stream a media row's bytes to a local file. Streaming (not arrayBuffer) so a
// multi-GB raw clip never buffers in memory. Returns { path, skipped }.
export async function downloadToCache(row, destDir, { prefix = "", skipExisting = true } = {}) {
  const dest = join(destDir, cacheFileName(row, prefix));
  if (skipExisting && existsSync(dest)) return { path: dest, skipped: true };
  const r = await fetch(row.content);
  if (!r.ok || !r.body) throw new Error(`download ${r.status} for ${String(row.content).slice(0, 80)}`);
  // Write to <dest>.part then rename, so a crash/abort mid-download never leaves
  // a TRUNCATED file at `dest` that skipExisting would then skip forever (→ a
  // permanently broken render). The rename is atomic on the same filesystem.
  const part = dest + ".part";
  try {
    await pipeline(Readable.fromWeb(r.body), createWriteStream(part));
    renameSync(part, dest);
  } catch (e) {
    try { rmSync(part, { force: true }); } catch (_) {}
    throw e;
  }
  return { path: dest, skipped: false };
}

// ── storage upload + library register (PUSH) ─────────────────────────────────
// Upload a local file to a Storage bucket (service role, x-upsert so re-upload
// is safe). Returns { url, storagePath }.
export async function uploadToStorage(localPath, bucket, storagePath, mime) {
  const { host, serviceKey } = loadCreds();
  const buf = readFileSync(localPath);
  const r = await fetch(`https://${host}/storage/v1/object/${bucket}/${storagePath}`, {
    method: "POST",
    headers: {
      "Content-Type": mime,
      Authorization: `Bearer ${serviceKey}`,
      "x-upsert": "true",
    },
    body: buf,
  });
  const body = await r.text();
  if (!r.ok) throw new Error(`storage upload ${r.status}: ${body.slice(0, 300)}`);
  return {
    url: `https://${host}/storage/v1/object/public/${bucket}/${storagePath}`,
    storagePath,
  };
}

// Register a content row via the ingest-content edge function (anon key — matches
// The Kraken's own deploy/upload scripts). Returns the new content row (incl id).
export async function ingestContent(payload) {
  const { host, anonKey } = loadCreds();
  const r = await fetch(`https://${host}/functions/v1/ingest-content`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${anonKey}` },
    body: JSON.stringify(payload),
  });
  const body = await r.text();
  let parsed;
  try { parsed = JSON.parse(body); } catch { throw new Error(`ingest parse error: ${body.slice(0, 300)}`); }
  if (!r.ok) throw new Error(`ingest-content ${r.status}: ${JSON.stringify(parsed).slice(0, 300)}`);
  return parsed;
}

// Assign a content row to a folder (ingest-content carries no folder_id, so this
// is a follow-up PATCH). Returns the updated row.
export async function setFolder(contentId, folderId) {
  const rows = await restPatch(`content_outputs?id=eq.${contentId}`, { folder_id: folderId });
  return rows[0] || null;
}

// Soft-delete a content row (set deleted_at). The library treats deleted_at-not-null
// as gone (findExistingByMeta + listFolderMedia both filter deleted_at=is.null), so
// this is the "REPLACE" primitive: soft-delete the stale row, then re-ingest fresh.
// Returns the updated row (or null).
export async function softDeleteContent(contentId, stamp) {
  const rows = await restPatch(`content_outputs?id=eq.${contentId}`, { deleted_at: stamp || new Date().toISOString() });
  return rows[0] || null;
}

// Idempotency: find an existing library row for this exact creative. Keyed on the
// (campaign, angleId, assetId) TRIPLE scoped to the workspace — assetIds like "A1"
// repeat across campaigns, so a bare-assetId match would wrongly skip a different
// campaign's creative.
export async function findExistingByMeta(workspaceId, campaign, angleId, assetId) {
  const q =
    `content_outputs?workspace_id=eq.${workspaceId}` +
    `&metadata->>campaign=eq.${encodeURIComponent(campaign)}` +
    `&metadata->>angleId=eq.${encodeURIComponent(angleId)}` +
    `&metadata->>assetId=eq.${encodeURIComponent(assetId)}` +
    `&deleted_at=is.null&select=id,content,folder_id,title&limit=1`;
  const rows = await restGet(q);
  return rows[0] || null;
}

// ── self-test ─────────────────────────────────────────────────────────────────
// node scripts/lib/kraken.mjs --selftest --workspace <name|uuid>
async function selftest() {
  const args = process.argv.slice(2);
  const wsArg = (() => {
    const i = args.indexOf("--workspace");
    return i >= 0 ? args[i + 1] : null;
  })();
  const cfg = loadKrakenConfig();
  const creds = loadCreds();
  console.log("[kraken] config:");
  console.log(`  host           : ${cfg.host}`);
  console.log(`  credentialsEnv : ${cfg.credentialsEnvPath}`);
  console.log(`  workspacesFile : ${cfg.workspacesFile}`);
  console.log(`  serviceKey     : ${mask(creds.serviceKey)}`);
  console.log(`  anonKey        : ${mask(creds.anonKey)}`);

  if (!wsArg) {
    console.log("\n[kraken] no --workspace given; known workspace names:");
    console.log("  " + Object.keys(loadWorkspaces()).join(", "));
    console.log("\nRe-run with: --selftest --workspace <name>");
    return;
  }
  const wsId = resolveWorkspaceId(wsArg);
  if (!wsId) {
    console.error(`[kraken] could not resolve workspace "${wsArg}"`);
    process.exit(1);
  }
  console.log(`\n[kraken] workspace "${wsArg}" → ${wsId}`);
  const folders = await listFolders(wsId);
  console.log(`[kraken] ${folders.length} folder(s):`);
  for (const f of folders.slice(0, 40)) console.log(`  - ${f.name}  (${f.id})`);
  if (folders.length) {
    const first = folders[0];
    const media = await listFolderMedia(wsId, first.id);
    const imgs = media.filter((m) => m.type === "image").length;
    const vids = media.filter((m) => m.type === "video").length;
    console.log(`\n[kraken] folder "${first.name}": ${media.length} media (${imgs} image, ${vids} video)`);
  }
  console.log("\n[kraken] self-test OK — creds parse, PostgREST reads, workspace resolve all work.");
}

// Run self-test only when invoked directly (never on import). Compare resolved
// native paths (fileURLToPath handles Windows drive letters + %20-encoded spaces).
const _invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (_invokedDirectly && process.argv.includes("--selftest")) {
  selftest().catch((e) => { console.error("[kraken] self-test FAILED:", e.message); process.exit(1); });
}

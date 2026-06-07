// ============================================================================
//  scripts/lib/drive.mjs — Google Drive connector (Phase A media source).
// ============================================================================
//  Mirrors lib/kraken.mjs: a thin, credential-isolated connector the editor-server
//  reaches ONLY by spawning the drive-list/drive CLIs (creds never load in the
//  server process). Uses RAW Google REST + a service-account JWT signed with
//  node:crypto — NO googleapis dependency.
//
//  Credentials (first that exists wins): env GOOGLE_DRIVE_SA (path to a service-
//  account JSON), else data/google-drive-sa.json. Absent/unreadable → driveConfigured()
//  is false and every op throws NotConfigured, so callers degrade gracefully (the
//  picker hides the Drive tab; routes return {available:false}, never 500).
//  NODE-ONLY.
// ============================================================================
import { readFileSync, existsSync, createWriteStream } from "node:fs";
import { join, resolve } from "node:path";
import { createSign } from "node:crypto";

const PROJECT_ROOT = resolve(".");
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/drive/v3";

export class NotConfigured extends Error {}

export function driveCredsPath() {
  const env = process.env.GOOGLE_DRIVE_SA;
  if (env && existsSync(env)) return env;
  const def = join(PROJECT_ROOT, "data", "google-drive-sa.json");
  return existsSync(def) ? def : null;
}
export function driveConfigured() { return !!driveCredsPath(); }

function loadCreds() {
  const p = driveCredsPath();
  if (!p) throw new NotConfigured("Google Drive not configured — set GOOGLE_DRIVE_SA or add data/google-drive-sa.json (a service-account JSON).");
  const j = JSON.parse(readFileSync(p, "utf8"));
  if (!j.client_email || !j.private_key) throw new NotConfigured("service-account JSON missing client_email/private_key");
  return j;
}

const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

// Service-account JWT → OAuth access token (cached for the process lifetime-ish).
let _tok = null, _tokExp = 0;
export async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (_tok && now < _tokExp - 60) return _tok;
  const creds = loadCreds();
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({ iss: creds.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const signer = createSign("RSA-SHA256"); signer.update(`${header}.${claim}`); signer.end();
  const sig = b64url(signer.sign(creds.private_key));
  const assertion = `${header}.${claim}.${sig}`;
  const r = await fetch(TOKEN_URL, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${assertion}`,
  });
  const j = await r.json();
  if (!j.access_token) throw new Error("Drive auth failed: " + JSON.stringify(j).slice(0, 200));
  _tok = j.access_token; _tokExp = now + (j.expires_in || 3600);
  return _tok;
}

async function api(path) {
  const tok = await getAccessToken();
  const r = await fetch(API + path, { headers: { Authorization: "Bearer " + tok } });
  if (!r.ok) throw new Error(`Drive API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

const DRIVE_FIELDS = "files(id,name,mimeType,thumbnailLink),nextPageToken";
const kindOf = (mime) => mime && mime.startsWith("video/") ? "video" : (mime && mime.startsWith("image/") ? "image" : "other");

// Folders under a parent (default root). Returns [{id,name,parent_id}].
export async function listFolders(parentId) {
  const q = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and trashed=false${parentId ? ` and '${parentId}' in parents` : ""}`);
  const j = await api(`/files?q=${q}&fields=files(id,name,parents)&pageSize=200&orderBy=name`);
  return (j.files || []).map((f) => ({ id: f.id, name: f.name, parent_id: (f.parents && f.parents[0]) || null }));
}

// Image/video files in a folder. Returns [{id,type,title,mime,thumbnailLink}].
export async function listFiles(folderId) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false and (mimeType contains 'image/' or mimeType contains 'video/')`);
  const j = await api(`/files?q=${q}&fields=${encodeURIComponent(DRIVE_FIELDS)}&pageSize=200&orderBy=name`);
  return (j.files || []).map((f) => ({ id: f.id, type: kindOf(f.mimeType), title: f.name, mime: f.mimeType, thumbnailLink: f.thumbnailLink || null }));
}

const EXT_FOR_MIME = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif",
  "video/mp4": ".mp4", "video/quicktime": ".mov", "video/webm": ".webm",
};
const extFromMime = (m) => EXT_FOR_MIME[m] || ".bin";

// Stream a file's bytes into destDir as <fileId><ext> (ext from mime, so the cached
// file is placeable/renderable). Returns { path, mime, name }.
export async function downloadFile(fileId, destStem) {
  const tok = await getAccessToken();
  const meta = await api(`/files/${fileId}?fields=name,mimeType`);
  const destPath = destStem + extFromMime(meta.mimeType);
  const r = await fetch(`${API}/files/${fileId}?alt=media`, { headers: { Authorization: "Bearer " + tok } });
  if (!r.ok || !r.body) throw new Error(`Drive download ${r.status}`);
  await new Promise((res, rej) => {
    const out = createWriteStream(destPath);
    const reader = r.body.getReader();
    (async () => { try { for (;;) { const { done, value } = await reader.read(); if (done) break; out.write(Buffer.from(value)); } out.end(); } catch (e) { rej(e); } })();
    out.on("finish", res); out.on("error", rej);
  });
  return { path: destPath, mime: meta.mimeType, name: meta.name };
}

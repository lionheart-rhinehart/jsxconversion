// ============================================================================
//  creative-editor/server.mjs — portable layer/media editor server.
// ============================================================================
//  createEditorServer(config) returns an http.Server exposing the CORE editor
//  routes. Everything host-specific is injected:
//
//    templateRoots  { findTemplate(id) -> {dir,configPath,jsxPath}|null,
//                     listTemplates() -> [id], assetsDirFor(id) -> dir|null }
//                   (see ./template-roots.mjs createTemplateRoots, or pass your own)
//    mediaProvider  { list(kind) -> [{id,path,source}], filePath(ref) -> abs|null,
//                     upload?(buf,name,kind) -> ref, remoteBrowse?() }   (optional)
//    renderer       { render(jsxPath,{out}) -> {ok,outPath,exitCode} }   (optional)
//    editorHtmlPath path to the editor UI html served at / and /editor
//    outDir         dir for rendered output, served at /out/*
//    plugins        [ (req,res,ctx) -> boolean ]  host routes (campaigns, Kraken…)
//                   tried BEFORE core routes; return true if handled
//    capabilities   { campaigns, kraken, copySwap } advertised at /capabilities
//
//  The campaign API, Kraken provider, and JSX→PNG renderer are NOT part of the
//  core — a host registers them. This is what lets the editor drop into any repo.
//  NODE-ONLY.
// ============================================================================
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, copyFileSync, renameSync, readdirSync } from "node:fs";
import { join, resolve, extname, basename } from "node:path";
import { spawnSync } from "node:child_process";

const MIME = {
  ".html": "text/html", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".json": "application/json", ".js": "application/javascript",
  ".mjs": "application/javascript", ".css": "text/css", ".mp4": "video/mp4", ".gif": "image/gif",
  ".webp": "image/webp", ".mov": "video/quicktime", ".webm": "video/webm",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".aac": "audio/aac", ".ogg": "audio/ogg",
};
const mimeOf = (p) => MIME[extname(p).toLowerCase()] || "application/octet-stream";

function send(res, status, body, contentType = "application/json") {
  res.writeHead(status, { "Content-Type": contentType, "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
  res.end(body);
}
const sendJson = (res, status, obj) => send(res, status, JSON.stringify(obj));

// Range-aware file serve (so <video> scrub works), mirrors the AA editor-server.
function sendFile(req, res, filePath, contentType) {
  const size = statSync(filePath).size;
  const headers = {
    "Content-Type": contentType, "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
    "Accept-Ranges": "bytes", "Cache-Control": "no-store",
  };
  const range = req.headers && req.headers.range;
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range);
  if (m) {
    let start = m[1] === "" ? null : parseInt(m[1], 10);
    let end = m[2] === "" ? null : parseInt(m[2], 10);
    if (start === null) { start = Math.max(0, size - (end || 0)); end = size - 1; }
    else if (end === null || end >= size) { end = size - 1; }
    if (start > end || start >= size) { res.writeHead(416, { ...headers, "Content-Range": `bytes */${size}` }); res.end(); return; }
    const chunk = readFileSync(filePath).subarray(start, end + 1);
    res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": chunk.length });
    res.end(chunk); return;
  }
  res.writeHead(200, { ...headers, "Content-Length": size });
  res.end(readFileSync(filePath));
}

const readBody = (req) => new Promise((r) => { let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => r(d)); });

const templateBase = (id) => `/template-asset/${encodeURIComponent(id)}/`;

export function createEditorServer(config = {}) {
  const {
    templateRoots,
    mediaProvider = null,
    renderer = null,
    editorHtmlPath,
    outDir = resolve("out"),
    plugins = [],
    capabilities = {},
  } = config;

  if (!templateRoots || typeof templateRoots.findTemplate !== "function") {
    throw new Error("createEditorServer: config.templateRoots with findTemplate/listTemplates/assetsDirFor is required");
  }
  const { findTemplate, listTemplates, assetsDirFor } = templateRoots;

  const caps = {
    campaigns: !!capabilities.campaigns,
    kraken: !!capabilities.kraken || !!(mediaProvider && mediaProvider.remoteBrowse),
    copySwap: !!capabilities.copySwap,
  };

  // ── Generic editor features that live in the engine (audio peaks, review markup,
  //    upload). These are file/ffmpeg utilities every host wants; host-specifics stay
  //    injected. All disk writes go under `dataDir` (default cwd) so the caches land
  //    in the HOST project, never in this package. ────────────────────────────────
  const DATA_DIR = config.dataDir ? resolve(config.dataDir) : resolve(".");
  const PEAKS_CACHE_DIR = join(DATA_DIR, ".peaks-cache");
  const ANNOTATIONS_DIR = join(DATA_DIR, ".annotations-store");
  const AI_INBOX_DIR = join(ANNOTATIONS_DIR, "_inbox");
  const PEAKS_RESOLUTION = Number(config.peaksResolution) || 1200;
  const UPLOAD_MAX_BYTES = Number(config.uploadMaxBytes) || 500 * 1024 * 1024;
  const SOURCE = config.source || "creative-editor";
  const EXT_FOR_KIND = config.extForKind || {
    photo: new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]),
    clip: new Set([".mp4", ".mov", ".webm"]),
    audio: new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg"]),
  };
  // Slug an editor id (which can look like "camp:c:a:as") to one safe filename — this
  // doubles as the path-traversal guard for the annotations/peaks stores (U9).
  const annSafeId = (id) => String(id).replace(/[^a-z0-9._-]+/gi, "_").slice(0, 200) || "creative";
  const peaksCachePath = (rel) => join(PEAKS_CACHE_DIR, String(rel).replace(/[\\/]/g, "__").replace(/[^a-z0-9._-]+/gi, "-") + ".json");
  // Resolve an audio ref to an absolute path: the media provider first, else
  // dataDir-relative — refusing any path that escapes dataDir (U9).
  function resolveMediaAbs(rel) {
    if (mediaProvider && typeof mediaProvider.filePath === "function") { const a = mediaProvider.filePath(rel); if (a && existsSync(a)) return a; }
    const abs = resolve(join(DATA_DIR, String(rel)));
    return abs.startsWith(resolve(DATA_DIR)) && existsSync(abs) ? abs : null;
  }
  function decodePeaks(absPath, numPeaks = PEAKS_RESOLUTION) {
    const dz = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", absPath], { encoding: "utf8" });
    const duration = parseFloat(String(dz.stdout || "").trim()) || 0;
    const pcm = spawnSync("ffmpeg", ["-v", "error", "-i", absPath, "-ac", "1", "-ar", "4000", "-f", "s16le", "-"], { maxBuffer: 1 << 28 });
    const buf = pcm.stdout;
    if (!buf || buf.length < 2) return { peaks: new Array(numPeaks).fill(0), duration };
    const totalSamples = buf.length >> 1;
    const binSize = Math.max(1, Math.floor(totalSamples / numPeaks));
    const peaks = new Array(numPeaks);
    for (let i = 0; i < numPeaks; i++) {
      const sb = i * binSize * 2, eb = Math.min(sb + binSize * 2, buf.length); let mx = 0;
      for (let j = sb; j + 1 < eb; j += 2) { const v = Math.abs(buf.readInt16LE(j)); if (v > mx) mx = v; }
      peaks[i] = Math.round((mx / 32768) * 10000) / 10000;
    }
    return { peaks, duration };
  }
  function ensurePeaks(rel) {
    const abs = resolveMediaAbs(rel); if (!abs) return null;
    const cacheFile = peaksCachePath(rel);
    try { if (existsSync(cacheFile) && statSync(cacheFile).mtimeMs >= statSync(abs).mtimeMs) return JSON.parse(readFileSync(cacheFile, "utf8")); } catch { /* re-decode */ }
    try {
      const data = decodePeaks(abs); mkdirSync(PEAKS_CACHE_DIR, { recursive: true });
      const tmp = cacheFile + ".tmp"; writeFileSync(tmp, JSON.stringify(data)); renameSync(tmp, cacheFile); return data;
    } catch (e) { console.error(`[peaks] decode failed for ${rel}: ${(e && e.message) || e}`); return null; }
  }
  const readAnnRecord = (id) => {
    const file = join(ANNOTATIONS_DIR, annSafeId(id) + ".json"); let rec = { creative: null, annotations: [] };
    try { if (existsSync(file)) rec = JSON.parse(readFileSync(file, "utf8")); } catch { /* none/corrupt */ }
    return rec;
  };
  const annPackage = (id) => {
    const rec = readAnnRecord(id);
    return { creative: rec.creative || { editorId: id, source: SOURCE, schemaVersion: 1 }, annotations: Array.isArray(rec.annotations) ? rec.annotations : [], publishedAt: new Date().toISOString() };
  };

  const server = createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }

    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;
    const ctx = { url, path, send, sendJson, sendFile, readBody, templateRoots, mediaProvider, renderer };

    try {
      // 1) Host plugins first (campaign API, Kraken, etc.).
      for (const plugin of plugins) {
        if (await plugin(req, res, ctx)) return;
      }

      // 2) Capabilities — lets the UI hide features the host didn't wire.
      if (path === "/capabilities" && req.method === "GET") { sendJson(res, 200, caps); return; }

      // 3) Template list.
      if (path === "/clusters" && req.method === "GET") { sendJson(res, 200, { clusters: listTemplates() }); return; }

      // 4) GET/POST /template-config/:id
      const cfg = path.match(/^\/template-config\/([A-Za-z0-9._-]+)$/);
      if (cfg) {
        const id = cfg[1]; const found = findTemplate(id);
        if (!found) { sendJson(res, 404, { error: `template "${id}" not found` }); return; }
        if (req.method === "GET") {
          res.setHeader("X-Template-Base", templateBase(id));
          res.setHeader("Access-Control-Expose-Headers", "X-Template-Base");
          send(res, 200, readFileSync(found.configPath, "utf8")); return;
        }
        if (req.method === "POST") {
          const body = await readBody(req);
          try { writeFileSync(found.configPath, JSON.stringify(JSON.parse(body), null, 2)); sendJson(res, 200, { saved: true, id }); }
          catch (e) { sendJson(res, 400, { error: e.message }); }
          return;
        }
      }

      // 5) POST /render-template/:id (needs an injected renderer).
      //    The contract is WIDE so a host can render PNG *or* MP4: the renderer gets
      //    the template's configPath (to detect a video background), the outDir, and an
      //    abort `signal` (wired to the client closing the connection so a long render
      //    can't orphan), and returns { ok, format, outPath, exitCode, stdout?, stderr? }.
      const rnd = path.match(/^\/render-template\/([A-Za-z0-9._-]+)$/);
      if (rnd && req.method === "POST") {
        const id = rnd[1]; const found = findTemplate(id);
        if (!found) { sendJson(res, 404, { error: `template "${id}" not found` }); return; }
        if (!renderer) { sendJson(res, 501, { error: "no renderer configured for this host" }); return; }
        const ac = new AbortController();
        req.on("close", () => { try { ac.abort(); } catch (_) {} });
        try {
          const r = await renderer.render({ id, jsxPath: found.jsxPath, configPath: found.configPath, outDir, signal: ac.signal });
          const ok = !!(r && r.ok);
          // Emit every key the UI may read across PNG/MP4 paths (shape-stable, U3).
          sendJson(res, ok ? 200 : 500, {
            exitCode: r ? r.exitCode : -1, format: (r && r.format) || "image",
            output: r && r.outPath, out: r && r.outPath,
            stdout: r && r.stdout, stderr: r && r.stderr,
          });
        } catch (e) { sendJson(res, 500, { error: String((e && e.message) || e) }); }
        return;
      }

      // 6) GET /template-asset/:id/<relpath> — a template's media, any disk location.
      const ta = path.match(/^\/template-asset\/([A-Za-z0-9._-]+)\/(.+)$/);
      if (ta && req.method === "GET") {
        const found = findTemplate(ta[1]);
        if (found) {
          const r = resolve(join(found.dir, decodeURIComponent(ta[2])));
          if (r.startsWith(resolve(found.dir)) && existsSync(r)) { sendFile(req, res, r, mimeOf(r)); return; }
        }
        sendJson(res, 404, { error: "template asset not found" }); return;
      }

      // 7) Media picker (optional provider).
      if (path === "/media" && req.method === "GET") {
        if (!mediaProvider) { sendJson(res, 200, { items: [] }); return; }
        const kind = url.searchParams.get("kind") || "photo";
        sendJson(res, 200, { items: mediaProvider.list(kind) || [] });
        return;
      }
      if (path.startsWith("/media-file/") && req.method === "GET") {
        if (!mediaProvider) { sendJson(res, 404, { error: "no media provider" }); return; }
        const ref = decodeURIComponent(path.slice("/media-file/".length));
        const abs = mediaProvider.filePath(ref);
        if (abs && existsSync(abs)) { sendFile(req, res, abs, mimeOf(abs)); return; }
        sendJson(res, 404, { error: "media not found" }); return;
      }
      // POST /media-into-template { src, editorId } — stage a media file into the
      // resolved template's assets/ dir (the static renderer copies only that dir).
      if (path === "/media-into-template" && req.method === "POST") {
        try {
          const { src, editorId } = JSON.parse((await readBody(req)) || "{}");
          if (!src) { sendJson(res, 400, { error: "missing src" }); return; }
          const from = mediaProvider ? mediaProvider.filePath(src) : (existsSync(resolve(src)) ? resolve(src) : null);
          if (!from) { sendJson(res, 404, { error: "source media not found" }); return; }
          const dir = (editorId && assetsDirFor(editorId)) || null;
          if (!dir) { sendJson(res, 400, { error: "could not resolve a template assets dir (pass editorId)" }); return; }
          mkdirSync(dir, { recursive: true });
          const slug = basename(from, extname(from)).replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "photo";
          const name = "swap-" + slug + extname(from).toLowerCase();
          copyFileSync(from, join(dir, name));
          sendJson(res, 200, { path: "./assets/" + name });
        } catch (e) { sendJson(res, 500, { error: String((e && e.message) || e) }); }
        return;
      }

      // 7b) Audio waveform peaks — ffmpeg decode + mtime cache under dataDir. Never
      //     500s the picker: a decode failure returns { error } and the UI degrades.
      if (path === "/peaks" && req.method === "GET") {
        const file = url.searchParams.get("file");
        if (!file) { sendJson(res, 400, { error: "missing file" }); return; }
        const data = ensurePeaks(file);
        if (!data) { sendJson(res, 200, { error: "could not decode peaks (missing file or ffmpeg)" }); return; }
        sendJson(res, 200, data); return;
      }

      // 7c) Review markup (Frame.io-style timestamped annotations) — self-describing
      //     sidecars under dataDir/.annotations-store. NEVER exported. id is a query
      //     param (ids can look like "camp:c:a:as").
      if (path === "/annotations" && req.method === "GET" && !url.searchParams.get("id")) {
        const sets = [];
        try {
          for (const f of readdirSync(ANNOTATIONS_DIR)) {
            if (!f.endsWith(".json") || f.endsWith(".tmp")) continue;
            try {
              const rec = JSON.parse(readFileSync(join(ANNOTATIONS_DIR, f), "utf8")); const c = rec.creative || null;
              sets.push({ editorId: (c && c.editorId) || f.replace(/\.json$/, ""), creative: c, count: Array.isArray(rec.annotations) ? rec.annotations.length : 0, updatedAt: (c && c.updatedAt) || null });
            } catch { /* skip a corrupt file */ }
          }
        } catch { /* no store dir yet */ }
        sets.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
        sendJson(res, 200, { sets }); return;
      }
      if (path === "/annotations/publish" && (req.method === "GET" || req.method === "POST")) {
        const id = url.searchParams.get("id"); if (!id) { sendJson(res, 400, { error: "missing ?id=" }); return; }
        // FUTURE INTEGRATION POINT — wire a real destination (portal/webhook/MCP) here.
        sendJson(res, 200, { ok: true, published: false, package: annPackage(id) }); return;
      }
      if (path === "/annotations/to-ai" && req.method === "POST") {
        const id = url.searchParams.get("id"); if (!id) { sendJson(res, 400, { error: "missing ?id=" }); return; }
        const pkg = annPackage(id); const safe = annSafeId(id); const fileRel = ".annotations-store/_inbox/" + safe + ".json";
        try {
          mkdirSync(AI_INBOX_DIR, { recursive: true });
          writeFileSync(join(AI_INBOX_DIR, safe + ".json"), JSON.stringify(pkg, null, 2));
          writeFileSync(join(AI_INBOX_DIR, "_latest.json"), JSON.stringify(Object.assign({ inboxFile: fileRel }, pkg), null, 2));
          sendJson(res, 200, { ok: true, count: pkg.annotations.length, path: fileRel });
        } catch (e) { sendJson(res, 500, { error: String((e && e.message) || e) }); }
        return;
      }
      if (path === "/annotations" && (req.method === "GET" || req.method === "POST")) {
        const id = url.searchParams.get("id"); if (!id) { sendJson(res, 400, { error: "missing ?id=" }); return; }
        const file = join(ANNOTATIONS_DIR, annSafeId(id) + ".json");
        if (req.method === "GET") { try { sendJson(res, 200, existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : { creative: null, annotations: [] }); } catch { sendJson(res, 200, { creative: null, annotations: [] }); } return; }
        try {
          const body = JSON.parse((await readBody(req)) || "{}");
          const annotations = Array.isArray(body.annotations) ? body.annotations : [];
          const creative = Object.assign({}, body.creative || {}, { editorId: id, source: SOURCE, schemaVersion: 1, updatedAt: new Date().toISOString() });
          mkdirSync(ANNOTATIONS_DIR, { recursive: true });
          const tmp = file + ".tmp"; writeFileSync(tmp, JSON.stringify({ creative, annotations }, null, 2)); renameSync(tmp, file);
          sendJson(res, 200, { ok: true, count: annotations.length });
        } catch (e) { sendJson(res, 400, { error: String((e && e.message) || e) }); }
        return;
      }

      // 7d) Upload from the user's computer — the PROVIDER owns the destination (C3),
      //     so the engine never hardcodes a cache path. Buffered with a hard cap.
      if (path === "/media-upload" && req.method === "POST") {
        const kind = url.searchParams.get("kind") || "photo";
        const rawName = url.searchParams.get("name") || "upload";
        const exts = EXT_FOR_KIND[kind];
        if (!exts) { sendJson(res, 400, { error: `bad kind "${kind}"` }); return; }
        const ext = extname(rawName).toLowerCase();
        if (!exts.has(ext)) { sendJson(res, 400, { error: `extension "${ext}" not allowed for ${kind}` }); return; }
        if (!mediaProvider || typeof mediaProvider.upload !== "function") { sendJson(res, 501, { error: "no upload provider configured" }); return; }
        const chunks = []; let size = 0, aborted = false;
        req.on("data", (c) => {
          if (aborted) return; size += c.length;
          if (size > UPLOAD_MAX_BYTES) { aborted = true; try { req.destroy(); } catch (_) {} if (!res.headersSent) sendJson(res, 413, { error: "file too large (>500MB)" }); return; }
          chunks.push(c);
        });
        req.on("end", () => {
          if (aborted) return;
          try {
            const ref = mediaProvider.upload(Buffer.concat(chunks), rawName, kind, { campaign: url.searchParams.get("campaign") || null });
            const out = (ref && typeof ref === "object") ? ref : { name: basename(String(ref)), path: ref, url: "/media-file/" + ref };
            sendJson(res, 200, Object.assign({ source: "uploaded" }, out));
          } catch (e) { if (!res.headersSent) sendJson(res, 500, { error: String((e && e.message) || e) }); }
        });
        return;
      }

      // 8) Rendered output + the editor UI.
      if (path.startsWith("/out/") && req.method === "GET") {
        const fp = join(outDir, path.slice("/out/".length));
        if (resolve(fp).startsWith(resolve(outDir)) && existsSync(fp)) { sendFile(req, res, fp, mimeOf(fp)); return; }
      }
      if ((path === "/" || path === "/editor" || path === "/editor.html") && req.method === "GET") {
        if (editorHtmlPath && existsSync(editorHtmlPath)) { send(res, 200, readFileSync(editorHtmlPath), "text/html"); return; }
        send(res, 200, "<!doctype html><meta charset=utf8><title>creative-editor</title><p>No editorHtmlPath configured.", "text/html");
        return;
      }

      sendJson(res, 404, { error: "not found", path });
    } catch (e) {
      if (!res.headersSent) sendJson(res, 500, { error: String((e && e.message) || e) });
    }
  });

  return server;
}

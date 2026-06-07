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
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, copyFileSync } from "node:fs";
import { join, resolve, extname, basename } from "node:path";

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
      const rnd = path.match(/^\/render-template\/([A-Za-z0-9._-]+)$/);
      if (rnd && req.method === "POST") {
        const id = rnd[1]; const found = findTemplate(id);
        if (!found) { sendJson(res, 404, { error: `template "${id}" not found` }); return; }
        if (!renderer) { sendJson(res, 501, { error: "no renderer configured for this host" }); return; }
        const out = join(outDir, `${id}.png`);
        try {
          const r = await renderer.render(found.jsxPath, { out });
          sendJson(res, r && r.ok ? 200 : 500, { exitCode: r ? r.exitCode : -1, output: r && r.outPath });
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

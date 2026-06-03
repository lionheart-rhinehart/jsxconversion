#!/usr/bin/env node
// Drag-drop editor backend.
//
// Routes:
//   GET  /                          → editor home (templates/multi-sport-foundations only for now)
//   GET  /editor                    → drag-drop editor for ?cluster=N
//   GET  /config/cluster-N          → returns per-template config JSON
//   POST /config/cluster-N          → writes config JSON
//   POST /render/cluster-N          → runs renderer, returns exit + paths
//   GET  /clusters                  → lists available cluster configs
//   GET  /static/...                → static files from out/ directory
//   GET  /out/...                   → rendered PNGs
//
// Usage:
//   node scripts/editor-server.mjs
//   then open http://localhost:5173/

import { createServer } from "node:http";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  copyFileSync,
  readdirSync,
  mkdirSync,
  renameSync,
  statSync,
} from "node:fs";
import { join, resolve, extname, basename, dirname } from "node:path";
import { spawn } from "node:child_process";
import { resolveStaticConfig } from "./lib/fill-core.mjs";
import { fieldRole, BEAT_HEADLINE_ROLE, beatLetter } from "./lib/roles.mjs";

const PORT = Number(process.env.EDITOR_PORT) || 5173;
const PROJECT_ROOT = resolve(".");
const TEMPLATES_DIR = join(PROJECT_ROOT, "templates/multi-sport-foundations");
const OUT_DIR = join(PROJECT_ROOT, "out");
const EDITOR_DIR = join(OUT_DIR, "editor");
const COMPARE_DIR = join(OUT_DIR, "compare");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");
const DATA_DIR = join(PROJECT_ROOT, "data");
const VIDEO_DIR = join(PROJECT_ROOT, "brand/video-templates");
const VIDEO_TEMPLATES_DIR = join(VIDEO_DIR, "templates");
// Brand media library — photos/clips/audio selectable in the video edit pickers.
// brand/kraken-cache holds raw media pulled from The Kraken Content Library
// (scripts/kraken-pull.mjs) — kept FLAT because the /media route reads each root
// with a single non-recursive readdirSync.
const MEDIA_ROOTS = [
  join(PROJECT_ROOT, "brand/aa-design-system/project/uploads"),
  join(PROJECT_ROOT, "brand/aa-design-system/project/assets"),
  join(VIDEO_DIR, "assets"),
  join(PROJECT_ROOT, "music-library"),
  join(PROJECT_ROOT, "brand/kraken-cache"),
];
const PHOTO_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const CLIP_EXT = new Set([".mp4", ".mov", ".webm"]);
const AUDIO_EXT = new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg"]);
const EXT_FOR_KIND = { photo: PHOTO_EXT, clip: CLIP_EXT, audio: AUDIO_EXT };

// Per-asset authoritative static config — MUST match run-campaign.mjs so the
// editor writes and the runner reads the same file (B1/B2).
function editsConfigPath(campaign, angleId, assetId) {
  return join(CAMPAIGNS_DIR, campaign, "edits", `${angleId}__${assetId}.config.json`);
}

// Atomic write: temp file in the same dir, then rename (so a crash mid-write
// never leaves a half-written config the runner might read).
function writeAtomic(filePath, contents) {
  mkdirSync(dirname(filePath), { recursive: true });
  const tmp = filePath + ".tmp";
  writeFileSync(tmp, contents);
  renameSync(tmp, filePath);
}

// Patch a plan asset in place (read-modify-write). Same-process single writer —
// callers in this server never race each other.
function stampPlanAsset(campaign, angleId, assetId, fields) {
  const p = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
  if (!existsSync(p)) return false;
  const plan = JSON.parse(readFileSync(p, "utf8"));
  const angle = (plan.angles || []).find((a) => a.id === angleId);
  const asset = angle && (angle.assets || []).find((a) => a.id === assetId);
  if (!asset) return false;
  Object.assign(asset, fields);
  writeAtomic(p, JSON.stringify(plan, null, 2));
  return true;
}

// Extract a motion template's *_SPEC.fields array. The fields array is pure JSON
// (quoted keys) so we balance-match the brackets after `fields:` and JSON.parse.
function extractSpecFields(src) {
  const at = src.indexOf("fields:");
  if (at < 0) return null;
  const open = src.indexOf("[", at);
  if (open < 0) return null;
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(src.slice(open, i + 1)); }
        catch { return null; }
      }
    }
  }
  return null;
}

// First campaign folder that has a creative-plan.json (used when /plan is
// called without ?campaign=).
function firstCampaign() {
  try {
    return (
      readdirSync(CAMPAIGNS_DIR).filter((d) =>
        existsSync(join(CAMPAIGNS_DIR, d, "creative-plan.json")),
      )[0] || null
    );
  } catch (_) {
    return null;
  }
}

const MIME = {
  ".html": "text/html",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".mp4": "video/mp4",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

function send(res, status, body, contentType = "application/json") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendJson(res, status, obj) {
  send(res, status, JSON.stringify(obj));
}

// Serve a file with HTTP range support. WHY: a <video> element only allows
// seeking (and reports non-empty `seekable` ranges) when the source supports
// byte-range requests (206 Partial Content + Accept-Ranges). Without it the
// editor's clip-trim scrub can't seek the preview ("currentTime = X" resets to
// 0 / seekable is [0,0]). Files here are small (IG clips), so readFileSync +
// slice is fine.
function sendFile(req, res, filePath, contentType) {
  const size = statSync(filePath).size;
  const headers = {
    "Content-Type": contentType,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Expose-Headers": "Content-Length, Content-Range, Accept-Ranges",
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store",
  };
  const range = req.headers && req.headers.range;
  const m = range && /^bytes=(\d*)-(\d*)$/.exec(range);
  if (m) {
    let start = m[1] === "" ? null : parseInt(m[1], 10);
    let end = m[2] === "" ? null : parseInt(m[2], 10);
    if (start === null) { start = Math.max(0, size - (end || 0)); end = size - 1; } // suffix range
    else if (end === null || end >= size) { end = size - 1; }
    if (start > end || start >= size) {
      res.writeHead(416, { ...headers, "Content-Range": `bytes */${size}` });
      res.end();
      return;
    }
    const chunk = readFileSync(filePath).subarray(start, end + 1);
    res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": chunk.length });
    res.end(chunk);
    return;
  }
  res.writeHead(200, { ...headers, "Content-Length": size });
  res.end(readFileSync(filePath));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // GET /clusters — list available cluster configs
  if (path === "/clusters" && req.method === "GET") {
    const files = readdirSync(TEMPLATES_DIR).filter((f) =>
      f.match(/^cluster-[\w-]+\.config\.json$/),
    );
    const list = files
      .map((f) => f.replace(/\.config\.json$/, ""))
      .sort((a, b) => {
        const num = (s) => parseInt(s.replace(/^cluster-/, ""), 10) || 0;
        return num(a) - num(b);
      });
    sendJson(res, 200, { clusters: list });
    return;
  }

  // GET/POST /config/cluster-N
  const configMatch = path.match(/^\/config\/(cluster-[\w-]+)$/);
  if (configMatch) {
    const id = configMatch[1];
    const configPath = join(TEMPLATES_DIR, `${id}.config.json`);

    if (req.method === "GET") {
      if (!existsSync(configPath)) {
        sendJson(res, 404, { error: `Config not found for ${id}` });
        return;
      }
      send(res, 200, readFileSync(configPath, "utf8"));
      return;
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      try {
        const parsed = JSON.parse(body);
        writeFileSync(configPath, JSON.stringify(parsed, null, 2));
        sendJson(res, 200, { saved: true, id });
      } catch (e) {
        sendJson(res, 400, { error: e.message });
      }
      return;
    }
  }

  // POST /render/cluster-N
  const renderMatch = path.match(/^\/render\/(cluster-[\w-]+)$/);
  if (renderMatch && req.method === "POST") {
    const id = renderMatch[1];
    const jsxPath = join(TEMPLATES_DIR, `${id}.jsx`);
    if (!existsSync(jsxPath)) {
      sendJson(res, 404, { error: `Template not found: ${id}.jsx` });
      return;
    }

    const proc = spawn(
      "node",
      [".claude/skills/jsx-to-mp4/scripts/render.mjs", jsxPath],
      { cwd: PROJECT_ROOT },
    );
    let stdout = "", stderr = "";
    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("exit", (code) => {
      // Sync to compare folder so the compare viewer also sees the update
      if (code === 0) {
        const src = join(OUT_DIR, `${id}.png`);
        const dst = join(COMPARE_DIR, `${id}-rendered.png`);
        if (existsSync(src)) {
          try { copyFileSync(src, dst); } catch (_) {}
        }
      }
      sendJson(res, code === 0 ? 200 : 500, {
        exitCode: code,
        stdout: stdout.slice(-2000),
        stderr: stderr.slice(-2000),
      });
    });
    return;
  }

  // ── Campaign review API (consumed by brand/video-templates/review.html) ──

  // GET /campaigns — list campaign folders that have a creative-plan.json
  if (path === "/campaigns" && req.method === "GET") {
    let list = [];
    try {
      list = readdirSync(CAMPAIGNS_DIR).filter((d) =>
        existsSync(join(CAMPAIGNS_DIR, d, "creative-plan.json")),
      );
    } catch (_) {}
    sendJson(res, 200, { campaigns: list });
    return;
  }

  // GET /plan?campaign=<name> — the creative-plan.json (defaults to the first)
  if (path === "/plan" && req.method === "GET") {
    const campaign = url.searchParams.get("campaign") || firstCampaign();
    if (!campaign) {
      sendJson(res, 404, { error: "no campaigns with a creative-plan.json" });
      return;
    }
    const p = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
    if (!existsSync(p)) {
      sendJson(res, 404, { error: `no plan for campaign "${campaign}"` });
      return;
    }
    send(res, 200, readFileSync(p, "utf8"));
    return;
  }

  // POST /plan/:campaign/:angle/:asset — patch ONE asset. The server is the
  // single writer of the plan file (atomic read-modify-write) so background
  // render updates and reviewer edits can't clobber each other.
  const planPatch = path.match(/^\/plan\/([\w.-]+)\/([\w.-]+)\/([\w.-]+)$/);
  if (planPatch && req.method === "POST") {
    const [, campaign, angleId, assetId] = planPatch;
    const p = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
    if (!existsSync(p)) {
      sendJson(res, 404, { error: `no plan for campaign "${campaign}"` });
      return;
    }
    const body = await readBody(req);
    let patch;
    try {
      patch = JSON.parse(body);
    } catch (e) {
      sendJson(res, 400, { error: e.message });
      return;
    }
    const plan = JSON.parse(readFileSync(p, "utf8"));
    const angle = (plan.angles || []).find((a) => a.id === angleId);
    if (!angle) {
      sendJson(res, 404, { error: `angle "${angleId}" not found` });
      return;
    }
    const asset = (angle.assets || []).find((a) => a.id === assetId);
    if (!asset) {
      sendJson(res, 404, { error: `asset "${assetId}" not found` });
      return;
    }
    // Only the reviewer-editable fields can be patched this way. Includes the
    // edit/render stamps and the motion edit-surface fields (Part 4).
    const ALLOWED = [
      "status", "notes", "flags", "headline", "microscript", "output", "thumb",
      "editedAt", "renderedAt", "templateData", "clip", "photo", "audio", "template",
      "kraken", // Content-Library writeback from kraken-export.mjs ({id,url,folder})
    ];
    for (const k of ALLOWED) if (k in patch) asset[k] = patch[k];
    writeFileSync(p, JSON.stringify(plan, null, 2));
    sendJson(res, 200, { saved: true, campaign, angle: angleId, asset: assetId });
    return;
  }

  // GET /campaign-values/:campaign — deduped copy values across the plan, for
  // the quick-swap dropdowns. H1: wrapped so a malformed asset can NEVER throw
  // past the handler (which has no outer try/catch) and hang the client.
  const campVals = path.match(/^\/campaign-values\/([\w.-]+)$/);
  if (campVals && req.method === "GET") {
    const campaign = campVals[1];
    try {
      const planFile = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
      if (!existsSync(planFile)) { sendJson(res, 404, { error: `no plan for "${campaign}"` }); return; }
      const plan = JSON.parse(readFileSync(planFile, "utf8"));
      const microscript = new Set(), headline = new Set(), all = new Set();
      const byKey = {};
      const byRole = {};                                              // copy-role pool (P5)
      const add = (set, v) => { if (typeof v === "string" && v.trim()) { set.add(v); all.add(v); } };
      const addRole = (role, v) => { if (role && typeof v === "string" && v.trim()) (byRole[role] = byRole[role] || new Set()).add(v); };
      for (const ang of plan.angles || []) {
        for (const a of ang.assets || []) {
          add(microscript, a.microscript);
          add(headline, a.headline);
          // Role buckets: headline routed by beat, microscript → reframe.
          addRole(BEAT_HEADLINE_ROLE[beatLetter(a.beat)] || "hook", a.headline);
          addRole("reframe", a.microscript);
          if (a.templateData && typeof a.templateData === "object") {  // H1 guard
            for (const [k, v] of Object.entries(a.templateData)) {
              if (k.startsWith("_")) continue;                          // skip _overrides etc.
              if (typeof v !== "string" || !v.trim()) continue;
              (byKey[k] = byKey[k] || new Set()).add(v);
              addRole(fieldRole(k), v);                                 // role bucket by field name
              all.add(v);
            }
          }
        }
      }
      const byKeyArr = {};
      for (const k of Object.keys(byKey)) byKeyArr[k] = [...byKey[k]];
      const byRoleArr = {};
      for (const r of Object.keys(byRole)) byRoleArr[r] = [...byRole[r]];
      sendJson(res, 200, {
        microscript: [...microscript], headline: [...headline],
        byKey: byKeyArr, byRole: byRoleArr, all: [...all],
      });
    } catch (e) {
      sendJson(res, 500, { error: e.message });
    }
    return;
  }

  // ── Campaign EDIT API (Part 2: static editor + video modal back end) ──

  // GET/POST /campaign-config/:campaign/:angle/:asset — the static per-asset
  // layer-model config (the user's authoritative hand edits). GET creates it on
  // first access by resolving the template fill (the ONE fill path, shared with
  // the runner) and writing the edits file; POST saves it + stamps editedAt.
  const campCfg = path.match(/^\/campaign-config\/([\w.-]+)\/([\w.-]+)\/([\w.-]+)$/);
  if (campCfg) {
    const [, campaign, angleId, assetId] = campCfg;
    const editsPath = editsConfigPath(campaign, angleId, assetId);

    if (req.method === "GET") {
      if (existsSync(editsPath)) { send(res, 200, readFileSync(editsPath, "utf8")); return; }
      const planFile = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
      if (!existsSync(planFile)) { sendJson(res, 404, { error: `no plan for "${campaign}"` }); return; }
      const plan = JSON.parse(readFileSync(planFile, "utf8"));
      const angle = (plan.angles || []).find((a) => a.id === angleId);
      const asset = angle && (angle.assets || []).find((a) => a.id === assetId);
      if (!asset) { sendJson(res, 404, { error: `asset "${assetId}" not found` }); return; }
      if (!asset.template || !asset.template.startsWith("cluster-")) {
        sendJson(res, 400, { error: `asset "${assetId}" is not a static cluster template (template=${asset.template})` });
        return;
      }
      const location = asset.location || (angle && angle.location) || plan.location || null;
      const config = resolveStaticConfig({
        clusterId: asset.template, asset, brand: plan.brand, location, campaign,
        templateDir: TEMPLATES_DIR, dataDir: DATA_DIR,
      });
      if (!config) { sendJson(res, 404, { error: `could not resolve config for ${asset.template}` }); return; }
      writeAtomic(editsPath, JSON.stringify(config, null, 2));
      send(res, 200, JSON.stringify(config));
      return;
    }

    if (req.method === "POST") {
      const body = await readBody(req);
      let parsed;
      try { parsed = JSON.parse(body); } catch (e) { sendJson(res, 400, { error: e.message }); return; }
      writeAtomic(editsPath, JSON.stringify(parsed, null, 2));
      stampPlanAsset(campaign, angleId, assetId, { editedAt: new Date().toISOString() });
      sendJson(res, 200, { saved: true, campaign, angle: angleId, asset: assetId });
      return;
    }
  }

  // POST /render-asset/:campaign/:angle/:asset — render ONE asset now, bypassing
  // the approval gate (single-asset edit-render). The runner patches
  // output/thumb/renderedAt back into the plan via this server's single-writer
  // route; we read it back to return the fresh output path.
  const renderAsset = path.match(/^\/render-asset\/([\w.-]+)\/([\w.-]+)\/([\w.-]+)$/);
  if (renderAsset && req.method === "POST") {
    const [, campaign, angleId, assetId] = renderAsset;
    const proc = spawn(
      "node",
      ["scripts/run-campaign.mjs", campaign, "--only", assetId, "--angle", angleId, "--all"],
      { cwd: PROJECT_ROOT },
    );
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("exit", (code) => {
      let output = null;
      try {
        const plan = JSON.parse(readFileSync(join(CAMPAIGNS_DIR, campaign, "creative-plan.json"), "utf8"));
        const angle = (plan.angles || []).find((a) => a.id === angleId);
        const asset = angle && (angle.assets || []).find((a) => a.id === assetId);
        output = asset ? asset.output : null;
      } catch (_) {}
      sendJson(res, code === 0 ? 200 : 500, { exitCode: code, output, stderr: stderr.slice(-2000) });
    });
    return;
  }

  // GET /template-spec/:template — a motion template's editable copy fields +
  // the window component name (so the review page can mount it for live preview
  // — the runner wraps THIS component in a 1080×1920 Stage, B8).
  const specMatch = path.match(/^\/template-spec\/([\w-]+)$/);
  if (specMatch && req.method === "GET") {
    const tmpl = specMatch[1];
    const p = join(VIDEO_TEMPLATES_DIR, `${tmpl}.jsx`);
    if (!existsSync(p)) { sendJson(res, 404, { error: `template "${tmpl}" not found` }); return; }
    const src = readFileSync(p, "utf8");
    const fields = extractSpecFields(src);
    // Same component-detection as run-campaign.mjs (the wrapper mounts this).
    const component = (src.match(/window\.([A-Za-z_$][\w$]*Reel)\s*=/) ||
      src.match(/window\.([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\s*;/) || [])[1] || null;
    sendJson(res, 200, { template: tmpl, fields: fields || [], component });
    return;
  }

  // GET /bank?type=motion|static — bank templates for the swap dropdown.
  if (path === "/bank" && req.method === "GET") {
    const type = url.searchParams.get("type") || "motion";
    let templates = [];
    try {
      if (type === "static") {
        templates = readdirSync(TEMPLATES_DIR)
          .filter((f) => /^cluster-[\w-]+\.config\.json$/.test(f))
          .map((f) => f.replace(/\.config\.json$/, ""));
      } else {
        templates = readdirSync(VIDEO_TEMPLATES_DIR)
          .filter((f) => f.endsWith(".jsx"))
          .map((f) => f.replace(/\.jsx$/, ""));
      }
    } catch (_) {}
    templates.sort();
    sendJson(res, 200, { type, templates });
    return;
  }

  // GET /media?kind=photo|clip|audio — selectable brand media (served paths).
  if (path === "/media" && req.method === "GET") {
    const kind = url.searchParams.get("kind") || "photo";
    const exts = EXT_FOR_KIND[kind] || PHOTO_EXT;
    const items = [];
    for (const root of MEDIA_ROOTS) {
      let files = [];
      try { files = readdirSync(root); } catch (_) { continue; }
      for (const f of files) {
        if (!exts.has(extname(f).toLowerCase())) continue;
        const abs = join(root, f);
        const rel = abs.slice(PROJECT_ROOT.length + 1).replace(/\\/g, "/");
        items.push({ name: f, path: rel, url: "/media-file/" + rel });
      }
    }
    sendJson(res, 200, { kind, items });
    return;
  }

  // POST /media-into-template { src } — copy a chosen brand-library photo into
  // templates/multi-sport-foundations/library/ and return "./library/<name>".
  // WHY: MediaSlot renders src={path} verbatim, resolved relative to
  // TEMPLATE_DIR, so a library photo must be copied in (a /media-file URL would
  // preview but render BLANK). The "./library/<name>" path resolves identically
  // in the editor preview (/templates/...) AND the PNG render (relative to dir).
  if (path === "/media-into-template" && req.method === "POST") {
    try {
      const { src } = JSON.parse((await readBody(req)) || "{}");
      if (!src) { sendJson(res, 400, { error: "missing src" }); return; }
      const from = resolve(join(PROJECT_ROOT, src));
      // Guard: source must live under a known brand-media root.
      if (!MEDIA_ROOTS.some((r) => from.startsWith(resolve(r))) || !existsSync(from)) {
        sendJson(res, 404, { error: "source media not found in a brand media root" });
        return;
      }
      // MUST live under assets/: the static renderer (static-react.mjs) copies
      // ONLY the sibling assets/ dir into its temp render dir, so a photo under
      // any other subdir renders BLACK. Match the proven "./assets/<name>"
      // convention. Prefix "swap-" to stay identifiable + avoid clobbering
      // curated assets. Slug the name (brand photos have spaces/parens) so it's
      // URL-safe in the editor preview regardless of decoding.
      const assetsDir = join(TEMPLATES_DIR, "assets");
      mkdirSync(assetsDir, { recursive: true });
      const ext = extname(from).toLowerCase();
      const slug = basename(from, extname(from))
        .replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "photo";
      const name = "swap-" + slug + ext;
      copyFileSync(from, join(assetsDir, name));
      sendJson(res, 200, { path: "./assets/" + name });
    } catch (e) {
      sendJson(res, 500, { error: String((e && e.message) || e) });
    }
    return;
  }

  // GET /media-file/<project-relative-path> — serve a brand-media file from a
  // guarded root (MEDIA_ROOTS only).
  if (path.startsWith("/media-file/") && req.method === "GET") {
    const rel = decodeURIComponent(path.slice("/media-file/".length));
    const resolved = resolve(join(PROJECT_ROOT, rel));
    const allowed = MEDIA_ROOTS.some((r) => resolved.startsWith(resolve(r)));
    if (allowed && existsSync(resolved)) {
      const mime = MIME[extname(resolved).toLowerCase()] || "application/octet-stream";
      sendFile(req, res, resolved, mime);
      return;
    }
    sendJson(res, 404, { error: "media not found" });
    return;
  }

  // GET /video-templates/... — SEPARATE guarded root for the video bank (B3:
  // /templates/ stays guarded to multi-sport-foundations).
  if (path.startsWith("/video-templates/") && req.method === "GET") {
    const rel = path.slice("/video-templates/".length);
    const resolved = resolve(join(VIDEO_DIR, rel));
    if (resolved.startsWith(resolve(VIDEO_DIR)) && existsSync(resolved)) {
      const mime = MIME[extname(resolved).toLowerCase()] || "application/octet-stream";
      sendFile(req, res, resolved, mime);
      return;
    }
  }

  // GET / → editor index
  if (path === "/" && req.method === "GET") {
    const indexPath = join(EDITOR_DIR, "editor.html");
    if (existsSync(indexPath)) {
      send(res, 200, readFileSync(indexPath), "text/html");
      return;
    }
  }

  // GET /out/... → static rendered PNGs
  if (path.startsWith("/out/") && req.method === "GET") {
    const filePath = join(PROJECT_ROOT, path.slice(1)); // strip leading /
    if (existsSync(filePath)) {
      const mime = MIME[extname(filePath).toLowerCase()] || "application/octet-stream";
      sendFile(req, res, filePath, mime);
      return;
    }
  }

  // GET /templates/... → serve template assets (photos, SVGs, etc.)
  if (path.startsWith("/templates/") && req.method === "GET") {
    // Decode so asset names with spaces/parens resolve (url.pathname keeps %20).
    const filePath = join(PROJECT_ROOT, decodeURIComponent(path.slice(1)));
    // Security: ensure resolved path stays under TEMPLATES_DIR
    const resolved = resolve(filePath);
    if (resolved.startsWith(resolve(TEMPLATES_DIR)) && existsSync(resolved)) {
      const mime = MIME[extname(resolved).toLowerCase()] || "application/octet-stream";
      sendFile(req, res, resolved, mime);
      return;
    }
  }

  // GET /editor or /editor.html → the editor HTML
  if ((path === "/editor" || path === "/editor.html") && req.method === "GET") {
    const indexPath = join(EDITOR_DIR, "editor.html");
    if (existsSync(indexPath)) {
      send(res, 200, readFileSync(indexPath), "text/html");
      return;
    }
  }

  sendJson(res, 404, { error: "Not found", path });
});

server.listen(PORT, () => {
  console.log(`\nEditor server running at http://localhost:${PORT}/`);
  console.log(`  Endpoints:`);
  console.log(`    GET  /clusters`);
  console.log(`    GET  /config/cluster-N`);
  console.log(`    POST /config/cluster-N`);
  console.log(`    POST /render/cluster-N`);
  console.log(`    GET  /out/<path>`);
  console.log(`\nOpen http://localhost:${PORT}/ to use the editor.\n`);
});

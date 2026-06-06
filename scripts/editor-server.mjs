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
  rmSync,
  createWriteStream,
} from "node:fs";
import { join, resolve, extname, basename, dirname } from "node:path";
import { spawn } from "node:child_process";
import { resolveStaticConfig } from "./lib/fill-core.mjs";
import { fieldRole, BEAT_HEADLINE_ROLE, beatLetter } from "./lib/roles.mjs";
import { loadCopyLibrary } from "./lib/copy-library.mjs";
import { validatePlan } from "./validate-plan.mjs";
import { scopeMediaRoots } from "./lib/media-scope.mjs";

const PORT = Number(process.env.EDITOR_PORT) || 5173;
// Hard ceiling for a single-asset render (J): a hung render (the 7-sec clip that
// pinned chrome 4+ min) is tree-killed at this bound so it can't leak. Generous
// so a legitimate motion render finishes; override via RENDER_TIMEOUT_MS.
const RENDER_TIMEOUT_MS = Number(process.env.RENDER_TIMEOUT_MS) || 10 * 60 * 1000;
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
// Each root is read with a single non-recursive readdirSync, so each stays FLAT.
// brand/kraken-cache holds raw media pulled from The Kraken Content Library — now
// isolated PER CAMPAIGN in brand/kraken-cache/<campaign>/ (the /media route reads
// that subfolder when ?campaign= is given; see the campaign-aware /media handler).
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
const MUSIC_ROOT = join(PROJECT_ROOT, "music-library");

// Every registered franchisee kit's media dirs. These are SERVABLE (the
// /media-file guard allows them) but NOT part of the AA shared listing set — the
// per-campaign scoping below (K) lists a kit's media ONLY for that kit's campaigns.
function kitDirForBrand(slug) {
  try {
    const j = JSON.parse(readFileSync(join(DATA_DIR, `brand.${slug}.json`), "utf8"));
    return j && j.kitPath ? join(PROJECT_ROOT, j.kitPath) : null;
  } catch (_) { return null; }
}
function registeredBrandSlugs() {
  try {
    return readdirSync(DATA_DIR)
      .map((f) => (f.match(/^brand\.([\w-]+)\.json$/) || [])[1])
      .filter(Boolean);
  } catch (_) { return []; }
}
const KIT_MEDIA_ROOTS = [];
for (const slug of registeredBrandSlugs()) {
  const kit = kitDirForBrand(slug);
  if (!kit) continue;
  for (const sub of ["assets", "uploads"]) {
    const r = join(kit, sub);
    if (![...MEDIA_ROOTS, ...KIT_MEDIA_ROOTS].some((x) => resolve(x) === resolve(r))) KIT_MEDIA_ROOTS.push(r);
  }
}
// True if a resolved path sits under any servable media root (shared + kit).
function underAnyMediaRoot(resolved) {
  return [...MEDIA_ROOTS, ...KIT_MEDIA_ROOTS].some((r) => resolved.startsWith(resolve(r)));
}
// The campaign's attached brand slug (plan.brand) — drives media scoping.
function campaignBrandSlug(campaign) {
  try {
    const p = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
    if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8")).brand || null;
  } catch (_) {}
  return null;
}

// Kraken cache: raw media pulled from The Kraken Content Library lands here,
// isolated per campaign (brand/kraken-cache/<campaign>/). The legacy flat dir is
// still read for back-compat. This IS one of the MEDIA_ROOTS, so the existing
// /media-file + /media-into-template path guards already cover its subfolders.
const KRAKEN_CACHE_ROOT = join(PROJECT_ROOT, "brand/kraken-cache");
const UPLOAD_MAX_BYTES = 500 * 1024 * 1024; // hard cap so one runaway upload can't fill the disk
function campaignCacheDir(campaign) {
  return join(KRAKEN_CACHE_ROOT, campaign);
}
// The Kraken SOURCE folder name recorded for this campaign (for the picker label).
function krakenSidecarFolder(campaign) {
  try {
    const p = join(CAMPAIGNS_DIR, campaign, "kraken.json");
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, "utf8")).sourceFolder || null;
  } catch (_) {
    return null;
  }
}
// Spawn a node CLI and collect its output. SECRET SAFETY: editor-server reaches
// The Kraken ONLY by spawning the standalone CLIs (kraken-list / kraken-pull) —
// it never imports lib/kraken.mjs, so credentials never enter this process.
function runNode(scriptArgs) {
  return new Promise((resolveP) => {
    const proc = spawn("node", scriptArgs, { cwd: PROJECT_ROOT });
    let stdout = "", stderr = "";
    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("exit", (code) => resolveP({ code, stdout, stderr }));
    proc.on("error", (e) => resolveP({ code: -1, stdout, stderr: stderr + String(e) }));
  });
}

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
    let done = false;
    // Same abort guard as /render-asset (J): if the client gives up before the
    // render finishes, TREE-KILL it so the puppeteer (chrome) grandchild can't
    // orphan and leak. The `done` guard means a normal exit never gets killed.
    req.on("close", () => {
      if (done) return;
      done = true;
      try {
        if (process.platform === "win32") spawn("taskkill", ["/PID", String(proc.pid), "/T", "/F"]);
        else proc.kill("SIGTERM");
      } catch (_) {}
    });
    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("exit", (code) => {
      if (done) return;
      done = true;
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

  // GET /validation?campaign=<name> — live compliance report for the review page.
  // Re-runs validate-plan against the on-disk plan (so in-page edits reflect at
  // once). Exception-safe (S7): never crash the server; on error return ok:false
  // with the error so the page degrades to "validation unavailable" + leaves
  // Approve enabled rather than locking the user out.
  if (path === "/validation" && req.method === "GET") {
    try {
      const campaign = url.searchParams.get("campaign") || firstCampaign();
      if (!campaign) { sendJson(res, 200, { ok: false, error: "no campaign" }); return; }
      const planFile = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
      if (!existsSync(planFile)) { sendJson(res, 200, { ok: false, error: `no plan for "${campaign}"` }); return; }
      const plan = JSON.parse(readFileSync(planFile, "utf8"));
      const report = validatePlan(plan, { campaign });
      sendJson(res, 200, report);
    } catch (e) {
      sendJson(res, 200, { ok: false, error: String((e && e.message) || e) });
    }
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
      "copyRefs", "hookRef", "copyByRole", // verbatim copy-by-reference (copy-library)
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
      // Verbatim copy-library (Cody's hand-written copy, by reference). Surfaced
      // so the editor's copy picker offers his exact lines, not just whatever the
      // plan already used. Each unit carries id/role so a pick can write copyRefs.
      const lib = loadCopyLibrary(join(CAMPAIGNS_DIR, campaign));
      const library = [];
      if (lib && Array.isArray(lib.units)) {
        for (const u of lib.units) {
          if (typeof u.text !== "string" || !u.text.trim()) continue;
          library.push({ id: u.id, role: u.role, kind: u.kind, text: u.text, chars: u.chars });
          if (u.role) addRole(u.role, u.text);
          all.add(u.text);
        }
      }
      const byKeyArr = {};
      for (const k of Object.keys(byKey)) byKeyArr[k] = [...byKey[k]];
      const byRoleArr = {};
      for (const r of Object.keys(byRole)) byRoleArr[r] = [...byRole[r]];
      sendJson(res, 200, {
        microscript: [...microscript], headline: [...headline],
        byKey: byKeyArr, byRole: byRoleArr, all: [...all], library,
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
      // Editable statics are ANY static-format template whose config.json lives in
      // TEMPLATES_DIR — not just cluster-* (Batti/franchisee fresh templates are
      // named fresh-batti-* / conf-s* etc.). Motion assets have no static config.
      if (asset.format && asset.format !== "static") {
        sendJson(res, 400, { error: `asset "${assetId}" is a ${asset.format} (motion) asset, not an editable static` });
        return;
      }
      if (!asset.template || !existsSync(join(TEMPLATES_DIR, `${asset.template}.config.json`))) {
        sendJson(res, 404, { error: `no static config for template "${asset.template}" in ${TEMPLATES_DIR}` });
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
      const editedAt = new Date().toISOString();
      // F (persistence): never report "saved" until the bytes are confirmed on
      // disk AND the editedAt stamp is in the plan. A silently-dropped save (Saco
      // B2) would otherwise let a blind re-export ship the pre-edit creative.
      try {
        writeAtomic(editsPath, JSON.stringify(parsed, null, 2));
        JSON.parse(readFileSync(editsPath, "utf8")); // read-back: did it land + parse?
      } catch (e) {
        sendJson(res, 500, { saved: false, error: "edits did not persist: " + ((e && e.message) || e) });
        return;
      }
      if (!stampPlanAsset(campaign, angleId, assetId, { editedAt })) {
        sendJson(res, 500, { saved: false, error: "editedAt stamp did not persist (asset not found in plan)" });
        return;
      }
      sendJson(res, 200, { saved: true, editedAt, campaign, angle: angleId, asset: assetId });
      return;
    }
  }

  // POST /approve-trim/:campaign/:angle/:asset — record Cody's approval of one
  // copychiefTrim. Body { field, text }. A verbatim TRIM (a long-enough proper
  // substring of an approved copy-library unit) flags as needs-approval until he
  // nods; this writes _approvedTrims[field] = <exact text> — the record
  // validate-plan's isApprovedTrim consults to suppress the flag for THAT exact
  // text only (a later re-edit changes the text and re-opens it). Static → the
  // edits config file (cfg._approvedTrims); motion → the plan asset's
  // templateData (td._approvedTrims). The server is the single writer of both.
  const approveTrim = path.match(/^\/approve-trim\/([\w.-]+)\/([\w.-]+)\/([\w.-]+)$/);
  if (approveTrim && req.method === "POST") {
    const [, campaign, angleId, assetId] = approveTrim;
    const body = await readBody(req);
    let patch;
    try { patch = JSON.parse(body); } catch (e) { sendJson(res, 400, { error: e.message }); return; }
    const field = patch.field, text = patch.text;
    if (typeof field !== "string" || !field.trim() || typeof text !== "string" || !text.trim()) {
      sendJson(res, 400, { error: "approve-trim requires non-empty { field, text }" });
      return;
    }
    const planFile = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
    if (!existsSync(planFile)) { sendJson(res, 404, { error: `no plan for "${campaign}"` }); return; }
    const plan = JSON.parse(readFileSync(planFile, "utf8"));
    const angle = (plan.angles || []).find((a) => a.id === angleId);
    const asset = angle && (angle.assets || []).find((a) => a.id === assetId);
    if (!asset) { sendJson(res, 404, { error: `asset "${assetId}" not found` }); return; }
    const isMotion = asset.format === "video" || asset.format === "gif";

    if (isMotion) {
      // Motion: _approvedTrims lives in templateData (validate-plan reads td._approvedTrims).
      const td = (asset.templateData && typeof asset.templateData === "object") ? { ...asset.templateData } : {};
      const approved = (td._approvedTrims && typeof td._approvedTrims === "object") ? { ...td._approvedTrims } : {};
      approved[field] = text;
      td._approvedTrims = approved;
      if (!stampPlanAsset(campaign, angleId, assetId, { templateData: td })) {
        sendJson(res, 500, { approved: false, error: "approval did not persist (asset not found in plan)" });
        return;
      }
      sendJson(res, 200, { approved: true, scope: "motion", field, campaign, angle: angleId, asset: assetId });
      return;
    }

    // Static: _approvedTrims lives in the edits config (validate-plan reads
    // cfg._approvedTrims). Create it from the fill on first touch — mirroring
    // GET /campaign-config — so an approval persists even before a hand-edit, and
    // the gate reads the same post-edit bytes it always does.
    const editsPath = editsConfigPath(campaign, angleId, assetId);
    let cfg;
    if (existsSync(editsPath)) {
      try { cfg = JSON.parse(readFileSync(editsPath, "utf8")); }
      catch (e) { sendJson(res, 500, { approved: false, error: "edits config unreadable: " + e.message }); return; }
    } else {
      if (!asset.template || !existsSync(join(TEMPLATES_DIR, `${asset.template}.config.json`))) {
        sendJson(res, 404, { error: `no static config for template "${asset.template}" — cannot record approval` });
        return;
      }
      const location = asset.location || (angle && angle.location) || plan.location || null;
      cfg = resolveStaticConfig({
        clusterId: asset.template, asset, brand: plan.brand, location, campaign,
        templateDir: TEMPLATES_DIR, dataDir: DATA_DIR,
      });
      if (!cfg) { sendJson(res, 404, { error: `could not resolve config for ${asset.template}` }); return; }
    }
    cfg._approvedTrims = { ...(cfg._approvedTrims && typeof cfg._approvedTrims === "object" ? cfg._approvedTrims : {}), [field]: text };
    try {
      writeAtomic(editsPath, JSON.stringify(cfg, null, 2));
      JSON.parse(readFileSync(editsPath, "utf8")); // read-back: did it land + parse?
    } catch (e) {
      sendJson(res, 500, { approved: false, error: "approval did not persist: " + ((e && e.message) || e) });
      return;
    }
    sendJson(res, 200, { approved: true, scope: "static", field, campaign, angle: angleId, asset: assetId });
    return;
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
    let done = false;
    // Tree-kill the spawned render. On Windows, killing this child node would
    // otherwise ORPHAN its puppeteer (chrome) grandchild — the leak that
    // saturated the machine. /T reaps the whole tree.
    const killTree = () => {
      try {
        if (process.platform === "win32") spawn("taskkill", ["/PID", String(proc.pid), "/T", "/F"]);
        else proc.kill("SIGTERM");
      } catch (_) {}
    };
    // Hard ceiling: a render that never returns is killed so it can't pin chrome
    // forever (J · "tree-kill on disconnect/timeout").
    const watchdog = setTimeout(() => {
      if (done) return;
      done = true;
      killTree();
      if (!res.headersSent) sendJson(res, 504, { exitCode: -1, error: `render timed out after ${Math.round(RENDER_TIMEOUT_MS / 1000)}s — killed`, stderr: stderr.slice(-2000) });
    }, RENDER_TIMEOUT_MS);
    // If the client abandons the request (modal/tab closed, navigated away, or a
    // long render times out in the browser) before it finishes, tree-kill the
    // render. The `done` guard ensures a normal completion never triggers a kill
    // (proc 'exit' fires first and sets done).
    req.on("close", () => {
      if (done) return;
      done = true;
      clearTimeout(watchdog);
      killTree();
    });
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("exit", (code) => {
      if (done) return;
      done = true;
      clearTimeout(watchdog);
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
        // cluster-* (AA bank) + fresh-* / conf-s* (Batti & other franchisee statics)
        templates = readdirSync(TEMPLATES_DIR)
          .filter((f) => /^(cluster-|fresh-|conf-s)[\w-]+\.config\.json$/.test(f))
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

  // GET /media?kind=photo|clip|audio[&campaign=<name>] — selectable media.
  // Tags each item by source: "brand" (shared brand-kit roots), "kraken" (pulled
  // from the campaign's Kraken folder), or "uploaded" (dropped from a computer).
  // Back-compat: with no ?campaign=, returns the same shape as before (plus the
  // additive `source` field) from the brand roots + the legacy flat cache.
  if (path === "/media" && req.method === "GET") {
    try {
      const kind = url.searchParams.get("kind") || "photo";
      const campaign = url.searchParams.get("campaign") || null;
      const exts = EXT_FOR_KIND[kind] || PHOTO_EXT;
      const items = [];
      const seen = new Set();
      // filename → durable Kraken ref, written by kraken-pull (.manifest.json).
      const loadMan = (root) => {
        try { return JSON.parse(readFileSync(join(root, ".manifest.json"), "utf8")); } catch (_) { return {}; }
      };
      const addFrom = (root, source, man = {}) => {
        let files = [];
        try { files = readdirSync(root); } catch (_) { return; }
        for (const f of files) {
          if (!exts.has(extname(f).toLowerCase())) continue;
          const abs = join(root, f);
          const rel = abs.slice(PROJECT_ROOT.length + 1).replace(/\\/g, "/");
          if (seen.has(rel)) continue;
          seen.add(rel);
          // Files in a kraken cache dir are uploads if prefixed "upload-", else pulled.
          const src = source === "kraken-dir"
            ? (f.startsWith("upload-") ? "uploaded" : "kraken")
            : source;
          const item = { name: f, path: rel, url: "/media-file/" + rel, source: src };
          // Attach the durable Kraken ref (from the pull manifest) so a placement
          // can store it — used for static re-fetch + portability.
          const ref = man[f];
          if (ref && ref.id) { item.krakenId = ref.id; item.krakenUrl = ref.url; }
          items.push(item);
        }
      };
      // Brand-scoped listing roots (K): AA / legacy plan → the full shared set;
      // a franchisee campaign → neutral audio + its OWN kit media only, so the
      // picker never surfaces AA photos under a non-AA brand. The kraken cache
      // root is excluded here and added per-campaign below.
      const brandSlug = campaign ? campaignBrandSlug(campaign) : null;
      const sharedRoots = MEDIA_ROOTS.filter((r) => resolve(r) !== resolve(KRAKEN_CACHE_ROOT));
      const listRoots = scopeMediaRoots({
        brandSlug, sharedRoots, musicRoot: MUSIC_ROOT,
        kitDir: brandSlug ? kitDirForBrand(brandSlug) : null,
      });
      for (const root of listRoots) addFrom(root, "brand");
      // The campaign's pulled media + its uploads, then the legacy flat cache.
      if (campaign) { const cd = campaignCacheDir(campaign); addFrom(cd, "kraken-dir", loadMan(cd)); }
      addFrom(KRAKEN_CACHE_ROOT, "kraken-dir", loadMan(KRAKEN_CACHE_ROOT));
      sendJson(res, 200, {
        kind, campaign,
        krakenFolder: campaign ? krakenSidecarFolder(campaign) : null,
        items,
      });
    } catch (e) {
      sendJson(res, 500, { error: String((e && e.message) || e) });
    }
    return;
  }

  // ── Kraken browser API (in-page folder browse + pull + computer upload) ──
  // editor-server never imports lib/kraken.mjs; it SPAWNS the standalone CLIs.

  // GET /kraken/workspaces — { workspaces: [{name,id}] }. Degrades to an empty
  // list (never 500s the picker) if creds/config are missing. K (self-heal): a
  // long-lived server intermittently returned 0 workspaces under load; retry once
  // on a transient empty/failure so a single hiccup doesn't read as "none".
  if (path === "/kraken/workspaces" && req.method === "GET") {
    try {
      const attempt = async () => {
        const { code, stdout, stderr } = await runNode(["scripts/kraken-list.mjs", "workspaces"]);
        let j = {};
        try { j = JSON.parse((stdout || "").trim() || "{}"); } catch (_) {}
        const ok = code === 0 && !j.error && Array.isArray(j.workspaces) && j.workspaces.length > 0;
        return { ok, code, j, stderr };
      };
      let r = await attempt();
      if (!r.ok) r = await attempt(); // one self-heal retry on empty/failed
      if (r.code !== 0 || r.j.error) {
        sendJson(res, 200, { workspaces: [], error: r.j.error || r.stderr.slice(-300) });
        return;
      }
      sendJson(res, 200, { workspaces: r.j.workspaces || [] });
    } catch (e) {
      sendJson(res, 200, { workspaces: [], error: String((e && e.message) || e) });
    }
    return;
  }

  // GET /kraken/state?campaign=<name> — the campaign's saved Kraken picks
  // (sidecar workspace + source folder) so the browser bar can default sensibly.
  if (path === "/kraken/state" && req.method === "GET") {
    try {
      const campaign = url.searchParams.get("campaign");
      if (!campaign) { sendJson(res, 400, { error: "missing ?campaign=" }); return; }
      let sc = {};
      try {
        const p = join(CAMPAIGNS_DIR, campaign, "kraken.json");
        if (existsSync(p)) sc = JSON.parse(readFileSync(p, "utf8"));
      } catch (_) {}
      sendJson(res, 200, {
        campaign,
        workspace: sc.workspace || null,
        workspaceId: sc.workspaceId || null, // match the dropdown by id (aliases differ)
        sourceFolder: sc.sourceFolder || null,
      });
    } catch (e) {
      sendJson(res, 500, { error: String((e && e.message) || e) });
    }
    return;
  }

  // GET /kraken/folders?workspace=<name|uuid> — { workspace, workspaceId,
  // folders:[{id,name,parent_id}] }. The client assembles the nested tree.
  if (path === "/kraken/folders" && req.method === "GET") {
    try {
      const ws = url.searchParams.get("workspace");
      if (!ws) { sendJson(res, 400, { error: "missing ?workspace=" }); return; }
      const { code, stdout, stderr } = await runNode(["scripts/kraken-list.mjs", "folders", "--workspace", ws]);
      let j = null;
      try { j = JSON.parse((stdout || "").trim() || "{}"); } catch (_) {}
      if (!j || j.error) {
        sendJson(res, code === 2 ? 404 : 502, j || { error: stderr.slice(-300) || "folder list failed" });
        return;
      }
      sendJson(res, 200, j);
    } catch (e) {
      sendJson(res, 502, { error: String((e && e.message) || e) });
    }
    return;
  }

  // POST /kraken/pull { campaign, workspace, folder } — folder is a UUID (the
  // tree sends ids so duplicate folder NAMES can't pull the wrong one). Spawns
  // kraken-pull, parses its __PULL_JSON__ summary line.
  if (path === "/kraken/pull" && req.method === "POST") {
    try {
      let body;
      try { body = JSON.parse((await readBody(req)) || "{}"); }
      catch (e) { sendJson(res, 400, { error: "bad JSON: " + e.message }); return; }
      const { campaign, workspace, folder } = body;
      if (!campaign || !workspace || !folder) {
        sendJson(res, 400, { error: "need campaign, workspace, folder" });
        return;
      }
      const { code, stdout, stderr } = await runNode([
        "scripts/kraken-pull.mjs", campaign,
        "--workspace", workspace, "--folder", folder, "--per-campaign", "--json",
      ]);
      let summary = null;
      const m = (stdout || "").match(/__PULL_JSON__ (.+)/);
      if (m) { try { summary = JSON.parse(m[1]); } catch (_) {} }
      sendJson(res, code === 0 ? 200 : 500, {
        exitCode: code, ...(summary || {}), stderr: stderr.slice(-2000),
      });
    } catch (e) {
      sendJson(res, 500, { error: String((e && e.message) || e) });
    }
    return;
  }

  // GET /kraken/files?workspace=<ws>&folder=<uuid> — the media items WITHIN a
  // folder (for per-file pull / direct placement). Spawns kraken-list files.
  if (path === "/kraken/files" && req.method === "GET") {
    try {
      const ws = url.searchParams.get("workspace");
      const folder = url.searchParams.get("folder");
      if (!ws || !folder) { sendJson(res, 400, { error: "missing ?workspace= and/or ?folder=" }); return; }
      const { code, stdout, stderr } = await runNode([
        "scripts/kraken-list.mjs", "files", "--workspace", ws, "--folder", folder,
      ]);
      let j = null;
      try { j = JSON.parse((stdout || "").trim() || "{}"); } catch (_) {}
      if (!j || j.error) { sendJson(res, code === 2 ? 404 : 502, j || { error: stderr.slice(-300) || "file list failed" }); return; }
      sendJson(res, 200, j);
    } catch (e) {
      sendJson(res, 502, { error: String((e && e.message) || e) });
    }
    return;
  }

  // POST /kraken/pull-file { campaign, workspace, folder, file } — pull ONE
  // content item (per-file pull). Spawns kraken-pull --file; returns the cached
  // relative path + the durable Kraken ref ({file:{path,krakenId,krakenUrl,...}})
  // so the UI can place it directly and statics can stamp a durable reference.
  if (path === "/kraken/pull-file" && req.method === "POST") {
    try {
      let body;
      try { body = JSON.parse((await readBody(req)) || "{}"); }
      catch (e) { sendJson(res, 400, { error: "bad JSON: " + e.message }); return; }
      const { campaign, workspace, folder, file } = body;
      if (!campaign || !workspace || !folder || !file) {
        sendJson(res, 400, { error: "need campaign, workspace, folder, file" });
        return;
      }
      const { code, stdout, stderr } = await runNode([
        "scripts/kraken-pull.mjs", campaign,
        "--workspace", workspace, "--folder", folder, "--file", file,
        "--per-campaign", "--json",
      ]);
      let summary = null;
      const m = (stdout || "").match(/__PULL_JSON__ (.+)/);
      if (m) { try { summary = JSON.parse(m[1]); } catch (_) {} }
      sendJson(res, code === 0 ? 200 : 500, {
        exitCode: code, ...(summary || {}), stderr: stderr.slice(-2000),
      });
    } catch (e) {
      sendJson(res, 500, { error: String((e && e.message) || e) });
    }
    return;
  }

  // POST /media-upload?campaign=&kind=&name= — raw file bytes in the body.
  // Streams req → <dest>.part → rename (NEVER readBody: it stringifies bytes).
  // Metadata rides in the query string so the cross-origin preflight stays simple.
  if (path === "/media-upload" && req.method === "POST") {
    try {
      const campaign = url.searchParams.get("campaign");
      const kind = url.searchParams.get("kind") || "photo";
      const rawName = url.searchParams.get("name") || "upload";
      if (!campaign) { sendJson(res, 400, { error: "missing ?campaign=" }); return; }
      const exts = EXT_FOR_KIND[kind];
      if (!exts) { sendJson(res, 400, { error: `bad kind "${kind}"` }); return; }
      const ext = extname(rawName).toLowerCase();
      if (!exts.has(ext)) { sendJson(res, 400, { error: `extension "${ext}" not allowed for ${kind}` }); return; }
      const slug = basename(rawName, extname(rawName))
        .replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "file";
      const destDir = campaignCacheDir(campaign);
      mkdirSync(destDir, { recursive: true });
      const name = "upload-" + slug + ext;
      const dest = join(destDir, name);
      const part = dest + ".part";
      const ws = createWriteStream(part);
      let size = 0, aborted = false;
      const cleanup = () => { try { rmSync(part, { force: true }); } catch (_) {} };
      req.on("data", (chunk) => {
        size += chunk.length;
        if (size > UPLOAD_MAX_BYTES && !aborted) {
          aborted = true;
          ws.destroy(); req.destroy(); cleanup();
          if (!res.headersSent) sendJson(res, 413, { error: "file too large (>500MB)" });
        }
      });
      ws.on("error", () => { if (aborted) return; cleanup(); if (!res.headersSent) sendJson(res, 500, { error: "write failed" }); });
      ws.on("finish", () => {
        if (aborted) return;
        try { renameSync(part, dest); }
        catch (e) { cleanup(); if (!res.headersSent) sendJson(res, 500, { error: "rename failed: " + e.message }); return; }
        const rel = dest.slice(PROJECT_ROOT.length + 1).replace(/\\/g, "/");
        sendJson(res, 200, { name, path: rel, url: "/media-file/" + rel, source: "uploaded" });
      });
      req.pipe(ws);
    } catch (e) {
      if (!res.headersSent) sendJson(res, 500, { error: String((e && e.message) || e) });
    }
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
      // Guard: source must live under a known brand-media root (shared OR a kit).
      if (!underAnyMediaRoot(from) || !existsSync(from)) {
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
    const allowed = underAnyMediaRoot(resolved);
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

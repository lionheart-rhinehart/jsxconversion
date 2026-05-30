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
} from "node:fs";
import { join, resolve, extname, basename } from "node:path";
import { spawn } from "node:child_process";

const PORT = 5173;
const PROJECT_ROOT = resolve(".");
const TEMPLATES_DIR = join(PROJECT_ROOT, "templates/multi-sport-foundations");
const OUT_DIR = join(PROJECT_ROOT, "out");
const EDITOR_DIR = join(OUT_DIR, "editor");
const COMPARE_DIR = join(OUT_DIR, "compare");
const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");

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
    // Only the reviewer-editable fields can be patched this way.
    const ALLOWED = ["status", "notes", "flags", "headline", "microscript", "output", "thumb"];
    for (const k of ALLOWED) if (k in patch) asset[k] = patch[k];
    writeFileSync(p, JSON.stringify(plan, null, 2));
    sendJson(res, 200, { saved: true, campaign, angle: angleId, asset: assetId });
    return;
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
      send(res, 200, readFileSync(filePath), mime);
      return;
    }
  }

  // GET /templates/... → serve template assets (photos, SVGs, etc.)
  if (path.startsWith("/templates/") && req.method === "GET") {
    const filePath = join(PROJECT_ROOT, path.slice(1));
    // Security: ensure resolved path stays under TEMPLATES_DIR
    const resolved = resolve(filePath);
    if (resolved.startsWith(resolve(TEMPLATES_DIR)) && existsSync(resolved)) {
      const mime = MIME[extname(resolved).toLowerCase()] || "application/octet-stream";
      send(res, 200, readFileSync(resolved), mime);
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

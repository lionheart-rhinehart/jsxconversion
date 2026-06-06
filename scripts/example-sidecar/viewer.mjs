// ============================================================================
//  scripts/example-sidecar/viewer.mjs — Track B example-library viewer + editor
// ============================================================================
//  A self-contained local web app to VIEW the example library and EDIT each
//  example (swap the photo, change the text, tweak the layout) then RE-RENDER it
//  live — plus a one-click RE-LABEL that re-runs the embed/index pass so the
//  diversity metrics update after edits.
//
//  Why a NEW app and not the campaign editor: the engine's editor-server edits the
//  config-driven `elements[]` shape of CAMPAIGN assets. These examples are
//  self-contained JSX (a different shape), so they need their own editor. This one
//  touches ZERO Track-A files and binds its OWN free port (default base 5300) so it
//  never collides with the engine dev servers (5173/5599) — start it alongside them.
//
//  Routes:
//    GET  /                      the viewer UI (viewer.html)
//    GET  /api/examples          index entries + metrics + detected media/text
//    GET  /api/media             the photo palette (brand assets) for swaps
//    GET  /img/<id>.png          the rendered example (no-cache)
//    GET  /media/<file>          a palette thumbnail
//    GET  /api/source/<id>       the raw JSX source
//    POST /api/save/<id>         { source } → write the JSX
//    POST /api/import-media      { name } → copy a library photo into _examples/assets, return its ./assets ref
//    POST /api/render/<id>       re-render just this example (render + QA + copy)
//    POST /api/relabel           re-embed + rebuild the index (refresh metrics)
//
//  Node-only, no deps. New file (Track B). Run: node scripts/example-sidecar/viewer.mjs
// ============================================================================

import { createServer } from "node:http";
import { createReadStream, existsSync, readdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from "node:fs";
import { dirname, join, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, spawn } from "node:child_process";
import { createConnection } from "node:net";
import { isExampleId, exampleImagePath, exampleSourcePaths } from "../lib/example-library.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const EXAMPLES_DIR = join(ROOT, "templates", "_examples");
const ASSETS_DIR = join(EXAMPLES_DIR, "assets");
const INDEX_FILE = join(ROOT, "templates", "_example-index.json");
const MANIFEST_FILE = join(HERE, "examples.manifest.json");
const ARTIFACT_FILE = join(HERE, "embeddings.artifact.json");
const VIEWER_HTML = join(HERE, "viewer.html");
const PYTHON = process.env.PYTHON || "python";

// Photo palette roots (read-only; the named brand-asset library is the curated set).
const MEDIA_ROOTS = [
  join(ROOT, "brand", "aa-design-system", "project", "assets"),
  ASSETS_DIR,
];
const IMG_RE = /\.(jpe?g|png|webp)$/i;

// ---------------------------------------------------------------------------
const json = (res, code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
const noCache = { "cache-control": "no-store, max-age=0" };

function serveFile(res, path, type, headers = {}) {
  if (!existsSync(path)) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "content-type": type, ...headers });
  createReadStream(path).pipe(res);
}

function readBody(req) {
  return new Promise((resolveBody) => {
    let b = ""; req.on("data", (c) => (b += c)); req.on("end", () => { try { resolveBody(b ? JSON.parse(b) : {}); } catch { resolveBody({}); } });
  });
}

// Best-effort: pull human-readable display strings out of a JSX source so the UI can
// offer quick text edits. Excludes CSS values / hex / fonts / asset paths / units.
const FONTS = ["Anton", "Geist", "JetBrains Mono", "Saira Condensed", "Caveat"];
function keepText(s, seen) {
  if (!s || seen.has(s)) return false;
  if (s.startsWith("./assets/")) return false;
  if (/^#[0-9a-f]{3,8}$/i.test(s)) return false;
  if (/(px|em|rem|%|deg|vh|vw|fr)\b/.test(s)) return false;
  if (/(gradient|rgba?\(|absolute|relative|fixed|cover|contain|uppercase|lowercase|center|flex|column|row|pre-line|hidden|solid|translate|rotate|scale)/i.test(s)) return false;
  if (FONTS.includes(s)) return false;
  if (!/[a-z]/i.test(s)) return false;            // need letters (drops ★, punctuation, numerals)
  if (s.replace(/[^a-z]/gi, "").length < 3) return false;
  return true;
}
function detectTexts(src) {
  const out = [], seen = new Set();
  // 1) quoted string literals (text props, caption strings, array items)
  let m; const q = /(["'`])((?:\\.|(?!\1).)*?)\1/g;
  while ((m = q.exec(src))) { const s = m[2].trim(); if (keepText(s, seen)) { seen.add(s); out.push(s); } }
  // 2) JSX text nodes — the visible copy between >…< (split on <br/>, no tags/braces)
  const t = />([^<>{}]+)</g;
  while ((m = t.exec(src))) { const s = m[1].trim(); if (keepText(s, seen)) { seen.add(s); out.push(s); } }
  return out;
}
function detectMedia(src) {
  const out = [];
  const re = /\.\/assets\/([\w.\-]+)/g;
  let m;
  while ((m = re.exec(src))) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

function mtimeTag(path) { try { return statSync(path).mtimeMs | 0; } catch { return 0; } }

function listMedia() {
  const seen = new Set();
  const items = [];
  for (const rootDir of MEDIA_ROOTS) {
    if (!existsSync(rootDir)) continue;
    for (const f of readdirSync(rootDir)) {
      if (!IMG_RE.test(f) || seen.has(f)) continue;
      seen.add(f);
      items.push({ name: f, url: `/media/${encodeURIComponent(f)}` });
    }
  }
  return items.sort((a, b) => a.name.localeCompare(b.name));
}
function resolveMedia(name) {
  for (const rootDir of MEDIA_ROOTS) {
    const p = join(rootDir, name);
    if (existsSync(p) && resolve(p).startsWith(resolve(rootDir))) return p;
  }
  return null;
}

function buildExamples() {
  const index = existsSync(INDEX_FILE) ? JSON.parse(readFileSync(INDEX_FILE, "utf8")) : { examples: {} };
  const manifest = existsSync(MANIFEST_FILE) ? JSON.parse(readFileSync(MANIFEST_FILE, "utf8")) : { examples: [] };
  const order = manifest.examples.map((e) => e.id);
  const out = [];
  for (const id of order) {
    const entry = index.examples[id];
    if (!entry) continue;
    const srcPath = exampleSourcePaths(id).jsx;
    const srcAbs = join(ROOT, srcPath);
    const src = existsSync(srcAbs) ? readFileSync(srcAbs, "utf8") : "";
    const cm = entry.clusterMetrics || {};
    out.push({
      id, archetype: entry.archetype, format: entry.format,
      subLook: cm.subLook ?? null,
      mediaStyleAccepts: entry.mediaStyleAccepts || [],
      slotShape: entry.slotShape || { slots: [] },
      metrics: {
        intraKindMaxCosine: cm.intraKindMaxCosine ?? null,
        meanCrossKindCosine: cm.meanCrossKindCosine ?? null,
        silhouette: cm.silhouette ?? null,
        nearestNeighbor: cm.nearestNeighbor ?? null,
      },
      png: `/img/${id}.png?t=${mtimeTag(join(ROOT, exampleImagePath(id)))}`,
      texts: detectTexts(src),
      media: detectMedia(src),
    });
  }
  return { examples: out, diversity: index.diversity || {}, generatedAt: index.generatedAt || null };
}

function runScript(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", timeout: 10 * 60 * 1000 });
  const tail = `${r.stderr || ""}`.trim().split("\n").slice(-4).join("\n");
  return { ok: r.status === 0, status: r.status, out: tail, err: r.error ? r.error.message : null };
}

// ---------------------------------------------------------------------------
async function handle(req, res) {
  const url = new URL(req.url, "http://localhost");
  const path = decodeURIComponent(url.pathname);

  if (path === "/" || path === "/viewer.html") return serveFile(res, VIEWER_HTML, "text/html; charset=utf-8", noCache);
  if (path === "/api/examples" && req.method === "GET") return json(res, 200, buildExamples());
  if (path === "/api/media" && req.method === "GET") return json(res, 200, { media: listMedia() });
  if (path === "/api/experiment" && req.method === "GET") {
    const f = join(HERE, "_experiment", "results.json");
    return json(res, 200, existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : { scenarios: [], designs: [], columns: [] });
  }
  if (path === "/api/mediatest" && req.method === "GET") {
    // the media-impact treatment matrix: measured rows + which host renders exist per condition
    const rf = join(HERE, "_experiment", "results.json");
    const mf = join(HERE, "_experiment", "render-manifest.json");
    const results = existsSync(rf) ? JSON.parse(readFileSync(rf, "utf8")) : { rows: [] };
    const man = existsSync(mf) ? JSON.parse(readFileSync(mf, "utf8")) : {};
    const conditions = {};
    for (const [c, hosts] of Object.entries(man)) conditions[c] = Object.keys(hosts);
    return json(res, 200, { rows: results.rows || [], conditions });
  }
  if (path.startsWith("/run/") && req.method === "GET") {
    // /run/<cond>/<id>.png — a treatment render (C0 = the shipped baseline)
    const parts = path.split("/").filter(Boolean); // ["run", cond, "<id>.png"]
    const cond = parts[1];
    const id = basename(parts[2] || "").replace(/\.png$/, "");
    if (!isExampleId(id) || !/^[A-Za-z0-9]+$/.test(cond)) return json(res, 400, { error: "bad path" });
    const p = cond === "C0" ? join(ROOT, exampleImagePath(id)) : join(HERE, "_experiment", "runs", cond, `${id}.png`);
    return serveFile(res, p, "image/png", noCache);
  }
  if (path.startsWith("/exp/") && req.method === "GET") {
    // /exp/<variant>/<id>.png  variant ∈ orig|fb|co (the media-test comparison images)
    const parts = path.split("/").filter(Boolean); // ["exp", variant, "<id>.png"]
    const variant = parts[1];
    const id = basename(parts[2] || "").replace(/\.png$/, "");
    if (!isExampleId(id)) return json(res, 400, { error: "bad id" });
    const p = variant === "orig" ? join(ROOT, exampleImagePath(id))
      : variant === "fb" ? join(HERE, "_experiment", "compare", `${id}-fb.png`)
      : variant === "co" ? join(HERE, "_experiment", "compare", `${id}-co.png`) : null;
    if (!p) return json(res, 400, { error: "bad variant" });
    return serveFile(res, p, "image/png", noCache);
  }
  if (path === "/api/clusters" && req.method === "GET") {
    // the embedding artifact: archetype-ordered cosine matrix (heatmap) + 2D
    // projection (scatter) + per-archetype health. Vectors stay out (in the .npz).
    const a = existsSync(ARTIFACT_FILE) ? JSON.parse(readFileSync(ARTIFACT_FILE, "utf8")) : {};
    return json(res, 200, { heatmap: a.heatmap || null, projection2d: a.projection2d || null, batch: a.batch || {}, embedder: a.embedder || null });
  }

  if (path.startsWith("/img/") && req.method === "GET") {
    const id = basename(path).replace(/\.png$/, "");
    if (!isExampleId(id)) return json(res, 400, { error: "bad id" });
    return serveFile(res, join(ROOT, exampleImagePath(id)), "image/png", noCache);
  }
  if (path.startsWith("/media/") && req.method === "GET") {
    const name = basename(path);
    const p = resolveMedia(name);
    if (!p) return json(res, 404, { error: "not found" });
    const type = extname(p).toLowerCase() === ".png" ? "image/png" : extname(p).toLowerCase() === ".webp" ? "image/webp" : "image/jpeg";
    return serveFile(res, p, type, noCache);
  }
  if (path.startsWith("/api/source/") && req.method === "GET") {
    const id = path.slice("/api/source/".length);
    if (!isExampleId(id)) return json(res, 400, { error: "bad id" });
    const p = join(ROOT, exampleSourcePaths(id).jsx);
    return json(res, 200, { id, source: existsSync(p) ? readFileSync(p, "utf8") : "" });
  }

  if (path.startsWith("/api/save/") && req.method === "POST") {
    const id = path.slice("/api/save/".length);
    if (!isExampleId(id)) return json(res, 400, { error: "bad id" });
    const body = await readBody(req);
    if (typeof body.source !== "string" || body.source.length < 20) return json(res, 400, { error: "missing/short source" });
    writeFileSync(join(ROOT, exampleSourcePaths(id).jsx), body.source);
    return json(res, 200, { ok: true });
  }

  if (path === "/api/import-media" && req.method === "POST") {
    const body = await readBody(req);
    const src = resolveMedia(String(body.name || ""));
    if (!src) return json(res, 404, { error: "media not found in library" });
    const dest = join(ASSETS_DIR, basename(src));
    if (resolve(dest) !== resolve(src) && !existsSync(dest)) copyFileSync(src, dest);
    return json(res, 200, { ok: true, ref: `./assets/${basename(src)}` });
  }

  if (path.startsWith("/api/render/") && req.method === "POST") {
    const id = path.slice("/api/render/".length);
    if (!isExampleId(id)) return json(res, 400, { error: "bad id" });
    const r = runScript("node", [join(HERE, "render-examples.mjs"), `--only=${id}`]);
    return json(res, r.ok ? 200 : 500, { ok: r.ok, log: r.out, err: r.err, png: `/img/${id}.png?t=${Date.now()}` });
  }

  if (path === "/api/relabel" && req.method === "POST") {
    const e = runScript(PYTHON, [join(HERE, "embed.py")]);
    if (!e.ok) return json(res, 500, { ok: false, stage: "embed", log: e.out, err: e.err });
    const b = runScript("node", [join(HERE, "build-index.mjs")]);
    return json(res, b.ok ? 200 : 500, { ok: b.ok, stage: b.ok ? "done" : "build-index", log: b.out, err: b.err });
  }

  res.writeHead(404); res.end("not found");
}

// pick the first free port from a base (probe by attempting a client connect; if it
// refuses, the port is free). Keeps the viewer off the engine dev-server ports.
function portFree(p) {
  return new Promise((r) => {
    const s = createConnection({ port: p, host: "127.0.0.1" });
    s.on("connect", () => { s.destroy(); r(false); });
    s.on("error", () => r(true));
  });
}
async function pickPort(base) { for (let p = base; p < base + 50; p++) if (await portFree(p)) return p; return base; }

const PORT = process.env.VIEWER_PORT ? Number(process.env.VIEWER_PORT) : await pickPort(5300);
createServer((req, res) => handle(req, res).catch((e) => json(res, 500, { error: String(e) }))).listen(PORT, () => {
  process.stderr.write(`\n  Example-library viewer → http://localhost:${PORT}\n  (Ctrl+C to stop; runs on its own port, separate from the engine dev servers)\n\n`);
});

// ============================================================================
//  scripts/lib/aa-campaign-plugin.mjs — AA's host plugin for createEditorServer.
// ----------------------------------------------------------------------------
//  createCampaignPlugin({ cwd }) -> async (req, res, ctx) => boolean
//
//  Holds every AA-CAMPAIGN-specific route (the generic editor routes come from the
//  engine). Plugins run BEFORE core, so these intercept first — including the
//  brand-scoped /media + campaign-aware /media-into-template (which OVERRIDE the
//  engine's generic versions) and /kraken/state (campaign sidecar) while the
//  GENERIC /kraken browse falls through to the engine's provider (U2/C5).
//
//  Routes: /campaigns /plan /validation /plan/:c/:a/:as /campaign-values/:c
//          /campaign-config/:c/:a/:as /approve-trim/... /render-asset/...
//          /template-spec/:t /bank /brands /drive/* /drive-file/:id
//          /kraken/state /kraken/pull /media /media-into-template /media-file
//          /video-templates/* /template-camp-asset/:c/:id/*
//
//  Heavy logic is imported from the same shared libs the live server uses, so this
//  is a faithful re-home, not a re-implementation. NODE-ONLY.
// ============================================================================
import {
  readFileSync, writeFileSync, existsSync, copyFileSync, readdirSync, mkdirSync, renameSync,
} from "node:fs";
import { join, resolve, extname, basename, dirname } from "node:path";
import { spawn } from "node:child_process";
import { resolveStaticConfig } from "./fill-core.mjs";
import { fieldRole, BEAT_HEADLINE_ROLE, beatLetter } from "./roles.mjs";
import { loadCopyLibrary } from "./copy-library.mjs";
import { validatePlan } from "../validate-plan.mjs";
import { listingRoots, isAABrand } from "./media-scope.mjs";
import { findTemplate, listTemplates, assetsDirFor } from "./template-roots.mjs";
import { wrapStandalone } from "./design-edit.mjs";

const MIME = {
  ".html": "text/html", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".json": "application/json", ".js": "application/javascript",
  ".mjs": "application/javascript", ".css": "text/css", ".mp4": "video/mp4", ".gif": "image/gif",
  ".webp": "image/webp", ".mov": "video/quicktime", ".webm": "video/webm",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4", ".aac": "audio/aac", ".ogg": "audio/ogg",
};
const PHOTO_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const CLIP_EXT = new Set([".mp4", ".mov", ".webm"]);
const AUDIO_EXT = new Set([".mp3", ".wav", ".m4a", ".aac", ".ogg"]);
const EXT_FOR_KIND = { photo: PHOTO_EXT, clip: CLIP_EXT, audio: AUDIO_EXT };

export function createCampaignPlugin({ cwd = process.cwd() } = {}) {
  const PROJECT_ROOT = resolve(cwd);
  const RENDER_TIMEOUT_MS = Number(process.env.RENDER_TIMEOUT_MS) || 10 * 60 * 1000;
  const TEMPLATES_DIR = join(PROJECT_ROOT, "templates/multi-sport-foundations");
  const CAMPAIGNS_DIR = join(PROJECT_ROOT, "campaigns");
  const DATA_DIR = join(PROJECT_ROOT, "data");
  const VIDEO_DIR = join(PROJECT_ROOT, "brand/video-templates");
  const VIDEO_TEMPLATES_DIR = join(VIDEO_DIR, "templates");
  const KRAKEN_CACHE_ROOT = join(PROJECT_ROOT, "brand/kraken-cache");
  const DRIVE_CACHE_ROOT = join(PROJECT_ROOT, "brand/drive-cache");
  const MUSIC_ROOT = join(PROJECT_ROOT, "music-library");
  const MEDIA_ROOTS = [
    join(PROJECT_ROOT, "brand/aa-design-system/project/uploads"),
    join(PROJECT_ROOT, "brand/aa-design-system/project/assets"),
    join(VIDEO_DIR, "assets"),
    MUSIC_ROOT,
    KRAKEN_CACHE_ROOT,
  ];

  const kitDirForBrand = (slug) => {
    try { const j = JSON.parse(readFileSync(join(DATA_DIR, `brand.${slug}.json`), "utf8")); return j && j.kitPath ? join(PROJECT_ROOT, j.kitPath) : null; }
    catch { return null; }
  };
  const registeredBrandSlugs = () => {
    try { return readdirSync(DATA_DIR).map((f) => (f.match(/^brand\.([\w-]+)\.json$/) || [])[1]).filter(Boolean); } catch { return []; }
  };
  const KIT_MEDIA_ROOTS = [];
  for (const slug of registeredBrandSlugs()) {
    const kit = kitDirForBrand(slug); if (!kit) continue;
    for (const sub of ["assets", "uploads"]) {
      const r = join(kit, sub);
      if (![...MEDIA_ROOTS, ...KIT_MEDIA_ROOTS].some((x) => resolve(x) === resolve(r))) KIT_MEDIA_ROOTS.push(r);
    }
  }
  const underAnyMediaRoot = (resolved) => [...MEDIA_ROOTS, ...KIT_MEDIA_ROOTS, DRIVE_CACHE_ROOT].some((r) => resolved.startsWith(resolve(r)));
  const campaignBrandSlug = (campaign) => {
    try { const p = join(CAMPAIGNS_DIR, campaign, "creative-plan.json"); if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8")).brand || null; } catch {}
    return null;
  };
  const campaignCacheDir = (campaign) => join(KRAKEN_CACHE_ROOT, campaign);
  const krakenSidecarFolder = (campaign) => {
    try { const p = join(CAMPAIGNS_DIR, campaign, "kraken.json"); if (!existsSync(p)) return null; return JSON.parse(readFileSync(p, "utf8")).sourceFolder || null; } catch { return null; }
  };
  const firstCampaign = () => { try { return readdirSync(CAMPAIGNS_DIR).filter((d) => existsSync(join(CAMPAIGNS_DIR, d, "creative-plan.json")))[0] || null; } catch { return null; } };
  const campTemplateBase = (campaign, id) => `/template-camp-asset/${encodeURIComponent(campaign)}/${encodeURIComponent(id)}/`;
  const editsConfigPath = (campaign, angleId, assetId) => join(CAMPAIGNS_DIR, campaign, "edits", `${angleId}__${assetId}.config.json`);
  const writeAtomic = (filePath, contents) => { mkdirSync(dirname(filePath), { recursive: true }); const tmp = filePath + ".tmp"; writeFileSync(tmp, contents); renameSync(tmp, filePath); };
  const stampPlanAsset = (campaign, angleId, assetId, fields) => {
    const p = join(CAMPAIGNS_DIR, campaign, "creative-plan.json"); if (!existsSync(p)) return false;
    const plan = JSON.parse(readFileSync(p, "utf8"));
    const angle = (plan.angles || []).find((a) => a.id === angleId);
    const asset = angle && (angle.assets || []).find((a) => a.id === assetId);
    if (!asset) return false;
    Object.assign(asset, fields); writeAtomic(p, JSON.stringify(plan, null, 2)); return true;
  };
  const extractSpecFields = (src) => {
    const at = src.indexOf("fields:"); if (at < 0) return null;
    const open = src.indexOf("[", at); if (open < 0) return null;
    let depth = 0;
    for (let i = open; i < src.length; i++) { const ch = src[i]; if (ch === "[") depth++; else if (ch === "]") { depth--; if (depth === 0) { try { return JSON.parse(src.slice(open, i + 1)); } catch { return null; } } } }
    return null;
  };
  const runNode = (scriptArgs) => new Promise((resolveP) => {
    const proc = spawn("node", scriptArgs, { cwd: PROJECT_ROOT });
    let stdout = "", stderr = "";
    proc.stdout.on("data", (d) => (stdout += d)); proc.stderr.on("data", (d) => (stderr += d));
    proc.on("exit", (code) => resolveP({ code, stdout, stderr }));
    proc.on("error", (e) => resolveP({ code: -1, stdout, stderr: stderr + String(e) }));
  });
  const safeJson = (stdout, fallback) => { try { return JSON.parse((stdout || "").trim() || "null") ?? fallback; } catch { return fallback; } };
  const driveFetch = async (id) => {
    mkdirSync(DRIVE_CACHE_ROOT, { recursive: true });
    let found = null;
    try { found = readdirSync(DRIVE_CACHE_ROOT).find((f) => f.startsWith(id + ".")); } catch {}
    if (found) { const abs = join(DRIVE_CACHE_ROOT, found); return { path: abs, rel: abs.slice(PROJECT_ROOT.length + 1).replace(/\\/g, "/"), mime: MIME[extname(abs).toLowerCase()] || "application/octet-stream" }; }
    const { stdout } = await runNode(["scripts/drive-list.mjs", "download", "--file", id, "--out", join(DRIVE_CACHE_ROOT, id)]);
    const j = safeJson(stdout, {});
    if (!j.available || j.error || !j.path || !existsSync(j.path)) return { error: j.error || "drive download failed" };
    return { path: j.path, rel: j.path.slice(PROJECT_ROOT.length + 1).replace(/\\/g, "/"), mime: j.mime || MIME[extname(j.path).toLowerCase()] || "application/octet-stream" };
  };

  return async function campaignPlugin(req, res, ctx) {
    const { url, path, send, sendJson, sendFile, readBody } = ctx;
    const Q = (k) => url.searchParams.get(k);

    if (path === "/campaigns" && req.method === "GET") {
      let list = []; try { list = readdirSync(CAMPAIGNS_DIR).filter((d) => existsSync(join(CAMPAIGNS_DIR, d, "creative-plan.json"))); } catch {}
      sendJson(res, 200, { campaigns: list }); return true;
    }

    // ===== Claude Design DIRECT-EDIT routes (edit the real design, never rebuild) =====
    // The real `.cr-frame` slice IS the render surface; edits are surgical overrides
    // keyed to data-edit-id. Used by the editor stage, review cards, and export.
    const designsDir = (c) => join(CAMPAIGNS_DIR, c, "designs");
    const overridesPath = (c, label) => join(CAMPAIGNS_DIR, c, "edits", label + ".json");

    const designsList = path.match(/^\/designs\/([\w-]+)$/);
    if (designsList && req.method === "GET") {
      const mf = join(designsDir(designsList[1]), "manifest.json");
      if (!existsSync(mf)) { sendJson(res, 404, { error: "no extracted designs (run scripts/design-extract.mjs)" }); return true; }
      send(res, 200, readFileSync(mf, "utf8")); return true;
    }

    const designOne = path.match(/^\/design\/([\w-]+)\/(\w+)$/);
    if (designOne && req.method === "GET") {
      const [, c, label] = designOne;
      const frag = join(designsDir(c), label + ".html");
      if (!existsSync(frag)) { sendJson(res, 404, { error: `no design "${label}" in "${c}" (run design-extract)` }); return true; }
      let dsHref = "", keyframes = "";
      try { dsHref = JSON.parse(readFileSync(join(designsDir(c), "manifest.json"), "utf8")).dsHref || ""; } catch {}
      try { keyframes = readFileSync(join(designsDir(c), "_keyframes.css"), "utf8"); } catch {}
      let overrides = {};
      try { if (existsSync(overridesPath(c, label))) overrides = JSON.parse(readFileSync(overridesPath(c, label), "utf8")); } catch {}
      const html = wrapStandalone({
        fragmentHtml: readFileSync(frag, "utf8"),
        keyframesCss: keyframes,
        dsHref,
        overrides,
        assetBase: `/design-asset/${encodeURIComponent(c)}/`,
      });
      send(res, 200, html, "text/html"); return true;
    }

    const designAsset = path.match(/^\/design-asset\/([\w-]+)\/(.+)$/);
    if (designAsset && req.method === "GET") {
      const c = designAsset[1];
      const rel = decodeURIComponent(designAsset[2]).replace(/\\/g, "/");
      if (rel.includes("..")) { sendJson(res, 400, { error: "bad path" }); return true; }
      const baseDir = join(CAMPAIGNS_DIR, c);
      const resolved = resolve(join(baseDir, rel));
      if (resolved.startsWith(resolve(baseDir)) && existsSync(resolved)) {
        sendFile(req, res, resolved, MIME[extname(resolved).toLowerCase()] || "application/octet-stream"); return true;
      }
      sendJson(res, 404, { error: "asset not found" }); return true;
    }

    // Copy a pulled media file into the campaign's own assets/ (so a swap on a direct
    // design resolves via /design-asset). Mirrors /media-into-template for campaigns.
    const designMediaInto = path.match(/^\/design-media-into\/([\w-]+)$/);
    if (designMediaInto && req.method === "POST") {
      const c = designMediaInto[1];
      try {
        const { src } = JSON.parse((await readBody(req)) || "{}");
        if (!src) { sendJson(res, 400, { error: "missing src" }); return true; }
        const from = resolve(src.startsWith("/") || /^[A-Za-z]:/.test(src) ? src : join(PROJECT_ROOT, src));
        if (!existsSync(from)) { sendJson(res, 404, { error: "source media not found: " + src }); return true; }
        const ext = extname(from).toLowerCase();
        const sub = CLIP_EXT.has(ext) ? "vid" : "img";
        const name = basename(from);
        const destDir = join(CAMPAIGNS_DIR, c, "assets", sub);
        mkdirSync(destDir, { recursive: true });
        copyFileSync(from, join(destDir, name));
        sendJson(res, 200, { path: `assets/${sub}/${name}` }); return true;
      } catch (e) { sendJson(res, 500, { error: String((e && e.message) || e) }); return true; }
    }

    const designOv = path.match(/^\/design-overrides\/([\w-]+)\/(\w+)$/);
    if (designOv) {
      const [, c, label] = designOv;
      const p = overridesPath(c, label);
      if (req.method === "GET") {
        let ov = { edits: {}, added: [] };
        try { if (existsSync(p)) ov = JSON.parse(readFileSync(p, "utf8")); } catch {}
        sendJson(res, 200, ov); return true;
      }
      if (req.method === "POST") {
        try {
          const body = JSON.parse((await readBody(req)) || "{}");
          writeAtomic(p, JSON.stringify(body, null, 2));
          sendJson(res, 200, { saved: true, campaign: c, label }); return true;
        } catch (e) { sendJson(res, 400, { error: String((e && e.message) || e) }); return true; }
      }
    }
    if (path === "/plan" && req.method === "GET") {
      const campaign = Q("campaign") || firstCampaign();
      if (!campaign) { sendJson(res, 404, { error: "no campaigns with a creative-plan.json" }); return true; }
      const p = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
      if (!existsSync(p)) { sendJson(res, 404, { error: `no plan for campaign "${campaign}"` }); return true; }
      send(res, 200, readFileSync(p, "utf8")); return true;
    }
    if (path === "/validation" && req.method === "GET") {
      try {
        const campaign = Q("campaign") || firstCampaign();
        if (!campaign) { sendJson(res, 200, { ok: false, error: "no campaign" }); return true; }
        const planFile = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
        if (!existsSync(planFile)) { sendJson(res, 200, { ok: false, error: `no plan for "${campaign}"` }); return true; }
        sendJson(res, 200, validatePlan(JSON.parse(readFileSync(planFile, "utf8")), { campaign }));
      } catch (e) { sendJson(res, 200, { ok: false, error: String((e && e.message) || e) }); }
      return true;
    }
    const planPatch = path.match(/^\/plan\/([\w.-]+)\/([\w.-]+)\/([\w.-]+)$/);
    if (planPatch && req.method === "POST") {
      const [, campaign, angleId, assetId] = planPatch;
      const p = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
      if (!existsSync(p)) { sendJson(res, 404, { error: `no plan for campaign "${campaign}"` }); return true; }
      let patch; try { patch = JSON.parse(await readBody(req)); } catch (e) { sendJson(res, 400, { error: e.message }); return true; }
      const plan = JSON.parse(readFileSync(p, "utf8"));
      const angle = (plan.angles || []).find((a) => a.id === angleId);
      if (!angle) { sendJson(res, 404, { error: `angle "${angleId}" not found` }); return true; }
      const asset = (angle.assets || []).find((a) => a.id === assetId);
      if (!asset) { sendJson(res, 404, { error: `asset "${assetId}" not found` }); return true; }
      const ALLOWED = ["status", "notes", "flags", "headline", "microscript", "output", "thumb", "editedAt", "renderedAt", "templateData", "clip", "photo", "audio", "template", "copyRefs", "hookRef", "copyByRole", "kraken"];
      for (const k of ALLOWED) if (k in patch) asset[k] = patch[k];
      writeFileSync(p, JSON.stringify(plan, null, 2));
      sendJson(res, 200, { saved: true, campaign, angle: angleId, asset: assetId }); return true;
    }
    const campVals = path.match(/^\/campaign-values\/([\w.-]+)$/);
    if (campVals && req.method === "GET") {
      const campaign = campVals[1];
      try {
        const planFile = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
        if (!existsSync(planFile)) { sendJson(res, 404, { error: `no plan for "${campaign}"` }); return true; }
        const plan = JSON.parse(readFileSync(planFile, "utf8"));
        const microscript = new Set(), headline = new Set(), all = new Set(), byKey = {}, byRole = {};
        const add = (set, v) => { if (typeof v === "string" && v.trim()) { set.add(v); all.add(v); } };
        const addRole = (role, v) => { if (role && typeof v === "string" && v.trim()) (byRole[role] = byRole[role] || new Set()).add(v); };
        for (const ang of plan.angles || []) for (const a of ang.assets || []) {
          add(microscript, a.microscript); add(headline, a.headline);
          addRole(BEAT_HEADLINE_ROLE[beatLetter(a.beat)] || "hook", a.headline); addRole("reframe", a.microscript);
          if (a.templateData && typeof a.templateData === "object") for (const [k, v] of Object.entries(a.templateData)) {
            if (k.startsWith("_") || typeof v !== "string" || !v.trim()) continue;
            (byKey[k] = byKey[k] || new Set()).add(v); addRole(fieldRole(k), v); all.add(v);
          }
        }
        const lib = loadCopyLibrary(join(CAMPAIGNS_DIR, campaign)); const library = [];
        if (lib && Array.isArray(lib.units)) for (const u of lib.units) {
          if (typeof u.text !== "string" || !u.text.trim()) continue;
          library.push({ id: u.id, role: u.role, kind: u.kind, text: u.text, chars: u.chars });
          if (u.role) addRole(u.role, u.text); all.add(u.text);
        }
        const byKeyArr = {}; for (const k of Object.keys(byKey)) byKeyArr[k] = [...byKey[k]];
        const byRoleArr = {}; for (const r of Object.keys(byRole)) byRoleArr[r] = [...byRole[r]];
        sendJson(res, 200, { microscript: [...microscript], headline: [...headline], byKey: byKeyArr, byRole: byRoleArr, all: [...all], library });
      } catch (e) { sendJson(res, 500, { error: e.message }); }
      return true;
    }
    const campCfg = path.match(/^\/campaign-config\/([\w.-]+)\/([\w.-]+)\/([\w.-]+)$/);
    if (campCfg) {
      const [, campaign, angleId, assetId] = campCfg;
      const editsPath = editsConfigPath(campaign, angleId, assetId);
      if (req.method === "GET") {
        const planFile = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
        let plan = null; try { if (existsSync(planFile)) plan = JSON.parse(readFileSync(planFile, "utf8")); } catch {}
        const angle = plan && (plan.angles || []).find((a) => a.id === angleId);
        const asset = angle && (angle.assets || []).find((a) => a.id === assetId);
        if (asset && asset.template) { res.setHeader("X-Template-Base", campTemplateBase(campaign, asset.template)); res.setHeader("Access-Control-Expose-Headers", "X-Template-Base"); }
        if (existsSync(editsPath)) { send(res, 200, readFileSync(editsPath, "utf8")); return true; }
        if (!plan) { sendJson(res, 404, { error: `no plan for "${campaign}"` }); return true; }
        if (!asset) { sendJson(res, 404, { error: `asset "${assetId}" not found` }); return true; }
        if (asset.format && asset.format !== "static") { sendJson(res, 400, { error: `asset "${assetId}" is a ${asset.format} (motion) asset, not an editable static` }); return true; }
        const found = findTemplate(asset.template, campaign);
        if (!asset.template || !found) { sendJson(res, 404, { error: `no static config for template "${asset.template}" in any template root` }); return true; }
        const location = asset.location || (angle && angle.location) || plan.location || null;
        const config = resolveStaticConfig({ clusterId: asset.template, asset, brand: plan.brand, location, campaign, templateDir: found.dir, dataDir: DATA_DIR });
        if (!config) { sendJson(res, 404, { error: `could not resolve config for ${asset.template}` }); return true; }
        writeAtomic(editsPath, JSON.stringify(config, null, 2)); send(res, 200, JSON.stringify(config)); return true;
      }
      if (req.method === "POST") {
        let parsed; try { parsed = JSON.parse(await readBody(req)); } catch (e) { sendJson(res, 400, { error: e.message }); return true; }
        const editedAt = new Date().toISOString();
        try { writeAtomic(editsPath, JSON.stringify(parsed, null, 2)); JSON.parse(readFileSync(editsPath, "utf8")); }
        catch (e) { sendJson(res, 500, { saved: false, error: "edits did not persist: " + ((e && e.message) || e) }); return true; }
        if (!stampPlanAsset(campaign, angleId, assetId, { editedAt })) { sendJson(res, 500, { saved: false, error: "editedAt stamp did not persist (asset not found in plan)" }); return true; }
        sendJson(res, 200, { saved: true, editedAt, campaign, angle: angleId, asset: assetId }); return true;
      }
    }
    const approveTrim = path.match(/^\/approve-trim\/([\w.-]+)\/([\w.-]+)\/([\w.-]+)$/);
    if (approveTrim && req.method === "POST") {
      const [, campaign, angleId, assetId] = approveTrim;
      let patch; try { patch = JSON.parse(await readBody(req)); } catch (e) { sendJson(res, 400, { error: e.message }); return true; }
      const field = patch.field, text = patch.text;
      if (typeof field !== "string" || !field.trim() || typeof text !== "string" || !text.trim()) { sendJson(res, 400, { error: "approve-trim requires non-empty { field, text }" }); return true; }
      const planFile = join(CAMPAIGNS_DIR, campaign, "creative-plan.json");
      if (!existsSync(planFile)) { sendJson(res, 404, { error: `no plan for "${campaign}"` }); return true; }
      const plan = JSON.parse(readFileSync(planFile, "utf8"));
      const angle = (plan.angles || []).find((a) => a.id === angleId);
      const asset = angle && (angle.assets || []).find((a) => a.id === assetId);
      if (!asset) { sendJson(res, 404, { error: `asset "${assetId}" not found` }); return true; }
      if (asset.format === "video" || asset.format === "gif") {
        const td = (asset.templateData && typeof asset.templateData === "object") ? { ...asset.templateData } : {};
        const approved = (td._approvedTrims && typeof td._approvedTrims === "object") ? { ...td._approvedTrims } : {};
        approved[field] = text; td._approvedTrims = approved;
        if (!stampPlanAsset(campaign, angleId, assetId, { templateData: td })) { sendJson(res, 500, { approved: false, error: "approval did not persist (asset not found in plan)" }); return true; }
        sendJson(res, 200, { approved: true, scope: "motion", field, campaign, angle: angleId, asset: assetId }); return true;
      }
      const editsPath = editsConfigPath(campaign, angleId, assetId); let cfg;
      if (existsSync(editsPath)) { try { cfg = JSON.parse(readFileSync(editsPath, "utf8")); } catch (e) { sendJson(res, 500, { approved: false, error: "edits config unreadable: " + e.message }); return true; } }
      else {
        const found = findTemplate(asset.template, campaign);
        if (!asset.template || !found) { sendJson(res, 404, { error: `no static config for template "${asset.template}" — cannot record approval` }); return true; }
        const location = asset.location || (angle && angle.location) || plan.location || null;
        cfg = resolveStaticConfig({ clusterId: asset.template, asset, brand: plan.brand, location, campaign, templateDir: found.dir, dataDir: DATA_DIR });
        if (!cfg) { sendJson(res, 404, { error: `could not resolve config for ${asset.template}` }); return true; }
      }
      cfg._approvedTrims = { ...(cfg._approvedTrims && typeof cfg._approvedTrims === "object" ? cfg._approvedTrims : {}), [field]: text };
      try { writeAtomic(editsPath, JSON.stringify(cfg, null, 2)); JSON.parse(readFileSync(editsPath, "utf8")); }
      catch (e) { sendJson(res, 500, { approved: false, error: "approval did not persist: " + ((e && e.message) || e) }); return true; }
      sendJson(res, 200, { approved: true, scope: "static", field, campaign, angle: angleId, asset: assetId }); return true;
    }
    const renderAsset = path.match(/^\/render-asset\/([\w.-]+)\/([\w.-]+)\/([\w.-]+)$/);
    if (renderAsset && req.method === "POST") {
      const [, campaign, angleId, assetId] = renderAsset;
      const proc = spawn("node", ["scripts/run-campaign.mjs", campaign, "--only", assetId, "--angle", angleId, "--all"], { cwd: PROJECT_ROOT });
      let stderr = "", done = false;
      const killTree = () => { try { if (process.platform === "win32") spawn("taskkill", ["/PID", String(proc.pid), "/T", "/F"]); else proc.kill("SIGTERM"); } catch {} };
      const watchdog = setTimeout(() => { if (done) return; done = true; killTree(); if (!res.headersSent) sendJson(res, 504, { exitCode: -1, error: `render timed out after ${Math.round(RENDER_TIMEOUT_MS / 1000)}s — killed`, stderr: stderr.slice(-2000) }); }, RENDER_TIMEOUT_MS);
      req.on("close", () => { if (done) return; done = true; clearTimeout(watchdog); killTree(); });
      proc.stderr.on("data", (d) => (stderr += d));
      proc.on("exit", (code) => {
        if (done) return; done = true; clearTimeout(watchdog);
        let output = null;
        try { const plan = JSON.parse(readFileSync(join(CAMPAIGNS_DIR, campaign, "creative-plan.json"), "utf8")); const angle = (plan.angles || []).find((a) => a.id === angleId); const asset = angle && (angle.assets || []).find((a) => a.id === assetId); output = asset ? asset.output : null; } catch {}
        sendJson(res, code === 0 ? 200 : 500, { exitCode: code, output, stderr: stderr.slice(-2000) });
      });
      return true;
    }
    const specMatch = path.match(/^\/template-spec\/([\w-]+)$/);
    if (specMatch && req.method === "GET") {
      const tmpl = specMatch[1]; const p = join(VIDEO_TEMPLATES_DIR, `${tmpl}.jsx`);
      if (!existsSync(p)) { sendJson(res, 404, { error: `template "${tmpl}" not found` }); return true; }
      const src = readFileSync(p, "utf8");
      const component = (src.match(/window\.([A-Za-z_$][\w$]*Reel)\s*=/) || src.match(/window\.([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\s*;/) || [])[1] || null;
      sendJson(res, 200, { template: tmpl, fields: extractSpecFields(src) || [], component }); return true;
    }
    if (path === "/bank" && req.method === "GET") {
      const type = Q("type") || "motion"; const campaign = Q("campaign") || undefined; let templates = [];
      try { if (type === "static") templates = listTemplates(campaign); else templates = readdirSync(VIDEO_TEMPLATES_DIR).filter((f) => f.endsWith(".jsx")).map((f) => f.replace(/\.jsx$/, "")); } catch {}
      templates.sort(); sendJson(res, 200, { type, templates }); return true;
    }
    if (path === "/brands" && req.method === "GET") {
      let brands = [];
      try { brands = readdirSync(DATA_DIR).filter((f) => /^brand\..+\.json$/.test(f)).map((f) => { const slug = f.replace(/^brand\./, "").replace(/\.json$/, ""); let name = slug; try { const j = JSON.parse(readFileSync(join(DATA_DIR, f), "utf8")); name = (j.tags && j.tags.brand_name) || j.brand_name || slug; } catch {} return { slug, name }; }).sort((a, b) => a.name.localeCompare(b.name)); } catch {}
      sendJson(res, 200, { brands }); return true;
    }
    // ── Google Drive ──
    if (path === "/drive/status" && req.method === "GET") {
      try { const { stdout } = await runNode(["scripts/drive-list.mjs", "status"]); sendJson(res, 200, safeJson(stdout, { available: false })); }
      catch (e) { sendJson(res, 200, { available: false, error: String((e && e.message) || e) }); } return true;
    }
    if (path === "/drive/folders" && req.method === "GET") {
      try { const parent = Q("parent"); const { stdout } = await runNode(["scripts/drive-list.mjs", "folders", ...(parent ? ["--parent", parent] : [])]); sendJson(res, 200, safeJson(stdout, { available: false, folders: [] })); }
      catch (e) { sendJson(res, 200, { available: false, folders: [], error: String((e && e.message) || e) }); } return true;
    }
    if (path === "/drive/files" && req.method === "GET") {
      try { const folder = Q("folder"); if (!folder) { sendJson(res, 400, { available: true, error: "missing ?folder=", files: [] }); return true; } const { stdout } = await runNode(["scripts/drive-list.mjs", "files", "--folder", folder]); const j = safeJson(stdout, { available: false, files: [] }); for (const f of (j.files || [])) f.url = "/drive-file/" + encodeURIComponent(f.id); sendJson(res, 200, j); }
      catch (e) { sendJson(res, 200, { available: false, files: [], error: String((e && e.message) || e) }); } return true;
    }
    const driveFileM = path.match(/^\/drive-file\/([A-Za-z0-9_-]+)$/);
    if (driveFileM && req.method === "GET") {
      try { const f = await driveFetch(driveFileM[1]); if (f.error) { sendJson(res, 502, { error: f.error }); return true; } sendFile(req, res, f.path, f.mime); }
      catch (e) { sendJson(res, 502, { error: String((e && e.message) || e) }); } return true;
    }
    if (path === "/drive/place" && req.method === "POST") {
      try { const { id } = JSON.parse((await readBody(req)) || "{}"); if (!id) { sendJson(res, 400, { error: "missing id" }); return true; } const f = await driveFetch(id); if (f.error) { sendJson(res, 502, { error: f.error }); return true; } sendJson(res, 200, { file: { path: f.rel, mime: f.mime, type: f.mime.startsWith("video/") ? "video" : "image" } }); }
      catch (e) { sendJson(res, 502, { error: String((e && e.message) || e) }); } return true;
    }
    // ── Kraken campaign sidecar (the GENERIC browse falls through to the engine) ──
    if (path === "/kraken/state" && req.method === "GET") {
      try { const campaign = Q("campaign"); if (!campaign) { sendJson(res, 400, { error: "missing ?campaign=" }); return true; } let sc = {}; try { const p = join(CAMPAIGNS_DIR, campaign, "kraken.json"); if (existsSync(p)) sc = JSON.parse(readFileSync(p, "utf8")); } catch {} sendJson(res, 200, { campaign, workspace: sc.workspace || null, workspaceId: sc.workspaceId || null, sourceFolder: sc.sourceFolder || null }); }
      catch (e) { sendJson(res, 500, { error: String((e && e.message) || e) }); } return true;
    }
    if (path === "/kraken/pull" && req.method === "POST") {
      try {
        let body; try { body = JSON.parse((await readBody(req)) || "{}"); } catch (e) { sendJson(res, 400, { error: "bad JSON: " + e.message }); return true; }
        const { campaign, workspace, folder } = body;
        if (!campaign || !workspace || !folder) { sendJson(res, 400, { error: "need campaign, workspace, folder" }); return true; }
        const { code, stdout, stderr } = await runNode(["scripts/kraken-pull.mjs", campaign, "--workspace", workspace, "--folder", folder, "--per-campaign", "--json"]);
        let summary = null; const m = (stdout || "").match(/__PULL_JSON__ (.+)/); if (m) { try { summary = JSON.parse(m[1]); } catch {} }
        sendJson(res, code === 0 ? 200 : 500, { exitCode: code, ...(summary || {}), stderr: stderr.slice(-2000) });
      } catch (e) { sendJson(res, 500, { error: String((e && e.message) || e) }); } return true;
    }
    // ── Brand-scoped media (OVERRIDES the engine's generic /media) ──
    if (path === "/media" && req.method === "GET") {
      try {
        const kind = Q("kind") || "photo"; const campaign = Q("campaign") || null; const brandParam = Q("brand") || null;
        const exts = EXT_FOR_KIND[kind] || PHOTO_EXT; const items = []; const seen = new Set();
        const loadMan = (root) => { try { return JSON.parse(readFileSync(join(root, ".manifest.json"), "utf8")); } catch { return {}; } };
        const addFrom = (root, source, man = {}) => {
          let files = []; try { files = readdirSync(root); } catch { return; }
          for (const f of files) {
            if (!exts.has(extname(f).toLowerCase())) continue;
            const abs = join(root, f); const rel = abs.slice(PROJECT_ROOT.length + 1).replace(/\\/g, "/");
            if (seen.has(rel)) continue; seen.add(rel);
            const src = source === "kraken-dir" ? (f.startsWith("upload-") ? "uploaded" : "kraken") : source;
            const item = { name: f, path: rel, url: "/media-file/" + rel, source: src };
            const ref = man[f]; if (ref && ref.id) { item.krakenId = ref.id; item.krakenUrl = ref.url; }
            items.push(item);
          }
        };
        const brandSlug = campaign ? campaignBrandSlug(campaign) : brandParam;
        const attached = !!(campaign || brandParam);
        const sharedRoots = MEDIA_ROOTS.filter((r) => resolve(r) !== resolve(KRAKEN_CACHE_ROOT));
        const listRoots = listingRoots({ attached, brandSlug, sharedRoots, musicRoot: MUSIC_ROOT, kitDir: brandSlug && !isAABrand(brandSlug) ? kitDirForBrand(brandSlug) : null });
        for (const root of listRoots) addFrom(root, "brand");
        if (campaign) { const cd = campaignCacheDir(campaign); addFrom(cd, "kraken-dir", loadMan(cd)); }
        addFrom(KRAKEN_CACHE_ROOT, "kraken-dir", loadMan(KRAKEN_CACHE_ROOT));
        sendJson(res, 200, { kind, campaign, brand: brandSlug || null, attached, krakenFolder: campaign ? krakenSidecarFolder(campaign) : null, items });
      } catch (e) { sendJson(res, 500, { error: String((e && e.message) || e) }); } return true;
    }
    // ── Brand-media file serve (guarded to AA media roots; OVERRIDES generic) ──
    if (path.startsWith("/media-file/") && req.method === "GET") {
      const rel = decodeURIComponent(path.slice("/media-file/".length)); const resolved = resolve(join(PROJECT_ROOT, rel));
      if (underAnyMediaRoot(resolved) && existsSync(resolved)) { sendFile(req, res, resolved, MIME[extname(resolved).toLowerCase()] || "application/octet-stream"); return true; }
      sendJson(res, 404, { error: "media not found" }); return true;
    }
    // ── Campaign-aware stage-into-template (OVERRIDES generic) ──
    if (path === "/media-into-template" && req.method === "POST") {
      try {
        const { src, editorId } = JSON.parse((await readBody(req)) || "{}");
        if (!src) { sendJson(res, 400, { error: "missing src" }); return true; }
        const from = resolve(join(PROJECT_ROOT, src));
        if (!underAnyMediaRoot(from) || !existsSync(from)) { sendJson(res, 404, { error: "source media not found in a brand media root" }); return true; }
        let tmplId = null, tmplCampaign;
        if (typeof editorId === "string" && editorId.startsWith("camp:")) {
          const [, c, a, as] = editorId.split(":"); tmplCampaign = c;
          try { const plan = JSON.parse(readFileSync(join(CAMPAIGNS_DIR, c, "creative-plan.json"), "utf8")); const ang = (plan.angles || []).find((x) => x.id === a); const asset = ang && (ang.assets || []).find((x) => x.id === as); tmplId = asset && asset.template; } catch {}
        } else if (typeof editorId === "string" && editorId) { tmplId = editorId; }
        const assetsDir = (tmplId && assetsDirFor(tmplId, tmplCampaign)) || join(TEMPLATES_DIR, "assets");
        mkdirSync(assetsDir, { recursive: true });
        const ext = extname(from).toLowerCase();
        const slug = basename(from, extname(from)).replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "photo";
        const name = "swap-" + slug + ext; copyFileSync(from, join(assetsDir, name));
        sendJson(res, 200, { path: "./assets/" + name });
      } catch (e) { sendJson(res, 500, { error: String((e && e.message) || e) }); } return true;
    }
    // ── Video bank + campaign-scoped template asset serving ──
    if (path.startsWith("/video-templates/") && req.method === "GET") {
      const resolved = resolve(join(VIDEO_DIR, path.slice("/video-templates/".length)));
      if (resolved.startsWith(resolve(VIDEO_DIR)) && existsSync(resolved)) { sendFile(req, res, resolved, MIME[extname(resolved).toLowerCase()] || "application/octet-stream"); return true; }
      sendJson(res, 404, { error: "video-template asset not found" }); return true;
    }
    const tcassetMatch = path.match(/^\/template-camp-asset\/([^/]+)\/([A-Za-z0-9._-]+)\/(.+)$/);
    if (tcassetMatch && req.method === "GET") {
      const found = findTemplate(tcassetMatch[2], decodeURIComponent(tcassetMatch[1]));
      if (found) { const resolved = resolve(join(found.dir, decodeURIComponent(tcassetMatch[3]))); if (resolved.startsWith(resolve(found.dir)) && existsSync(resolved)) { sendFile(req, res, resolved, MIME[extname(resolved).toLowerCase()] || "application/octet-stream"); return true; } }
      sendJson(res, 404, { error: "template asset not found" }); return true;
    }

    return false; // not an AA-campaign route → fall through to the engine core
  };
}

#!/usr/bin/env node
// ============================================================================
//  scripts/fill-render-test.mjs — standalone "fill-in-the-blank" proof harness
// ============================================================================
//  Renders ONE bank template from a DATA file, with custom brand colors + a
//  custom background clip/photo, WITHOUT editing the template's .jsx. It is the
//  same fill mechanism scripts/run-campaign.mjs uses (window.__BRAND__ tokens +
//  a per-asset data.json -> window.__CONFIG__ + the pre-extracted bg-frame
//  sequence), lifted out of the campaign/validation shell so a single template
//  can be filled + rendered on its own.
//
//    node scripts/fill-render-test.mjs motion --data <fill.json> --out <name>
//    node scripts/fill-render-test.mjs static --config <fill.config.json> \
//         --cluster cluster-1 --out <name>
//
//  motion: inlines the motion template VERBATIM under a <Stage> wrapper, injects
//          window.__BRAND__ (colors/logo/name) + window.__bgFrames (the clip,
//          pre-extracted to PNGs at 30fps) + the deterministic bg-sync patch
//          (copied verbatim from run-campaign.mjs), then renders -> out/<name>.mp4
//  static: writes the filled layer config + a thin variant jsx via emitVariant
//          (which CLONES the real cluster jsx, only swapping its config import),
//          then renders -> out/<name>.png
// ============================================================================

import {
  existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync,
  renameSync, copyFileSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { emitVariant } from "./lib/fill-core.mjs";

const PROJECT_ROOT = resolve(".");
const VIDEO_DIR = join(PROJECT_ROOT, "brand/video-templates");
const OUT_DIR = join(PROJECT_ROOT, "out");
const RENDERER = join(PROJECT_ROOT, ".claude/skills/jsx-to-mp4/scripts/render.mjs");

const args = process.argv.slice(2);
const mode = args[0];
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };

function render(jsxPath) {
  const r = spawnSync("node", [RENDERER, jsxPath], { cwd: PROJECT_ROOT, encoding: "utf8", timeout: 240000 });
  if (r.stdout) process.stderr.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  return r.status === 0;
}

function runMotion() {
  const dataPath = opt("data");
  const outName = opt("out") || "fill-motion";
  const fill = JSON.parse(readFileSync(resolve(PROJECT_ROOT, dataPath), "utf8"));
  const tmpl = fill.template;
  const tmplPath = join(VIDEO_DIR, "templates", `${tmpl}.jsx`);
  if (!existsSync(tmplPath)) throw new Error(`template not found: ${tmplPath}`);
  const src = readFileSync(tmplPath, "utf8");
  const compName = (src.match(/window\.([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\s*;/) || [])[1];
  if (!compName) throw new Error(`no window.<Component> in ${tmpl}.jsx`);

  const base = `_fill-${tmpl}`;
  const D = Number(fill.duration) || 4;
  const data = { ...(fill.data || {}) };

  // Pre-extract the background clip to PNG frames at 30fps (capped to D). A
  // headless <video> can't be reliably frame-seeked, so SyncedVideo renders an
  // <img data-bgframe> that the bg-sync patch fills per render frame.
  let bgFramesInfo = null;
  if (fill.bgClip) {
    const clipAbs = resolve(PROJECT_ROOT, fill.bgClip);
    if (!existsSync(clipAbs)) throw new Error(`bgClip not found: ${clipAbs}`);
    const framesDir = join(VIDEO_DIR, `${base}.bgframes`);
    rmSync(framesDir, { recursive: true, force: true });
    mkdirSync(framesDir, { recursive: true });
    const ex = spawnSync("ffmpeg", ["-y", "-i", clipAbs, "-t", String(D), "-vf", "fps=30", join(framesDir, "%05d.png")], { encoding: "utf8" });
    const count = ex.status === 0 ? readdirSync(framesDir).filter((f) => f.endsWith(".png")).length : 0;
    if (!count) throw new Error(`ffmpeg frame extraction failed: ${String(ex.stderr || "").split(/\r?\n/).slice(-3).join(" | ")}`);
    bgFramesInfo = { base: `./${base}.bgframes/`, count, fps: 30, key: "bgClip" };
    data.bgClip = bgFramesInfo.base; // truthy -> template renders SyncedVideo
    console.error(`[fill] bg clip -> ${count} frames @ 30fps`);
  }

  const dataPathOut = join(VIDEO_DIR, `${base}.data.json`);
  writeFileSync(dataPathOut, JSON.stringify(data, null, 2));

  const W = 1080, H = 1920, FPS = 30;
  const wrapperName = `FillWrap_${tmpl.replace(/[^a-z0-9]+/gi, "_")}`;
  // Wrapper = Stage (timeline owner) + brand tokens + bg-frame sequence + the
  // deterministic bg-sync patch (verbatim from run-campaign.mjs) + the template
  // inlined VERBATIM below. The wrapper global is registered FIRST so the
  // renderer mounts IT (its Stage supplies width/height/duration/timeline).
  const wrapper = `// AUTO-GENERATED fill wrapper for ${tmpl} — template inlined verbatim below; nothing in it is edited.
window.__BRAND__ = ${JSON.stringify(fill.brand || {})};
window.__bgFrames = ${bgFramesInfo ? JSON.stringify(bgFramesInfo) : "null"};

function ${wrapperName}({ data }) {
  const Inner = window.${compName};
  if (!Inner) return null;
  return (
    <Stage width={${W}} height={${H}} duration={${D}} fps={${FPS}} background="#0a0b0d">
      <Inner data={data || {}} />
    </Stage>
  );
}
window.${wrapperName} = ${wrapperName};

// ─── deterministic background sync (verbatim from scripts/run-campaign.mjs) ───
(function () {
  if (typeof window === "undefined" || window.__videoSyncPatched) return;
  function pad5(n) { n = String(n); while (n.length < 5) n = "0" + n; return n; }
  function install() {
    if (typeof window.__setRenderTime !== "function") { setTimeout(install, 0); return; }
    if (window.__videoSyncPatched) return;
    window.__videoSyncPatched = true;
    var orig = window.__setRenderTime;
    window.__setRenderTime = function (t) {
      orig(t);
      var ps = [];
      var bf = window.__bgFrames;
      if (bf && bf.base && bf.count > 0) {
        var idx = Math.round(t * bf.fps) % bf.count; if (idx < 0) idx += bf.count;
        var url = bf.base + pad5(idx + 1) + ".png";
        var imgs = document.querySelectorAll("img[data-bgframe]");
        Array.prototype.forEach.call(imgs, function (im) {
          if (im.getAttribute("src") !== url) im.setAttribute("src", url);
          if (im.decode) ps.push(im.decode().catch(function () {}));
        });
      }
      var vids = document.querySelectorAll("video");
      Array.prototype.forEach.call(vids, function (v) {
        if (!v || !v.duration || !isFinite(v.duration) || v.duration <= 0) return;
        var target = ((t % v.duration) + v.duration) % v.duration;
        ps.push(new Promise(function (res) {
          var done = false, fin = function () { if (done) return; done = true; res(); };
          try { v.currentTime = target; } catch (e) { return fin(); }
          if (typeof v.requestVideoFrameCallback === "function") v.requestVideoFrameCallback(function () { fin(); });
          v.addEventListener("seeked", fin, { once: true });
          setTimeout(fin, 1000);
        }));
      });
      return Promise.all(ps);
    };
  }
  install();
})();

// ─── inlined bank template: ${tmpl} (verbatim) ───────────────────────────────
${src}
`;
  const wrapperPath = join(VIDEO_DIR, `${base}.jsx`);
  writeFileSync(wrapperPath, wrapper);

  const ok = render(wrapperPath);
  const produced = join(OUT_DIR, `${base}.mp4`);
  let finalOut = null;
  if (ok && existsSync(produced)) {
    finalOut = join(OUT_DIR, `${outName}.mp4`);
    renameSync(produced, finalOut);
  }
  // cleanup throwaway wrapper/data/frames (keep ONLY the rendered output)
  rmSync(wrapperPath, { force: true });
  rmSync(dataPathOut, { force: true });
  if (bgFramesInfo) rmSync(join(VIDEO_DIR, `${base}.bgframes`), { recursive: true, force: true });
  rmSync(join(VIDEO_DIR, "__render"), { recursive: true, force: true });
  if (!finalOut) throw new Error("motion render failed (see log above)");
  console.error(`[fill] OK -> ${finalOut}`);
}

function runStatic() {
  const cfgPath = opt("config");
  const clusterId = opt("cluster");
  const outName = opt("out") || "fill-static";
  const templateDir = join(PROJECT_ROOT, "templates/multi-sport-foundations");
  const config = JSON.parse(readFileSync(resolve(PROJECT_ROOT, cfgPath), "utf8"));
  delete config._what;
  const suffix = ".imp-fill";
  const { fillJsxPath, fillConfigPath } = emitVariant({ clusterId, config, templateDir, suffix });
  const ok = render(fillJsxPath);
  const produced = join(OUT_DIR, `${clusterId}${suffix}.png`);
  let finalOut = null;
  if (ok && existsSync(produced)) {
    finalOut = join(OUT_DIR, `${outName}.png`);
    renameSync(produced, finalOut);
  }
  rmSync(fillJsxPath, { force: true });
  rmSync(fillConfigPath, { force: true });
  if (!finalOut) throw new Error("static render failed (see log above)");
  console.error(`[fill] OK -> ${finalOut}`);
}

mkdirSync(OUT_DIR, { recursive: true });
if (mode === "motion") runMotion();
else if (mode === "static") runStatic();
else { console.error("Usage: node scripts/fill-render-test.mjs motion|static ..."); process.exit(1); }

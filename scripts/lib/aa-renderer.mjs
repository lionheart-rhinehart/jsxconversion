// ============================================================================
//  scripts/lib/aa-renderer.mjs — AA's renderer adapter for the createEditorServer
//  widened render contract:  render({id,jsxPath,configPath,outDir,signal})
//                              -> { ok, format, outPath, exitCode, stdout, stderr }
// ----------------------------------------------------------------------------
//  Dispatches exactly like the live editor-server /render-template branch
//  (editor-server.mjs:454-528), so Phase C's thin host renders identically:
//    - a layer config whose BACKGROUND is a video -> scripts/lib/layer-config-video.mjs
//      -> out/<id>.mp4   (format "video")
//    - else -> the LOCKED .claude/skills/jsx-to-mp4 renderer -> out/<id>.png ("image")
//  The jsx-to-mp4 skill is WRAPPED, never modified. The abort `signal` tree-kills
//  the child (so a client that gives up can't orphan a puppeteer/ffmpeg grandchild).
//  NODE-ONLY.
// ============================================================================
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { configHasVideoBackground, configHasSequence } from "./layer-config-video.mjs";

// Pure dispatch decision — exported so it can be unit-tested without spawning.
// A video background OR a multi-clip sequence both route to layer-config-video.mjs
// (its CLI then dispatches single-clip vs. renderMultiClipSequence).
export function chooseRender({ id, jsxPath, configPath }) {
  let videoBg = false;
  try {
    const cfg = configPath && existsSync(configPath) ? JSON.parse(readFileSync(configPath, "utf8")) : null;
    videoBg = !!(cfg && (configHasVideoBackground(cfg) || configHasSequence(cfg)));
  } catch { videoBg = false; }
  return videoBg
    ? { videoBg: true, format: "video", outPath: `out/${id}.mp4`, args: ["scripts/lib/layer-config-video.mjs", configPath, `--id=${id}`] }
    : { videoBg: false, format: "image", outPath: `out/${id}.png`, args: [".claude/skills/jsx-to-mp4/scripts/render.mjs", jsxPath] };
}

export function createAaRenderer({ cwd = process.cwd() } = {}) {
  return {
    render({ id, jsxPath, configPath, signal } = {}) {
      return new Promise((resolve) => {
        const plan = chooseRender({ id, jsxPath, configPath });
        const proc = spawn("node", plan.args, { cwd });
        let stdout = "", stderr = "", done = false;
        const finish = (r) => { if (done) return; done = true; resolve(r); };
        const onAbort = () => {
          if (done) return;
          try {
            if (process.platform === "win32") spawn("taskkill", ["/PID", String(proc.pid), "/T", "/F"]);
            else proc.kill("SIGTERM");
          } catch (_) { /* already gone */ }
        };
        if (signal) { if (signal.aborted) onAbort(); else signal.addEventListener("abort", onAbort, { once: true }); }
        proc.stdout.on("data", (d) => (stdout += d));
        proc.stderr.on("data", (d) => (stderr += d));
        proc.on("error", (e) => finish({ ok: false, exitCode: -1, format: plan.format, outPath: null, stdout, stderr: String((e && e.message) || e) }));
        proc.on("exit", (code) => finish({ ok: code === 0, exitCode: code, format: plan.format, outPath: plan.outPath, stdout: stdout.slice(-2000), stderr: stderr.slice(-2000) }));
      });
    },
  };
}

// ============================================================================
//  scripts/lib/layer-config-video.mjs — Phase C: text-on-video → MP4
// ============================================================================
//  THE GAP THIS FILLS. Until now a layer-config creative (the editor's document
//  model: a background + positioned text/shape/cutout overlays, the same shape
//  templates/multi-sport-foundations/*.config.json uses) could ONLY render to a
//  static PNG (run-campaign's renderTemplateStatic). MP4 came exclusively from
//  hand-authored Stage/Remotion motion JSX. So a config with a VIDEO background
//  + a caption had no moving-picture output. This module builds that path.
//
//  HOW (reuse, not rebuild — generalizes scripts/example-sidecar/stage-motion.mjs):
//  The jsx-to-mp4 *shipped* renderer (claude-design.mjs) makes an MP4 from a JSX
//  that renders a <Stage>, but it REQUIRES a sibling animations.jsx (Stage /
//  useTime / TimelineContext live there) or the Stage freezes at t=0. It also
//  auto-loads editing.jsx + every elements/*.jsx in the render dir. So for one
//  layer config we assemble a throwaway STAGING DIR the renderer can resolve:
//
//    out/_layer-video/<id>/
//      animations.jsx          (copied — the timeline runtime, mandatory)
//      editing.jsx             (copied — provides TrimmedMedia, which renders the
//                               <img data-bgframe> the frame-sync driver fills)
//      elements/_helpers.jsx   (the static LayerStack/renderTextLayer/renderDesignItem
//                               renderers, with `export` stripped so their globals
//                               load as a plain script — overlays render verbatim)
//      elements/music-sync.jsx (copied only when the creative carries audio)
//      assets/…                (the template's assets, so overlay ./assets/… resolve)
//      <id>.bgframes/%05d.png  (the video bg pre-extracted to PNG frames, trimmed
//                               to [clipStart,clipEnd] and capped to the duration)
//      <id>.jsx                (the WRAPPER: a <Stage> that owns the timeline with
//                               TrimmedMedia(bg) + LayerStack(overlays) + MusicSync)
//
//  then runs render.mjs on the wrapper → out/<id>.mp4. The wrapper registers its
//  window global FIRST so the renderer's detectVariationGlobal + extractStageProps
//  read IT (its <Stage> supplies width/height/duration/fps + the timeline).
//
//  Deterministic background (proven in run-campaign.mjs ~540-685): a browser
//  <video> can't be reliably frame-stepped in the headless capture (it hyperloops
//  or freezes), so we pre-extract the clip to PNG frames and a patched
//  window.__setRenderTime sets the bg <img> to the frame for time t and AWAITS
//  img.decode() before each screenshot — moving picture, no flaky <video> seek.
//
//  Audio: <MusicSync> is inert during capture (the Stage runs playing:false), so
//  the actual sound is muxed into the finished MP4 by a separate ffmpeg pass here.
//
//  NO change to the LOCKED .claude/skills/jsx-to-mp4 — the generated Stage JSX is
//  rendered by the existing pipeline as-is.
//
//  Node-only. Exposed as renderLayerConfigVideo() AND a CLI (the Phase-C spike).
// ============================================================================

import { spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, rmSync, readFileSync, writeFileSync,
  copyFileSync, readdirSync, cpSync,
} from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(HERE, "..", "..");
const RENDERER = join(PROJECT_ROOT, ".claude", "skills", "jsx-to-mp4", "scripts", "render.mjs");
const RUNTIME_DIR = join(PROJECT_ROOT, "brand", "video-templates");          // animations.jsx + editing.jsx live here
const HELPERS_PATH = join(PROJECT_ROOT, "templates", "multi-sport-foundations", "_helpers.jsx");
const RENDER_TIMEOUT_MS = 240000; // a video render is 30fps × N seconds of screenshots — heavier than a static frame

const VID_RE = /\.(mp4|mov|webm|m4v|mkv)$/i;

// The deterministic background-sync driver patch — lifted verbatim (behaviour-
// identical) from run-campaign.mjs's motion path. Installed in the wrapper so the
// renderer's await before each screenshot blocks until the correct bg frame is
// decoded. Render-only; a live preview never loads this.
const BG_SYNC_PATCH = String.raw`
// ─── deterministic background sync ─────────────────────────────────────────
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
      return Promise.all(ps);
    };
  }
  install();
})();
`;

// Strip ES `export` so _helpers.jsx loads as a PLAIN script (sourceType:script),
// which lets babel-standalone hoist its top-level decls to window — exactly how
// animations.jsx/editing.jsx expose their globals. We also append explicit window
// assignments for the names the wrapper references, so the wrapper resolves them
// regardless of how preset-env binds top-level const/function. _helpers has NO
// imports, so nothing else needs rewriting.
function transformHelpersForScript(src) {
  const stripped = src.replace(/^export\s+/gm, "");
  const exposed = [
    "LayerStack", "renderTextLayer", "renderDesignItem", "FixedDesign",
    "MediaSlot", "ForegroundMedia", "Frame", "ArchedHeadline",
    "TextOverlay", "CityHeadline", "HairlineRule", "CornerAccent",
    "DarkProtectionGradient",
  ];
  const regs = exposed
    .map((n) => `if (typeof ${n} !== "undefined") window.${n} = ${n};`)
    .join("\n");
  return `${stripped}\n\n/* Phase-C: expose the static renderers as globals for the Stage wrapper. */\n${regs}\n`;
}

// Resolve a config media/asset path (which may be "./assets/.." relative to the
// template dir, OR a PROJECT_ROOT-relative editor pick) to an absolute file.
function resolveMediaAbs({ path, templateDir, projectRoot }) {
  if (!path) return null;
  const rel = String(path).replace(/^\.\//, "");
  const a = join(templateDir, rel);
  if (existsSync(a)) return a;
  const b = join(projectRoot, String(path));
  if (existsSync(b)) return b;
  return null;
}

// Does this layer config have a VIDEO background? (The discriminator the editor /
// run-campaign use to route here instead of the PNG path.)
export function configHasVideoBackground(config) {
  return !!(config && config.media && config.media.path && VID_RE.test(String(config.media.path)));
}

// Multi-clip reel: config.sequence is an array of segments, each with its own
// media (clip + trim/loop) + per-segment elements/fixedDesign (captions/shapes).
// The render keys on THIS first (config.media in a reel is only the editor's edit
// subject). True when at least one segment has a video clip.
export function configHasSequence(config) {
  return !!(config && Array.isArray(config.sequence) && config.sequence.length >= 1
    && config.sequence.some((s) => s && s.media && s.media.path && VID_RE.test(String(s.media.path))));
}

// One segment's OUTPUT duration — mirrors the single-clip winLen/D rule
// (loop ? loopSeconds : trim length), so a short clip can loop to fill a slot.
function segmentDuration(seg) {
  const m = (seg && seg.media) || {};
  const cs = Math.max(0, Number(m.clipStart ?? m.videoStartTime) || 0);
  const ce = (typeof m.clipEnd === "number" && m.clipEnd > cs) ? m.clipEnd : null;
  const winLen = Math.max(1, Math.min(30, (ce != null ? (ce - cs) : null) || Number(m.durationSeconds) || 6));
  const looping = !!(m.loop && Number(m.loopSeconds) > 0);
  return looping ? Math.max(1, Math.min(30, Number(m.loopSeconds))) : winLen;
}

// ── renderLayerConfigVideo ───────────────────────────────────────────────────
//  opts:
//    id           output basename → out/<id>.mp4 (or .gif)
//    config       the layer config object (cloned internally; media stripped from
//                 the overlay copy so LayerStack doesn't try to <img>-render the
//                 frame directory — the bg is rendered separately as TrimmedMedia)
//    templateDir  dir the config's ./assets/.. resolve against
//    projectRoot  for PROJECT_ROOT-relative editor picks (default the repo root)
//    outDir       default <projectRoot>/out
//    width/height/fps  default 1080/1920/30 (overridden by config.width/height)
//    duration     seconds; default = clip span, else config.durationSeconds, else 6
//    audio        { src, startAt?, volume?, fadeIn?, fadeOut? } | null
//    wantGif      convert the MP4 → GIF afterward
//    keepStaging  leave the staging dir (debug)
//  Returns { ok, produced, ext, reason, stagingDir }. Never throws on a render
//  failure (returns ok:false + a reason) — only on a programmer/precondition error.
export async function renderLayerConfigVideo(opts) {
  const {
    id, config, templateDir,
    projectRoot = PROJECT_ROOT,
    outDir = join(PROJECT_ROOT, "out"),
    fps = 30,
    duration = null,
    audio = null,
    wantGif = false,
    keepStaging = false,
  } = opts;
  if (!id) throw new Error("renderLayerConfigVideo: id required");
  if (!config || typeof config !== "object") throw new Error("renderLayerConfigVideo: config object required");
  if (!templateDir) throw new Error("renderLayerConfigVideo: templateDir required");

  const W = Number(config.width) || 1080;
  const H = Number(config.height) || 1920;

  // ── 1) resolve the background video ──────────────────────────────────────
  const media = config.media || {};
  if (!configHasVideoBackground(config)) {
    return { ok: false, reason: "config has no video background (config.media.path is not a video)", stagingDir: null };
  }
  const absBg = resolveMediaAbs({ path: media.path, templateDir, projectRoot });
  if (!absBg) {
    return { ok: false, reason: `background video not found on disk: ${media.path}`, stagingDir: null };
  }

  // ── 2) duration + trim window ────────────────────────────────────────────
  const cs = Math.max(0, Number(media.clipStart ?? media.videoStartTime) || 0);
  const ceRaw = media.clipEnd;
  const ce = (typeof ceRaw === "number" && ceRaw > cs) ? ceRaw : null;
  // winLen = the trimmed SLICE we extract to frames; D = the OUTPUT length. Normally
  // they're equal. When media.loop is on, D = media.loopSeconds can EXCEED winLen and
  // the frame-sync driver wraps (loops) the winLen frames to fill D — so a short clip
  // becomes a longer looped video with no extra frames captured.
  let winLen = Number(duration) || (ce != null ? (ce - cs) : null) || Number(config.durationSeconds) || 6;
  winLen = Math.max(1, Math.min(30, winLen)); // floor 1s, cap 30s so a long source can't OOM the capture
  const looping = !!(media.loop && Number(media.loopSeconds) > 0);
  let D = looping ? Math.max(1, Math.min(30, Number(media.loopSeconds))) : winLen;
  const totalFrames = Math.round(D * fps);

  // ── 3) staging dir ───────────────────────────────────────────────────────
  const stagingDir = join(outDir, "_layer-video", id);
  rmSync(stagingDir, { recursive: true, force: true });
  mkdirSync(stagingDir, { recursive: true });

  // 3a) runtime: animations.jsx (mandatory) + editing.jsx (TrimmedMedia).
  const animationsPath = join(RUNTIME_DIR, "animations.jsx");
  if (!existsSync(animationsPath)) {
    return { ok: false, reason: `missing runtime ${animationsPath}`, stagingDir };
  }
  copyFileSync(animationsPath, join(stagingDir, "animations.jsx"));
  const editingPath = join(RUNTIME_DIR, "editing.jsx");
  if (existsSync(editingPath)) copyFileSync(editingPath, join(stagingDir, "editing.jsx"));

  // 3b) elements/: the static overlay renderers (_helpers, export-stripped) and,
  //     when there's audio, MusicSync — both auto-loaded by the renderer.
  const elementsDir = join(stagingDir, "elements");
  mkdirSync(elementsDir, { recursive: true });
  if (!existsSync(HELPERS_PATH)) {
    return { ok: false, reason: `missing ${HELPERS_PATH}`, stagingDir };
  }
  writeFileSync(join(elementsDir, "_helpers.jsx"), transformHelpersForScript(readFileSync(HELPERS_PATH, "utf8")));

  // 3c) the template's assets/ so overlay ./assets/.. (cutouts, imageFill) resolve.
  const srcAssets = join(templateDir, "assets");
  if (existsSync(srcAssets)) {
    try { cpSync(srcAssets, join(stagingDir, "assets"), { recursive: true }); } catch { /* best-effort */ }
  }

  // ── 4) extract the bg video → PNG frames (trimmed + capped to D) ─────────
  const bgFramesDir = join(stagingDir, `${id}.bgframes`);
  mkdirSync(bgFramesDir, { recursive: true });
  const ffArgs = ["-y", "-loglevel", "error"];
  if (cs > 0) ffArgs.push("-ss", String(cs));
  ffArgs.push("-i", absBg, "-t", String(winLen), "-vf", `fps=${fps}`, join(bgFramesDir, "%05d.png"));
  const ff = spawnSync("ffmpeg", ffArgs, { encoding: "utf8" });
  const frameCount = ff.status === 0
    ? readdirSync(bgFramesDir).filter((f) => f.endsWith(".png")).length
    : 0;
  if (frameCount === 0) {
    const tail = String(ff.stderr || ff.error?.message || "").trim().split(/\r?\n/).filter(Boolean).slice(-3).join(" | ");
    return { ok: false, reason: `bg frame extraction failed: ${tail || "no frames produced"}`, stagingDir };
  }
  const bgFramesInfo = { base: `./${id}.bgframes/`, count: frameCount, fps, key: "bg" };

  // ── 5) build the wrapper JSX ─────────────────────────────────────────────
  // Overlay config = the layer config MINUS its media (the bg is rendered
  // separately as TrimmedMedia; leaving media in would make LayerStack <img>-
  // render the frames directory and show a broken/black box).
  const overlayConfig = { ...config };
  delete overlayConfig.media;

  const wrapGlobal = "LayerVideoWrapper";
  // NOTE: audio is NOT rendered in the wrapper. <MusicSync> only plays during a
  // LIVE preview (and would paint its "click to enable audio" badge into every
  // captured frame, since the headless render never gets a user gesture). The
  // actual sound is muxed into the finished MP4 by ffmpeg below — that's the only
  // audio path for the render. The live audition is the editor's audio picker.

  // ORDER MATTERS (landmine): the renderer's detectVariationGlobal picks the FIRST
  // `window.<Name> = <identifier>` in the file as the component to mount. The bg-sync
  // patch contains `window.__videoSyncPatched = true` (true reads as an identifier!),
  // so the wrapper's own `window.${wrapGlobal} = ${wrapGlobal}` MUST come BEFORE the
  // patch — otherwise the renderer mounts the boolean `true` and the whole tree dies
  // ("React.createElement type is invalid — got: boolean"). run-campaign's motion
  // wrapper registers its global before the patch for the same reason.
  const wrapper = `// AUTO-GENERATED Phase-C video wrapper — DO NOT EDIT (regenerated by layer-config-video.mjs).
// Renders the editor's layer config over a real video background → MP4.
var __OVERLAY_CONFIG__ = ${JSON.stringify(overlayConfig)};
var __BG_BASE__ = ${JSON.stringify(bgFramesInfo.base)};

function ${wrapGlobal}() {
  var TrimmedMedia = window.TrimmedMedia;
  var LayerStack = window.LayerStack;
  return (
    <Stage width={${W}} height={${H}} duration={${D}} fps={${fps}} background="#0a0b0d">
      {TrimmedMedia
        ? <TrimmedMedia src={__BG_BASE__} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        : <img data-bgframe="1" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      {LayerStack
        ? <LayerStack config={__OVERLAY_CONFIG__} background="transparent" />
        : null}
    </Stage>
  );
}
// Registered FIRST (before the sync patch) so detectVariationGlobal mounts the wrapper.
window.${wrapGlobal} = ${wrapGlobal};

// Pre-extracted background frames + the deterministic frame-sync driver.
window.__bgFrames = ${JSON.stringify(bgFramesInfo)};
${BG_SYNC_PATCH}
`;
  const wrapperPath = join(stagingDir, `${id}.jsx`);
  writeFileSync(wrapperPath, wrapper);

  // ── 6) render → out/<id>.mp4 ─────────────────────────────────────────────
  mkdirSync(outDir, { recursive: true });
  for (const ext of [".mp4", ".gif"]) rmSync(join(outDir, `${id}${ext}`), { force: true });

  const r = spawnSync("node", [RENDERER, wrapperPath], {
    cwd: projectRoot, encoding: "utf8", timeout: RENDER_TIMEOUT_MS,
  });
  void totalFrames;
  if (r.error) {
    if (!keepStaging) rmSync(stagingDir, { recursive: true, force: true });
    return { ok: false, reason: `renderer spawn error: ${r.error.message}`, stagingDir };
  }
  if (r.status !== 0) {
    const tail = `${r.stderr || ""}`.trim().split("\n").slice(-5).join(" | ");
    if (!keepStaging) rmSync(stagingDir, { recursive: true, force: true });
    return { ok: false, reason: `renderer exit ${r.status}: ${tail}`, stagingDir };
  }
  const producedMp4 = join(outDir, `${id}.mp4`);
  if (!existsSync(producedMp4)) {
    if (!keepStaging) rmSync(stagingDir, { recursive: true, force: true });
    return { ok: false, reason: `renderer ok but out/${id}.mp4 not found`, stagingDir };
  }

  // ── 7) audio mux (the render itself is silent — Stage captures playing:false,
  //      and the bg is extracted to silent PNG frames). Two sources, in priority:
  //      a separate picked track (MusicSync / A2) wins; else the clip's OWN audio
  //      when the editor's "Clip audio" toggle set config.media.audio = true.
  if (audio && audio.src) {
    const muxed = muxAudioIntoVideo({ videoPath: producedMp4, audio, duration: D, projectRoot, templateDir });
    if (!muxed.ok) console.error(`[layer-video]   note: ${id} audio mux skipped — ${muxed.reason}`);
  } else if (media.audio) {
    // Native clip audio: the bg clip is its own audio source, trimmed to the same
    // [clipStart, clipStart+D] window the frames came from. Small fade-out avoids a
    // hard cut at the loop point.
    const clipAudio = { src: media.path, startAt: cs, volume: 1.0, fadeIn: 0, fadeOut: 0.3 };
    // When looping, the clip's own audio repeats in step with the picture (the [cs, cs+winLen]
    // slice looped to fill D); otherwise it plays once over D (= winLen).
    const muxed = muxAudioIntoVideo({ videoPath: producedMp4, audio: clipAudio, duration: D, loopSlice: looping ? winLen : 0, projectRoot, templateDir });
    if (!muxed.ok) console.error(`[layer-video]   note: ${id} native clip-audio mux skipped — ${muxed.reason}`);
  }

  // ── 8) optional GIF ──────────────────────────────────────────────────────
  let produced = producedMp4;
  let ext = "mp4";
  if (wantGif) {
    const gif = join(outDir, `${id}.gif`);
    const okGif = mp4ToGif(producedMp4, gif);
    if (okGif && existsSync(gif)) {
      rmSync(producedMp4, { force: true });
      produced = gif; ext = "gif";
    } else {
      if (!keepStaging) rmSync(stagingDir, { recursive: true, force: true });
      return { ok: false, reason: "gif conversion failed", stagingDir };
    }
  }

  if (!keepStaging) rmSync(stagingDir, { recursive: true, force: true });
  return { ok: true, produced, ext, reason: "ok", stagingDir };
}

// Mux an audio track into a finished MP4. The video render is silent (the Stage
// captures with playing:false), so this is the ONLY audio path for the creative.
// We honor the same startAt/volume/fade fields MusicSync uses, trim the audio to
// the video duration, and copy the video stream untouched (re-encode audio only).
function muxAudioIntoVideo({ videoPath, audio, duration, loopSlice, projectRoot, templateDir }) {
  const absAudio = resolveMediaAbs({ path: audio.src, templateDir, projectRoot });
  if (!absAudio) return { ok: false, reason: `audio not found: ${audio.src}` };
  const startAt = Math.max(0, Number(audio.startAt) || 0);
  const volume = audio.volume != null ? Number(audio.volume) : 0.85;
  const fadeIn = audio.fadeIn != null ? Number(audio.fadeIn) : 1.0;
  const fadeOut = audio.fadeOut != null ? Number(audio.fadeOut) : 1.5;
  const af = [];
  if (fadeIn > 0) af.push(`afade=t=in:st=0:d=${fadeIn}`);
  if (fadeOut > 0) af.push(`afade=t=out:st=${Math.max(0, duration - fadeOut)}:d=${fadeOut}`);
  af.push(`volume=${volume}`);
  const tmp = videoPath.replace(/\.mp4$/i, ".muxed.mp4");
  const loopLen = Number(loopSlice) > 0 ? Number(loopSlice) : 0;
  let sliceFile = null;
  let args;
  if (loopLen > 0) {
    // Loop the clip's [startAt, startAt+loopLen] audio slice to fill `duration`, so the
    // sound repeats in step with the looping picture. Pre-extract the slice (so -ss is
    // applied once), then -stream_loop it; -t caps the output to `duration`.
    sliceFile = videoPath.replace(/\.mp4$/i, ".aslice.m4a");
    const exSlice = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(startAt), "-t", String(loopLen), "-i", absAudio, "-vn", "-c:a", "aac", "-b:a", "192k", sliceFile], { encoding: "utf8" });
    if (exSlice.status !== 0 || !existsSync(sliceFile)) {
      rmSync(sliceFile, { force: true });
      return { ok: false, reason: "audio slice extract failed" };
    }
    args = ["-y", "-loglevel", "error", "-i", videoPath, "-stream_loop", "-1", "-i", sliceFile, "-t", String(duration),
      "-filter:a", af.join(","),
      "-map", "0:v:0", "-map", "1:a:0",
      "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", tmp];
  } else {
    args = ["-y", "-loglevel", "error", "-i", videoPath];
    if (startAt > 0) args.push("-ss", String(startAt));
    args.push("-i", absAudio, "-t", String(duration),
      "-filter:a", af.join(","),
      "-map", "0:v:0", "-map", "1:a:0",
      "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", tmp);
  }
  const ex = spawnSync("ffmpeg", args, { encoding: "utf8" });
  if (sliceFile) rmSync(sliceFile, { force: true });
  if (ex.status !== 0 || !existsSync(tmp)) {
    const tail = String(ex.stderr || ex.error?.message || "").trim().split(/\r?\n/).filter(Boolean).slice(-2).join(" | ");
    rmSync(tmp, { force: true });
    return { ok: false, reason: tail || "ffmpeg mux failed" };
  }
  rmSync(videoPath, { force: true });
  try { copyFileSync(tmp, videoPath); rmSync(tmp, { force: true }); } catch (e) { return { ok: false, reason: e.message }; }
  return { ok: true };
}

function mp4ToGif(mp4Path, gifPath) {
  // Two-pass palette for a clean GIF (same recipe run-campaign uses).
  const palette = gifPath.replace(/\.gif$/i, ".palette.png");
  const p1 = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4Path,
    "-vf", "fps=15,scale=540:-1:flags=lanczos,palettegen", palette], { encoding: "utf8" });
  if (p1.status !== 0) return false;
  const p2 = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mp4Path, "-i", palette,
    "-lavfi", "fps=15,scale=540:-1:flags=lanczos[x];[x][1:v]paletteuse", gifPath], { encoding: "utf8" });
  rmSync(palette, { force: true });
  return p2.status === 0;
}

// ── renderMultiClipSequence ──────────────────────────────────────────────────
//  Stitch config.sequence[] into ONE reel: render each segment via the existing
//  single-clip path (SILENT — per-seg captions baked, no per-seg audio), ffmpeg
//  concat-demuxer them (identical codec/fps/dims → clean -c copy, no re-encode),
//  then mux ONE master track (config.audio) over the whole reel. Hard cuts (v1).
//  Returns the same shape as renderLayerConfigVideo ({ ok, produced, ext, reason }).
export async function renderMultiClipSequence(opts) {
  const {
    id, config, templateDir,
    projectRoot = PROJECT_ROOT,
    outDir = join(PROJECT_ROOT, "out"),
    fps = 30,
    audio = null,
    wantGif = false,
  } = opts;
  if (!id) throw new Error("renderMultiClipSequence: id required");
  if (!templateDir) throw new Error("renderMultiClipSequence: templateDir required");
  const segs = (config && Array.isArray(config.sequence)) ? config.sequence : [];
  if (!segs.length) return { ok: false, reason: "config.sequence is empty", stagingDir: null };

  mkdirSync(outDir, { recursive: true });
  const segFiles = [];
  let reelTotal = 0;
  const cleanup = () => segFiles.forEach((f) => { try { rmSync(f, { force: true }); } catch (_) {} });

  // 1) render each segment to its own SILENT mp4 (captions baked per segment)
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];
    if (!seg || !seg.media || !seg.media.path) { cleanup(); return { ok: false, reason: `segment ${i + 1} has no media`, stagingDir: null }; }
    const segId = `${id}__seg${i + 1}`;
    const segConfig = {
      width: config.width, height: config.height,
      media: seg.media,
      elements: Array.isArray(seg.elements) ? seg.elements : [],
      fixedDesign: Array.isArray(seg.fixedDesign) ? seg.fixedDesign : [],
      // NO audio here — the master track is muxed once over the whole reel below.
    };
    const r = await renderLayerConfigVideo({ id: segId, config: segConfig, templateDir, projectRoot, outDir, fps, audio: null });
    if (!r.ok) { cleanup(); return { ok: false, reason: `segment ${i + 1} render failed: ${r.reason}`, stagingDir: null }; }
    segFiles.push(join(outDir, `${segId}.mp4`));
    reelTotal += segmentDuration(seg);
  }

  // 2) concat-demuxer the silent segments → out/<id>.mp4 (stream copy, no re-encode)
  const listFile = join(outDir, `${id}.concat.txt`);
  writeFileSync(listFile, segFiles.map((f) => `file '${f.replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n") + "\n");
  const reelOut = join(outDir, `${id}.mp4`);
  const cc = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", reelOut], { encoding: "utf8" });
  rmSync(listFile, { force: true });
  cleanup();
  if (cc.status !== 0 || !existsSync(reelOut)) {
    const tail = String(cc.stderr || cc.error?.message || "").trim().split(/\r?\n/).filter(Boolean).slice(-2).join(" | ");
    return { ok: false, reason: "concat failed: " + (tail || "ffmpeg"), stagingDir: null };
  }

  // 3) ONE master track over the whole reel (config.audio); silent if absent.
  if (audio && audio.src) {
    const m = muxAudioIntoVideo({ videoPath: reelOut, audio, duration: reelTotal, loopSlice: 0, projectRoot, templateDir });
    if (!m.ok) return { ok: false, reason: "master audio mux failed: " + m.reason, stagingDir: null };
  }

  // 4) optional GIF
  let produced = reelOut, ext = "mp4";
  if (wantGif) {
    const gif = reelOut.replace(/\.mp4$/i, ".gif");
    if (mp4ToGif(reelOut, gif)) { rmSync(reelOut, { force: true }); produced = gif; ext = "gif"; }
    else return { ok: false, reason: "gif conversion failed", stagingDir: null };
  }
  return { ok: true, produced, ext, reason: "ok", segments: segs.length, reelTotal, stagingDir: null };
}

// ── CLI (the Phase-C spike): node layer-config-video.mjs <config.json> [--id=…] ──
//   <config.json> is a layer config whose media.path is a video. The CLI resolves
//   ./assets/.. against the config's own folder.
function mainCli() {
  const args = process.argv.slice(2);
  const configPath = args.find((a) => !a.startsWith("--"));
  if (!configPath) {
    console.error("Usage: node layer-config-video.mjs <config.json> [--id=slug] [--duration=6] [--gif] [--keep]");
    process.exit(1);
  }
  const flag = (name, def) => {
    const a = args.find((x) => x.startsWith(`--${name}=`));
    return a ? a.slice(name.length + 3) : def;
  };
  const absConfig = resolve(configPath);
  if (!existsSync(absConfig)) { console.error(`config not found: ${absConfig}`); process.exit(1); }
  const config = JSON.parse(readFileSync(absConfig, "utf8"));
  const templateDir = dirname(absConfig);
  const id = flag("id", basename(absConfig).replace(/\.config\.json$|\.json$/i, ""));
  // Audio rides along on the config (the editor's A2 picker writes
  // config.audio = { src, startAt, volume, fadeIn, fadeOut }). Silent if absent.
  const cfgAudio = (config && config.audio && config.audio.src) ? config.audio : null;
  // A reel (config.sequence) routes to the multi-clip renderer; else the single clip.
  const task = configHasSequence(config)
    ? renderMultiClipSequence({ id, config, templateDir, audio: cfgAudio, wantGif: args.includes("--gif") })
    : renderLayerConfigVideo({
        id, config, templateDir,
        duration: flag("duration") ? Number(flag("duration")) : null,
        audio: cfgAudio,
        wantGif: args.includes("--gif"),
        keepStaging: args.includes("--keep"),
      });
  task.then((res) => {
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.ok ? 0 : 1);
  }).catch((e) => {
    console.error(e.stack || e.message);
    process.exit(1);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mainCli();
}

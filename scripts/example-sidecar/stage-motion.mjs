// ============================================================================
//  scripts/example-sidecar/stage-motion.mjs — Track B, round-2 motion staging
// ============================================================================
//  PROBLEM this solves. The brand motion videos in brand/video-templates/templates/
//  (stat-reveal, manifesto, three-mistakes, …) are FULLY-PRODUCED motion graphics —
//  they build their own elements, lay out the whole frame, animate on-screen text
//  and do transitions. We want to wire the most varied of them in AS distinctness-
//  proven video EXAMPLES (not templates). But they were authored to run INSIDE the
//  review.html harness: they use the full runtime (useTime / Easing / TplText, and
//  for some, elements/* + editing.jsx) and they do NOT self-wrap in <Stage> — the
//  harness supplies Stage + the timeline. Rendered standalone they freeze at t=0.
//
//  WHAT this does. For one source motion file it assembles a per-example STAGING DIR
//  that the jsx-to-mp4 *shipped* renderer can resolve (claude-design.mjs requires a
//  sibling animations.jsx; it also auto-loads editing.jsx + every elements/*.jsx):
//    templates/_examples/_staging/<id>/
//      animations.jsx          (copied verbatim from brand/video-templates/)
//      editing.jsx             (copied — only when the source needs it; it carries a
//                               raw <video>, so we omit it for clip-free sources)
//      elements/*.jsx          (copied — only when the source references an element)
//      <id>.jsx                (the WRAPPER: a <Stage> that owns the timeline, with
//                               the source inlined verbatim BELOW it)
//      <id>.data.json          (optional curated `data` prop → window.__CONFIG__)
//  then runs render.mjs on the wrapper → out/<id>.mp4. The wrapper is registered as
//  window.<GLOBAL> FIRST in the file so claude-design.mjs's detectVariationGlobal +
//  classify.mjs's extractStageProps both read the WRAPPER (its <Stage> supplies the
//  width/height/duration and, crucially, the timeline useTime() needs).
//
//  The staging dir is gitignored scratch; only the resulting <id>.mp4 (+ the poster
//  png extracted downstream by render-examples.mjs's finalizeVideo) is committed.
//  Co-locating the runtime in a THROWAWAY dir — never in templates/_examples/ — is
//  what keeps the 45 statics' render path and the raw-<video> validator untouched
//  (the round-1 A-2 concern).
//
//  Node-only. Pure-ish: the one side effect is writing the staging dir + invoking
//  the renderer. Exposed as a function (stageAndRender) AND a CLI for the spike.
// ============================================================================

import { spawnSync } from "node:child_process";
import {
  existsSync, mkdirSync, rmSync, readFileSync, writeFileSync,
  copyFileSync, readdirSync,
} from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { EXAMPLES_DIR } from "../lib/example-library.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const RENDERER = join(ROOT, ".claude", "skills", "jsx-to-mp4", "scripts", "render.mjs");
const OUT_DIR = join(ROOT, "out");
const RUNTIME_DIR = join(ROOT, "brand", "video-templates");
const STAGING_ROOT = join(ROOT, EXAMPLES_DIR, "_staging");
const RENDER_TIMEOUT_MS = 180000; // motion renders are 30fps × N seconds — heavier than a static frame

// Detect the component the source registers on window: `window.Foo = Foo;`. Returns
// the global name (which is also the in-scope function name) or null. Mirrors
// claude-design.mjs detectVariationGlobal, kept local so this module is standalone.
export function detectSourceGlobal(src) {
  const m = src.match(/window\.([A-Za-z_$][\w$]*)\s*=\s*[A-Za-z_$][\w$]*\s*;?/);
  return m ? m[1] : null;
}

// Which of brand/video-templates/elements/*.jsx the source touches, so we copy only
// what it needs (keeps the staging dir minimal + the render light). We match a
// `window.<Element>` reference in the source against each element file's registered
// global. Conservative: if unsure, a caller can force-copy all via opts.copyAllElements.
function elementsNeededBy(src) {
  const elementsDir = join(RUNTIME_DIR, "elements");
  if (!existsSync(elementsDir)) return [];
  const needed = [];
  for (const f of readdirSync(elementsDir).filter((n) => /\.(jsx|tsx)$/.test(n))) {
    const g = detectSourceGlobal(readFileSync(join(elementsDir, f), "utf8"));
    if (g && new RegExp(`\\b${g}\\b`).test(src)) needed.push(f);
  }
  return needed;
}

// Does the source need editing.jsx? editing.jsx provides TrimmedMedia / SyncedVideo
// (clip compositing) and the editor drop-zones — and it carries a raw <video>. The
// pure motion runtime (useTime/Easing/TplText/Stage) lives in animations.jsx, so a
// clip-free source does NOT need editing.jsx. We copy it only when the source
// references one of editing.jsx's globals.
function needsEditing(src) {
  const editingPath = join(RUNTIME_DIR, "editing.jsx");
  if (!existsSync(editingPath)) return false;
  // The components editing.jsx exposes that a template would use directly.
  return /\b(TrimmedMedia|SyncedVideo)\b/.test(src);
}

// Build the wrapper JSX: the <Stage> (timeline owner) on top so detectVariationGlobal
// + extractStageProps read IT, then the source inlined verbatim below. Function
// declarations hoist, so the wrapper's reference to <SourceComp> resolves even though
// the source appears later in the file.
function buildWrapper({ id, sourceSrc, sourceGlobal, width, height, duration, fps }) {
  const wrapGlobal = "StagedMotionExample";
  const fpsAttr = fps ? ` fps={${fps}}` : "";
  return `// AUTO-STAGED motion example — DO NOT EDIT BY HAND (regenerated by stage-motion.mjs).
// id: ${id}  ·  source global: ${sourceGlobal}
// The <Stage> below OWNS the timeline (without it useTime() freezes at t=0). It is
// registered on window FIRST so the renderer's detectVariationGlobal + extractStageProps
// pick the WRAPPER, not the inlined source component.
function ${wrapGlobal}(props) {
  const data = (props && props.data) || {};
  return (
    <Stage width={${width}} height={${height}} duration={${duration}}${fpsAttr}>
      <${sourceGlobal} data={data} />
    </Stage>
  );
}
window.${wrapGlobal} = ${wrapGlobal};

/* ============================ inlined source (verbatim) ============================ */
${sourceSrc}
`;
}

// Stage one source motion file and render it to out/<id>.mp4.
//   opts: { id, sourcePath, width?, height?, duration?, fps?, data?, brand?,
//           copyAllElements? }
// Returns { ok, mp4, stagingDir, reason }. Never throws on a render failure (returns
// ok:false with a reason tail) — only throws on a programmer/precondition error.
export function stageAndRender(opts) {
  const {
    id, sourcePath,
    width = 1080, height = 1920, duration = 6, fps = 30,
    data = null, brand = null, copyAllElements = false,
  } = opts;
  if (!id) throw new Error("stageAndRender: id required");
  const absSource = resolve(ROOT, sourcePath);
  if (!existsSync(absSource)) throw new Error(`stageAndRender: source not found: ${sourcePath}`);

  const sourceSrc = readFileSync(absSource, "utf8");
  const sourceGlobal = detectSourceGlobal(sourceSrc);
  if (!sourceGlobal) {
    throw new Error(`stageAndRender: source ${sourcePath} does not register window.<Name> = <Name>`);
  }

  // Fresh staging dir for this id.
  const stagingDir = join(STAGING_ROOT, id);
  rmSync(stagingDir, { recursive: true, force: true });
  mkdirSync(stagingDir, { recursive: true });

  // 1) runtime: animations.jsx is mandatory (Stage/useTime/Easing/TplText live there).
  const animationsPath = join(RUNTIME_DIR, "animations.jsx");
  if (!existsSync(animationsPath)) throw new Error(`stageAndRender: missing ${animationsPath}`);
  copyFileSync(animationsPath, join(stagingDir, "animations.jsx"));

  // 2) editing.jsx only when the source needs it (it carries a raw <video>).
  if (needsEditing(sourceSrc)) {
    copyFileSync(join(RUNTIME_DIR, "editing.jsx"), join(stagingDir, "editing.jsx"));
  }

  // 3) elements/* the source references (or all, if forced).
  const elementsSrcDir = join(RUNTIME_DIR, "elements");
  const elems = copyAllElements
    ? (existsSync(elementsSrcDir) ? readdirSync(elementsSrcDir).filter((n) => /\.(jsx|tsx)$/.test(n)) : [])
    : elementsNeededBy(sourceSrc);
  if (elems.length) {
    const destEl = join(stagingDir, "elements");
    mkdirSync(destEl, { recursive: true });
    for (const f of elems) copyFileSync(join(elementsSrcDir, f), join(destEl, f));
  }

  // 4) wrapper jsx (named <id>.jsx so render.mjs writes out/<id>.mp4).
  const wrapperPath = join(stagingDir, `${id}.jsx`);
  writeFileSync(wrapperPath, buildWrapper({ id, sourceSrc, sourceGlobal, width, height, duration, fps }));

  // 5) optional curated data → sibling <id>.data.json (renderer feeds it as `data`).
  if (data && typeof data === "object") {
    writeFileSync(join(stagingDir, `${id}.data.json`), JSON.stringify(data, null, 2));
  }

  // 6) render. Clean only this id's prior out/ artifacts first (never the whole dir).
  for (const ext of [".png", ".mp4"]) rmSync(join(OUT_DIR, `${id}${ext}`), { force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  // window.__BRAND__ is read by some templates (e.g. stat-reveal's brand_red). The
  // renderer has no hook to inject it, so we bake an optional brand into the wrapper's
  // data.json AND, when a brand is given, prepend a tiny bootstrap to animations.jsx's
  // consumer via the data path is not enough — instead we rely on the source's
  // built-in AA fallback (#c4141d) which is already on-brand. A non-AA brand override
  // is handled by passing brand-specific copy through `data`, not window.__BRAND__.
  void brand;

  const r = spawnSync("node", [RENDERER, wrapperPath], {
    cwd: ROOT, encoding: "utf8", timeout: RENDER_TIMEOUT_MS,
  });
  if (r.error) return { ok: false, mp4: null, stagingDir, reason: `renderer spawn error: ${r.error.message}` };
  if (r.status !== 0) {
    const tail = `${r.stderr || ""}`.trim().split("\n").slice(-4).join(" | ");
    return { ok: false, mp4: null, stagingDir, reason: `renderer exit ${r.status}: ${tail}` };
  }
  const producedMp4 = join(OUT_DIR, `${id}.mp4`);
  if (!existsSync(producedMp4)) {
    return { ok: false, mp4: null, stagingDir, reason: `renderer ok but out/${id}.mp4 not found` };
  }
  return { ok: true, mp4: producedMp4, stagingDir, reason: "ok" };
}

// ── CLI (the spike): node stage-motion.mjs <sourcePath> [--id=ex-070-foo] [--duration=6] ──
function mainCli() {
  const args = process.argv.slice(2);
  const sourcePath = args.find((a) => !a.startsWith("--"));
  if (!sourcePath) {
    console.error("Usage: node stage-motion.mjs <sourcePath.jsx> [--id=ex-070-slug] [--duration=6] [--width=1080] [--height=1920] [--fps=30] [--all-elements]");
    process.exit(1);
  }
  const flag = (name, def) => {
    const a = args.find((x) => x.startsWith(`--${name}=`));
    return a ? a.slice(name.length + 3) : def;
  };
  const id = flag("id", `ex-zzz-${basename(sourcePath).replace(/\.(jsx|tsx)$/, "")}`);
  const res = stageAndRender({
    id,
    sourcePath,
    width: Number(flag("width", 1080)),
    height: Number(flag("height", 1920)),
    duration: Number(flag("duration", 6)),
    fps: Number(flag("fps", 30)),
    copyAllElements: args.includes("--all-elements"),
  });
  console.log(JSON.stringify(res, null, 2));
  process.exit(res.ok ? 0 : 1);
}

// Run the CLI only when invoked directly (Windows-safe: compare file URLs).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mainCli();
}

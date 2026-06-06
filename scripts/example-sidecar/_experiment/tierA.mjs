// Tier A render driver — duotone (T4) + inset size-sweep (T5).
// Injects media into the 5 graphic host designs under several treatments, renders each,
// records paths in render-manifest.json for measure.py. Reuses the static renderer.
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const EX = join(ROOT, "templates", "_examples");
const NAMED = join(ROOT, "brand", "aa-design-system", "project", "assets");
const DUO = join(HERE, "duotone");
const RENDER = join(ROOT, ".claude", "skills", "jsx-to-mp4", "scripts", "render.mjs");
const OUT = join(ROOT, "out");
const WORK = join(HERE, "_work"); const WASSETS = join(WORK, "assets");
const RUNS = join(HERE, "runs");
const MANIFEST = join(HERE, "render-manifest.json");
const W = 1080, H = 1920;

const HOSTS = [
  { d: "giant-stat", id: "ex-001-giant-stat" },
  { d: "metric-reveal", id: "ex-002-metric-reveal" },
  { d: "quote-card", id: "ex-004-quote-card" },
  { d: "list-steps", id: "ex-008-list-steps" },
  { d: "timeline-schedule", id: "ex-014-timeline-schedule" },
];
const DIFF = ["photo-jump-male.jpg", "photo-agility-female.jpg", "photo-box-jump.jpg", "photo-lifting.jpg", "photo-medball-female.jpg"];
const SAME = "photo-jump-male.jpg";

rmSync(WORK, { recursive: true, force: true }); mkdirSync(WASSETS, { recursive: true });
mkdirSync(RUNS, { recursive: true });

const fullbleed = (ref, scrim) => `\n      <img src="${ref}" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />\n      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,${scrim})" }} />`;
function insetCard(ref, areaFrac) {
  const h = Math.min(1700, Math.round(Math.sqrt(areaFrac * W * H / 0.75)));
  const w = Math.round(0.75 * h);
  return `\n      <div style={{ position: "absolute", right: 64, bottom: 64, width: ${w}, height: ${h}, borderRadius: 18, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.5)", border: "5px solid #fff" }}><img src="${ref}" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>`;
}

function build(hostId, mode, ref, opt) {
  let src = readFileSync(join(EX, `${hostId}.jsx`), "utf8");
  if (mode === "fullbleed") { const i = src.indexOf("}}>"); src = src.slice(0, i + 3) + fullbleed(ref, 0.45) + src.slice(i + 3); }
  else if (mode === "duotone") { const i = src.indexOf("}}>"); src = src.slice(0, i + 3) + fullbleed(ref, 0.18) + src.slice(i + 3); }
  else if (mode === "inset") { const j = src.lastIndexOf("    </div>"); src = src.slice(0, j) + insetCard(ref, opt) + "\n" + src.slice(j); }
  return src;
}

const manifest = {};
function record(cond, id, png) { (manifest[cond] = manifest[cond] || {})[id] = png; }

// C0 baseline = the shipped renders
for (const h of HOSTS) record("C0", h.id, join(EX, `${h.id}.png`));

function renderVariant(cond, host, mode, srcImgAbs, opt) {
  const ext = srcImgAbs.endsWith(".png") ? ".png" : ".jpg";
  const refName = `${cond}-${host.id}${ext}`;
  copyFileSync(srcImgAbs, join(WASSETS, refName));
  const jsx = build(host.id, mode, `./assets/${refName}`, opt);
  const vid = `tA-${cond}-${host.id}`;
  writeFileSync(join(WORK, `${vid}.jsx`), jsx);
  const r = spawnSync("node", [RENDER, join(WORK, `${vid}.jsx`)], { cwd: ROOT, encoding: "utf8", timeout: 120000 });
  const produced = join(OUT, `${vid}.png`);
  if (r.status !== 0 || !existsSync(produced)) { process.stderr.write(`  FAIL ${vid}: ${(r.stderr||"").split("\n").slice(-2).join(" ")}\n`); return; }
  mkdirSync(join(RUNS, cond), { recursive: true });
  const dst = join(RUNS, cond, `${host.id}.png`);
  copyFileSync(produced, dst);
  record(cond, host.id, dst);
}

// C1 fullbleed raw SAME · C2 fullbleed raw DIFF
HOSTS.forEach((h, k) => {
  renderVariant("C1", h, "fullbleed", join(NAMED, SAME));
  renderVariant("C2", h, "fullbleed", join(NAMED, DIFF[k]));
});
// C3 duotone SAME · C4 duotone DIFF  (duotone PNGs prebaked in _experiment/duotone)
const duoSame = join(DUO, "photo-jump-male.png");
HOSTS.forEach((h, k) => {
  renderVariant("C3", h, "duotone", duoSame);
  renderVariant("C4", h, "duotone", join(DUO, DIFF[k].replace(".jpg", ".png")));
});
// INSET SIZE SWEEP (area fraction) — all 5 hosts, different photo each
for (const f of [0.11, 0.20, 0.30, 0.40, 0.50]) {
  const key = `SW${String(Math.round(f * 100)).padStart(2, "0")}`;
  HOSTS.forEach((h, k) => renderVariant(key, h, "inset", join(NAMED, DIFF[k]), f));
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
process.stderr.write(`[tierA] wrote render-manifest.json (${Object.keys(manifest).length} conditions)\n`);

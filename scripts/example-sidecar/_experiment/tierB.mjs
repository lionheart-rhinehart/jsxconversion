// Tier B render driver — knockout cutout on brand-color field (C5). Appends to the
// existing render-manifest.json (keeps C0-C4 + sweep). Composites the bg-removed
// athlete (transparent PNG) on an AA-red field, behind the design's text.
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const EX = join(ROOT, "templates", "_examples");
const CUT = join(HERE, "cutout");
const RENDER = join(ROOT, ".claude", "skills", "jsx-to-mp4", "scripts", "render.mjs");
const OUT = join(ROOT, "out");
const WORK = join(HERE, "_work"); const WASSETS = join(WORK, "assets");
const RUNS = join(HERE, "runs");
const MANIFEST = join(HERE, "render-manifest.json");

const HOSTS = [
  { id: "ex-001-giant-stat" }, { id: "ex-002-metric-reveal" }, { id: "ex-004-quote-card" },
  { id: "ex-008-list-steps" }, { id: "ex-014-timeline-schedule" },
];
const DIFF = ["photo-jump-male", "photo-agility-female", "photo-box-jump", "photo-lifting", "photo-medball-female"];

mkdirSync(WASSETS, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
const record = (c, id, p) => (manifest[c] = manifest[c] || {})[id] = p;

// cutout on red field: red bg + transparent athlete anchored bottom, ~64% height, behind text.
const cutoutField = (ref) => `\n      <div style={{ position: "absolute", inset: 0, background: "#c4141d" }} />\n      <img src="${ref}" style={{ position: "absolute", left: 0, right: 0, bottom: 0, margin: "0 auto", height: "64%", objectFit: "contain" }} />`;

HOSTS.forEach((h, k) => {
  const cutPng = join(CUT, `${DIFF[k]}.png`);
  if (!existsSync(cutPng)) { process.stderr.write(`  missing cutout ${cutPng}\n`); return; }
  const refName = `C5-${h.id}.png`;
  copyFileSync(cutPng, join(WASSETS, refName));
  let src = readFileSync(join(EX, `${h.id}.jsx`), "utf8");
  const i = src.indexOf("}}>");
  src = src.slice(0, i + 3) + cutoutField(`./assets/${refName}`) + src.slice(i + 3);
  const vid = `tB-C5-${h.id}`;
  writeFileSync(join(WORK, `${vid}.jsx`), src);
  const r = spawnSync("node", [RENDER, join(WORK, `${vid}.jsx`)], { cwd: ROOT, encoding: "utf8", timeout: 120000 });
  const produced = join(OUT, `${vid}.png`);
  if (r.status !== 0 || !existsSync(produced)) { process.stderr.write(`  FAIL ${vid}\n`); return; }
  mkdirSync(join(RUNS, "C5"), { recursive: true });
  const dst = join(RUNS, "C5", `${h.id}.png`);
  copyFileSync(produced, dst); record("C5", h.id, dst);
});

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
process.stderr.write(`[tierB] appended C5; manifest now ${Object.keys(manifest).length} conditions\n`);

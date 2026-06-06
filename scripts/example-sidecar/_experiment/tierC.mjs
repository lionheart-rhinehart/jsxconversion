// Tier C render driver — contained patterns at human-good sizes: strip (C7, ~20% height),
// split panel (C8, ~45% width), masked circle (C9, ~25% area). Different photo per host.
// Appends to render-manifest.json. NOTE: injection overlaps designs not built for the
// pattern, so these fairly test DISTINCTNESS but not final quality.
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const EX = join(ROOT, "templates", "_examples");
const NAMED = join(ROOT, "brand", "aa-design-system", "project", "assets");
const RENDER = join(ROOT, ".claude", "skills", "jsx-to-mp4", "scripts", "render.mjs");
const OUT = join(ROOT, "out");
const WORK = join(HERE, "_work"); const WASSETS = join(WORK, "assets");
const RUNS = join(HERE, "runs");
const MANIFEST = join(HERE, "render-manifest.json");
const W = 1080, H = 1920;

const HOSTS = [
  { id: "ex-001-giant-stat" }, { id: "ex-002-metric-reveal" }, { id: "ex-004-quote-card" },
  { id: "ex-008-list-steps" }, { id: "ex-014-timeline-schedule" },
];
const DIFF = ["photo-jump-male.jpg", "photo-agility-female.jpg", "photo-box-jump.jpg", "photo-lifting.jpg", "photo-medball-female.jpg"];

mkdirSync(WASSETS, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
const record = (c, id, p) => (manifest[c] = manifest[c] || {})[id] = p;

const strip = (ref) => `\n      <div style={{ position: "absolute", left: 0, right: 0, top: "38%", height: "20%", overflow: "hidden" }}><img src="${ref}" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>`;
const split = (ref) => `\n      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "45%", overflow: "hidden" }}><img src="${ref}" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>`;
function masked(ref) { const d = Math.round(2 * Math.sqrt(0.25 * W * H / Math.PI)); return `\n      <div style={{ position: "absolute", right: 64, bottom: 64, width: ${d}, height: ${d}, borderRadius: "50%", overflow: "hidden", border: "6px solid #fff" }}><img src="${ref}" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>`; }

const PATTERNS = { C7: strip, C8: split, C9: masked };
const asFirst = new Set(["C8"]); // split goes behind text; strip/masked on top

for (const [cond, fn] of Object.entries(PATTERNS)) {
  HOSTS.forEach((h, k) => {
    const refName = `${cond}-${h.id}.jpg`;
    copyFileSync(join(NAMED, DIFF[k]), join(WASSETS, refName));
    let src = readFileSync(join(EX, `${h.id}.jsx`), "utf8");
    const frag = fn(`./assets/${refName}`);
    if (asFirst.has(cond)) { const i = src.indexOf("}}>"); src = src.slice(0, i + 3) + frag + src.slice(i + 3); }
    else { const j = src.lastIndexOf("    </div>"); src = src.slice(0, j) + frag + "\n" + src.slice(j); }
    const vid = `tC-${cond}-${h.id}`;
    writeFileSync(join(WORK, `${vid}.jsx`), src);
    const r = spawnSync("node", [RENDER, join(WORK, `${vid}.jsx`)], { cwd: ROOT, encoding: "utf8", timeout: 120000 });
    const produced = join(OUT, `${vid}.png`);
    if (r.status !== 0 || !existsSync(produced)) { process.stderr.write(`  FAIL ${vid}\n`); return; }
    mkdirSync(join(RUNS, cond), { recursive: true });
    const dst = join(RUNS, cond, `${h.id}.png`);
    copyFileSync(produced, dst); record(cond, h.id, dst);
  });
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
process.stderr.write(`[tierC] appended C7/C8/C9; manifest now ${Object.keys(manifest).length} conditions\n`);

// EXPERIMENT (throwaway): does adding the SAME photo behind each pure-graphic design
// collapse them together in embedding space? Injects a full-bleed bg photo + light
// scrim as the FIRST children of each design's root div (changing nothing else),
// renders each variant. Then _experiment/embed.py measures.
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, copyFileSync as cp } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const EX = join(ROOT, "templates", "_examples");
const RENDER = join(ROOT, ".claude", "skills", "jsx-to-mp4", "scripts", "render.mjs");
const OUT = join(ROOT, "out");
mkdirSync(join(HERE, "assets"), { recursive: true });

// MODE=same → one photo behind all (worst case). MODE=distinct → a different photo each.
const MODE = process.env.MODE || "same";
const A = join(ROOT, "brand", "aa-design-system", "project", "assets");
const SAME = "photo-jump-male.jpg";
const DISTINCT = ["photo-jump-male.jpg", "photo-agility-female.jpg", "photo-box-jump.jpg", "photo-lifting.jpg", "photo-medball-female.jpg", "photo-sprint-mixed.jpg", "photo-conditioning.jpg"];

const IDS = ["ex-001-giant-stat", "ex-002-metric-reveal", "ex-003-kinetic-text", "ex-004-quote-card", "ex-008-list-steps", "ex-014-timeline-schedule", "ex-015-benefit-iconrow"];
process.stderr.write(`[exp] MODE=${MODE}\n`);

IDS.forEach((id, k) => {
  // 'contained' uses a DIFFERENT photo per design (realistic accent); same/distinct = full-bleed.
  const photo = (MODE === "distinct" || MODE === "contained") ? DISTINCT[k % DISTINCT.length] : SAME;
  copyFileSync(join(A, photo), join(HERE, "assets", `${id}.jpg`));
  let src = readFileSync(join(EX, `${id}.jsx`), "utf8");
  if (MODE === "contained") {
    // a small photo CARD (~380x500 ≈ 11% of frame) as an accent, layout otherwise intact.
    const card = `\n      <div style={{ position: "absolute", right: 56, bottom: 56, width: 380, height: 500, borderRadius: 18, overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,0.5)", border: "4px solid #fff" }}><img src="./assets/${id}.jpg" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>\n`;
    const j = src.lastIndexOf("    </div>");
    src = src.slice(0, j) + card + src.slice(j);
  } else {
    const BG = `\n      <img src="./assets/${id}.jpg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />\n      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />`;
    const i = src.indexOf("}}>"); // first = the root div's opening
    src = src.slice(0, i + 3) + BG + src.slice(i + 3);
  }
  const vid = `${id}-bg`;
  writeFileSync(join(HERE, `${vid}.jsx`), src);
  process.stderr.write(`[exp] render ${vid} … `);
  const r = spawnSync("node", [RENDER, join(HERE, `${vid}.jsx`)], { cwd: ROOT, encoding: "utf8", timeout: 120000 });
  process.stderr.write(r.status === 0 && existsSync(join(OUT, `${vid}.png`)) ? "ok\n" : `FAIL ${(r.stderr||"").split("\n").slice(-2).join(" ")}\n`);
});
process.stderr.write("[exp] done. PNGs in out/<id>-bg.png\n");

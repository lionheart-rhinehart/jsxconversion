#!/usr/bin/env node
// Treatment-aware maxChars: a slot's default text was authored to FIT its
// treatment (arch/fontSize/width), so its length is the best capacity proxy.
// Set maxChars = clamp(ceil(len * 1.4), 8..200) for every role'd text slot.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = "templates/multi-sport-foundations";
const files = readdirSync(DIR).filter(
  (f) => /^cluster-[\w]+\.config\.json$/.test(f) && !f.includes(".fill.") && !f.includes(".camp-"),
);
let n = 0;
for (const f of files) {
  const p = join(DIR, f);
  const c = JSON.parse(readFileSync(p, "utf8"));
  let changed = false;
  for (const el of c.elements || []) {
    if (!el.role || typeof el.text !== "string") continue;
    const len = el.text.replace(/\s+/g, " ").trim().length || 1;
    const mc = Math.max(8, Math.min(200, Math.ceil(len * 1.4)));
    if (el.maxChars !== mc) { el.maxChars = mc; changed = true; n++; }
  }
  if (changed) writeFileSync(p, JSON.stringify(c, null, 2) + "\n");
}
console.log(`Retuned maxChars on ${n} role'd slots.`);

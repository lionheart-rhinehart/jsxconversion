// creative-engine/render/probe.mjs
//
// 5.1 — quick machine probe → a CONSERVATIVE recommended pool size.
//
// Each render spawns a headless Chrome (~300–500 MB) + ffmpeg, so "30 at once"
// thrashes/OOMs one laptop. We default small (3–4) and only let the number grow
// if the machine clearly has headroom — never past a hard ceiling. The point is
// to NOT thrash, not to saturate every core.
//
// Heuristic (whichever is SMALLEST wins):
//   - cores - 2          (leave room for the OS + the parent scheduler)
//   - floor(freeRAM / RAM_PER_JOB_GB)   (RAM is the real wall for Chrome)
//   - HARD_CEILING       (never exceed this no matter how big the box is)
// …then floored at 1. Default ceiling 4 keeps us in the plan's "conservative 3–4".

import os from 'node:os';

export const RAM_PER_JOB_GB = 1.0;   // generous: Chrome + ffmpeg + frame PNGs in flight
export const HARD_CEILING = 4;       // the plan's conservative cap; override via env/flag

export function probe({ ceiling = HARD_CEILING, ramPerJobGb = RAM_PER_JOB_GB } = {}) {
  const cores = os.cpus().length;
  const freeGb = os.freemem() / 1e9;
  const totalGb = os.totalmem() / 1e9;

  const byCores = Math.max(1, cores - 2);
  const byRam = Math.max(1, Math.floor(freeGb / ramPerJobGb));
  const recommended = Math.max(1, Math.min(byCores, byRam, ceiling));

  return {
    cores,
    freeGb: Number(freeGb.toFixed(1)),
    totalGb: Number(totalGb.toFixed(1)),
    byCores,
    byRam,
    ceiling,
    recommended,
    reason:
      recommended === ceiling
        ? `capped at conservative ceiling ${ceiling}`
        : recommended === byRam
          ? `RAM-limited (${freeGb.toFixed(1)}GB free / ${ramPerJobGb}GB per job)`
          : `core-limited (${cores} cores - 2)`,
  };
}

const isMain = process.argv[1] && process.argv[1].endsWith('probe.mjs');
if (isMain) {
  const p = probe();
  console.log(JSON.stringify(p, null, 2));
  console.log(`\nrecommended pool size: ${p.recommended}  (${p.reason})`);
}

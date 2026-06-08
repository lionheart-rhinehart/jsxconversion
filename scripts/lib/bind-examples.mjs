// ============================================================================
//  scripts/lib/bind-examples.mjs — stamp each fresh creative with its example
// ============================================================================
//  The generation engine's SELECTION step, run as CODE (not agent prose). The
//  planner assigns each fresh creative an `archetype` (a creative judgment); THIS
//  module fits an actual EXAMPLE (by id) to that archetype + the creative's copy
//  shape via selectExample, and stamps `asset.exampleId` + `asset.archetype` into
//  the plan. The CLI (scripts/bind-examples.mjs) writes the result back; the gate
//  (validate-plan.mjs `exampleBindingAuthentic`) RE-DERIVES this deterministically
//  and blocks if a stamped id ≠ what selection would produce — so the binding is
//  un-forgeable: the gate, not this producer, is the enforcement.
//
//  Pure, never throws, never mutates the input plan (deep-clones). NODE-ONLY
//  (selectExample → copy-resolve is Node-only). Returns:
//    { plan, report: { bound:[{angleId,assetId,exampleId,archetype}],
//                      nulls:[{angleId,assetId,archetype,format,reason}] } }
// ============================================================================

import { selectExample } from "./example-select.mjs";
import { loadExampleIndex } from "./example-library.mjs";

// gif folds to "video" for selection — the index only has static/video examples,
// and a gif renders from a motion/video source. The fold is made explicit in the
// null reason so a no-fit on a gif reads "format gif→video", not a silent mystery.
function selectFormat(assetFormat) {
  return assetFormat === "video" || assetFormat === "gif" ? "video" : "static";
}

export function bindPlanExamples(plan, { library, index } = {}) {
  const idx = index || loadExampleIndex();
  const out = structuredClone(plan);
  const bound = [];
  const nulls = [];
  const usedExampleIds = []; // batch-global variety nudge (selectExample keys off it)

  for (const angle of out.angles || []) {
    for (const asset of angle.assets || []) {
      if (!asset || asset.source !== "fresh") continue;
      const angleId = angle.id;
      const assetId = asset.id;
      const fmt = selectFormat(asset.format);

      if (typeof asset.archetype !== "string" || !asset.archetype.trim()) {
        nulls.push({ angleId, assetId, archetype: null, format: fmt, reason: "no archetype assigned (planner must choose one before selection)" });
        continue;
      }

      const pick = selectExample({ archetype: asset.archetype, asset, library, format: fmt, usedExampleIds }, idx);
      if (!pick) {
        const foldNote = asset.format === "gif" ? " (format gif→video)" : "";
        nulls.push({ angleId, assetId, archetype: asset.archetype, format: fmt, reason: `no fitting example for archetype "${asset.archetype}"${foldNote} — choose another archetype or add an example` });
        continue;
      }

      asset.exampleId = pick.exampleId;
      asset.archetype = pick.archetype; // echo (already equal); keeps plan canonical
      usedExampleIds.push(pick.exampleId);
      bound.push({ angleId, assetId, exampleId: pick.exampleId, archetype: pick.archetype });
    }
  }

  return { plan: out, report: { bound, nulls } };
}

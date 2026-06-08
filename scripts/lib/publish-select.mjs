// ============================================================================
//  scripts/lib/publish-select.mjs — which creatives are safe to publish (pure)
// ============================================================================
//  A creative may be published to Meta ONLY when it is, all three:
//    • APPROVED (asset.status === "approved" in the plan),
//    • RENDERED (the manifest cell rendered cleanly),
//    • PERCEPTUALLY CLEAN (no perceptual BLOCK and no sentinel for it).
//  This is the gate on outward-facing work — a blocked/sentinel-held creative must never
//  reach an ad account. Pure + exported so the exclusions are unit-tested; the CLI prints
//  the selection + per-creative payloads for review, and the actual `ads_create_creative`
//  call is a deliberate, human-authorized MCP action (never fired from a script).
// ============================================================================

const isStr = (v) => typeof v === "string" && v.trim().length > 0;

// Returns { publishable:[{key,angle,asset,format,output,name}], excluded:[{key,reason}] }.
export function selectPublishable({ plan, manifest, perceptual } = {}) {
  const campaign = (plan && plan.campaign) || (manifest && manifest.campaign) || "campaign";
  const cellByKey = new Map();
  for (const c of (manifest && manifest.cells) || []) cellByKey.set(`${c.angle}/${c.asset}`, c);

  // a sentinel (gate couldn't run) holds the ENTIRE campaign — nothing publishes
  const sentinelHeld = !!(perceptual && perceptual.ranOk === false && perceptual.sentinel);
  const percAssets = (perceptual && perceptual.assets) || {};

  const publishable = [], excluded = [];
  for (const angle of (plan && plan.angles) || []) {
    for (const asset of (angle.assets) || []) {
      const key = `${angle.id}/${asset.id}`;
      const cell = cellByKey.get(key);
      let reason = null;
      if (asset.status !== "approved") reason = `not approved (status: ${asset.status || "—"})`;
      else if (!cell || cell.status !== "rendered" || !isStr(cell.output)) reason = "not rendered";
      else if (sentinelHeld) reason = "held by perceptual sentinel (gate couldn't run)";
      else if ((percAssets[key]?.violations || []).some((v) => v.severity === "block")) reason = "perceptual block (off-lane / near-duplicate / slop)";

      if (reason) excluded.push({ key, reason });
      else publishable.push({
        key, angle: angle.id, asset: asset.id,
        format: cell.format || asset.format || "static",
        output: cell.output,
        name: `${campaign}-${angle.id}-${asset.id}`,
      });
    }
  }
  return { publishable, excluded };
}

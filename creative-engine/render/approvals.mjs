// creative-engine/render/approvals.mjs
//
// 5.3 — turn an approved Kraken row into a render job, per the LOCKED embed-row
// contract (keys defined by the Kraken chat — see docs/kraken-editor-mount-handoff.md):
//
//   content_outputs.type     = "embed"
//   approval.content_type    = "embed"
//   content                  = live HTML URL
//   thumbnail_url            = poster PNG
//   metadata: { render:"live-html", live_url, storage_path, storage_bucket, mime_type,
//               tagged_url, tagged_storage_path, asset_base }
//   approvals.overrides (jsonb) = the editor's override bag
//
// We render the TAGGED design (data-edit-* ids) with the override bag applied. The
// contract carries no explicit frame id, so we default to the FIRST .cr-frame in the
// tagged HTML, overridable by metadata.frame_id. (Flagged, not silently assumed.)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// First frame id in a tagged document (document order) — the render default.
export function firstFrameId(taggedHtml) {
  const m = taggedHtml.match(/data-edit-frame="([^"]+)"/);
  return m ? m[1] : null;
}

// Inject `<base href="…">` into a tagged HTML string so its RELATIVE asset refs
// (assets/vid/ad1.mp4, _ds/…css, fonts) resolve against the design's public asset
// prefix once we've copied the HTML off its origin. No-op if the doc already has a
// <base>. This is what makes the contract's `asset_base` actually do its job.
export function injectBase(html, assetBase) {
  if (!assetBase || /<base\b/i.test(html)) return html;
  const tag = `<base href="${assetBase.replace(/"/g, '&quot;')}">`;
  if (/<head[^>]*>/i.test(html)) return html.replace(/<head[^>]*>/i, (m) => m + tag);
  if (/<html[^>]*>/i.test(html)) return html.replace(/<html[^>]*>/i, (m) => m + tag);
  return tag + html;
}

// Default render transport: fetch a tagged-HTML URL to a local file (the poller caches
// it before render-frame opens it). Injectable so the fixture can pass a local file.
// For a REMOTE url we inject `<base href=assetBase>` so relative assets still resolve
// once the HTML lives locally; a local file:// fixture keeps its co-located assets, so
// it passes through untouched. fileURLToPath is Windows-correct (drive letter + %20).
export async function fetchToFile(url, destDir, { assetBase } = {}) {
  if (/^file:/i.test(url)) return fileURLToPath(url);
  if (!/^https?:/i.test(url)) return path.resolve(url);
  fs.mkdirSync(destDir, { recursive: true });
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetch tagged ${r.status}: ${url}`);
  const baseHref = assetBase || url;   // default to the HTML's own URL dir if none given
  const html = injectBase(Buffer.from(await r.arrayBuffer()).toString('utf8'), baseHref);
  const dest = path.join(destDir, `tagged-${Date.now()}.html`);
  fs.writeFileSync(dest, html);
  return dest;
}

// Build a render job from an approval + its content_output. `taggedPath` is the
// already-fetched local tagged HTML. Returns a job for the pool (run-job/run-pool).
export function buildJobFromApproval({ approval, contentOutput, taggedPath, outDir, kind = 'mp4' }) {
  const meta = (contentOutput && contentOutput.metadata) || {};
  if (meta.render && meta.render !== 'live-html') {
    throw new Error(`unexpected metadata.render="${meta.render}" (contract expects "live-html") — flagging, not guessing`);
  }
  const taggedHtml = fs.readFileSync(taggedPath, 'utf8');
  const frameId = meta.frame_id || firstFrameId(taggedHtml);
  if (!frameId) throw new Error(`no .cr-frame found in tagged HTML for approval ${approval.id}`);
  const overrides = approval.overrides || {};
  const ext = kind === 'png' ? 'png' : 'mp4';
  const out = path.join(outDir, `${approval.id}.${ext}`);
  return {
    id: approval.id,
    taggedPath,
    frameId,
    overrides,
    kind,
    out,
    updated_at: approval.updated_at,
    workspace_id: approval.workspace_id,
    batch_id: approval.batch_id,
  };
}

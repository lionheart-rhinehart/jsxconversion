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

// Default render transport: fetch a URL to a local temp file (poller caches tagged HTML
// locally before render-frame opens it). Injectable so the fixture can pass a local file.
export async function fetchToFile(url, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  // file:// or bare local path → just return it (fixture path; fileURLToPath is
  // Windows-correct: handles the drive letter + %20-encoded spaces)
  if (/^file:/i.test(url)) return fileURLToPath(url);
  if (!/^https?:/i.test(url)) return path.resolve(url);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetch tagged ${r.status}: ${url}`);
  const dest = path.join(destDir, `tagged-${Date.now()}.html`);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
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

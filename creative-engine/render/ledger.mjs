// creative-engine/render/ledger.mjs
//
// 5.3 — the LOCAL rendered-ledger (contract option B). The Kraken `approvals` table
// has NO `rendered_at` column (verified), and Kraken is write-only on status. So
// render bookkeeping is owned WHOLLY here: we remember which (approval id, updated_at)
// pairs we've already rendered.
//
//   needsRender(row)  ⇢  status==='approved' AND (id,updated_at) NOT in the ledger.
//
// Re-approval after an edit bumps `updated_at` on the Kraken side → the pair changes
// → it renders again automatically. An unchanged already-rendered row is skipped.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = path.join(__dirname, '_state', 'rendered-ledger.json');

function key(id, updatedAt) {
  return `${id}@${updatedAt}`;
}

export class Ledger {
  constructor(filePath = DEFAULT_PATH) {
    this.filePath = filePath;
    this.entries = {};   // key → { id, updated_at, renderedAt, out }
    this._load();
  }
  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.entries = JSON.parse(fs.readFileSync(this.filePath, 'utf8')).entries || {};
      }
    } catch (_) { this.entries = {}; }
  }
  _save() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify({ entries: this.entries }, null, 2));
  }
  has(id, updatedAt) {
    return Object.prototype.hasOwnProperty.call(this.entries, key(id, updatedAt));
  }
  record(id, updatedAt, meta = {}) {
    this.entries[key(id, updatedAt)] = { id, updated_at: updatedAt, renderedAt: new Date().toISOString(), ...meta };
    this._save();
  }
  // a row "needs render" when approved AND this exact (id,updated_at) hasn't been done
  needsRender(row) {
    return row && row.status === 'approved' && !this.has(row.id, row.updated_at);
  }
}

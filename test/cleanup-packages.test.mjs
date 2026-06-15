// Unit for the _packages/ cleanup sweep (creative-engine/intake/cleanup-packages.mjs).
// Builds a temp fixture so it never touches the real _packages/ and needs no network.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { planCleanup } from '../creative-engine/intake/cleanup-packages.mjs';

function mkPkg(root, slug, { createdAt } = {}) {
  const dir = path.join(root, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'file.txt'), 'x'.repeat(1024));
  if (createdAt) fs.writeFileSync(path.join(dir, 'intake.json'), JSON.stringify({ createdFrom: { at: createdAt } }));
  return dir;
}

const NOW = Date.parse('2026-06-15T00:00:00.000Z');

test('planCleanup: flags test-prefixed packages, keeps real ones (no age limit)', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-cleanup-'));
  try {
    mkPkg(root, 'ce-intake-test-ok-abc-12345678');
    mkPkg(root, 'ce-rlp-xyz-87654321');
    mkPkg(root, 'carmel-2c7c5b76', { createdAt: '2026-06-14T00:00:00.000Z' });

    const { candidates, kept } = planCleanup({ dir: root, nowMs: NOW });
    const cset = new Set(candidates.map((c) => c.slug));
    assert.deepEqual([...cset].sort(), ['ce-intake-test-ok-abc-12345678', 'ce-rlp-xyz-87654321']);
    assert.deepEqual(kept.map((k) => k.slug), ['carmel-2c7c5b76']);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('planCleanup: --max-age-days also prunes a real package older than N days', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-cleanup-'));
  try {
    mkPkg(root, 'old-real-aaaaaaaa', { createdAt: '2026-05-01T00:00:00.000Z' }); // ~45d old
    mkPkg(root, 'fresh-real-bbbbbbbb', { createdAt: '2026-06-14T00:00:00.000Z' }); // 1d old

    const { candidates, kept } = planCleanup({ dir: root, nowMs: NOW, maxAgeDays: 30 });
    assert.deepEqual(candidates.map((c) => c.slug), ['old-real-aaaaaaaa']);
    assert.deepEqual(kept.map((k) => k.slug), ['fresh-real-bbbbbbbb']);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('planCleanup: missing _packages dir → empty plan (no throw)', () => {
  const { candidates, kept } = planCleanup({ dir: path.join(os.tmpdir(), 'does-not-exist-ce-' + NOW) });
  assert.equal(candidates.length, 0);
  assert.equal(kept.length, 0);
});

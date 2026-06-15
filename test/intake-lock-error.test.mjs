// Unit for the intake lock-error classifier (creative-engine/intake/lib/normalize.mjs).
// Simulating a real OS file lock cross-platform is unreliable, so we test the classifier
// that turns a raw EPERM (package open in the editor) into a friendly "close it" error.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLockError } from '../creative-engine/intake/lib/normalize.mjs';

test('isLockError: Windows/POSIX lock codes are recognized', () => {
  for (const code of ['EPERM', 'EBUSY', 'EACCES', 'ENOTEMPTY', 'EISDIR']) {
    assert.equal(isLockError(Object.assign(new Error('x'), { code })), true, code);
  }
});

test('isLockError: non-lock errors are NOT misclassified', () => {
  assert.equal(isLockError(Object.assign(new Error('x'), { code: 'ENOENT' })), false);
  assert.equal(isLockError(new Error('plain')), false);
  assert.equal(isLockError(null), false);
  assert.equal(isLockError(undefined), false);
});

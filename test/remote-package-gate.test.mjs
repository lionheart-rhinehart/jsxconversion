// Regression for the remote-publish poller gate (creative-engine/render/approvals.mjs).
// isRemotePackage is the keystone that separates a Storage-published package (download-
// and-serve) from a localhost-served package and the legacy static file:// fixture. A
// wrong discriminator silently routes the static fixture through a network download
// (it broke test-poller.mjs once during the build) — so pin all three cases here.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isRemotePackage } from '../creative-engine/render/approvals.mjs';

test('isRemotePackage: Storage publish (tagged_url + asset_base both http) → remote', () => {
  assert.equal(isRemotePackage({
    render: 'live-html',
    tagged_url: 'https://x.supabase.co/storage/v1/object/public/content-bundles/p/entry.html',
    asset_base: 'https://x.supabase.co/storage/v1/object/public/content-bundles/p/',
  }), true);
});

test('isRemotePackage: localhost-served (http tagged_url, LOCAL asset_base) → NOT remote', () => {
  assert.equal(isRemotePackage({
    render: 'live-html',
    tagged_url: 'http://localhost:5300/creative-engine/intake/_packages/x/entry.html',
    asset_base: '/creative-engine/intake/_packages/x/',
  }), false);
});

test('isRemotePackage: legacy static fixture (file:// tagged_url, dummy http asset_base) → NOT remote', () => {
  assert.equal(isRemotePackage({
    render: 'live-html',
    tagged_url: 'file:///C:/repo/creative-engine/render/_fixture/westfield.tagged.html',
    asset_base: 'https://example/assets/',
  }), false);
});

test('isRemotePackage: non-live-html row → NOT remote', () => {
  assert.equal(isRemotePackage({ render: 'static', tagged_url: 'https://x/y.html', asset_base: 'https://x/' }), false);
  assert.equal(isRemotePackage({}), false);
  assert.equal(isRemotePackage(null), false);
});

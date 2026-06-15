// Regression test for the Kraken 🔒 Lock button clipping (2026-06-15).
//
// The media-browse toolbar (.ce-kgrid-bar) sits inside .ce-kraken-grid{overflow:hidden}.
// The lock button is its right-most control, pushed there by a flex:1 spacer. When the
// toolbar is wider than the panel (long workspace/folder names + every filter), a single
// NON-wrapping row shoved the lock past the right edge → clipped off-screen (the bug Cody
// hit: "the lock button completely disappeared"). The fix is flex-wrap:wrap on the bar so
// the lock wraps to a second row instead of overflowing.
//
// This test renders the REAL editor.css with the real toolbar markup in a deliberately
// NARROW panel (forces overflow) and asserts the lock stays inside the panel. If someone
// removes flex-wrap (or re-pins the lock to a clipped position) this fails.

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import puppeteer from "puppeteer";

const here = path.dirname(fileURLToPath(import.meta.url));
const CSS = fs.readFileSync(path.join(here, "..", "creative-engine", "editor", "editor.css"), "utf8");

// the real .ce-kgrid-bar children (mirror of editor.js lines ~118-145), in a narrow panel
const PANEL_W = 720;
const MARKUP = `
<div class="ce-kraken-grid ce-on" style="position:relative;left:auto;right:auto;bottom:auto;width:${PANEL_W}px;">
  <div class="ce-kgrid-bar">
    <span class="ce-kraken" style="display:inline-flex;align-items:center;gap:6px;">
      <button class="ce-btn ce-kraken-open">⛓ Library ▾</button>
      <select class="ce-select ce-kraken-ws"><option>AA - Carmel</option></select>
      <select class="ce-select ce-kraken-folder"><option>IG stories</option></select>
    </span>
    <span class="ce-kgrid-title">262 items · 253 video · 9 photo</span>
    <span class="ce-kgrid-filter"><button class="ce-btn ce-kf ce-on">All</button><button class="ce-btn ce-kf">▶ Video</button><button class="ce-btn ce-kf">▣ Photo</button></span>
    <input class="ce-ksearch" placeholder="Filter by name…">
    <select class="ce-select ce-ksort"><option>Newest</option></select>
    <span class="ce-kgrid-zoom"><span>▢</span><input type="range" class="ce-kz-range"><span>▦</span></span>
    <span class="ce-kgrid-spacer"></span>
    <button class="ce-btn ce-kraken-lock">🔒 Lock</button>
  </div>
  <div class="ce-kgrid-tiles" style="height:120px"></div>
</div>`;

test("Kraken Lock button stays on-screen when the media toolbar overflows", async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1133, height: 792 });
    await page.setContent(
      `<html><head><style>${CSS}\nbody{margin:20px;background:#111}</style></head><body>${MARKUP}</body></html>`
    );
    const r = await page.evaluate(() => {
      const lock = document.querySelector(".ce-kraken-lock").getBoundingClientRect();
      const grid = document.querySelector(".ce-kraken-grid").getBoundingClientRect();
      return {
        lockRight: Math.round(lock.right),
        gridRight: Math.round(grid.right),
        lockLeft: Math.round(lock.left),
        gridLeft: Math.round(grid.left),
        width: Math.round(lock.width),
      };
    });
    assert.ok(r.width > 0, "lock button must render with width");
    assert.ok(
      r.lockRight <= r.gridRight + 1,
      `lock must not be clipped off the panel's right edge (lockRight ${r.lockRight} > panelRight ${r.gridRight}) — flex-wrap missing?`
    );
    assert.ok(r.lockLeft >= r.gridLeft - 1, "lock must not be clipped off the left edge");
  } finally {
    await browser.close();
  }
});

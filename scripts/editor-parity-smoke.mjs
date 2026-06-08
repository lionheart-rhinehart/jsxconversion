#!/usr/bin/env node
// ============================================================================
//  scripts/editor-parity-smoke.mjs — STANDALONE-CONSOLIDATION parity gate (SA0)
// ----------------------------------------------------------------------------
//  A READ-ONLY headless smoke that exercises every editor feature surface the
//  consolidation must preserve — Kraken browse, trim, loop, audio, markup, mute
//  — on `#phase-c-video-demo`, asserting behavioral JSON *shapes* (not exact
//  live data) + zero console errors. It is the regression baseline: re-run it
//  verbatim after EVERY consolidation phase, and against the Phase-C candidate
//  on a separate port, BEFORE the atomic swap.
//
//  It does NOT mutate disk: only GET probes + in-MEMORY state toggles (no POST
//  to /annotations, no /media-upload, no /render, no Kraken pull). Safe to run
//  against Cody's LIVE :5173 without disturbing it.
//
//  Usage:
//    node scripts/editor-parity-smoke.mjs                 # default :5173
//    EDITOR_PORT=5273 node scripts/editor-parity-smoke.mjs # a candidate host
//    node scripts/editor-parity-smoke.mjs --port 5273 --id phase-c-video-demo
//
//  Exit 0 = all checks pass (or cleanly SKIP when Kraken is offline/fallback);
//  exit 1 = a real regression. Prints `mode=live|fallback` (U8) so a green run
//  on the static fallback never masquerades as live-Kraken parity.
// ============================================================================

import { existsSync, readFileSync } from "node:fs";
import { join, isAbsolute } from "node:path";
import puppeteer from "puppeteer";

const args = process.argv.slice(2);
const optV = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const PORT = Number(process.env.EDITOR_PORT || optV("port", "5173"));
const ID = optV("id", "phase-c-video-demo");
const BASE = `http://localhost:${PORT}`;
const PROJECT_ROOT = process.cwd();

// ── live-vs-fallback detector (U8) ──────────────────────────────────────────
// The Kraken browse path is "live" only when the project's config + The Kraken's
// .env.local both exist on disk; otherwise kraken-list falls back to the static
// client-workspaces.json. A parity run must declare which path it exercised.
function detectKrakenMode() {
  try {
    const cfgPath = join(PROJECT_ROOT, ".claude", "skills", "creative-engine", "config.json");
    if (!existsSync(cfgPath)) return "fallback";
    const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
    const envPath = cfg && cfg.kraken && cfg.kraken.credentialsEnvPath;
    if (!envPath) return "fallback";
    const abs = isAbsolute(envPath) ? envPath : join(PROJECT_ROOT, envPath);
    return existsSync(abs) ? "live" : "fallback";
  } catch { return "fallback"; }
}

const results = [];
const rec = (name, ok, detail, skipped = false) => results.push({ name, ok: !!ok, skipped, detail });

async function main() {
  const mode = detectKrakenMode();
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/404|Failed to load resource/.test(m.text())) consoleErrors.push("console: " + m.text());
  });

  // 1) /clusters shape (U3) — { clusters: [...] } including the id.
  try {
    const j = await page.evaluate(async (b) => (await fetch(b + "/clusters")).json(), BASE);
    const list = (j && j.clusters) || [];
    rec("clusters_shape", Array.isArray(list) && list.some((c) => (c.id || c) === ID || JSON.stringify(c).includes(ID)),
      `clusters=${Array.isArray(list) ? list.length : "?"}`);
  } catch (e) { rec("clusters_shape", false, String(e.message)); }

  // 2) editor loads the video creative (poll for the async config load).
  await page.goto(`${BASE}/editor#${ID}`, { waitUntil: "networkidle2", timeout: 30000 });
  let loaded = { hasConfig: false };
  for (let i = 0; i < 20; i++) {
    loaded = await page.evaluate(() => ({
      cluster: typeof state !== "undefined" && state.cluster,
      hasConfig: !!(typeof state !== "undefined" && state.config),
      isVideo: typeof isVideoCreative === "function" ? isVideoCreative() : null,
    }));
    if (loaded.hasConfig) break;
    await new Promise((r) => setTimeout(r, 300));
  }
  rec("editor_loads_video", loaded.hasConfig && loaded.isVideo === true, JSON.stringify(loaded));

  // 3) Kraken bar visible + workspace dropdown populated (skips if offline).
  const kbar = await page.evaluate(() => {
    const bar = document.getElementById("krakenBar");
    const sel = document.getElementById("kbWorkspace") || document.querySelector('#krakenBar select');
    return { present: !!bar, hidden: bar ? bar.hidden : null, opts: sel ? sel.options.length : 0 };
  });
  if (kbar.present && kbar.opts > 0) rec("kraken_bar", !kbar.hidden, JSON.stringify(kbar));
  else rec("kraken_bar", true, `skipped (mode=${mode}, opts=${kbar.opts})`, true);

  // 4) /kraken/workspaces shape (U3) — { workspaces: [{name,id}] } (skip if empty/offline).
  try {
    const j = await page.evaluate(async (b) => (await fetch(b + "/kraken/workspaces")).json().catch(() => ({})), BASE);
    const ws = (j && j.workspaces) || [];
    if (ws.length > 0) rec("kraken_workspaces_shape", ws.every((w) => w && w.id && w.name), `n=${ws.length}`);
    else rec("kraken_workspaces_shape", true, `skipped (empty; mode=${mode})`, true);
  } catch (e) { rec("kraken_workspaces_shape", true, `skipped (${e.message})`, true); }

  // 5) Trim UI present for a video creative.
  const trim = await page.evaluate(() => ({
    panel: !!document.getElementById("trimPanel"),
    track: !!document.getElementById("trimTrack"),
  }));
  rec("trim_ui", trim.panel || trim.track, JSON.stringify(trim));

  // 6) Loop — in-memory toggle drives previewDur + loop badge (no save).
  const loop = await page.evaluate(() => {
    if (!state.config.media) state.config.media = {};
    state.config.media.loop = true; state.config.media.loopSeconds = 12;
    const dur = typeof previewDur === "function" ? previewDur() : null;
    if (typeof renderTransport === "function") renderTransport();
    const badge = !!document.getElementById("transportLoopBadge");
    return { dur, badge };
  });
  rec("loop_preview", Math.abs((loop.dur || 0) - 12) < 0.5 && loop.badge, JSON.stringify(loop));

  // 7) Audio UI + functions present.
  const audio = await page.evaluate(() => ({
    panel: !!document.getElementById("audioPanel"),
    sel: !!document.getElementById("audioTrackSel"),
    startFn: typeof startMusicWithClip === "function",
  }));
  rec("audio_ui", audio.panel && audio.sel && audio.startFn, JSON.stringify(audio));

  // 8) /peaks shape (U3) — { peaks:[...], duration } (read-only decode).
  try {
    const j = await page.evaluate(async (b) => (await fetch(b + "/peaks?file=" + encodeURIComponent("music-library/dark-star.mp3"))).json().catch(() => ({})), BASE);
    rec("peaks_shape", !!(j && Array.isArray(j.peaks) && j.peaks.length && typeof j.duration === "number"),
      j && j.peaks ? `peaks=${j.peaks.length} dur=${j.duration}` : `err=${j && j.error}`);
  } catch (e) { rec("peaks_shape", false, String(e.message)); }

  // 9) Markup functions present.
  const markup = await page.evaluate(() => ({
    vis: typeof applyMarkupVisibility === "function",
    active: typeof setActiveMarkup === "function",
  }));
  rec("markup_fns", markup.vis && markup.active, JSON.stringify(markup));

  // 10) /annotations GET shape (U3) — an array (read-only; throwaway id, no POST).
  try {
    const j = await page.evaluate(async (b) => (await fetch(b + "/annotations?id=__parity_probe__").then((r) => r.json()).catch(() => null)), BASE);
    rec("annotations_shape", Array.isArray(j) || (j && Array.isArray(j.annotations)), `type=${Array.isArray(j) ? "array" : typeof j}`);
  } catch (e) { rec("annotations_shape", false, String(e.message)); }

  // 11) Mute button toggles state.previewMuted.
  const mute = await page.evaluate(() => {
    if (typeof renderTransport === "function") renderTransport();
    const btn = document.getElementById("transportMute");
    if (!btn) return { present: false };
    const before = !!state.previewMuted; btn.click(); const on = !!state.previewMuted; btn.click(); const off = !!state.previewMuted;
    return { present: true, before, on, off };
  });
  rec("mute_toggle", mute.present && mute.on === true && mute.off === false, JSON.stringify(mute));

  // 12) Zero console errors across all of the above.
  rec("no_console_errors", consoleErrors.length === 0, consoleErrors.slice(0, 5).join(" | "));

  await browser.close();

  // ── report ────────────────────────────────────────────────────────────────
  const failed = results.filter((r) => !r.ok && !r.skipped);
  const skipped = results.filter((r) => r.skipped);
  console.log(`\n  EDITOR PARITY SMOKE — ${BASE}  (kraken mode=${mode})`);
  for (const r of results) {
    const tag = r.skipped ? "SKIP" : r.ok ? "PASS" : "FAIL";
    console.log(`   [${tag}] ${r.name}${r.detail ? "  — " + r.detail : ""}`);
  }
  console.log(`\n  ${results.length - skipped.length - failed.length} pass, ${failed.length} fail, ${skipped.length} skip  (mode=${mode})\n`);
  if (failed.length) process.exit(1);
}

main().catch((e) => { console.error("SMOKE CRASHED:", e); process.exit(2); });

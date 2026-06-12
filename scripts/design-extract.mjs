#!/usr/bin/env node
// ============================================================================
//  scripts/design-extract.mjs — faithful slice of a Claude Design gallery.
// ----------------------------------------------------------------------------
//  Loads campaigns/<slug>/index.html (the standalone gallery — the .dc.html with
//  only support.js dropped), and for each `.cr-card` writes the EXACT `.cr-frame`
//  outerHTML (already tagged with data-edit-id) to campaigns/<slug>/designs/<label>.html.
//  Also writes designs/_keyframes.css (the gallery's @keyframes) and designs/manifest.json
//  (label -> angle/hook/route + the brand-CSS href).
//
//  This is a FAITHFUL SLICE, not a rebuild: the design's real DOM, verbatim. The
//  /design route wraps a slice into a standalone doc; the design is never re-created.
//
//  Usage:  node scripts/design-extract.mjs <campaign-slug>
//          node scripts/design-extract.mjs westfield-100-off
// ============================================================================
import { existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";
import { TAGGER_BODY, labelToId } from "./lib/design-edit.mjs";

const slug = process.argv[2];
if (!slug) { console.error("Usage: node scripts/design-extract.mjs <campaign-slug>"); process.exit(1); }

const ROOT = process.cwd();
const campDir = join(ROOT, "campaigns", slug);
const galleryPath = join(campDir, "index.html");
if (!existsSync(galleryPath)) { console.error("Not found: " + galleryPath); process.exit(1); }

const outDir = join(campDir, "designs");
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required", "--mute-audio"],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(galleryPath).href, { waitUntil: "networkidle0", timeout: 120000 });

  // The brand-CSS <link> + the keyframes <style> live in the gallery <head>.
  const head = await page.evaluate(() => {
    const link = document.querySelector('head link[rel="stylesheet"]');
    const styles = Array.from(document.querySelectorAll("head style")).map((s) => s.textContent).join("\n");
    return { dsHref: link ? link.getAttribute("href") : "", keyframes: styles || "" };
  });

  // Tag every .cr-frame in place (bakes data-edit-id into the slice), then read each
  // card's frame outerHTML + the angle metadata from its enclosing <section> header.
  const designs = await page.evaluate((taggerBody) => {
    const tag = new Function("frame", taggerBody);
    const cards = Array.from(document.querySelectorAll(".cr-card"));
    return cards.map((card) => {
      const frame = card.querySelector(".cr-frame");
      if (frame) tag(frame);
      const label = card.getAttribute("data-label") || "";
      const section = card.closest("section");
      const header = section && section.querySelector("header");
      const eyebrow = header && header.querySelector("div div, div");
      const h3 = header && header.querySelector("h3");
      const hookP = header && header.querySelector("p");
      // figcaption: "<label> <technique>"
      const cap = card.querySelector("figcaption");
      const capSpans = cap ? Array.from(cap.querySelectorAll("span")).map((s) => s.textContent.trim()) : [];
      return {
        label,
        eyebrow: eyebrow ? eyebrow.textContent.trim() : "",
        angleName: h3 ? h3.textContent.trim() : "",
        hook: hookP ? hookP.textContent.trim() : "",
        technique: capSpans.length > 1 ? capSpans[capSpans.length - 1] : "",
        frameHtml: frame ? frame.outerHTML : "",
      };
    });
  }, TAGGER_BODY);

  await page.close();

  // Clear stale slices (so a re-extract is clean), then write fresh.
  for (const f of readdirSync(outDir)) { try { unlinkSync(join(outDir, f)); } catch {} }

  writeFileSync(join(outDir, "_keyframes.css"), head.keyframes, "utf8");

  const manifest = { campaign: slug, dsHref: head.dsHref || "", designs: [] };
  let written = 0;
  for (const d of designs) {
    const id = labelToId(d.label);
    if (!id || !d.frameHtml) continue;
    const angleNo = parseInt((id.match(/^(\d+)/) || [])[1] || "0", 10);
    const route = (id.match(/([A-Za-z]+)$/) || [])[1] || "";
    writeFileSync(join(outDir, id + ".html"), d.frameHtml, "utf8");
    manifest.designs.push({
      label: id,
      file: id + ".html",
      angleNo,
      route,
      angleName: d.angleName,
      hook: d.hook,
      eyebrow: d.eyebrow,
      technique: d.technique,
    });
    written++;
  }
  manifest.designs.sort((a, b) => (a.angleNo - b.angleNo) || a.route.localeCompare(b.route));
  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  console.log(`design-extract: wrote ${written} slice(s) + manifest to campaigns/${slug}/designs/`);
  console.log(`  dsHref: ${manifest.dsHref}`);
  console.log(`  labels: ${manifest.designs.map((d) => d.label).join(", ")}`);
} finally {
  await browser.close();
}

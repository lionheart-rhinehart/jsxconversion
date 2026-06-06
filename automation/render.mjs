#!/usr/bin/env node
// AA Weekly Birthday — production renderer (data JSON in → 1080×1350 PNG out).
//
//   node automation/render.mjs --data week.json --out out/birthday-week.png
//   node automation/render.mjs --out x.png            (data on stdin)
//
// Drives SYSTEM Chrome headless to screenshot automation/template.html with the
// week's data injected. Deliberately decoupled from the creative-engine renderer
// so a weekly social post never depends on engine internals mid-refactor.
//
// Guarantees / guards:
//   - asserts assets/bg-clean.png exists first  → never a silent blank-bg PNG
//   - coerces athletes to an array              → never a hang/throw on bad data
//   - embeds the display font as base64         → offline, deterministic glyphs
//   - prints { output, count } JSON on success  → caller gates on process exit
//   - non-zero exit on every failure path
//
// Exit codes: 0 ok · 1 generic · 2 usage · 3 missing background · 4 chrome failed

import {
  existsSync, readFileSync, writeFileSync, rmSync, renameSync, mkdirSync, readFileSync as rf,
} from "node:fs";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const BG = join(HERE, "assets", "bg-clean.png");
const TEMPLATE = join(HERE, "template.html");

// Display face: Saira Condensed — names 600, date 700. Bundled INSIDE this folder
// (assets/fonts/) so the whole `automation/` folder is self-contained and portable
// to the automation project — no dependency on the parent repo's /fonts.
const FONT_DIR = join(HERE, "assets", "fonts");
const FONT_FACES = [
  { file: "SairaCondensed-Medium.ttf",   weight: 500 },
  { file: "SairaCondensed-SemiBold.ttf", weight: 600 },
  { file: "SairaCondensed-Bold.ttf",     weight: 700 },
];

function die(code, msg) {
  console.error(`[birthday-render] ${msg}`);
  process.exit(code);
}

function parseArgs(argv) {
  const a = { data: null, out: null, chrome: null };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--data") a.data = argv[++i];
    else if (k === "--out") a.out = argv[++i];
    else if (k === "--chrome") a.chrome = argv[++i];
    else if (k === "-h" || k === "--help") {
      console.log("Usage: render.mjs --data <json> --out <png>   (or pipe data on stdin)");
      process.exit(0);
    } else die(2, `unknown arg: ${k}`);
  }
  return a;
}

function readStdin() {
  try { return readFileSync(0, "utf8"); } catch { return ""; }
}

// "2014-06-08" → "6/8". Anything else is returned unchanged (display string).
function toDisplayDate(v) {
  if (typeof v !== "string") return v == null ? "" : String(v);
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return v;
  return `${Number(m[2])}/${Number(m[3])}`;
}

function normalize(raw) {
  const data = (raw && typeof raw === "object") ? raw : {};
  const dateRange = typeof data.dateRange === "string" ? data.dateRange : "";
  const athletes = (Array.isArray(data.athletes) ? data.athletes : [])
    .filter((a) => a && typeof a === "object")
    .map((a) => ({
      name: a.name != null ? String(a.name) : "",
      date: toDisplayDate(a.date),
    }))
    .filter((a) => a.name);
  return { dateRange, athletes };
}

function fontFacesStyle() {
  const blocks = FONT_FACES.map(({ file, weight }) => {
    const p = join(FONT_DIR, file);
    if (!existsSync(p)) die(1, `font missing: ${p} (run npm install / check fonts/)`);
    const b64 = rf(p).toString("base64");
    return `@font-face{font-family:'Saira Condensed';font-style:normal;font-weight:${weight};` +
      `font-display:block;src:url(data:font/ttf;base64,${b64}) format('truetype');}`;
  });
  return `<style>\n${blocks.join("\n")}\n</style>`;
}

function resolveChrome(cliPath) {
  const candidates = [
    cliPath,
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return c;
  die(4, `Chrome not found. Tried:\n  ${candidates.join("\n  ")}\nSet CHROME_PATH or pass --chrome.`);
}

function main() {
  const args = parseArgs(process.argv);

  // GUARD 1 — the text-free background must exist, or we'd silently ship a blank.
  if (!existsSync(BG)) die(3, `background missing: ${BG}\nDrop the text-free 1080×1350 plate there first.`);
  if (!existsSync(TEMPLATE)) die(1, `template missing: ${TEMPLATE}`);
  if (!args.out) die(2, "missing --out <png>");

  // Load + normalize data (file, stdin, or none → sample-less empty).
  let rawText = "";
  if (args.data) {
    if (!existsSync(args.data)) die(2, `--data file not found: ${args.data}`);
    rawText = readFileSync(args.data, "utf8");
  } else {
    rawText = readStdin();
  }
  let parsed = {};
  if (rawText.trim()) {
    try { parsed = JSON.parse(rawText.replace(/^﻿/, "")); }
    catch (e) { die(2, `--data is not valid JSON: ${e.message}`); }
  }
  const data = normalize(parsed);
  if (data.athletes.length > 18) {
    console.error(`[birthday-render] WARNING: ${data.athletes.length} athletes — beyond the polaroid's safe max (~18). Names may be cramped.`);
  }

  // Build the temp HTML INSIDE automation/ so relative asset paths resolve.
  let html = readFileSync(TEMPLATE, "utf8");
  const dataJson = JSON.stringify(data).replace(/<\//g, "<\\/"); // safe inside <script>
  html = html
    .replace("<!--FONT_FACES-->", fontFacesStyle())
    .replace("<!--BIRTHDAY_DATA-->", `<script>window.BIRTHDAY_DATA = ${dataJson};</script>`);

  const stamp = `${process.pid}-${process.hrtime.bigint()}`;
  const tmpHtml = join(HERE, `.render-${stamp}.html`);
  const tmpPng = join(HERE, `.render-${stamp}.png`);
  writeFileSync(tmpHtml, html);

  const outPath = isAbsolute(args.out) ? args.out : resolve(process.cwd(), args.out);
  mkdirSync(dirname(outPath), { recursive: true });

  const chrome = resolveChrome(args.chrome);
  const chromeArgs = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1080,1350",
    "--virtual-time-budget=2500",
    `--screenshot=${tmpPng}`,
    pathToFileURL(tmpHtml).href,
  ];

  try {
    const r = spawnSync(chrome, chromeArgs, { stdio: ["ignore", "ignore", "pipe"] });
    if (r.status !== 0 || !existsSync(tmpPng)) {
      const errTxt = r.stderr ? r.stderr.toString().slice(0, 600) : "(no stderr)";
      die(4, `chrome screenshot failed (status ${r.status}). stderr:\n${errTxt}`);
    }
    renameSync(tmpPng, outPath);
  } finally {
    rmSync(tmpHtml, { force: true });
    rmSync(tmpPng, { force: true });
  }

  console.log(JSON.stringify({ output: outPath, count: data.athletes.length, dateRange: data.dateRange }));
}

main();

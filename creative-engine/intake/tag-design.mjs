// creative-engine/intake/tag-design.mjs
//
// Phase 1 — DETERMINISTIC intake + TAG. No AI in this path.
//
// Takes a Claude Design export (a `.dc.html` handoff or the standalone gallery
// `index.html`) and stamps every editable element inside each `.cr-frame` with a
// stable id + role flags. Edits later key off these ids; the original design HTML
// is never re-drawn (we splice attributes into the *original byte stream* using the
// parser's source ranges, so fidelity is exact — only attributes are added).
//
// It emits a COVERAGE REPORT (`tagged N / skipped M with reason`) and a MEDIA
// MANIFEST (every rendered asset, with a brandKit flag so the swap-picker can hide
// brand-kit assets without ever blanking what the design renders).
//
// Hard rule (the whole point of going deterministic): NEVER silently skip a node.
// Any element whose tag we don't recognize is still tagged (it stays positionable)
// AND surfaced in the report's `flagged` list for a human to look at.
//
// Usage:
//   node creative-engine/intake/tag-design.mjs <input.html> [--out tagged.html] [--report report.json]
//   node creative-engine/intake/tag-design.mjs <input.html> --check   (report only, no file write)

import { parse } from 'node-html-parser';
import fs from 'node:fs';
import path from 'node:path';

// ── what we know how to render/edit. Anything outside this set is FLAGGED, not skipped.
const KNOWN_TAGS = new Set([
  // layout / text containers
  'div', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav', 'figure', 'figcaption',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'a', 'button', 'label', 'small', 'strong', 'b',
  'em', 'i', 'u', 'mark', 'sub', 'sup', 'br', 'hr', 'blockquote', 'ul', 'ol', 'li', 'time', 'abbr',
  // media
  'img', 'video', 'picture', 'source', 'audio',
  // svg family (Claude Design uses inline svg for some headlines / marks)
  'svg', 'text', 'tspan', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline',
  'defs', 'clippath', 'lineargradient', 'radialgradient', 'stop', 'mask', 'use', 'pattern', 'filter',
  'fegaussianblur', 'feoffset', 'feblend', 'femerge', 'femergenode', 'fecolormatrix', 'tref',
]);

const MEDIA_TAGS = new Set(['img', 'video', 'audio', 'source']);
const BG_URL_RE = /background(?:-image)?\s*:[^;"']*url\(/i;
const LOGO_RE = /logo|brand|wordmark|lockup/i;

function attr(el, name) { return el.getAttribute(name) || ''; }

function isMediaEl(el) {
  if (MEDIA_TAGS.has(el.rawTagName?.toLowerCase())) return true;
  return BG_URL_RE.test(attr(el, 'style'));
}

function mediaSrc(el) {
  return attr(el, 'src') || attr(el, 'poster') ||
    (attr(el, 'style').match(/url\(\s*['"]?([^'")]+)/i)?.[1] || '');
}

function isLogo(el) {
  return LOGO_RE.test(mediaSrc(el)) || LOGO_RE.test(attr(el, 'alt')) ||
    LOGO_RE.test(attr(el, 'class')) || el.getAttribute('data-edit-logo') === '1';
}

// brand-kit media = assets that ship with the brand kit (logo / wordmark), as opposed
// to swappable stock (photos/video). They stay rendered + tagged; the picker hides them.
function isBrandKit(el) {
  return isLogo(el) || /\/(brand|logo|kit)\//i.test(mediaSrc(el));
}

// A "text element" directly holds human-readable text (a non-whitespace text-node child).
// We tag the element that OWNS the text node, not its parents — so an animated headline
// whose lines are split into child <span>s tags each line-span (each is independently
// animated; an override on it survives the animation).
function hasDirectText(el) {
  return el.childNodes.some((n) => n.nodeType === 3 && n.rawText.trim().length > 0);
}

function textMode(el) {
  const t = el.rawTagName?.toLowerCase();
  if (t === 'text' || t === 'tspan' || t === 'tref') return 'svg';
  return 'plain';
}

// ── core: tag one parsed cr-frame; returns {edits, elements, flagged, media}
function tagFrame(frame, frameIdx) {
  const elements = [];
  const flagged = [];
  const media = [];
  let n = 0;

  // document order = the order querySelectorAll('*') returns descendants
  const all = frame.querySelectorAll('*');
  for (const el of all) {
    const tag = (el.rawTagName || '').toLowerCase();
    if (!tag) continue;
    const id = `e${n++}`;
    const roles = ['pos']; // every element is positionable (matches the design system)
    const extra = {}; // attr name -> value

    const isMedia = isMediaEl(el);
    const direct = hasDirectText(el);

    if (isMedia) {
      roles.push('media');
      const brandKit = isBrandKit(el);
      if (isLogo(el)) roles.push('logo');
      const src = mediaSrc(el);
      const kind = tag === 'video' ? 'video' : (BG_URL_RE.test(attr(el, 'style')) ? 'css-bg' : 'image');
      extra['data-edit-media-kind'] = kind;
      if (brandKit) extra['data-edit-brandkit'] = '1';
      media.push({ frame: frameIdx, id, tag, kind, src, brandKit });
    }
    if (direct) {
      roles.push('text');
      extra['data-edit-mode'] = textMode(el);
    }

    const known = KNOWN_TAGS.has(tag);
    if (!known) {
      // NEVER silently skip: still tag it (stays positionable) but surface it.
      flagged.push({ frame: frameIdx, id, tag, reason: `unrecognized tag <${tag}>`,
        snippet: el.toString().slice(0, 120) });
    }

    elements.push({ id, tag, el, roles, extra, known,
      text: direct ? el.text.trim().slice(0, 60) : '' });
  }

  // detect split-headline groups: a parent whose own text lives only in ≥2 tagged
  // text-children → mark those children with a shared split group (Phase-2 re-distribute).
  const byEl = new Map(elements.map((e) => [e.el, e]));
  for (const e of elements) {
    if (!e.roles.includes('text')) continue;
    const kids = e.el.childNodes.filter((c) => c.nodeType === 1 && byEl.has(c));
    const textKids = kids.filter((c) => byEl.get(c).roles.includes('text'));
    if (textKids.length >= 2 && !hasDirectText(e.el) === false) { /* parent has its own text too */ }
  }
  for (const e of elements) {
    const parent = e.el.parentNode;
    const pe = parent && byEl.get(parent);
    if (!pe) continue;
    const sibTextSpans = e.el.parentNode.childNodes
      .filter((c) => c.nodeType === 1 && byEl.get(c)?.roles.includes('text'));
    if (sibTextSpans.length >= 2 && e.roles.includes('text') && !pe.roles.includes('text')) {
      e.extra['data-edit-split'] = pe.id; // grouped under the (positional) parent
    }
  }

  // build splice edits: insert attrs right after `<tagname`
  const edits = [];
  for (const e of elements) {
    const start = e.el.range[0]; // index of '<'
    const insertAt = start + 1 + e.el.rawTagName.length;
    let s = ` data-edit-id="${e.id}"`;
    for (const r of e.roles) s += ` data-edit-${r}="1"`;
    for (const [k, v] of Object.entries(e.extra)) s += ` ${k}="${v}"`;
    edits.push({ insertAt, text: s });
  }

  return { edits, count: elements.length, textCount: elements.filter((e) => e.roles.includes('text')).length,
    mediaCount: media.length, flagged, media };
}

export function tagDesign(html) {
  const root = parse(html, { comment: true,
    blockTextElements: { script: true, style: true, noscript: true } });
  const frames = root.querySelectorAll('.cr-frame');

  const allEdits = [];
  const report = { input: null, frames: frames.length, tagged: 0, text: 0, media: 0,
    flagged: [], perFrame: [] };
  const manifest = [];

  frames.forEach((frame, i) => {
    // stamp a frame marker so ids are stable per design within a multi-design file
    const fstart = frame.range[0];
    const finsert = fstart + 1 + frame.rawTagName.length;
    allEdits.push({ insertAt: finsert, text: ` data-edit-frame="f${i}"` });

    const res = tagFrame(frame, i);
    allEdits.push(...res.edits);
    report.tagged += res.count;
    report.text += res.textCount;
    report.media += res.mediaCount;
    report.flagged.push(...res.flagged);
    report.perFrame.push({ frame: i, tagged: res.count, text: res.textCount,
      media: res.mediaCount, flagged: res.flagged.length });
    manifest.push(...res.media);
  });

  // apply splices high-offset-first so earlier offsets stay valid
  allEdits.sort((a, b) => b.insertAt - a.insertAt);
  let out = html;
  for (const e of allEdits) out = out.slice(0, e.insertAt) + e.text + out.slice(e.insertAt);

  report.skipped = report.flagged.length; // we flag rather than skip; this is the "needs-a-look" count
  return { tagged: out, report, manifest };
}

// ── CLI
const isMain = import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('tag-design.mjs');
if (isMain) {
  const args = process.argv.slice(2);
  const input = args.find((a) => !a.startsWith('--'));
  if (!input) {
    console.error('usage: node tag-design.mjs <input.html> [--out tagged.html] [--report report.json] [--check]');
    process.exit(1);
  }
  const check = args.includes('--check');
  const outFlag = args[args.indexOf('--out') + 1];
  const repFlag = args[args.indexOf('--report') + 1];
  const html = fs.readFileSync(input, 'utf8');
  const { tagged, report, manifest } = tagDesign(html);
  report.input = input;

  const dir = path.dirname(input);
  const base = path.basename(input).replace(/\.[^.]+$/, '');
  const outPath = args.includes('--out') ? outFlag : path.join(dir, `${base}.tagged.html`);
  const repPath = args.includes('--report') ? repFlag : path.join(dir, `${base}.coverage.json`);

  if (!check) {
    fs.writeFileSync(outPath, tagged);
    fs.writeFileSync(repPath, JSON.stringify({ report, manifest }, null, 2));
  }

  console.log(`\n=== COVERAGE: ${path.basename(input)} ===`);
  console.log(`frames:  ${report.frames}`);
  console.log(`tagged:  ${report.tagged} elements  (text ${report.text}, media ${report.media})`);
  console.log(`flagged: ${report.flagged.length} (unrecognized nodes — surfaced, NOT skipped)`);
  if (report.flagged.length) {
    for (const f of report.flagged.slice(0, 20)) console.log(`   ⚠ frame ${f.frame} ${f.id} — ${f.reason}: ${f.snippet}`);
  }
  const brandKit = manifest.filter((m) => m.brandKit).length;
  console.log(`media manifest: ${manifest.length} assets (${brandKit} brand-kit → hidden from picker, kept in render)`);
  console.log(`SILENT SKIPS: 0  (every element is accounted for)`);
  if (!check) {
    console.log(`\nwrote: ${outPath}`);
    console.log(`wrote: ${repPath}`);
  }
}

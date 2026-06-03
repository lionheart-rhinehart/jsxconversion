// ============================================================================
//  scripts/lib/copy-library.mjs — Cody's copy, captured VERBATIM
// ============================================================================
//  The engine SELECTS and PLACES copy; it never WRITES it. This parser turns the
//  campaign's hand-written docs (ad-copy.md + microscripts.md) into a flat library
//  of verbatim units, each with a stable `id`, a `role` hint, and a `chars` count.
//  The planner references units by id; copy-resolve.mjs expands id → verbatim text
//  BEFORE assemble() runs (assemble only ever sees text — never an id).
//
//  VERBATIM means verbatim: we only (a) un-escape GitHub-markdown punctuation
//  escapes (`\+`→`+`), (b) trim trailing hard-break whitespace, and (c) strip the
//  OUTER wrapping quotes the author put around a hook/headline. We never touch the
//  words, and we PRESERVE merge tokens like {{location.name}} untouched.
// ============================================================================

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export const COPY_LIBRARY_FILE = "copy-library.json";

// --- text hygiene (never alters words) -------------------------------------

// Un-escape markdown punctuation escapes only: a backslash before a punctuation
// char becomes that char. Leaves {{tokens}}, letters, and digits untouched.
export function unescapeMd(s) {
  return String(s).replace(/\\([\\`*_{}\[\]()#+\-.!~|>])/g, "$1");
}

// One source line → clean text: un-escape + drop trailing hard-break whitespace.
function cleanLine(s) {
  return unescapeMd(s).replace(/[ \t]+$/g, "").trim();
}

// Strip a single layer of wrapping straight/smart quotes (keeps inner quotes).
function stripOuterQuotes(s) {
  const t = String(s).trim();
  const m = t.match(/^["“](.*)["”]$/s);
  return m ? m[1].trim() : t;
}

export function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const chars = (s) => [...String(s)].length;

// Role hint per unit kind. NON-binding — the planner chooses the final slot; this
// just seeds sensible defaults and lets the editor filter. Uses the closed role
// vocabulary in roles.mjs.
const KIND_ROLE = {
  headline: "claim", // the short FB headline
  description: null,
  primaryText: null, // long body — a source pool, not an auto-placed slot
  bodyPara: null, // one body PARAGRAPH lifted whole (hookRef auto-splits it across kicker/headline/subhead)
  bodyLine: null, // one body SENTENCE lifted alone (copyRefs drops it in a single slot)
  altHook: "hook",
  imageHeadline: "hook", // the REAL on-creative headline
  imageSubhead: "reframe", // the REAL on-creative subhead
  microscript: "reframe",
};

// Split a paragraph into sentence-ish segments (keeps terminal punctuation with
// the segment). Same boundary rule as splitHook in roles.mjs — words never change.
function splitSentences(t) {
  return String(t)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mkUnit(id, kind, text, extra = {}) {
  return { id, kind, role: KIND_ROLE[kind] ?? null, text, chars: chars(text), ...extra };
}

// --- ad-copy.md ------------------------------------------------------------

// Split into AD blocks. An AD block begins with a line whose first bold span is
// "AD …" (e.g. **AD 1** or **AD 1 — VERSION A (…) — Short**) and runs until the
// next such line (or EOF). The `---` rules inside a block are section dividers.
function splitAdBlocks(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let cur = null;
  for (const line of lines) {
    const head = line.match(/^\*\*(AD\b[^*]*?)\*\*/i);
    if (head) {
      if (cur) blocks.push(cur);
      cur = { label: cleanLine(head[1]), lines: [line] };
    } else if (cur) {
      cur.lines.push(line);
    }
  }
  if (cur) blocks.push(cur);
  return blocks;
}

// Pull the body of a labelled section (`**LABEL:**` … up to the next `---`,
// `**SECTION:**`, or EOF). Returns the raw joined text (caller cleans).
function sectionBody(blockText, labelRe) {
  const re = new RegExp(`\\*\\*${labelRe}\\*\\*\\s*([\\s\\S]*?)(?:\\n---|\\n\\*\\*[A-Z][^*]*:\\*\\*|$)`, "i");
  const m = blockText.match(re);
  return m ? m[1] : null;
}

export function parseAdCopy(md, { warn = () => {} } = {}) {
  const units = [];
  const seen = new Map(); // base id → count (dedupe)
  const idFor = (base) => {
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  };

  const blocks = splitAdBlocks(md);
  for (const block of blocks) {
    const text = block.lines.join("\n");
    // label already starts with "AD …" → slug gives "ad-1" / "ad-1-version-a-…"
    const adId = idFor(slug(block.label));
    let produced = 0;
    const push = (kind, raw, extra) => {
      const t = cleanLine(raw);
      if (!t) return;
      units.push(mkUnit(`${adId}.${kind}`, kind, t, { ad: block.label, ...extra }));
      produced++;
    };

    // Headline + Description (same line)
    const hd = text.match(/\*\*Headline:\*\*\s*(.+?)(?:\s*\*\*Description:\*\*\s*(.+))?$/im);
    if (hd) {
      push("headline", hd[1]);
      if (hd[2]) push("description", hd[2]);
    }

    // Primary text (long body, multi-paragraph)
    const primary = sectionBody(text, "PRIMARY TEXT:");
    if (primary) {
      const body = primary
        .split(/\r?\n/)
        .map((l) => cleanLine(l))
        .filter(Boolean)
        .join("\n");
      if (body) {
        units.push(mkUnit(`${adId}.primaryText`, "primaryText", body, { ad: block.label }));
        produced++;
      }

      // Cut the body into MAGNETS the planner can place: each blank-line-separated
      // PARAGRAPH whole (one unit), plus each SENTENCE inside it (a finer unit). The
      // whole-body primaryText unit above stays as a source pool; these are the
      // referenceable pieces (a paragraph → hookRef auto-split; a sentence → copyRef).
      const paras = primary
        .split(/\n\s*\n/)
        .map((p) => p.split(/\r?\n/).map((l) => cleanLine(l)).filter(Boolean).join(" ").trim())
        .filter(Boolean);
      paras.forEach((para, i) => {
        const pn = i + 1;
        units.push(mkUnit(`${adId}.bodyPara.${pn}`, "bodyPara", para, { ad: block.label }));
        produced++;
        const sents = splitSentences(para);
        if (sents.length > 1) {
          sents.forEach((s, j) => {
            units.push(mkUnit(`${adId}.bodyLine.${pn}.${j + 1}`, "bodyLine", s, { ad: block.label }));
            produced++;
          });
        }
      });
    }

    // Alternative hooks: numbered list, each "text" — Archetype: X (V1.1)
    const altSec = sectionBody(text, "ALTERNATIVE HOOKS[^:]*:");
    if (altSec) {
      let n = 0;
      for (const line of altSec.split(/\r?\n/)) {
        const m = line.match(/^\s*\d+\.\s+(.*\S)\s*$/);
        if (!m) continue;
        n++;
        let rest = cleanLine(m[1]);
        let archetype = null;
        let code = null;
        // Suffix forms seen in the wild: "— Archetype: Warning (V1.5)",
        // "— Archetype: Warning" (no code), "(V2.2)" alone. Strip whatever is
        // there; capture archetype + optional code.
        const suffix = rest.match(/\s*[—–-]\s*Archetype:\s*(.+)$/i);
        if (suffix) {
          let meta = suffix[1].trim();
          const codeM = meta.match(/\(([^)]+)\)\s*$/);
          if (codeM) { code = codeM[1].trim(); meta = meta.slice(0, codeM.index).trim(); }
          archetype = meta || null;
          rest = rest.slice(0, suffix.index).trim();
        } else {
          const codeOnly = rest.match(/\s*\(([Vv][\d.]+)\)\s*$/);
          if (codeOnly) { code = codeOnly[1].trim(); rest = rest.slice(0, codeOnly.index).trim(); }
        }
        const t = stripOuterQuotes(rest);
        if (t) {
          units.push(mkUnit(`${adId}.altHook.${n}`, "altHook", t, { ad: block.label, archetype, code }));
          produced++;
        }
      }
    }

    // Image direction → the REAL on-creative copy
    const ih = text.match(/Headline on image:\s*(.+)/i);
    if (ih) push("imageHeadline", stripOuterQuotes(cleanLine(ih[1])));
    const is = text.match(/Sub-?headline on image:\s*(.+)/i);
    if (is) push("imageSubhead", stripOuterQuotes(cleanLine(is[1])));

    if (produced === 0) warn(`AD block "${block.label}" produced 0 units — check formatting`);
  }
  return units;
}

// --- microscripts.md -------------------------------------------------------

// DSI blocks start with "# **DSI #N: NAME**"; each has "### **Micro-Script N:**"
// followed by the verbatim line (usually **"…"**), then "**Why it works:** …".
export function parseMicroscripts(md, { warn = () => {} } = {}) {
  const units = [];
  const dsiSplit = md.split(/^#\s+\*\*DSI\s*/im);
  for (let i = 1; i < dsiSplit.length; i++) {
    const chunk = "DSI " + dsiSplit[i];
    const nameM = chunk.match(/^DSI\s*([^\n*]+)\*\*/i);
    const dsiName = nameM ? cleanLine(nameM[1]).replace(/[:#]/g, "").replace(/\s+/g, " ").trim() : `dsi-${i}`;
    const dsiId = `dsi-${slug(dsiName)}`;
    const parts = chunk.split(/###\s+\*\*Micro-?Script\s*(\d+)\s*:?\*\*/i);
    // parts: [pre, num, body, num, body, ...]
    for (let p = 1; p < parts.length; p += 2) {
      const num = parts[p].trim();
      const body = parts[p + 1] || "";
      // first non-empty line before "Why it works" is the script
      const beforeWhy = body.split(/\*\*Why it works/i)[0];
      const line = beforeWhy
        .split(/\r?\n/)
        .map((l) => l.trim())
        .find((l) => l.replace(/\*/g, "").trim());
      if (!line) {
        warn(`${dsiId} micro-script ${num} produced no text`);
        continue;
      }
      const t = stripOuterQuotes(cleanLine(line.replace(/^\*\*|\*\*$/g, "")));
      if (t) units.push(mkUnit(`${dsiId}.ms.${num}`, "microscript", t, { dsi: dsiName }));
    }
  }
  return units;
}

// --- assemble the library --------------------------------------------------

export function buildCopyLibrary({ campaign, adCopyMd, microscriptsMd, warn = () => {} }) {
  const units = [];
  const generatedFrom = [];
  if (typeof adCopyMd === "string") {
    units.push(...parseAdCopy(adCopyMd, { warn }));
    generatedFrom.push("ad-copy.md");
  }
  if (typeof microscriptsMd === "string") {
    units.push(...parseMicroscripts(microscriptsMd, { warn }));
    generatedFrom.push("microscripts.md");
  }
  const byId = {};
  for (const u of units) {
    if (byId[u.id]) warn(`duplicate unit id "${u.id}" — later one ignored`);
    else byId[u.id] = u;
  }
  return { schemaVersion: 1, campaign, generatedFrom, count: units.length, units, byId };
}

// Load a written copy-library.json. Returns null if absent (caller falls back to
// the legacy headline path — campaigns with no ad-copy.md still render).
export function loadCopyLibrary(campaignDir) {
  const path = join(campaignDir, COPY_LIBRARY_FILE);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

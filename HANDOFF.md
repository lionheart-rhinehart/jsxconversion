# ⛔ HANDOFF (2026-06-11) — Claude Design handoffs: edit DIRECTLY, do NOT rebuild

> **READ THIS FIRST. This is the active, top-priority decision.** Full detail + build steps:
> `C:\Users\lionh\.claude\plans\that-s-fine-i-don-t-dazzling-waterfall.md` (the HANDOFF/PLAN at the
> top of that file). Also read memory `project-westfield-editor-templates` +
> `project-claude-design-edit-directly` + `reference-dc-html-to-standalone`.

**What happened (≈6h of churn, Cody very frustrated):** `/creative-editor` was built to take a Claude
Design `.dc.html` handoff and make it editable by **FLATTENING it into the editor's layer model**
(`templates/<slug>/wf-*.config.json` → re-rendered via LayerStack). That flatten is a **lossy REBUILD**
— it re-creates the design and is NOT pixel-perfect (headline overlaps, shifted layout, lost angle
names). Cody handed over finished designs to *review*, and the review page showed the rebuilds. He was
never told a rebuild was happening. **Decision: STOP rebuilding.**

**The locked architecture (Cody's explicit call):** ONE editor (`out/editor/editor.html`), taught to
edit the Claude Design design **directly** — the **real `.cr-frame` HTML is the editor canvas**; edits
are **surgical overrides** on the untouched original (click text → retype; click media → swap via the
existing Kraken bar). No flatten, no second editor, no layer-model reconstruction → pixel-perfect
because the design is never re-made. Export = render the (override-applied) HTML → MP4 directly (it
already animates). See the plan file for the step-by-step + KEEP/DROP list.

**KEEP:** the faithful gallery `campaigns/<slug>/index.html` (`.dc.html` minus `support.js` runtime —
the editable source), the Kraken backend, the review page, HTML→MP4 render.
**DROP for these handoffs:** `scripts/westfield-flatten.mjs` config rebuild + `templates/<slug>/wf-*`
LayerStack re-render + the layer-config-video motion-baking.

**Shipped this session (working, but on the now-abandoned rebuild path — revisit under the new arch):**
`/creative-editor` intake (Q1 campaign / Q2 zip-link), Kraken auto-pin, review page with live cards +
angle grouping, validation-skip for `source:"claude-design"`. Commits through `978c8f2` on `main`.

---

# HANDOFF — review-page creative editor (earlier effort — background)

Last session shipped a large in-place editing feature: **12 commits, all on `origin/main`
(latest `6b36595`)**. Two open items are below.

- **Full decision/history log:** `C:\Users\lionh\.claude\plans\please-keen-axolotl.md` (a stacked
  log of every phase — read for the "why" behind decisions).
- **Canonical process map:** `docs/PROCESS.md` (esp. "Editing creatives" + the retrofit pattern).

## Run it
```
node scripts/editor-server.mjs              # :5173 — plan API + render
node "brand/video-templates/serve.mjs"      # :5599 — the review page
# open: http://localhost:5599/review.html?campaign=velocity-code-youth
```
Verification this whole project used **headless puppeteer probes** against the running servers
(open the page, drive it, read the DOM / extract a rendered frame). Examples in `.tmp/probe-*.mjs`.

## The system today — TWO editors (reached from each card's "Edit")
- **Image / static editor** — `out/editor/editor.html` (served by editor-server at `/editor`,
  opened in an iframe modal from review.html). A **layer model** (`state.config` =
  `elements/fixedDesign/media`): drag, `+Text`/`+Rect`, a props panel (x/y/size/color/text),
  value-swap dropdown, multi-line text (`<textarea>` → sets `el.whiteSpace`), undo/redo.
  Renders through `templates/multi-sport-foundations/_helpers.jsx` (`renderTextLayer`, honors
  `el.whiteSpace`).
- **Video / gif editor** — the React `VideoEditModal` in `brand/video-templates/review.html`.
  Tabs **COPY / MEDIA / AUDIO / SWAP / POSITION**. Text = `data[key]`; geometry =
  `data._overrides[key]` (dx/dy/fontSize). `TplText` (animations.jsx) wraps each text element
  (auto-fit, override, `data-ov-key`); `DragOverlay` = click/shift-select/group-move + wheel/±
  resize; `ExtrasLayer` = add free text boxes; `wordTokens` = newline-aware word-by-word reveal;
  undo/redo. Renders through `scripts/run-campaign.mjs` (motion wrapper + `window.__CONFIG__`);
  **preview == render** because both mount the same components.

## OPEN PROBLEM 1 — newline still doesn't move text to a new line (in the editor)
Pressing Enter in a headline's COPY field still doesn't break the line on Cody's screen, even
after the fixes below.

Already done (verified headless + in actual renders, so the code path *works in a clean browser*):
- Video COPY fields render as `<textarea>` (Enter inserts `\n`).
- `TplText` uses `white-space: pre-line` (honors `\n`).
- Word-by-word fields (quote-card `quoteText`, meet-coach `quote`, coach-lt `coachTitle`) now
  tokenize via `wordTokens()` → `{br:true}` flex spacers, so `\n` forces a line break while the
  word-by-word animation is preserved. (Verified: D2 quote broke in the live preview AND the MP4.)
- Static editor sets `el.whiteSpace='pre-wrap'` when text contains `\n`.

**PRIME SUSPECT: stale browser cache.** `brand/video-templates/serve.mjs` (:5599) sends **no
cache headers**, and the page loads React + Babel + ~70 `.jsx` files via
`<script type="text/babel">` — browsers cache these hard, so Cody may be running OLD compiled
code (which is exactly the "my fix isn't showing" symptom).
1. **First**, rule out cache: hard-reload (Ctrl+Shift+R) or DevTools → Network → "Disable cache",
   and/or add `Cache-Control: no-store` to `serve.mjs`. Confirm the served `review.html` /
   `animations.jsx` match `git HEAD`.
2. **Then**, if it still fails, pin the EXACT asset + field + template and check which render mode
   that field uses: direct (`pre-line` — should break), word-split (`wordTokens` — should break),
   or `white-space: nowrap` (eyebrow / CTA — intentionally one line, won't break by design).

## OPEN PROBLEM 2 — unify the two editors (Cody's preferred direction)
Cody wants **ONE editor**, modeled on the **video editor's structure/layout** (he prefers it),
with the video-side capabilities applied to images too (tab layout, drag/group/resize, add-text,
value-swap, undo/redo). Today the static editor is a separate iframe app on a different data model
(`config` layer JSON + `_helpers.jsx` render) than the video editor (`data` + `_overrides` +
`TplText` render). Unifying means reconciling those two render backends — scope carefully:
- Option A: bring the video modal's interaction model + UI onto the static layer model.
- Option B: a shared editor component both invoke, with a render adapter per backend.
- North star (see PROCESS.md): creatives-as-layer-documents so editing is generic across
  static + motion. That's the real long-term unification, and a sizable rebuild.

## Key files
`brand/video-templates/review.html` (video modal + cards + readiness badges) ·
`brand/video-templates/animations.jsx` (`TplText`, `ExtrasLayer`, `wordTokens`, `Stage`) ·
`brand/video-templates/templates/*.jsx` (5 retrofitted: stat-reveal, quote-card,
coach-lower-thirds, logo-sting, meet-coach) · `out/editor/editor.html` (static editor) ·
`templates/multi-sport-foundations/_helpers.jsx` (static render) ·
`scripts/run-campaign.mjs` (motion render) · `scripts/editor-server.mjs` (routes:
`/plan`, `/campaign-config`, `/render-asset`, `/template-spec`, `/bank`, `/media`,
`/campaign-values`).

## Deferred (known, NOT bugs)
Audio is silent (no ffmpeg mux); fresh `[F]` assets need `compose-creative` (not built);
E5/E6 are `template:null` (unmapped); the planner's `templateData` keys don't always match
template field names (so some videos render default copy — fix belongs in `/creative-engine`);
the other ~67 bank templates aren't retrofitted yet (lazy / as-used — pattern in PROCESS.md).

## Protected zones note
`.claude/skills/**` is a locked zone (`/unlock-skills` to edit; `fonts.mjs` lives there). The
review page + templates + scripts are NOT protected.

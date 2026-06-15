---
title: Packaging the portable editor into one embeddable ESM (Phase 4.1)
date: 2026-06-14
branch: main
---

> ⛔ **SUPERSEDED same day (2026-06-14).** The bundle below was built for an *import-the-code*
> integration. We then verified Kraken embeds everything by **iframing a URL** and has no
> code-import path — so the bundle was the wrong artifact and was **deleted**. The real Phase-4
> deliverable is the existing editor page (`editor-host.html`) iframed by URL (`?view=1` = view,
> no param = edit) + the handoff contract (`docs/kraken-editor-mount-handoff.md`). The bigger
> lesson: **verify how the consumer actually consumes before packaging for it** (the iframe-vs-
> import question) — I packaged ahead of a verified need. The technical notes below are kept as
> reference (the SSR-safe mount-time injection, the node-export-in-a-browser-bundle risk, and
> "exercise the real edit path, not just a CSS class, when proving a toggle" all still hold).

## The problem

The Phase-2 editor mounts as **four cooperating files**: `editor.js` (imports
`montage.mjs`), `editor.css` (host `<link>`), and `apply-overrides.js` (the host had to
**fetch it as text into `window.__CE_APPLY_SRC__` BEFORE editor.js ran**, then re-serve all
four by relative path). That works on our own dev host (`editor-host.html`). It does **not**
survive being dropped into a foreign host on a different origin — the Kraken Next.js app
can't be trusted to fetch our peer files by relative path or to honor that load order.

## The fix — one self-contained ES module

`creative-engine/editor/bundle.mjs` is a deterministic **string concat** of our own files
(no bundler, no framework, zero v1 imports) → `dist/creative-engine-editor.bundle.js`:

- inline `montage.mjs` with `export ` stripped (its names land in module scope, exactly
  what editor.js's import wanted) — it imports nothing at the top level, so it inlines clean;
- remove editor.js's `import … from './montage.mjs'` (names now in scope above);
- embed `editor.css` + `apply-overrides.js` **source** as `JSON.stringify`'d string consts.

Host now does ONE thing: `import { mountEditor } from '.../bundle.js'`.

## The landmines (what would have bitten later)

1. **Inject chrome at MOUNT time, never import time.** The bundle injects its `<style>` and
   sets `window.__CE_APPLY_SRC__` inside a lazy idempotent `__ceEnsureChrome()` called as the
   first line of `mountEditor()`. If you run that at module top-level, `document`/`window` are
   undefined under SSR (Next.js) and the import throws on the server. Lazy = SSR-safe.
2. **seek.js is render-only — keep it OUT of the editor bundle.** Only `render-frame.mjs`
   uses it; the live editor never does. Bundling it would bloat the thing Kraken ships and
   blur the boundary (render stays in this repo, per the plan).
3. **Check the self-contained guarantee, don't assume it.** The build greps its own output
   for any surviving relative `import … from './…'` and `process.exit(1)` if found. "0 peer
   imports" is the whole point of a bundle, so it's a hard gate, not a hope.
4. **No top-level name collisions** between the two inlined files — verify before concat
   (here: editor = IFRAME_CSS/clone/mountEditor; montage = STAGE_W/clipFrames/…; disjoint).

## Evidence discipline

`dist/embed-evidence.mjs` drives the bare host headless on the **real tagged Westfield
design** and proves the permission flag two ways per lane: **state** (iframe `<body>.ce-edit`
+ the chrome hint) and **behavior** (a real `dblclick` makes text `contenteditable` in
`edit`, inert in `view`). 10/10 PASS + screenshots. A flag that only flips a CSS class is
not proof it toggles the lane — exercise the actual edit path.

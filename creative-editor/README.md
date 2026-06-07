# creative-editor

A **portable** layer/position + media editor for JSX templates. This is the
detached core of the Athletes-Acceleration editor (Phase 4c): the parts that have
nothing to do with AA campaigns or Kraken, packaged so the editor can drop into
any repo.

Everything host-specific — **campaigns, Kraken, and the JSX→video/PNG renderer** —
is injected via adapters and plugins. The core only knows how to: list/resolve
templates, serve a template's media from anywhere on disk, read/write a template's
config, serve the editor UI, and advertise its capabilities.

## Quick start (standalone)

```bash
node creative-editor/example/run.mjs        # → http://localhost:5777/editor#demo
```

`example/run.mjs` is the minimum wiring: template roots + a local media provider,
no campaigns, no Kraken, no renderer. `/render-template` replies `501` until a host
injects a renderer — proving the core is renderer-agnostic.

## API

```js
import { createEditorServer } from "creative-editor";
import { createTemplateRoots } from "creative-editor/template-roots";
import { createLocalMediaProvider } from "creative-editor/providers/local-media";

const server = createEditorServer({
  templateRoots,    // REQUIRED — see below
  mediaProvider,    // optional — media picker/upload/serve
  renderer,         // optional — JSX → output
  editorHtmlPath,   // path to the editor UI html (served at / and /editor)
  outDir,           // rendered output dir, served at /out/*
  plugins: [],      // host route handlers (campaigns, Kraken…), tried first
  capabilities: {}, // { campaigns, kraken, copySwap } advertised at /capabilities
});
server.listen(5173);
```

### Adapters

**`templateRoots`** (required) — resolves a template id to files. Use the bundled
factory or pass your own object with these methods:
```js
createTemplateRoots({ dirs: ["templates"], scanSubdirs: true })
// → { findTemplate(id) -> {dir,configPath,jsxPath}|null,
//     listTemplates() -> [id], assetsDirFor(id) -> dir|null, STATIC_ROOTS() -> [dir] }
```

**`mediaProvider`** (optional) — backs the media picker. Kraken/S3/CMS are just
other implementations of:
```js
{ list(kind) -> [{id,path,source}],   // kind: photo|clip|audio
  filePath(ref) -> absPath|null,       // guarded resolve
  upload?(buf,name,kind) -> ref,
  remoteBrowse?() }                     // truthy ⇒ /capabilities.kraken = true
```
`providers/local-media.mjs` is a reference local-filesystem impl.

**`renderer`** (optional) — turns a template's `.jsx` into output:
```js
{ render(jsxPath, { out }) -> { ok, outPath, exitCode } }
```

**`plugins`** — `Array<(req, res, ctx) => boolean>`, tried BEFORE core routes;
return `true` if handled. This is where a host adds the campaign API
(`/plan`, `/campaign-config`, `/validation`, …) and Kraken routes. `ctx` provides
`{ url, path, send, sendJson, sendFile, readBody, templateRoots, mediaProvider, renderer }`.

## Core routes

`GET /capabilities` · `GET /clusters` · `GET|POST /template-config/:id`
(GET returns the `X-Template-Base` header) · `POST /render-template/:id`
· `GET /template-asset/:id/*` · `GET /media?kind=` · `GET /media-file/:ref`
· `POST /media-into-template {src,editorId}` · `GET /out/*` · `GET /` · `GET /editor`

## Wiring AA onto this module (the remaining consolidation)

AA's `scripts/editor-server.mjs` is still the standalone reference implementation —
it was **not** rewired onto this module yet, on purpose: it's in active daily use,
and the consolidation is best done once there's a second host to validate against.
When that day comes, AA becomes:

```js
createEditorServer({
  templateRoots: aaTemplateRoots,        // scripts/lib/template-roots.mjs
  mediaProvider: krakenProvider,         // wraps scripts/lib/kraken.mjs (+ brand roots)
  renderer: jsxToMp4,                     // wraps .claude/skills/jsx-to-mp4
  editorHtmlPath: "out/editor/editor.html",
  plugins: [campaignPlugin],             // /plan /campaign-config /validation /approve-trim /render-asset
  capabilities: { campaigns: true, copySwap: true },
});
```

The campaign plugin keeps AA's `resolveStaticConfig` / `roles` / `copy-library` /
`validatePlan` (the compliance gate) host-side — they never enter this package.

# Editor portability — run the creative editor in ANY project

The image/video editor is a **portable engine** (`creative-editor/`) plus a small set of
host **adapters**. AA itself now runs on it (`scripts/editor-server.mjs` boots the thin host
`scripts/editor-server.next.mjs`). A brand-new project gets the *whole* editor — media
browse, clip trim, loop, audio + waveform, Frame.io markup, mute, render — by wiring three
adapters and running one launcher.

> The plain-English version: the editor is now a **reusable part**, not glued to AA. Any
> project that drops in the part + a tiny config gets the editor for free.

---

## 1. Drop it into a project

Copy two folders into your project (or install `creative-editor` as a package):

```
creative-editor/        # the engine (zero external deps — Node builtins only)
out/editor/             # the editor UI bundle: editor.html + vendor/moveable.min.js
```

Add an `editor.config.mjs` at your project root (copy `creative-editor/editor.config.example.mjs`)
and run:

```bash
EDITOR_PORT=5173 node creative-editor/run.mjs
# → http://localhost:5173/editor#<your-template-id>
```

`run.mjs` loads your `editor.config.mjs`, which default-exports the engine config.

---

## 2. The three adapters

`createEditorServer({ templateRoots, mediaProvider, renderer, editorHtmlPath, outDir, dataDir, plugins, capabilities })`

| Adapter | What it does | Reuse |
|---|---|---|
| **templateRoots** (required) | resolves a template id → `{dir, configPath, jsxPath}` | `createTemplateRoots({ dirs })` |
| **mediaProvider** (optional) | the media grid + `filePath` + `upload` (+ `remoteBrowse` for a library) | `createLocalMediaProvider(...)` or your own |
| **renderer** (optional) | JSX → image/MP4. Contract: `render({id,jsxPath,configPath,outDir,signal}) → {ok,format,outPath,exitCode}`. Null → `/render-template` returns a clean **501** | wrap your render tool |

Everything generic (clusters, template-config, **`/peaks`** waveform, **`/annotations*`** review
markup, **`/media-upload`**, **`/out`**, the editor UI) is in the engine. Host-specific routes
(e.g. a campaign API) go in `plugins: [...]`, which run **before** the engine core.

The editor UI (`editor.html`) is no-build vanilla JS and uses **relative** fetches, so it works
on any origin/port. It loads `/out/editor/vendor/moveable.min.js` — make sure `outDir` serves
`out/editor/vendor/` (ship `out/editor/` into your project).

---

## 3. Connect a content library

Two ways — both plug in as the media provider's **`remoteBrowse`** (`workspaces → folders →
files → pull-file`); the engine wires them to `/kraken/*` automatically.

**A) Supabase / The Kraken (what AA uses — no MCP).**
The connection is a direct, credentialed Supabase call isolated inside spawned CLIs. A project needs:

1. `.claude/skills/creative-engine/config.json`:
   ```json
   { "kraken": { "supabaseHost": "<host>.supabase.co", "credentialsEnvPath": "C:/path/to/The Kraken/.env.local" } }
   ```
2. The Kraken's `.env.local` at that path with `SUPABASE_SERVICE_ROLE_KEY` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Then in `editor.config.mjs`:
```js
import { createKrakenMediaProvider } from "./creative-editor/providers/kraken-media.mjs";
// mediaProvider: { ...localProvider, remoteBrowse: createKrakenMediaProvider({ cwd: ROOT, scriptsDir }).remoteBrowse }
```
Workspaces auto-list live; no hand-maintained list. (No MCP involved — this is direct Supabase.)

**B) An MCP-backed provider (a "creative MCP").**
If you maintain a creative MCP, implement a `remoteBrowse` whose four methods call your MCP's
tools and return the same shapes (`{workspaces:[{id,name}]}`, `{folders:[...]}`, `{files:[...]}`,
`{exitCode, ...}`). Drop it in as `mediaProvider.remoteBrowse`. The editor doesn't care how the
library is reached — only the provider does.

---

## 4. How AA wires it (reference)

`scripts/editor-server.next.mjs`:
```js
createEditorServer({
  templateRoots: { findTemplate, listTemplates, assetsDirFor },   // scripts/lib/template-roots.mjs
  mediaProvider: createAaMediaProvider({ cwd: ROOT }),            // filePath/upload + Kraken remoteBrowse
  renderer:      createAaRenderer({ cwd: ROOT }),                // video→layer-config-video, else jsx-to-mp4
  plugins:       [createCampaignPlugin({ cwd: ROOT })],          // AA campaign API + brand-scoped /media
  editorHtmlPath, outDir, dataDir, capabilities: { campaigns: true },
})
```
A non-AA project simply omits the campaign plugin and swaps the AA media/renderer adapters for its own.

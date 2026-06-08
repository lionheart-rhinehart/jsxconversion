// ============================================================================
//  editor.config.example.mjs — copy to `editor.config.mjs` in YOUR project,
//  edit, then:  EDITOR_PORT=5173 node creative-editor/run.mjs
// ----------------------------------------------------------------------------
//  Default-export the createEditorServer config (or a function returning it).
//  Only `templateRoots` is required; everything else is optional and degrades.
// ============================================================================
import { join } from "node:path";
import { createTemplateRoots } from "./template-roots.mjs";
import { createLocalMediaProvider } from "./providers/local-media.mjs";
// To browse a content library, swap in a remoteBrowse provider, e.g.:
//   import { createKrakenMediaProvider } from "./providers/kraken-media.mjs";

export default function editorConfig() {
  const ROOT = process.cwd();
  return {
    // REQUIRED — where your templates live (each <id>.config.json [+ <id>.jsx]).
    templateRoots: createTemplateRoots({ dirs: [join(ROOT, "templates")], scanSubdirs: true }),

    // OPTIONAL — the media grid + upload + /media-file. Swap for S3/CMS/Kraken.
    mediaProvider: createLocalMediaProvider({
      roots: [{ dir: join(ROOT, "templates", "assets"), source: "local" }],
      uploadDir: join(ROOT, "templates", "assets"),
      // To add a content-library browser, compose a remoteBrowse provider:
      //   remoteBrowse: createKrakenMediaProvider({ cwd: ROOT, scriptsDir: join(ROOT, "scripts") }).remoteBrowse,
    }),

    // OPTIONAL — your JSX -> image/MP4 renderer. Leave null and /render-template
    // returns a clean 501 (the editor still loads + edits; you just can't render here).
    // Contract: render({ id, jsxPath, configPath, outDir, signal }) -> { ok, format, outPath, exitCode }.
    renderer: null,

    // The editor UI bundle. Copy creative-editor's `out/editor/` (editor.html +
    // vendor/) into your project and point here; outDir must serve /out/editor/vendor/.
    editorHtmlPath: join(ROOT, "out", "editor", "editor.html"),
    outDir: join(ROOT, "out"),

    // Where the editor's caches land (.peaks-cache/, .annotations-store/).
    dataDir: ROOT,

    // Host-specific routes (campaign APIs, etc.) — run BEFORE the engine core.
    plugins: [],

    capabilities: { campaigns: false, copySwap: false },
  };
}

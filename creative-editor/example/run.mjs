// ============================================================================
//  creative-editor/example/run.mjs — boot the portable editor standalone.
// ============================================================================
//  Shows the minimum wiring a host repo needs:  template roots + (optional) a
//  media provider + (optional) a renderer.  No campaigns, no Kraken — the core.
//
//    node creative-editor/example/run.mjs            (port 5777)
//    PORT=6000 node creative-editor/example/run.mjs
// ============================================================================
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createEditorServer } from "../server.mjs";
import { createTemplateRoots } from "../template-roots.mjs";
import { createLocalMediaProvider } from "../providers/local-media.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5777;

const templateRoots = createTemplateRoots({ dirs: [join(HERE, "templates")] });
const mediaProvider = createLocalMediaProvider({
  roots: [{ dir: join(HERE, "templates", "assets"), source: "demo" }],
  uploadDir: join(HERE, "templates", "assets"),
});

// A host wires its own JSX→PNG renderer here. The example leaves it null, so
// /render-template replies 501 ("no renderer configured") — proving the core is
// renderer-agnostic. AA would inject its jsx-to-mp4 skill.
const server = createEditorServer({
  templateRoots,
  mediaProvider,
  renderer: null,
  // Reuse the real editor UI so the example is usable; a host ships its own copy.
  editorHtmlPath: resolve(HERE, "..", "..", "out", "editor", "editor.html"),
  outDir: join(HERE, "out"),
  capabilities: { campaigns: false, copySwap: false }, // core-only host
});

server.listen(PORT, () => {
  console.log(`creative-editor (standalone core) on http://localhost:${PORT}/`);
  console.log(`  templates:  ${join(HERE, "templates")}`);
  console.log(`  open:       http://localhost:${PORT}/editor#demo`);
});

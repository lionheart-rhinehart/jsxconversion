#!/usr/bin/env node
// ============================================================================
//  scripts/editor-server.next.mjs — Phase-C THIN HOST: the AA editor wired onto
//  the portable createEditorServer engine. NOT YET LIVE — it runs alongside the
//  current editor-server.mjs so it can be proven on a separate port BEFORE the
//  atomic swap:   EDITOR_PORT=5273 node scripts/editor-server.next.mjs
// ----------------------------------------------------------------------------
//  All the GENERIC editor surface (clusters, template-config, media-file,
//  media-upload, peaks, annotations, render, Kraken browse, out, editor.html)
//  comes from the engine + AA's injected adapters:
//    templateRoots  -> scripts/lib/template-roots.mjs (keeps .editor-config.json /
//                      `npm run edit` resolution — U5)
//    mediaProvider  -> scripts/lib/aa-media-provider.mjs (filePath/upload + Kraken)
//    renderer       -> scripts/lib/aa-renderer.mjs (video/jsx dispatch — U1)
//
//  REMAINING for the swap: the `campaignPlugin` (campaign API, brand-scoped /media,
//  drive, bank, template-spec, /kraken/state + whole-folder pull). Standalone-
//  template editing (the SA0 parity surface) already works without it.
// ============================================================================
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { createEditorServer } from "../creative-editor/server.mjs";
import { findTemplate, listTemplates, assetsDirFor } from "./lib/template-roots.mjs";
import { createAaMediaProvider } from "./lib/aa-media-provider.mjs";
import { createAaRenderer } from "./lib/aa-renderer.mjs";
import { createCampaignPlugin } from "./lib/aa-campaign-plugin.mjs";

const ROOT = resolve(join(dirname(fileURLToPath(import.meta.url)), ".."));
const PORT = Number(process.env.EDITOR_PORT) || 5173;

// AA's resolver already matches the engine contract ({dir,configPath,jsxPath}); the
// thin adapter just drops the optional campaign arg (the campaign plugin re-adds it).
const templateRoots = {
  findTemplate: (id) => findTemplate(id),
  listTemplates: () => listTemplates(),
  assetsDirFor: (id) => assetsDirFor(id),
};

// The campaign plugin owns all AA-campaign routes (review API, brand-scoped /media,
// drive, bank, template-spec, /kraken/state + whole-folder pull). It runs BEFORE the
// engine core, so the generic /kraken browse still falls through to the provider.
const plugins = [createCampaignPlugin({ cwd: ROOT })];

const server = createEditorServer({
  templateRoots,
  mediaProvider: createAaMediaProvider({ cwd: ROOT }),
  renderer: createAaRenderer({ cwd: ROOT }),
  dataDir: ROOT,
  editorHtmlPath: join(ROOT, "out/editor/editor.html"),
  outDir: join(ROOT, "out"),
  plugins,
  capabilities: { campaigns: plugins.length > 0, copySwap: false },
});

server.listen(PORT, () => console.log(`[editor-next] http://localhost:${PORT}/  — AA thin host on createEditorServer`));

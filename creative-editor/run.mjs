#!/usr/bin/env node
// ============================================================================
//  creative-editor/run.mjs — generic launcher. Any project drops in an
//  `editor.config.mjs` (default-exporting the createEditorServer config, or a
//  function returning it) and runs:
//
//      EDITOR_PORT=5173 node creative-editor/run.mjs
//      node creative-editor/run.mjs --config ./my-editor.config.mjs
//
//  The config wires the host's adapters (templateRoots, mediaProvider, renderer,
//  editorHtmlPath, outDir, dataDir, plugins, capabilities). See
//  ./editor.config.example.mjs and docs/editor-portability.md.
// ============================================================================
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { createEditorServer } from "./server.mjs";

const argOf = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : null; };
const cfgPath = resolve(argOf("config") || process.env.EDITOR_CONFIG || "editor.config.mjs");
if (!existsSync(cfgPath)) {
  console.error(`[creative-editor] no config at ${cfgPath}\n  Create an editor.config.mjs (see creative-editor/editor.config.example.mjs) or pass --config <path>.`);
  process.exit(1);
}
const mod = await import(pathToFileURL(cfgPath).href).catch((e) => { console.error(`[creative-editor] could not load ${cfgPath}: ${e.message}`); process.exit(1); });
const made = mod.default ?? mod.config;
const config = typeof made === "function" ? await made() : made;
if (!config || typeof config !== "object") { console.error("[creative-editor] config must default-export an object (or a function returning one)"); process.exit(1); }

const PORT = Number(process.env.EDITOR_PORT) || config.port || 5173;
createEditorServer(config).listen(PORT, () => console.log(`[creative-editor] http://localhost:${PORT}/editor  — engine + host adapters`));

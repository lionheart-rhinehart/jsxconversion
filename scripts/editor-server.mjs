#!/usr/bin/env node
// ============================================================================
//  scripts/editor-server.mjs — AA editor entrypoint.
// ----------------------------------------------------------------------------
//  STANDALONE CONSOLIDATION (Phase C swap): the editor's IMPLEMENTATION is now the
//  THIN HOST on the portable `creative-editor` engine — see ./editor-server.next.mjs
//  (createEditorServer + AA adapters: template-roots, aa-media-provider, aa-renderer,
//  aa-campaign-plugin). This file stays the stable entrypoint that dev.mjs /
//  `npm run dev` / `npm run edit` reference; it just boots the thin host.
//
//  The previous 1589-line monolith is in git history (pre-swap). Proven before this
//  swap: the SA0 parity smoke (12/12) + the campaign-API smoke (8/8) on :5273.
// ============================================================================
import "./editor-server.next.mjs";

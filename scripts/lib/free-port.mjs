// ============================================================================
//  scripts/lib/free-port.mjs — first free TCP port at/above a base (Plan 3 · I)
// ============================================================================
//  dev.mjs picks a per-workspace port so two checkouts never EADDRINUSE-clash.
//  Extracted here so the auto-increment behaviour is unit-testable (it used to be
//  an un-exported closure inside dev.mjs).
//
//  IMPORTANT: probe with `listen(p)` and NO host — the real servers
//  (editor-server.mjs, serve.mjs) bind dual-stack `::` the same way. Probing
//  127.0.0.1 instead would report a port "free" that another `::`-bound server
//  already holds, then the real bind would EADDRINUSE.
// ============================================================================
import { createServer } from "node:net";

// Resolve to the first free port at or above `start`, scanning up to `start+span`
// (bounded so a bug can't scan forever). Rejects on a non-EADDRINUSE error or if
// the whole window is occupied.
export function findFreePort(start, span = 100) {
  return new Promise((res, rej) => {
    const tryPort = (p) => {
      const srv = createServer();
      srv.once("error", (e) => {
        srv.close();
        if (e.code === "EADDRINUSE" && p < start + span) tryPort(p + 1);
        else rej(e);
      });
      srv.once("listening", () => srv.close(() => res(p)));
      srv.listen(p);
    };
    tryPort(start);
  });
}

// ============================================================================
//  scripts/lib/orphan-sweep.mjs — reap orphaned render-Chrome (Plan 3 · J)
// ============================================================================
//  A killed or crashed render can leave a Chrome whose parent node process is
//  already gone. Those orphans pile up (Jarosh: 33 chrome + 138 node choked the
//  machine, a 7-sec clip hung 4+ min). On dev start we sweep: find the orphans
//  and tree-kill them.
//
//  IDENTIFYING render-Chrome SAFELY is the whole game. Puppeteer (v23, headless:
//  true) runs the FULL `chrome.exe` from its own download cache —
//  `…\.cache\puppeteer\chrome\…\chrome.exe` — NOT `chrome-headless-shell`. So we
//  match on the PUPPETEER-CACHE PATH, never the image name: that catches the real
//  orphans AND can never touch the user's normal browser (Program Files / system
//  Chrome lives outside the cache). Then we keep ONLY the ones whose PARENT is no
//  longer alive (a live parent = an active render) and tree-kill those.
// ============================================================================
import { spawnSync } from "node:child_process";

// A process is render-Chrome iff its executable/command sits under the puppeteer
// download cache. Matches both `chrome.exe` (new headless) and a
// `chrome-headless-shell` if `headless:"shell"` is ever used.
const PUPPETEER_PATH_RE = /[\\/]\.cache[\\/]puppeteer[\\/]/i;

// Pure decision rule (exported for tests): given a list of {pid,ppid} shell procs
// and an isAlive(pid)->bool predicate, return the pids to kill — the shells whose
// parent is dead (true orphans). A live parent is left strictly alone.
export function selectOrphans(procs, isAlive) {
  const out = [];
  for (const p of procs) {
    if (!p || !p.pid) continue;
    const parent = p.ppid;
    if (parent == null || parent <= 0 || !isAlive(parent)) out.push(p.pid);
  }
  return out;
}

// Cross-platform liveness via signal 0 (works on win32 too). EPERM means the pid
// exists but we can't signal it → treat as ALIVE (conservative: never reap a shell
// whose owner might still be running).
export function pidIsAlive(pid) {
  try { process.kill(pid, 0); return true; }
  catch (e) { return e && e.code === "EPERM"; }
}

// Parse "pid|ppid|execpath" lines into [{pid,ppid,path}]. The `|` delimiter is
// safe — Windows paths never contain it, but contain spaces/backslashes that a
// CSV/space split would mangle. Exported for tests.
export function parseProcLines(stdout) {
  const out = [];
  for (const line of String(stdout || "").split(/\r?\n/)) {
    const m = line.match(/^(\d+)\|(\d+)\|(.*)$/);
    if (m) out.push({ pid: Number(m[1]), ppid: Number(m[2]), path: m[3].trim() });
  }
  return out;
}

// Keep only the procs whose executable path is under the puppeteer cache. We do
// this match in JS (not in the PowerShell -like) on purpose: a backslash path
// pattern gets mangled passing Node→PowerShell, and many of Chrome's child procs
// report a NULL path anyway — so we match the path-bearing ROOT procs here and let
// the tree-kill (/T) reap their pathless children. Exported for tests.
export function filterPuppeteerCache(procs) {
  return procs.filter((p) => p.path && PUPPETEER_PATH_RE.test(p.path))
    .map((p) => ({ pid: p.pid, ppid: p.ppid }));
}

// List running render-Chrome processes (those under the puppeteer cache) as
// [{pid,ppid}]. OS-specific; the kill decision stays in selectOrphans so it can
// be unit-tested without spawning.
function listRenderChromes() {
  if (process.platform === "win32") {
    // Narrow by image name in PowerShell (no backslashes), emit pid|ppid|path,
    // then filter to the cache path in JS.
    const r = spawnSync("powershell", ["-NoProfile", "-Command",
      "Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq 'chrome.exe' -or $_.Name -eq 'chrome-headless-shell.exe' } | ForEach-Object { \"$($_.ProcessId)|$($_.ParentProcessId)|$($_.ExecutablePath)\" }"],
      { encoding: "utf8" });
    return filterPuppeteerCache(parseProcLines(r.stdout));
  }
  // posix: pid + ppid + full command; match the cache path in the executable arg.
  const r = spawnSync("bash", ["-c", "ps -eo pid=,ppid=,args= 2>/dev/null || true"], { encoding: "utf8" });
  const out = [];
  for (const line of (r.stdout || "").split(/\r?\n/)) {
    const m = line.trim().match(/^(\d+)\s+(\d+)\s+(.*)$/);
    if (m && PUPPETEER_PATH_RE.test(m[3])) out.push({ pid: Number(m[1]), ppid: Number(m[2]) });
  }
  return out;
}

function killPid(pid) {
  try {
    if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    else process.kill(pid, "SIGKILL");
    return true;
  } catch { return false; }
}

// Sweep orphaned render-Chrome. Returns { scanned, killed, pids }. Never throws
// — a sweep failure must not block dev startup.
export function sweepOrphans() {
  try {
    const chromes = listRenderChromes();
    const orphans = selectOrphans(chromes, pidIsAlive);
    let killed = 0;
    for (const pid of orphans) if (killPid(pid)) killed++;
    return { scanned: chromes.length, killed, pids: orphans };
  } catch (e) {
    return { scanned: 0, killed: 0, pids: [], error: String((e && e.message) || e) };
  }
}

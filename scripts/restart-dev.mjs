#!/usr/bin/env node
// ============================================================================
//  scripts/restart-dev.mjs — stop THIS workspace's dev servers and relaunch them.
// ============================================================================
//  Frees the editor/review ports this checkout uses, then starts dev.mjs DETACHED
//  so the servers keep running independent of any terminal or chat session (logs →
//  .tmp/dev-server.log). This is the one-action replacement for the manual
//  "Ctrl+C in the dev terminal, then npm run dev again" dance — it's needed after
//  editing dev.mjs itself (the launcher/port-picker isn't covered by --watch).
//
//  Scoping: it kills ONLY the ports this workspace owns — the exact pair dev.mjs
//  last wrote to .dev-ports.json, else the base pair for this checkout type (main
//  5173/5599 vs worktree 5183/5609). A worktree therefore never kills the main
//  checkout's server, and vice versa.
//
//  Usage:  npm run restart      (or the /restart-dev slash command)
// ============================================================================
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync, openSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(".");
const isWin = process.platform === "win32";
const isWT = ROOT.replace(/\\/g, "/").includes("/.claude/worktrees/");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Which ports belong to THIS workspace?
function targetPorts() {
  try {
    const f = join(ROOT, ".dev-ports.json");
    if (existsSync(f)) {
      const d = JSON.parse(readFileSync(f, "utf8"));
      const ps = [d.editor, d.review].filter(Boolean);
      if (ps.length) return ps;
    }
  } catch { /* ignore — fall through to the base pair */ }
  return isWT ? [5183, 5609] : [5173, 5599];
}

// Kill whatever holds those ports, plus the node ancestors that launched them
// (the dev.mjs launcher + its --watch supervisors) so nothing lingers or respawns.
function freePorts(ports) {
  if (isWin) {
    // One PowerShell pass: find listeners → walk up the node-only parent chain →
    // taskkill /T /F each. NOTE: $pid is a PowerShell automatic var — never reuse it.
    const ps = `
$ports = @(${ports.join(",")})
$kill = New-Object System.Collections.Generic.HashSet[int]
foreach ($port in $ports) {
  $owners = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($owner in $owners) {
    [void]$kill.Add([int]$owner)
    $cur = [int]$owner
    for ($i = 0; $i -lt 8; $i++) {
      $p = Get-CimInstance Win32_Process -Filter "ProcessId=$cur" -ErrorAction SilentlyContinue
      if (-not $p) { break }
      $par = [int]$p.ParentProcessId
      if ($par -le 0) { break }
      $pp = Get-CimInstance Win32_Process -Filter "ProcessId=$par" -ErrorAction SilentlyContinue
      if (-not $pp -or $pp.Name -notmatch '^node') { break }
      [void]$kill.Add($par)
      $cur = $par
    }
  }
}
foreach ($k in $kill) { cmd /c "taskkill /PID $k /T /F >nul 2>&1" }
"killed=$($kill.Count)"
`;
    const r = spawnSync("powershell", ["-NoProfile", "-Command", ps], { encoding: "utf8" });
    return (r.stdout || "").trim();
  }
  // posix: kill the port listeners (cloud rarely needs this path).
  let n = 0;
  for (const port of ports) {
    const r = spawnSync("bash", ["-c", `lsof -ti tcp:${port} 2>/dev/null || true`], { encoding: "utf8" });
    for (const pid of (r.stdout || "").split(/\s+/).filter(Boolean)) {
      try { process.kill(Number(pid), "SIGKILL"); n++; } catch { /* already gone */ }
    }
  }
  return `killed=${n}`;
}

const ports = targetPorts();
console.log(`[restart-dev] freeing ${isWT ? "worktree" : "main"} ports ${ports.join(", ")} …`);
console.log(`[restart-dev] ${freePorts(ports)}`);

// Relaunch dev.mjs detached so it outlives this process (and any terminal/chat).
mkdirSync(join(ROOT, ".tmp"), { recursive: true });
const logPath = join(ROOT, ".tmp", "dev-server.log");
const out = openSync(logPath, "a");
const child = spawn(process.execPath, ["scripts/dev.mjs"], {
  cwd: ROOT, detached: true, stdio: ["ignore", out, out], windowsHide: true,
});
child.unref();

// Wait for the fresh server to pick its ports + bind, then report.
const portsFile = join(ROOT, ".dev-ports.json");
let info = null;
const deadline = Date.now() + 8000;
while (Date.now() < deadline) {
  await sleep(400);
  try {
    if (existsSync(portsFile)) {
      const d = JSON.parse(readFileSync(portsFile, "utf8"));
      // confirm it's actually listening (not just the file from a prior run)
      if (d.editor && freePortsHasListener(d.editor)) { info = d; break; }
    }
  } catch { /* keep polling */ }
}

function freePortsHasListener(port) {
  if (isWin) {
    const r = spawnSync("powershell", ["-NoProfile", "-Command",
      `if (Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction SilentlyContinue) { "up" }`],
      { encoding: "utf8" });
    return (r.stdout || "").includes("up");
  }
  const r = spawnSync("bash", ["-c", `lsof -ti tcp:${port} 2>/dev/null || true`], { encoding: "utf8" });
  return (r.stdout || "").trim().length > 0;
}

if (info) {
  const eo = `http://localhost:${info.editor}`;
  console.log(`\n[restart-dev] dev servers are up.`);
  console.log(`  editor : ${eo}/`);
  console.log(`  review : http://localhost:${info.review}/review.html?campaign=<name>&api=${eo}&editor=${eo}`);
  console.log(`  logs   : ${logPath}  (Get-Content "${logPath}" -Wait  to follow)`);
} else {
  console.log(`\n[restart-dev] relaunched detached; ports not confirmed within 8s — check ${logPath}`);
}

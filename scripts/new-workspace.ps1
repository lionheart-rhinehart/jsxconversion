<#
.SYNOPSIS
  Start a second chat safely: create an isolated git worktree + branch off the
  latest main, so two chats never share one working directory (and can't clobber
  each other's uncommitted work). See docs/parallel-chats.md.

.EXAMPLE
  ./scripts/new-workspace.ps1 video-length-fix
  # -> creates .claude/worktrees/video-length-fix on branch chat/video-length-fix
  #    Open a new chat in that folder.
#>
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Name
)

$ErrorActionPreference = "Stop"

# Validate the name: letters, digits, dash, underscore only.
if ($Name -notmatch '^[A-Za-z0-9._-]+$') {
  Write-Host "ERROR: name must contain only letters, digits, '.', '_' or '-'. Got: '$Name'" -ForegroundColor Red
  exit 1
}

# Resolve the repo root (this script lives in <root>/scripts).
$root = (git rev-parse --show-toplevel 2>$null)
if (-not $?) {
  Write-Host "ERROR: not inside a git repository." -ForegroundColor Red
  exit 1
}
$root = $root.Trim()
Set-Location $root

$branch = "chat/$Name"
$relPath = ".claude/worktrees/$Name"
$absPath = Join-Path $root $relPath

# Abort cleanly if the worktree path or branch already exists.
if (Test-Path $absPath) {
  Write-Host "ERROR: worktree folder already exists: $relPath" -ForegroundColor Red
  Write-Host "Pick a different name, or remove it with:  git worktree remove `"$relPath`"" -ForegroundColor Yellow
  exit 1
}
$existingBranch = (git branch --list $branch)
if ($existingBranch) {
  Write-Host "ERROR: branch already exists: $branch" -ForegroundColor Red
  Write-Host "Pick a different name." -ForegroundColor Yellow
  exit 1
}

# Warn (don't block) if there are uncommitted changes here — they do NOT travel to
# the new worktree, which starts clean from origin/main.
$dirty = (git status --porcelain)
if ($dirty) {
  Write-Host "NOTE: this folder has uncommitted changes. They stay here; the new" -ForegroundColor Yellow
  Write-Host "      workspace starts clean from origin/main. Commit first if you want" -ForegroundColor Yellow
  Write-Host "      that work available in the new chat." -ForegroundColor Yellow
}

Write-Host "Fetching latest main..." -ForegroundColor Cyan
git fetch origin --quiet
if (-not $?) { Write-Host "ERROR: git fetch failed." -ForegroundColor Red; exit 1 }

Write-Host "Creating worktree '$relPath' on branch '$branch' (from origin/main)..." -ForegroundColor Cyan
git worktree add $relPath -b $branch origin/main
if (-not $?) { Write-Host "ERROR: git worktree add failed." -ForegroundColor Red; exit 1 }

# A worktree gets its OWN node_modules (gitignored, not shared with the main
# checkout). Without an install here, the renderer fails on every asset with an
# opaque error. Bootstrap it now so the new chat can render immediately.
Write-Host "Installing dependencies (npm install) in the new worktree..." -ForegroundColor Cyan
Push-Location $absPath
try {
  npm install
  if (-not $?) {
    Write-Host "WARNING: npm install failed in the new worktree. Run it manually before rendering:" -ForegroundColor Yellow
    Write-Host "         cd `"$relPath`"; npm install" -ForegroundColor Yellow
  }
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " New isolated workspace ready." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host " Folder:  $absPath"
Write-Host " Branch:  $branch"
Write-Host ""
Write-Host " NEXT: open your SECOND chat in that folder so the two chats don't share"
Write-Host "       one working directory. When its work is done, merge it back to main"
Write-Host "       via a PR (do not copy files between folders)."
Write-Host ""
Write-Host " When finished with it, clean up with:"
Write-Host "   git worktree remove `"$relPath`""
Write-Host "========================================" -ForegroundColor Green

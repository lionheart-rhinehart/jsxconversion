#!/usr/bin/env bash
# SessionStart hook for aa-creative-engine.
#
# Two jobs, both idempotent and best-effort (this script must NEVER abort the
# session — every step guards its own failure and prints ONE clear line):
#   1. Auto-sync `main` with origin via `git pull --ff-only` so fixes never
#      strand on a diverged local tip again (R0). Fast-forward only — it will
#      not clobber local work, and it says exactly why if it can't sync.
#   2. Ensure jsx-to-mp4 render deps are present (ffmpeg + Chromium libs on
#      Linux cloud sessions; npm install on any platform).
#
# Cross-platform: runs under Git Bash (MINGW) on the Windows desktop and under
# bash on the Linux cloud session. The apt/dpkg block is Linux-only — on
# Windows it is skipped (it used to fail silently on `sudo`/`apt-get`).

# NOTE: deliberately no `set -e`. A non-zero step here previously killed the
# whole hook partway through; we want every section to run regardless.

# ---------------------------------------------------------------------------
# 1. Auto-sync main (fast-forward only, never clobber)
# ---------------------------------------------------------------------------
sync_main() {
  command -v git >/dev/null 2>&1 || { echo "[session-start] git not on PATH — skipped auto-sync"; return; }
  git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "[session-start] not a git repo — skipped auto-sync"; return; }

  local branch
  branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  if [ "$branch" != "main" ]; then
    echo "[session-start] on '$branch' (not main) — skipped auto-sync"
    return
  fi

  # A dirty tree blocks a clean ff and is exactly the state that silently
  # skipped the sync before. Say so loudly instead of pretending to sync.
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    echo "[session-start] working tree DIRTY — skipped 'git pull --ff-only'; commit (/save-progress) or stash, then pull"
    return
  fi

  if ! git fetch origin main --quiet 2>/dev/null; then
    echo "[session-start] could not reach origin — skipped auto-sync (working offline?)"
    return
  fi

  # Already current?
  if [ "$(git rev-parse HEAD 2>/dev/null)" = "$(git rev-parse origin/main 2>/dev/null)" ]; then
    echo "[session-start] main already up to date with origin"
    return
  fi

  # Fast-forward is only possible when HEAD is an ancestor of origin/main.
  if git merge-base --is-ancestor HEAD origin/main 2>/dev/null; then
    if git pull --ff-only origin main --quiet 2>/dev/null; then
      echo "[session-start] main fast-forwarded to origin/main ($(git rev-parse --short HEAD))"
    else
      echo "[session-start] 'git pull --ff-only' failed unexpectedly — sync manually"
    fi
  else
    # Local has commits origin doesn't, or the histories diverged: ff impossible.
    local counts ahead behind
    counts="$(git rev-list --left-right --count HEAD...origin/main 2>/dev/null)"
    ahead="$(echo "$counts" | awk '{print $1}')"
    behind="$(echo "$counts" | awk '{print $2}')"
    echo "[session-start] main NOT fast-forwardable (local ahead $ahead / behind $behind) — diverged or unpushed commits; finish with /full-deploy-light or reconcile before working"
  fi
}
sync_main

# ---------------------------------------------------------------------------
# 2. Render deps — Linux cloud only (apt/sudo/dpkg don't exist on Windows)
# ---------------------------------------------------------------------------
ensure_linux_deps() {
  local need_install=()
  command -v ffmpeg >/dev/null 2>&1 || need_install+=(ffmpeg)

  # Puppeteer's bundled Chromium needs these shared libs on Debian/Ubuntu.
  for pkg in libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
             libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
             libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2t64; do
    dpkg -s "$pkg" >/dev/null 2>&1 || need_install+=("$pkg")
  done

  if [ ${#need_install[@]} -gt 0 ]; then
    echo "[session-start] installing: ${need_install[*]}"
    sudo apt-get update -qq || true
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${need_install[@]}" || true
  fi
}

case "$(uname -s 2>/dev/null)" in
  Linux*)
    ensure_linux_deps
    ;;
  *)
    # Windows (MINGW/MSYS/CYGWIN) or macOS: just check ffmpeg is reachable.
    command -v ffmpeg >/dev/null 2>&1 || echo "[session-start] ffmpeg not on PATH — video/gif renders will fail until it's installed"
    ;;
esac

# ---------------------------------------------------------------------------
# 3. npm install (any platform) if deps are missing
# ---------------------------------------------------------------------------
if [ ! -d node_modules ] && [ -f package.json ]; then
  echo "[session-start] running npm install"
  npm install --no-audit --no-fund --loglevel=error || echo "[session-start] npm install failed — run it manually"
fi

echo "[session-start] ready"

#!/usr/bin/env bash
# Ensure system deps for jsx-to-mp4 rendering are present.
# Idempotent — safe to run on every SessionStart.
set -e

need_install=()
command -v ffmpeg >/dev/null 2>&1 || need_install+=(ffmpeg)

# Puppeteer's bundled Chromium needs these shared libs on Debian/Ubuntu.
for pkg in libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
           libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 \
           libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2t64; do
  dpkg -s "$pkg" >/dev/null 2>&1 || need_install+=("$pkg")
done

if [ ${#need_install[@]} -gt 0 ]; then
  echo "[session-start] installing: ${need_install[*]}"
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${need_install[@]}" || true
fi

if [ ! -d node_modules ] && [ -f package.json ]; then
  echo "[session-start] running npm install"
  npm install --no-audit --no-fund --loglevel=error
fi

echo "[session-start] ready"

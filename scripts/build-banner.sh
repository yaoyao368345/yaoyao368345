#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
command -v ffmpeg >/dev/null || { echo 'Install ffmpeg (Ubuntu: sudo apt-get install ffmpeg).' >&2; exit 1; }
command -v ffprobe >/dev/null || { echo 'ffprobe is required (included with ffmpeg).' >&2; exit 1; }
npm ci --no-audit --no-fund
npm test
npm run format:check
npm run build

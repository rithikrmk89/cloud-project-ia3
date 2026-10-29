#!/usr/bin/env bash
set -euo pipefail

if ! command -v bun >/dev/null 2>&1; then
  echo "Bun is required to run this project. Install Bun, then run this file again."
  exit 1
fi

bun install
bun run dev
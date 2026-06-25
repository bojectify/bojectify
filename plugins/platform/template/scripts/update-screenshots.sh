#!/usr/bin/env bash
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Error: specify a component filter to avoid accidentally updating all baselines."
  echo ""
  echo "Usage: pnpm test:screenshots:update <component>"
  echo "Example: pnpm test:screenshots:update heroHeader"
  exit 1
fi

exec vitest run --project screenshots --update "$@"

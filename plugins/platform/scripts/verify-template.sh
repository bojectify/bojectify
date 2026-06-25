#!/usr/bin/env bash
# Materialize the bundled template into a temp dir and prove it builds green
# with no Redis and no CMS. Usage: verify-template.sh [path-to-template]
set -euo pipefail

TEMPLATE_DIR="${1:-$(cd "$(dirname "$0")/.." && pwd)/template}"
# honors $TMPDIR; local runs should set TMPDIR to the session scratchpad
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "Materializing $TEMPLATE_DIR -> $WORK"
cp -R "$TEMPLATE_DIR/." "$WORK/"
cd "$WORK"

# Guard: the CMS layer must be absent from the base template.
for forbidden in cache-handler.mjs codegen.ts src/lib/apolloClient.ts src/lib/graphql; do
  if [ -e "$forbidden" ]; then echo "FAIL: CMS artifact present: $forbidden"; exit 1; fi
done
if grep -RInq -e '@apollo/client' -e 'graphql-codegen' -e 'REDIS_URL' package.json; then
  echo "FAIL: CMS/Redis dependency or env still referenced in package.json"; exit 1
fi

corepack enable
pnpm install --frozen-lockfile=false
pnpm codegen:tokens
pnpm codegen:routes
pnpm typecheck
pnpm lint
pnpm lint:scss
pnpm format:check
pnpm build
echo "TEMPLATE GREEN"

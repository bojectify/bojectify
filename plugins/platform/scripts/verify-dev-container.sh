#!/usr/bin/env bash
# Validate the scaffold-dev-container skill's blocks and worked examples:
#   - each example resolves via `docker compose config` (skipped if docker absent)
#   - footer volumes exactly match the shape
#   - Dockerfiles use the corrected pnpm store env, never the silent-no-op one
#   - host-shims are byte-identical to the template (single source of truth)
#   - block <-> example consistency (a block's signature appears only where it should)
# Mirrors scripts/verify-template.sh. Usage: verify-dev-container.sh
set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL="$PLUGIN_ROOT/skills/scaffold-dev-container"
BLOCKS="$SKILL/blocks"
EXAMPLES="$SKILL/examples"
TEMPLATE_SHIMS="$PLUGIN_ROOT/template/scripts/host-shims"

fail() { echo "FAIL: $*" >&2; exit 1; }

DOCKER_OK=0
if command -v docker >/dev/null && docker compose version >/dev/null 2>&1; then DOCKER_OK=1; fi
[ "$DOCKER_OK" = 1 ] || echo "NOTE: docker not found — skipping 'docker compose config' checks"

# --- Dockerfile store-env fix (blocks + examples) ---
for df in "$BLOCKS/dockerfile/base.Dockerfile.dev" "$EXAMPLES"/*/Dockerfile.dev; do
  grep -q 'PNPM_CONFIG_STORE_DIR=/pnpm-store' "$df" || fail "missing PNPM_CONFIG_STORE_DIR in $df"
  ! grep -q 'PNPM_STORE_PATH' "$df" || fail "silent-no-op PNPM_STORE_PATH present in $df"
done
echo "store-env OK"

# --- expected footer volumes per shape ---
expected_volumes() {
  case "$1" in
    bare) printf 'pnpm-store\n' ;;
    web)  printf 'playwright-cache\npnpm-store\nredis-data\n' ;;
    data) printf 'meilidata\npgdata\npnpm-store\nredis-data\n' ;;
  esac
}
actual_volumes() { # top-level volumes: keys, sorted
  awk '/^volumes:/{f=1;next} /^[^[:space:]]/{f=0} f && /^  [A-Za-z0-9_-]+:/{gsub(/[: ]/,"");print}' "$1" | sort
}

for ex in bare web data; do
  dir="$EXAMPLES/$ex"
  [ -d "$dir" ] || fail "missing example: $ex"
  # compose validity (also proves depends_on targets + volume refs resolve)
  if [ "$DOCKER_OK" = 1 ]; then
    T="$(mktemp -d)"; cp -R "$dir/." "$T/"
    ( cd "$T" && { cp .env.example .env 2>/dev/null || touch .env; } && docker compose config -q ) \
      || { rm -rf "$T"; fail "docker compose config failed for $ex"; }
    rm -rf "$T"
  fi
  # footer volumes
  diff <(actual_volumes "$dir/docker-compose.yml") <(expected_volumes "$ex") \
    || fail "$ex footer volumes mismatch"
  # host-shims byte-identical
  diff -q "$dir/scripts/host-shims/pnpm" "$TEMPLATE_SHIMS/pnpm" >/dev/null || fail "$ex pnpm shim differs from template"
  diff -q "$dir/scripts/host-shims/pnpx" "$TEMPLATE_SHIMS/pnpx" >/dev/null || fail "$ex pnpx shim differs from template"
  echo "$ex OK"
done

# --- block <-> example consistency ---
grep -q 'image: redis:7-alpine' "$BLOCKS/compose/redis.yml"       || fail "redis block signature missing"
grep -q 'image: postgres:17'    "$BLOCKS/compose/postgres.yml"    || fail "postgres block signature missing"
grep -q 'getmeili/meilisearch'  "$BLOCKS/compose/meilisearch.yml" || fail "meili block signature missing"

grep -q 'image: redis:7-alpine' "$EXAMPLES/web/docker-compose.yml"  || fail "web example should use redis"
grep -q 'profiles:'             "$EXAMPLES/web/docker-compose.yml"  || fail "web example should have prod-app profile"
grep -q 'ms-playwright'         "$EXAMPLES/web/Dockerfile.dev"      || fail "web example should include playwright deps"
! grep -q 'image: redis'        "$EXAMPLES/bare/docker-compose.yml" || fail "bare example must have no sidecars"
! grep -q 'networks:'           "$EXAMPLES/bare/docker-compose.yml" || fail "bare example must have no networks"
grep -q 'image: postgres:17'    "$EXAMPLES/data/docker-compose.yml" || fail "data example should use postgres"
grep -q 'getmeili/meilisearch'  "$EXAMPLES/data/docker-compose.yml" || fail "data example should use meilisearch"
echo "block<->example consistency OK"

echo "DEV-CONTAINER BLOCKS GREEN"

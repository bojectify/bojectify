#!/usr/bin/env bash
#
# release:prepare — bump package versions on a fresh branch and open a release PR.
#
# Usage:
#   pnpm release:prepare <specifier> <project...>
#   e.g. pnpm release:prepare patch @bojectify/react-store
#
# `main` is protected, so the version bump goes through a PR like any change.
# nx is used only to rewrite the manifests (so the co-bump + dependency-range
# rewrite still happen); we make the commit ourselves so nothing is pushed to
# `main` directly. After the PR is merged, run `pnpm release:tag`.
set -euo pipefail

usage() {
  echo "Usage: pnpm release:prepare <specifier> <project...>" >&2
  echo "  e.g. pnpm release:prepare patch @bojectify/react-store" >&2
}

SPECIFIER="${1:-}"
if [[ $# -lt 2 || -z "$SPECIFIER" ]]; then
  usage
  exit 1
fi
shift
PROJECTS_CSV="$(IFS=,; echo "$*")"

# --- guards -------------------------------------------------------------------
git fetch origin --quiet
if [[ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]]; then
  echo "✗ Must be run from 'main'." >&2
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "✗ Working tree is not clean — commit or stash first." >&2
  exit 1
fi
if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]]; then
  echo "✗ Local 'main' is not in sync with origin/main — pull first." >&2
  exit 1
fi

# --- bump on a release branch -------------------------------------------------
RELEASE_BRANCH="release/$(date -u +%Y%m%d-%H%M%S)"
git checkout -b "$RELEASE_BRANCH"

# Rewrite manifests + lockfile only (no commit/tag/stage); we commit ourselves.
pnpm nx release version "$SPECIFIER" --projects="$PROJECTS_CSV" \
  --git-commit=false --git-tag=false --stage-changes=false

if [[ -z "$(git status --porcelain)" ]]; then
  echo "✗ No changes produced — nothing to release." >&2
  git checkout main
  git branch -D "$RELEASE_BRANCH"
  exit 1
fi

# --- commit + PR --------------------------------------------------------------
BUMPED="$(
  git diff --name-only | grep -E '^packages/[^/]+/package\.json$' | while read -r f; do
    echo "- $(node -pe 'const p = require("./" + process.argv[1]); p.name + "@" + p.version' "$f")"
  done
)"

git add -A
git commit -m "chore(release): publish" -m "$BUMPED"
git push -u origin "$RELEASE_BRANCH"

gh pr create --base main --head "$RELEASE_BRANCH" \
  --title "chore(release): publish" \
  --body "$(printf 'Version bump from `pnpm release:prepare %s %s`.\n\n## Bumped\n%s\n\nAfter merge, run `pnpm release:tag` to tag the merged commit and publish.\n' "$SPECIFIER" "$PROJECTS_CSV" "$BUMPED")"

echo
echo "✓ Release PR opened. Review & merge it, then run:  pnpm release:tag"

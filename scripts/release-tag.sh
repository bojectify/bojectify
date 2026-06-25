#!/usr/bin/env bash
#
# release:tag — after the release PR is merged, tag the release commit and push
# the tags (which triggers the per-package publish workflows).
#
# Usage:
#   pnpm release:tag
#
# Tags are derived from the manifests that changed in the merged release commit,
# so exactly the bumped packages (incl. co-bumped dependents) get tagged — and
# always on the commit that's actually on `main`, regardless of merge strategy.
set -euo pipefail

# Fail fast on a dirty tree before any checkout/merge (clearer than git's error).
if [[ -n "$(git status --porcelain)" ]]; then
  echo "✗ Working tree is not clean — commit or stash first." >&2
  exit 1
fi

git fetch origin --quiet
git checkout main
git merge --ff-only origin/main

# The merged release commit. squash / merge-commit / rebase all leave a commit
# with this subject in main's history, so --grep finds the right one.
RELEASE_SHA="$(git log -1 --format=%H --grep='^chore(release): publish' || true)"
if [[ -z "$RELEASE_SHA" ]]; then
  echo "✗ No 'chore(release): publish' commit found in main's history." >&2
  exit 1
fi
echo "Release commit: $(git log -1 --oneline "$RELEASE_SHA")"

# Which package manifests changed in that commit → which packages to tag.
CHANGED=()
while IFS= read -r f; do
  [[ -n "$f" ]] && CHANGED+=("$f")
done < <(git show --name-only --format= "$RELEASE_SHA" | grep -E '^packages/[^/]+/package\.json$' || true)

if [[ ${#CHANGED[@]} -eq 0 ]]; then
  echo "✗ Release commit changed no package manifests — nothing to tag." >&2
  exit 1
fi

CREATED=()
for f in "${CHANGED[@]}"; do
  blob="$(git show "${RELEASE_SHA}:${f}")"
  tag="$(node -pe 'const p = JSON.parse(process.argv[1]); p.name + "@" + p.version' "$blob")"
  if [[ -n "$(git ls-remote --tags origin "refs/tags/${tag}")" ]]; then
    echo "• ${tag} already on remote — skipping."
    continue
  fi
  # Recreate locally if a stale tag lingers from a previous run (it's not on the
  # remote, so this is safe and idempotent).
  git tag -d "$tag" >/dev/null 2>&1 || true
  git tag -a "$tag" "$RELEASE_SHA" -m "$tag"
  CREATED+=("$tag")
  echo "+ tagged ${tag} → ${RELEASE_SHA:0:7}"
done

if [[ ${#CREATED[@]} -eq 0 ]]; then
  echo "✓ Nothing new to tag — everything is already published/tagged."
  exit 0
fi

git push origin "${CREATED[@]/#/refs/tags/}"
echo
echo "✓ Pushed ${#CREATED[@]} tag(s) — publish workflows are now running:"
printf '  %s\n' "${CREATED[@]}"

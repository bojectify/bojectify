---
name: creating-branches
description: Use when creating a git branch in a Boject site — enforces the <type>/<issue#>-<slug> naming convention (issue number when one exists, prompt otherwise) and the paired PR `Closes #N` linkage.
---

# Creating a branch

Boject branches are traceable to their issue at a glance. Name every branch:

    <type>/<issue#>-<slug>

- `<type>` — a conventional-commit type: `feat`, `fix`, `chore`, `docs`,
  `refactor`, `test`, `perf`, `ci`, `build`.
- `<issue#>` — the GitHub issue number, immediately after the type.
- `<slug>` — a short kebab-case description.

Examples: `feat/6-canvas-render-layer`, `fix/289-dangling-ref`,
`chore/30-backup-docs`, `docs/14-api-reference`.

## No issue?

If the work does not already map to a GitHub issue, STOP and ask the user before
creating the branch:

1. **Link an existing issue** — use its number.
2. **Create an issue now** — then use the new number.
3. **Proceed without one** — use `<type>/<slug>` (no number), e.g. `chore/tidy-eslint-config`.

Never guess an issue number.

## Opening the PR

When the branch carries an issue number, put `Closes #<n>` in the PR body so the
issue auto-closes on merge and the branch ↔ issue ↔ PR trace stays complete.

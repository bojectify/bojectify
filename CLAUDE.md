# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React component library monorepo (`@bojectify`) managed by Nx 22.x with pnpm. Contains 4 publishable NPM packages under `packages/`.

| Package                        | Tag                       | Description                                           |
| ------------------------------ | ------------------------- | ----------------------------------------------------- |
| `@bojectify/react-store`       | `scope:react-store`       | useReducer + Context with Vuex-style computed getters |
| `@bojectify/react-store-async` | `scope:react-store-async` | Async fetch helpers (REQUEST/SUCCESS/ERROR pattern)   |
| `@bojectify/react-reveal`      | `scope:react-reveal`      | CSS animation wrapper (fade/slide, RSC-compatible)    |
| `@bojectify/react-carousel`    | `scope:react-carousel`    | CSS-only scroll-snap carousel (RSC-compatible)        |

## Commands

Always use `pnpm nx` (never a global `nx` install). Never use `npx` — use `pnpx` instead.

```bash
# Build / Test / Lint / Typecheck a single project
pnpm nx build @bojectify/react-store
pnpm nx test @bojectify/react-reveal
pnpm nx lint @bojectify/react-carousel
pnpm nx typecheck @bojectify/react-store-async

# Stylelint (react-carousel and react-reveal only)
pnpm nx stylelint @bojectify/react-carousel

# Run across all projects
pnpm nx run-many -t build
pnpm nx run-many -t lint test build typecheck

# Only affected projects
pnpm nx affected -t test

# Format
pnpm nx format:check
pnpm nx format:write

# Storybook (react-carousel and react-reveal only)
pnpm nx storybook @bojectify/react-carousel
pnpm nx storybook @bojectify/react-reveal

# Storybook interaction tests (runs play functions in headless Chromium)
pnpm nx test-storybook @bojectify/react-carousel
pnpm nx run-many -t test-storybook

# Release (dry run)
pnpm nx release --dry-run

# Local registry (Verdaccio)
pnpm nx local-registry
```

Nx project names include the scope (e.g. `@bojectify/react-store`). Verify with `pnpm nx show projects`.

## Architecture

### Module Boundaries

Enforced via `@nx/enforce-module-boundaries` in the root `eslint.config.mjs`:

- `scope:react-store-async` — can import from `scope:react-store`
- `scope:react-store`, `scope:react-reveal`, `scope:react-carousel` — independent, no cross-package deps

Run `pnpm nx lint <project>` to verify.

### Build Tooling

- **tsup** bundles all packages (ESM-only, with TypeScript declarations)
- Component packages use plain CSS — tsup extracts it to `dist/index.css`
- Both component packages export `./styles.css` pointing to `dist/index.css` for SSR consumers
- `@nx/js/typescript` plugin handles `typecheck` target only (not builds)
- `@nx/vite/plugin` target names are prefixed with `vite-` to avoid conflicts with custom tsup build targets

### TypeScript Setup

- **Project references** wired through root `tsconfig.json` → per-package `tsconfig.lib.json`
- **Custom condition `@bojectify/source`** in `tsconfig.base.json` enables importing TypeScript source directly during development (no build step needed). Each package.json exports map includes `"@bojectify/source": "./src/index.ts"`.
- **JSX**: `react-jsx` (automatic runtime)
- Build output goes to `packages/<name>/dist/`
- Module: `nodenext`, Target: `es2022`, strict mode enabled

### CSS Strategy

- Plain CSS (not CSS Modules) with `bojectify-` prefixed class names (BEM convention)
- **react-reveal**: Inline `opacity: 0` and `transform` set on the element for SSR (CSS animations override inline styles via `animation-fill-mode: forwards`)
- **react-carousel**: Uses cutting-edge CSS features (`::scroll-button`, `::scroll-marker`, anchor positioning)
- CSS custom properties provide theming API (e.g. `--bojectify-carousel-gap`). Carousel exposes these as typed React props (`<Carousel gap="32px" slideWidth="80%">`)
- Both packages export `./styles.css` for SSR consumers: `import '@bojectify/react-reveal/styles.css'`
- **Stylelint** enforces CSS standards via `stylelint-config-standard`

### Testing

- **Vitest** via `@nx/vitest` plugin. Config per-package in `vite.config.ts`.
- **@testing-library/react** for component packages (jsdom environment)
- **Node environment** for store-async (pure functions, no DOM)
- Workspace-level config in `vitest.workspace.ts` (scoped to `packages/*`; plain array export, no `defineWorkspace`)
- Test files: `src/**/*.{test,spec}.{ts,tsx}`
- Coverage: v8 provider → `./test-output/vitest/coverage`
- **Storybook interaction tests** via `@storybook/addon-vitest` with Playwright browser mode. Stories with `play` functions run as real browser tests via the `test-storybook` Nx target (`vitest run --project storybook`). The `test` target depends on `test-storybook` so `pnpm nx run-many -t test` runs both unit and storybook tests.

### Storybook

- **Storybook 10.3** configured on react-carousel and react-reveal via `@nx/storybook` plugin
- Stories co-located with components: `src/*.stories.tsx`
- Uses `@storybook/react-vite` framework with `@vitejs/plugin-react`
- `@storybook/addon-vitest` enables running story `play` functions as Vitest browser tests (headless Chromium via Playwright)
- Storybook test projects are defined inline in each package's `vite.config.ts` via `test.projects` (alongside the unit test project)

### Nx Config

- All project configuration lives in each `package.json` under the `"nx"` field — there are no `project.json` files
- Nx plugins (`@nx/js/typescript`, `@nx/vite/plugin`, `@nx/eslint/plugin`, `@nx/vitest`, `@nx/storybook/plugin`) infer targets automatically
- Release config (`nx.json` → `release`): `projects` explicitly lists the four publishable packages (the private root `@bojectify/source` is excluded by omission); `projectsRelationship: "independent"` so each package is versioned and git-tagged independently. The default tag pattern is `@bojectify/<pkg>@<version>`, which is what the publish workflows trigger on
- `preserveMatchingDependencyRanges` is disabled — this allows prerelease versions, and means a workspace dependency's range is rewritten to the released version when its dependency is bumped (affects `react-store-async` → `react-store`)
- `test` depends on `^build` (dependencies are built first) and `test-storybook` (storybook interaction tests run first)

### Publishing

- Each publishable package has a tag-triggered workflow (`.github/workflows/publish-<pkg>.yml`) that fires on a `@bojectify/<pkg>@*` tag, builds, then runs `npm publish --provenance --access public`
- Auth is GitHub OIDC (npm trusted publisher) — no stored `NPM_TOKEN`. A "skip if already published" guard makes re-pushing an existing tag a safe no-op (green instead of a 403)
- A package's **first** publish must be done manually, because a trusted publisher can only be configured on a package that already exists on npm. Run `pnpm -C packages/<pkg> publish --no-git-checks --access public` (the npm account has 2FA, so do it via an interactive terminal for the OTP). Use `pnpm publish` (not `npm`) so `workspace:*` deps are rewritten to a real version in the tarball
- Normal release flow (two helper scripts in `scripts/`, since `main` is protected and bare `nx release` commits straight to the current branch):
  1. `pnpm release:prepare <specifier> <project...>` (e.g. `pnpm release:prepare patch @bojectify/react-store`) — rewrites manifests via `nx release version` (applies the co-bump + dependency-range rewrite), commits on a `release/<timestamp>` branch, and opens a PR. Co-bumped dependents (e.g. `react-store-async`) are versioned automatically; you don't name them.
  2. Review and merge the PR.
  3. `pnpm release:tag` — derives the bumped packages from the merged release commit, creates `@bojectify/<pkg>@<version>` tags on it (idempotent: skips tags already on the remote), and pushes them → CI publishes. Works regardless of merge strategy (squash/merge/rebase)

### Git Hooks (Lefthook)

- **pre-commit**: lint + stylelint + format check (affected, uncommitted)
- **pre-push**: test + typecheck + build (affected, vs origin/main)

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

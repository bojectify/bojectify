# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Next.js (App Router, standalone output) + next-intl i18n + SCSS with design-token codegen + Storybook + Vitest + Playwright. Package manager: pnpm. Dev container: Docker / OrbStack.

## Commands

All commands run **inside the dev container** via host shims at `scripts/host-shims/` (supply-chain hardening). Call `pnpm` normally; routing is transparent.

- `pnpm dev` — Next dev server on http://localhost:3002
- `pnpm build` — production (standalone) build
- `pnpm typecheck` — TypeScript type-check
- `pnpm lint` — ESLint
- `pnpm lint:scss` — Stylelint
- `pnpm test` — all tests (Vitest)
- `pnpm storybook` — Storybook on http://localhost:6009
- `pnpm codegen:tokens` — design-token codegen (SCSS variables + TS types from Figma exports)
- `pnpm codegen:routes` — route-manifest codegen (typed route constants)

## Git conventions

Branch names follow `<type>/<issue#>-<slug>` (e.g. `feat/6-canvas-render-layer`) —
the GitHub issue number immediately after a conventional-commit type prefix. See
the `creating-branches` skill (platform plugin) for the full rule: allowed types,
what to do when there's no issue, and the paired PR `Closes #N` linkage.

## Product

TODO: describe this site's product.

## Brand / project name

`package.json` ships the `name = '__PROJECT_NAME__'` placeholder (the scaffold replaces it). `site.config.ts` ships a concrete `BRAND = 'Boject'` — `BRAND` is the design-token selector (the token generator strips it from each `figma_exports` mode name), so the scaffold rebrands it together with the matching token files rather than leaving a placeholder.

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

## Product

TODO: describe this site's product.

## Brand / project name

Brand and project name are set in `site.config.ts` (`BRAND = '__BRAND__'`) and `package.json` (`name = '__PROJECT_NAME__'`). Update both when scaffolding a new project.

# `__PROJECT_NAME__`

A Boject platform site — a containerised Next.js app scaffolded from the
`bojectify/platform` template.

## Stack

- **Next.js** (App Router, standalone output) + **next-intl** i18n
- **SCSS** with Figma-driven design-token codegen
- **Storybook** + **Vitest** + **Playwright**
- **pnpm**, **Docker** dev container (supply-chain hardened)

## Getting started

This project runs inside a **dev container** (Docker / OrbStack). Open the repo
with your editor's Dev Containers support (it reads `.devcontainer/devcontainer.json`),
or start the Compose `dev` service directly. `scripts/host-shims/` make host
`pnpm`/`pnpx` transparently run inside the container, so you can call them
normally.

```bash
pnpm install   # inside the dev container
pnpm dev       # http://localhost:3002
```

## Commands

| Command                          | What it does                                        |
| -------------------------------- | --------------------------------------------------- |
| `pnpm dev`                       | Dev server — http://localhost:3002                  |
| `pnpm build`                     | Production (standalone) build                       |
| `pnpm typecheck`                 | TypeScript type-check                               |
| `pnpm lint` / `pnpm lint:scss`   | ESLint / Stylelint                                  |
| `pnpm test`                      | Vitest (unit + Storybook interaction + screenshots) |
| `pnpm storybook`                 | Storybook — http://localhost:6009                   |
| `pnpm codegen:tokens`            | Regenerate SCSS design tokens from `figma_exports/` |
| `pnpm codegen:routes`            | Regenerate typed route constants                    |

## Configuration

- **Brand & locales** — `site.config.ts` (`BRAND`, `LOCALES_OBJ`). `BRAND` is
  also the **design-token selector**: the generator strips it from each
  `figma_exports` mode name, so rebranding means renaming the token files to
  match (the scaffold does this for you).
- **Environment** — copy `.env.example` to `.env` and fill in.
- **Design tokens** — `figma_exports/` holds the Figma semantic-token JSON; run
  `pnpm codegen:tokens` after changing them.

## Project layout

- `src/app/` — App Router (`[locale]/` localized routes; placeholder home)
- `src/styles/` — global SCSS, mixins, generated tokens (`__generated__/`)
- `src/i18n/` — next-intl routing
- `scripts/` — token + route codegen, dev-container host shims

## Next steps

Replace the placeholder home page (`src/app/[locale]/page.tsx`), describe your
product in `CLAUDE.md`, and swap `figma_exports/` for your real design system.

# @bojectify

Open source React component library monorepo, managed by [Nx](https://nx.dev) with pnpm.

## Packages

| Package                                                      | Description                                                | RSC-Compatible |
| ------------------------------------------------------------ | ---------------------------------------------------------- | -------------- |
| [`@bojectify/react-store`](packages/react-store)             | useReducer + Context with Vuex-style computed getters      | No (client)    |
| [`@bojectify/react-store-async`](packages/react-store-async) | Async fetch helpers (REQUEST/SUCCESS/ERROR)                | No (client)    |
| [`@bojectify/react-reveal`](packages/react-reveal)           | CSS animation wrapper (fade + slide)                       | Yes            |
| [`@bojectify/react-carousel`](packages/react-carousel)       | CSS-only scroll-snap carousel with progressive enhancement | Yes            |

## Getting Started

**Prerequisites:** Node.js 20+, pnpm

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm nx run-many -t build

# Run tests
pnpm nx run-many -t test

# Lint
pnpm nx run-many -t lint

# Typecheck
pnpm nx run-many -t typecheck

# Run everything
pnpm nx run-many -t lint test build typecheck
```

## Development

### Storybook

Visual development for component packages:

```bash
pnpm nx storybook @bojectify/react-carousel
pnpm nx storybook @bojectify/react-reveal
```

### Storybook Tests

Stories with `play` functions run as browser tests in headless Chromium:

```bash
pnpm nx test-storybook @bojectify/react-carousel
pnpm nx run-many -t test-storybook
```

These also run automatically as part of `pnpm nx run-many -t test`.

### Working on a single package

```bash
pnpm nx build @bojectify/react-store
pnpm nx test @bojectify/react-reveal
pnpm nx lint @bojectify/react-carousel
```

### Affected commands

Only run tasks for projects affected by your changes:

```bash
pnpm nx affected -t test
pnpm nx affected -t build
```

## Project Structure

```
packages/
  react-store/        @bojectify/react-store         — State management with computed getters
  react-store-async/  @bojectify/react-store-async   — Async fetch action helpers
  react-reveal/       @bojectify/react-reveal        — CSS animation wrapper
  react-carousel/     @bojectify/react-carousel      — CSS-only scroll-snap carousel
```

### Module Boundaries

- `react-store-async` can depend on `react-store`
- All other packages are independent

### Tech Stack

- **Nx 22.x** — monorepo tooling
- **pnpm** — package manager
- **TypeScript 5.9** — strict mode, nodenext module resolution
- **tsup** — ESM bundler for all packages
- **Vitest 4.1** — unit testing with @testing-library/react
- **Storybook 10.3** — component development (react-reveal, react-carousel)
- **@storybook/addon-vitest** — story interaction tests in headless Chromium via Playwright
- **Stylelint** — CSS linting (stylelint-config-standard)
- **Lefthook** — git hooks (lint + stylelint + format on commit, test + build on push)
- **Prettier** — code formatting

### SSR Usage

For server-side rendered apps (Next.js, Remix, etc.), import the styles in your root layout:

```tsx
import '@bojectify/react-reveal/styles.css';
import '@bojectify/react-carousel/styles.css';
```

This ensures CSS is available during SSR and prevents flash of unstyled content.

## Publishing

```bash
# Dry run
pnpm nx release --dry-run

# Release to NPM
pnpm nx release
```

### Local testing with Verdaccio

Use the local registry to test packages as real npm installs before publishing.

**Terminal 1** — start the local registry (runs on `localhost:4873`):

```bash
pnpm nx local-registry
```

**Terminal 2** — publish all packages:

```bash
for pkg in react-carousel react-reveal react-store react-store-async; do
  (cd packages/$pkg && pnpm publish --registry http://localhost:4873 --no-git-checks)
done
```

**In another project** — install from the local registry:

```bash
pnpm add @bojectify/react-carousel --registry http://localhost:4873
```

To republish the same version, delete the package from local storage first:

```bash
rm -rf tmp/local-registry/storage/@bojectify/react-carousel
```

## License

MIT

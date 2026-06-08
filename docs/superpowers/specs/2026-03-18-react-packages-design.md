# React Packages Monorepo Design

## Overview

Evolve the `@bojectify` Nx monorepo from Nx demo scaffolding into a community-facing open source collection of React packages published to NPM. Single public GitHub repo.

## Packages

Remove existing demo packages (`strings`, `async`, `colors`, `utils`). Add four new packages:

| Package             | NPM Name                       | Description                                 | RSC-Compatible            |
| ------------------- | ------------------------------ | ------------------------------------------- | ------------------------- |
| `react-reveal`      | `@bojectify/react-reveal`      | CSS animation wrapper                       | Yes                       |
| `react-carousel`    | `@bojectify/react-carousel`    | CSS-only scroll-snap carousel               | Yes                       |
| `react-store`       | `@bojectify/react-store`       | useReducer + Context with computed getters  | No (ships `"use client"`) |
| `react-store-async` | `@bojectify/react-store-async` | Async fetch helpers (REQUEST/SUCCESS/ERROR) | No (ships `"use client"`) |

```
packages/
├── react-reveal/
├── react-carousel/
├── react-store/
└── react-store-async/
```

## Module Boundaries

- `react-store-async` can depend on `react-store` (extends it with async patterns)
- `react-reveal`, `react-carousel` — independent, no cross-package deps
- `react-store` — independent

## Peer Dependencies

All packages: `react >=18.0.0`. No runtime dependencies. `tslib` remains as a root `devDependency` (needed by `tsc --noEmit` typecheck due to `importHelpers: true` in tsconfig) but is not a runtime dependency of any package.

## Build Tooling

**tsup** replaces `tsc` for all packages. Each package gets a `tsup.config.ts`.

For all packages:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
});
```

For CSS-bearing packages (react-reveal, react-carousel), the Nx `build` target includes a post-build step that copies `src/styles.css` to `dist/styles.css`. Source CSS lives at `src/styles.css` in each component package.

**ESM-only:** All packages ship ESM only. CJS is not supported. This is a deliberate choice for a modern React library targeting bundler-based consumers.

**Nx integration:** Custom `build` target in each package's `package.json` `nx` field that runs `tsup`. The `@nx/js/typescript` plugin remains in `nx.json` but with only the `typecheck` target configured — the `build` section is removed since tsup handles builds. Typecheck runs via `tsc --noEmit` as before.

**Output per package:** `dist/index.js` + `dist/index.d.ts`.

**Package.json `exports` map:**

For non-CSS packages (react-store, react-store-async):

```json
{
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@bojectify/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "sideEffects": false
}
```

For CSS-bearing packages (react-reveal, react-carousel):

```json
{
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@bojectify/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "sideEffects": ["*.css"]
}
```

The `sideEffects` array tells bundlers to preserve the CSS import (which the component makes internally) while tree-shaking all JS exports.

## Package Designs

### @bojectify/react-reveal

Ported from existing component at `/Users/ollyharkness/Sites/boject-pixi/src/components/ui/layout/reveal`.

**Changes from original:**

- Zero runtime dependencies (drop `classnames`, replace with simple string join)
- Internalise types (`CssValue`, `BasicComponentProps` defined within the package)
- Drop `testId` and `nativeProps` wrappers — spread remaining props onto the element (standard React pattern)

**Props:**

| Prop        | Type                                  | Default  | Description                      |
| ----------- | ------------------------------------- | -------- | -------------------------------- |
| `as`        | `ElementType`                         | `'div'`  | HTML tag to render               |
| `children`  | `ReactNode`                           | —        | Content to animate               |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | `'up'`   | Entrance direction               |
| `distance`  | `string`                              | `'36px'` | Translation distance (CSS value) |
| `duration`  | `number`                              | `800`    | Animation duration (ms)          |
| `delay`     | `number`                              | `0`      | Animation delay (ms)             |
| `fadeIn`    | `boolean`                             | `true`   | Include opacity fade             |
| `className` | `string`                              | —        | Additional CSS class             |
| `...rest`   | `HTMLAttributes`                      | —        | Spread onto root element         |

**CSS tokens:**

```css
--bojectify-reveal-duration: 800ms;
--bojectify-reveal-delay: 0ms;
--bojectify-reveal-distance: 36px;
--bojectify-reveal-easing: ease-out;
```

Props set these inline and take precedence. Consumers can override via CSS for theming/global changes.

### @bojectify/react-carousel

CSS-only, SEO-friendly. All slides render as semantic HTML visible to crawlers.

**API (compound component pattern):**

```tsx
import { Carousel } from '@bojectify/react-carousel';

<Carousel>
  <Carousel.Slide>First slide</Carousel.Slide>
  <Carousel.Slide>Second slide</Carousel.Slide>
  <Carousel.Slide>Third slide</Carousel.Slide>
</Carousel>;
```

**Props:**

| Prop               | Type             | Default      | Description                    |
| ------------------ | ---------------- | ------------ | ------------------------------ |
| **Carousel**       |                  |              |                                |
| `children`         | `ReactNode`      | —            | Carousel.Slide elements        |
| `aria-label`       | `string`         | `"Carousel"` | Accessible name for the region |
| `className`        | `string`         | —            | Additional CSS class           |
| `...rest`          | `HTMLAttributes` | —            | Spread onto root element       |
| **Carousel.Slide** |                  |              |                                |
| `children`         | `ReactNode`      | —            | Slide content                  |
| `className`        | `string`         | —            | Additional CSS class           |
| `...rest`          | `HTMLAttributes` | —            | Spread onto root element       |

**How it works — progressive enhancement:**

The carousel uses a two-tier CSS strategy:

**Base layer (all browsers):**

- `Carousel` renders a scroll container (`<div>`) with CSS `scroll-snap-type: x mandatory` and `overflow-x: auto`
- `Carousel.Slide` renders a `<div>` with `scroll-snap-align` inside the container
- Relationship is purely DOM-based (parent/child divs) — no Context needed
- Navigation is native browser scroll behaviour (touch swipe, trackpad, scroll)
- All slides are in the DOM at all times — fully indexable by search engines

**Enhanced layer (supporting browsers, via `@supports`):**

- **`::scroll-button(left)` / `::scroll-button(right)`** — native CSS scroll buttons that auto-disable at scroll boundaries. No JS event handlers needed.
- **`::scroll-marker-group`** + **`::scroll-marker`** — native CSS dot indicators that track the active slide
- **`:target-current`** — highlights the active scroll marker

These are experimental CSS features (CSS Overflow Module). The carousel works fully without them — they progressively enhance the experience where supported.

```css
/* Base — works everywhere */
.bojectify-carousel {
  scroll-snap-type: x mandatory;
  overflow-x: auto;
}

/* Enhanced — where supported */
@supports selector(::scroll-button(right)) {
  .bojectify-carousel::scroll-button(left) {
    content: '' / 'Previous';
  }
  .bojectify-carousel::scroll-button(right) {
    content: '' / 'Next';
  }
  .bojectify-carousel {
    scroll-marker-group: after;
  }
  .bojectify-carousel > *::scroll-marker {
    content: '';
  }
  .bojectify-carousel > *::scroll-marker:target-current {
    background-color: var(--bojectify-carousel-indicator-active-color);
  }
}
```

**Accessibility:** The scroll container uses `role="region"`, `aria-roledescription="carousel"`, `aria-label`, and `tabindex="0"` for keyboard scrolling. Each slide uses `role="group"` and `aria-roledescription="slide"`. When `::scroll-button` is supported, buttons get accessible names via the CSS `content` alternative text syntax (`content: "icon" / "Previous"`).

**CSS tokens:**

```css
--bojectify-carousel-gap: 16px;
--bojectify-carousel-slide-width: 100%;
--bojectify-carousel-snap-align: start;
--bojectify-carousel-button-size: 2rem;
--bojectify-carousel-button-color: currentColor;
--bojectify-carousel-indicator-size: 8px;
--bojectify-carousel-indicator-color: #ccc;
--bojectify-carousel-indicator-active-color: #333;
```

### @bojectify/react-store

A `createStore` factory that replaces manual `useReducer` + `createContext` + Provider boilerplate. Inspired by Vuex's getter pattern.

**API:**

```ts
import { createStore } from '@bojectify/react-store';

const { Provider, useStore } = createStore({
  initialState: { count: 0, multiplier: 2 },
  reducer: (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return { ...state, count: state.count + action.payload };
      default:
        return state;
    }
  },
  actions: {
    increment: ({ dispatch }, amount: number) => {
      dispatch({ type: 'INCREMENT', payload: amount });
    },
  },
  getters: {
    doubled: (state) => state.count * 2,
    multiplied: (state, getters) => getters.doubled * state.multiplier,
  },
});
```

**Consumer usage:**

```tsx
// Provider — optional initialState override (merged with defaults)
<Provider initialState={{ count: 5, multiplier: 3 }}>{children}</Provider>;

// Hook — fully typed
const { state, actions, getters } = useStore();
state.count; // number
actions.increment(1); // typed payload
getters.multiplied; // number
```

**Core concepts:**

- **State** — plain object, consumer-defined
- **Actions** — functions receiving `{ state, dispatch }` and a payload, can be async
- **Reducer** — standard `useReducer` reducer, consumer-defined
- **Getters** — derived values from state, can reference other getters

**Getter caching strategy:** Memoised per render. All getters computed once per state change. Within a single render cycle, getters that reference other getters receive cached values. No cross-render caching — same behaviour as any derived value in React. Consumers with expensive derivations can use `useMemo` at the component level.

**Getter resolution order:** Lazy evaluation via Proxy. When a getter accesses `getters.someOther`, the Proxy computes and caches `someOther` on first access. This means declaration order doesn't matter and circular references would stack overflow (same as Vuex). No topological sorting needed.

**Stale state caveat:** Actions receive `{ state, dispatch }` where `state` is captured at call time. In async actions, `state` may be stale after an `await`. Async actions should use `dispatch` only and read current state via getters in the component, not from the `state` parameter after awaiting.

**What `createStore` does internally:**

1. `useReducer(reducer, initialState)` for state
2. Memoised action wrappers that close over current `{ state, dispatch }`
3. Getter resolution: Proxy-based lazy evaluation, each getter computed and cached on first access within a render
4. Returns `{ state, actions, getters }` from the hook via Context

### @bojectify/react-store-async

Extends `@bojectify/react-store` with helpers for the REQUEST → SUCCESS → ERROR fetch pattern.

**API:**

```ts
import { createFetchAction, asyncReducer } from '@bojectify/react-store-async';

const fetchUser = createFetchAction<UserState>('FETCH_USER');

const { Provider, useStore } = createStore({
  initialState: {
    user: { data: null, loading: false, error: null },
  },
  reducer: (state, action) => {
    return asyncReducer(state, action, {
      ...fetchUser.reducers('user'),
    });
  },
  actions: {
    fetchUser: async ({ dispatch }, userId: string) => {
      await fetchUser.run(dispatch, {
        url: `/api/users/${userId}`,
        mutator: ({ response }) => response.data,
      });
    },
  },
  getters: {
    isLoading: (state) => state.user.loading,
    userName: (state) => state.user.data?.name ?? '',
  },
});
```

**Exports:**

- `createFetchAction(key)` — factory returning `{ run, reducers, types }`
- `asyncReducer(state, action, cases)` — matches async action types in a reducer
- `AsyncState<T>` — type: `{ data: T | null; loading: boolean; error: Error | null }`

**`reducers()` return shape:** A record mapping action type strings to reducer functions. Multiple fetch actions can be spread into the same cases object:

```ts
asyncReducer(state, action, {
  ...fetchUser.reducers('user'),
  ...fetchPosts.reducers('posts'),
});
```

Each `.reducers(stateKey)` returns `{ [FETCH_X_REQUEST]: fn, [FETCH_X_SUCCESS]: fn, [FETCH_X_FAILURE]: fn }` where each `fn` updates the `AsyncState` at the given `stateKey`.

**Design decisions:**

- Uses native `fetch` — no axios dependency
- `mutator` is optional — raw response stored if omitted
- `@bojectify/react-store` is a `peerDependency` — consumers must install both packages. `react-store-async` imports types from `react-store` and its helpers produce objects (action types, reducer cases) that integrate with `createStore`
- `createFetchAction(key)` generates `FETCH_{KEY}_REQUEST`, `FETCH_{KEY}_SUCCESS`, `FETCH_{KEY}_FAILURE` action types

## Nx Configuration

- Module boundary tags: `scope:react-reveal`, `scope:react-carousel`, `scope:react-store`, `scope:react-store-async`
- Enforce: `scope:react-store-async` can import `scope:react-store`. All others isolated.
- Release: all four packages included
- Existing Nx plugins (`@nx/eslint/plugin`, `@nx/vitest`) remain. `@nx/js/typescript` plugin remains but with only `typecheck` configured — the `build` section is removed from the plugin options since tsup handles builds via custom targets.

## Testing

- Vitest remains the test runner
- `@testing-library/react` for component packages (react-reveal, react-carousel)
- Standard unit tests for react-store and react-store-async
- Coverage via v8 provider (existing setup)

## CSS Strategy

**Approach:** Plain CSS (not CSS Modules) with `--bojectify-` prefixed class names to avoid collisions (e.g. `.bojectify-reveal`, `.bojectify-carousel__slide`). CSS custom properties provide the theming API.

**Distribution:** Each component imports its own CSS via a static import (`import './styles.css'`). tsup extracts the CSS to a separate `dist/styles.css` file and preserves the import reference in the output JS. The consumer's bundler (webpack, Vite, Next.js) resolves this at build time.

Consumer usage — no separate CSS import needed:

```tsx
import { Reveal } from '@bojectify/react-reveal';
// CSS is resolved automatically by the consumer's bundler
```

**Why this works with RSC:** The `import './styles.css'` is a static/declarative import, not a runtime side effect. Frameworks like Next.js handle CSS imports at build time — extracting and injecting the CSS into the page. This is fundamentally different from `injectStyle` which creates `<style>` tags at runtime via JS.

**Why not CSS Modules:** Adds build complexity (esbuild plugins) and the `--bojectify-` prefix already prevents class name collisions.

**CSS tokens:** All visual properties exposed as CSS custom properties with `--bojectify-` prefix. Props set CSS variables inline and take precedence over CSS overrides. Consumers can override tokens via CSS for theming or global changes.

## Verdaccio

Already configured in the repo. Used for local integration testing before publishing to NPM:

1. `pnpm nx local-registry` — starts Verdaccio on port 4873
2. `pnpm nx release --registry=http://localhost:4873` — publishes to local registry
3. Test consuming packages from `http://localhost:4873` in a separate project
4. When satisfied, publish to NPM for real: `pnpm nx release`

## Repository Visibility

Public GitHub repo. No sensitive information in the codebase — config files, CI workflows, and internal tooling are standard monorepo boilerplate. Secrets managed via GitHub Actions environment variables (already in place). Private/internal packages marked `"private": true` and excluded from `nx release`.

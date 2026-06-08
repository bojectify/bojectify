# React Packages Monorepo Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the @bojectify Nx monorepo from demo scaffolding into four publishable React packages: react-reveal, react-carousel, react-store, react-store-async.

**Architecture:** Remove existing demo packages (strings, async, colors, utils). Add four new packages under `packages/`. Replace tsc builds with tsup. Component packages use plain CSS with `--bojectify-` prefixed classes imported internally. Store packages use `"use client"` for Next.js compatibility.

**Tech Stack:** Nx 22.x, pnpm, TypeScript, tsup, React 18+, Vitest, @testing-library/react, plain CSS

**Spec:** `docs/superpowers/specs/2026-03-18-react-packages-design.md`

---

## File Structure

### Root config changes

- Modify: `nx.json` — remove `build` from `@nx/js/typescript` plugin, update release config
- Modify: `tsconfig.json` — replace project references
- Modify: `tsconfig.base.json` — add `jsx` and `react` lib support
- Modify: `eslint.config.mjs` — replace module boundary rules
- Modify: `package.json` — add tsup, react, @testing-library/react devDeps
- Modify: `.github/workflows/ci.yml` — update to use pnpm

### Packages to remove

- Delete: `packages/strings/` (entire directory)
- Delete: `packages/async/` (entire directory)
- Delete: `packages/colors/` (entire directory)
- Delete: `packages/utils/` (entire directory)

### packages/react-reveal/

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.lib.json`
- Create: `tsconfig.spec.json`
- Create: `tsup.config.ts`
- Create: `vite.config.ts`
- Create: `eslint.config.mjs`
- Create: `src/index.ts`
- Create: `src/styles.css`
- Create: `src/Reveal.tsx`
- Create: `src/Reveal.types.ts`
- Create: `src/Reveal.spec.tsx`

### packages/react-carousel/

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.lib.json`
- Create: `tsconfig.spec.json`
- Create: `tsup.config.ts`
- Create: `vite.config.ts`
- Create: `eslint.config.mjs`
- Create: `src/index.ts`
- Create: `src/styles.css`
- Create: `src/Carousel.tsx`
- Create: `src/Carousel.types.ts`
- Create: `src/Slide.tsx`
- Create: `src/Carousel.spec.tsx`

### packages/react-store/

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.lib.json`
- Create: `tsconfig.spec.json`
- Create: `tsup.config.ts`
- Create: `vite.config.ts`
- Create: `eslint.config.mjs`
- Create: `src/index.ts`
- Create: `src/createStore.tsx`
- Create: `src/createStore.types.ts`
- Create: `src/resolveGetters.ts`
- Create: `src/createStore.spec.tsx`

### packages/react-store-async/

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.lib.json`
- Create: `tsconfig.spec.json`
- Create: `tsup.config.ts`
- Create: `vite.config.ts`
- Create: `eslint.config.mjs`
- Create: `src/index.ts`
- Create: `src/createFetchAction.ts`
- Create: `src/asyncReducer.ts`
- Create: `src/types.ts`
- Create: `src/createFetchAction.spec.ts`
- Create: `src/asyncReducer.spec.ts`

---

## Task 1: Remove demo packages and clean root config

**Files:**

- Delete: `packages/strings/` (entire directory)
- Delete: `packages/async/` (entire directory)
- Delete: `packages/colors/` (entire directory)
- Delete: `packages/utils/` (entire directory)
- Modify: `tsconfig.json`
- Modify: `nx.json`
- Modify: `eslint.config.mjs`

- [ ] **Step 1: Delete all four demo package directories**

```bash
rm -rf packages/strings packages/async packages/colors packages/utils
```

- [ ] **Step 2: Update root `tsconfig.json` — remove old project references**

Replace the `references` array with an empty array (we'll add new ones as packages are created):

```json
{
  "extends": "./tsconfig.base.json",
  "compileOnSave": false,
  "files": [],
  "references": []
}
```

- [ ] **Step 3: Update `nx.json` — remove `build` from `@nx/js/typescript` plugin options**

Keep the `typecheck` section, remove the entire `build` section from the `@nx/js/typescript` plugin:

```json
{
  "plugin": "@nx/js/typescript",
  "options": {
    "typecheck": {
      "targetName": "typecheck"
    }
  }
}
```

Also update the `@nx/vite/plugin` options to rename `buildTargetName` so it doesn't conflict with the custom tsup `build` targets in each package:

```json
{
  "plugin": "@nx/vite/plugin",
  "options": {
    "buildTargetName": "vite-build",
    "serveTargetName": "serve",
    "devTargetName": "dev",
    "previewTargetName": "preview",
    "serveStaticTargetName": "serve-static",
    "typecheckTargetName": "vite-typecheck",
    "buildDepsTargetName": "vite-build-deps",
    "watchDepsTargetName": "vite-watch-deps"
  }
}
```

Also update the `release.projects` array to remove `"!utils"`:

```json
"release": {
  "projects": ["!@bojectify/source"],
  "version": {
    "preVersionCommand": "npx nx run-many -t build"
  }
}
```

- [ ] **Step 4: Update `eslint.config.mjs` — clear old module boundary rules**

Replace the `depConstraints` array with an empty array (we'll populate it when packages are added):

```js
depConstraints: [],
```

- [ ] **Step 5: Verify the workspace is clean**

```bash
pnpm nx show projects
```

Expected: only the root project `@bojectify/source` remains.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: remove demo scaffolding packages (strings, async, colors, utils)"
```

---

## Task 2: Add shared dependencies and update root config for React

**Files:**

- Modify: `package.json` (root)
- Modify: `tsconfig.base.json`

- [ ] **Step 1: Install shared dev dependencies**

```bash
pnpm add -D tsup react react-dom @types/react @types/react-dom @testing-library/react jsdom
```

- [ ] **Step 2: Update `tsconfig.base.json` — add JSX and React DOM lib support**

Add `"jsx": "react-jsx"` to compilerOptions and add `"dom"` to the `lib` array:

```json
{
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "importHelpers": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "lib": ["es2022", "dom"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "noEmitOnError": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "es2022",
    "customConditions": ["@bojectify/source"]
  }
}
```

- [ ] **Step 3: Verify install succeeded**

```bash
pnpm nx report
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.base.json
git commit -m "chore: add React, tsup, and testing-library dev dependencies"
```

---

## Task 3: Create `@bojectify/react-store` package — types and factory

This is built first because `react-store-async` depends on it.

**Files:**

- Create: `packages/react-store/package.json`
- Create: `packages/react-store/tsconfig.json`
- Create: `packages/react-store/tsconfig.lib.json`
- Create: `packages/react-store/tsconfig.spec.json`
- Create: `packages/react-store/tsup.config.ts`
- Create: `packages/react-store/vite.config.ts`
- Create: `packages/react-store/eslint.config.mjs`
- Create: `packages/react-store/src/createStore.types.ts`
- Create: `packages/react-store/src/resolveGetters.ts`
- Create: `packages/react-store/src/createStore.tsx`
- Create: `packages/react-store/src/index.ts`
- Create: `packages/react-store/src/createStore.spec.tsx`
- Modify: `tsconfig.json` (root — add reference)
- Modify: `eslint.config.mjs` (root — add boundary rule)

- [ ] **Step 1: Create `packages/react-store/package.json`**

```json
{
  "name": "@bojectify/react-store",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@bojectify/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist", "!**/*.tsbuildinfo"],
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "devDependencies": {
    "vite": "^7.0.0"
  },
  "sideEffects": false,
  "nx": {
    "tags": ["scope:react-store"],
    "targets": {
      "build": {
        "command": "tsup",
        "cache": true,
        "inputs": ["production", "^production"],
        "outputs": ["{projectRoot}/dist"]
      }
    }
  }
}
```

- [ ] **Step 2: Create `packages/react-store/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [
    { "path": "./tsconfig.lib.json" },
    { "path": "./tsconfig.spec.json" }
  ]
}
```

- [ ] **Step 3: Create `packages/react-store/tsconfig.lib.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": "src",
    "outDir": "dist",
    "tsBuildInfoFile": "dist/tsconfig.lib.tsbuildinfo",
    "emitDeclarationOnly": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": [
    "vite.config.ts",
    "vite.config.mts",
    "vitest.config.ts",
    "vitest.config.mts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx"
  ]
}
```

- [ ] **Step 4: Create `packages/react-store/tsconfig.spec.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./out-tsc/vitest",
    "types": [
      "vitest/globals",
      "vitest/importMeta",
      "vite/client",
      "node",
      "vitest"
    ],
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "vite.config.ts",
    "vite.config.mts",
    "vitest.config.ts",
    "vitest.config.mts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx",
    "src/**/*.d.ts"
  ],
  "references": [{ "path": "./tsconfig.lib.json" }]
}
```

- [ ] **Step 5: Create `packages/react-store/tsup.config.ts`**

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

- [ ] **Step 6: Create `packages/react-store/vite.config.ts`**

```ts
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/react-store',
  plugins: [],
  test: {
    name: '@bojectify/react-store',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
```

- [ ] **Step 7: Create `packages/react-store/eslint.config.mjs`**

```js
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    rules: {},
  },
];
```

- [ ] **Step 8: Write the types — `packages/react-store/src/createStore.types.ts`**

```ts
import type { Dispatch, ReactNode } from 'react';

export type ActionPayload<T extends string = string> = {
  type: T;
  payload?: unknown;
};

export type ActionContext<S> = {
  state: S;
  dispatch: Dispatch<ActionPayload>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Action<S> = (
  context: ActionContext<S>,
  payload?: any
) => void | Promise<void>;

export type Actions<S> = Record<string, Action<S>>;

export type Getter<S> = (state: S, getters: Record<string, unknown>) => unknown;

export type Getters<S> = Record<string, Getter<S>>;

export type StoreConfig<S, A extends Actions<S>, G extends Getters<S>> = {
  initialState: S;
  reducer: (state: S, action: ActionPayload) => S;
  actions: A;
  getters?: G;
};

export type ResolvedGetters<G extends Getters<never>> = {
  [K in keyof G]: ReturnType<G[K]>;
};

export type StoreValue<S, A extends Actions<S>, G extends Getters<S>> = {
  state: S;
  actions: {
    [K in keyof A]: (payload?: Parameters<A[K]>[1]) => void | Promise<void>;
  };
  getters: ResolvedGetters<G>;
};

export type ProviderProps<S> = {
  children: ReactNode;
  initialState?: Partial<S>;
};
```

- [ ] **Step 9: Write the getter resolver — `packages/react-store/src/resolveGetters.ts`**

```ts
import type { Getters } from './createStore.types.js';

export function resolveGetters<S, G extends Getters<S>>(
  state: S,
  getterDefs: G
): { [K in keyof G]: ReturnType<G[K]> } {
  const cache = new Map<string, unknown>();

  const proxy = new Proxy({} as Record<string, unknown>, {
    get(_target, prop: string) {
      if (cache.has(prop)) {
        return cache.get(prop);
      }
      const getter = getterDefs[prop];
      if (!getter) {
        return undefined;
      }
      const value = getter(state, proxy);
      cache.set(prop, value);
      return value;
    },
  });

  // Force-resolve all getters so the returned object has real values
  for (const key of Object.keys(getterDefs)) {
    // Access triggers the proxy getter above
    void proxy[key];
  }

  return proxy as { [K in keyof G]: ReturnType<G[K]> };
}
```

- [ ] **Step 10: Write the failing test — `packages/react-store/src/createStore.spec.tsx`**

```tsx
import { renderHook, act } from '@testing-library/react';
import { createStore } from './createStore.js';
import type { ActionPayload } from './createStore.types.js';

type TestState = {
  count: number;
  multiplier: number;
};

const setup = () =>
  createStore({
    initialState: { count: 0, multiplier: 2 } as TestState,
    reducer: (state: TestState, action: ActionPayload) => {
      switch (action.type) {
        case 'INCREMENT':
          return { ...state, count: state.count + (action.payload as number) };
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
      doubled: (state: TestState) => state.count * 2,
      multiplied: (state: TestState, getters: { doubled: number }) =>
        getters.doubled * state.multiplier,
    },
  });

describe('createStore', () => {
  it('provides initial state via useStore', () => {
    const { Provider, useStore } = setup();
    const { result } = renderHook(() => useStore(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>,
    });

    expect(result.current.state.count).toBe(0);
    expect(result.current.state.multiplier).toBe(2);
  });

  it('dispatches actions and updates state', () => {
    const { Provider, useStore } = setup();
    const { result } = renderHook(() => useStore(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>,
    });

    act(() => {
      result.current.actions.increment(5);
    });

    expect(result.current.state.count).toBe(5);
  });

  it('resolves getters from state', () => {
    const { Provider, useStore } = setup();
    const { result } = renderHook(() => useStore(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>,
    });

    expect(result.current.getters.doubled).toBe(0);
    expect(result.current.getters.multiplied).toBe(0);

    act(() => {
      result.current.actions.increment(3);
    });

    expect(result.current.getters.doubled).toBe(6);
    expect(result.current.getters.multiplied).toBe(12);
  });

  it('resolves getters that depend on other getters', () => {
    const { Provider, useStore } = setup();
    const { result } = renderHook(() => useStore(), {
      wrapper: ({ children }) => <Provider>{children}</Provider>,
    });

    act(() => {
      result.current.actions.increment(4);
    });

    // doubled = 4 * 2 = 8, multiplied = 8 * 2 = 16
    expect(result.current.getters.multiplied).toBe(16);
  });

  it('accepts optional initialState override via Provider', () => {
    const { Provider, useStore } = setup();
    const { result } = renderHook(() => useStore(), {
      wrapper: ({ children }) => (
        <Provider initialState={{ count: 10 }}>{children}</Provider>
      ),
    });

    expect(result.current.state.count).toBe(10);
    expect(result.current.state.multiplier).toBe(2);
  });

  it('throws when useStore is called outside Provider', () => {
    const { useStore } = setup();

    expect(() => {
      renderHook(() => useStore());
    }).toThrow();
  });
});
```

- [ ] **Step 11: Run test to verify it fails**

```bash
pnpm nx test react-store
```

Expected: FAIL — `createStore` module does not exist yet.

- [ ] **Step 12: Write the implementation — `packages/react-store/src/createStore.tsx`**

```tsx
'use client';

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useRef,
  type ReactElement,
} from 'react';
import type {
  Actions,
  ActionPayload,
  Getters,
  StoreConfig,
  StoreValue,
  ProviderProps,
  ResolvedGetters,
} from './createStore.types.js';
import { resolveGetters } from './resolveGetters.js';

export function createStore<S, A extends Actions<S>, G extends Getters<S>>(
  config: StoreConfig<S, A, G>
) {
  const StoreContext = createContext<StoreValue<S, A, G> | null>(null);

  function Provider({
    children,
    initialState: overrides,
  }: ProviderProps<S>): ReactElement {
    const merged = overrides
      ? { ...config.initialState, ...overrides }
      : config.initialState;

    const [state, dispatch] = useReducer(config.reducer, merged);

    const stateRef = useRef(state);
    stateRef.current = state;

    const actions = useMemo(() => {
      const bound = {} as Record<string, unknown>;
      for (const [key, action] of Object.entries(config.actions)) {
        bound[key] = (payload?: unknown) =>
          action({ state: stateRef.current, dispatch }, payload);
      }
      return bound as StoreValue<S, A, G>['actions'];
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getters = useMemo(() => {
      if (!config.getters) {
        return {} as ResolvedGetters<G>;
      }
      return resolveGetters(state, config.getters);
    }, [state]);

    const value = useMemo(
      () => ({ state, actions, getters }),
      [state, actions, getters]
    );

    return (
      <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
    );
  }

  function useStore(): StoreValue<S, A, G> {
    const context = useContext(StoreContext);
    if (!context) {
      throw new Error('useStore must be used within a Provider');
    }
    return context;
  }

  return { Provider, useStore };
}
```

- [ ] **Step 13: Write the barrel export — `packages/react-store/src/index.ts`**

```ts
export { createStore } from './createStore.js';
export type {
  ActionPayload,
  ActionContext,
  Action,
  Actions,
  Getter,
  Getters,
  StoreConfig,
  ResolvedGetters,
  StoreValue,
  ProviderProps,
} from './createStore.types.js';
```

- [ ] **Step 14: Add project reference to root `tsconfig.json`**

Add to the `references` array:

```json
{ "path": "./packages/react-store" }
```

- [ ] **Step 15: Add module boundary rule to root `eslint.config.mjs`**

Add to the `depConstraints` array:

```js
{
  sourceTag: 'scope:react-store',
  onlyDependOnLibsWithTags: ['scope:react-store'],
},
```

- [ ] **Step 16: Install workspace dependencies**

```bash
pnpm install
```

- [ ] **Step 17: Run test to verify it passes**

```bash
pnpm nx test react-store
```

Expected: PASS — all 6 tests pass.

- [ ] **Step 18: Run build to verify it works**

```bash
pnpm nx build react-store
```

Expected: `packages/react-store/dist/index.js` and `packages/react-store/dist/index.d.ts` are generated.

- [ ] **Step 19: Run lint and typecheck**

```bash
pnpm nx lint react-store
pnpm nx typecheck react-store
```

Expected: both pass.

- [ ] **Step 20: Commit**

```bash
git add -A
git commit -m "feat: add @bojectify/react-store package with createStore factory and Proxy-based getters"
```

---

## Task 4: Create `@bojectify/react-store-async` package

**Files:**

- Create: `packages/react-store-async/package.json`
- Create: `packages/react-store-async/tsconfig.json`
- Create: `packages/react-store-async/tsconfig.lib.json`
- Create: `packages/react-store-async/tsconfig.spec.json`
- Create: `packages/react-store-async/tsup.config.ts`
- Create: `packages/react-store-async/vite.config.ts`
- Create: `packages/react-store-async/eslint.config.mjs`
- Create: `packages/react-store-async/src/types.ts`
- Create: `packages/react-store-async/src/asyncReducer.ts`
- Create: `packages/react-store-async/src/createFetchAction.ts`
- Create: `packages/react-store-async/src/index.ts`
- Create: `packages/react-store-async/src/asyncReducer.spec.ts`
- Create: `packages/react-store-async/src/createFetchAction.spec.ts`
- Modify: `tsconfig.json` (root — add reference)
- Modify: `eslint.config.mjs` (root — add boundary rule)

- [ ] **Step 1: Create `packages/react-store-async/package.json`**

```json
{
  "name": "@bojectify/react-store-async",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@bojectify/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist", "!**/*.tsbuildinfo"],
  "peerDependencies": {
    "react": ">=18.0.0",
    "@bojectify/react-store": ">=0.0.1"
  },
  "devDependencies": {
    "vite": "^7.0.0",
    "@bojectify/react-store": "workspace:*"
  },
  "sideEffects": false,
  "nx": {
    "tags": ["scope:react-store-async"],
    "targets": {
      "build": {
        "command": "tsup",
        "cache": true,
        "inputs": ["production", "^production"],
        "outputs": ["{projectRoot}/dist"]
      }
    }
  }
}
```

- [ ] **Step 2: Create `packages/react-store-async/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [
    { "path": "./tsconfig.lib.json" },
    { "path": "./tsconfig.spec.json" }
  ]
}
```

- [ ] **Step 3: Create `packages/react-store-async/tsconfig.lib.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": "src",
    "outDir": "dist",
    "tsBuildInfoFile": "dist/tsconfig.lib.tsbuildinfo",
    "emitDeclarationOnly": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts"],
  "references": [{ "path": "../react-store/tsconfig.lib.json" }],
  "exclude": [
    "vite.config.ts",
    "vite.config.mts",
    "vitest.config.ts",
    "vitest.config.mts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx"
  ]
}
```

- [ ] **Step 4: Create `packages/react-store-async/tsconfig.spec.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./out-tsc/vitest",
    "types": [
      "vitest/globals",
      "vitest/importMeta",
      "vite/client",
      "node",
      "vitest"
    ],
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "vite.config.ts",
    "vite.config.mts",
    "vitest.config.ts",
    "vitest.config.mts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx",
    "src/**/*.d.ts"
  ],
  "references": [{ "path": "./tsconfig.lib.json" }]
}
```

- [ ] **Step 5: Create `packages/react-store-async/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', '@bojectify/react-store'],
});
```

- [ ] **Step 6: Create `packages/react-store-async/vite.config.ts`**

```ts
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/react-store-async',
  plugins: [],
  test: {
    name: '@bojectify/react-store-async',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
```

- [ ] **Step 7: Create `packages/react-store-async/eslint.config.mjs`**

```js
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    rules: {},
  },
];
```

- [ ] **Step 8: Write the types — `packages/react-store-async/src/types.ts`**

```ts
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

export type MutatorFn<T = unknown> = (args: { response: unknown }) => T;

export type FetchActionRunOptions = {
  url: string;
  params?: RequestInit;
  mutator?: MutatorFn;
};

export type ReducerCases<S> = Record<
  string,
  (state: S, payload?: unknown) => S
>;
```

- [ ] **Step 9: Write the failing test for asyncReducer — `packages/react-store-async/src/asyncReducer.spec.ts`**

```ts
import { asyncReducer } from './asyncReducer.js';
import type { ReducerCases } from './types.js';

type TestState = {
  user: { data: string | null; loading: boolean; error: Error | null };
};

describe('asyncReducer', () => {
  const cases: ReducerCases<TestState> = {
    FETCH_USER_REQUEST: (state) => ({
      ...state,
      user: { ...state.user, loading: true, error: null },
    }),
    FETCH_USER_SUCCESS: (state, payload) => ({
      ...state,
      user: { data: payload as string, loading: false, error: null },
    }),
    FETCH_USER_FAILURE: (state, payload) => ({
      ...state,
      user: { ...state.user, loading: false, error: payload as Error },
    }),
  };

  const initial: TestState = {
    user: { data: null, loading: false, error: null },
  };

  it('applies matching reducer case', () => {
    const result = asyncReducer(initial, { type: 'FETCH_USER_REQUEST' }, cases);
    expect(result.user.loading).toBe(true);
  });

  it('applies success case with payload', () => {
    const result = asyncReducer(
      initial,
      { type: 'FETCH_USER_SUCCESS', payload: 'Alice' },
      cases
    );
    expect(result.user.data).toBe('Alice');
    expect(result.user.loading).toBe(false);
  });

  it('returns state unchanged for unknown action type', () => {
    const result = asyncReducer(initial, { type: 'UNKNOWN' }, cases);
    expect(result).toBe(initial);
  });
});
```

- [ ] **Step 10: Run test to verify it fails**

```bash
pnpm nx test react-store-async
```

Expected: FAIL — `asyncReducer` module does not exist yet.

- [ ] **Step 11: Write the asyncReducer implementation — `packages/react-store-async/src/asyncReducer.ts`**

```ts
import type { ReducerCases } from './types.js';

export function asyncReducer<S>(
  state: S,
  action: { type: string; payload?: unknown },
  cases: ReducerCases<S>
): S {
  const handler = cases[action.type];
  if (!handler) {
    return state;
  }
  return handler(state, action.payload);
}
```

- [ ] **Step 12: Run asyncReducer test to verify it passes**

```bash
pnpm nx test react-store-async
```

Expected: PASS — all 3 asyncReducer tests pass.

- [ ] **Step 13: Write the failing test for createFetchAction — `packages/react-store-async/src/createFetchAction.spec.ts`**

```ts
import { createFetchAction } from './createFetchAction.js';

type TestState = {
  user: { data: string | null; loading: boolean; error: Error | null };
};

describe('createFetchAction', () => {
  it('generates correct action type constants', () => {
    const fetchUser = createFetchAction<TestState>('FETCH_USER');

    expect(fetchUser.types).toEqual({
      REQUEST: 'FETCH_USER_REQUEST',
      SUCCESS: 'FETCH_USER_SUCCESS',
      FAILURE: 'FETCH_USER_FAILURE',
    });
  });

  it('generates reducer cases for a state key', () => {
    const fetchUser = createFetchAction<TestState>('FETCH_USER');
    const cases = fetchUser.reducers('user');

    expect(cases).toHaveProperty('FETCH_USER_REQUEST');
    expect(cases).toHaveProperty('FETCH_USER_SUCCESS');
    expect(cases).toHaveProperty('FETCH_USER_FAILURE');
  });

  it('REQUEST case sets loading true', () => {
    const fetchUser = createFetchAction<TestState>('FETCH_USER');
    const cases = fetchUser.reducers('user');
    const state: TestState = {
      user: { data: null, loading: false, error: null },
    };

    const result = cases['FETCH_USER_REQUEST'](state);
    expect(result.user.loading).toBe(true);
    expect(result.user.error).toBeNull();
  });

  it('SUCCESS case sets data and loading false', () => {
    const fetchUser = createFetchAction<TestState>('FETCH_USER');
    const cases = fetchUser.reducers('user');
    const state: TestState = {
      user: { data: null, loading: true, error: null },
    };

    const result = cases['FETCH_USER_SUCCESS'](state, 'Alice');
    expect(result.user.data).toBe('Alice');
    expect(result.user.loading).toBe(false);
  });

  it('FAILURE case sets error and loading false', () => {
    const fetchUser = createFetchAction<TestState>('FETCH_USER');
    const cases = fetchUser.reducers('user');
    const state: TestState = {
      user: { data: null, loading: true, error: null },
    };

    const error = new Error('Network error');
    const result = cases['FETCH_USER_FAILURE'](state, error);
    expect(result.user.error).toBe(error);
    expect(result.user.loading).toBe(false);
  });

  it('run dispatches lifecycle actions and calls fetch', async () => {
    const fetchUser = createFetchAction<TestState>('FETCH_USER');
    const dispatched: { type: string; payload?: unknown }[] = [];
    const dispatch = (action: { type: string; payload?: unknown }) => {
      dispatched.push(action);
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: 'Alice' }),
    });

    await fetchUser.run(dispatch, {
      url: '/api/user/1',
      mutator: ({ response }) => (response as { name: string }).name,
    });

    expect(dispatched[0].type).toBe('FETCH_USER_REQUEST');
    expect(dispatched[1].type).toBe('FETCH_USER_SUCCESS');
    expect(dispatched[1].payload).toBe('Alice');
  });

  it('run dispatches FAILURE on fetch error', async () => {
    const fetchUser = createFetchAction<TestState>('FETCH_USER');
    const dispatched: { type: string; payload?: unknown }[] = [];
    const dispatch = (action: { type: string; payload?: unknown }) => {
      dispatched.push(action);
    };

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await fetchUser.run(dispatch, { url: '/api/user/1' });

    expect(dispatched[0].type).toBe('FETCH_USER_REQUEST');
    expect(dispatched[1].type).toBe('FETCH_USER_FAILURE');
    expect(dispatched[1].payload).toBeInstanceOf(Error);
  });
});
```

- [ ] **Step 14: Run test to verify it fails**

```bash
pnpm nx test react-store-async
```

Expected: FAIL — `createFetchAction` module does not exist yet.

- [ ] **Step 15: Write the createFetchAction implementation — `packages/react-store-async/src/createFetchAction.ts`**

```ts
import type {
  AsyncState,
  FetchActionRunOptions,
  ReducerCases,
} from './types.js';

type FetchActionTypes = {
  REQUEST: string;
  SUCCESS: string;
  FAILURE: string;
};

export function createFetchAction<S>(key: string) {
  const types: FetchActionTypes = {
    REQUEST: `${key}_REQUEST`,
    SUCCESS: `${key}_SUCCESS`,
    FAILURE: `${key}_FAILURE`,
  };

  function reducers<K extends string>(stateKey: K): ReducerCases<S> {
    return {
      [types.REQUEST]: (state: S) => ({
        ...state,
        [stateKey]: {
          ...((state as Record<string, unknown>)[
            stateKey
          ] as AsyncState<unknown>),
          loading: true,
          error: null,
        },
      }),
      [types.SUCCESS]: (state: S, payload?: unknown) => ({
        ...state,
        [stateKey]: {
          data: payload,
          loading: false,
          error: null,
        },
      }),
      [types.FAILURE]: (state: S, payload?: unknown) => ({
        ...state,
        [stateKey]: {
          ...((state as Record<string, unknown>)[
            stateKey
          ] as AsyncState<unknown>),
          loading: false,
          error: payload as Error,
        },
      }),
    };
  }

  async function run(
    dispatch: (action: { type: string; payload?: unknown }) => void,
    options: FetchActionRunOptions
  ): Promise<void> {
    dispatch({ type: types.REQUEST });

    try {
      const response = await fetch(options.url, options.params);
      const json: unknown = await response.json();

      const data = options.mutator ? options.mutator({ response: json }) : json;

      dispatch({ type: types.SUCCESS, payload: data });
    } catch (error) {
      dispatch({
        type: types.FAILURE,
        payload: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  return { types, reducers, run };
}
```

- [ ] **Step 16: Write the barrel export — `packages/react-store-async/src/index.ts`**

```ts
export { createFetchAction } from './createFetchAction.js';
export { asyncReducer } from './asyncReducer.js';
export type {
  AsyncState,
  MutatorFn,
  FetchActionRunOptions,
  ReducerCases,
} from './types.js';
```

- [ ] **Step 17: Add project reference to root `tsconfig.json`**

Add to the `references` array:

```json
{ "path": "./packages/react-store-async" }
```

- [ ] **Step 18: Add module boundary rule to root `eslint.config.mjs`**

Add to the `depConstraints` array:

```js
{
  sourceTag: 'scope:react-store-async',
  onlyDependOnLibsWithTags: ['scope:react-store-async', 'scope:react-store'],
},
```

- [ ] **Step 19: Install workspace dependencies**

```bash
pnpm install
```

- [ ] **Step 20: Run all tests to verify they pass**

```bash
pnpm nx test react-store-async
```

Expected: PASS — all 10 tests pass (3 asyncReducer + 7 createFetchAction).

- [ ] **Step 21: Run build, lint, typecheck**

```bash
pnpm nx build react-store-async
pnpm nx lint react-store-async
pnpm nx typecheck react-store-async
```

Expected: all pass.

- [ ] **Step 22: Commit**

```bash
git add -A
git commit -m "feat: add @bojectify/react-store-async package with createFetchAction and asyncReducer"
```

---

## Task 5: Create `@bojectify/react-reveal` package

**Files:**

- Create: `packages/react-reveal/package.json`
- Create: `packages/react-reveal/tsconfig.json`
- Create: `packages/react-reveal/tsconfig.lib.json`
- Create: `packages/react-reveal/tsconfig.spec.json`
- Create: `packages/react-reveal/tsup.config.ts`
- Create: `packages/react-reveal/vite.config.ts`
- Create: `packages/react-reveal/eslint.config.mjs`
- Create: `packages/react-reveal/src/Reveal.types.ts`
- Create: `packages/react-reveal/src/styles.css`
- Create: `packages/react-reveal/src/Reveal.tsx`
- Create: `packages/react-reveal/src/index.ts`
- Create: `packages/react-reveal/src/Reveal.spec.tsx`
- Modify: `tsconfig.json` (root — add reference)
- Modify: `eslint.config.mjs` (root — add boundary rule)

- [ ] **Step 1: Create `packages/react-reveal/package.json`**

```json
{
  "name": "@bojectify/react-reveal",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@bojectify/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist", "!**/*.tsbuildinfo"],
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "devDependencies": {
    "vite": "^7.0.0"
  },
  "sideEffects": ["*.css"],
  "nx": {
    "tags": ["scope:react-reveal"],
    "targets": {
      "build": {
        "command": "tsup && cp src/styles.css dist/styles.css",
        "cache": true,
        "inputs": ["production", "^production"],
        "outputs": ["{projectRoot}/dist"]
      }
    }
  }
}
```

- [ ] **Step 2: Create `packages/react-reveal/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [
    { "path": "./tsconfig.lib.json" },
    { "path": "./tsconfig.spec.json" }
  ]
}
```

- [ ] **Step 3: Create `packages/react-reveal/tsconfig.lib.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": "src",
    "outDir": "dist",
    "tsBuildInfoFile": "dist/tsconfig.lib.tsbuildinfo",
    "emitDeclarationOnly": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": [
    "vite.config.ts",
    "vite.config.mts",
    "vitest.config.ts",
    "vitest.config.mts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx"
  ]
}
```

- [ ] **Step 4: Create `packages/react-reveal/tsconfig.spec.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./out-tsc/vitest",
    "types": [
      "vitest/globals",
      "vitest/importMeta",
      "vite/client",
      "node",
      "vitest"
    ],
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "vite.config.ts",
    "vite.config.mts",
    "vitest.config.ts",
    "vitest.config.mts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx",
    "src/**/*.d.ts"
  ],
  "references": [{ "path": "./tsconfig.lib.json" }]
}
```

- [ ] **Step 5: Create `packages/react-reveal/tsup.config.ts`**

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

- [ ] **Step 6: Create `packages/react-reveal/vite.config.ts`**

```ts
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/react-reveal',
  plugins: [],
  test: {
    name: '@bojectify/react-reveal',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
```

- [ ] **Step 7: Create `packages/react-reveal/eslint.config.mjs`**

```js
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    rules: {},
  },
];
```

- [ ] **Step 8: Write the types — `packages/react-reveal/src/Reveal.types.ts`**

```ts
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type RevealProps = {
  as?: ElementType;
  children?: ReactNode;
  direction?: Direction;
  distance?: string;
  duration?: number;
  delay?: number;
  fadeIn?: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'className'>;
```

- [ ] **Step 9: Write the CSS — `packages/react-reveal/src/styles.css`**

```css
.bojectify-reveal {
  --bojectify-reveal-duration: 800ms;
  --bojectify-reveal-delay: 0ms;
  --bojectify-reveal-distance: 36px;
  --bojectify-reveal-easing: ease-out;
}

.bojectify-reveal--fade {
  opacity: 0;
  animation: bojectify-reveal-fade-in var(--bojectify-reveal-duration)
    var(--bojectify-reveal-easing) var(--bojectify-reveal-delay) forwards;
}

.bojectify-reveal--slide {
  animation: bojectify-reveal-slide var(--bojectify-reveal-duration)
    var(--bojectify-reveal-easing) var(--bojectify-reveal-delay) forwards;
}

@keyframes bojectify-reveal-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes bojectify-reveal-slide {
  100% {
    transform: translate(0);
  }
}
```

- [ ] **Step 10: Write the failing test — `packages/react-reveal/src/Reveal.spec.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { Reveal } from './Reveal.js';

describe('Reveal', () => {
  it('renders children', () => {
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders as a div by default', () => {
    render(<Reveal data-testid="reveal">Hello</Reveal>);
    const el = screen.getByTestId('reveal');
    expect(el.tagName).toBe('DIV');
  });

  it('renders as a custom element', () => {
    render(
      <Reveal as="section" data-testid="reveal">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.tagName).toBe('SECTION');
  });

  it('applies fade class when fadeIn is true', () => {
    render(
      <Reveal data-testid="reveal" fadeIn>
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.className).toContain('bojectify-reveal--fade');
  });

  it('does not apply fade class when fadeIn is false', () => {
    render(
      <Reveal data-testid="reveal" fadeIn={false}>
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.className).not.toContain('bojectify-reveal--fade');
  });

  it('applies slide class when distance is non-zero', () => {
    render(
      <Reveal data-testid="reveal" distance="50px">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.className).toContain('bojectify-reveal--slide');
  });

  it('does not apply slide class when distance is 0', () => {
    render(
      <Reveal data-testid="reveal" distance="0">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.className).not.toContain('bojectify-reveal--slide');
  });

  it('sets CSS custom properties from props', () => {
    render(
      <Reveal data-testid="reveal" duration={400} delay={100} distance="50px">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.style.getPropertyValue('--bojectify-reveal-duration')).toBe(
      '400ms'
    );
    expect(el.style.getPropertyValue('--bojectify-reveal-delay')).toBe('100ms');
    expect(el.style.getPropertyValue('--bojectify-reveal-distance')).toBe(
      '50px'
    );
  });

  it('sets correct transform for each direction', () => {
    const { rerender } = render(
      <Reveal data-testid="reveal" direction="up" distance="36px">
        Up
      </Reveal>
    );
    expect(screen.getByTestId('reveal').style.transform).toBe(
      'translateY(36px)'
    );

    rerender(
      <Reveal data-testid="reveal" direction="down" distance="36px">
        Down
      </Reveal>
    );
    expect(screen.getByTestId('reveal').style.transform).toBe(
      'translateY(-36px)'
    );

    rerender(
      <Reveal data-testid="reveal" direction="left" distance="36px">
        Left
      </Reveal>
    );
    expect(screen.getByTestId('reveal').style.transform).toBe(
      'translateX(36px)'
    );

    rerender(
      <Reveal data-testid="reveal" direction="right" distance="36px">
        Right
      </Reveal>
    );
    expect(screen.getByTestId('reveal').style.transform).toBe(
      'translateX(-36px)'
    );
  });

  it('merges custom className', () => {
    render(
      <Reveal data-testid="reveal" className="custom">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.className).toContain('bojectify-reveal');
    expect(el.className).toContain('custom');
  });

  it('spreads additional HTML attributes', () => {
    render(
      <Reveal data-testid="reveal" aria-label="animated">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.getAttribute('aria-label')).toBe('animated');
  });
});
```

- [ ] **Step 11: Run test to verify it fails**

```bash
pnpm nx test react-reveal
```

Expected: FAIL — `Reveal` module does not exist yet.

- [ ] **Step 12: Write the implementation — `packages/react-reveal/src/Reveal.tsx`**

```tsx
import { createElement } from 'react';
import type { RevealProps, Direction } from './Reveal.types.js';
import './styles.css';

const directionMap: Record<Direction, (distance: string) => string> = {
  up: (d) => `translateY(${d})`,
  down: (d) => `translateY(-${d})`,
  left: (d) => `translateX(${d})`,
  right: (d) => `translateX(-${d})`,
};

export function Reveal({
  as = 'div',
  children,
  direction = 'up',
  distance = '36px',
  duration = 800,
  delay = 0,
  fadeIn = true,
  className,
  style,
  ...rest
}: RevealProps) {
  const hasSlide = distance !== '0' && distance !== '0px';

  const classes = [
    'bojectify-reveal',
    fadeIn && 'bojectify-reveal--fade',
    hasSlide && 'bojectify-reveal--slide',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const combinedStyle = {
    '--bojectify-reveal-duration': `${duration}ms`,
    '--bojectify-reveal-delay': `${delay}ms`,
    '--bojectify-reveal-distance': distance,
    ...(hasSlide ? { transform: directionMap[direction](distance) } : {}),
    ...style,
  };

  return createElement(
    as,
    {
      className: classes,
      style: combinedStyle,
      ...rest,
    },
    children
  );
}
```

- [ ] **Step 13: Write the barrel export — `packages/react-reveal/src/index.ts`**

```ts
export { Reveal } from './Reveal.js';
export type { RevealProps, Direction } from './Reveal.types.js';
```

- [ ] **Step 14: Add project reference to root `tsconfig.json`**

Add to the `references` array:

```json
{ "path": "./packages/react-reveal" }
```

- [ ] **Step 15: Add module boundary rule to root `eslint.config.mjs`**

Add to the `depConstraints` array:

```js
{
  sourceTag: 'scope:react-reveal',
  onlyDependOnLibsWithTags: ['scope:react-reveal'],
},
```

- [ ] **Step 16: Install workspace dependencies**

```bash
pnpm install
```

- [ ] **Step 17: Run test to verify it passes**

```bash
pnpm nx test react-reveal
```

Expected: PASS — all 11 tests pass.

- [ ] **Step 18: Run build, lint, typecheck**

```bash
pnpm nx build react-reveal
pnpm nx lint react-reveal
pnpm nx typecheck react-reveal
```

Expected: all pass. Verify `packages/react-reveal/dist/styles.css` exists.

- [ ] **Step 19: Commit**

```bash
git add -A
git commit -m "feat: add @bojectify/react-reveal package — CSS animation wrapper component"
```

---

## Task 6: Create `@bojectify/react-carousel` package

**Files:**

- Create: `packages/react-carousel/package.json`
- Create: `packages/react-carousel/tsconfig.json`
- Create: `packages/react-carousel/tsconfig.lib.json`
- Create: `packages/react-carousel/tsconfig.spec.json`
- Create: `packages/react-carousel/tsup.config.ts`
- Create: `packages/react-carousel/vite.config.ts`
- Create: `packages/react-carousel/eslint.config.mjs`
- Create: `packages/react-carousel/src/Carousel.types.ts`
- Create: `packages/react-carousel/src/styles.css`
- Create: `packages/react-carousel/src/Slide.tsx`
- Create: `packages/react-carousel/src/Carousel.tsx`
- Create: `packages/react-carousel/src/index.ts`
- Create: `packages/react-carousel/src/Carousel.spec.tsx`
- Modify: `tsconfig.json` (root — add reference)
- Modify: `eslint.config.mjs` (root — add boundary rule)

- [ ] **Step 1: Create `packages/react-carousel/package.json`**

```json
{
  "name": "@bojectify/react-carousel",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@bojectify/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "files": ["dist", "!**/*.tsbuildinfo"],
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "devDependencies": {
    "vite": "^7.0.0"
  },
  "sideEffects": ["*.css"],
  "nx": {
    "tags": ["scope:react-carousel"],
    "targets": {
      "build": {
        "command": "tsup && cp src/styles.css dist/styles.css",
        "cache": true,
        "inputs": ["production", "^production"],
        "outputs": ["{projectRoot}/dist"]
      }
    }
  }
}
```

- [ ] **Step 2: Create tsconfig files (same pattern as react-reveal)**

Create `packages/react-carousel/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [
    { "path": "./tsconfig.lib.json" },
    { "path": "./tsconfig.spec.json" }
  ]
}
```

Create `packages/react-carousel/tsconfig.lib.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": "src",
    "outDir": "dist",
    "tsBuildInfoFile": "dist/tsconfig.lib.tsbuildinfo",
    "emitDeclarationOnly": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": [
    "vite.config.ts",
    "vite.config.mts",
    "vitest.config.ts",
    "vitest.config.mts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx"
  ]
}
```

Create `packages/react-carousel/tsconfig.spec.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./out-tsc/vitest",
    "types": [
      "vitest/globals",
      "vitest/importMeta",
      "vite/client",
      "node",
      "vitest"
    ],
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "vite.config.ts",
    "vite.config.mts",
    "vitest.config.ts",
    "vitest.config.mts",
    "src/**/*.test.ts",
    "src/**/*.spec.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.tsx",
    "src/**/*.d.ts"
  ],
  "references": [{ "path": "./tsconfig.lib.json" }]
}
```

- [ ] **Step 3: Create `packages/react-carousel/tsup.config.ts`**

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

- [ ] **Step 4: Create `packages/react-carousel/vite.config.ts`**

```ts
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/react-carousel',
  plugins: [],
  test: {
    name: '@bojectify/react-carousel',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));
```

- [ ] **Step 5: Create `packages/react-carousel/eslint.config.mjs`**

```js
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    rules: {},
  },
];
```

- [ ] **Step 6: Write the types — `packages/react-carousel/src/Carousel.types.ts`**

```ts
import type { HTMLAttributes, ReactNode } from 'react';

export type CarouselProps = {
  children: ReactNode;
  'aria-label'?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'aria-label'>;

export type SlideProps = {
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className'>;
```

- [ ] **Step 7: Write the CSS — `packages/react-carousel/src/styles.css`**

```css
.bojectify-carousel {
  --bojectify-carousel-gap: 16px;
  --bojectify-carousel-slide-width: 100%;
  --bojectify-carousel-snap-align: start;
  --bojectify-carousel-button-size: 2rem;
  --bojectify-carousel-button-color: currentColor;
  --bojectify-carousel-indicator-size: 8px;
  --bojectify-carousel-indicator-color: #ccc;
  --bojectify-carousel-indicator-active-color: #333;

  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: var(--bojectify-carousel-gap);
  -webkit-overflow-scrolling: touch;
}

.bojectify-carousel::-webkit-scrollbar {
  display: none;
}

.bojectify-carousel {
  scrollbar-width: none;
}

.bojectify-carousel__slide {
  flex: 0 0 var(--bojectify-carousel-slide-width);
  scroll-snap-align: var(--bojectify-carousel-snap-align);
}

/* Progressive enhancement — CSS scroll buttons and markers */
@supports selector(::scroll-button(right)) {
  .bojectify-carousel::scroll-button(*) {
    border: 0;
    font-size: var(--bojectify-carousel-button-size);
    background: none;
    color: var(--bojectify-carousel-button-color);
    opacity: 0.7;
    cursor: pointer;
  }

  .bojectify-carousel::scroll-button(*):hover,
  .bojectify-carousel::scroll-button(*):focus {
    opacity: 1;
  }

  .bojectify-carousel::scroll-button(*):disabled {
    opacity: 0.2;
    cursor: default;
  }

  .bojectify-carousel::scroll-button(left) {
    content: '\25C0' / 'Previous';
  }

  .bojectify-carousel::scroll-button(right) {
    content: '\25B6' / 'Next';
  }

  .bojectify-carousel {
    scroll-marker-group: after;
  }

  .bojectify-carousel::scroll-marker-group {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-block: 8px;
  }

  .bojectify-carousel > *::scroll-marker {
    content: '';
    width: var(--bojectify-carousel-indicator-size);
    height: var(--bojectify-carousel-indicator-size);
    border-radius: 50%;
    background-color: var(--bojectify-carousel-indicator-color);
    border: 0;
    cursor: pointer;
  }

  .bojectify-carousel > *::scroll-marker:target-current {
    background-color: var(--bojectify-carousel-indicator-active-color);
  }
}
```

- [ ] **Step 8: Write the failing test — `packages/react-carousel/src/Carousel.spec.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { Carousel } from './Carousel.js';

describe('Carousel', () => {
  it('renders children', () => {
    render(
      <Carousel>
        <Carousel.Slide>Slide 1</Carousel.Slide>
        <Carousel.Slide>Slide 2</Carousel.Slide>
      </Carousel>
    );
    expect(screen.getByText('Slide 1')).toBeTruthy();
    expect(screen.getByText('Slide 2')).toBeTruthy();
  });

  it('applies carousel class to container', () => {
    render(
      <Carousel data-testid="carousel">
        <Carousel.Slide>Slide 1</Carousel.Slide>
      </Carousel>
    );
    const el = screen.getByTestId('carousel');
    expect(el.className).toContain('bojectify-carousel');
  });

  it('applies slide class to slides', () => {
    render(
      <Carousel>
        <Carousel.Slide data-testid="slide">Slide 1</Carousel.Slide>
      </Carousel>
    );
    const el = screen.getByTestId('slide');
    expect(el.className).toContain('bojectify-carousel__slide');
  });

  it('sets accessibility attributes on container', () => {
    render(
      <Carousel data-testid="carousel" aria-label="Image gallery">
        <Carousel.Slide>Slide 1</Carousel.Slide>
      </Carousel>
    );
    const el = screen.getByTestId('carousel');
    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-roledescription')).toBe('carousel');
    expect(el.getAttribute('aria-label')).toBe('Image gallery');
    expect(el.getAttribute('tabindex')).toBe('0');
  });

  it('defaults aria-label to Carousel', () => {
    render(
      <Carousel data-testid="carousel">
        <Carousel.Slide>Slide 1</Carousel.Slide>
      </Carousel>
    );
    const el = screen.getByTestId('carousel');
    expect(el.getAttribute('aria-label')).toBe('Carousel');
  });

  it('sets accessibility attributes on slides', () => {
    render(
      <Carousel>
        <Carousel.Slide data-testid="slide">Slide 1</Carousel.Slide>
      </Carousel>
    );
    const el = screen.getByTestId('slide');
    expect(el.getAttribute('role')).toBe('group');
    expect(el.getAttribute('aria-roledescription')).toBe('slide');
  });

  it('merges custom className on container', () => {
    render(
      <Carousel data-testid="carousel" className="custom">
        <Carousel.Slide>Slide 1</Carousel.Slide>
      </Carousel>
    );
    const el = screen.getByTestId('carousel');
    expect(el.className).toContain('bojectify-carousel');
    expect(el.className).toContain('custom');
  });

  it('merges custom className on slide', () => {
    render(
      <Carousel>
        <Carousel.Slide data-testid="slide" className="custom-slide">
          Slide 1
        </Carousel.Slide>
      </Carousel>
    );
    const el = screen.getByTestId('slide');
    expect(el.className).toContain('bojectify-carousel__slide');
    expect(el.className).toContain('custom-slide');
  });

  it('spreads additional HTML attributes', () => {
    render(
      <Carousel data-testid="carousel" id="my-carousel">
        <Carousel.Slide data-testid="slide" id="slide-1">
          Slide 1
        </Carousel.Slide>
      </Carousel>
    );
    expect(screen.getByTestId('carousel').id).toBe('my-carousel');
    expect(screen.getByTestId('slide').id).toBe('slide-1');
  });
});
```

- [ ] **Step 9: Run test to verify it fails**

```bash
pnpm nx test react-carousel
```

Expected: FAIL — `Carousel` module does not exist yet.

- [ ] **Step 10: Write the Slide component — `packages/react-carousel/src/Slide.tsx`**

```tsx
import type { SlideProps } from './Carousel.types.js';

export function Slide({ children, className, ...rest }: SlideProps) {
  const classes = ['bojectify-carousel__slide', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      role="group"
      aria-roledescription="slide"
      {...rest}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 11: Write the Carousel component — `packages/react-carousel/src/Carousel.tsx`**

```tsx
import type { CarouselProps } from './Carousel.types.js';
import { Slide } from './Slide.js';
import './styles.css';

function CarouselRoot({
  children,
  'aria-label': ariaLabel = 'Carousel',
  className,
  ...rest
}: CarouselProps) {
  const classes = ['bojectify-carousel', className].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      {...rest}
    >
      {children}
    </div>
  );
}

export const Carousel = Object.assign(CarouselRoot, { Slide });
```

- [ ] **Step 12: Write the barrel export — `packages/react-carousel/src/index.ts`**

```ts
export { Carousel } from './Carousel.js';
export type { CarouselProps, SlideProps } from './Carousel.types.js';
```

- [ ] **Step 13: Add project reference to root `tsconfig.json`**

Add to the `references` array:

```json
{ "path": "./packages/react-carousel" }
```

- [ ] **Step 14: Add module boundary rule to root `eslint.config.mjs`**

Add to the `depConstraints` array:

```js
{
  sourceTag: 'scope:react-carousel',
  onlyDependOnLibsWithTags: ['scope:react-carousel'],
},
```

- [ ] **Step 15: Install workspace dependencies**

```bash
pnpm install
```

- [ ] **Step 16: Run test to verify it passes**

```bash
pnpm nx test react-carousel
```

Expected: PASS — all 9 tests pass.

- [ ] **Step 17: Run build, lint, typecheck**

```bash
pnpm nx build react-carousel
pnpm nx lint react-carousel
pnpm nx typecheck react-carousel
```

Expected: all pass. Verify `packages/react-carousel/dist/styles.css` exists.

- [ ] **Step 18: Commit**

```bash
git add -A
git commit -m "feat: add @bojectify/react-carousel package — CSS-only scroll-snap carousel with progressive enhancement"
```

---

## Task 7: Update CI and run full workspace validation

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Update CI workflow to use pnpm**

The current CI uses `npm ci` and `npx nx`. Update to use pnpm:

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:

permissions:
  actions: read
  contents: read

jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          filter: tree:0
          fetch-depth: 0

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - run: pnpm nx format:check --base="remotes/origin/main"
      - run: pnpm nx run-many -t lint test build typecheck
```

- [ ] **Step 2: Run all workspace tasks**

```bash
pnpm nx run-many -t lint test build typecheck
```

Expected: all tasks pass for all 4 packages.

- [ ] **Step 3: Run format check**

```bash
pnpm nx format:check
```

If it fails, fix with:

```bash
pnpm nx format:write
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: update CI to use pnpm and validate full workspace"
```

---

## Task 8: Final verification with Verdaccio

- [ ] **Step 1: Start local registry**

```bash
pnpm nx local-registry &
```

Wait for Verdaccio to start on port 4873.

- [ ] **Step 2: Publish all packages to local registry**

```bash
pnpm nx release --dry-run
```

Review the output. If it looks correct:

```bash
pnpm nx release version 0.0.1
pnpm nx release publish --registry=http://localhost:4873
```

- [ ] **Step 3: Verify packages are available**

```bash
npm view @bojectify/react-reveal --registry=http://localhost:4873
npm view @bojectify/react-carousel --registry=http://localhost:4873
npm view @bojectify/react-store --registry=http://localhost:4873
npm view @bojectify/react-store-async --registry=http://localhost:4873
```

Expected: all 4 packages show version 0.0.1.

- [ ] **Step 4: Stop local registry and clean up**

Stop the background Verdaccio process. Clean up `tmp/local-registry/storage`.

- [ ] **Step 5: Commit any remaining changes**

```bash
git add -A
git commit -m "chore: verify Verdaccio publish workflow"
```

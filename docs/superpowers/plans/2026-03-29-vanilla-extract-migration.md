# Vanilla-Extract Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate react-reveal to vanilla-extract for type-safe CSS tokens and SSR-compatible static CSS extraction. Ship react-carousel CSS as a separate importable file for SSR consumers.

**Architecture:** react-reveal gets a full vanilla-extract migration: CSS becomes `.css.ts` with typed class names, CSS vars, and keyframes. The tsup build uses `@vanilla-extract/esbuild-plugin` to extract static CSS at build time. The Vite config gets `@vanilla-extract/vite-plugin` for Storybook and vitest. react-carousel keeps plain CSS because its cutting-edge pseudo-elements (`::scroll-button`, `::scroll-marker`, anchor positioning) aren't expressible in vanilla-extract's type system. Instead, it removes `injectStyle` and ships a `./styles.css` export pointing at the tsup-extracted CSS file.

**Tech Stack:** `@vanilla-extract/css`, `@vanilla-extract/esbuild-plugin`, `@vanilla-extract/vite-plugin`

**Why not vanilla-extract for Carousel?** The Carousel CSS uses `::scroll-button(*)`, `::scroll-marker`, `::scroll-marker-group`, `anchor-name`, `position-anchor`, `scroll-marker-group`, and `@supports selector(::scroll-button(right))`. None of these are in vanilla-extract's type system. Forcing them via type assertions would lose the type-safety benefit. The Carousel's typed React props (`CarouselProps`) already provide the typed token API for consumers — vanilla-extract theme contracts would be redundant.

---

## File Map

### react-reveal (vanilla-extract migration)

| Action | File                                        | Responsibility                             |
| ------ | ------------------------------------------- | ------------------------------------------ |
| Create | `packages/react-reveal/src/Reveal.css.ts`   | Typed styles, keyframes, CSS vars          |
| Delete | `packages/react-reveal/src/Reveal.css`      | Replaced by `.css.ts`                      |
| Modify | `packages/react-reveal/src/Reveal.tsx`      | Import typed class names and vars          |
| Modify | `packages/react-reveal/src/Reveal.spec.tsx` | Use typed class name imports in assertions |
| Modify | `packages/react-reveal/tsup.config.ts`      | Add esbuild plugin, remove injectStyle     |
| Modify | `packages/react-reveal/vite.config.ts`      | Add Vite plugin for Storybook/tests        |
| Modify | `packages/react-reveal/package.json`        | Add `./styles.css` export                  |

### react-carousel (styles.css export)

| Action | File                                     | Responsibility            |
| ------ | ---------------------------------------- | ------------------------- |
| Modify | `packages/react-carousel/tsup.config.ts` | Remove injectStyle        |
| Modify | `packages/react-carousel/package.json`   | Add `./styles.css` export |

### Shared

| Action | File                  | Responsibility                       |
| ------ | --------------------- | ------------------------------------ |
| Modify | `package.json` (root) | Add vanilla-extract dev dependencies |
| Modify | `CLAUDE.md`           | Update CSS strategy docs             |

---

### Task 1: Install vanilla-extract dependencies

**Files:**

- Modify: `package.json` (root)

- [ ] **Step 1: Install packages**

```bash
pnpm add -D @vanilla-extract/css @vanilla-extract/esbuild-plugin @vanilla-extract/vite-plugin -w
```

- [ ] **Step 2: Verify installation**

```bash
pnpm ls @vanilla-extract/css @vanilla-extract/esbuild-plugin @vanilla-extract/vite-plugin
```

Expected: all three packages listed with versions.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add vanilla-extract dependencies"
```

---

### Task 2: Create Reveal.css.ts

**Files:**

- Create: `packages/react-reveal/src/Reveal.css.ts`

- [ ] **Step 1: Write the vanilla-extract styles file**

```ts
import { style, keyframes, createVar, globalStyle } from '@vanilla-extract/css';

export const duration = createVar();
export const delay = createVar();
export const easing = createVar();
export const initialTransform = createVar();

const fadeInKeyframes = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
});

const transformKeyframes = keyframes({
  '100%': { transform: 'translate(0)' },
});

export const reveal = style({
  animationDuration: duration,
  animationDelay: delay,
  animationTimingFunction: easing,
  animationIterationCount: 1,
  animationFillMode: 'forwards',
});

export const fadeIn = style({
  opacity: 0,
  animationName: fadeInKeyframes,
});

export const transform = style({
  transform: initialTransform,
  animationName: transformKeyframes,
});

globalStyle(`${fadeIn}${transform}`, {
  animationName: `${fadeInKeyframes}, ${transformKeyframes}`,
});
```

Notes:

- `createVar()` generates typed CSS custom property names (e.g. `--_1a2b3c`). Components set these as inline styles using the exported var references.
- `globalStyle()` handles the compound selector (`.fadeIn.transform`) that overrides `animationName` when both classes are present.
- No `display: contents` — the wrapper generates a normal box so animations work.

- [ ] **Step 2: Commit**

```bash
git add packages/react-reveal/src/Reveal.css.ts
git commit -m "feat(react-reveal): add vanilla-extract styles"
```

---

### Task 3: Update Reveal.tsx to use vanilla-extract

**Files:**

- Modify: `packages/react-reveal/src/Reveal.tsx`
- Delete: `packages/react-reveal/src/Reveal.css`

- [ ] **Step 1: Rewrite Reveal.tsx**

Replace the entire file:

```tsx
import { createElement } from 'react';
import type { RevealProps, Direction } from './Reveal.types.js';
import * as css from './Reveal.css.js';

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
  distance = null,
  duration = 800,
  delay = 0,
  easing = 'ease-out',
  fadeIn = true,
  className,
  style,
  ...rest
}: RevealProps) {
  const hasTransform =
    distance !== null && distance !== '0' && distance !== '0px';

  const classes = [
    css.reveal,
    fadeIn && css.fadeIn,
    hasTransform && css.transform,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const transformValue = hasTransform
    ? directionMap[direction](distance)
    : undefined;

  const combinedStyle = {
    [css.duration]: `${duration}ms`,
    [css.delay]: `${delay}ms`,
    [css.easing]: easing,
    [css.initialTransform]: transformValue,
    ...(fadeIn && { opacity: 0 }),
    ...(hasTransform && { transform: transformValue }),
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

Key changes:

- Imports typed class names and CSS vars from `Reveal.css.js` instead of plain CSS.
- Class names are `css.reveal`, `css.fadeIn`, `css.transform` (generated strings).
- CSS vars are set via `[css.duration]`, `[css.delay]`, etc. (typed custom property names).
- Inline `opacity: 0` and `transform` for SSR — ensures content is hidden before CSS loads. CSS animations override inline styles when active (`animation-fill-mode: forwards`).

- [ ] **Step 2: Delete the plain CSS file**

```bash
rm packages/react-reveal/src/Reveal.css
```

- [ ] **Step 3: Commit**

```bash
git add packages/react-reveal/src/Reveal.tsx packages/react-reveal/src/Reveal.css
git commit -m "feat(react-reveal): use vanilla-extract class names and vars"
```

---

### Task 4: Configure tsup for vanilla-extract (react-reveal)

**Files:**

- Modify: `packages/react-reveal/tsup.config.ts`

- [ ] **Step 1: Update tsup config**

```ts
import { defineConfig } from 'tsup';
import { vanillaExtractPlugin } from '@vanilla-extract/esbuild-plugin';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    tsconfig: 'tsconfig.lib.json',
    compilerOptions: {
      composite: false,
    },
  },
  esbuildPlugins: [vanillaExtractPlugin()],
  clean: true,
  external: ['react', 'react-dom'],
});
```

Changes: removed `injectStyle: true`, added `esbuildPlugins: [vanillaExtractPlugin()]`.

- [ ] **Step 2: Build and verify output**

```bash
pnpm nx build @bojectify/react-reveal
ls packages/react-reveal/dist/
```

Expected output files:

- `index.js` — JS with class name strings (no `styleInject`)
- `index.css` — static CSS extracted by vanilla-extract
- `index.d.ts` — type declarations

- [ ] **Step 3: Verify CSS content**

```bash
cat packages/react-reveal/dist/index.css
```

Expected: CSS with generated class names and `@keyframes` rules. No runtime JS.

- [ ] **Step 4: Verify JS has no styleInject**

```bash
grep -c 'styleInject\|document\.createElement' packages/react-reveal/dist/index.js
```

Expected: `0` matches.

- [ ] **Step 5: Commit**

```bash
git add packages/react-reveal/tsup.config.ts
git commit -m "build(react-reveal): use vanilla-extract esbuild plugin"
```

---

### Task 5: Add Vite plugin for Storybook and tests (react-reveal)

**Files:**

- Modify: `packages/react-reveal/vite.config.ts`

- [ ] **Step 1: Add vanilla-extract Vite plugin**

Add the import and plugin to the root `plugins` array (alongside `react()`):

```ts
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
```

Update the plugins array:

```ts
plugins: [react(), vanillaExtractPlugin()],
```

The Vite plugin processes `.css.ts` files during:

- Storybook dev server (stories render with correct styles)
- Vitest unit tests (class name imports resolve correctly)

- [ ] **Step 2: Start Storybook and verify**

```bash
pnpm nx storybook @bojectify/react-reveal
```

Expected: stories render with animations. Check that the Reveal component has generated class names (not `bojectify-reveal`).

- [ ] **Step 3: Commit**

```bash
git add packages/react-reveal/vite.config.ts
git commit -m "build(react-reveal): add vanilla-extract vite plugin for storybook/tests"
```

---

### Task 6: Update Reveal tests

**Files:**

- Modify: `packages/react-reveal/src/Reveal.spec.tsx`

- [ ] **Step 1: Update test imports and class name assertions**

Replace the entire test file:

```tsx
import { render, screen } from '@testing-library/react';
import { Reveal } from './Reveal.js';
import * as css from './Reveal.css.js';

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
    expect(el.className).toContain(css.fadeIn);
  });

  it('does not apply fade class when fadeIn is false', () => {
    render(
      <Reveal data-testid="reveal" fadeIn={false}>
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.className).not.toContain(css.fadeIn);
  });

  it('applies transform class when distance is non-zero', () => {
    render(
      <Reveal data-testid="reveal" distance="50px">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.className).toContain(css.transform);
  });

  it('does not apply transform class when distance is 0', () => {
    render(
      <Reveal data-testid="reveal" distance="0">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.className).not.toContain(css.transform);
  });

  it('sets CSS custom properties from props', () => {
    render(
      <Reveal data-testid="reveal" duration={400} delay={100} distance="50px">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.style.getPropertyValue(css.duration)).toBe('400ms');
    expect(el.style.getPropertyValue(css.delay)).toBe('100ms');
  });

  it('sets easing CSS custom property from prop', () => {
    render(
      <Reveal data-testid="reveal" easing="cubic-bezier(0.4, 0, 0.2, 1)">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.style.getPropertyValue(css.easing)).toBe(
      'cubic-bezier(0.4, 0, 0.2, 1)'
    );
  });

  it('defaults easing to ease-out', () => {
    render(<Reveal data-testid="reveal">Hello</Reveal>);
    const el = screen.getByTestId('reveal');
    expect(el.style.getPropertyValue(css.easing)).toBe('ease-out');
  });

  it('sets correct transform for each direction', () => {
    const { rerender } = render(
      <Reveal data-testid="reveal" direction="up" distance="36px">
        Up
      </Reveal>
    );
    expect(
      screen.getByTestId('reveal').style.getPropertyValue(css.initialTransform)
    ).toBe('translateY(36px)');

    rerender(
      <Reveal data-testid="reveal" direction="down" distance="36px">
        Down
      </Reveal>
    );
    expect(
      screen.getByTestId('reveal').style.getPropertyValue(css.initialTransform)
    ).toBe('translateY(-36px)');

    rerender(
      <Reveal data-testid="reveal" direction="left" distance="36px">
        Left
      </Reveal>
    );
    expect(
      screen.getByTestId('reveal').style.getPropertyValue(css.initialTransform)
    ).toBe('translateX(36px)');

    rerender(
      <Reveal data-testid="reveal" direction="right" distance="36px">
        Right
      </Reveal>
    );
    expect(
      screen.getByTestId('reveal').style.getPropertyValue(css.initialTransform)
    ).toBe('translateX(-36px)');
  });

  it('merges custom className', () => {
    render(
      <Reveal data-testid="reveal" className="custom">
        Hello
      </Reveal>
    );
    const el = screen.getByTestId('reveal');
    expect(el.className).toContain(css.reveal);
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

Key changes:

- Import `* as css from './Reveal.css.js'` for typed class names and vars.
- Replace string literals (`'bojectify-reveal--fade-in'`) with typed imports (`css.fadeIn`).
- Replace CSS custom property strings (`'--bojectify-reveal-duration'`) with typed var imports (`css.duration`).
- Removed assertions on `--bojectify-reveal-distance` and `--bojectify-reveal-transform` — these are no longer set as named CSS custom properties. The distance is an intermediate value, and the transform is set as a standard inline `transform` style plus the `css.initialTransform` var.

- [ ] **Step 2: Run tests**

```bash
pnpm nx test @bojectify/react-reveal
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add packages/react-reveal/src/Reveal.spec.tsx
git commit -m "test(react-reveal): update tests for vanilla-extract class names"
```

---

### Task 7: Add styles.css export (react-reveal)

**Files:**

- Modify: `packages/react-reveal/package.json`

- [ ] **Step 1: Add the CSS export to the exports map**

Add this entry to the `"exports"` object:

```json
"./styles.css": "./dist/index.css"
```

This lets SSR consumers import the static CSS:

```ts
import '@bojectify/react-reveal/styles.css';
```

- [ ] **Step 2: Verify the export resolves**

```bash
pnpm nx build @bojectify/react-reveal
ls packages/react-reveal/dist/index.css
```

Expected: file exists.

- [ ] **Step 3: Commit**

```bash
git add packages/react-reveal/package.json
git commit -m "feat(react-reveal): export styles.css for SSR consumers"
```

---

### Task 8: Configure react-carousel (styles.css export, remove injectStyle)

**Files:**

- Modify: `packages/react-carousel/tsup.config.ts`
- Modify: `packages/react-carousel/package.json`

- [ ] **Step 1: Remove injectStyle from tsup config**

Update `packages/react-carousel/tsup.config.ts`:

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    tsconfig: 'tsconfig.lib.json',
    compilerOptions: {
      composite: false,
    },
  },
  clean: true,
  external: ['react', 'react-dom'],
});
```

Change: removed `injectStyle: true`. tsup will extract CSS to `dist/index.css`.

- [ ] **Step 2: Add styles.css export to package.json**

Add to the `"exports"` object in `packages/react-carousel/package.json`:

```json
"./styles.css": "./dist/index.css"
```

- [ ] **Step 3: Build and verify**

```bash
pnpm nx build @bojectify/react-carousel
ls packages/react-carousel/dist/
```

Expected: `index.js`, `index.css`, `index.d.ts`. No `styleInject` in JS:

```bash
grep -c 'styleInject' packages/react-carousel/dist/index.js
```

Expected: `0`.

- [ ] **Step 4: Commit**

```bash
git add packages/react-carousel/tsup.config.ts packages/react-carousel/package.json
git commit -m "feat(react-carousel): export styles.css, remove runtime injection"
```

---

### Task 9: Update documentation

**Files:**

- Modify: `CLAUDE.md`
- Modify: `README.md`

- [ ] **Step 1: Update CLAUDE.md CSS Strategy section**

Update the CSS Strategy section to reflect the split approach:

- react-reveal uses vanilla-extract (static CSS extraction, typed tokens)
- react-carousel uses plain CSS (cutting-edge pseudo-elements not supported by vanilla-extract)
- Both ship `./styles.css` exports for SSR consumers
- react-reveal also sets inline `opacity: 0` and `transform` as SSR belt-and-suspenders

- [ ] **Step 2: Update CLAUDE.md Build Tooling section**

Note that react-reveal uses `@vanilla-extract/esbuild-plugin` in tsup and `@vanilla-extract/vite-plugin` in the Vite config, while react-carousel uses plain tsup CSS extraction.

- [ ] **Step 3: Update README.md**

Add a note to the consuming instructions about CSS imports for SSR:

````markdown
### SSR Usage

For server-side rendered apps (Next.js, Remix, etc.), import the styles in your root layout:

\```tsx
import '@bojectify/react-reveal/styles.css';
import '@bojectify/react-carousel/styles.css';
\```

This ensures CSS is available during SSR and prevents flash of unstyled content.
````

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: update CSS strategy for vanilla-extract and styles.css exports"
```

---

### Task 10: Run full CI check

- [ ] **Step 1: Run all checks**

```bash
pnpm nx run-many -t lint test build typecheck
```

Expected: all targets pass for all projects.

- [ ] **Step 2: Verify Storybook for both packages**

```bash
pnpm nx storybook @bojectify/react-reveal
pnpm nx storybook @bojectify/react-carousel
```

Expected: both Storybooks render correctly with styled components.

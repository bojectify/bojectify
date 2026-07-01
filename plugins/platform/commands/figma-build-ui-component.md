---
description: Implement a UI component (types, SCSS, TSX, stories, mocks) from its Figma design and component tokens. Requires Figma.
argument-hint: <figma-url> --component <name> [--level ...]
---

Build the implementation of a UI component from its Figma design and component tokens.

**Prerequisites:** The component directory must already exist (via `/platform:scaffold-ui-component`) and have populated `tokens/` files (via `/platform:figma-get-component-tokens`).

**Arguments:**

- `$ARGUMENTS` (positional, required) — Figma URL or node ID of the component.
- `--component <name>` (optional) — kebab-case component name. If omitted, inferred from the Figma component name.
- `--level <atoms|molecules|organisms|layout>` (optional) — atomic design level. Determines the subdirectory under `src/components/ui/` and the Storybook title hierarchy. Defaults to `atoms`.

## Steps

1. **Resolve the target component.** Determine the component directory from `--component` or the Figma component name (kebab-cased). Use the `--level` argument (default `atoms`) to resolve the path. Verify `src/components/ui/<level>/<name>/` exists with its scaffold files and populated `tokens/` directory. If not, stop and suggest the missing prerequisite skill.

2. **Read the Figma component.** Use the Figma MCP tools:

   a. **`get_design_context`** with the Figma URL/node-id — returns the component structure, variants, and applied styles.

   b. **`get_screenshot`** — visual reference for building the component.

3. **Read the component's existing files:**
   - `tokens/_structural.scss` and `tokens/_variants.scss` — understand which `--c-*` tokens are available.
   - `<camelCaseName>.types.ts` — current prop types.
   - `<camelCaseName>.module.scss` — current styles.
   - `<camelCaseName>.component.tsx` — current implementation.

4. **Build the prop types** (`<camelCaseName>.types.ts`):
   - Extend `BasicComponentProps<T>` from `@model/types/basicComponent.types`, where `T` is the HTML element type of the component's root element. This ensures `nativeProps` resolves to the correct attributes type. Common mappings:
     - `<div>` → `BasicComponentProps<HTMLDivElement>`
     - `<button>` → `BasicComponentProps<HTMLButtonElement>`
     - `<span>` → `BasicComponentProps<HTMLSpanElement>`
     - `<header>`, `<footer>`, `<section>`, `<nav>` → `BasicComponentProps<HTMLElement>`
     - `<a>` → `BasicComponentProps<HTMLAnchorElement>`
     - `<input>` → `BasicComponentProps<HTMLInputElement>`
   - Import `ObjectValues` from `@model/types/utility.types`.
   - For Figma variant properties that map to visual styles (e.g. primary/secondary/tertiary), define a `<UPPER_NAME>_VARIANTS` const object and a `<Name>Variant` type using `ObjectValues`. Use `variant?: <Name>Variant` as the prop name.
   - Add any other props (e.g. `checked?: boolean`, `label?: string`, `children?: React.ReactNode`).
   - Use sensible defaults matching the Figma default variant.

   Example pattern:

   ```ts
   export const TAG_VARIANTS = {
     PRIMARY: 'primary',
     SECONDARY: 'secondary',
   } as const;
   export type TagVariant = ObjectValues<typeof TAG_VARIANTS>;
   export type TagProps = BasicComponentProps<HTMLSpanElement> & {
     label: string;
     variant?: TagVariant;
   };
   ```

5. **Build the SCSS module** (`<camelCaseName>.module.scss`):
   - `@use './tokens';` must be at the top.
   - Use `var(--c-*)` component tokens for all values that have a corresponding token. Never reference `var(--s-*)` semantic tokens directly.
   - Apply typography mixins via `@use '@styles/mixins' as mixins;` and `@include mixins.typography-<mixin-name>;` where the Figma design uses a mapped text style (e.g. `@include mixins.typography-body;`, `@include mixins.typography-h1-light;`). **CRITICAL:** The mixins are forwarded with `as typography-*` in the index file, so the `typography-` prefix is REQUIRED. Never use `@include mixins.h1-light` or `@include mixins.body` — always use `@include mixins.typography-h1-light`, `@include mixins.typography-body`, etc.
   - Map Figma variant properties to CSS class selectors (e.g. `.primary`, `.checked`).
   - Use `classnames` composition in the component to combine root + variant + state classes.

   **Nested components**: Do not style nested component instances. They render their own styles. Only apply layout properties (width, height, gap, margin) to the wrapper or slot where the nested component sits, using `--c-*` tokens if available.

6. **Build the component** (`<camelCaseName>.component.tsx`):
   - Import `classnames`, the SCSS module, the prop types, and the QA config (`QA_<UPPER_NAME>` from `./<camelCaseName>.config`).
   - Destructure props with defaults matching the Figma default variant. Include `testId = QA_<UPPER_NAME>.COMPONENT` and `nativeProps = {}`.
   - Use `classnames` to compose the root class with variant/state modifier classes.
   - Apply `data-testid={testId}` and `{...nativeProps}` to the root element.
   - Render the component structure matching the Figma layer hierarchy.
   - Nested Figma component instances become React component imports — import them from their own component directories. If the nested component does not exist yet, render a placeholder `<div>` with a TODO comment noting which component is needed.
   - Add `'use client'` directive if the component uses hooks, event handlers, or browser APIs.

7. **Update mocks** (`mocks/<camelCaseName>Props.mock.tsx`):
   - Import the `<UPPER_NAME>_VARIANTS` constant and `<Name>Props` type.
   - Export a base mock (`<camelCaseName>PropsMock`) using the default variant.
   - Export additional mocks for each variant/state combination (e.g. `<camelCaseName>PropsSecondaryMock`), spreading the base mock and overriding variant-specific props.

8. **Update stories** (`<camelCaseName>.stories.tsx`):
   - Import mocks from `./mocks/<camelCaseName>Props.mock`.
   - Add story variants matching Figma variants (e.g. `Primary`, `Secondary`, `Checked`).
   - Use the imported mocks as `args` values (e.g. `args: tagPropsMock`).
   - Add `argTypes` with a `variant` control using `Object.values(<UPPER_NAME>_VARIANTS)`.

9. **Update screenshot tests** (`<camelCaseName>.screenshot.test.tsx`):
   - Import mocks from `./mocks/<camelCaseName>Props.mock` and spread them into `render()`.
   - Add a test for each variant that renders the component and calls `toMatchScreenshot()`.
   - Use `render` from `vitest-browser-react` and `page` from `vitest/browser`.
   - Select the rendered element with an appropriate locator (`page.getByRole`, `page.getByText`, etc.).
   - Name screenshots as `<kebab-case-name>-<variant>` (e.g. `tag-primary`, `switch-secondary-checked`).

10. **Verify.** Run `pnpm lint`, `pnpm format:check`, and `pnpm typecheck`.

## Layout component layers

Figma designs use `Container` and `Reveal` layers to represent layout components from `src/components/ui/layout/`. These are **not** visual components to be recreated — they map directly to existing React components.

### Section padding

If the root frame's vertical padding uses `--s-breakpoint-margin-y-*` semantic tokens across breakpoints, apply the `layout-section-padding` mixin to the root class instead of using component tokens for padding:

```scss
.heroHeader {
  @include mixins.layout-section-padding;
}
```

This is detected automatically from the Figma design context — when `/platform:figma-get-component-tokens` skips the root padding (because it matches the `--s-breakpoint-margin-y-*` pattern), use the mixin here. The mixin provides responsive vertical padding that scales with each breakpoint.

### Container

When a Figma layer is named **"Container"**, render it as a `<Container>` component imported from `@components/ui/layout/container`.

- The Container component applies the `layout-container` mixin by default, which provides responsive horizontal gutters and a max-width at `xl`.
- **Flex layout**: If the Container layer in Figma has a vertical auto-layout (flex column with gap), pass the `flex` prop:
  ```tsx
  <Container flex>
  ```
- **Alignment**: If the Container contents are centred (e.g. `align-items: center`), left-aligned, or bottom-aligned, apply those via a class in the parent's SCSS module, not on the Container itself.
- **Do not** extract width, padding, or gap from the Container layer into component tokens — these are handled by the layout mixins using semantic breakpoint tokens.

### Reveal

When a Figma layer is named **"Reveal"**, render it as a `<Reveal>` component imported from `@bojectify/react-reveal`.

> **Local primitives are optional.** `Reveal` comes from `@bojectify/react-reveal` (a template dependency). `Container` and `Heading` are optional local components — if a scaffolded site hasn't created them yet, treat a layer of that name as a normal nested component (render a `<div>` placeholder with a TODO), rather than importing a component that doesn't exist.

```tsx
import { Reveal } from '@bojectify/react-reveal';
```

The package bundles its own CSS — no additional stylesheet import is needed. The component accepts `className` (string, not `classNames` array), `distance`, `delay`, `direction`, `duration`, `easing`, `fadeIn`, and `as` props. It also spreads any additional HTML attributes.

- Each Reveal wraps a single content block (heading, body text, button, graphic, etc.).
- **Staggered delays**: When multiple Reveal components are **siblings** within the same parent (e.g. inside a Container), assign incrementing `delay` values to create a stagger effect. Use a consistent step (e.g. 150ms):
  ```tsx
  <Reveal className={styles.reveal} distance="36px" delay={150}>
    <HeaderGraphic />
  </Reveal>
  <Reveal className={styles.reveal} distance="36px" delay={300}>
    <h1>{heading}</h1>
  </Reveal>
  <Reveal className={styles.reveal} distance="36px" delay={450}>
    <p>{body}</p>
  </Reveal>
  <Reveal className={styles.reveal} distance="36px" delay={600}>
    <Button label={cta} />
  </Reveal>
  ```
- The base delay step is **150ms** and accumulates for each sibling Reveal.
- If a Reveal is conditionally rendered (e.g. only shown for a specific variant), it still counts in the stagger sequence for the variants where it appears.
- **Do not** extract Reveal dimensions or layout from Figma into component tokens — the Reveal component is transparent and takes the size of its children.

**CRITICAL:** The layout mixins are forwarded with `as layout-*` in the index file, so the `layout-` prefix is REQUIRED. Never use `@include mixins.container`, `@include mixins.container-flex`, or `@include mixins.section-padding` — always use `@include mixins.layout-container`, `@include mixins.layout-container-flex`, `@include mixins.layout-section-padding`, etc.

### Heading

When a Figma text layer is named **"Heading"** (or is clearly a heading in the design hierarchy), render it using the `<Heading>` component imported from `@components/ui/atoms/heading`.

- Import `{ HEADING_LEVELS }` from `@components/ui/atoms/heading/heading.types` and pass the appropriate level via the `as` prop (e.g. `as={HEADING_LEVELS.H2}`).
- **Add a `headingAs` prop** to the parent component's types (type: `HeadingLevel`, imported from `@components/ui/atoms/heading/heading.types`) so consumers can control the semantic heading level. Default to a sensible level based on the component's likely position in the page hierarchy (e.g. `H3` for molecules, `H2` for organisms).
- Pass `classNames={[styles.heading]}` to apply component-specific typography overrides from the SCSS module.
- **Do not** extract the Heading's own internal typography tokens (font-family, font-weight, etc.) — those are handled by the Heading component. Only extract layout properties the parent applies to the heading slot (e.g. margin, alignment).

## Important notes

- Always consume `var(--c-*)` tokens, never `var(--s-*)` directly in the SCSS module.
- Typography uses mixins (`@use '@styles/mixins' as mixins;` then `@include mixins.typography-body;` etc.), not component tokens.
- Layout uses mixins (`@include mixins.layout-container;`, `@include mixins.layout-section-padding;`), not component tokens. For flex layout on Container, use the `flex` prop instead of the mixin directly.
- Nested components are imported and rendered as React components — do not recreate their internals. If a nested component hasn't been built yet, flag it to the user with a list of missing components and their Figma node IDs.
- The `classnames` library is used for all class composition. Variant/state classes are applied conditionally.
- Follow existing component patterns in the codebase (e.g. look at Switch for variant handling, HeroHeader for Container/Reveal usage).

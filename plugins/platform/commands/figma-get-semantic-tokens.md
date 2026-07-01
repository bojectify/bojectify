---
description: Regenerate semantic SCSS tokens from the figma_exports/ variable exports for a brand. Requires Figma exports.
argument-hint: [--brand <Brand>]
---

Generate SCSS token files from Figma variable exports in `figma_exports/`.

**Arguments:**

- `--brand <BrandName>` (optional) — filters brand-prefixed modes and strips the prefix for mode map lookup. If omitted, reads `SITE_CONFIG.BRAND` from `site.config.ts`.
- `--set <colour|breakpoints|typography>` (optional) — only process the specified token set. Maps to collection directories:
  - `colour` → directories containing "Colour"
  - `breakpoints` → directories containing "Breakpoints"
  - `typography` → directories containing "Typography"
    If omitted, all collections are processed.

## Steps

1. **Resolve the brand name.** If `--brand` was provided, use it. Otherwise, read `SITE_CONFIG.BRAND` from `site.config.ts`.

2. **Read the mode map** from `src/styles/figma-mode-map.json`. This maps mode condition names to CSS wrappers:
   - `"type": "default"` → bare `:root { ... }` (no media query)
   - `"type": "media"` → `@media (<query>) { :root { ... } }`

3. **Scan `figma_exports/`** — list all subdirectories. Each subdirectory is a Figma variable collection. If `--set` is provided, filter to only directories whose name contains the matching keyword ("Colour", "Breakpoints", or "Typography"). Skip the rest.

4. **For each collection directory**, process all `*.tokens.json` files:

   a. Read each JSON file and extract the mode name from `$extensions.com.figma.modeName`.

   b. **Determine the condition key** for mode map lookup:
   - If the mode name starts with the `--brand` value (e.g. "<Brand> Dark" with `--brand <Brand>`), strip the brand prefix and trim whitespace → condition is "Dark".
   - If the mode name does NOT start with the brand (e.g. "Mode 1", "xs", "s"), use the full mode name as the condition.

   c. Look up the condition in `figma-mode-map.json`. If not found, warn and skip that file.

   d. **Extract tokens** by recursively walking the JSON. A leaf token is any object containing a `$type` field. For each leaf token, extract:
   - **CSS property name:** Use `$extensions.com.figma.codeSyntax.WEB` if present (strip the `var(` prefix and `)` suffix, and any trailing semicolons). If `codeSyntax.WEB` is absent, generate the name from the JSON object path by joining path segments with hyphens and prefixing with `--` (e.g. path `typography.size.xs` → `--typography-size-xs`), and **print a warning** listing the token path and the fallback name generated (e.g. `⚠ Missing codeSyntax.WEB for "breakpoint.container-margin-y.m" — using fallback --breakpoint-container-margin-y-m`).

   - **Value:** Format depends on `$type`:
     - `"color"` → use `$value.hex`, lowercased (e.g. `#3366cc`)
     - `"number"` → use `$value` (the raw number). **Units:** If the property name contains `weight` (font weight), emit as unitless. If the property name contains `font-size`, convert to rem by dividing by 16 (e.g. `18` → `1.125rem`, `56` → `3.5rem`). Otherwise, append `px` (e.g. `567px`, `14px`).
     - `"string"` → use `$value` as-is, unquoted (e.g. `Jost`, `uppercase`, `120%`)

   e. Group the extracted property-value pairs by condition.

5. **Generate `src/styles/__generated__/_<kebab-case-collection-name>.generated.scss`** for each collection.
   - Create `src/styles/__generated__/` if it does not exist.
   - Convert the directory name to kebab-case (e.g. "Semantic Tokens Colour" → `_semantic-tokens-colour.generated.scss`).

   - **Colour collections** use the CSS `light-dark()` function to eliminate dark-mode duplication. When the mode map pairs a `"default"` (light) mode with a `"prefers-color-scheme: dark"` media mode:
     1. Pair light and dark tokens by CSS property name.
     2. Emit a single `:root` block with `color-scheme: light dark`.
     3. For tokens where light ≠ dark: `--prop: light-dark(<light>, <dark>);`
     4. For tokens where light = dark: `--prop: <value>;` (no wrapper needed).
     5. Emit two `data-theme` override blocks that switch `color-scheme` only — no property redeclarations.

     File structure:

     ```
     /* Auto-generated from Figma — do not edit manually */
     /* Source: figma_exports/<Collection Name>/ */
     /* Regenerate with: /platform:figma-get-semantic-tokens --brand <Brand> */

     :root {
       color-scheme: light dark;

       --property-same-in-both: #fff;
       --property-that-differs: light-dark(#fff, #1a1a2e);
       /* ... */
     }

     :root[data-theme='light'] {
       color-scheme: light;
     }

     :root[data-theme='dark'] {
       color-scheme: dark;
     }
     ```

   - **Non-colour media queries** (e.g. breakpoints) do NOT use `light-dark()` — emit them as plain `@media (<query>) { :root { ... } }` as before.

   - **Ordering:** `"default"` type blocks come first, then `"media"` blocks sorted ascending by the numeric value in their query (e.g. `min-width: 567px` before `min-width: 768px` before `min-width: 1024px`). This ensures correct mobile-first cascade where larger breakpoints override smaller ones.
   - **Within each block:** Sort properties alphabetically by CSS custom property name.
   - **Indentation:** 2 spaces for `:root` properties; 2+2 spaces for media-wrapped properties.
   - Blank line between blocks.

6. **Generate breakpoint SCSS variable** (`src/styles/__generated__/_breakpoints.generated.scss`):

   After processing the Breakpoints collection, generate a SCSS mixin file that enables `@include mixins.breakpoint-up(m) { ... }` usage in components. This works because media query values must be static — CSS custom properties can't be used in `@media` conditions.
   - Read the `breakpoint.width` tokens from the Breakpoints collection's brand token file (e.g. `figma_exports/Semantic Tokens Breakpoints/<Brand>.tokens.json`). Extract all `breakpoint.width.*` entries — each key (xs, s, m, l, xl, xxl) maps to its `$value` in px.
   - Build a SCSS `$breakpoints` map from all width tokens, sorted ascending by value.
   - Only the SCSS variable map is generated — the mixin that consumes it lives in the committed file `src/styles/mixins/_breakpoints.scss`.

   File structure:

   ```scss
   /* Auto-generated from Figma — do not edit manually */
   /* Source: figma_exports/Semantic Tokens Breakpoints/ */
   /* Regenerate with: /platform:figma-get-semantic-tokens --brand <Brand> */

   $breakpoints: (
     xs: 0px,
     s: 567px,
     m: 768px,
     l: 1024px,
     xl: 1440px,
     xxl: 1920px,
   ) !default;
   ```

   - Sort entries by width value ascending.
   - Include ALL breakpoint width tokens from the Figma export, not just those with mode map entries.
   - Use `!default` so the variable can be overridden if needed.

   The mixin in `src/styles/mixins/_breakpoints.scss` imports this generated variable via `@use '../__generated__/breakpoints.generated' as bp` and provides the `up($name)` mixin. The index file forwards it as `@forward './breakpoints' as breakpoint-*;`, so components use: `@use '@styles/mixins' as mixins;` then `@include mixins.breakpoint-up(m) { ... }`.

7. **Update `src/styles/globals.scss`:**
   - Ensure there is a `@use` statement for each generated file (e.g. `@use './__generated__/semantic-tokens-colour.generated';`).
   - Remove any `@use './tokens';` if present.

8. **Update `.storybook/preview.ts`:**
   - Ensure `import '../src/styles/globals.scss';` is present so Storybook loads the tokens.

9. **Clean up:**
   - Delete `src/styles/_tokens.scss` if it still exists (superseded by generated files).

10. **Verify:** Run `pnpm lint`, `pnpm format:check`, and `pnpm typecheck`.

## Important notes

- The brand name is read from `SITE_CONFIG.BRAND` in `site.config.ts` by default. The `--brand` argument overrides it. If neither is available, prompt the user.
- The skill is idempotent — re-running overwrites existing `.generated.scss` files.
- `*.generated.scss` files are in `.gitignore` — they are derived artefacts.
- `figma_exports/` and `figma-mode-map.json` ARE committed — they are source of truth.
- Do NOT modify files inside `figma_exports/` — they are Figma's raw output.
- A `rem()` SCSS function is available in `src/styles/_functions.scss` for converting px values. Components can `@use '@styles/functions'` and call `functions.rem(16px)`. Font-size tokens are emitted in rem for accessibility (scales with user's browser font size setting). Other dimension tokens are emitted in px; the rem conversion for those happens at the component level if needed.
- Tokens without `codeSyntax.WEB` fall back to path-based name generation, but always warn — the fallback name may not match the intended convention (e.g. missing a prefix like `s-`). Flag these to the user so they can update the Figma export.

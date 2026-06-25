Generate component-level SCSS token files from a Figma component.

**Arguments:**

- `$ARGUMENTS` (positional, required) — Figma URL or node ID of the component.
- `--component <name>` (optional) — kebab-case component name to target. If omitted, inferred from the Figma component name.
- `--level <atoms|molecules|organisms|layout>` (optional) — atomic design level. Determines the subdirectory under `src/components/ui/`. Defaults to `atoms`.
- `--dry-run` (optional) — print the proposed tokens without writing files.

## Token naming convention

Follows a BEM-like pattern: **block–element–modifier–property**.

```
--c-{component}-{element}-{modifier}-{property}
```

| Segment             | Source            | Description             |
| ------------------- | ----------------- | ----------------------- |
| `--c-switch`        | Component name    | block (always present)  |
| `-thumb`            | Figma sub-layer   | element (omit for root) |
| `-primary`          | Variant property  | modifier (variant)      |
| `-checked`          | Interactive state | modifier (state)        |
| `-background-color` | CSS property      | property (always last)  |

**Root element** (no sub-element): `--c-switch-primary-checked-background-color`
**Sub-element**: `--c-switch-thumb-primary-checked-color`

The element segment always comes before any modifiers. This ensures tokens group by element when sorted alphabetically (all `--c-switch-thumb-*` tokens together).

## Steps

1. **Resolve the target component.** Determine the component directory from `--component` or from the Figma component name (kebab-cased). Verify `src/components/ui/<level>/<name>/` exists. If not, suggest running `/scaffold-ui-component <name>` first and stop.

2. **Read the Figma component.** Use the Figma MCP tools:

   a. **`get_design_context`** with the Figma URL/node-id — returns the component's layer tree, variants, and applied variables/styles. This is the primary data source.

   b. **`get_screenshot`** — capture a visual reference for verification.

   c. **`get_variable_defs`** (if needed) — resolve variable IDs to their `codeSyntax.WEB` names when the design context only provides IDs.

3. **Analyse the Figma data and build a token map.**

   Extract from the design context:
   - **Elements**: Distinct sub-parts of the component (e.g. track and thumb for Switch). Each becomes an `{element}` segment. If a Figma layer has an ambiguous name (e.g. "Rectangle"), warn the user and use the layer hierarchy to derive a meaningful name.
   - **Modifiers/states**: Variant properties (e.g. `Type=Primary`) and interactive states (e.g. `State=Checked`). Each becomes a `(modifier)` segment.
   - **CSS properties**: Map Figma properties to CSS:
     - Fills → `background-color` (or `color` for text layers)
     - Strokes → `border-color`
     - Corner radius → `border-radius`
     - Width/height → `width` / `height`
     - Padding → `padding` (or `padding-x` / `padding-y` if asymmetric)
     - Gap → `gap`
     - Opacity → `opacity`
   - **Token references**: Resolve applied Figma variables to their `codeSyntax.WEB` names (the `--s-*` token). These become `var(--s-*)` values.
   - **Hard-coded values**: Values not linked to a Figma variable. Emit as literals (px for dimensions, hex for colours). **Warn** for any hard-coded colour values — suggest they should be tokenised in Figma.

   **Typography**: If a text layer uses a text style that maps to an existing typography mixin (in `src/styles/mixins/_typography.scss`), note the mixin name rather than decomposing into individual font property tokens. The mixin should be applied in the SCSS module via `@include`, not via component tokens.

   **Nested components**: When a Figma layer is an instance of another component (e.g. an Article containing Tag, Author, ImagePlaceholder), do NOT descend into that component's internals. Only extract properties that the **parent** applies to the nested instance — typically layout-related properties like width, height, margin, or positioning. The nested component's own styling is handled by running `/get-component-tokens` on that component separately. For example, an Article component might define `--c-article-image-placeholder-height: 523px` but would never define `--c-article-tag-background-color` — that belongs to the Tag component's own tokens.

   **Layout component layers (Container / Reveal)**: Figma layers named "Container" or "Reveal" represent layout components whose styling is handled by shared layout mixins (`layout-container`, `layout-container-flex`) — **not** by component tokens. Skip these layers entirely when extracting tokens. Do not generate `--c-*` tokens for width, padding, gap, or other properties on Container or Reveal layers. The only exception is if the parent component applies custom alignment or positioning to the Container (e.g. `align-items`, `margin-top: auto`), in which case those properties belong to the parent component's tokens, not the Container's.

   **Heading layers**: Figma text layers named "Heading" map to the `<Heading>` component from `@components/ui/atoms/heading`. Do NOT extract typography tokens (font-family, font-weight, font-size, line-height, letter-spacing, text-transform) for these layers — the Heading component handles its own typography. Only extract layout properties the parent applies to the heading slot (e.g. margin, alignment, colour).

   **Section padding**: If the **root frame** has vertical padding that references `--s-breakpoint-margin-y-*` semantic tokens (varying across breakpoints — e.g. `--s-breakpoint-margin-y-xs` at `xs`, `--s-breakpoint-margin-y-l` at `l`), this is the `layout-section-padding` mixin pattern. **Do not** extract these as `--c-*` padding tokens. Instead, note that the root element should use `@include mixins.layout-section-padding;` in the SCSS module. This is analogous to the typography mixin pattern — recognise the token signature and map to the mixin.

   **Hoisting shared properties**: If a property value is identical across all variants/states for an element, define it once at the element level (e.g. `--c-switch-thumb-width`) rather than repeating it per variant.

4. **Generate token files** in `src/components/ui/<level>/<name>/tokens/`:

   Create the `tokens/` directory if it does not exist.

   a. **`tokens/_structural.scss`** — dimensions, radii, padding, gap, timing values. Scoped inside the component's root class:

   ```scss
   /* Auto-generated component tokens — do not edit manually */
   /* Source: Figma component <ComponentName> (<node-id>) */
   /* Regenerate with: /get-component-tokens <figma-url> --component <name> */

   .<camelCaseName > {
     --c-<name>-width: 60px;
     --c-<name>-height: 32px;
     --c-<name>-padding: 4px;
     --c-<name>-border-radius: 16px;
     --c-<name>-transition-duration: 0.2s;

     --c-<name>-thumb-width: 24px;
     --c-<name>-thumb-height: 24px;
     --c-<name>-thumb-border-radius: 50%;
   }
   ```

   b. **`tokens/_variants.scss`** — colour and state tokens per variant, grouped with comments. Scoped inside the component's root class:

   ```scss
   /* Auto-generated component tokens — do not edit manually */
   /* Source: Figma component <ComponentName> (<node-id>) */
   /* Regenerate with: /get-component-tokens <figma-url> --component <name> */

   .<camelCaseName > {
     /* Primary */
     --c-<name>-primary-background-color: var(
       --s-colour-background-primary-disabled
     );
     --c-<name>-primary-checked-background-color: var(
       --s-colour-background-primary
     );
     --c-<name>-thumb-primary-color: var(--s-colour-foreground-on-primary);
     --c-<name>-thumb-primary-checked-color: var(
       --s-colour-foreground-on-primary
     );

     /* Secondary */
     --c-<name>-secondary-background-color: var(
       --s-colour-background-secondary-disabled
     );
     --c-<name>-secondary-checked-background-color: var(
       --s-colour-background-secondary
     );
     --c-<name>-thumb-secondary-color: var(--s-colour-foreground-on-primary);
     --c-<name>-thumb-secondary-checked-color: var(
       --s-colour-background-on-secondary
     );
   }
   ```

   Note: Sub-element tokens (e.g. `thumb`) place the element before the modifier — `--c-<name>-thumb-primary-color`, NOT `--c-<name>-primary-thumb-color`.

   c. **`tokens/_index.scss`** — forwards all partials:

   ```scss
   @forward './structural';
   @forward './variants';
   ```

   **Within each file:** Sort properties alphabetically within each group/comment section. Use 2-space indentation. Blank line between groups.

5. **Update the component SCSS module** (`<camelCaseName>.module.scss`):

   a. Add `@use './tokens';` at the top of the file.

   b. Replace direct `var(--s-*)` references with `var(--c-*)` references.

   c. Replace hard-coded structural values (dimensions, radii, padding) with `var(--c-*)` references.

   d. Leave typography mixins as `@include` — do not convert these to component tokens.

6. **Verify.** Run `pnpm lint`, `pnpm format:check`, and `pnpm typecheck`.

## Important notes

- The skill is idempotent — re-running overwrites the `tokens/` directory contents.
- Token files are generated artefacts and should NOT be manually edited. Overrides go in the component's main SCSS module file.
- Component token files (`tokens/`) are gitignored — add the pattern to `.gitignore` if not already present.
- Dark mode is handled automatically: `var(--c-*)` tokens that alias `var(--s-*)` semantic tokens inherit dark mode support via the global `:root` / `@media` / `data-theme` cascade. No extra work needed.
- Hard-coded colour values in Figma are a code smell. Always warn when encountered and suggest the user tokenise them in Figma.
- Structural values (dimensions, radii, padding, timing) are emitted in px. The `rem()` function from `src/styles/_functions.scss` can be used at the component level if needed.
- If the Figma component is a component set (with variants), target the component set node to capture all variants. If given a single variant node, walk up to the parent component set.
- If `@forward` composition proves insufficient for complex variant patterns (e.g. buttons), SCSS placeholders (`%c-<name>-*`) can be introduced. Discuss with the user before switching approaches.

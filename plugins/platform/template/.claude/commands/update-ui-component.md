Apply targeted updates to an existing UI component from its updated Figma design.

Unlike `/build-ui-component` which creates files from scratch, this skill reads the existing implementation and applies only the changes — preserving manual edits like accessibility attributes, custom props, markdown support, and other enhancements not present in the Figma design.

**Prerequisites:** The component must already exist (built via `/new-component` or `/build-ui-component`).

**Arguments:**

- `$ARGUMENTS` (positional, required) — Figma URL or node ID of the component.
- `--component <name>` (optional) — kebab-case component name. If omitted, inferred from the Figma component name.
- `--level <atoms|molecules|organisms|layout>` (optional) — atomic design level. Determines the subdirectory under `src/components/ui/`. Defaults to `atoms`.

## Steps

1. **Resolve the target component.** Determine the component directory from `--component` or the Figma component name (kebab-cased). Verify `src/components/ui/<level>/<name>/` exists with its implementation files. If not, suggest running `/new-component` instead and stop.

2. **Update semantic tokens.** Run `/get-semantic-tokens` to ensure all `--s-*` tokens are current. The Figma update may have introduced new semantic tokens (e.g. new status colours).

3. **Update component tokens.** Run `/get-component-tokens <figma-url> --component <name> --level <level>` to regenerate `tokens/_structural.scss` and `tokens/_variants.scss`. These are gitignored artefacts and safe to overwrite entirely.

4. **Fetch the updated Figma design.** Use `get_design_context` with the Figma URL/node-id and `get_screenshot` for visual reference. This is the source of truth for what the component should now look like.

5. **Read all existing component files** to understand the current implementation:
   - `<camelCaseName>.types.ts` — current prop types, constants, variant unions
   - `<camelCaseName>.component.tsx` — current component logic, imports, manual additions
   - `<camelCaseName>.module.scss` — current styles, variant classes
   - `<camelCaseName>.stories.tsx` — current stories
   - `<camelCaseName>.screenshot.test.tsx` — current screenshot tests
   - `mocks/<camelCaseName>Props.mock.tsx` — current mocks
   - `tokens/_structural.scss` and `tokens/_variants.scss` — freshly regenerated tokens from step 3

6. **Diff the Figma design against the current implementation.** Identify:

   a. **New variants/states** — present in Figma but not in the types file. These need adding to:
   - Types: add to the `as const` object and the union type
   - Component: add to any variant maps (e.g. `iconMap`), ensure the variant class is applied via `classnames`
   - SCSS module: add a new variant modifier class that maps interface tokens to variant-specific tokens
   - Mocks: add a new mock for the variant
   - Stories: add a new story for the variant
   - Screenshot tests: add a new test for the variant

   b. **Removed variants/states** — present in the current types but not in Figma. Remove from all files listed above.

   c. **Changed structural values** — already handled by token regeneration in step 3. No further action needed unless the SCSS module references removed tokens.

   d. **Changed colour/variant values** — already handled by token regeneration in step 3. No further action needed.

   e. **New elements/sub-components** — new layers in Figma that don't exist in the current component. Add the corresponding JSX, styles, and tokens.

   f. **Removed elements** — layers present in the current component but not in the updated Figma. Remove the corresponding JSX and styles.

7. **Apply changes surgically.** For each change identified in step 6:
   - Use targeted edits (Edit tool with `old_string`/`new_string`) rather than rewriting entire files
   - **Preserve** any manual additions not derived from Figma:
     - Custom props (e.g. `headingAs`, `message` with markdown support)
     - Accessibility attributes (e.g. `role="alert"`, `aria-label`)
     - Custom imports (e.g. `react-markdown`)
     - Additional SCSS beyond token mappings (e.g. markdown styles)
     - Extra stories or tests not tied to Figma variants
   - When adding a new variant class to SCSS, follow the existing pattern in the file (copy the structure of an existing variant class and update token references)
   - When adding a new mock, follow the naming convention of existing mocks
   - When adding a new story, follow the structure of existing stories
   - When adding a new screenshot test, follow the structure of existing tests

8. **Verify.** Run `pnpm lint`, `pnpm lint:scss`, `pnpm format:check`, and `pnpm typecheck`.

## Important notes

- This skill is for **incremental updates**, not full rebuilds. If the component doesn't exist yet, use `/new-component`.
- Token files (`tokens/`) are always safe to overwrite entirely — they are generated artefacts.
- Implementation files (`.component.tsx`, `.module.scss`, `.types.ts`, etc.) must be edited surgically to preserve manual work.
- The skill follows all the same conventions as `/build-ui-component` for naming, typing, SCSS patterns, and layout component handling (Container, Reveal, Heading).
- After updating, screenshot baselines may need regenerating: `pnpm test:screenshots:update <component>`.

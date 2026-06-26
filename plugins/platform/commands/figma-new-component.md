---
description: Build a complete UI component from a Figma design (orchestrates scaffold → tokens → implementation, recurses into nested components). Requires Figma.
argument-hint: <figma-url> [--level atoms|molecules|organisms] [--polymorphic]
---

Create a complete UI component from a Figma design. This orchestrator runs the full pipeline.

**Arguments:**

- `$ARGUMENTS` (positional, required) — Figma URL of the component.
- `--component <name>` (optional) — kebab-case component name. If omitted, inferred from the Figma component name.
- `--level <atoms|molecules|organisms|layout>` (optional) — atomic design level. Determines the subdirectory under `src/components/ui/` and the Storybook title hierarchy. Defaults to `atoms`.
- `--polymorphic` (optional) — scaffold the component with a generic `as?: ElementType` prop, allowing consumers to change the rendered HTML element. Passed through to `/platform:scaffold-ui-component`.

## Pipeline

Run each step in order. Pass the resolved component name, level, and Figma URL through to each step.

### Step 1: Get semantic tokens

Run `/platform:figma-get-semantic-tokens` to ensure all semantic tokens (`--s-*`) are up to date.

### Step 2: Scaffold the component

Check if `src/components/ui/<level>/<name>/` already exists. If not, run `/platform:scaffold-ui-component <name> --level <level>` (appending `--polymorphic` if the flag was passed) to create the directory structure with all placeholder files.

### Step 3: Detect and create missing child components

Before generating tokens or building the parent, check whether nested child components already exist:

1. **Call `get_design_context`** on the Figma URL/node-id for the parent component.
2. **Identify nested component instances** in the returned structure — these are Figma component instances that correspond to separate UI components (e.g. `Tag`, `Author`, `Button`). **Exclude layers** named "Container", "Reveal", or "Heading" — these map to existing shared components (see `/platform:figma-build-ui-component`) and do not need to be created.

> Of these, only `Reveal` is guaranteed (template dependency `@bojectify/react-reveal`). `Container`/`Heading` are excluded only if the scaffolded site actually provides them under `@components/ui/…`; otherwise treat them as ordinary nested components.

3. **For each nested component**, check whether it already exists under any level subdirectory of `src/components/ui/` (search `atoms/`, `molecules/`, `organisms/`, and `layout/`).
4. **If any are missing**, present the list to the user and ask whether to create them first (include a suggested `--level` for each based on the component's complexity):

   ```
   This component references child components that don't exist yet:
   - Author (node-id: 2054:169) — suggested level: atoms
   - ImagePlaceholder (node-id: 2054:134) — suggested level: atoms

   Create them now before building <ParentComponent>? [y/n]
   ```

5. **If the user confirms**, run the full `/platform:figma-new-component` pipeline for each missing child **sequentially** (not in parallel — to avoid conflicts on shared files like semantic tokens). Use the same Figma file key with each child's node ID. Pass the appropriate `--level` for each child. After all children are created, continue with the parent's Step 4.
6. **If the user declines**, continue with the parent build. Step 5 (`/platform:figma-build-ui-component`) will render `<div>` placeholders with TODO comments for missing components.

**Important:** Only go one level deep. If a child component itself has nested children, those will be detected and prompted for during the child's own `/platform:figma-new-component` run. This naturally handles deep nesting without unbounded recursion.

### Step 4: Get component tokens

Run `/platform:figma-get-component-tokens <figma-url> --component <name> --level <level>` to generate the `tokens/` directory with `_structural.scss` and `_variants.scss` from the Figma component.

### Step 5: Build the component

Run `/platform:figma-build-ui-component <figma-url> --component <name> --level <level>` to implement the component: prop types, SCSS module, component TSX, stories, and mocks.

### Step 6: Save Figma reference screenshot

Use the Figma MCP `get_screenshot` tool to capture the component's default variant. Save the PNG to `src/components/ui/<level>/<name>/references/figma-design.png`. This serves as a human-reviewable reference for comparing the built component against the original Figma design. It is not used for automated testing.

## Nested components

Child components are detected in Step 3 and the user is prompted to create them before the parent is built. This ensures imports resolve cleanly and the parent component can render real children rather than placeholders.

If the user declines to create child components, they are handled gracefully:

- `/platform:figma-get-component-tokens` extracts only layout properties (width, height, margin) for nested slots.
- `/platform:figma-build-ui-component` renders `<div>` placeholders with TODO comments for any missing components.

At the end of the pipeline, **print a summary** of any nested components that were skipped or already existed:

```
Nested components in <ComponentName>:
- Tag (node-id: 2057:83) — already exists ✓ (atoms)
- Author (node-id: 2054:169) — created in this run ✓ (atoms)
- ImagePlaceholder (node-id: 2054:134) — skipped, run: /platform:figma-new-component <figma-url> --component image-placeholder --level atoms
```

## Important notes

- Each step is independently runnable — the orchestrator just sequences them.
- If any step fails, stop and report the error. Do not continue to the next step.
- The `--component` name is resolved once in step 2 (from the Figma component name or the argument) and reused for all subsequent steps.
- The `--level` is resolved once and passed to all downstream skills. When searching for existing child components, check all level subdirectories.
- The brand name for step 1 is read from `SITE_CONFIG.BRAND` in `site.config.ts` by default.

---
description: Scaffold a new UI component (files, types, stories, dual-theme screenshot spec). No Figma required.
argument-hint: <kebab-name> [--level atoms|molecules|organisms|layout] [--polymorphic]
---

Create a new UI component named `$ARGUMENTS`.

**Arguments:**

- `$ARGUMENTS` (positional, required) — component name in kebab-case.
- `--level <atoms|molecules|organisms|layout>` (optional) — atomic design level. Determines the subdirectory under `src/components/ui/` and the Storybook title hierarchy. Defaults to `atoms`.
- `--polymorphic` (optional) — scaffold the component with a generic `as?: ElementType` prop, allowing consumers to change the rendered HTML element. Uses `createElement` instead of JSX for the root element (see Container and Reveal for reference).

Scaffold the following files in `src/components/ui/<level>/<kebab-case-name>/`:

1. **`<camelCaseName>.component.tsx`**

   Default:

   ```
   import classnames from 'classnames';
   import styles from './<camelCaseName>.module.scss';
   import { <PascalCaseName>Props } from './<camelCaseName>.types';
   import { QA_<UPPER_SNAKE_CASE_NAME> } from './<camelCaseName>.config';

   const <PascalCaseName> = ({
     classNames = [],
     testId = QA_<UPPER_SNAKE_CASE_NAME>.COMPONENT,
     nativeProps = {},
   }: <PascalCaseName>Props) => {
     const classes = classnames(styles.<camelCaseName>, classNames);

     return (
       <div className={classes} data-testid={testId} {...nativeProps}>
         TODO
       </div>
     );
   };

   export default <PascalCaseName>;
   ```

   With `--polymorphic`:

   ```
   import { createElement } from 'react';
   import classnames from 'classnames';
   import styles from './<camelCaseName>.module.scss';
   import { <PascalCaseName>Props } from './<camelCaseName>.types';
   import { QA_<UPPER_SNAKE_CASE_NAME> } from './<camelCaseName>.config';

   function <PascalCaseName><T extends Element = HTMLElement>({
     as = 'div',
     classNames = [],
     testId = QA_<UPPER_SNAKE_CASE_NAME>.COMPONENT,
     nativeProps = {} as <PascalCaseName>Props<T>['nativeProps'] & {},
   }: <PascalCaseName>Props<T>) {
     const classes = classnames(styles.<camelCaseName>, classNames);

     return createElement(
       as,
       {
         ...nativeProps,
         className: classes,
         'data-testid': testId,
       },
       'TODO'
     );
   }

   export default <PascalCaseName>;
   ```

2. **`<camelCaseName>.types.ts`**

   Default:

   ```
   import { BasicComponentProps } from '@model/types/basicComponent.types';

   export type <PascalCaseName>Props = BasicComponentProps<HTMLDivElement>;
   ```

   With `--polymorphic`:

   ```
   import { BasicComponentProps } from '@model/types/basicComponent.types';
   import { ElementType } from 'react';

   export type <PascalCaseName>Props<T extends Element = HTMLElement> =
     BasicComponentProps<T> & {
       as?: ElementType;
     };
   ```

   Use the appropriate HTML element type for the component's root element (e.g. `HTMLSpanElement`, `HTMLButtonElement`). Default to `HTMLDivElement` (or `HTMLElement` for polymorphic components).

3. **`<camelCaseName>.config.ts`**

   ```
   import { testIds } from '@test-config/testConfig.utils';

   export const QA_<UPPER_SNAKE_CASE_NAME> = {
     ...testIds('<UPPER_SNAKE_CASE_NAME>'),
   };
   ```

4. **`<camelCaseName>.module.scss`**

   ```
   @use './tokens';

   .<camelCaseName> {
     // TODO
   }
   ```

5. **`<camelCaseName>.stories.tsx`**

   ```
   import type { Meta, StoryObj } from '@storybook/nextjs-vite';

   import <PascalCaseName> from './<camelCaseName>.component';

   const meta = {
     title: 'Components/UI/<PascalLevel>/<PascalCaseName>',
     component: <PascalCaseName>,
     parameters: {
       layout: 'centered',
     },
     tags: ['autodocs'],
   } satisfies Meta<typeof <PascalCaseName>>;

   export default meta;
   type Story = StoryObj<typeof meta>;

   export const Default: Story = {
     args: {},
   };
   ```

6. **`tokens/_structural.scss`**

   ```
   /* Component tokens — regenerate with /platform:figma-get-component-tokens */

   .<camelCaseName> {
     /* structural tokens */
   }
   ```

7. **`tokens/_variants.scss`**

   ```
   /* Component tokens — regenerate with /platform:figma-get-component-tokens */

   .<camelCaseName> {
     /* variant tokens */
   }
   ```

8. **`tokens/_index.scss`**

   ```
   @forward './structural';
   @forward './variants';
   ```

9. **`mocks/<camelCaseName>Props.mock.tsx`**

   ```
   import { <PascalCaseName>Props } from '../<camelCaseName>.types';

   export const <camelCaseName>PropsMock: <PascalCaseName>Props = {
     /* props */
   };
   ```

10. **`<camelCaseName>.screenshot.test.tsx`**

```
import { describe, test } from 'vitest';

import { screenshotBothThemes } from '@test-config/screenshotThemes';
import <PascalCaseName> from './<camelCaseName>.component';
import { QA_<UPPER_SNAKE_CASE_NAME> } from './<camelCaseName>.config';

describe('<PascalCaseName> screenshots', () => {
  // Captures light + dark baselines: <kebab-case-name>-default-light / -dark
  test('default (light + dark)', async () => {
    await screenshotBothThemes(
      '<kebab-case-name>-default',
      QA_<UPPER_SNAKE_CASE_NAME>.COMPONENT,
      () => <<PascalCaseName> />
    );
  });
});
```

11. **`references/`** — empty directory (Figma reference screenshot saved here by `/platform:figma-new-component`).

12. **`index.ts`**

```
export { default as <PascalCaseName> } from './<camelCaseName>.component';
```

Use the naming conventions:

- Directory: `kebab-case` (e.g. `site-header`)
- Component/types/styles/stories files: `camelCase` (e.g. `siteHeader.component.tsx`)
- Export name: `PascalCase` (e.g. `SiteHeader`)
- Config constant: `QA_UPPER_SNAKE_CASE` (e.g. `QA_SITE_HEADER`)

If the component needs `'use client'` (e.g. uses hooks, event handlers, or browser APIs), add the directive at the top of the component file.

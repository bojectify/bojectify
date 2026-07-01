---
description: Scaffold a new SVG component. No Figma required.
argument-hint: <kebab-name>
---

Create a new SVG component named `$ARGUMENTS`.

Scaffold the following files in `src/components/svg/<kebab-case-name>/`:

1. **`<camelCaseName>.component.tsx`**

   ```
   import classnames from 'classnames';
   import { <PascalCaseName>Props } from './<camelCaseName>.types';
   import { QA_<UPPER_SNAKE_CASE_NAME> } from './<camelCaseName>.config';

   const <PascalCaseName> = ({
     fill = '#fff',
     classNames = [],
     testId = QA_<UPPER_SNAKE_CASE_NAME>.COMPONENT,
     nativeProps = {},
   }: <PascalCaseName>Props) => {
     return (
       <svg
         className={classnames('<kebab-case-name>', ...classNames)}
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 100 100"
         data-testid={testId}
         {...nativeProps}
       >
         <title>TODO</title>
         <rect fill={fill} width="100" height="100" />
       </svg>
     );
   };

   export default <PascalCaseName>;
   ```

2. **`<camelCaseName>.types.ts`**

   ```
   import { BasicComponentProps } from '@model/types/basicComponent.types';

   export type <PascalCaseName>Props = BasicComponentProps<SVGSVGElement> & {
     fill?: string;
   };
   ```

3. **`<camelCaseName>.config.ts`**

   ```
   import { testIds } from '@test-config/testConfig.utils';

   export const QA_<UPPER_SNAKE_CASE_NAME> = {
     ...testIds('<UPPER_SNAKE_CASE_NAME>'),
   };
   ```

4. **`<camelCaseName>.stories.tsx`**

   ```
   import type { Meta, StoryObj } from '@storybook/nextjs-vite';

   import <PascalCaseName> from './<camelCaseName>.component';
   import { <camelCaseName>PropsMock } from './mocks/<camelCaseName>Props.mock';

   const meta = {
     title: 'Components/SVG/<PascalCaseName>',
     component: <PascalCaseName>,
     parameters: {
       layout: 'centered',
       backgrounds: { default: 'dark' },
     },
     tags: ['autodocs'],
   } satisfies Meta<typeof <PascalCaseName>>;

   export default meta;
   type Story = StoryObj<typeof meta>;

   export const Default: Story = {
     args: <camelCaseName>PropsMock,
   };
   ```

5. **`mocks/<camelCaseName>Props.mock.tsx`**

   ```
   import { <PascalCaseName>Props } from '../<camelCaseName>.types';

   export const <camelCaseName>PropsMock: <PascalCaseName>Props = {
     fill: '#fff',
   };
   ```

6. **`<camelCaseName>.screenshot.test.tsx`**

   ```
   import { describe, expect, test } from 'vitest';
   import { render } from 'vitest-browser-react';
   import { page } from 'vitest/browser';

   import <PascalCaseName> from './<camelCaseName>.component';
   import { <camelCaseName>PropsMock } from './mocks/<camelCaseName>Props.mock';

   describe('<PascalCaseName> screenshots', () => {
     test('default', async () => {
       render(<<PascalCaseName> {...<camelCaseName>PropsMock} />);
       const element = page.getByRole('img');
       await expect(element).toMatchScreenshot('<kebab-case-name>-default');
     });
   });
   ```

7. **`index.ts`**

   ```
   export { default as <PascalCaseName> } from './<camelCaseName>.component';
   ```

Use the naming conventions:

- Directory: `kebab-case` (e.g. `logo-graphic`)
- Component/types/stories files: `camelCase` (e.g. `logoGraphic.component.tsx`)
- Export name: `PascalCase` (e.g. `LogoGraphic`)
- Config constant: `QA_UPPER_SNAKE_CASE` (e.g. `QA_LOGO_GRAPHIC`)

SVG components do not use SCSS Modules or tokens — styling is inline via props (e.g. `fill`). Use CSS hex strings for colours (`'#fff'`), not PixiJS integers.

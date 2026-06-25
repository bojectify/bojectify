import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const pathAliases = {
  '@app': path.join(dirname, 'src', 'app'),
  '@components': path.join(dirname, 'src', 'components'),
  '@constants': path.join(dirname, 'src', 'constants'),
  '@hooks': path.join(dirname, 'src', 'hooks'),
  '@lib': path.join(dirname, 'src', 'lib'),
  '@model': path.join(dirname, 'src', 'model'),
  '@i18n': path.join(dirname, 'src', 'i18n'),
  '@siteConfig': path.join(dirname, 'site.config.ts'),
  '@siteFontsConfig': path.join(dirname, 'site-fonts.config.ts'),
  '@styles': path.join(dirname, 'src', 'styles'),
  '@test-config': path.join(dirname, 'src', 'test', 'config'),
  '@transforms': path.join(dirname, 'src', 'transforms'),
  '@utils': path.join(dirname, 'src', 'utils'),
};

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        resolve: { alias: pathAliases },
        test: {
          name: 'unit',
          include: [
            'src/**/*.test.ts',
            'src/**/*.test.tsx',
            'scripts/**/*.test.ts',
          ],
          exclude: ['src/**/*.screenshot.test.tsx'],
          globals: true,
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      {
        extends: true,
        define: {
          'process.env': {},
        },
        resolve: { alias: pathAliases },
        test: {
          name: 'screenshots',
          globals: true,
          include: ['src/**/*.screenshot.test.tsx'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['src/test/screenshots.setup.ts'],
        },
      },
    ],
  },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/react-reveal',
  plugins: [react()],
  test: {
    // `watch` is a global option; with `test.projects` it must be set here at
    // the root (not per-project) to force run-once even in an interactive TTY.
    watch: false,
    projects: [
      {
        extends: true as const,
        test: {
          name: '@bojectify/react-reveal',
          globals: true,
          environment: 'jsdom',
          include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
          reporters: ['default'],
          coverage: {
            reportsDirectory: './test-output/vitest/coverage',
            provider: 'v8' as const,
          },
        },
      },
      {
        extends: true as const,
        plugins: [
          storybookTest({
            configDir: `${__dirname}/.storybook`,
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: playwright({}),
            headless: true,
            instances: [{ browser: 'chromium' as const }],
          },
        },
      },
    ],
  },
}));

import path from 'path';
import { fileURLToPath } from 'url';
import type { StorybookConfig } from '@storybook/nextjs-vite';
import { mergeConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    'storybook-addon-pseudo-states',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  viteFinal(config) {
    const existingAlias: Record<string, string> =
      config.resolve?.alias && !Array.isArray(config.resolve.alias)
        ? (config.resolve.alias as Record<string, string>)
        : {};

    return mergeConfig(config, {
      resolve: {
        extensions: [
          ...(config.resolve?.extensions ?? []),
          '.mjs',
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.json',
          '.cjs',
          '.config.ts',
          '.config.tsx',
        ],
        alias: {
          ...existingAlias,
          '@app': path.join(__dirname, '..', 'src', 'app'),
          '@components': path.join(__dirname, '..', 'src', 'components'),
          '@constants': path.join(__dirname, '..', 'src', 'constants'),
          '@hooks': path.join(__dirname, '..', 'src', 'hooks'),
          '@lib': path.join(__dirname, '..', 'src', 'lib'),
          '@model': path.join(__dirname, '..', 'src', 'model'),
          '@navigation': path.join(
            __dirname,
            '..',
            'src',
            'i18n',
            'navigation.ts'
          ),
          '@styles': path.join(__dirname, '..', 'src', 'styles'),
          '@transforms': path.join(__dirname, '..', 'src', 'transforms'),
          '@utils': path.join(__dirname, '..', 'src', 'utils'),
        },
      },
    });
  },
};
export default config;

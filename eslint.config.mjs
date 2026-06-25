import nx from '@nx/eslint-plugin';
import prettier from 'eslint-config-prettier';

export default [
  prettier,
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/build',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      // Bundled template — linting is managed inside the template itself
      'plugins/platform/template/**',
    ],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:react-store',
              onlyDependOnLibsWithTags: ['scope:react-store'],
            },
            {
              sourceTag: 'scope:react-store-async',
              onlyDependOnLibsWithTags: [
                'scope:react-store-async',
                'scope:react-store',
              ],
            },
            {
              sourceTag: 'scope:react-reveal',
              onlyDependOnLibsWithTags: ['scope:react-reveal'],
            },
            {
              sourceTag: 'scope:react-carousel',
              onlyDependOnLibsWithTags: ['scope:react-carousel'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];

import type { Config } from 'stylelint';

export default {
  plugins: ['stylelint-scss'],
  extends: [
    'stylelint-config-property-sort-order-smacss',
    'stylelint-config-standard-scss',
  ],
  rules: {
    'at-rule-empty-line-before': null,
    'block-no-empty': null,
    'selector-class-pattern': null,
    'scss/no-global-function-names': true,
    'no-duplicate-selectors': true,
    'scss/dollar-variable-pattern': '^_?[a-z][a-z0-9-]*$',
    'scss/at-mixin-pattern':
      '^[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*((__[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*)(--[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*)?)?(--[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*)?$',
    'value-keyword-case': [
      'lower',
      { ignoreKeywords: ['Jost', 'Lato', 'IBM', 'Plex', 'Mono'] },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global'] },
    ],
    'custom-property-pattern': '^_?[a-z][a-zA-Z0-9-]*$',
    'keyframes-name-pattern': '^[a-z][a-zA-Z0-9-]*$',
  },
} satisfies Config;

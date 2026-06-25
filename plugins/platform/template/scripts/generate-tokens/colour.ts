import { formatValue, scssHeader } from './format.js';
import type { Token } from './types.js';

/**
 * Generates the colour SCSS file content.
 *
 * Pairs light (default) and dark tokens by CSS var name. Uses
 * `light-dark(lightVal, darkVal)` when values differ, or a plain value when
 * they're the same. Adds `color-scheme: light dark` to :root and two
 * `data-theme` override blocks.
 */
export function generateColour(
  defaultTokens: Token[],
  darkTokens: Token[],
  collectionDir: string,
  root: string
): string {
  const lightByName = new Map(defaultTokens.map((t) => [t.name, t]));
  const darkByName = new Map(darkTokens.map((t) => [t.name, t]));

  // Merge all unique names from both light and dark
  const allNames = [
    ...new Set([...lightByName.keys(), ...darkByName.keys()]),
  ].sort();

  const indent = '  ';
  const propLines = allNames
    .map((name) => {
      const lightToken = lightByName.get(name);
      const darkToken = darkByName.get(name);
      const token = lightToken ?? darkToken;
      if (!token) return '';

      const lightVal = lightToken
        ? formatValue(
            lightToken.type,
            lightToken.value,
            lightToken.name,
            lightToken.hex
          )
        : undefined;
      const darkVal = darkToken
        ? formatValue(
            darkToken.type,
            darkToken.value,
            darkToken.name,
            darkToken.hex
          )
        : undefined;

      const value =
        lightVal && darkVal && lightVal !== darkVal
          ? `light-dark(${lightVal}, ${darkVal})`
          : (lightVal ?? darkVal);

      return `${indent}${name}: ${value};`;
    })
    .filter(Boolean);

  const header = scssHeader(collectionDir, root);

  const rootBlock = [
    ':root {',
    `${indent}color-scheme: light dark;`,
    '',
    propLines.join('\n'),
    '}',
  ].join('\n');

  const lightOverride = [
    ":root[data-theme='light'] {",
    `${indent}color-scheme: light;`,
    '}',
  ].join('\n');
  const darkOverride = [
    ":root[data-theme='dark'] {",
    `${indent}color-scheme: dark;`,
    '}',
  ].join('\n');

  return [header, '', rootBlock, '', lightOverride, '', darkOverride, ''].join(
    '\n'
  );
}

import { readFileSync } from 'node:fs';
import type { Token } from './types.js';

/**
 * Regex-extracts the brand name from site.config.ts.
 * We avoid importing the file because it uses next/font which isn't
 * available in the Node/tsx script context.
 */
export function readBrand(siteConfigPath: string): string {
  const src = readFileSync(siteConfigPath, 'utf8');
  const match = /const\s+BRAND\s*=\s*['"]([^'"]+)['"]/.exec(src);
  if (!match?.[1]) {
    throw new Error('Could not extract brand from site.config.ts');
  }
  return match[1];
}

/**
 * Extracts the CSS custom property name from a token's $extensions.
 * Strips the var() wrapper. Warns and falls back to a generated name
 * if the codeSyntax is missing.
 */
export function extractPropertyName(
  extensions: Record<string, unknown> | undefined,
  fallback: string
): string {
  const web =
    (extensions?.['com.figma.codeSyntax'] as Record<string, string> | undefined)
      ?.WEB ?? '';

  if (!web) {
    console.warn(
      `Warning: missing codeSyntax.WEB for token, using fallback: ${fallback}`
    );
    return fallback;
  }

  // Strip var() wrapper: "var(--s-colour-background-site)" → "--s-colour-background-site"
  return web.replace(/^var\((.+)\)$/, '$1');
}

/**
 * Recursively walks a token JSON object and returns a flat array of Token
 * objects. Skips $extensions keys at every level.
 */
export function extractTokens(
  obj: Record<string, unknown>,
  pathParts: string[] = []
): Token[] {
  const tokens: Token[] = [];

  for (const key of Object.keys(obj)) {
    if (key === '$extensions') continue;

    const child: unknown = obj[key];

    if (typeof child !== 'object' || child === null) continue;

    const childObj = child as Record<string, unknown>;

    // Leaf node: has a $type property
    if ('$type' in childObj) {
      const type = childObj['$type'] as string;
      const rawValue = childObj['$value'] as
        | string
        | number
        | Record<string, unknown>;

      const extensions = childObj['$extensions'] as
        | Record<string, unknown>
        | undefined;

      const fallbackName = `--${[...pathParts, key].join('-')}`;
      const name = extractPropertyName(extensions, fallbackName);

      const hex =
        type === 'color'
          ? ((rawValue as Record<string, unknown>)['hex'] as string | undefined)
          : undefined;

      tokens.push({ name, type, value: rawValue, hex });
    } else {
      // Recurse
      tokens.push(...extractTokens(childObj, [...pathParts, key]));
    }
  }

  return tokens;
}

/**
 * Strips the brand prefix from a mode name and trims whitespace.
 * e.g. "Boject Light" (brand="Boject") → "Light"
 *      "Boject" (brand="Boject") → "" (exact brand match → default condition)
 *      "xs" → "xs" (no brand prefix)
 */
export function resolveCondition(modeName: string, brand: string): string {
  if (modeName === brand) return '';
  return modeName.startsWith(brand + ' ')
    ? modeName.slice(brand.length + 1).trim()
    : modeName.trim();
}

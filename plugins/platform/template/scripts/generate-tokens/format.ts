import { relative } from 'node:path';
import type { Token } from './types.js';

/**
 * Shortens a 6-digit hex colour to 3 digits when each pair of digits is
 * identical (e.g. #AABBCC → #abc). Always returns lowercase.
 */
export function shortenHex(hex: string): string {
  const m = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(hex);
  if (!m) return hex.toLowerCase();
  const r = m[1];
  const g = m[2];
  const b = m[3];
  if (!r || !g || !b) return hex.toLowerCase();
  if (r[0] === r[1] && g[0] === g[1] && b[0] === b[1]) {
    return `#${r[0]}${g[0]}${b[0]}`.toLowerCase();
  }
  return hex.toLowerCase();
}

/**
 * Formats a token value for use as a CSS custom property value.
 *
 * - color → shortened hex string
 * - number where CSS var name contains "weight" → unitless integer
 * - number where CSS var name contains "font-size" → rem (value / 16)
 * - number otherwise → Npx
 * - string → as-is
 */
export function formatValue(
  type: string,
  value: string | number | Record<string, unknown>,
  cssVarName: string,
  hex?: string
): string {
  if (type === 'color') {
    if (!hex) throw new Error(`Missing hex for color token ${cssVarName}`);
    return shortenHex(hex);
  }

  if (type === 'number') {
    const num = value as number;
    if (cssVarName.includes('-weight')) {
      // Font weight is unitless
      return String(num);
    }
    if (cssVarName.includes('-font-size-')) {
      // Font sizes are expressed in rem (base 16)
      const rem = num / 16;
      // Format without unnecessary trailing zeros
      const rounded = parseFloat(rem.toFixed(4));
      return `${rounded}rem`;
    }
    // Everything else (breakpoints, spacing) is px
    return `${num}px`;
  }

  // string type — use value as-is
  return typeof value === 'string' ? value : JSON.stringify(value);
}

/**
 * Returns the 3-line header comment block for generated SCSS files.
 * Lines are separated by blank lines as seen in the existing output.
 */
export function scssHeader(collectionDir: string, root: string): string {
  // collectionDir is the full absolute path; we want just the relative
  // "figma_exports/..." portion for the comment
  const rel = relative(root, collectionDir).replace(/\\/g, '/'); // normalise on Windows

  return [
    '/* Auto-generated from Figma — do not edit manually */',
    '',
    `/* Source: ${rel}/ */`,
    '',
    `/* Regenerate with: pnpm codegen:tokens */`,
  ].join('\n');
}

/** Converts a string to kebab-case (lowercase, spaces → hyphens). */
export function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Formats a map of CSS custom properties as a sorted :root block body
 * (without the selector wrapper). Each property is indented by `indent`.
 */
export function formatRootBlock(tokens: Token[], indent: string): string {
  const sorted = [...tokens].sort((a, b) => a.name.localeCompare(b.name));
  return sorted
    .map(
      (t) =>
        `${indent}${t.name}: ${formatValue(t.type, t.value, t.name, t.hex)};`
    )
    .join('\n');
}

/**
 * Wraps a set of tokens in a @media block using modern CSS range syntax
 * (e.g. `min-width: 567px` → `width >= 567px`).
 * Used by breakpoints and typography font-size collection generators.
 */
export function formatMediaBlock(query: string, tokens: Token[]): string {
  // Convert legacy min-width syntax to modern CSS range syntax
  const modernQuery = query.replace(/min-width:\s*(\d+px)/g, 'width >= $1');
  const body = formatRootBlock(tokens, '    ');
  return [`@media (${modernQuery}) {`, '  :root {', body, '  }', '}'].join(
    '\n'
  );
}

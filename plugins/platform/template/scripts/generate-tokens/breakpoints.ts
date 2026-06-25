import { mkdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { formatRootBlock, scssHeader } from './format.js';
import type { CollectionResult, Token } from './types.js';

/**
 * Generates the TypeScript constants file content for breakpoints.
 *
 * Emits BREAKPOINTS (string union), Breakpoint type, and BREAKPOINT_WIDTHS
 * (numeric pixel values without units).
 */
export function generateBreakpointTs(widths: Map<string, number>): string {
  // Sort entries by value ascending
  const sorted = [...widths.entries()].sort(([, a], [, b]) => a - b);

  const bpLines = sorted
    .map(([key]) => `  ${key.toUpperCase()}: '${key}',`)
    .join('\n');

  const widthLines = sorted
    .map(([key, val]) => `  [BREAKPOINTS.${key.toUpperCase()}]: ${val},`)
    .join('\n');

  return [
    `import { ObjectValues } from '@model/types/utility.types';`,
    '',
    `export const BREAKPOINTS = {`,
    bpLines,
    `} as const;`,
    '',
    `export type Breakpoint = ObjectValues<typeof BREAKPOINTS>;`,
    '',
    `export const BREAKPOINT_WIDTHS = {`,
    widthLines,
    `} as const;`,
    '',
  ].join('\n');
}

/**
 * Generates all breakpoint output files.
 *
 * Writes:
 * - `_semantic-tokens-breakpoints.generated.scss` (main SCSS :root block) →
 *   returned as CollectionResult for the standard pipeline
 * - `_breakpoints.generated.scss` (SCSS $breakpoints map with !default) →
 *   written directly
 * - `src/constants/__generated__/breakpoints.generated.ts` (TS constants) →
 *   written directly
 */
export function generateBreakpoints(
  tokensByCondition: Map<string, Token[]>,
  collectionDir: string,
  generatedDir: string,
  constantsOut: string,
  root: string
): CollectionResult {
  // Breakpoints collection has a single mode named after the brand (e.g.
  // "Boject"), which resolveCondition strips to an empty string "" because
  // it equals the brand name exactly (no space suffix). We look for "" first,
  // then fall back to any available entry.
  const tokens =
    tokensByCondition.get('') ?? [...tokensByCondition.values()][0] ?? [];

  const header = scssHeader(collectionDir, root);

  // --- Main SCSS tokens file ---
  const mainScss =
    header + '\n\n' + ':root {\n' + formatRootBlock(tokens, '  ') + '\n}\n';

  // --- Extract breakpoint.width.* tokens for the map and TS file ---
  const widthTokens = tokens.filter((t) =>
    t.name.startsWith('--s-breakpoint-width-')
  );

  // Build a map of breakpoint key → numeric value
  // CSS var name pattern: --s-breakpoint-width-{key}
  const widths = new Map<string, number>();
  for (const t of widthTokens) {
    const key = t.name.replace('--s-breakpoint-width-', '');
    widths.set(key, t.value as number);
  }

  // Sort by value ascending for the SCSS map
  const sortedWidths = [...widths.entries()].sort(([, a], [, b]) => a - b);

  // --- SCSS $breakpoints map ---
  const mapLines = sortedWidths
    .map(([key, val]) => `  ${key}: ${val}px,`)
    .join('\n');
  const bpMapScss =
    header + '\n\n' + `$breakpoints: (\n${mapLines}\n) !default;\n`;

  // Write side-effect files
  const bpMapPath = join(generatedDir, '_breakpoints.generated.scss');
  writeFileSync(bpMapPath, bpMapScss, 'utf8');
  console.log(`Written: ${relative(root, bpMapPath)}`);

  // TS constants
  mkdirSync(constantsOut, { recursive: true });
  const tsContent = generateBreakpointTs(widths);
  const tsPath = join(constantsOut, 'breakpoints.generated.ts');
  writeFileSync(tsPath, tsContent, 'utf8');
  console.log(`Written: ${relative(root, tsPath)}`);

  // Return the main SCSS result for the standard pipeline
  const outputPath = join(
    generatedDir,
    '_semantic-tokens-breakpoints.generated.scss'
  );
  return { outputPath, content: mainScss };
}

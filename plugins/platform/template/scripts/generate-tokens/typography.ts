import { formatMediaBlock, formatRootBlock, scssHeader } from './format.js';
import type { ModeMap, Token } from './types.js';

/**
 * Generates the typography SCSS file content.
 *
 * Handles both:
 * - Typography Brand (single :root block — mode name = brand → empty condition → default)
 * - Typography Font Size (responsive :root + @media blocks)
 *
 * Block order: default (:root) first, then @media blocks sorted ascending by
 * the numeric width value in the query.
 */
export function generateTypography(
  tokensByCondition: Map<string, Token[]>,
  modeMap: ModeMap,
  collectionDir: string,
  root: string
): string {
  const header = scssHeader(collectionDir, root);

  type Block =
    | { kind: 'root'; tokens: Token[] }
    | { kind: 'media'; query: string; width: number; tokens: Token[] };

  const blocks: Block[] = [];

  for (const [condition, tokens] of tokensByCondition) {
    if (condition === '') {
      // Brand mode stripped to empty string — treat as default :root
      blocks.push({ kind: 'root', tokens });
    } else {
      const entry = modeMap[condition];
      if (!entry) continue;

      if (entry.type === 'default') {
        blocks.push({ kind: 'root', tokens });
      } else if (entry.query) {
        // Extract numeric width for sorting (e.g. "min-width: 567px" → 567)
        const widthMatch = /(\d+)px/.exec(entry.query);
        const width =
          widthMatch?.[1] !== undefined ? parseInt(widthMatch[1], 10) : 0;
        blocks.push({ kind: 'media', query: entry.query, width, tokens });
      }
    }
  }

  // Sort: default first, then media ascending by width
  blocks.sort((a, b) => {
    if (a.kind === 'root' && b.kind === 'root') return 0;
    if (a.kind === 'root') return -1;
    if (b.kind === 'root') return 1;
    return a.width - b.width;
  });

  const blockStrings: string[] = [];

  for (const block of blocks) {
    if (block.kind === 'root') {
      blockStrings.push(
        ':root {\n' + formatRootBlock(block.tokens, '  ') + '\n}'
      );
    } else {
      blockStrings.push(formatMediaBlock(block.query, block.tokens));
    }
  }

  // Join header + blocks with blank lines between each; trailing newline at end
  return header + '\n\n' + blockStrings.join('\n\n') + '\n';
}

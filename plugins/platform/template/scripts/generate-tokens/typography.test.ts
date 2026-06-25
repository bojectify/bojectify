import { generateTypography } from './typography.js';
import type { ModeMap, Token } from './types.js';

const collectionDir = '/tmp/test-collection';
const root = '/tmp';

const modeMap: ModeMap = {
  Light: { type: 'default' },
  Dark: { type: 'media', query: 'prefers-color-scheme: dark' },
  xs: { type: 'default' },
  s: { type: 'media', query: 'min-width: 567px' },
  m: { type: 'media', query: 'min-width: 768px' },
  l: { type: 'media', query: 'min-width: 1024px' },
};

function makeToken(name: string, value: number = 400): Token {
  return { name, type: 'number', value };
}

describe('generateTypography', () => {
  describe('brand mode (empty condition "")', () => {
    it('emits a single :root block', () => {
      const tokens = [makeToken('--s-typography-body-weight', 400)];
      const tokensByCondition = new Map([['', tokens]]);

      const result = generateTypography(
        tokensByCondition,
        modeMap,
        collectionDir,
        root
      );

      const rootMatches = result.match(/:root\s*\{/g);
      expect(rootMatches).toHaveLength(1);
      expect(result).not.toContain('@media');
    });

    it('includes the token in the :root block', () => {
      const tokens = [makeToken('--s-typography-body-weight', 400)];
      const tokensByCondition = new Map([['', tokens]]);

      const result = generateTypography(
        tokensByCondition,
        modeMap,
        collectionDir,
        root
      );

      expect(result).toContain('--s-typography-body-weight: 400;');
    });
  });

  describe('font-size modes (xs=default, s/m/l=media)', () => {
    it('emits :root first, then @media blocks sorted ascending by width', () => {
      const tokensByCondition = new Map([
        ['m', [makeToken('--s-typography-body-size-m')]],
        ['xs', [makeToken('--s-typography-body-size-xs')]],
        ['l', [makeToken('--s-typography-body-size-l')]],
        ['s', [makeToken('--s-typography-body-size-s')]],
      ]);

      const result = generateTypography(
        tokensByCondition,
        modeMap,
        collectionDir,
        root
      );

      // :root must appear before any @media block
      const rootPos = result.indexOf(':root {');
      const firstMediaPos = result.indexOf('@media');
      expect(rootPos).toBeLessThan(firstMediaPos);

      // @media blocks must be in ascending width order: 567 < 768 < 1024
      const pos567 = result.indexOf('567');
      const pos768 = result.indexOf('768');
      const pos1024 = result.indexOf('1024');
      expect(pos567).toBeLessThan(pos768);
      expect(pos768).toBeLessThan(pos1024);
    });

    it('converts min-width legacy query to modern CSS range syntax', () => {
      const tokensByCondition = new Map([
        ['s', [makeToken('--s-typography-body-weight')]],
      ]);

      const result = generateTypography(
        tokensByCondition,
        modeMap,
        collectionDir,
        root
      );

      expect(result).toContain('width >= 567px');
      expect(result).not.toContain('min-width: 567px');
    });

    it('sorts tokens alphabetically within each block', () => {
      const tokens = [
        makeToken('--s-typography-z-weight'),
        makeToken('--s-typography-a-weight'),
        makeToken('--s-typography-m-weight'),
      ];
      const tokensByCondition = new Map([['xs', tokens]]);

      const result = generateTypography(
        tokensByCondition,
        modeMap,
        collectionDir,
        root
      );

      const posA = result.indexOf('--s-typography-a-weight');
      const posM = result.indexOf('--s-typography-m-weight');
      const posZ = result.indexOf('--s-typography-z-weight');
      expect(posA).toBeLessThan(posM);
      expect(posM).toBeLessThan(posZ);
    });

    it('separates blocks with blank lines', () => {
      const tokensByCondition = new Map([
        ['xs', [makeToken('--s-typography-body-weight-xs')]],
        ['s', [makeToken('--s-typography-body-weight-s')]],
      ]);

      const result = generateTypography(
        tokensByCondition,
        modeMap,
        collectionDir,
        root
      );

      // A blank line between two blocks means "\n\n" appears in the output
      expect(result).toContain('\n\n');
    });
  });

  describe('header comment', () => {
    it('includes a generated comment referencing the collection path', () => {
      const tokensByCondition = new Map([
        ['', [makeToken('--s-typography-body-weight')]],
      ]);

      const result = generateTypography(
        tokensByCondition,
        modeMap,
        collectionDir,
        root
      );

      expect(result).toContain('Auto-generated from Figma');
      expect(result).toContain('test-collection');
    });
  });
});

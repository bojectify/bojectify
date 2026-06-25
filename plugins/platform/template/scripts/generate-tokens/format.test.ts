import type { Token } from './types.js';
import {
  shortenHex,
  formatValue,
  toKebabCase,
  formatRootBlock,
  formatMediaBlock,
} from './format.js';

describe('shortenHex', () => {
  it('#FFFFFF → #fff', () => {
    expect(shortenHex('#FFFFFF')).toBe('#fff');
  });

  it('#AABBCC → #abc', () => {
    expect(shortenHex('#AABBCC')).toBe('#abc');
  });

  it('#333366 → #336', () => {
    expect(shortenHex('#333366')).toBe('#336');
  });

  it('#1A1A2E → #1a1a2e (not shortable, different pairs)', () => {
    expect(shortenHex('#1A1A2E')).toBe('#1a1a2e');
  });

  it('#1A98FF → #1a98ff (not shortable)', () => {
    expect(shortenHex('#1A98FF')).toBe('#1a98ff');
  });

  it('#BB00FF → #b0f (shortable: BB=b, 00=0, FF=f)', () => {
    expect(shortenHex('#BB00FF')).toBe('#b0f');
  });

  it('#fff → #fff (already short, returned as-is lowercase)', () => {
    expect(shortenHex('#fff')).toBe('#fff');
  });

  it('"invalid" → "invalid" (no match, returned lowercase)', () => {
    expect(shortenHex('invalid')).toBe('invalid');
  });
});

describe('formatValue', () => {
  describe('color type', () => {
    it('returns shortened hex for color token', () => {
      expect(formatValue('color', {}, '--s-colour-bg', '#FFFFFF')).toBe('#fff');
    });

    it('throws when hex is missing for color token', () => {
      expect(() => formatValue('color', {}, '--s-colour-bg')).toThrow(Error);
    });
  });

  describe('number type', () => {
    it('returns unitless integer for font-weight tokens', () => {
      expect(formatValue('number', 300, '--s-typography-heading-weight')).toBe(
        '300'
      );
    });

    it('converts px to rem for font-size tokens (18px → 1.125rem)', () => {
      expect(formatValue('number', 18, '--s-typography-font-size-m')).toBe(
        '1.125rem'
      );
    });

    it('converts px to rem for font-size tokens (11px → 0.6875rem)', () => {
      expect(formatValue('number', 11, '--s-typography-font-size-xs')).toBe(
        '0.6875rem'
      );
    });

    it('returns px for breakpoint tokens (567 → 567px)', () => {
      expect(formatValue('number', 567, '--s-breakpoint-width-s')).toBe(
        '567px'
      );
    });

    it('returns 0px for zero breakpoint value', () => {
      expect(formatValue('number', 0, '--s-breakpoint-width-xs')).toBe('0px');
    });
  });

  describe('string type', () => {
    it('returns string value as-is', () => {
      expect(formatValue('string', 'Jost', '--s-typography-font-family')).toBe(
        'Jost'
      );
    });

    it('returns percentage string as-is', () => {
      expect(formatValue('string', '120%', '--s-typography-line-height')).toBe(
        '120%'
      );
    });
  });
});

describe('toKebabCase', () => {
  it('"Semantic Tokens Colour" → "semantic-tokens-colour"', () => {
    expect(toKebabCase('Semantic Tokens Colour')).toBe(
      'semantic-tokens-colour'
    );
  });

  it('"Typography Font Size" → "typography-font-size"', () => {
    expect(toKebabCase('Typography Font Size')).toBe('typography-font-size');
  });

  it('"already-kebab" → "already-kebab"', () => {
    expect(toKebabCase('already-kebab')).toBe('already-kebab');
  });
});

describe('formatRootBlock', () => {
  const tokens: Token[] = [
    { name: '--s-colour-z', type: 'string', value: 'red' },
    { name: '--s-colour-a', type: 'string', value: 'blue' },
    { name: '--s-colour-m', type: 'string', value: 'green' },
  ];

  it('sorts tokens alphabetically by name', () => {
    const result = formatRootBlock(tokens, '  ');
    const lines = result.split('\n');
    expect(lines[0]).toContain('--s-colour-a');
    expect(lines[1]).toContain('--s-colour-m');
    expect(lines[2]).toContain('--s-colour-z');
  });

  it('formats each token as "{indent}{name}: {value};"', () => {
    const result = formatRootBlock(
      [{ name: '--s-colour-a', type: 'string', value: 'blue' }],
      '  '
    );
    expect(result).toBe('  --s-colour-a: blue;');
  });

  it('uses the specified indent', () => {
    const result = formatRootBlock(
      [{ name: '--s-colour-a', type: 'string', value: 'blue' }],
      '    '
    );
    expect(result).toBe('    --s-colour-a: blue;');
  });
});

describe('formatMediaBlock', () => {
  it('converts legacy min-width syntax to modern CSS range syntax', () => {
    const result = formatMediaBlock('min-width: 567px', []);
    expect(result).toContain('width >= 567px');
    expect(result).not.toContain('min-width');
  });

  it('wraps tokens in @media (...) { :root { ... } }', () => {
    const result = formatMediaBlock('min-width: 768px', [
      { name: '--s-font-size', type: 'number', value: 18 },
    ]);
    expect(result).toMatch(/^@media \(width >= 768px\) \{/);
    expect(result).toContain('  :root {');
    expect(result).toContain('}');
  });

  it('indents properties at 4 spaces', () => {
    const result = formatMediaBlock('min-width: 768px', [
      { name: '--s-font-size', type: 'string', value: 'Jost' },
    ]);
    const lines = result.split('\n');
    // The property line should start with 4 spaces
    const propLine = lines.find((l) => l.includes('--s-font-size'));
    expect(propLine).toMatch(/^ {4}/);
  });
});

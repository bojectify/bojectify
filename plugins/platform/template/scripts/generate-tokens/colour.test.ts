import { generateColour } from './colour.js';
import type { Token } from './types.js';

const collectionDir = '/tmp/test-collection';
const root = '/tmp';

function makeToken(name: string, hex: string, value?: string): Token {
  return {
    name,
    type: 'color',
    value: value ?? { hex },
    hex,
  };
}

describe('generateColour', () => {
  it('emits a plain value when light and dark are the same', () => {
    const token = makeToken('--s-colour-bg', '#AABBCC');
    const result = generateColour([token], [token], collectionDir, root);

    expect(result).toContain('--s-colour-bg: #abc;');
    expect(result).not.toContain('light-dark');
  });

  it('wraps differing light/dark values in light-dark()', () => {
    const light = makeToken('--s-colour-bg', '#FFFFFF');
    const dark = makeToken('--s-colour-bg', '#000000');
    const result = generateColour([light], [dark], collectionDir, root);

    expect(result).toContain('--s-colour-bg: light-dark(#fff, #000);');
  });

  it('includes color-scheme: light dark in :root', () => {
    const token = makeToken('--s-colour-bg', '#FFFFFF');
    const result = generateColour([token], [token], collectionDir, root);

    expect(result).toContain('color-scheme: light dark;');
  });

  it('includes both data-theme override blocks', () => {
    const token = makeToken('--s-colour-bg', '#FFFFFF');
    const result = generateColour([token], [token], collectionDir, root);

    expect(result).toContain(":root[data-theme='light']");
    expect(result).toContain('color-scheme: light;');
    expect(result).toContain(":root[data-theme='dark']");
    expect(result).toContain('color-scheme: dark;');
  });

  it('sorts tokens alphabetically', () => {
    const tokens = [
      makeToken('--s-colour-z', '#AAAAAA'),
      makeToken('--s-colour-a', '#BBBBBB'),
      makeToken('--s-colour-m', '#CCCCCC'),
    ];
    const result = generateColour(tokens, tokens, collectionDir, root);

    const posA = result.indexOf('--s-colour-a');
    const posM = result.indexOf('--s-colour-m');
    const posZ = result.indexOf('--s-colour-z');
    expect(posA).toBeLessThan(posM);
    expect(posM).toBeLessThan(posZ);
  });

  it('emits a plain value for a token only in light (no dark counterpart)', () => {
    const light = makeToken('--s-colour-light-only', '#112233');
    const result = generateColour([light], [], collectionDir, root);

    expect(result).toContain('--s-colour-light-only: #123;');
    expect(result).not.toContain('light-dark');
  });

  it('emits a plain value for a token only in dark (no light counterpart)', () => {
    const dark = makeToken('--s-colour-dark-only', '#445566');
    const result = generateColour([], [dark], collectionDir, root);

    expect(result).toContain('--s-colour-dark-only: #456;');
    expect(result).not.toContain('light-dark');
  });

  it('shortens hex values (#FFFFFF → #fff)', () => {
    const token = makeToken('--s-colour-white', '#FFFFFF');
    const result = generateColour([token], [token], collectionDir, root);

    expect(result).toContain('#fff');
    expect(result).not.toContain('#FFFFFF');
  });

  it('does not shorten non-shortable hex values', () => {
    const token = makeToken('--s-colour-brand', '#1A2B3C');
    const result = generateColour([token], [token], collectionDir, root);

    // Not shortable — but must be lowercased
    expect(result).toContain('#1a2b3c');
    expect(result).not.toContain('#1A2B3C');
  });
});

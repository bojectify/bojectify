import { formatRoutesTs } from './format.js';

describe('formatRoutesTs', () => {
  it('emits a ROUTES tuple with the given routes', () => {
    const result = formatRoutesTs(['/', '/articles', '/articles/[slug]']);

    expect(result).toContain(`'/',`);
    expect(result).toContain(`'/articles',`);
    expect(result).toContain(`'/articles/[slug]',`);
    expect(result).toContain('export const ROUTES');
    expect(result).toContain('as const;');
  });

  it('emits a RoutePattern type derived from ROUTES', () => {
    const result = formatRoutesTs(['/']);
    expect(result).toContain(
      'export type RoutePattern = (typeof ROUTES)[number];'
    );
  });

  it('includes a do-not-edit banner', () => {
    const result = formatRoutesTs(['/']);
    expect(result).toMatch(/auto-generated|do not edit/i);
  });

  it('sorts routes alphabetically for stable output', () => {
    const result = formatRoutesTs([
      '/tags',
      '/articles',
      '/',
      '/articles/[slug]',
    ]);

    const indexOf = (needle: string) => result.indexOf(needle);
    expect(indexOf(`'/',`)).toBeLessThan(indexOf(`'/articles',`));
    expect(indexOf(`'/articles',`)).toBeLessThan(
      indexOf(`'/articles/[slug]',`)
    );
    expect(indexOf(`'/articles/[slug]',`)).toBeLessThan(indexOf(`'/tags',`));
  });

  it('deduplicates repeated routes', () => {
    const result = formatRoutesTs(['/articles', '/articles', '/']);
    const occurrences = result.match(/'\/articles',/g) ?? [];
    expect(occurrences).toHaveLength(1);
  });

  it('ends with a trailing newline', () => {
    const result = formatRoutesTs(['/']);
    expect(result.endsWith('\n')).toBe(true);
  });
});

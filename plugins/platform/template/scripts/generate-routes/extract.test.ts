import { pagePathToRoute } from './extract.js';

describe('pagePathToRoute', () => {
  it('converts the root page to "/"', () => {
    expect(pagePathToRoute('page.tsx')).toBe('/');
  });

  it('converts a top-level page to "/<name>"', () => {
    expect(pagePathToRoute('authors/page.tsx')).toBe('/authors');
  });

  it('converts nested pages', () => {
    expect(pagePathToRoute('articles/tag/page.tsx')).toBe('/articles/tag');
  });

  it('preserves dynamic segments', () => {
    expect(pagePathToRoute('articles/[slug]/page.tsx')).toBe(
      '/articles/[slug]'
    );
  });

  it('strips the [locale] wrapper segment', () => {
    expect(pagePathToRoute('[locale]/articles/[slug]/page.tsx')).toBe(
      '/articles/[slug]'
    );
  });

  it('returns "/" when only [locale] precedes the page', () => {
    expect(pagePathToRoute('[locale]/page.tsx')).toBe('/');
  });

  it('preserves dynamic segments other than [locale]', () => {
    expect(pagePathToRoute('[locale]/[category]/[slug]/page.tsx')).toBe(
      '/[category]/[slug]'
    );
  });

  it('preserves catch-all segments', () => {
    expect(pagePathToRoute('docs/[...slug]/page.tsx')).toBe('/docs/[...slug]');
  });

  it('preserves optional catch-all segments', () => {
    expect(pagePathToRoute('shop/[[...slug]]/page.tsx')).toBe(
      '/shop/[[...slug]]'
    );
  });

  it('strips route groups (parentheses segments)', () => {
    expect(pagePathToRoute('(marketing)/about/page.tsx')).toBe('/about');
  });

  it('strips nested route groups', () => {
    expect(pagePathToRoute('(marketing)/(public)/about/page.tsx')).toBe(
      '/about'
    );
  });

  it('strips parallel route slots (@-prefixed segments)', () => {
    expect(pagePathToRoute('@modal/login/page.tsx')).toBe('/login');
  });

  it('returns "/" when only a route group precedes the page', () => {
    expect(pagePathToRoute('(marketing)/page.tsx')).toBe('/');
  });

  it('accepts .ts extension', () => {
    expect(pagePathToRoute('page.ts')).toBe('/');
  });

  it('normalises backslashes to forward slashes', () => {
    expect(pagePathToRoute('articles\\[slug]\\page.tsx')).toBe(
      '/articles/[slug]'
    );
  });
});

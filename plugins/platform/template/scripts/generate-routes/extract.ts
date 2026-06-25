/**
 * Converts a `page.{ts,tsx}` filesystem path (relative to `src/app`) into its
 * App Router route pattern — logical-route form (no `[locale]` prefix) so it
 * can be used directly as a next-intl pathname key.
 *
 * Handles:
 * - Root `page.tsx` → `/`
 * - Route groups `(group)/` → stripped (don't appear in URL)
 * - Parallel route slots `@slot/` → stripped (don't appear in URL)
 * - `[locale]/` → stripped (next-intl prepends the locale itself based on
 *   `localePrefix`; logical routes must not include it)
 * - Dynamic `[param]`, catch-all `[...param]`, optional catch-all `[[...param]]`
 *   → preserved
 */
export function pagePathToRoute(pagePath: string): string {
  const withForwardSlashes = pagePath.replace(/\\/g, '/');
  const withoutPageFile = withForwardSlashes.replace(/\/?page\.(ts|tsx)$/, '');

  const segments = withoutPageFile
    .split('/')
    .filter((segment) => segment !== '')
    .filter((segment) => !segment.startsWith('('))
    .filter((segment) => !segment.startsWith('@'))
    .filter((segment) => segment !== '[locale]');

  if (segments.length === 0) {
    return '/';
  }

  return '/' + segments.join('/');
}

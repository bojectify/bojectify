/**
 * Formats a list of App Router route patterns into the contents of
 * `src/constants/__generated__/routes.generated.ts`.
 *
 * Emits a ROUTES tuple (sorted, deduplicated) and a `RoutePattern` union
 * derived from it. Downstream consumers use the union for exhaustiveness
 * checks (e.g. typing `SITE_CONFIG.NAVIGATION.PATHNAMES` against it).
 */
export function formatRoutesTs(routes: readonly string[]): string {
  const unique = [...new Set(routes)].sort();
  const lines = unique.map((route) => `  '${route}',`).join('\n');

  return [
    '/* Auto-generated — do not edit manually */',
    '/* Regenerate with: pnpm codegen:routes */',
    '',
    'export const ROUTES = [',
    lines,
    '] as const;',
    '',
    'export type RoutePattern = (typeof ROUTES)[number];',
    '',
  ].join('\n');
}

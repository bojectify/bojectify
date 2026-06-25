// Splits a route pattern into its path segments at the type level.
type SplitPath<T extends string> = T extends `/${infer Head}/${infer Tail}`
  ? Head | SplitPath<`/${Tail}`>
  : T extends `/${infer Last}`
    ? Last
    : never;

/**
 * Static route segments only — dynamic `[param]` / `[[...param]]` and the empty
 * parts produced by leading/trailing slashes are excluded.
 *
 * Used to derive the exact set of translation keys a route union requires.
 * Adding a route with a new static segment surfaces here as a TypeScript error
 * on the corresponding `SegmentTranslations` map until the translation lands.
 */
export type StaticSegmentKey<RouteUnion extends string> = Exclude<
  SplitPath<RouteUnion>,
  '' | `[${string}]` | `[[${string}]]`
>;

/**
 * Shape a segment translation map must have for a given set of routes/locales.
 * Every static segment across the route union must have an entry covering every
 * locale.
 */
export type SegmentTranslations<
  RouteUnion extends string,
  LocaleUnion extends string,
> = Record<StaticSegmentKey<RouteUnion>, Record<LocaleUnion, string>>;

/**
 * Composes a next-intl-compatible `pathnames` object from a route list and a
 * segment translation map. Dynamic segments (`[slug]`, `[[...slug]]`) pass
 * through unchanged.
 */
export const composePathnames = <
  RouteUnion extends string,
  LocaleUnion extends string,
>(
  routes: readonly RouteUnion[],
  locales: readonly LocaleUnion[],
  segments: SegmentTranslations<RouteUnion, LocaleUnion>
): { [K in RouteUnion]: Record<LocaleUnion, string> } => {
  const widenedSegments = segments as Record<string, Record<string, string>>;

  return Object.fromEntries(
    routes.map((route) => [
      route,
      Object.fromEntries(
        locales.map((locale) => [
          locale,
          route
            .split('/')
            .map((part) =>
              part === '' || part.startsWith('[')
                ? part
                : (widenedSegments[part]?.[locale] ?? part)
            )
            .join('/'),
        ])
      ),
    ])
  ) as { [K in RouteUnion]: Record<LocaleUnion, string> };
};

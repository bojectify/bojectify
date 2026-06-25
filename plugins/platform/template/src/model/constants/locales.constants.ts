import { SITE_CONFIG } from '@siteConfig';

type Locales = (typeof SITE_CONFIG.LOCALISATION.LOCALES_OBJ)[number];

export type Locale = Locales['ROUTE'];
export type Territory = Locales['TERRITORY'];

export const LOCALES: Locale[] = SITE_CONFIG.LOCALISATION.LOCALES_OBJ.map(
  (localeObj) => localeObj.ROUTE
);

export const isValidLocale = (someLocale: unknown): someLocale is Locale =>
  typeof someLocale === 'string' && (LOCALES as string[]).includes(someLocale);

export const pathStartsWithLocale = (path: string): boolean =>
  path.length > 3 &&
  path.charAt(0) === '/' &&
  path.charAt(3) === '/' &&
  isValidLocale(path.substring(1, 3));

export const stripLocaleFromPathIfPresent = (path: string) =>
  pathStartsWithLocale(path) ? path.slice(3) : path;

export const getLocaleFromFullLocale = (fullLocale: string): Locale => {
  const [locale] = fullLocale.split('-');
  return isValidLocale(locale)
    ? locale
    : SITE_CONFIG.LOCALISATION.DEFAULT_LOCALE_ROUTE;
};

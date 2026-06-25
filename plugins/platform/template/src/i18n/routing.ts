import { defineRouting } from 'next-intl/routing';
import { LOCALES } from '@model/constants/locales.constants';
import { SITE_CONFIG } from '@siteConfig';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: SITE_CONFIG.LOCALISATION.DEFAULT_LOCALE_ROUTE,
  localePrefix: 'always',
  pathnames: SITE_CONFIG.NAVIGATION.PATHNAMES,
  alternateLinks: false,
});

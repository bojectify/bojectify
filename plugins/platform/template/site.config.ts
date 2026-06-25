import { LocalesObj } from '@model/types/locales.types';
import { Pathnames } from 'next-intl/routing';
import {
  ROUTES,
  type RoutePattern,
} from '@constants/__generated__/routes.generated';
import { composePathnames, type SegmentTranslations } from '@i18n/pathnames';

const BRAND = '__BRAND__';

const LOCALES_OBJ = [
  {
    ROUTE: 'en',
    TERRITORY: 'GB',
    LABEL: 'English',
  },
] as const satisfies LocalesObj[];

const DEFAULT_LOCALE_ROUTE = LOCALES_OBJ[0].ROUTE;

type Locale = (typeof LOCALES_OBJ)[number]['ROUTE'];

// No translatable static route segments yet (home-only app). Add entries as
// CMS-driven routes land; a missing translation surfaces as a type error here.
const SEGMENTS = {} satisfies SegmentTranslations<RoutePattern, Locale>;

const LOCALES = LOCALES_OBJ.map(({ ROUTE }) => ROUTE);

const PATHNAMES = composePathnames(ROUTES, LOCALES, SEGMENTS);

type SiteConfig = {
  BRAND: string;
  LOCALISATION: {
    DEFAULT_LOCALE_ROUTE: string;
    LOCALES_OBJ: typeof LOCALES_OBJ;
  };
  NAVIGATION: {
    PATHNAMES: Pathnames<(typeof LOCALES_OBJ)[number]['ROUTE'][]>;
  };
};

export const SITE_CONFIG = {
  BRAND,
  LOCALISATION: {
    DEFAULT_LOCALE_ROUTE,
    LOCALES_OBJ,
  },
  NAVIGATION: {
    PATHNAMES,
  },
} satisfies SiteConfig;

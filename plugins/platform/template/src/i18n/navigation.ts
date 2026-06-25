import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';
import { stripLocaleFromPathIfPresent } from '@model/constants/locales.constants';

// These must be used instead of the Next ones.
// https://next-intl-docs.vercel.app/docs/routing/navigation#apis
const {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
  permanentRedirect,
} = createNavigation(routing);

/**
 * Without this check the redirect adds the locale twice
 * I'm not sure why this has started to happen and why
 * it doesn't happen on other projects, even though they
 * use the same version on next-intl
 * @param args: Parameters<typeof permanentRedirect>[0]
 * @returns permanentRedirect
 */
type PermanentRedirectArg = Parameters<typeof permanentRedirect>[0];
type PermanentRedirectHref = PermanentRedirectArg['href'];

const permanentRedirectWithDeDuplicatedLocales = ({
  href,
  ...rest
}: PermanentRedirectArg) =>
  permanentRedirect({
    ...rest,
    // stripping a known-good locale prefix off a valid pathname still yields a
    // valid pathname, so the cast back to the narrow href union is safe.
    href:
      typeof href === 'string'
        ? (stripLocaleFromPathIfPresent(href) as PermanentRedirectHref)
        : href,
  });

export {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
  permanentRedirect,
  permanentRedirectWithDeDuplicatedLocales,
};

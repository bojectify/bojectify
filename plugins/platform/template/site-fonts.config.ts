// Fonts are split out from site.config.ts because `next/font/google` pulls in
// Node-only built-ins (e.g. `node:assert/strict`) that can't be evaluated in
// Next.js's Edge runtime. Anything on the middleware import path (routing,
// locales, etc.) reads site.config.ts, so fonts must live in a separate module
// that only server/client code imports.

import { IBM_Plex_Mono, Jost, Lato } from 'next/font/google';

export const HEADING_FONT = Jost({
  variable: '--font-jost-sans',
  weight: ['300', '400', '700'],
  subsets: ['latin'],
});

export const BODY_FONT = Lato({
  variable: '--font-lato',
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const MONO_FONT = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  weight: ['400'],
  subsets: ['latin'],
});

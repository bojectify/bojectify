import type { Metadata } from 'next';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { THEME_INIT_SCRIPT } from '@constants/themeScript';
import '../styles/globals.scss';
import { BODY_FONT, HEADING_FONT, MONO_FONT } from '@siteFontsConfig';

export const metadata: Metadata = {
  title: 'Bojectify',
  description: 'Fitted-furniture builder.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
      {process.env.NEXT_PUBLIC_GTM_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
      )}
      <body
        className={`${HEADING_FONT.variable} ${BODY_FONT.variable} ${MONO_FONT.variable}`}
      >
        {children}
      </body>
    </html>
  );
}

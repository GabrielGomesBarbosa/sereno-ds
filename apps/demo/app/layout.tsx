import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@sereno-ds/ui';
import './globals.css';

// Self-hosted: the font files live in /fonts (SIL OFL, see fonts/README.md) and next/font/local reads
// them at build time, so the build never asks the network for a font (SS-570; it used to, from Google,
// and a failed download failed the Railway deploy, SS-39 decisão 3 for the no-CDN part).
// One variable file per family, latin subset: the same files Google served, with the weight range
// the two apps used (Inter 400-700, Manrope 500-800, JetBrains Mono 400-500).
const inter = localFont({ src: '../../../fonts/Inter-latin.woff2', weight: '400 700', style: 'normal', variable: '--font-inter', display: 'swap' });
const manrope = localFont({ src: '../../../fonts/Manrope-latin.woff2', weight: '500 800', style: 'normal', variable: '--font-manrope', display: 'swap' });
const jetbrainsMono = localFont({ src: '../../../fonts/JetBrainsMono-latin.woff2', weight: '400 500', style: 'normal', variable: '--font-jetbrains-mono', display: 'swap' });

// Canonical origin for metadata / OG - set per Railway service (SS-158).
const SITE = process.env.NEXT_PUBLIC_DEMO_URL ?? 'http://localhost:3002';

// This app is the Design System's demo, not a standalone scheduling product -
// the screens render pt-BR mock content, but the app identity is the DS.
const TITLE = 'Sereno Design System: demo';
const DESCRIPTION =
  'Demo screens of the Sereno Design System: the booking flow, professional dashboard, onboarding and reception kiosk, built with @sereno-ds/ui and navigable on mocked data.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: '%s · Sereno DS' },
  description: DESCRIPTION,
  applicationName: 'Sereno Design System',
  openGraph: {
    type: 'website',
    siteName: 'Sereno Design System',
    url: SITE,
    title: TITLE,
    description: DESCRIPTION,
    images: ['/opengraph-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/opengraph-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F7FA' },
    { media: '(prefers-color-scheme: dark)', color: '#12161E' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

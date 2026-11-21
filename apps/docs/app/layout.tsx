import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { ThemeProvider } from '@sereno-ds/ui';
import { COMPONENTS } from '@/design-system/catalog';
import './globals.css';

// Self-hosted: the font files live in /fonts (SIL OFL, see fonts/README.md) and next/font/local reads
// them at build time, so the build never asks the network for a font (SS-570; it used to, from Google,
// and a failed download failed the Railway deploy, SS-39 decisão 3 for the no-CDN part).
// These CSS variables are the @sereno-ds/ui font contract.
// One variable file per family, latin subset: the same files Google served, with the weight range
// the two apps used (Inter 400-700, Manrope 500-800, JetBrains Mono 400-500).
const inter = localFont({ src: '../../../fonts/Inter-latin.woff2', weight: '400 700', style: 'normal', variable: '--font-inter', display: 'swap' });
const manrope = localFont({ src: '../../../fonts/Manrope-latin.woff2', weight: '500 800', style: 'normal', variable: '--font-manrope', display: 'swap' });
const jetbrainsMono = localFont({ src: '../../../fonts/JetBrainsMono-latin.woff2', weight: '400 500', style: 'normal', variable: '--font-jetbrains-mono', display: 'swap' });

// The number of primitives is the catalogue's, not typed by hand (it was 30 here long after it was 37).
const COUNT = COMPONENTS.length;

// Canonical origin for metadata / OG - set per Railway service (SS-158).
const SITE = process.env.NEXT_PUBLIC_DS_URL ?? 'http://localhost:3001';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Sereno Design System', template: '%s · Sereno' },
  description: 'The Sereno Design System: token-driven React primitives with a navigable live showcase.',
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'Sereno Design System',
    url: SITE,
    title: 'Sereno Design System',
    description: `${COUNT} token-driven React primitives: native dark mode, no UI base library, built for React and Next.js.`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sereno Design System',
    description: `${COUNT} token-driven React primitives: native dark mode, no UI base library, built for React and Next.js.`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

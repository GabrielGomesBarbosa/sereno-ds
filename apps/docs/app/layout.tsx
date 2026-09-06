import type { Metadata } from 'next';
import { Inter, Manrope, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@sereno/ui';
import './globals.css';

// Self-hosted, optimised by next/font — no Google Fonts CDN (SS-39 decisão 3).
// These CSS variables are the @sereno/ui font contract.
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-manrope', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains-mono', display: 'swap' });

// Both apps currently deploy to this host; SS-158 (Railway) splits them.
const SITE = 'https://sereno-ds.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Sereno Design System', template: '%s · Sereno' },
  description: 'The Sereno Design System — token-driven React primitives with a navigable live showcase.',
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'Sereno Design System',
    url: SITE,
    title: 'Sereno Design System',
    description: '30 token-driven React primitives — native dark mode, no UI base library, built for React and Next.js.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sereno Design System',
    description: '30 token-driven React primitives — native dark mode, no UI base library, built for React and Next.js.',
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

import type { Metadata, Viewport } from 'next';
import { Inter, Manrope, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@sereno/ui';
import './globals.css';

// Self-hosted, optimised by next/font — no Google Fonts CDN (SS-39 decisão 3).
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-manrope', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains-mono', display: 'swap' });

// Canonical origin for metadata / OG — set per Railway service (SS-158).
const SITE = process.env.NEXT_PUBLIC_DEMO_URL ?? 'http://localhost:3001';

// This app is the Design System's demo, not a standalone scheduling product —
// the screens render pt-BR mock content, but the app identity is the DS.
const TITLE = 'Sereno Design System — demo';
const DESCRIPTION =
  'Demo screens of the Sereno Design System: the booking flow, professional dashboard and onboarding, built with @sereno/ui and navigable on mocked data.';

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

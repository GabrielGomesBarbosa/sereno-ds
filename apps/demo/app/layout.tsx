import type { Metadata, Viewport } from 'next';
import { Inter, Manrope, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@sereno/ui';
import './globals.css';

// Self-hosted, optimised by next/font — no Google Fonts CDN (SS-39 decisão 3).
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-manrope', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-jetbrains-mono', display: 'swap' });

const SITE = 'https://sereno-ds.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Sereno — agendamento online para profissionais de saúde e beleza',
    template: '%s · Sereno',
  },
  description:
    'Plataforma de agendamento online para profissionais autônomos de saúde e beleza no Brasil. Link público para o cliente marcar horário e um dashboard para o profissional gerir a agenda.',
  applicationName: 'Sereno',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Sereno',
    url: SITE,
    title: 'Sereno — agendamento online para profissionais de saúde e beleza',
    description:
      'Link público de agendamento, mobile-first e sem cadastro obrigatório, e um dashboard completo para o profissional.',
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

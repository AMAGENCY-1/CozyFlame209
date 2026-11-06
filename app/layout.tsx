import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const body = Jost({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cozyflamecandles.com'),
  title: {
    default: 'The Cozy Flame · Handcrafted Candles from the 209',
    template: '%s · The Cozy Flame',
  },
  description:
    "Handcrafted candles and dessert-inspired seasonal pours from California's 209. Small candles. Big moments.",
  // Preview build: keep it out of search engines until launch.
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    siteName: 'The Cozy Flame',
    title: 'The Cozy Flame · Small candles. Big moments.',
    description: "Handcrafted candles from California's 209.",
    images: [{ url: '/images/products/lavender-in-bloom.jpg', width: 1200, height: 1500, alt: 'Lavender in Bloom candle' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#F6EEDE',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Signalist — Next-Gen AI Stock Intelligence & Portfolio Tracker',
  description:
    'Smart investing simplified — track stocks, analyze trends, run paper trades, and receive personalized AI briefings.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Signalist',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/assets/icons/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='dark'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-foreground`}>
        {children}
      </body>
    </html>
  );
}

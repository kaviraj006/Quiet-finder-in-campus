import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Quiet Finder — VIT Chennai Noise Map & Study Spaces',
  description:
    'A Crowdsourced Noise-Level Mapping System for VIT Chennai. Discover quiet study spaces, inspect sound levels across eight 2-hour slots, and log acoustic measurements.',
  keywords: [
    'VIT Chennai',
    'Quiet Finder',
    'Noise Map',
    'Campus Acoustics',
    'Study Spaces',
    'Decibel Meter',
    'Library Reading Hall',
  ],
  authors: [{ name: 'VIT Chennai Student Community' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}

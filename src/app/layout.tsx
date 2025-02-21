import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { Toaster } from '@/components/ui/toaster';

import './globals.css';

const clashSans = localFont({
  src: './fonts/clash.woff2',
  variable: '--font-clash-sans',
  style: 'normal',
  display: 'swap',
  weight: '100 900'
});

export const metadata: Metadata = {
  title: 'FreeRetros',
  description: 'FreeRetros is a tool for running retrospectives'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${clashSans.variable} ${clashSans.variable} subpixel-antialiased lg:overflow-auto`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

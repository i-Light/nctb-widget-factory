import './globals.css';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, Hind_Siliguri } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-bengali',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#F7F7F5',
};

export const metadata: Metadata = {
  title: 'NCTB Physics Lab — Phone-Only Interactive Widgets',
  description:
    'One-handed smartphone 6-card interactive SSC/HSC Physics simulations for Bangladesh students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${inter.variable} ${hindSiliguri.variable}`}>
      <body className="bg-[#E7E7E2] text-slate-900 antialiased selection:bg-teal-200">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col justify-between bg-[#F7F7F5] pt-[max(0px,env(safe-area-inset-top))] pb-[max(0px,env(safe-area-inset-bottom))] shadow-sm">
          {children}
        </div>
      </body>
    </html>
  );
}

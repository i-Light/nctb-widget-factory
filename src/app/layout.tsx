import './globals.css';
import React from 'react';

export const metadata = {
  title: 'NCTB Physics Interactive Lab — Widget Factory',
  description: '6-Card Interactive SSC/HSC Physics Simulations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}

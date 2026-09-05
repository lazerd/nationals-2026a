import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nationals',
  description: 'Twenty minutes a day to Nov 30.',
};

export const viewport: Viewport = {
  themeColor: '#0a1114',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import NoiseOverlay from '@/components/layout/NoiseOverlay';
import './globals.css';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Lockd In \u2014 Discover Your Purpose. Build Your Legacy.',
  description:
    'A personal development app for men who are ready to lock in. Discover your purpose through deep self-assessment, build a personalized life blueprint, and track daily progress with accountability check-ins.',
  applicationName: 'Lockd In',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Lockd In',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A0A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${dmSans.variable}`}>
      <body
        className="font-sans antialiased"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        {children}
        <NoiseOverlay />
      </body>
    </html>
  );
}

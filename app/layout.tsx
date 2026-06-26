// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Syne, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { validateEnv } from '@/lib/env-check';
import { PWAProvider } from '@/components/pwa/PWAProvider';
import './globals.css';

validateEnv();

const syne = Syne({
  subsets: ['latin'], variable: '--font-syne', display: 'swap',
  weight: ['400','600','700','800'],
});
const inter = Inter({
  subsets: ['latin'], variable: '--font-inter', display: 'swap',
});

export const viewport: Viewport = {
  themeColor:          '#2563eb',
  colorScheme:         'dark',
  width:               'device-width',
  initialScale:        1,
  maximumScale:        5,
  userScalable:        true,
  viewportFit:         'cover',
};

export const metadata: Metadata = {
  title:       { default: 'DMN Solutions Kenya', template: '%s | DMN Solutions' },
  description: 'Innovative IT Solutions — Web, Mobile, Cloud, Networks & Electrical Services. Nairobi, Kenya.',
  keywords:    ['DMN Solutions','IT Kenya','Web Development Nairobi','Mobile Apps Kenya','Cloud Solutions'],
  manifest:    '/manifest.webmanifest',
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'black-translucent',
    title:          'DMN Solutions',
    startupImage:   '/icons/icon-512x512.png',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type:      'website',
    locale:    'en_KE',
    url:       process.env.NEXT_PUBLIC_SITE_URL,
    siteName:  'DMN Solutions Kenya',
    images:    [{ url: '/og-image.png', width: 1200, height: 630, alt: 'DMN Solutions Kenya' }],
  },
  twitter:     { card: 'summary_large_image' },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dmn-solution.vercel.app'),
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png',  sizes: '32x32',  type: 'image/png' },
      { url: '/icons/icon-96x96.png',  sizes: '96x96',  type: 'image/png' },
      { url: '/icons/icon-192x192.png',sizes: '192x192',type: 'image/png' },
    ],
    apple:   [{ url: '/icons/icon-152x152.png', sizes: '152x152' }],
    other:   [{ rel: 'mask-icon', url: '/icons/icon-512x512.png', color: '#2563eb' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="bg-[#07070f] text-white antialiased font-inter selection:bg-electric/30">
        {children}
        <PWAProvider />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#13131e', border: '1px solid #1e1e2e', color: '#e0e0f0' },
          }}
        />
      </body>
    </html>
  );
}

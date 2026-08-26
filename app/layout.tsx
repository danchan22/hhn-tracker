import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'HHN Tracker',
  description: 'Never Go Alone 😱',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HHN Tracker',
  },
};

export const viewport: Viewport = {
  themeColor: '#12121A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Never Go Alone 😱',
  description: 'Halloween Horror Nights Orlando Tracker',
  manifest: '/manifest.webmanifest',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#12121A' }}>
        {children}
      </body>
    </html>
  );
}

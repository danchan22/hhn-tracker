import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HHN Tracker 😱',
  description: 'Halloween Horror Nights Orlando',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            background: #09090D url('/hhn-bg.jpg') no-repeat center top / cover !important;
            background-attachment: scroll !important;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}

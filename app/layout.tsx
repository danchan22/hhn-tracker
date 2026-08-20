import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HHN Tracker',
  description: 'Halloween Horror Nights Orlando Tracker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

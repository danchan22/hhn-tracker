import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Never Go Alone | HHN Tracker',
    short_name: 'HHN Tracker',
    description: 'Track Halloween Horror Nights queue times, visit logs, yum items, and analytics.',
    start_url: '/',
    display: 'standalone',
    background_color: '#12121A',
    theme_color: '#FF5500',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}

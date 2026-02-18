import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lockd In',
    short_name: 'Lockd In',
    description: 'Discover your purpose. Build your legacy. Lock in daily.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    orientation: 'portrait',
    categories: ['lifestyle', 'productivity'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance Optimierungen
  poweredByHeader: false, // Entferne X-Powered-By Header
  compress: true, // Aktiviere Compression
  
  // Service Worker Support
  experimental: {
    // Workbox Integration vorbereiten
  },
  
  // Headers für PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400', // 24 Stunden
          },
        ],
      },
    ];
  },
  
  // Webpack Optimierungen
  webpack: (config, { isServer, dev }) => {
    // Tree-shaking für bessere Bundle-Größe
    config.optimization = {
      ...config.optimization,
      usedExports: true,
    }
    
    // Service Worker in Production
    if (!isServer && !dev) {
      // Workbox Plugin wird später hinzugefügt
    }
    
    return config
  },
};

export default nextConfig;

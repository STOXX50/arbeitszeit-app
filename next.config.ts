import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance Optimierungen
  poweredByHeader: false, // Entferne X-Powered-By Header
  compress: true, // Aktiviere Compression
  
  // Webpack Optimierungen
  webpack: (config) => {
    // Tree-shaking für bessere Bundle-Größe
    config.optimization = {
      ...config.optimization,
      usedExports: true,
    }
    
    return config
  },
};

export default nextConfig;

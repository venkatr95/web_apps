import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },

  // // HMR configuration to help with Clerk module resolution
  // webpack: (config, { dev, isServer }) => {
  //   if (dev && !isServer) {
  //     config.optimization = config.optimization || {};
  //     config.optimization.splitChunks = {
  //       chunks: "all",
  //       cacheGroups: {
  //         clerk: {
  //           test: /[\\/]node_modules[\\/]@clerk[\\/]/,
  //           name: "clerk",
  //           chunks: "all",
  //           enforce: true,
  //           priority: 20,
  //         },
  //       },
  //     };
  //   }
  //   return config;
  // },

  // Experimental features for better HMR
  experimental: {
    optimizePackageImports: ["@clerk/nextjs"],
    // Reduce hydration mismatch sensitivity
    optimisticClientCache: true,
  },

  // Disable React strict mode in development to reduce hydration warnings
  ...(process.env.NODE_ENV === "development" && {
    reactStrictMode: false,
  }),

  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Empty config to silence the warning and use Turbopack defaults
    // Turbopack handles module resolution better and reduces HMR cache issues
  },

  // Webpack configuration (fallback when using --webpack flag)
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },

  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
};

export default nextConfig;

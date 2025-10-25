import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
        // Optimización de imágenes
        images: {
          formats: ['image/avif', 'image/webp'],
          deviceSizes: [640, 750, 828, 1080, 1200, 1920],
          imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1024],
          remotePatterns: [
            {
              protocol: 'http',
              hostname: 'localhost'
            },
            {
              protocol: 'https',
              hostname: process.env.NEXT_PUBLIC_BLOB_HOSTNAME || '**.vercel-storage.com'
            },
            {
              protocol: 'https',
              hostname: '**.googleapis.com'
            },
            {
              protocol: 'https',
              hostname: '**.amazonaws.com'
            },
            {
              protocol: 'https',
              hostname: '**.cloudinary.com'
            }
          ],
          dangerouslyAllowSVG: true,
          contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        },

  // Compresión
  compress: true,

  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

        // Optimización de builds (removido - ya no es necesario en Next.js 15)
  
  // Configuración de webpack
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // Ignore optional dependencies that may not be installed
    config.externals = config.externals || []
    if (Array.isArray(config.externals)) {
      config.externals.push({
        '@aws-sdk/client-s3': 'commonjs @aws-sdk/client-s3'
      })
    }

    // Optimize for faster HMR in development
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    }

    return config
  },

        // Experimental features
        experimental: {
          optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        },

        // Turbopack configuration (moved from experimental)
        turbopack: {
          rules: {
            '*.svg': {
              loaders: ['@svgr/webpack'],
              as: '*.js',
            },
          },
        },

  // Configuración de TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuración de ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Configuración de output
  output: 'standalone',

  // Configuración de trailing slash
  trailingSlash: false,

  // Configuración de powered by header
  poweredByHeader: false,

  // Configuración de react strict mode
  reactStrictMode: true,
};

// Configuración de Sentry
const sentryConfig = {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Sentry organization and project
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

export default withSentryConfig(nextConfig, sentryConfig);

import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const isProductionBuild = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

if (isProductionBuild && !process.env.SENTRY_AUTH_TOKEN) {
  throw new Error(
    'SENTRY_AUTH_TOKEN is required for production builds to upload sourcemaps to Sentry.',
  );
}

if (isProductionBuild && (!sentryOrg || !sentryProject)) {
  throw new Error(
    'SENTRY_ORG and SENTRY_PROJECT are required for production builds to upload sourcemaps to Sentry.',
  );
}

const sentryRelease = process.env.SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA;

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  serverExternalPackages: [
    '@google-cloud/translate',
    '@google-cloud/firestore',
    '@grpc/grpc-js',
    'google-gax',
  ],
  images: {
    // Next.js 16 blocks localhost / private IPs by default (SSRF protection).
    // Required for Firebase storage emulator URLs in local dev.
    dangerouslyAllowLocalIP: isDev,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },

      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      // storage.googleapis.com
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      // https://flagcdn.com/w80/sa.png
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'www.gutenberg.org',
      },
      // Firebase storage emulator (dev only). Both `localhost` and the IPv4
      // literal are produced depending on the SDK, so allow both.
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
    qualities: [40, 90, 100],
  },
  experimental: {
    proxyClientMaxBodySize: '100mb',
    swcPlugins: [
      [
        '@lingui/swc-plugin',
        {
          // optional:
          // runtimeModules: { i18n: ["@lingui/core","i18n"], trans: ["@lingui/react","Trans"] },
          // stripNonEssentialFields: false
        },
      ],
    ],
  },
  turbopack: {
    rules: {
      '*.{glsl,vs,fs,vert,frag}': {
        loaders: ['raw-loader', 'glslify-loader'],
        as: '*.js',
      },
      '*.po': {
        loaders: ['@lingui/loader'],
        as: '*.js',
      },
    },
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader'],
    });

    config.module.rules.push({
      test: /\.po$/,
      use: {
        loader: '@lingui/loader', // https://github.com/lingui/js-lingui/issues/1782
      },
    });

    return config;
  },
  async redirects() {
    return [
      // Redirect app.fluencypal.com/book(/...) -> book.fluencypal.com/
      // The Reader app lives on its own subdomain; the /book path on the
      // primary app host is permanently moved.
      {
        source: '/book',
        has: [{ type: 'host', value: 'app.fluencypal.com' }],
        destination: 'https://book.fluencypal.com/',
        permanent: true,
      },
      {
        source: '/book/:path*',
        has: [{ type: 'host', value: 'app.fluencypal.com' }],
        destination: 'https://book.fluencypal.com/:path*',
        permanent: true,
      },
      {
        source: '/:lang/book',
        has: [{ type: 'host', value: 'app.fluencypal.com' }],
        destination: 'https://book.fluencypal.com/',
        permanent: true,
      },
      {
        source: '/:lang/book/:path*',
        has: [{ type: 'host', value: 'app.fluencypal.com' }],
        destination: 'https://book.fluencypal.com/:path*',
        permanent: true,
      },
    ];
  },
};
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: sentryOrg,
  project: sentryProject,

  // Auth token for uploading source maps (required for production builds)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  release: sentryRelease
    ? {
        name: sentryRelease,
      }
    : undefined,

  // Keep upload logs visible so local production builds don't fail silently.
  silent: false,

  sourcemaps: {
    disable: false,
  },

  errorHandler(error) {
    throw error;
  },

  telemetry: false,

  widenClientFileUpload: true,
});

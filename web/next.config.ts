import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  images: {
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
    ],
    qualities: [40, 100],
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
};
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'profolio-ln',
  project: 'dark-lang',

  // Auth token for uploading source maps (required for production builds)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,
});

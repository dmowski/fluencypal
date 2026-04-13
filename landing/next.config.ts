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
      // https://flagcdn.com/w80/sa.png
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
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
};

export default nextConfig;

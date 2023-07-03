/** @type {import('next').NextConfig} */
const nextConfig = {
  // permits loading of the worker file (barretenberg.js):
  experimental: {
    esmExternals: 'loose',
  },
  // test to check why netlify is failing:
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.optimization.minimize = false;

      if (!isServer) {
        config.optimization.minimizer = [];
      }
    }

    return config;
  },
  // allows for local running of multithreads:
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

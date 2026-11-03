/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only enable standalone output when explicitly requested (e.g. Docker), avoiding Windows symlink EPERM and Vercel conflicts
  ...(process.env.NEXT_STANDALONE === 'true' && { output: 'standalone' }),
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('native-media');
    }
    return config;
  },
  serverExternalPackages: ['native-media'],
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
};

module.exports = nextConfig;

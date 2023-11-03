/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/activate/:key',
        destination: '/activate',
      },
    ];
  },
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}

module.exports = nextConfig

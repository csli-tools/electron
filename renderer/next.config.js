/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/wasm/:path*',
        destination: 'http://localhost:26657/:path*'
      }
    ]
  }
}

module.exports = nextConfig

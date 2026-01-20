/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'api.wavespeed.ai'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return [
      { source: '/images/generated/:path*', destination: `${api.replace(/\/$/, '')}/storage/:path*` },
    ]
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Output standalone para Cloud Run (Docker optimizado)
  output: 'standalone',
}

module.exports = nextConfig

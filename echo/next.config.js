/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Ensure path aliases work
  webpack: (config) => {
    return config
  },
}

module.exports = nextConfig


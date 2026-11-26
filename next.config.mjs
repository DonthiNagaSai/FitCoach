/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a small self-contained server in .next/standalone for the Docker image
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig

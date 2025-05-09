/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "vercel.blob.vercel-storage.com"],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcrypt"],
  },
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL || "localhost:3000",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize webpack configuration for Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, ".prisma/client", "prisma"]
    }
    return config
  },
  output: "standalone",
}

module.exports = nextConfig

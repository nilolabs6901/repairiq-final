/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_BUILD_MODE === 'static';

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
    ...(isStaticExport && { unoptimized: true }),
  },
  ...(isStaticExport && { output: 'export' }),
}

module.exports = nextConfig

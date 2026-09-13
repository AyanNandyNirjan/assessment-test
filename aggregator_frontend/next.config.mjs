/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@hugeicons/core-free-icons', '@hugeicons/react'],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@capacitor/core",
    "@capacitor/app",
    "@capacitor/push-notifications",
    "@capgo/capacitor-native-biometric"
  ]
};

module.exports = nextConfig;

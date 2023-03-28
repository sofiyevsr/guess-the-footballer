/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: { runtime: "experimental-edge" },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-49f25329739f45528f8e9b0f9fa93fd8.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;

import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // if you use fetch caching or partial prerendering, enable as needed
  },
  images: {
    remotePatterns: [
      // company logos/CDNs you call in useCompanyLogo
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.logo.dev.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

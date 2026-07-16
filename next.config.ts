import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16's Partial Prerendering — instant static "walk-up" shell.
  cacheComponents: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: ["corestore", "hyperswarm", "hyperbee", "autobase"],
};

export default nextConfig;

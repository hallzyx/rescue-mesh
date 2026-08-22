import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "http://127.0.0.1:43147",
    "http://127.0.0.1:43148",
    "http://127.0.0.1:43149",
  ],
  serverExternalPackages: ["corestore", "hyperswarm", "hyperbee"],
};

export default nextConfig;

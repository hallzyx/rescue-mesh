import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolated per peer so `next dev` A/B/C do not fight over the same `.next`.
  distDir: process.env.RESCUEMESH_NEXT_DIST?.trim() || ".next",
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "http://127.0.0.1:43147",
    "http://127.0.0.1:43148",
    "http://127.0.0.1:43149",
  ],
  serverExternalPackages: [
    "@qvac/sdk",
    "corestore",
    "hyperswarm",
    "hyperbee",
    "hypercore",
    "hyperdht",
    "rocksdb-native",
    "udx-native",
    "sodium-native",
    "require-addon",
  ],
};

export default nextConfig;

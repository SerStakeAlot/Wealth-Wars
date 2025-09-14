import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during builds for demo deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checks during builds for demo deployment
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Silence workspace root inference warning by explicitly pointing to monorepo root
    root: path.resolve(__dirname, "../../"),
  },
  // env: {
  //   NEXT_PUBLIC_DEMO_ONLY: 'true', // Commented out - use .env files instead
  // },
};

export default nextConfig;

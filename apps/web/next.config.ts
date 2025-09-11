import type { NextConfig } from "next";

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
  // env: {
  //   NEXT_PUBLIC_DEMO_ONLY: 'true', // Commented out - use .env files instead
  // },
};

export default nextConfig;

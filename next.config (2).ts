import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Include the prisma/setup.sql file in the standalone build output
  // so the /api/setup endpoint can read it at runtime on Vercel.
  outputFileTracingIncludes: {
    "/api/setup": ["./prisma/setup.sql"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      // Don't serve stale RSC payload from the router cache on client navigation.
      // Without this, navigating back to /user or /history within 30s skips
      // re-mounting the component, so useRef values persist and data is never re-fetched.
      dynamic: 0,
      static: 180,
    },
  },
};

export default nextConfig;

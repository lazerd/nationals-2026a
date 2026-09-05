import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev overlay badge sits on top of the sticky done bar, which makes
  // screenshots of the real bottom bar unreadable.
  devIndicators: false,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Full static export. Every one of the 87 day pages is HTML on disk before
   * anyone opens it, which is what makes the 1.5s-on-4G target reachable and
   * what lets the service worker precache the whole program. It also means
   * Cloudflare Pages serves plain files with no server runtime to pay for.
   */
  output: 'export',
  images: { unoptimized: true },

  // The dev overlay badge sits on top of the sticky done bar, which makes
  // screenshots of the real bottom bar unreadable.
  devIndicators: false,
};

export default nextConfig;

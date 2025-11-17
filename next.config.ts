import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "customer-t8f0evtjgdy9lgms.cloudflarestream.com",
      },
    ],
  },
};

export default nextConfig;

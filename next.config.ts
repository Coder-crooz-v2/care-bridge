import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL(
        "https://images.unsplash.com/photo-1519494080410-f9aa8f52f1e7?auto=format&fit=crop&w=900&q=80"
      ),
      new URL(
        "https://images.unsplash.com/photo-1546659934-038aab8f3f3b?q=80&w=899&auto=format&fit=crop"
      ),
    ],
  },
};

export default nextConfig;

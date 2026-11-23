import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // cacheComponents/partialPrefetching from the scaffold are off: PPR cannot run in export mode.
  turbopack: {
    rules: {
      // Only the global stylesheet goes through Tailwind; "*.css" also caught
      // *.module.css and turned every CSS-module class into undefined.
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export (see SS-39 decisão técnica 2). Revisited in SS-158 (Railway).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // @sereno-ds/ui is used as the built package (ESM in dist/, see packages/ui/tsup.config.ts); transpilePackages
  // makes Next compile it with the app's own settings.
  transpilePackages: ["@sereno-ds/ui"],
};

export default nextConfig;

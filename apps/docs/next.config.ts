import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export (see SS-39 decisão técnica 2). Revisited in SS-158 (Railway).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // @sereno-ds/ui is consumed as TS source (built in SS-156) — Next must transpile it.
  transpilePackages: ["@sereno-ds/ui"],
};

export default nextConfig;

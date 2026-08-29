import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Netlify (free plan). No SSR/Node server in this phase —
  // this is a front-end demonstration layer only (see SS-39, decisão técnica 2).
  output: "export",
  // next/image cannot use the optimization server under `output: export`.
  images: { unoptimized: true },
  // Emit each route as its own directory with index.html — plays best with
  // Netlify static hosting and avoids .html extension redirects.
  trailingSlash: true,
};

export default nextConfig;

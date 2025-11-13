import { withWorkflow } from "workflow/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default withWorkflow(nextConfig);

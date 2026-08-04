import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const pagesBasePath = isGitHubPages ? (process.env.PAGES_BASE_PATH ?? "/career-test") : "";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export" as const,
        trailingSlash: true,
        basePath: pagesBasePath,
        assetPrefix: pagesBasePath,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
